import { useState, useRef, type CSSProperties, type KeyboardEvent, type ClipboardEvent } from 'react';
import { useCVStore } from '../../../../store/useCVStore';
import { Plus, X, Wrench, GripVertical } from 'lucide-react';
import { EmptyState } from '../../../ui/EmptyState';
import type { Skill } from '../../../../types/resume';
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

function parseSkillTokens(raw: string): string[] {
    return raw
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
}

function mergeSkills(existing: string[], incoming: string[]): string[] {
    const seen = new Set(existing.map((i) => i.toLowerCase()));
    const merged = [...existing];
    for (const item of incoming) {
        if (!seen.has(item.toLowerCase())) {
            merged.push(item);
            seen.add(item.toLowerCase());
        }
    }
    return merged;
}

function SkillChipInput({
    items,
    onChange,
}: {
    items: string[];
    onChange: (items: string[]) => void;
}) {
    const [draft, setDraft] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const commit = (raw: string) => {
        const next = parseSkillTokens(raw);
        if (!next.length) return;
        onChange(mergeSkills(items, next));
        setDraft('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commit(draft);
            return;
        }
        if (e.key === 'Backspace' && !draft && items.length) {
            onChange(items.slice(0, -1));
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData('text');
        if (!text || (!text.includes(',') && !text.includes(';') && !text.includes('\n'))) {
            return;
        }
        e.preventDefault();
        commit(`${draft}${text}`);
    };

    return (
        <div
            className="skill-chip-field"
            onClick={() => inputRef.current?.focus()}
            role="group"
            aria-label="Skills"
        >
            {items.map((item) => (
                <span key={item} className="skill-chip">
                    {item}
                    <button
                        type="button"
                        className="skill-chip-remove"
                        aria-label={`Remove ${item}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange(items.filter((i) => i !== item));
                        }}
                    >
                        <X className="w-3 h-3" />
                    </button>
                </span>
            ))}
            <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onBlur={() => {
                    if (draft.trim()) commit(draft);
                }}
                placeholder="Add skill…"
                className="skill-chip-input"
                aria-label="Add skill"
            />
        </div>
    );
}

const SortableSkillGroup = ({
    skill,
    onRemove,
    onUpdate,
}: {
    skill: Skill;
    onRemove: (id: string) => void;
    onUpdate: (id: string, data: Partial<Skill>) => void;
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
        opacity: isDragging ? 0.75 : undefined,
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} className="skill-group">
            <button
                ref={setActivatorNodeRef}
                type="button"
                className="skill-group-drag"
                aria-label="Reorder category"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="w-4 h-4" />
            </button>

            <div className="skill-group-main">
                <div className="skill-group-category-row">
                    <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => onUpdate(skill.id, { name: e.target.value })}
                        placeholder="Category (optional) — e.g. Backend Development"
                        className="skill-category-input"
                        aria-label="Skill category"
                    />
                    <button
                        type="button"
                        onClick={() => onRemove(skill.id)}
                        className="skill-group-remove"
                        title="Remove category"
                    >
                        Remove
                    </button>
                </div>
                <SkillChipInput
                    items={skill.items ?? []}
                    onChange={(items) => onUpdate(skill.id, { items })}
                />
            </div>
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
            <div className="mb-6">
                <h3 className="text-base font-semibold tracking-tight text-slate-900">Skills</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                    Group skills by category. Press Enter or comma to add a skill as a chip.
                </p>
            </div>

            {cvData.skills.length === 0 ? (
                <EmptyState
                    icon={<Wrench className="w-8 h-8" />}
                    title="No skills added yet"
                    description="Add a category and list your skills as chips."
                    action={
                        <button onClick={addSkill} className="btn-cta-blue">
                            <Plus className="w-4 h-4" />
                            Add Category
                        </button>
                    }
                />
            ) : (
                <div className="space-y-3">
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
                                <SortableSkillGroup
                                    key={skill.id}
                                    skill={skill}
                                    onRemove={removeSkill}
                                    onUpdate={updateSkill}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    <button
                        onClick={addSkill}
                        className="skill-add-category-btn group"
                        type="button"
                    >
                        <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Add another category
                    </button>
                </div>
            )}
        </div>
    );
};
