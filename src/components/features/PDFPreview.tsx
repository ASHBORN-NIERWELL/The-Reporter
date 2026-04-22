import { useRef, useState } from 'react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import type { EvalReport } from '../../types';

interface Props {
  report: EvalReport;
  onClose: () => void;
}

export function PDFPreview({ report, onClose }: Props) {
  const { clientName, accentColor, companyName, companyLogo, preparerName, contactInfo, properties } = report;
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const coverProp = properties.find((p) => p.images.some((i) => i.isCover));
  const coverImg = coverProp?.images.find((i) => i.isCover);

  const handleDownload = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);

    const element = reportRef.current;
    
    const opt = {
      margin: 0,
      filename: `${companyName?.replace(/\s+/g, '-').toLowerCase() || 'UNiBUD'}-Report.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      // FIX: Added 'as [number, number]' to satisfy strict TypeScript requirements
      jsPDF: { 
        unit: 'px' as const, 
        format: [794, 1123] as [number, number], 
        orientation: 'portrait' as const 
      },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[1000] flex items-start justify-center overflow-y-auto py-10">
      <div className="w-full max-w-[794px] shadow-2xl">
        
        {/* Navigation Controls */}
        <div className="flex justify-between items-center mb-4 sticky top-0 z-50 bg-black/40 backdrop-blur-xl p-4 rounded-xl border border-white/10 mx-4">
          <span className="text-unibud-gold text-[12px] tracking-[0.2em] font-bold">A4 PAGINATED PREVIEW</span>
          <div className="flex gap-2">
            <button 
              onClick={handleDownload} 
              disabled={isGenerating} 
              className="bg-unibud-gold text-black rounded px-4 py-2 text-[12px] font-bold hover:bg-yellow-500 transition-all disabled:opacity-50"
            >
              {isGenerating ? 'Compiling...' : 'Download PDF'}
            </button>
            <button onClick={onClose} className="bg-white/10 text-white rounded px-4 py-2 text-[12px] hover:bg-white/20 transition-all">✕</button>
          </div>
        </div>

        {/* PDF Document Container */}
        <div ref={reportRef} className="bg-white text-[#1A1A1A] font-serif w-[794px]">
          
          {/* PAGE 1: DEDICATED COVER PAGE */}
          <div 
            className="relative flex flex-col justify-between p-20 break-after-page overflow-hidden"
            style={{ height: '1123px', borderBottom: `20px solid ${accentColor}` }}
          >
            {coverImg && (
              <div className="absolute inset-0 z-0">
                <img src={coverImg.base64} alt="" className="w-full h-full object-cover opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white" />
              </div>
            )}
            
            <div className="relative z-10">
              {companyLogo && <img src={companyLogo} alt="" className="h-16 object-contain mb-6" />}
              <div className="text-2xl font-sans font-bold tracking-tighter uppercase" style={{ color: accentColor }}>{companyName}</div>
            </div>

            <div className="relative z-10 mb-20">
              <div className="text-[12px] tracking-[0.4em] font-sans font-bold opacity-50 mb-4">REAL ESTATE EVALUATION</div>
              <div className="text-6xl font-bold leading-[1.1] mb-8">{clientName || "Valued Client"}</div>
              <div className="w-24 h-2 mb-8" style={{ backgroundColor: accentColor }} />
              <div className="font-sans text-lg text-gray-500">
                {properties.length} Properties Analyzed • {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </div>
            </div>

            <div className="relative z-10 font-sans text-sm border-t pt-6 flex justify-between items-end border-gray-100">
              <div>
                <div className="font-bold">Prepared By</div>
                <div>{preparerName || "Senior Consultant"}</div>
              </div>
              <div className="text-right text-gray-400 max-w-[300px]">{contactInfo}</div>
            </div>
          </div>

          {/* SUBSEQUENT PAGES: PROPERTIES */}
          {properties.map((prop, idx) => (
            <div 
              key={prop.id} 
              className="p-16 relative flex flex-col break-after-page"
              style={{ height: '1123px' }}
            >
              <div className="flex justify-between items-end border-b-2 pb-6 mb-8" style={{ borderColor: `${accentColor}33` }}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold font-sans text-sm" style={{ backgroundColor: accentColor }}>{idx + 1}</span>
                    {prop.isTopRecommendation && (
                      <span className="text-[10px] font-bold font-sans px-2 py-1 rounded tracking-widest text-white" style={{ backgroundColor: accentColor }}>TOP PICK</span>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold">{prop.name || "Property Reference"}</h2>
                  <p className="text-gray-400 font-sans">{prop.location}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: accentColor }}>{prop.price}</div>
                  <div className="text-unibud-gold text-lg">{'★'.repeat(prop.rating)}{'☆'.repeat(5 - prop.rating)}</div>
                </div>
              </div>

              {prop.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {prop.images.slice(0, 4).map((img, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center" style={{ height: '240px' }}>
                      <img src={img.base64} alt="" className="max-w-full max-h-full object-contain" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex-1">
                {prop.comments && (
                  <div className="mb-8 p-6 rounded-lg italic text-gray-700 leading-relaxed border-l-4" style={{ backgroundColor: `${accentColor}08`, borderLeftColor: accentColor }}>
                    "{prop.comments}"
                  </div>
                )}

                <div className="grid grid-cols-2 gap-10">
                  {prop.pros && prop.pros.length > 0 && (
                    <div>
                      <div className="text-[11px] font-sans font-bold tracking-widest text-green-700 uppercase mb-4">Strategic Advantages</div>
                      {prop.pros.map((item, i) => <div key={i} className="text-sm mb-2 flex gap-2 font-sans"><span className="text-green-600 font-bold">✓</span> {item}</div>)}
                    </div>
                  )}
                  {prop.cons && prop.cons.length > 0 && (
                    <div>
                      <div className="text-[11px] font-sans font-bold tracking-widest text-red-700 uppercase mb-4">Risk Factors</div>
                      {prop.cons.map((item, i) => <div key={i} className="text-sm mb-2 flex gap-2 font-sans"><span className="text-red-600 font-bold">!</span> {item}</div>)}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between items-center text-[10px] font-sans text-gray-300 uppercase tracking-widest">
                <div>{companyName} • Confidential Evaluation</div>
                <div>Page {idx + 2} of {properties.length + 1}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}