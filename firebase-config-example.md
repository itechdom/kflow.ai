# Firebase Configuration Example

Create a `.env` file in your project root with the following variables:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyC_Your_Actual_API_Key_Here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```
w
## How to get these values:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click on the gear icon (⚙️) next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. Click on the web app icon (</>)
7. Copy the configuration values

## Important Notes:

- All environment variables must start with `REACT_APP_` to be accessible in React
- Never commit your `.env` file to version control
- Add `.env` to your `.gitignore` file
- The `.env` file should be in the root directory of your project
- Restart your development server after creating the `.env` file

## Firebase Authentication Setup:

1. In Firebase Console, go to "Authentication" > "Sign-in method"
2. Enable "Google" provider
3. Add your authorized domains (localhost for development)
4. Configure OAuth consent screen if needed
