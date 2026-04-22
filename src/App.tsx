import { useState, useRef } from 'react';
import { useEvalStore } from './store/useEvalStore';
import { PropertyCard } from './components/features/PropertyCard';
import { PDFPreview } from './components/features/PDFPreview';
import { SettingsModal } from './components/features/SettingsModal';
import { generateDocx } from './utils/generateDocx';

const ACCENT_PRESETS = [
  { label: "Gold", value: "#C9A84C" },
  { label: "Navy", value: "#1B3A6B" },
  { label: "Emerald", value: "#1A6B4A" },
  { label: "Crimson", value: "#8B1A2F" },
  { label: "Slate", value: "#4A5568" },
];

export default function App() {
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Connect to the global Zustand store
  const { 
    properties, 
    clientName, 
    accentColor, 
    addProperty, 
    setConfig, 
    buildPayload, 
    loadPayload 
  } = useEvalStore();

  const filledCount = properties.filter((p) => p.name.trim()).length;
  const topPick = properties.find((p) => p.isTopRecommendation);

  // --- ACTIONS ---

  const exportJSON = () => {
    const payload = buildPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eval-${clientName.replace(/\s+/g, '-').toLowerCase() || "report"}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        loadPayload(json);
      } catch (error) {
        alert("Invalid JSON file. Ensure it matches the UNiBUD schema.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = ''; 
  };

  const handleDocxExport = async () => {
    try {
      await generateDocx(buildPayload());
    } catch (err) {
      console.error("Docx generation failed", err);
      alert("Failed to generate Word document.");
    }
  };

  return (
    <div className="min-h-screen bg-unibud-bg text-unibud-text font-sans relative">
      {/* Visual Grain Background */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_20%_10%,rgba(201,168,76,0.06)_0%,transparent_50%),radial-gradient(ellipse_at_80%_80%,rgba(80,60,150,0.08)_0%,transparent_50%)]" />

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-unibud-bg/90 backdrop-blur-md border-b border-unibud-border px-8 h-14 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <span className="font-bold text-white text-[15px] tracking-tight">UNiBUD</span>
            <span className="text-[11px] text-unibud-gold tracking-[0.12em] font-medium">EVAL ENGINE</span>
         </div>

         <div className="flex items-center gap-4">
           {/* Summary Stats */}
           <div className="hidden md:flex items-center text-xs text-unibud-muted mr-2">
             <span className="text-unibud-gold font-semibold">{filledCount}</span> propert{filledCount !== 1 ? "ies" : "y"}
             {topPick && (
               <span className="ml-2.5 text-[#8080B0]">
                 · Top: <span className="text-unibud-gold">{topPick.name || "Unnamed"}</span>
               </span>
             )}
           </div>
           
           {/* Settings Trigger */}
           <button onClick={() => setShowSettings(true)} className="text-[#8080B0] text-xs hover:text-white transition-colors flex items-center gap-1.5 px-2">
             ⚙️ Settings
           </button>
           
           <div className="w-px h-4 bg-[#2A2840] mx-1" />

           {/* Save/Load Controls */}
           <input type="file" accept=".json" ref={fileInputRef} onChange={importJSON} className="hidden" />
           <button onClick={() => fileInputRef.current?.click()} className="text-[#8080B0] text-xs hover:text-white transition-colors px-2">
             Load
           </button>
           <button onClick={exportJSON} className="text-[#8080B0] text-xs border border-unibud-border rounded-md px-3 py-1.5 hover:text-white hover:border-[#8080B0] transition-all">
             Save JSON
           </button>

           {/* Native DOCX Export */}
           <button onClick={handleDocxExport} className="text-emerald-500 text-xs font-bold border border-emerald-500/30 bg-emerald-500/5 rounded-md px-3 py-1.5 hover:bg-emerald-500 hover:text-white transition-all ml-1">
             Word (.docx)
           </button>
           
           {/* High-Res PDF Export */}
           <button onClick={() => setShowPreview(true)} className="bg-gradient-to-br from-unibud-gold to-[#E8C96A] text-black text-xs font-bold px-4 py-2 rounded-md tracking-wider hover:opacity-90 transition-opacity ml-1">
              Preview PDF →
           </button>
         </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-[820px] mx-auto p-8 pb-20 relative z-10">
        
        {/* Rapid Client Configuration */}
        <section className="bg-gradient-to-br from-[#1A1730] to-[#141220] border border-unibud-border rounded-xl p-5 mb-6 shadow-lg">
          <div className="text-[10px] tracking-[0.18em] text-unibud-gold font-bold mb-4 uppercase">
            Quick Report Config
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-6 items-end">
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.1em] text-unibud-muted uppercase mb-1.5">Client Name</label>
              <input 
                type="text" 
                value={clientName} 
                onChange={(e) => setConfig('clientName', e.target.value)} 
                className="w-full bg-[#0E0C1A] border border-unibud-border rounded-lg text-unibud-text px-3 py-2 text-sm outline-none focus:border-unibud-gold transition-colors" 
                placeholder="e.g. Mr. & Mrs. Perera" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.1em] text-unibud-muted uppercase mb-1.5">Accent Color</label>
              <div className="flex gap-1.5 items-center">
                {ACCENT_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    title={p.label}
                    onClick={() => setConfig('accentColor', p.value)}
                    className={`w-6 h-6 rounded-full cursor-pointer transition-all ${accentColor === p.value ? 'scale-125 border-2 border-white ring-2 ring-white/20' : 'border-2 border-transparent hover:scale-110'}`}
                    style={{ background: p.value }}
                  />
                ))}
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setConfig('accentColor', e.target.value)}
                  title="Custom color"
                  className="w-6 h-6 rounded-full border-2 border-[#3A3A5A] cursor-pointer bg-transparent p-0 overflow-hidden ml-1"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Properties Management */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] tracking-[0.18em] font-bold text-unibud-muted uppercase">Properties ({properties.length})</h2>
          <button onClick={addProperty} className="text-unibud-gold text-sm font-semibold border border-unibud-border rounded-md px-4 py-1.5 flex items-center gap-2 hover:bg-unibud-gold/10 transition-colors">
            <span>+</span> Add Property
          </button>
        </div>

        {/* Dynamic Property Stack */}
        <div className="flex flex-col gap-4">
          {properties.map((prop, index) => (
            <PropertyCard 
              key={prop.id} 
              propertyId={prop.id} 
              index={index} 
              total={properties.length} 
            />
          ))}
          
          {properties.length === 0 && (
            <div className="text-center py-12 px-6 text-[#3A3A5A] border-2 border-dashed border-unibud-border rounded-xl">
              <div className="text-3xl mb-3">🏘</div>
              <div className="text-sm font-medium">Engine is idle. Add a property to begin evaluation.</div>
            </div>
          )}
        </div>
      </main>

      {/* --- MODAL OVERLAYS --- */}
      {showPreview && (
        <PDFPreview report={buildPayload()} onClose={() => setShowPreview(false)} />
      )}

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}