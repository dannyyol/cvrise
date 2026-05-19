"use client";

import { useState, useMemo } from 'react';
import {
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useCVStore } from '@/src/store/useCVStore';
import { ADDITIONAL_SECTIONS, DEFAULT_SECTIONS } from './sectionConfig';

export function useEditorSections() {
  const { cvData, selectedTemplate, templates, setSections } = useCVStore();

  const [collapsedSectionIds, setCollapsedSectionIds] = useState<string[]>([]);
  const [showAdditionalSections, setShowAdditionalSections] = useState(false);

  const sidebarSectionKeys = useMemo(() => {
    const template = templates.find((t) => t.key === selectedTemplate);
    return template?.sidebar_section_keys ?? [];
  }, [templates, selectedTemplate]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeSection = cvData.sections.find((s) => s.id === active.id);
    const overSection = cvData.sections.find((s) => s.id === over.id);
    if (!activeSection || !overSection) return;

    if (sidebarSectionKeys.length > 0) {
      const activeIsSidebar = sidebarSectionKeys.includes(activeSection.type);
      const overIsSidebar = sidebarSectionKeys.includes(overSection.type);
      if (activeIsSidebar !== overIsSidebar) return;
    }

    const oldIndex = cvData.sections.findIndex((s) => s.id === active.id);
    const newIndex = cvData.sections.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    setSections(
      arrayMove(cvData.sections, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }))
    );
  };

  const handleToggle = (id: string) => {
    setCollapsedSectionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const orderedEditorSections = cvData.sections
    .filter(
      (s) =>
        DEFAULT_SECTIONS.includes(s.type as (typeof DEFAULT_SECTIONS)[number]) ||
        (ADDITIONAL_SECTIONS.includes(s.type as (typeof ADDITIONAL_SECTIONS)[number]) && s.isVisible)
    )
    .sort((a, b) => a.order - b.order);

  const mainEditorSections = orderedEditorSections.filter(
    (s) => !sidebarSectionKeys.includes(s.type)
  );
  const sidebarEditorSections = orderedEditorSections.filter((s) =>
    sidebarSectionKeys.includes(s.type)
  );
  const combinedEditorSections =
    sidebarSectionKeys.length > 0
      ? [...mainEditorSections, ...sidebarEditorSections]
      : orderedEditorSections;

  const hasVisibleAdditionalSections = cvData.sections.some(
    (s) => ADDITIONAL_SECTIONS.includes(s.type as (typeof ADDITIONAL_SECTIONS)[number]) && s.isVisible
  );
  const availableSectionsList = cvData.sections.filter(
    (s) => ADDITIONAL_SECTIONS.includes(s.type as (typeof ADDITIONAL_SECTIONS)[number]) && !s.isVisible
  );

  return {
    sensors,
    sidebarSectionKeys,
    collapsedSectionIds,
    showAdditionalSections,
    setShowAdditionalSections,
    handleDragEnd,
    handleToggle,
    mainEditorSections,
    sidebarEditorSections,
    combinedEditorSections,
    hasVisibleAdditionalSections,
    availableSectionsList,
  };
}
