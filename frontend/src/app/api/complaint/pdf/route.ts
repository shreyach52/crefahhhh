import { NextResponse } from 'next/server';
import { complaintFlow } from '@/lib/genkit';

export async function POST(request: Request) {
  try {
    const { auditId } = await request.json();
    
    // Call the Genkit flow to generate PDF
    const result = await complaintFlow({ auditId });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('PDF Complaint API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
