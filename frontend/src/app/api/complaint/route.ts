import { NextResponse } from 'next/server';
import { generateComplaintLetter } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const letter = await generateComplaintLetter(data);
    
    return NextResponse.json({ letter });
  } catch (error: any) {
    console.error('Complaint API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
