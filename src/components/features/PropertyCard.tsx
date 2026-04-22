import { useEvalStore } from '../../store/useEvalStore';
import type { PropertyEvalState } from '../../types';
import { StarRating } from '../ui/StarRating';
import { ImageUploader } from '../ui/ImageUploader';

interface Props {
  propertyId: string;
  index: number;
  total: number;
}

export function PropertyCard({ propertyId, index, total }: Props) {
  // Connect to the Zustand store
  const prop = useEvalStore(state => state.properties.find(p => p.id === propertyId)) as PropertyEvalState;
  const updateProperty = useEvalStore(state => state.updateProperty);
  const removeProperty = useEvalStore(state => state.removeProperty);
  const reorderProperty = useEvalStore(state => state.reorderProperty);

  // Safety catch just in case the store hasn't synced
  if (!prop) return null;

  const update = (field: keyof PropertyEvalState, value: any) => updateProperty(prop.id, field, value);

  return (
    <div className={`p-6 rounded-xl transition-all duration-200 bg-gradient-to-br from-[#1A1730] to-[#141220] ${
      prop.isTopRecommendation ? 'border-2 border-unibud-gold shadow-[0_8px_32px_rgba(0,0,0,0.4)]' : 'border border-unibud-border shadow-lg'
    }`}>
      
      {/* --- Header Row --- */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
            prop.isTopRecommendation ? 'bg-unibud-gold text-[#1A1225]' : 'bg-[#252240] text-unibud-muted'
          }`}>
            {index + 1}
          </span>
          <span className="text-[#8080B0] text-sm">Property</span>
          {prop.isTopRecommendation && (
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest text-unibud-gold bg-unibud-gold/15 border border-unibud-gold/30 rounded">
              TOP PICK
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <button type="button" disabled={index === 0} onClick={() => reorderProperty(prop.id, 'up')} className="w-7 h-7 flex items-center justify-center rounded border border-unibud-border text-unibud-muted hover:text-white disabled:opacity-50 transition-colors">↑</button>
          <button type="button" disabled={index === total - 1} onClick={() => reorderProperty(prop.id, 'down')} className="w-7 h-7 flex items-center justify-center rounded border border-unibud-border text-unibud-muted hover:text-white disabled:opacity-50 transition-colors">↓</button>
          <button type="button" onClick={() => removeProperty(prop.id)} className="w-7 h-7 flex items-center justify-center rounded border border-[#3A2030] text-[#8B4050] hover:bg-[#8B4050] hover:text-white transition-colors">✕</button>
        </div>
      </div>

      {/* --- Core Fields --- */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-5">
        <div className="col-span-2">
          <label className="block text-[11px] font-semibold tracking-[0.1em] text-unibud-muted uppercase mb-1.5">Property Name</label>
          <input type="text" value={prop.name} onChange={(e) => update('name', e.target.value)} className="w-full bg-[#0E0C1A] border border-unibud-border rounded-lg text-unibud-text px-3 py-2 text-sm outline-none focus:border-unibud-gold transition-colors" placeholder="e.g. The Cinnamon Grand Residency" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold tracking-[0.1em] text-unibud-muted uppercase mb-1.5">Asking Price</label>
          <input type="text" value={prop.price} onChange={(e) => update('price', e.target.value)} className="w-full bg-[#0E0C1A] border border-unibud-border rounded-lg text-unibud-text px-3 py-2 text-sm outline-none focus:border-unibud-gold transition-colors" placeholder="e.g. LKR 28,500,000" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold tracking-[0.1em] text-unibud-muted uppercase mb-1.5">Location</label>
          <input type="text" value={prop.location} onChange={(e) => update('location', e.target.value)} className="w-full bg-[#0E0C1A] border border-unibud-border rounded-lg text-unibud-text px-3 py-2 text-sm outline-none focus:border-unibud-gold transition-colors" placeholder="e.g. Colombo 3" />
        </div>
      </div>

      {/* --- Rating & Top Pick --- */}
      <div className="flex items-center gap-6 py-3 mb-4 border-y border-[#1E1C2E]">
        <div>
          <label className="block text-[11px] font-semibold tracking-[0.1em] text-unibud-muted uppercase mb-1.5">Rating</label>
          <StarRating value={prop.rating} onChange={(v) => update('rating', v)} />
        </div>
        <div className="flex items-center gap-2 mt-4 cursor-pointer" onClick={() => update('isTopRecommendation', !prop.isTopRecommendation)}>
          <div className={`w-9 h-5 rounded-full relative transition-colors ${prop.isTopRecommendation ? 'bg-unibud-gold' : 'bg-[#252240]'}`}>
            <div className={`absolute top-[3px] w-3.5 h-3.5 bg-white rounded-full transition-all duration-200 ${prop.isTopRecommendation ? 'left-[19px]' : 'left-[3px]'}`} />
          </div>
          <span className="text-[13px] text-[#8080B0]">Top recommendation</span>
        </div>
      </div>

      {/* --- Images --- */}
      <div className="mb-4">
        <label className="block text-[11px] font-semibold tracking-[0.1em] text-unibud-muted uppercase mb-2">Photos</label>
        <ImageUploader images={prop.images} onChange={(imgs) => update('images', imgs)} />
      </div>

      {/* --- Progressive Disclosure Toggle --- */}
      <button 
        type="button"
        onClick={() => update('_showInsights', !prop._showInsights)}
        className="w-full py-2 flex items-center justify-center gap-1.5 text-xs text-unibud-muted border border-dashed border-unibud-border rounded-lg hover:text-unibud-gold hover:border-unibud-gold transition-all"
      >
        <span className="text-sm leading-none">{prop._showInsights ? "−" : "+"}</span> 
        {prop._showInsights ? "Hide Insights" : "Add Insights"}
      </button>

      {/* --- Insights Panel --- */}
      {prop._showInsights && (
        <div className="mt-4 pt-4 border-t border-[#1E1C2E] flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.1em] text-unibud-muted uppercase mb-1.5">Agent Notes</label>
              <textarea 
                value={prop.comments} 
                onChange={(e) => update('comments', e.target.value)} 
                rows={3} 
                placeholder="Private observations for the report narrative..."
                className="w-full bg-[#0E0C1A] border border-unibud-border rounded-lg text-unibud-text px-3 py-2 text-sm outline-none focus:border-unibud-gold transition-colors resize-y leading-relaxed" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold tracking-[0.1em] text-unibud-muted uppercase mb-1.5">Pros (one per line)</label>
                <textarea 
                  value={prop._prosRaw} 
                  onChange={(e) => {
                    update('_prosRaw', e.target.value);
                    update('pros', e.target.value.split('\n').map(s => s.trim()).filter(Boolean));
                  }} 
                  rows={4} 
                  placeholder="Rooftop terrace&#10;City view"
                  className="w-full bg-[#0E0C1A] border border-unibud-border rounded-lg text-unibud-text px-3 py-2 text-sm outline-none focus:border-unibud-gold transition-colors resize-y leading-relaxed" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-[0.1em] text-unibud-muted uppercase mb-1.5">Cons (one per line)</label>
                <textarea 
                  value={prop._consRaw} 
                  onChange={(e) => {
                    update('_consRaw', e.target.value);
                    update('cons', e.target.value.split('\n').map(s => s.trim()).filter(Boolean));
                  }} 
                  rows={4} 
                  placeholder="No parking&#10;Busy road"
                  className="w-full bg-[#0E0C1A] border border-unibud-border rounded-lg text-unibud-text px-3 py-2 text-sm outline-none focus:border-unibud-gold transition-colors resize-y leading-relaxed" 
                />
              </div>
            </div>
        </div>
      )}
    </div>
  );
}