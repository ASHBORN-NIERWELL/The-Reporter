import { useRef } from 'react';
import { useEvalStore } from '../../store/useEvalStore';

interface Props {
  onClose: () => void;
}

export function SettingsModal({ onClose }: Props) {
  const { companyName, companyLogo, preparerName, contactInfo, setConfig } = useEvalStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setConfig('companyLogo', event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const inputClass = "w-full bg-[#0E0C1A] border border-unibud-border rounded-lg text-unibud-text px-3 py-2 text-sm outline-none focus:border-unibud-gold transition-colors mb-4";
  const labelClass = "block text-[11px] font-semibold tracking-[0.1em] text-unibud-muted uppercase mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/80 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#141220] border border-unibud-border rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-5 border-b border-[#1E1C2E]">
          <h3 className="text-unibud-gold font-bold tracking-widest text-xs">REPORT METADATA</h3>
          <button onClick={onClose} className="text-[#8080B0] hover:text-white transition-colors">✕</button>
        </div>
        
        <div className="p-6">
          <label className={labelClass}>Company Logo</label>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-md bg-[#0E0C1A] border border-dashed border-[#3A3A5A] flex items-center justify-center overflow-hidden flex-shrink-0">
              {companyLogo ? (
                <img src={companyLogo} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <span className="text-xl opacity-50">🏢</span>
              )}
            </div>
            <div className="flex-1">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="text-xs bg-[#252240] text-[#D0CFDF] px-3 py-1.5 rounded hover:bg-[#302D4A] transition-colors"
              >
                Upload Base64 Logo
              </button>
              {companyLogo && (
                <button 
                  onClick={() => setConfig('companyLogo', null)} 
                  className="text-xs text-[#8B4050] ml-3 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <label className={labelClass}>Company Name</label>
          <input type="text" value={companyName} onChange={(e) => setConfig('companyName', e.target.value)} placeholder="e.g. Nierwell Real Estate" className={inputClass} />

          <label className={labelClass}>Preparer / Agent Name</label>
          <input type="text" value={preparerName} onChange={(e) => setConfig('preparerName', e.target.value)} placeholder="e.g. John Doe" className={inputClass} />

          <label className={labelClass}>Contact Info (Footer)</label>
          <input type="text" value={contactInfo} onChange={(e) => setConfig('contactInfo', e.target.value)} placeholder="e.g. +94 77 123 4567 | contact@nierwell.com" className={inputClass} />
        </div>

        <div className="p-5 border-t border-[#1E1C2E] flex justify-end">
          <button onClick={onClose} className="bg-unibud-gold text-[#1A1225] text-xs font-bold px-6 py-2 rounded-md tracking-wider hover:bg-[#E8C96A] transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}