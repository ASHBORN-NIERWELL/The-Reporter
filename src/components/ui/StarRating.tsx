import { useState } from "react";

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function StarRating({ value, onChange }: Props) {
  const [hovered, setHovered] = useState(0);
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          className={`text-[22px] leading-none transition-colors duration-150 ${
            s <= (hovered || value) ? "text-unibud-gold" : "text-[#3A3A4A]"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}