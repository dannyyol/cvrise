"use client";

import React from 'react';
import { useCVStore } from '../../../../store/useCVStore';
import { Plus, Trash2, ChevronDown, Briefcase, Building2, Calendar, MapPin, GripVertical } from 'lucide-react';
import { Input, Checkbox } from '../../../ui/Form';
import { RichTextEditor } from '../../../ui/RichTextEditor';
import { EmptyState } from '../../../ui/EmptyState';
import type { WorkExperience } from '../../../../types/resume';
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

const ExperienceItem = ({
  experience,
  isOpen,
  onToggle,
  dragHandleProps,
}: {
  experience: WorkExperience;
  isOpen: boolean;
  onToggle: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) => {
  const { updateExperience, removeExperience } = useCVStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateExperience(experience.id, { [name]: value });
  };

  const handleDescriptionChange = (value: string) => {
    updateExperience(experience.id, { description: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      updateExperience(experience.id, { current: e.target.checked });
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
                <Briefcase className="w-4 h-4" />
            </div>
            <div>
                <div className="text-sm font-semibold tracking-tight text-slate-900">{experience.position || 'New Position'}</div>
                <div className="text-xs text-slate-500">{experience.company ? experience.company : 'Company'}</div>
            </div>
        </div>
        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    removeExperience(experience.id);
                }}
                className="text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all duration-200"
                title="Delete experience"
            >
                <Trash2 className="w-4 h-4" />
            </button>
            <div className={`text-gray-400 transition-transform duration-200 p-2 ${isOpen ? 'transform rotate-180' : ''}`}>
                <ChevronDown className="w-4 h-4" />
            </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="item-content">
          <div className="form-grid-2">
             <Input
                label="Position"
                name="position"
                value={experience.position}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Developer"
                icon={<Briefcase className="w-4 h-4" />}
                className="input-field-borderless"
             />
             <Input
                label="Company"
                name="company"
                value={experience.company}
                onChange={handleChange}
                placeholder="e.g. Tech Corp Inc."
                icon={<Building2 className="w-4 h-4" />}
                className="input-field-borderless"
             />
          </div>

          <Input
            label="Location"
            name="location"
            value={experience.location}
            onChange={handleChange}
            placeholder="e.g. San Francisco, CA"
            icon={<MapPin className="w-4 h-4" />}
            className="input-field-borderless"
          />

           <div className="form-grid-2">
             <Input
                label="Start Date"
                name="startDate"
                placeholder="MM/YYYY"
                value={experience.startDate}
                onChange={handleChange}
                icon={<Calendar className="w-4 h-4" />}
                className="input-field-borderless"
             />
             <Input
                label="End Date"
                name="endDate"
                placeholder="MM/YYYY"
                value={experience.endDate}
                onChange={handleChange}
                disabled={experience.current}
                icon={<Calendar className="w-4 h-4" />}
                className="input-field-borderless"
             />
          </div>
          
          <div className="flex items-center pt-1">
            <Checkbox
                id={`current-exp-${experience.id}`}
                checked={experience.current}
                onChange={handleCheckboxChange}
                label="I currently work here"
            />
          </div>
          
           <RichTextEditor
              label="Description"
              value={experience.description}
              onChange={handleDescriptionChange}
              placeholder="Describe your responsibilities and achievements..."
              className="rich-text-container-borderless"
            />
        </div>
      )}
    </div>
  );
};

const SortableExperienceItem = ({
  experience,
  isOpen,
  onToggle,
}: {
  experience: WorkExperience;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: experience.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ExperienceItem
        experience={experience}
        isOpen={isOpen}
        onToggle={onToggle}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export const ExperienceForm = () => {
    const { cvData, addExperience, moveExperience } = useCVStore();
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
      moveExperience(String(active.id), String(over.id));
    };

    return (
        <div className="form-container experience-form">
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-base font-semibold tracking-tight text-slate-900">Work Experience</h3>
                    <p className="text-sm text-slate-500">Add your professional experience.</p>
                 </div>
            </div>
            
            {cvData.workExperiences.length === 0 ? (
                <EmptyState
                    icon={<Briefcase className="w-8 h-8" />}
                    title="No experience added yet"
                    description="Add your past work positions."
                    action={
                        <button onClick={() => addExperience()} className="btn-cta-blue">
                            <Plus className="w-4 h-4" />
                            Add Experience
                        </button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={cvData.workExperiences.map((e) => e.id)} strategy={verticalListSortingStrategy}>
                        {cvData.workExperiences.map((exp) => (
                          <SortableExperienceItem
                            key={exp.id}
                            experience={exp}
                            isOpen={openId === exp.id}
                            onToggle={() => handleToggle(exp.id)}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                    
                    <button
                        onClick={() => addExperience()}
                        className="empty-state-add-btn group"
                    >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Add Another Position
                    </button>
                </div>
            )}
        </div>
    );
};
