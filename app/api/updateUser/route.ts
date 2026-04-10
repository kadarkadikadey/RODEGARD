import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/FirebaseServer';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    // 1. Validation: Ensure an ID is provided
    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // 2. Reference the document in the 'serviceRequest' collection
    const docRef = db.collection('users').doc(id);
    
    // 3. Update the database with the new values
    await docRef.update({
      ...updates,
      lastUpdated: new Date().toISOString(), // Optional: track modification time
    });

    return NextResponse.json({ message: 'Request updated successfully' }, { status: 200 });

  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}