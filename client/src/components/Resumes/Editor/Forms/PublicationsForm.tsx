import React from 'react';
import { useCVStore } from '../../../../store/useCVStore';
import { Plus, Trash2, ChevronDown, BookOpen, Building, Calendar, Link, GripVertical } from 'lucide-react';
import { Input } from '../../../ui/Form';
import { RichTextEditor } from '../../../ui/RichTextEditor';
import { EmptyState } from '../../../ui/EmptyState';
import type { Publication } from '../../../../types/resume';
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
import { Button } from '../../../ui/Button';

const PublicationItem = ({
  publication,
  isOpen,
  onToggle,
  dragHandleProps,
}: {
  publication: Publication;
  isOpen: boolean;
  onToggle: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) => {
  const { updatePublication, removePublication } = useCVStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updatePublication(publication.id, { [name]: value });
  };

  const handleDescriptionChange = (value: string) => {
    updatePublication(publication.id, { description: value });
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
                <BookOpen className="w-4 h-4" />
            </div>
            <div>
                <div className="text-sm font-semibold tracking-tight text-slate-900">{publication.title || 'New Publication'}</div>
                <div className="text-xs text-slate-500">{publication.publisher ? publication.publisher : 'Publisher'}</div>
            </div>
        </div>
        <div className="item-controls">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    removePublication(publication.id);
                }}
                className="item-delete-btn"
                title="Delete publication"
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
          <div className="form-grid-2">
             <Input
                label="Title"
                name="title"
                value={publication.title}
                onChange={handleChange}
                placeholder="e.g. Research Paper"
                icon={<BookOpen className="w-4 h-4" />}
                className="input-field-borderless"
             />
             <Input
                label="Publisher"
                name="publisher"
                value={publication.publisher}
                onChange={handleChange}
                placeholder="e.g. IEEE Journal"
                icon={<Building className="w-4 h-4" />}
                className="input-field-borderless"
             />
          </div>
          
           <div className="form-grid-2">
             <Input
                label="Date"
                name="date"
                value={publication.date}
                onChange={handleChange}
                placeholder="e.g. 2023"
                icon={<Calendar className="w-4 h-4" />}
                className="input-field-borderless"
             />
             <Input
                label="Link"
                name="link"
                value={publication.link}
                onChange={handleChange}
                placeholder="https://..."
                icon={<Link className="w-4 h-4" />}
                className="input-field-borderless"
             />
           </div>
           
           <RichTextEditor
              label="Description"
              value={publication.description}
              onChange={handleDescriptionChange}
              placeholder="Describe the publication..."
              className="rich-text-container-borderless"
            />
        </div>
      )}
    </div>
  );
};

const SortablePublicationItem = ({
  publication,
  isOpen,
  onToggle,
}: {
  publication: Publication;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: publication.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <PublicationItem
        publication={publication}
        isOpen={isOpen}
        onToggle={onToggle}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export const PublicationsForm = () => {
    const { cvData, addPublication, movePublication } = useCVStore();
    const [openId, setOpenId] = React.useState<string | null>(null);

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
      movePublication(String(active.id), String(over.id));
    };

    return (
        <div className="form-container publications-form">
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-base font-semibold tracking-tight text-slate-900">Publications</h3>
                    <p className="text-sm text-slate-500">Add your articles, books, or research papers.</p>
                 </div>
            </div>
            
            {cvData.publications.length === 0 ? (
                <EmptyState
                    icon={<BookOpen className="w-8 h-8" />}
                    title="No publications added yet"
                    description="Share your published work."
                    action={
                        <Button onClick={() => addPublication()} className="btn-cta-blue">
                            <Plus className="w-4 h-4" />
                            Add Publication
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={cvData.publications.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                        {cvData.publications.map((pub) => (
                          <SortablePublicationItem
                            key={pub.id}
                            publication={pub}
                            isOpen={openId === pub.id}
                            onToggle={() => handleToggle(pub.id)}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                    
                    <button
                        onClick={() => addPublication()}
                        className="empty-state-add-btn group"
                    >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Add Another Publication
                    </button>
                </div>
            )}
        </div>
    );
};
