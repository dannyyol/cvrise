import React from 'react';
import { useCVStore } from '../../../../store/useCVStore';
import { Plus, Trash2, ChevronDown, Link as LinkIcon, GripVertical } from 'lucide-react';
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

const WebsiteItem = ({
  website,
  isOpen,
  onToggle,
  dragHandleProps,
}: {
  website: CustomSectionItem;
  isOpen: boolean;
  onToggle: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) => {
  const { updateWebsite, removeWebsite } = useCVStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateWebsite(website.id, { [name]: value });
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
                <LinkIcon className="w-4 h-4" />
            </div>
            <div>
                <div className="text-sm font-semibold tracking-tight text-slate-900">{website.name || 'New Link'}</div>
                <div className="text-xs text-slate-500">{website.url ? website.url : 'URL'}</div>
            </div>
        </div>
        <div className="item-controls">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    removeWebsite(website.id);
                }}
                className="item-delete-btn"
                title="Delete website"
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
              label="Label"
              name="name"
              value={website.name}
              onChange={handleChange}
              placeholder="e.g. LinkedIn, Portfolio"
              icon={<LinkIcon className="w-4 h-4" />}
              className="input-field-borderless"
           />
           
           <Input
              label="URL"
              name="url"
              value={website.url}
              onChange={handleChange}
              placeholder="e.g. https://linkedin.com/in/me"
              className="input-field-borderless"
           />
        </div>
      )}
    </div>
  );
};

const SortableWebsiteItem = ({
  website,
  isOpen,
  onToggle,
}: {
  website: CustomSectionItem;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: website.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <WebsiteItem
        website={website}
        isOpen={isOpen}
        onToggle={onToggle}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export const WebsitesForm = () => {
    const { cvData, addWebsite, moveWebsite } = useCVStore();
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
        moveWebsite(String(active.id), String(over.id));
    };

    return (
        <div className="form-container websites-form">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-base font-semibold tracking-tight text-slate-900">Websites & Social Links</h3>
                    <p className="text-sm text-slate-500">Add links to your profiles.</p>
                </div>
            </div>

            {cvData.websites.length === 0 ? (
                <EmptyState
                    icon={<LinkIcon className="w-8 h-8" />}
                    title="No links added yet"
                    description="Add your portfolio and social profiles."
                    action={
                        <button onClick={addWebsite} className="btn-cta-blue">
                            <Plus className="w-4 h-4" />
                            Add Link
                        </button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={cvData.websites.map((w) => w.id)} strategy={verticalListSortingStrategy}>
                            {cvData.websites.map((website) => (
                                <SortableWebsiteItem
                                    key={website.id}
                                    website={website}
                                    isOpen={openId === website.id}
                                    onToggle={() => handleToggle(website.id)}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    <button onClick={addWebsite} className="empty-state-add-btn group">
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Add Another Link
                    </button>
                </div>
            )}
        </div>
    );
};
