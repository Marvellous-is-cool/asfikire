# Firebase Security Rules Fix

## Problem

Your Firebase Firestore security rules have expired (they were set to expire on June 2, 2025), causing permission errors throughout the application. You're also missing required database indexes.

## Quick Fix Instructions

### Option 1: Automatic Deployment (Recommended)

1. Run the deployment script:
   ```bash
   ./deploy-firebase-rules.sh
   ```

### Option 2: Manual Fix via Firebase Console

#### Step 1: Update Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`imbyher` based on the error)
3. Navigate to **Firestore Database** > **Rules**
4. Replace the current rules with the content from `firestore.rules`
5. Click **Publish**

#### Step 2: Create Required Index

1. Click this link to create the required index automatically:
   [Create Index](https://console.firebase.google.com/v1/r/project/imbyher/firestore/indexes?create_composite=Ckhwcm9qZWN0cy9pbWJ5aGVyL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9tZXNzYWdlcy9pbmRleGVzL18QARoKCgZzdGF0dXMQARoKCgZ1c2VySWQQARoNCgl0aW1lc3RhbXAQARoMCghfX25hbWVfXxAB)

2. Or manually create the index:
   - Go to **Firestore Database** > **Indexes**
   - Click **Create Index**
   - Collection ID: `messages`
   - Add fields:
     - `status` (Ascending)
     - `userId` (Ascending)
     - `timestamp` (Ascending)
   - Click **Create**

## What the New Rules Do

### Security Improvements

- ✅ No expiration date
- ✅ Proper read/write permissions for each collection
- ✅ Guest user support for voting
- ✅ Admin restrictions

### Collection Permissions

- **settings**: Read-only for all users
- **members**: Read for all, write for authenticated users and new registrations
- **votes**: Read for all, write for authenticated users and guests
- **payments**: Read/write for payment processing
- **messages**: Read for all, write for authenticated users with rate limiting

## Verification

After updating the rules, test these functions:

1. ✅ Username checking during registration
2. ✅ Voting without authentication errors
3. ✅ Payment processing
4. ✅ Admin dashboard access

## Troubleshooting

If you still get permission errors:

1. Clear your browser cache
2. Check the Firebase Console for any deployment errors
3. Verify your Firebase project ID in the environment variables
4. Check that all required indexes are built (they may take a few minutes)

## Additional Index Creation

If you need more indexes later, you can:

1. Use the `firestore.indexes.json` file with Firebase CLI
2. Create them manually in the Firebase Console
3. Firebase will suggest indexes in the console when needed
