import { Document, Packer, Paragraph, ImageRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import type { EvalReport } from '../types';

// Helper to convert Base64 browser images into raw binary buffers for Microsoft Word
const base64ToArrayBuffer = (base64: string) => {
  const binaryString = window.atob(base64.split(',')[1]);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export const generateDocx = async (report: EvalReport) => {
  const { clientName, companyName, preparerName, contactInfo, properties } = report;

  const sections: any[] = [];

  // --- 1. COVER PAGE ---
  sections.push({
    properties: {},
    children: [
      new Paragraph({
        text: companyName || "UNiBUD EVALUATION ENGINE",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400, before: 2400 },
      }),
      new Paragraph({
        text: "PROPERTY EVALUATION REPORT",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: clientName || "Client Name",
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
        spacing: { after: 2400 },
      }),
      new Paragraph({
        text: preparerName ? `Prepared by: ${preparerName}` : "",
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: `Date: ${new Date().toLocaleDateString("en-GB")}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: contactInfo || "",
        alignment: AlignmentType.CENTER,
        pageBreakBefore: false,
      }),
    ],
  });

  // --- 2. PROPERTIES LOOP ---
  properties.forEach((prop, index) => {
    const propChildren: any[] = [
      new Paragraph({
        text: `Property ${index + 1}: ${prop.name || 'Unnamed Property'}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: true, // Forces each property onto a new page
      }),
      new Paragraph({ text: `Location: ${prop.location}`, spacing: { after: 100 } }),
      new Paragraph({ text: `Asking Price: ${prop.price}`, spacing: { after: 100 } }),
      new Paragraph({ text: `Rating: ${prop.rating} / 5 Stars`, spacing: { after: 400 } }),
    ];

    if (prop.comments) {
      propChildren.push(new Paragraph({ text: "Agent Notes", heading: HeadingLevel.HEADING_3 }));
      propChildren.push(new Paragraph({ text: prop.comments, spacing: { after: 300 } }));
    }

    if (prop.pros && prop.pros.length > 0) {
      propChildren.push(new Paragraph({ text: "Highlights", heading: HeadingLevel.HEADING_3 }));
      prop.pros.forEach(p => {
        propChildren.push(new Paragraph({ text: p, bullet: { level: 0 } }));
      });
      propChildren.push(new Paragraph({ text: "", spacing: { after: 200 } })); // Spacer
    }

    if (prop.cons && prop.cons.length > 0) {
      propChildren.push(new Paragraph({ text: "Considerations", heading: HeadingLevel.HEADING_3 }));
      prop.cons.forEach(c => {
        propChildren.push(new Paragraph({ text: c, bullet: { level: 0 } }));
      });
      propChildren.push(new Paragraph({ text: "", spacing: { after: 200 } })); // Spacer
    }

    // Process and inject images into the Word document
    if (prop.images.length > 0) {
      propChildren.push(new Paragraph({ text: "Photos", heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 200 } }));
      
      prop.images.forEach(img => {
        try {
          // Detect image extension to keep the DOCX compiler happy
          const isPng = img.base64.toLowerCase().includes('image/png');
          
          propChildren.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: base64ToArrayBuffer(img.base64),
                  transformation: { width: 500, height: 375 }, // Standard 4:3 fit for Word
                  type: isPng ? 'png' : 'jpeg'
                } as any),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 }
            })
          );
          if (img.caption) {
            propChildren.push(new Paragraph({ text: img.caption, alignment: AlignmentType.CENTER, spacing: { after: 300 } }));
          }
        } catch (e) {
          console.warn("Failed to process image for DOCX buffer");
        }
      });
    }

    sections.push({
      properties: {},
      children: propChildren,
    });
  });

  // Assemble and download
  const doc = new Document({ sections });
  const blob = await Packer.toBlob(doc);
  const safeFilename = `${companyName?.replace(/\s+/g, '-').toLowerCase() || 'UNiBUD'}-Eval-${clientName.replace(/\s+/g, '-').toLowerCase() || 'report'}.docx`;
  
  saveAs(blob, safeFilename);
};