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

    // 3. If not found in 'users', check if the user exists in the 'worker' collection
    const workersRef = db.collection('worker');
    const workerSnapshot = await workersRef.where('email', '==', email).limit(1).get();

    if (!workerSnapshot.empty) {
      const workerDoc = workerSnapshot.docs[0];
      const workerData = workerDoc.data();

      // Check password (currently plain text in addWorkers API)
      if (workerData.password === password) {
        // Exclude password from the response data for security
        const { password: _, ...workerWithoutPassword } = workerData;
        
        return NextResponse.json({
          success: true,
          role: "worker",
          id: workerDoc.id,
          data: workerWithoutPassword
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
