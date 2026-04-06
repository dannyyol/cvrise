import React from 'react';
import { useCVStore } from '../../../../store/useCVStore';
import { Plus, Trash2, ChevronDown, Award, Building, Calendar, GripVertical } from 'lucide-react';
import { Input } from '../../../ui/Form';
import { RichTextEditor } from '../../../ui/RichTextEditor';
import { EmptyState } from '../../../ui/EmptyState';
import type { Award as AwardType } from '../../../../types/resume';
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

const AwardItem = ({
  award,
  isOpen,
  onToggle,
  dragHandleProps,
}: {
  award: AwardType;
  isOpen: boolean;
  onToggle: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) => {
  const { updateAward, removeAward } = useCVStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateAward(award.id, { [name]: value });
  };

  const handleDescriptionChange = (value: string) => {
    updateAward(award.id, { description: value });
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
                <Award className="w-4 h-4" />
            </div>
            <div>
                <div className="text-sm font-semibold tracking-tight text-slate-900">{award.title || 'New Award'}</div>
                <div className="text-xs text-slate-500">{award.issuer ? award.issuer : 'Issuer'}</div>
            </div>
        </div>
        <div className="item-controls">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    removeAward(award.id);
                }}
                className="item-delete-btn"
                title="Delete award"
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
                label="Award Title"
                name="title"
                value={award.title}
                onChange={handleChange}
                placeholder="e.g. Employee of the Year"
                icon={<Award className="w-4 h-4" />}
                className="input-field-borderless"
             />
             <Input
                label="Issuer"
                name="issuer"
                value={award.issuer}
                onChange={handleChange}
                placeholder="e.g. Company Inc."
                icon={<Building className="w-4 h-4" />}
                className="input-field-borderless"
             />
          </div>
          
           <Input
              label="Date"
              name="date"
              value={award.date}
              onChange={handleChange}
              placeholder="e.g. 2023"
              icon={<Calendar className="w-4 h-4" />}
              className="input-field-borderless"
           />
           
           <RichTextEditor
              label="Description"
              value={award.description}
              onChange={handleDescriptionChange}
              placeholder="Describe the award and its significance..."
              className="rich-text-container-borderless"
            />
        </div>
      )}
    </div>
  );
};

const SortableAwardItem = ({
  award,
  isOpen,
  onToggle,
}: {
  award: AwardType;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: award.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <AwardItem
        award={award}
        isOpen={isOpen}
        onToggle={onToggle}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export const AwardsForm = () => {
    const { cvData, addAward, moveAward } = useCVStore();
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
      moveAward(String(active.id), String(over.id));
    };

    return (
        <div className="form-container awards-form">
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-base font-semibold tracking-tight text-slate-900">Awards</h3>
                    <p className="text-sm text-slate-500">Highlight your achievements and recognition.</p>
                 </div>
            </div>
            
            {cvData.awards.length === 0 ? (
                <EmptyState
                    icon={<Award className="w-8 h-8" />}
                    title="No awards added yet"
                    description="Add awards to showcase your excellence."
                    action={
                        <button onClick={() => addAward()} className="btn-cta-blue">
                            <Plus className="w-4 h-4" />
                            Add Award
                        </button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={cvData.awards.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                        {cvData.awards.map((award) => (
                          <SortableAwardItem
                            key={award.id}
                            award={award}
                            isOpen={openId === award.id}
                            onToggle={() => handleToggle(award.id)}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                    
                    <button
                        onClick={() => addAward()}
                        className="empty-state-add-btn group"
                    >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Add Another Award
                    </button>
                </div>
            )}
        </div>
    );
};
