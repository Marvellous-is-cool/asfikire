# Anglican Student Fellowship Shirt Voting App

A web application for Anglican Student Fellowship, Ikire Branch that allows members to vote on shirt colors for fellowship shirts. Built with Next.js, Firebase, and integrates with Paystack payment gateway.

![Anglican Student Fellowship](/public/anglican-logo.png)

## Features

- **Interactive Shirt Preview**: 3D and 2D shirt visualizations
- **Secure Voting System**: Members can authenticate and cast votes for their preferred shirt color
- **Payment Integration**: Secure payments via Paystack
- **Admin Dashboard**: Comprehensive admin portal for managing votes, payments, and users
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Results**: Live updates on voting stats

## Getting Started

### Prerequisites

- **Node.js**: Version 14.x or higher [Download here](https://nodejs.org/)
- **NPM**: Usually comes with Node.js installation
- **Firebase Project**: You'll need to create a Firebase project (see Firebase Setup below)
- **Paystack Account**: For payment processing

### System Requirements

- Any operating system that supports Node.js (Windows, macOS, Linux)
- Minimum 1GB RAM
- At least 100MB free disk space
- Internet connection for dependencies installation and Firebase services

### Installation

1. Clone this repository

   ```bash
   git clone https://github.com/yourusername/anglican-fellowship-shirt-voting.git
   cd anglican-fellowship-shirt-voting
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up assets (3D models, textures, etc.)

   ```bash
   npm run setup
   ```

4. Create an `.env.local` file in the project root with your configuration (see Environment Variables below)

5. Run the development server

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a Web app to your project
4. Enable Firebase Authentication (Email/Password provider)
5. Create Firestore Database
6. Set up security rules for your Firestore
7. Copy your Firebase config to use in environment variables

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Paystack Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_password
```

## Admin Portal

The application includes an admin portal for managing the voting system:

1. Access the admin portal at `/admin`
2. Initial admin account will be created based on ADMIN_EMAIL and ADMIN_PASSWORD environment variables
3. From the admin dashboard, you can:
   - View voting results and statistics
   - Manage users and authentication
   - Track payments
   - Export data
   - Configure application settings

## Usage

### Voting Process

1. Visit the home page and click "Vote Now"
2. Authenticate with your fellowship credentials
3. Select your preferred shirt color
4. Specify the number of votes
5. Make payment via Paystack
6. Receive confirmation of your vote

### Settings Configuration

Admin users can configure the system from the Settings page:

- Enable/disable voting
- Set voting period dates
- Configure available shirt colors
- Set price per vote
- Customize payment settings

## Project Structure

```
anglican-fellowship/
├── app/                  # Next.js app directory
├── components/           # React components
├── contexts/             # React contexts for state management
├── lib/                  # Utilities and Firebase config
├── models/               # Data models
├── public/               # Static assets
├── scripts/              # Setup scripts
└── utils/                # Helper functions
```

## Technologies Used

- **Frontend**: Next.js, React, TailwindCSS, Framer Motion
- **3D Rendering**: Three.js, React Three Fiber
- **Backend**: Firebase (Firestore, Authentication)
- **Payments**: Paystack API
- **Charting**: Recharts
- **Deployment**: Vercel

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Anglican Student Fellowship, Ikire Branch
- All contributors and members who participated in the development
