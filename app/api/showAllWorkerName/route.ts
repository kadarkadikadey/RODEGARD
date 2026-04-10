import { NextResponse } from 'next/server';
import { db } from '@/server/FirebaseServer';

export async function GET() {
  try {
    // 1. Fetch data from the 'workers' collection
    const snapshot = await db.collection('worker').get();
    
    // 2. Map the data to return ONLY the names
    // We use .filter to ignore any documents that might have a missing name
    const workerNames = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return data.name; // Adjust 'name' to match your database field key
      })
      .filter(name => !!name); 

    // 3. Return the JSON array of strings
    return NextResponse.json(workerNames, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}