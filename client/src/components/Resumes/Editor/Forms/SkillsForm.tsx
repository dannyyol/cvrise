import { useCVStore } from '../../../../store/useCVStore';
import { Plus, X, Wrench, Code2, GripVertical } from 'lucide-react';
import { Input } from '../../../ui/Form';
import { EmptyState } from '../../../ui/EmptyState';
import type { CSSProperties } from 'react';
import {
    DndContext,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;

const SortableSkillItem = ({
    skill,
    onRemove,
    onUpdate,
}: {
    skill: { id: string; name: string; level: string };
    onRemove: (id: string) => void;
    onUpdate: (id: string, data: { name?: string; level?: string }) => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: skill.id });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : undefined,
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} className="skill-item group">
            <div className="flex items-center gap-3">
                <button
                    ref={setActivatorNodeRef}
                    type="button"
                    className="editor-drag-handle"
                    aria-label="Reorder skill"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="w-4 h-4" />
                </button>
                <div className="flex-1">
                    <Input
                        value={skill.name}
                        onChange={(e) => onUpdate(skill.id, { name: e.target.value })}
                        placeholder="e.g. React, Leadership, Python"
                        icon={<Code2 className="w-4 h-4" />}
                        className="input-field-borderless pr-10"
                    />
                </div>
                <input
                    type="text"
                    list="skill-level-options"
                    value={skill.level}
                    onChange={(e) => onUpdate(skill.id, { level: e.target.value })}
                    placeholder="e.g. Expert, Intermediate, 5/5"
                    className="input-field input-field-borderless w-36"
                />
            </div>
            <button
                onClick={() => onRemove(skill.id)}
                className="skill-delete-btn"
                title="Remove skill"
                type="button"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export const SkillsForm = () => {
    const { cvData, addSkill, removeSkill, updateSkill, moveSkill } = useCVStore();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        moveSkill(String(active.id), String(over.id));
    };

    return (
        <div className="form-container skills-form">
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-base font-semibold tracking-tight text-slate-900">Skills</h3>
                    <p className="text-sm text-slate-500">List your technical and soft skills.</p>
                 </div>
            </div>
            
            {cvData.skills.length === 0 ? (
                <EmptyState
                    icon={<Wrench className="w-8 h-8" />}
                    title="No skills added yet"
                    description="Add skills to showcase your expertise."
                    action={
                        <button onClick={addSkill} className="btn-cta-blue">
                            <Plus className="w-4 h-4" />
                            Add Skill
                        </button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={cvData.skills.map((s) => s.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {cvData.skills.map((skill) => (
                                <SortableSkillItem
                                    key={skill.id}
                                    skill={skill}
                                    onRemove={removeSkill}
                                    onUpdate={updateSkill}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    <datalist id="skill-level-options">
                        {SKILL_LEVELS.map((level) => (
                            <option key={level} value={level} />
                        ))}
                    </datalist>

                    <button
                        onClick={addSkill}
                        className="empty-state-add-btn group"
                    >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Add Another Skill
                    </button>
                </div>
            )}
        </div>
    );
};
