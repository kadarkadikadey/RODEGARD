import admin from 'firebase-admin';

// 1. Check if we have the minimum required data before attempting to init
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';

if (!admin.apps.length) {
  // ONLY initialize if we actually have a Project ID. 
  // This prevents the build crash.
  if (projectId) {
    const formattedKey = rawKey
      .replace(/^["']|["']$/g, '')
      .replace(/\\n/g, '\n')
      .trim();

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: formattedKey,
      }),
    });
  } else {
    // This will show up in your build logs to help you debug
    console.warn("Firebase Admin: Project ID is missing. Skipping initialization during build.");
  }
}

// 2. Export with a check so the build doesn't crash on the export either
export const db = admin.apps.length ? admin.firestore() : null;
export const auth = admin.apps.length ? admin.auth() : null;
