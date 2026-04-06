import React from 'react';
import { cn } from '../ui/Form';

const FONT_OPTIONS = [
  { label: 'Template Default', value: '' },
  { label: 'Inter', value: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
  { label: 'Source Sans 3', value: '"Source Sans 3", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
  { label: 'Roboto', value: 'Roboto, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif' },
  { label: 'Helvetica / Arial', value: 'Helvetica, Arial, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif' },
  { label: 'Calibri', value: 'Calibri, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
  { label: 'Sans Serif (System)', value: 'ui-sans-serif, system-ui, sans-serif' },
  { label: 'Serif (System)', value: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' },
];

interface FontFamilySelectProps {
  value: string;
  onChange: (font: string) => void;
  className?: string;
}

export const FontFamilySelect: React.FC<FontFamilySelectProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <div className={cn('relative group', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select-field"
      >
        {FONT_OPTIONS.map((font) => (
          <option key={font.value} value={font.value}>
            {font.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors">
        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
        </svg>
      </div>
    </div>
  );
};
