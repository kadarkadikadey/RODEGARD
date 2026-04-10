
import admin from 'firebase-admin';

if (!admin.apps.length) {
  // Use a fallback to empty string to avoid undefined errors
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
  
  // This version handles double-quotes, literal \n, and accidental spaces
  const formattedKey = rawKey
    .replace(/^["']|["']$/g, '') // Removes surrounding quotes
    .replace(/\\n/g, '\n')       // Converts string "\n" to real newlines
    .trim();

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: formattedKey,
    }),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();