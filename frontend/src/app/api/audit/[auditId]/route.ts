import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request: Request, context: { params: Promise<{ auditId: string }> }) {
  try {
    const { auditId } = await context.params;
    const docRef = doc(db, 'audits', auditId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return NextResponse.json({ auditId, ...docSnap.data() });
    } else {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Audit GET API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
