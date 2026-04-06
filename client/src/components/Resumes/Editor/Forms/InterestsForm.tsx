import React from 'react';
import { useCVStore } from '../../../../store/useCVStore';
import { Plus, Trash2, ChevronDown, Heart, GripVertical } from 'lucide-react';
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

const InterestItem = ({
  interest,
  isOpen,
  onToggle,
  dragHandleProps,
}: {
  interest: CustomSectionItem;
  isOpen: boolean;
  onToggle: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) => {
  const { updateInterest, removeInterest } = useCVStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateInterest(interest.id, { [name]: value });
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
                <Heart className="w-4 h-4" />
            </div>
            <div>
                <div className="text-sm font-semibold tracking-tight text-slate-900">{interest.name || 'New Interest'}</div>
            </div>
        </div>
        <div className="item-controls">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    removeInterest(interest.id);
                }}
                className="item-delete-btn"
                title="Delete interest"
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
              label="Interest"
              name="name"
              value={interest.name}
              onChange={handleChange}
              placeholder="e.g. Photography, Hiking"
              icon={<Heart className="w-4 h-4" />}
              className="input-field-borderless"
           />
        </div>
      )}
    </div>
  );
};

const SortableInterestItem = ({
  interest,
  isOpen,
  onToggle,
}: {
  interest: CustomSectionItem;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: interest.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <InterestItem
        interest={interest}
        isOpen={isOpen}
        onToggle={onToggle}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export const InterestsForm = () => {
    const { cvData, addInterest, moveInterest } = useCVStore();
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
        moveInterest(String(active.id), String(over.id));
    };

    return (
        <div className="form-container interests-form">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-base font-semibold tracking-tight text-slate-900">Hobbies & Interests</h3>
                    <p className="text-sm text-slate-500">Add your personal interests.</p>
                </div>
            </div>

            {cvData.interests.length === 0 ? (
                <EmptyState
                    icon={<Heart className="w-8 h-8" />}
                    title="No interests added yet"
                    description="Add hobbies or interests that show personality."
                    action={
                        <button onClick={addInterest} className="btn-cta-blue">
                            <Plus className="w-4 h-4" />
                            Add Interest
                        </button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={cvData.interests.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                            {cvData.interests.map((interest) => (
                                <SortableInterestItem
                                    key={interest.id}
                                    interest={interest}
                                    isOpen={openId === interest.id}
                                    onToggle={() => handleToggle(interest.id)}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    <button onClick={addInterest} className="empty-state-add-btn group">
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Add Another Interest
                    </button>
                </div>
            )}
        </div>
    );
};
