# Anglican Student Fellowship Fix - Deployment Guide

This guide provides step-by-step instructions for deploying the username display fix and Firebase security rules update that we've implemented. Following these steps will ensure that the username inconsistency issue (where "marvellous" displays as "goodness") is fully resolved.

## Step 1: Deploy Firebase Security Rules

Our fix included updated Firebase security rules without an expiration date. Deploy them to prevent permission errors:

```bash
# Make the deployment script executable
chmod +x deploy-firebase-rules.sh

# Run the deployment script to update Firebase rules
./deploy-firebase-rules.sh
```

This will deploy both the updated security rules and the required indexes for your Firestore database.

## Step 2: Fix Duplicate Usernames

The username inconsistency may be caused by duplicate usernames in the database. Use our new User Fix Utility to detect and resolve these conflicts:

1. Navigate to `/debug` in your application
2. Use the "Username Conflict Resolution" tool (now at the top of the page)
3. Click "Scan for Duplicate Usernames"
4. If duplicates are found, click "Fix X Duplicate Groups"
5. Wait for confirmation that the fix was applied

This process will ensure all usernames in the database are unique.

## Step 3: Verify Authentication Flow

Test the authentication flow to ensure usernames are now being preserved correctly:

1. Navigate to `/debug` in your application
2. Scroll down to the Database Debugger
3. In the "Authentication Test" section:
   - Enter "marvellous" in the username field
   - Click "Test Authentication"
4. Verify that both "Input Username" and "Returned Username" show "marvellous"

## Step 4: Test the Voting Process

The ultimate test is to verify that voting works with the correct username display:

1. Clear your local storage to ensure a fresh test:

   ```javascript
   localStorage.removeItem("anglican_auth");
   ```

2. Navigate to the voting page (`/vote`)
3. Enter the username "marvellous"
4. Complete the voting process
5. Check that the vote details display "marvellous" (not "goodness")

## Step 5: Monitor Error Logs

After deploying these fixes, monitor your Firebase console for any authentication or permission errors to ensure the fix is working correctly.

## Troubleshooting

If issues persist after deployment:

1. **Username still displaying incorrectly**:

   - Check for caching issues (try in incognito mode)
   - Verify localStorage content using the debug tools
   - Review the console logs for authentication flow

2. **Firebase permission errors**:

   - Confirm the security rules were deployed correctly
   - Check Firebase console for deployment status
   - Verify your application's Firebase configuration

3. **Duplicate usernames still exist**:
   - Run the User Fix Utility again
   - Check for case sensitivity issues in usernames
   - Consider a database backup before making mass changes

## What Was Fixed

1. **Username Persistence**: The auth flow now preserves the user-entered username throughout the application instead of using potentially different values from the database.

2. **Firebase Security**: Updated rules to prevent permission errors without an expiration date.

3. **Duplicate Detection**: Added tooling to find and fix username conflicts that may contribute to inconsistent username display.

---

If you need assistance with these deployment steps, please contact the development team.
