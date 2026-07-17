import type { Skill } from '../types/resume';

const PROFICIENCY_RE =
  /^(beginner|intermediate|advanced|expert|familiar|good|native|fluent|proficient|basic|novice)(\s*[-–/]\s*\w+)?$/i;
const RATING_RE = /^\d+\s*\/\s*\d+$/;

function splitItems(value: string): string[] {
  return value
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function looksLikeProficiency(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  return PROFICIENCY_RE.test(v) || RATING_RE.test(v);
}

/** Migrate legacy `{ name, level }` skills into `{ name, items, level }`. */
export function normalizeSkill(raw: unknown): Skill {
  const record = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const id = String(record.id ?? (typeof crypto !== 'undefined' ? crypto.randomUUID() : `skill-${Date.now()}`));
  const levelRaw = String(record.level ?? '').trim();

  if (Array.isArray(record.items)) {
    return {
      id,
      name: String(record.name ?? '').trim(),
      items: record.items.map((item) => String(item).trim()).filter(Boolean),
      level: levelRaw,
    };
  }

  const name = String(record.name ?? '').trim();

  // Category in name, comma-separated skills stored in level
  if (
    name &&
    levelRaw &&
    !looksLikeProficiency(levelRaw) &&
    (levelRaw.includes(',') || levelRaw.includes(';') || levelRaw.split(/\s+/).length > 3)
  ) {
    return { id, name, items: splitItems(levelRaw), level: '' };
  }

  // Comma-separated skills in name → uncategorized group
  if (name.includes(',') || name.includes(';')) {
    return { id, name: '', items: splitItems(name), level: looksLikeProficiency(levelRaw) ? levelRaw : '' };
  }

  // Single legacy skill
  return {
    id,
    name: '',
    items: name ? [name] : [],
    level: looksLikeProficiency(levelRaw) ? levelRaw : levelRaw,
  };
}

export function normalizeSkills(skills: unknown): Skill[] {
  if (!Array.isArray(skills)) return [];
  return skills.map(normalizeSkill).filter((s) => s.items.length > 0 || s.name.length > 0);
}

/** Plain-text line for AI flatteners / ATS text. */
export function formatSkillGroupText(skill: Skill): string {
  const category = skill.name?.trim() ?? '';
  const items = (skill.items ?? []).map((i) => i.trim()).filter(Boolean);
  const level = skill.level?.trim() ?? '';

  if (category && items.length) {
    const body = items.join(', ');
    return level ? `${category}: ${body} (${level})` : `${category}: ${body}`;
  }
  if (items.length) {
    const body = items.join(', ');
    return level ? `${body} (${level})` : body;
  }
  if (category) {
    return level ? `${category} (${level})` : category;
  }
  return '';
}

export function skillHasContent(skill: Skill): boolean {
  return Boolean(skill.name?.trim() || (skill.items?.length ?? 0) > 0);
}
