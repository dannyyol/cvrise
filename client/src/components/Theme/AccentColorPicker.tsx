import React from 'react';
import { Palette } from 'lucide-react';
import { cn } from '../ui/Form';

const PRESET_COLORS = [
  '#475569',
  '#2563EB',
  '#DC2626',
  '#059669',
  '#7C3AED',
  '#DB2777',
];

interface AccentColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  supportsAccent?: boolean;
  className?: string;
  disabledLabel?: React.ReactNode;
}

export const AccentColorPicker: React.FC<AccentColorPickerProps> = ({
  value,
  onChange,
  supportsAccent = true,
  className,
  disabledLabel,
}) => {
  return (
    <div className={cn('relative', className)}>
      {!supportsAccent && (
        <div className="absolute -inset-2 bg-white/80 backdrop-blur-[1px] z-20 rounded-xl flex items-center justify-center">
          {disabledLabel ?? (
            <span className="bg-white/90 text-gray-500 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-gray-100">
              Not available for this template
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={cn(
              'color-swatch group',
              value.toLowerCase() === color.toLowerCase()
                ? 'color-swatch-active'
                : 'color-swatch-inactive'
            )}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
            type="button"
          >
            {value.toLowerCase() === color.toLowerCase() && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-2 h-2 bg-white rounded-full shadow-sm" />
              </span>
            )}
          </button>
        ))}

        <div className="relative group">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-9 h-9 p-0 border-0 rounded-full overflow-hidden cursor-pointer opacity-0 absolute inset-0 z-10"
          />
          <div
            className={cn(
              'theme-color-input-wrapper',
              !PRESET_COLORS.includes(value) && 'theme-color-input-wrapper-active'
            )}
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center"
              style={{
                backgroundColor: !PRESET_COLORS.includes(value)
                  ? value
                  : 'transparent',
              }}
            >
              {!PRESET_COLORS.includes(value) ? (
                <span className="w-2 h-2 bg-white rounded-full shadow-sm" />
              ) : (
                <Palette className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
