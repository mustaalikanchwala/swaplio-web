// Category theme configuration
// Maps category slug → visual theme for BackgroundSection + ProductSection

export interface CategoryTheme {
  gradient: string;           // CSS gradient for section background
  accentColor: string;        // Hex color for accents, borders, and CTA
  accentRgb: string;          // RGB triplet for rgba() usage
  icon: string;               // Emoji icon representing the category
  patternColor: string;       // Subtle decorative pattern color
  chipClass: string;          // Tailwind classes for the category chip
  glowColor: string;          // CSS box-shadow glow color
}

const THEMES: Record<string, CategoryTheme> = {
  textbooks: {
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(99,102,241,0.10) 100%)',
    accentColor: '#8b5cf6',
    accentRgb: '139, 92, 246',
    icon: '📚',
    patternColor: 'rgba(139,92,246,0.06)',
    chipClass: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    glowColor: 'rgba(139, 92, 246, 0.25)',
  },
  notes: {
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.18) 0%, rgba(14,165,233,0.10) 100%)',
    accentColor: '#06b6d4',
    accentRgb: '6, 182, 212',
    icon: '📝',
    patternColor: 'rgba(6,182,212,0.06)',
    chipClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    glowColor: 'rgba(6, 182, 212, 0.25)',
  },
  'lab-equipment': {
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(5,150,105,0.10) 100%)',
    accentColor: '#10b981',
    accentRgb: '16, 185, 129',
    icon: '🔬',
    patternColor: 'rgba(16,185,129,0.06)',
    chipClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    glowColor: 'rgba(16, 185, 129, 0.25)',
  },
  electronics: {
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(234,179,8,0.10) 100%)',
    accentColor: '#f59e0b',
    accentRgb: '245, 158, 11',
    icon: '💻',
    patternColor: 'rgba(245,158,11,0.06)',
    chipClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    glowColor: 'rgba(245, 158, 11, 0.25)',
  },
  stationery: {
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.18) 0%, rgba(244,63,94,0.10) 100%)',
    accentColor: '#ec4899',
    accentRgb: '236, 72, 153',
    icon: '✏️',
    patternColor: 'rgba(236,72,153,0.06)',
    chipClass: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    glowColor: 'rgba(236, 72, 153, 0.25)',
  },
  clothing: {
    gradient: 'linear-gradient(135deg, rgba(251,146,60,0.18) 0%, rgba(239,68,68,0.10) 100%)',
    accentColor: '#fb923c',
    accentRgb: '251, 146, 60',
    icon: '👕',
    patternColor: 'rgba(251,146,60,0.06)',
    chipClass: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    glowColor: 'rgba(251, 146, 60, 0.25)',
  },
  sports: {
    gradient: 'linear-gradient(135deg, rgba(132,204,22,0.18) 0%, rgba(101,163,13,0.10) 100%)',
    accentColor: '#84cc16',
    accentRgb: '132, 204, 22',
    icon: '⚽',
    patternColor: 'rgba(132,204,22,0.06)',
    chipClass: 'bg-lime-500/15 text-lime-300 border-lime-500/30',
    glowColor: 'rgba(132, 204, 22, 0.25)',
  },
  default: {
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(236,72,153,0.08) 100%)',
    accentColor: '#8b5cf6',
    accentRgb: '139, 92, 246',
    icon: '🛍️',
    patternColor: 'rgba(139,92,246,0.05)',
    chipClass: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    glowColor: 'rgba(139, 92, 246, 0.20)',
  },
};

export function getCategoryTheme(slug?: string): CategoryTheme {
  if (!slug) return THEMES.default;
  const key = slug.toLowerCase().replace(/\s+/g, '-');
  return THEMES[key] ?? THEMES.default;
}
