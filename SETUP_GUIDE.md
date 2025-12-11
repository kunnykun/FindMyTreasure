# Quick Setup Guide - FindMyTreasure

This guide will get you up and running in **30 minutes**.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Firebase account created
- [ ] Stripe account created
- [ ] Email service credentials (Gmail app password recommended)

## Step-by-Step Setup

### 1. Install Dependencies (2 minutes)

```bash
cd MetalDetecting_Lost&Recovery_App
npm install
cd functions
npm install
cd ..
```

### 2. Firebase Project Setup (5 minutes)

```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select:
# - Firestore
# - Functions (TypeScript)
# - Hosting
# - Storage

# Choose existing project or create new one
```

**In Firebase Console:**

1. Go to **Authentication** → Enable **Email/Password**
2. Go to **Firestore Database** → Create database (start in production mode)
3. Go to **Storage** → Get started
4. Go to **Project Settings** → Add web app → Copy config

### 3. Configure Environment Variables (3 minutes)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Open `.env` and fill in your Firebase config from step 2:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc...
```

### 4. Stripe Setup (5 minutes)

1. Go to [stripe.com](https://stripe.com) → Dashboard
2. Get **Publishable key** (starts with `pk_test_`)
3. Get **Secret key** (starts with `sk_test_`)

Add to `.env`:
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

Configure Firebase Functions:
```bash
firebase functions:config:set stripe.secret_key="sk_test_..."
```

### 5. Email Configuration (3 minutes)

For Gmail:
1. Enable 2-Step Verification
2. Generate App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

```bash
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-app-password"
firebase functions:config:set email.admin="admin@findmytreasure.com"
firebase functions:config:set app.url="http://localhost:5173"
```

### 6. Firestore Security Rules (2 minutes)

Copy this to Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    match /lostItems/{itemId} {
      allow read: if request.auth != null;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }

    match /payments/{paymentId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Click **Publish**

### 7. Deploy Firebase Functions (3 minutes)

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

Copy the function URL for `stripeWebhook` (e.g., `https://us-central1-your-project.cloudfunctions.net/stripeWebhook`)

### 8. Configure Stripe Webhook (2 minutes)

1. Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: [Your stripeWebhook function URL from step 7]
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy **Signing secret** (starts with `whsec_`)

```bash
firebase functions:config:set stripe.webhook_secret="whsec_..."
```

Redeploy functions:
```bash
firebase deploy --only functions
```

### 9. Create Admin User (5 minutes)

1. Start development server:
```bash
npm run dev
```

2. Open `http://localhost:5173`

3. Create account via Firebase Auth:
```bash
# In browser console or Firebase Console
# Go to Authentication → Users → Add user manually
# Email: admin@findmytreasure.com
# Password: [choose secure password]
```

4. Get user UID from Firebase Console → Authentication

5. Add admin role in Firestore:
   - Go to Firestore Database
   - Create collection: `users`
   - Add document with ID = [user UID from step 4]
   - Fields:
   ```json
   {
     "name": "Admin User",
     "email": "admin@findmytreasure.com",
     "phone": "+1234567890",
     "role": "admin",
     "createdAt": [Click "Add timestamp"],
     "updatedAt": [Click "Add timestamp"]
   }
   ```

### 10. Test the App (5 minutes)

**Test User Flow:**
1. Go to `http://localhost:5173`
2. Click "Report a Lost Item"
3. Fill out the form (all 4 steps)
4. Use Stripe test card: `4242 4242 4242 4242`, any future date, any CVC
5. Complete payment

**Test Admin Flow:**
1. Go to `http://localhost:5173/admin`
2. Login with admin credentials
3. You should see your test job in the dashboard
4. Click "View Details" to see full job information

### 11. Production Deployment (Optional)

```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy

# Your app will be live at:
# https://your-project-id.web.app
```

Update production URLs:
```bash
firebase functions:config:set app.url="https://your-project-id.web.app"
firebase deploy --only functions
```

Update Stripe webhook URL to production function URL.

## Verification Checklist

- [ ] App loads at localhost:5173
- [ ] Can submit lost item form
- [ ] Map picker works
- [ ] Cost calculator displays correctly
- [ ] Stripe checkout opens
- [ ] Test payment completes
- [ ] Confirmation email received
- [ ] Job appears in admin dashboard
- [ ] Can update job status in admin panel
- [ ] Status update email received

## Common Issues & Fixes

**"Firebase not initialized"**
```bash
# Check .env file exists and has correct values
# Restart dev server: Ctrl+C then npm run dev
```

**"Stripe key invalid"**
```bash
# Verify you're using the correct test key (pk_test_...)
# Check for extra spaces in .env file
```

**"Function not found"**
```bash
# Redeploy functions
firebase deploy --only functions
```

**"Webhook verification failed"**
```bash
# Copy webhook secret exactly from Stripe Dashboard
firebase functions:config:set stripe.webhook_secret="whsec_..."
firebase deploy --only functions
```

**"Cannot read properties of undefined"**
```bash
# Clear browser cache
# Check Firebase config in .env
# Verify all environment variables are set
```

## Next Steps

1. **Customize branding**: Update colors in `tailwind.config.js`
2. **Add your location**: Update default map center in `MapPicker.tsx`
3. **Adjust pricing**: Edit values in `.env`
4. **Add more equipment types**: Update item types in `ReportLostItem.tsx`
5. **Set up custom domain**: Firebase Hosting → Add custom domain

## Getting Help

- Check the main `README.md` for detailed documentation
- Review Firebase Functions logs: `firebase functions:log`
- Check Stripe Dashboard for payment issues
- Verify Firestore security rules are published

## Success!

Your FindMyTreasure app is now running! 🎉

**Test URLs:**
- User interface: `http://localhost:5173`
- Admin dashboard: `http://localhost:5173/admin`

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires auth: `4000 0027 6000 3184`

Start accepting recovery requests! 🔍💎
