import { useRef } from "react";
import type { PropertyImage } from '../../types';

interface Props {
  images: PropertyImage[];
  onChange: (images: PropertyImage[]) => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);

export function ImageUploader({ images, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const results = await Promise.all(
      Array.from(files).map(
        (f) =>
          new Promise<PropertyImage>((res) => {
            const r = new FileReader();
            r.onload = (e) =>
              res({ base64: e.target?.result as string, caption: "", isCover: false, id: uid() });
            r.readAsDataURL(f);
          })
      )
    );
    const next = [...images, ...results];
    if (next.length > 0 && !next.some((i) => i.isCover)) next[0].isCover = true;
    onChange(next);
  };

  const setCover = (id: string) => {
    onChange(images.map((img) => ({ ...img, isCover: img.id === id })));
  };

  const removeImage = (id: string) => {
    const next = images.filter((img) => img.id !== id);
    if (next.length > 0 && !next.some((i) => i.isCover)) next[0].isCover = true;
    onChange(next);
  };

  const updateCaption = (id: string, caption: string) => {
    onChange(images.map((img) => (img.id === id ? { ...img, caption } : img)));
  };

  return (
    <div>
      {/* Dropzone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-[#3A3A5A] rounded-lg p-4 text-center cursor-pointer text-unibud-muted text-sm hover:border-unibud-gold transition-colors mb-3"
      >
        <span className="text-xl block mb-1">🖼</span>
        Drop images here or click to upload
      </div>
      
      {/* Hidden File Input */}
      <input
        ref={fileRef}
        type="file"
        title="Upload images"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative w-[88px] flex-shrink-0">
              
              {/* Image Thumbnail */}
              <div 
                className={`relative w-[88px] h-[66px] rounded-md overflow-hidden border-2 cursor-pointer transition-colors ${img.isCover ? 'border-unibud-gold' : 'border-[#2E2E3E]'}`}
                onClick={() => setCover(img.id)}
                title="Click to set as cover"
              >
                <img src={img.base64} alt={img.caption || "Property image"} className="w-full h-full object-cover" />
                
                {/* Cover Badge */}
                {img.isCover && (
                  <div className="absolute bottom-1 left-1 bg-unibud-gold text-[#1A1225] text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider">
                    COVER
                  </div>
                )}
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                  className="absolute top-1 right-1 bg-black/70 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center hover:bg-red-500 transition-colors"
                  title="Remove image"
                >
                  ✕
                </button>
              </div>

              {/* Caption Input */}
              <input
                type="text"
                placeholder="Caption"
                value={img.caption || ""}
                onChange={(e) => updateCaption(img.id, e.target.value)}
                className="w-full text-[10px] px-1.5 py-1 mt-1 bg-[#15121F] border border-[#2E2E3E] rounded text-[#C0BFCF] outline-none focus:border-unibud-gold transition-colors box-border"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}