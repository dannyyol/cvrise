import React from 'react';
import { useCVStore } from '../../../../store/useCVStore';
import { Plus, Trash2, ChevronDown, FolderGit2, Link, Code2, Calendar, GripVertical } from 'lucide-react';
import { Input } from '../../../ui/Form';
import { Button } from '../../../ui/Button';
import { RichTextEditor } from '../../../ui/RichTextEditor';
import { EmptyState } from '../../../ui/EmptyState';
import type { Project } from '../../../../types/resume';
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

const ProjectItem = ({
  project,
  isOpen,
  onToggle,
  dragHandleProps,
}: {
  project: Project;
  isOpen: boolean;
  onToggle: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) => {
  const { updateProject, removeProject } = useCVStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateProject(project.id, { [name]: value });
  };

  const handleDescriptionChange = (value: string) => {
    updateProject(project.id, { description: value });
  };

  return (
    <div className="project-card">
      <div 
        className="project-header"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
             <button
               type="button"
               onClick={(e) => e.stopPropagation()}
               className="text-gray-300 hover:text-gray-500 p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-grab active:cursor-grabbing"
               title="Drag to reorder"
               {...dragHandleProps}
             >
               <GripVertical className="w-4 h-4" />
             </button>
             <div className="project-icon-container">
                <FolderGit2 className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold tracking-tight text-slate-900">
              {project.name || 'New Project'}
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    removeProject(project.id);
                }}
                className="project-delete-btn"
                title="Delete project"
            >
                <Trash2 className="w-4 h-4" />
            </button>
            <div className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}>
                <ChevronDown className="w-4 h-4" />
            </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="project-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input
                label="Project Name"
                name="name"
                value={project.name}
                onChange={handleChange}
                placeholder="e.g. E-commerce Platform"
                icon={<FolderGit2 className="w-4 h-4" />}
                className="input-field-borderless"
             />
             <Input
                label="Link"
                name="link"
                value={project.link}
                onChange={handleChange}
                placeholder="https://github.com/..."
                icon={<Link className="w-4 h-4" />}
                className="input-field-borderless"
             />
          </div>

          <div className="form-grid-2">
             <Input
                label="Start Date"
                name="startDate"
                placeholder="MM/YYYY"
                value={project.startDate}
                onChange={handleChange}
                icon={<Calendar className="w-4 h-4" />}
                className="input-field-borderless"
             />
             <Input
                label="End Date"
                name="endDate"
                placeholder="MM/YYYY"
                value={project.endDate}
                onChange={handleChange}
                icon={<Calendar className="w-4 h-4" />}
                className="input-field-borderless"
             />
          </div>
          
           <Input
              label="Technologies (comma separated)"
              value={project.technologies.join(', ')}
              onChange={(e) => updateProject(project.id, { technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              placeholder="e.g. React, Node.js, MongoDB"
              icon={<Code2 className="w-4 h-4" />}
              className="input-field-borderless"
           />
           
           <RichTextEditor
              label="Description"
              value={project.description}
              onChange={handleDescriptionChange}
              placeholder="Describe the project and your role..."
              className="rich-text-container-borderless"
            />
        </div>
      )}
    </div>
  );
};

const SortableProjectItem = ({
  project,
  isOpen,
  onToggle,
}: {
  project: Project;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ProjectItem
        project={project}
        isOpen={isOpen}
        onToggle={onToggle}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export const ProjectsForm = () => {
    const { cvData, addProject, moveProject } = useCVStore();
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
      moveProject(String(active.id), String(over.id));
    };

    return (
        <div className="form-container projects-form">
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-base font-semibold tracking-tight text-slate-900">Projects</h3>
                    <p className="text-sm text-slate-500">Showcase your personal or professional projects.</p>
                 </div>
            </div>
            
            {cvData.projects.length === 0 ? (
                <EmptyState
                    icon={<FolderGit2 className="w-8 h-8" />}
                    title="No projects added yet"
                    description="Add projects to demonstrate your practical skills."
                    action={
                        <Button
                            onClick={() => addProject()}
                            variant="primary"
                            leftIcon={<Plus className="w-4 h-4" />}
                        >
                            Add Project
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={cvData.projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                        {cvData.projects.map((proj) => (
                          <SortableProjectItem
                            key={proj.id}
                            project={proj}
                            isOpen={openId === proj.id}
                            onToggle={() => handleToggle(proj.id)}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                    
                    <Button
                        onClick={() => addProject()}
                        variant="ghost"
                        className="empty-state-add-btn h-auto group"
                        leftIcon={<Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                    >
                        Add Another Project
                    </Button>
                </div>
            )}
        </div>
    );
};
