import { useState, type ChangeEvent, type CSSProperties, type HTMLAttributes } from 'react';
import { useCVStore } from '../../../../store/useCVStore';
import { Plus, Trash2, ChevronDown, Globe, GripVertical } from 'lucide-react';
import { Input } from '../../../ui/Form';
import { EmptyState } from '../../../ui/EmptyState';
import type { CustomSectionItem } from '../../../../types/resume';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const LanguageItem = ({
  language,
  isOpen,
  onToggle,
  dragHandleProps,
}: {
  language: CustomSectionItem;
  isOpen: boolean;
  onToggle: () => void;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
}) => {
  const { updateLanguage, removeLanguage } = useCVStore();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateLanguage(language.id, { [name]: value });
  };

  return (
    <div className="item-card group">
      <div 
        className="item-header"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
            <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-300 hover:text-gray-500 p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-grab active:cursor-grabbing"
                title="Drag to reorder"
                {...dragHandleProps}
            >
                <GripVertical className="w-4 h-4" />
            </button>
            <div className="item-icon-container">
                <Globe className="w-4 h-4" />
            </div>
            <div>
                <div className="text-sm font-semibold tracking-tight text-slate-900">{language.name || 'New Language'}</div>
                <div className="text-xs text-slate-500">{language.description ? language.description : 'Proficiency'}</div>
            </div>
        </div>
        <div className="item-controls">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    removeLanguage(language.id);
                }}
                className="item-delete-btn"
                title="Delete language"
            >
                <Trash2 className="w-4 h-4" />
            </button>
            <div className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}>
                <ChevronDown className="w-4 h-4" />
            </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="item-content">
           <Input
              label="Language"
              name="name"
              value={language.name}
              onChange={handleChange}
              placeholder="e.g. English"
              icon={<Globe className="w-4 h-4" />}
              className="input-field-borderless"
           />
           
           <Input
              label="Proficiency"
              name="description"
              value={language.description}
              onChange={handleChange}
              placeholder="e.g. Native, Fluent, Intermediate"
              className="input-field-borderless"
           />
        </div>
      )}
    </div>
  );
};

const SortableLanguageItem = ({
  language,
  isOpen,
  onToggle,
}: {
  language: CustomSectionItem;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: language.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <LanguageItem
        language={language}
        isOpen={isOpen}
        onToggle={onToggle}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export const LanguagesForm = () => {
    const { cvData, addLanguage, moveLanguage } = useCVStore();
    const [openId, setOpenId] = useState<string | null>(null);

    const handleToggle = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        moveLanguage(String(active.id), String(over.id));
    };

    return (
        <div className="form-container languages-form">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-base font-semibold tracking-tight text-slate-900">Languages</h3>
                    <p className="text-sm text-slate-500">Add languages you speak.</p>
                </div>
            </div>

            {cvData.languages.length === 0 ? (
                <EmptyState
                    icon={<Globe className="w-8 h-8" />}
                    title="No languages added yet"
                    description="Add languages you can speak comfortably."
                    action={
                        <button onClick={addLanguage} className="btn-cta-blue">
                            <Plus className="w-4 h-4" />
                            Add Language
                        </button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={cvData.languages.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                            {cvData.languages.map((language) => (
                                <SortableLanguageItem
                                    key={language.id}
                                    language={language}
                                    isOpen={openId === language.id}
                                    onToggle={() => handleToggle(language.id)}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    <button onClick={addLanguage} className="empty-state-add-btn group">
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Add Another Language
                    </button>
                </div>
            )}
        </div>
    );
};
