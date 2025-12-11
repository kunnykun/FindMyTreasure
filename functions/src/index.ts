import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import * as nodemailer from 'nodemailer';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Stripe
const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2023-10-16'
});

// Email transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password
  }
});

interface CheckoutSessionParams {
  itemId: string;
  amount: number;
  paymentType: 'deposit' | 'full';
  customerEmail: string;
  itemDescription: string;
}

/**
 * Create a Stripe Checkout session
 */
export const createCheckoutSession = functions.https.onCall(
  async (data: CheckoutSessionParams, context) => {
    try {
      const { itemId, amount, paymentType, customerEmail, itemDescription } = data;

      // Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'aud',
              product_data: {
                name: `Recovery Service - ${itemDescription}`,
                description: `${paymentType === 'deposit' ? 'Deposit' : 'Full payment'} for lost item recovery`
              },
              unit_amount: amount
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: `${functions.config().app.url}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${functions.config().app.url}/checkout/${itemId}?cancelled=true`,
        customer_email: customerEmail,
        metadata: {
          itemId,
          paymentType
        }
      });

      // Create payment record in Firestore
      await admin.firestore().collection('payments').add({
        itemId,
        stripeSessionId: session.id,
        amount: amount / 100,
        currency: 'aud',
        status: 'pending',
        paymentType,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        sessionId: session.id,
        url: session.url
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to create checkout session'
      );
    }
  }
);

/**
 * Handle Stripe webhook events
 */
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = functions.config().stripe.webhook_secret;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulPayment(session);
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent failed:', paymentIntent.id);
      await handleFailedPayment(paymentIntent);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * Handle successful payment
 */
async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const { itemId, paymentType } = session.metadata || {};

  if (!itemId) {
    console.error('No itemId in session metadata');
    return;
  }

  try {
    // Update payment record
    const paymentsRef = admin.firestore().collection('payments');
    const snapshot = await paymentsRef
      .where('stripeSessionId', '==', session.id)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      await snapshot.docs[0].ref.update({
        status: 'succeeded',
        stripePaymentIntentId: session.payment_intent,
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Update lost item payment status
    const itemRef = admin.firestore().collection('lostItems').doc(itemId);
    await itemRef.update({
      paymentStatus: paymentType === 'deposit' ? 'deposit-paid' : 'paid',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Get item details for email
    const itemDoc = await itemRef.get();
    const itemData = itemDoc.data();

    if (itemData) {
      // Send confirmation email to customer
      await sendConfirmationEmail(
        itemData.userEmail,
        itemData.userName,
        itemData.itemType,
        paymentType
      );

      // Send notification email to admin
      await sendAdminNotificationEmail(itemId, itemData);
    }
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

/**
 * Handle failed payment
 */
async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  try {
    const paymentsRef = admin.firestore().collection('payments');
    const snapshot = await paymentsRef
      .where('stripePaymentIntentId', '==', paymentIntent.id)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      await snapshot.docs[0].ref.update({
        status: 'failed',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

/**
 * Send confirmation email to customer
 */
async function sendConfirmationEmail(
  email: string,
  name: string,
  itemType: string,
  paymentType: string
) {
  const mailOptions = {
    from: functions.config().email.user,
    to: email,
    subject: 'Payment Confirmed - FindMyTreasure Recovery Service',
    html: `
      <h2>Payment Confirmed!</h2>
      <p>Hi ${name},</p>
      <p>We've received your ${paymentType} payment for the recovery of your ${itemType}.</p>
      <p>Our team will be in touch shortly to schedule your recovery appointment.</p>
      <p><strong>What happens next?</strong></p>
      <ul>
        <li>We'll review your case details</li>
        <li>Assign a professional detectorist to your job</li>
        <li>Contact you to confirm the recovery time</li>
        <li>Search the location thoroughly with professional equipment</li>
      </ul>
      <p>Thank you for choosing FindMyTreasure!</p>
      <p>Best regards,<br>The FindMyTreasure Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to:', email);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

/**
 * Send notification email to admin
 */
async function sendAdminNotificationEmail(itemId: string, itemData: any) {
  const mailOptions = {
    from: functions.config().email.user,
    to: functions.config().email.admin,
    subject: `New Recovery Job - ${itemData.itemType}`,
    html: `
      <h2>New Recovery Job Received</h2>
      <p><strong>Job ID:</strong> ${itemId}</p>
      <p><strong>Item Type:</strong> ${itemData.itemType}</p>
      <p><strong>Customer:</strong> ${itemData.userName}</p>
      <p><strong>Contact:</strong> ${itemData.userEmail} / ${itemData.userPhone}</p>
      <p><strong>Location:</strong> ${itemData.location.address}</p>
      <p><strong>Date Lost:</strong> ${itemData.dateLost}</p>
      <p><strong>Payment Status:</strong> ${itemData.paymentStatus}</p>
      <p><a href="${functions.config().app.url}/admin/jobs/${itemId}">View Job Details</a></p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent');
  } catch (error) {
    console.error('Error sending admin notification email:', error);
  }
}

/**
 * Send status update email to customer
 */
export const sendStatusUpdateEmail = functions.firestore
  .document('lostItems/{itemId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if status changed
    if (before.status !== after.status) {
      const mailOptions = {
        from: functions.config().email.user,
        to: after.userEmail,
        subject: `Update on Your Recovery - ${after.itemType}`,
        html: `
          <h2>Status Update</h2>
          <p>Hi ${after.userName},</p>
          <p>There's an update on your ${after.itemType} recovery:</p>
          <p><strong>New Status:</strong> ${after.status.replace('-', ' ').toUpperCase()}</p>
          ${after.status === 'recovered' ? '<p>Great news! We have successfully recovered your item!</p>' : ''}
          ${after.status === 'in-progress' ? '<p>Our detectorist is currently searching for your item.</p>' : ''}
          <p>We will keep you updated on any progress.</p>
          <p>Best regards,<br>The FindMyTreasure Team</p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Status update email sent to:', after.userEmail);
      } catch (error) {
        console.error('Error sending status update email:', error);
      }
    }
  });
