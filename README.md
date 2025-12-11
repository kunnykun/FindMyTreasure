# FindMyTreasure - Lost & Recovery Service App

> **Lost something valuable? We'll help you find it — on land or under water.**

A comprehensive web and iOS PWA for connecting people who've lost items with professional metal detecting recovery specialists.

## Features

### For Users
- 📍 Interactive map-based lost item reporting
- 📝 Detailed item description forms with photo uploads
- 💰 Real-time cost estimation with transparent pricing
- 💳 Secure Stripe payment integration (deposit or full payment)
- 📧 Email notifications for status updates
- 📱 Mobile-responsive PWA (installable on iOS)

### For Admin/Recovery Team
- 📊 Comprehensive dashboard with job management
- 🗺️ Map view of all lost item locations
- 👥 Job assignment to detectorists
- 💵 Payment tracking and management
- 📈 Revenue and success rate analytics
- 📝 Recovery documentation with photos

### Technical Features
- ⚡ React 18 + Vite + TypeScript
- 🎨 Tailwind CSS with ocean/beach theme
- 🔥 Firebase (Auth, Firestore, Storage, Functions)
- 💳 Stripe Checkout integration
- 🗺️ Leaflet.js for interactive maps
- 📱 PWA support for iOS installation
- 🔐 Role-based authentication
- 📧 Automated email notifications

## Project Structure

```
findmytreasure/
├── src/
│   ├── components/           # Reusable React components
│   │   ├── MapPicker.tsx    # Interactive map with location picker
│   │   └── CostEstimator.tsx # Cost calculation component
│   ├── context/
│   │   └── AuthContext.tsx  # Authentication provider
│   ├── pages/
│   │   ├── Home.tsx         # Landing page
│   │   ├── ReportLostItem.tsx # Multi-step item submission form
│   │   ├── Checkout.tsx     # Payment page
│   │   └── admin/
│   │       ├── AdminDashboard.tsx # Job management dashboard
│   │       └── JobDetails.tsx     # Individual job view
│   ├── services/
│   │   ├── firebase.ts      # Firebase configuration
│   │   ├── stripeService.ts # Stripe integration
│   │   └── lostItemService.ts # Firestore CRUD operations
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── App.tsx              # Main app with routing
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles
├── functions/               # Firebase Cloud Functions
│   └── src/
│       └── index.ts         # Stripe webhooks & email notifications
├── public/                  # Static assets
├── .env.example            # Environment variable template
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- Stripe account
- Git

### 1. Clone and Install Dependencies

```bash
cd MetalDetecting_Lost&Recovery_App
npm install
```

### 2. Firebase Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

2. Enable the following services:
   - **Authentication**: Email/Password
   - **Firestore Database**: Start in production mode
   - **Storage**: Default rules
   - **Functions**: Upgrade to Blaze plan (pay-as-you-go)

3. Create a web app in Firebase project settings

4. Copy your Firebase config and update `.env`

5. Install Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase init
```

6. Select:
   - Functions (TypeScript)
   - Firestore
   - Storage
   - Hosting (optional)

### 3. Firestore Security Rules

Set up these Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId ||
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Lost items
    match /lostItems/{itemId} {
      allow read: if request.auth != null;
      allow create: if true; // Allow anonymous submissions
      allow update, delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Payments
    match /payments/{paymentId} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 4. Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)

2. Get your API keys from Stripe Dashboard

3. Set up webhook endpoint:
   - URL: `https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/stripeWebhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`

4. Copy webhook signing secret

### 5. Environment Configuration

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Update with your credentials:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# App Config
VITE_APP_NAME=FindMyTreasure
VITE_APP_URL=http://localhost:5173
VITE_CONTACT_EMAIL=support@findmytreasure.com

# Cost Defaults
VITE_BASE_RATE_PER_HOUR=75
VITE_TRAVEL_RATE_PER_KM=2
VITE_FINDERS_FEE_PERCENTAGE=10
```

### 6. Firebase Functions Configuration

Set Firebase Functions config:

```bash
cd functions
npm install

# Set Stripe config
firebase functions:config:set stripe.secret_key="sk_test_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."

# Set email config (use your email service)
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-app-password"
firebase functions:config:set email.admin="admin@findmytreasure.com"

# Set app URL
firebase functions:config:set app.url="https://yourdomain.com"
```

### 7. Create Admin User

After first deployment, manually create an admin user in Firestore:

Collection: `users`
Document ID: [User's Firebase Auth UID]
Fields:
```json
{
  "name": "Admin User",
  "email": "admin@findmytreasure.com",
  "phone": "+1234567890",
  "role": "admin",
  "createdAt": [Timestamp],
  "updatedAt": [Timestamp]
}
```

## Development

### Run Development Server

```bash
npm run dev
```

App will be available at `http://localhost:5173`

### Test Firebase Functions Locally

```bash
cd functions
npm run serve
```

### Build for Production

```bash
npm run build
```

### Deploy to Firebase

```bash
# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting
```

## Data Models

### LostItem
```typescript
{
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  preferredContact: 'email' | 'phone' | 'either'
  itemType: 'ring' | 'key' | 'watch' | 'phone' | 'necklace' | ...
  itemDescription: string
  estimatedValue?: number
  dateLost: string
  timeLost?: string
  location: {
    lat: number
    lng: number
    address: string
    searchRadius?: number
  }
  circumstances: string
  photos: string[]
  status: 'pending' | 'assigned' | 'in-progress' | 'recovered' | 'cancelled'
  assignedTo?: string
  assignedToName?: string
  paymentStatus: 'unpaid' | 'deposit-paid' | 'paid' | 'refunded'
  estimatedCost: number
  depositAmount?: number
  finalCost?: number
  findersFee?: number
  createdAt: Timestamp
  updatedAt: Timestamp
  recoveredAt?: Timestamp
  adminNotes?: string
  recoveryNotes?: string
  recoveryPhotos?: string[]
}
```

## Payment Flow

1. User submits lost item form
2. System calculates cost estimate
3. User proceeds to checkout
4. Stripe Checkout session created via Cloud Function
5. User completes payment
6. Webhook receives payment confirmation
7. Firestore updated with payment status
8. Confirmation emails sent
9. Job appears in admin dashboard

## Email Notifications

Automated emails are sent for:
- Payment confirmation
- Job assignment notifications
- Status updates (in-progress, recovered)
- Admin notifications for new jobs

## Security Considerations

- All API keys stored in environment variables
- Firestore security rules prevent unauthorized access
- Admin-only routes protected with authentication
- Stripe webhooks verified with signing secret
- Photo uploads validated and stored securely
- PII handled according to privacy best practices

## Customization

### Update Pricing
Edit `.env` file:
```env
VITE_BASE_RATE_PER_HOUR=75
VITE_TRAVEL_RATE_PER_KM=2
VITE_FINDERS_FEE_PERCENTAGE=10
```

### Change Theme Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  ocean: { ... },
  sand: { ... }
}
```

### Add New Item Types
Update `src/pages/ReportLostItem.tsx`:
```typescript
const itemTypes = [
  { value: 'ring', label: 'Ring' },
  // Add more types
]
```

## Deployment Checklist

- [ ] Firebase project created and configured
- [ ] Firestore security rules deployed
- [ ] Firebase Functions deployed
- [ ] Stripe webhook endpoint configured
- [ ] Environment variables set
- [ ] Admin user created in Firestore
- [ ] Email service configured
- [ ] Domain connected (if using custom domain)
- [ ] SSL certificate active
- [ ] PWA manifest configured
- [ ] Test payment flow end-to-end

## iOS PWA Installation

To install on iOS:
1. Open site in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

The app will appear on your home screen like a native app.

## Support & Maintenance

### Monitor Firebase Functions
```bash
firebase functions:log
```

### Check Stripe Payments
Monitor payments and webhooks in Stripe Dashboard

### Backup Firestore
Set up automatic backups in Firebase Console > Firestore > Backups

## Troubleshooting

**Issue: Payment not completing**
- Check Stripe webhook is receiving events
- Verify webhook signing secret matches
- Check Firebase Functions logs

**Issue: Map not loading**
- Ensure internet connection for OpenStreetMap tiles
- Check browser console for errors
- Verify Leaflet CSS is loaded

**Issue: Admin access denied**
- Verify user has `role: 'admin'` in Firestore
- Check authentication token is valid
- Clear browser cache and re-login

**Issue: Photos not uploading**
- Check Firebase Storage rules
- Verify file size limits
- Check network connection

## Future Enhancements

- Real-time GPS tracking for detectorists
- In-app chat between client and recovery team
- Rating and review system
- Multi-language support
- Mobile native apps (React Native)
- Advanced analytics dashboard
- Automated SMS notifications
- Team scheduling calendar
- Equipment inventory management

## License

Proprietary - All rights reserved

## Contact

For support: support@findmytreasure.com
Admin access: admin@findmytreasure.com

---

Built with ❤️ for recovery specialists
