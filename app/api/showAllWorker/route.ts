import { NextResponse } from 'next/server';
import { db } from '@/server/FirebaseServer';

export async function GET() {
  try {
    // 1. Fetch data from your collection
    const snapshot = await db.collection('worker').get();
    
    // 2. Map the data into an array
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 3. Return the JSON response
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}