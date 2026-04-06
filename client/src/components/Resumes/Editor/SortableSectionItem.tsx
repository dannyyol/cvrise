import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, Check, Eye, EyeOff, GripVertical, Pencil, X } from 'lucide-react';
import { useCVStore } from '@/src/store/useCVStore';
import type { CVSection as Section } from '@/src/types/resume';
import { Card, CardContent, CardHeader } from '@/src/components/ui/Card';
import { type EditorSectionType } from '@/src/components/Resumes/Editor/sectionConfig';
import { SECTION_FORMS } from '@/src/components/Resumes/Editor/sectionRegistry';

export type ColumnLabel = 'Main' | 'Sidebar';

interface SortableSectionItemProps {
  section: Section;
  isOpen: boolean;
  onToggle: () => void;
  columnLabel?: ColumnLabel;
}

export const SortableSectionItem = ({ section, isOpen, onToggle, columnLabel }: SortableSectionItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const { toggleSectionVisibility, updateSectionTitle } = useCVStore();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const FormComponent = SECTION_FORMS[section.type as EditorSectionType];

  const handleSaveTitle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (title.trim()) {
      updateSectionTitle(section.id, title);
      setIsEditing(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card variant="accordion" topBorder shadow={false} className="group mb-4">
        <CardHeader className="editor-section-header">
          <div {...attributes} {...listeners} className="cursor-move text-slate-300 hover:text-slate-500 mr-2 transition-colors outline-none p-1.5 rounded-lg hover:bg-slate-100">
            <GripVertical className="w-5 h-5" />
          </div>

          <div className="flex-1 font-semibold text-slate-800 flex items-center gap-2" onClick={!isEditing ? onToggle : undefined}>
            {isEditing ? (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') {
                      setTitle(section.title);
                      setIsEditing(false);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <button onClick={handleSaveTitle} className="text-green-600 hover:bg-green-50 p-1 rounded">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={handleCancel} className="text-red-600 hover:bg-red-50 p-1 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <span className="cursor-pointer select-none flex-1">{section.title}</span>
                {columnLabel && (
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full border border-slate-200/70 text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-50">
                    {columnLabel}
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTitle(section.title);
                    setIsEditing(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-all"
                  title="Rename section"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity ml-3">
            <button
              onClick={() => toggleSectionVisibility(section.id)}
              className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-all duration-200"
              title={section.isVisible ? "Hide section" : "Show section"}
            >
              {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-all duration-200"
            >
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </CardHeader>

        {isOpen && (
          <CardContent className="editor-section-content">
            {FormComponent ? <FormComponent /> : <p className="text-sm text-gray-500">Form not implemented for {section.type}</p>}
          </CardContent>
        )}
      </Card>
    </div>
  );
};
