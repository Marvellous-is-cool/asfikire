# Anglican Fellowship Shirt Voting App

## Requirements

### Software Requirements

- **Node.js**: Version 14.x or higher [Download here](https://nodejs.org/)
- **NPM**: Usually comes with Node.js installation
- **Firebase Project**: You'll need to create a Firebase project (see Firebase Setup below)

### System Requirements

- Any operating system that supports Node.js (Windows, macOS, Linux)
- Minimum 1GB RAM
- At least 100MB free disk space
- Internet connection for dependencies installation and Firebase services

### Environment Setup

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Firebase (see Firebase Setup Options below)
4. Create an `.env.local` file in the project root with your Firebase configuration
5. Create placeholder images:
   ```bash
   node scripts/create-placeholder-images.js
   ```
6. Run the development server:
   ```bash
   npm run dev
   ```

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a Web app to your project
4. Enable Firestore Database
   - Go to Firestore Database in the left sidebar
   - Click "Create database"
   - Start in production mode or test mode as per your needs
5. Copy your Firebase configuration
   - Go to Project Settings
   - Scroll down to "Your apps" section
   - Copy the configuration object
6. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

Benefits:

- Free tier with generous limits
- Real-time database capabilities
- No server setup required
- Built-in authentication options if needed
- Works well with Next.js applications

## Starting the Application

```bash
# Install dependencies
npm install

# Create placeholder images
node scripts/create-placeholder-images.js

# Run the development server
npm run dev
```

Access the application at http://localhost:3000
Access the admin dashboard at http://localhost:3000/admin

## Deployment

To deploy this application to production:

1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

For cloud deployment, you can use:

- Vercel (recommended for Next.js apps)
- Firebase Hosting
- Netlify
- AWS, Google Cloud, or Azure

Don't forget to set up environment variables on your hosting platform.
