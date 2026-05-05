import { NextResponse } from 'next/server';
import { db } from '@/server/FirebaseServer';
import admin from 'firebase-admin';

export type Gender = 'male' | 'female' | 'other';

export interface UserData {
  name: string;
  email: string;
  mobileNumber: string;
  gender: Gender | '';
  password: string;
  requested: string;
  createdAt: any; // We'll use Firebase Timestamp here
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, mobileNumber, gender,password } = body;
    
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password too short" }, { status: 400 });
    }

    // 1. Basic Validation
    if (!email || !name || !mobileNumber) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    // 2. Prepare Data
    const newUser: UserData = {
      name,
      email,
      mobileNumber,
      gender: gender || '',
      password,
      requested: '',
      createdAt: admin.firestore.Timestamp.now(),
    };

    // 3. Store in Firestore
    const docRef = await db!.collection('users').add(newUser);

    return NextResponse.json({ 
      success: true, 
      id: docRef.id 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Firebase Auth/Decoder Error:", error.message);
    
    // If you still see 'DECODER routines::unsupported', 
    // the private key in .env.local is likely corrupted.
    return NextResponse.json({ 
      error: "Connection Failed", 
      details: error.message 
    }, { status: 500 });
  }
}
