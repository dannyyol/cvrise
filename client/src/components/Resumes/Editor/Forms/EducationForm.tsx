import React from 'react';
import { useCVStore } from '../../../../store/useCVStore';
import { Input, Checkbox } from '../../../ui/Form';
import { RichTextEditor } from '../../../ui/RichTextEditor';
import { EmptyState } from '../../../ui/EmptyState';
import { Plus, Trash2, ChevronDown, GraduationCap, Calendar, GripVertical } from 'lucide-react';
import type { Education } from '../../../../types/resume';
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

const EducationItem = ({
  education,
  isOpen,
  onToggle,
  dragHandleProps,
}: {
  education: Education;
  isOpen: boolean;
  onToggle: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) => {
  const { updateEducation, removeEducation } = useCVStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateEducation(education.id, { [name]: value });
  };

  const handleDescriptionChange = (value: string) => {
    updateEducation(education.id, { description: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      updateEducation(education.id, { current: e.target.checked });
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
                <GraduationCap className="w-4 h-4" />
            </div>
            <div>
                <div className="text-sm font-semibold tracking-tight text-slate-900">
                    {education.institution || 'New Education'}
                </div>
                <div className="text-xs text-slate-500">
                    {education.degree ? education.degree : 'Degree'}
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    removeEducation(education.id);
                }}
                className="item-delete-btn"
            >
                <Trash2 className="w-4 h-4" />
            </button>
            <div className={`text-gray-400 p-2 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}>
                <ChevronDown className="w-4 h-4" />
            </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="item-content">
          <div className="form-grid-2">
             <Input
                label="Institution"
                name="institution"
                value={education.institution}
                onChange={handleChange}
                icon={<GraduationCap className="w-4 h-4" />}
                placeholder="e.g. University of Technology"
                className="input-field-borderless"
              />
             <Input
                label="Degree"
                name="degree"
                value={education.degree}
                onChange={handleChange}
                icon={<GraduationCap className="w-4 h-4" />}
                placeholder="e.g. Bachelor of Science"
                className="input-field-borderless"
              />
          </div>

          <Input
            label="Field of Study"
            name="fieldOfStudy"
            value={education.fieldOfStudy}
            onChange={handleChange}
            icon={<GraduationCap className="w-4 h-4" />}
            placeholder="e.g. Computer Science"
            className="input-field-borderless"
          />

           <div className="form-grid-2">
             <Input
                label="Start Date"
                name="startDate"
                placeholder="MM/YYYY"
                value={education.startDate}
                onChange={handleChange}
                icon={<Calendar className="w-4 h-4" />}
                className="input-field-borderless"
              />
             <Input
                label="End Date"
                name="endDate"
                placeholder="MM/YYYY"
                value={education.endDate}
                onChange={handleChange}
                disabled={education.current}
                icon={<Calendar className="w-4 h-4" />}
                className="input-field-borderless"
              />
          </div>
          <Checkbox
            label="I currently study here"
            checked={education.current}
            onChange={handleCheckboxChange}
          />
          
          <RichTextEditor
            label="Description"
            value={education.description}
            onChange={handleDescriptionChange}
            placeholder="Describe your studies, achievements, etc..."
            className="rich-text-container-borderless"
          />
        </div>
      )}
    </div>
  );
};

const SortableEducationItem = ({
  education,
  isOpen,
  onToggle,
}: {
  education: Education;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: education.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <EducationItem
        education={education}
        isOpen={isOpen}
        onToggle={onToggle}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export const EducationForm = () => {
    const { cvData, addEducation, moveEducation } = useCVStore();
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
      moveEducation(String(active.id), String(over.id));
    };

    return (
        <div className="form-container education-form">
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-base font-semibold tracking-tight text-slate-900">Education</h3>
                    <p className="text-sm text-slate-500">Add your educational background.</p>
                 </div>
            </div>
            
            {cvData.education.length === 0 ? (
                <EmptyState
                    icon={<GraduationCap className="w-8 h-8" />}
                    title="No education added yet"
                    description="Add your educational background."
                    action={
                        <button onClick={() => addEducation()} className="btn-cta-blue">
                            <Plus className="w-4 h-4" />
                            Add Education
                        </button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={cvData.education.map((e) => e.id)} strategy={verticalListSortingStrategy}>
                        {cvData.education.map((edu) => (
                          <SortableEducationItem
                            key={edu.id}
                            education={edu}
                            isOpen={openId === edu.id}
                            onToggle={() => handleToggle(edu.id)}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                    
                    <button
                        onClick={() => addEducation()}
                        className="empty-state-add-btn group"
                    >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Add Another Education
                    </button>
                </div>
            )}
        </div>
    );
};
