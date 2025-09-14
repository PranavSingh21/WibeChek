# WibeChek - Real-time Friend Activity App

A beautiful, mobile-friendly React app that lets users share their current "vibe" (mood/activity) with friends in real-time.

## 🌟 Features

- **Google Authentication** - Easy sign-in with Firebase Auth
- **Real-time Updates** - See friend activity instantly with Firestore
- **Custom Vibes** - Create personalized vibes with emoji + text
- **Mobile-First Design** - Optimized for all screen sizes
- **Availability Toggle** - Set your status as Available/Busy
- **Beautiful UI** - Gradient backgrounds, smooth animations, and emoji-first design

## 🚀 Getting Started

### 1. Firebase Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** with Google sign-in provider
3. Enable **Cloud Firestore** database
4. Get your Firebase configuration object

### 2. Configure Firebase

Replace the configuration in `src/firebase/config.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── VibeCard.tsx     # Individual vibe display card
│   ├── AvailabilityToggle.tsx  # Available/Busy toggle
│   └── ProtectedRoute.tsx      # Route authentication wrapper
├── contexts/            # React Context providers
│   └── AuthContext.tsx  # Firebase authentication state
├── firebase/            # Firebase configuration
│   └── config.ts        # Firebase app initialization
├── hooks/              # Custom React hooks
│   └── useFirestoreVibes.ts  # Vibe data management
├── pages/              # Main application pages
│   ├── LoginPage.tsx    # Google sign-in page
│   ├── HomePage.tsx     # Main vibe selection interface  
│   └── FriendsPage.tsx  # Friends list and status
├── types/              # TypeScript type definitions
│   └── index.ts         # App-wide type definitions
└── App.tsx             # Main app component and routing
```

## 🔥 Firestore Collections

### `users`
```typescript
{
  uid: string,           // Firebase Auth UID
  name: string,          // Display name from Google
  email: string,         // Email address  
  photoURL: string,      // Profile picture URL
  isAvailable: boolean,  // Current availability status
  createdAt: Date,       // Account creation timestamp
  lastSeen: Date         // Last activity timestamp
}
```

### `vibes`  
```typescript
{
  id: string,           // Auto-generated document ID
  emoji: string,        // Emoji representation (🎬, 🎮, etc.)
  title: string,        // Vibe name ("Movie Night", "Gaming")
  users: string[],      // Array of user UIDs currently in this vibe
  createdBy: string,    // UID of user who created this vibe
  createdAt: Date       // Creation timestamp
}
```

## 🎨 Design System

- **Colors**: Bright pastels with gradients (pink, purple, blue, green, orange)
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent 8px grid system
- **Components**: Rounded corners, subtle shadows, smooth hover effects
- **Mobile-First**: Responsive design with touch-friendly interactions

## 📱 Pages

### `/login`
- Clean sign-in interface with Google authentication
- App branding and welcome message
- Automatic redirect to home after successful login

### `/home` 
- Grid of available vibes with real-time friend counts
- Toggle in/out of vibes with visual feedback
- Availability status toggle
- Create custom vibes modal
- User profile and sign-out options

### `/friends`
- List of all users in the community
- Real-time availability status indicators  
- Future: Filter by shared vibes, direct messaging

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server  
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

The app is ready to deploy to any static hosting service:
- Vercel
- Netlify  
- Firebase Hosting
- GitHub Pages

Remember to update Firebase configuration for your production domain.