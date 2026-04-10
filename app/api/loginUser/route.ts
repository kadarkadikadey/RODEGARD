import { NextResponse } from 'next/server';
import { db } from '@/server/FirebaseServer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Basic Validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // 2. Check if the user exists in the 'users' collection
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('email', '==', email).limit(1).get();

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();

      // Check password (currently plain text in addUsers API)
      if (userData.password === password) {
        // Exclude password from the response data for security
        const { password: _, ...userWithoutPassword } = userData;
        
        return NextResponse.json({
          success: true,
          role: "user",
          id: userDoc.id,
          data: userWithoutPassword
        }, { status: 200 });
      } else {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
    }

    // 4. If email is not found in either collection
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  } catch (error: any) {
    console.error("Login Error:", error.message);
    
    return NextResponse.json({ 
      error: "Connection Failed", 
      details: error.message 
    }, { status: 500 });
  }
}
