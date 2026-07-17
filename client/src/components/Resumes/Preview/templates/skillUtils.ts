import type { Skill } from '@/src/types/resume';
import { formatSkillGroupText, skillHasContent } from '@/src/lib/skills';

export { formatSkillGroupText, skillHasContent };

/** Visible skill groups for template rendering. */
export function visibleSkills(skills: Skill[] | undefined | null): Skill[] {
  return (skills ?? []).filter(skillHasContent);
}

/** Split skill groups into N columns (column-major). */
export function skillColumns(skills: Skill[], cols: number): Skill[][] {
  const list = visibleSkills(skills);
  if (!list.length) return [];
  const columnCount = Math.max(1, cols);
  const rows = Math.ceil(list.length / columnCount);
  return Array.from({ length: columnCount }, (_, i) =>
    list.slice(i * rows, (i + 1) * rows)
  ).filter((col) => col.length > 0);
}

/** Render helpers for category + comma-joined items. */
export function skillCategory(skill: Skill): string {
  return (skill.name?.trim() ?? '').replace(/:\s*$/, '');
}

export function skillItemsText(skill: Skill): string {
  const items = (skill.items ?? []).map((i) => i.trim()).filter(Boolean);
  if (items.length) return items.join(', ');
  // Legacy fallback if items empty but name was a single skill before migrate
  return '';
}
