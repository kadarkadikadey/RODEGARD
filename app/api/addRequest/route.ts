import { NextResponse } from 'next/server';
import { db } from '@/server/FirebaseServer';
import admin from 'firebase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Destructure all 8 fields from your request
    const { 
      username, 
      email, 
      carModel, 
      date, 
      location, 
      issue, 
      serviceNeeded, 
      extraNotes 
    } = body;

    // 1. Basic Validation
    if (!username || !email || !carModel || !date) {
      return NextResponse.json(
        { error: "Missing required booking details (Name, Email, Car, or Date)" },
        { status: 400 }
      );
    }

    // 2. Add to Firestore 'bookings' collection
    const docRef = await db!.collection('serviceRequest').add({
      username,
      email,
      carModel,
      date,
      location,
      issue,
      serviceNeeded,
      extraNotes,
      status: 'pending',
      assignedWorker: '',
      
       // Good for tracking new requests
      createdAt: admin.firestore.Timestamp.now(),
    });

    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      message: "Booking created successfully" 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Booking API Error:", error.message);
    return NextResponse.json(
      { error: "Failed to create booking", details: error.message },
      { status: 500 }
    );
  }
}
