import React from 'react';
import { useCVStore } from '../../../../store/useCVStore';
import { Plus, Trash2, ChevronDown, Award, Building, Calendar, Link, GripVertical } from 'lucide-react';
import { Input } from '../../../ui/Form';
import { EmptyState } from '../../../ui/EmptyState';
import type { Certification } from '../../../../types/resume';
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

const CertificationItem = ({
  certification,
  isOpen,
  onToggle,
  dragHandleProps,
}: {
  certification: Certification;
  isOpen: boolean;
  onToggle: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) => {
  const { updateCertification, removeCertification } = useCVStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateCertification(certification.id, { [name]: value });
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
                <div className="text-sm font-semibold tracking-tight text-slate-900">{certification.name || 'New Certification'}</div>
                <div className="text-xs text-slate-500">{certification.issuer ? certification.issuer : 'Issuer'}</div>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    removeCertification(certification.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all duration-200"
                title="Delete certification"
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
                label="Certification Name"
                name="name"
                value={certification.name}
                onChange={handleChange}
                placeholder="e.g. AWS Certified Solutions Architect"
                icon={<Award className="w-4 h-4" />}
                className="input-field-borderless"
             />
             <Input
                label="Issuer"
                name="issuer"
                value={certification.issuer}
                onChange={handleChange}
                placeholder="e.g. Amazon Web Services"
                icon={<Building className="w-4 h-4" />}
                className="input-field-borderless"
             />
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input
                label="Date"
                name="date"
                value={certification.issueDate}
                onChange={handleChange}
                placeholder="e.g. 2023"
                icon={<Calendar className="w-4 h-4" />}
               className="input-field-borderless"
             />
             <Input
                label="Expiry Date"
                name="expiryDate"
                value={certification.expiryDate}
                onChange={handleChange}
                placeholder="e.g. 2026"
                icon={<Calendar className="w-4 h-4" />}
               className="input-field-borderless"
             />
          </div>
          <div className="form-grid-2">
             <Input
                label="Credential ID"
                name="credentialId"
                value={certification.credentialId}
                onChange={handleChange}
                placeholder="e.g. AWS-PSA-123"
                icon={<Award className="w-4 h-4" />}
                className="input-field-borderless"
             />
             <Input
                label="Link (Credential URL)"
                name="link"
                value={certification.link}
                onChange={handleChange}
                placeholder="https://..."
                icon={<Link className="w-4 h-4" />}
                className="input-field-borderless"
             />
          </div>
        </div>
      )}
    </div>
  );
};

const SortableCertificationItem = ({
  certification,
  isOpen,
  onToggle,
}: {
  certification: Certification;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: certification.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CertificationItem
        certification={certification}
        isOpen={isOpen}
        onToggle={onToggle}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export const CertificationsForm = () => {
    const { cvData, addCertification, moveCertification } = useCVStore();
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
      moveCertification(String(active.id), String(over.id));
    };

    return (
        <div className="form-container certifications-form">
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-base font-semibold tracking-tight text-slate-900">Certifications</h3>
                    <p className="text-sm text-slate-500">Add your professional certifications and licenses.</p>
                 </div>
            </div>
            
            {cvData.certifications.length === 0 ? (
                <EmptyState
                    icon={<Award className="w-8 h-8" />}
                    title="No certifications added yet"
                    description="Add certifications to validate your skills."
                    action={
                        <button onClick={() => addCertification()} className="btn-cta-blue">
                            <Plus className="w-4 h-4" />
                            Add Certification
                        </button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={cvData.certifications.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                        {cvData.certifications.map((cert) => (
                          <SortableCertificationItem
                            key={cert.id}
                            certification={cert}
                            isOpen={openId === cert.id}
                            onToggle={() => handleToggle(cert.id)}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                    
                    <button
                        onClick={() => addCertification()}
                        className="empty-state-add-btn group"
                    >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Add Another Certification
                    </button>
                </div>
            )}
        </div>
    );
};
