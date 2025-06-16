#!/bin/bash

# Firebase Rules and Index Deployment Script
# This script helps deploy the updated Firestore rules and indexes

echo "🔥 Firebase Rules and Index Deployment"
echo "======================================"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo "📥 Install it with: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI found"

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 You need to login to Firebase first"
    echo "🚀 Running: firebase login"
    firebase login
fi

echo "✅ Firebase authentication verified"

# Initialize Firebase if not already done
if [ ! -f "firebase.json" ]; then
    echo "🔧 Initializing Firebase in this project..."
    firebase init firestore
else
    echo "✅ Firebase already initialized"
fi

# Deploy Firestore rules
echo "📤 Deploying Firestore security rules..."
if firebase deploy --only firestore:rules; then
    echo "✅ Firestore rules deployed successfully"
else
    echo "❌ Failed to deploy Firestore rules"
    exit 1
fi

# Deploy Firestore indexes
echo "📤 Deploying Firestore indexes..."
if firebase deploy --only firestore:indexes; then
    echo "✅ Firestore indexes deployed successfully"
else
    echo "❌ Failed to deploy Firestore indexes"
    echo "🔗 You can also create the index manually at:"
    echo "   https://console.firebase.google.com/v1/r/project/$(firebase use --current)/firestore/indexes?create_composite=Ckhwcm9qZWN0cy9pbWJ5aGVyL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9tZXNzYWdlcy9pbmRleGVzL18QARoKCgZzdGF0dXMQARoKCgZ1c2VySWQQARoNCgl0aW1lc3RhbXAQARoMCghfX25hbWVfXxAB"
fi

echo ""
echo "🎉 Deployment complete!"
echo "🔍 Check your Firebase Console to verify the changes"
echo "📱 Your app should now work without permission errors"
