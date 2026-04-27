import { z } from 'genkit';
import { ai } from '../../genkit';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import PDFDocument from 'pdfkit';

export const complaintFlow = ai.defineFlow(
  {
    name: 'complaintFlow',
    inputSchema: z.object({
      auditId: z.string(),
    }),
    outputSchema: z.object({
      pdfBase64: z.string(),
      fileName: z.string(),
    }),
  },
  async (input) => {
    // 1. Fetch audit from Firestore
    const auditRef = doc(db, 'audits', input.auditId);
    const auditSnap = await getDoc(auditRef);
    
    if (!auditSnap.exists()) {
      throw new Error('Audit not found');
    }
    
    const data = auditSnap.data();
    const letterContent = data.letter || "No complaint letter generated for this audit.";
    
    // 2. Generate PDF using pdfkit
    const pdfBase64 = await ai.run('generate-pdf', async () => {
      return new Promise<string>((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        let buffers: any[] = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData.toString('base64'));
        });
        doc.on('error', reject);
        
        // Add Content
        doc.fontSize(20).text('RBI Banking Ombudsman Complaint', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
        doc.text(`Audit ID: ${input.auditId}`);
        doc.moveDown();
        doc.text('------------------------------------------------------------');
        doc.moveDown();
        doc.fontSize(11).text(letterContent, {
          lineGap: 5,
          align: 'justify'
        });
        
        doc.end();
      });
    });
    
    return {
      pdfBase64,
      fileName: `CREFAH_Complaint_${input.auditId}.pdf`
    };
  }
);
