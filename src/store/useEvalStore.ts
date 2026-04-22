import { create } from 'zustand';
import type { PropertyEvalState, EvalReport } from '../types';

const uid = () => Math.random().toString(36).slice(2, 9);

const createEmptyProperty = (): PropertyEvalState => ({
  id: uid(),
  name: "",
  price: "",
  location: "",
  rating: 3,
  isTopRecommendation: false,
  images: [],
  imageHeight: 240,
  _showInsights: false,
  _prosRaw: "",
  _consRaw: "",
});

interface EvalStore extends Omit<EvalReport, 'properties'> {
  properties: PropertyEvalState[];
  setConfig: (field: keyof Omit<EvalReport, 'properties'>, value: string | null) => void;
  addProperty: () => void;
  updateProperty: (id: string, field: keyof PropertyEvalState, value: any) => void;
  removeProperty: (id: string) => void;
  reorderProperty: (id: string, direction: 'up' | 'down') => void;
  buildPayload: () => EvalReport;
  loadPayload: (payload: any) => void;
}

export const useEvalStore = create<EvalStore>((set, get) => ({
  clientName: "",
  accentColor: "#C9A84C",
  companyName: "Nierwell Real Estate",
  companyLogo: null,
  preparerName: "",
  contactInfo: "",
  properties: [createEmptyProperty()],

  setConfig: (field, value) => set({ [field]: value }),

  addProperty: () => set((state) => ({ 
    properties: [...state.properties, createEmptyProperty()] 
  })),

  updateProperty: (id, field, value) => set((state) => ({
    properties: state.properties.map((p) => 
      p.id === id ? { ...p, [field]: value } : p
    )
  })),

  removeProperty: (id) => set((state) => ({
    properties: state.properties.filter((p) => p.id !== id)
  })),

  reorderProperty: (id, direction) => set((state) => {
    const idx = state.properties.findIndex((p) => p.id === id);
    if (idx === -1) return state;
    const next = [...state.properties];
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= next.length) return state;
    
    [next[idx], next[target]] = [next[target], next[idx]];
    return { properties: next };
  }),

  buildPayload: () => {
    const { clientName, accentColor, companyName, companyLogo, preparerName, contactInfo, properties } = get();
    return {
      clientName, accentColor, companyName, companyLogo, preparerName, contactInfo,
      properties: properties.map(({ _showInsights, _prosRaw, _consRaw, ...rest }) => ({
        ...rest,
        comments: rest.comments?.trim() || undefined,
        pros: rest.pros?.length ? rest.pros : undefined,
        cons: rest.cons?.length ? rest.cons : undefined,
      }))
    };
  },

  loadPayload: (payload) => {
    if (!payload || !Array.isArray(payload.properties)) return;
    
    const reconstructedProperties: PropertyEvalState[] = payload.properties.map((p: any) => ({
      ...p,
      _showInsights: false,
      _prosRaw: p.pros ? p.pros.join('\n') : "",
      _consRaw: p.cons ? p.cons.join('\n') : "",
      imageHeight: p.imageHeight || 240
    }));

    set({
      clientName: payload.clientName || "",
      accentColor: payload.accentColor || "#C9A84C",
      companyName: payload.companyName || "Nierwell Real Estate",
      companyLogo: payload.companyLogo || null,
      preparerName: payload.preparerName || "",
      contactInfo: payload.contactInfo || "",
      properties: reconstructedProperties.length > 0 ? reconstructedProperties : [createEmptyProperty()]
    });
  }
}));