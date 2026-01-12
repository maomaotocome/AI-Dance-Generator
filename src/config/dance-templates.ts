/**
 * Dance Template Configuration
 * Pre-defined dance video templates for AI Dance Generator
 *
 * Templates are organized by category and sorted by popularity.
 * Replace videoUrl and thumbnailUrl with actual cloud storage URLs.
 */

export type DanceCategory = 'tiktok' | 'kpop' | 'hiphop' | 'fun';

export interface DanceTemplate {
  id: string;
  name: string;
  category: DanceCategory;
  description: string;
  videoUrl: string; // Reference video in cloud storage
  thumbnailUrl: string; // Preview thumbnail
  duration: number; // Duration in seconds
  creditCost: number; // Credits required
  popularity: number; // For sorting (higher = more popular)
  trending?: boolean; // Show "Hot" badge
  new?: boolean; // Show "New" badge
}

export const DANCE_CATEGORIES: { value: DanceCategory; label: string }[] = [
  { value: 'tiktok', label: 'TikTok Viral' },
  { value: 'kpop', label: 'K-Pop' },
  { value: 'hiphop', label: 'Hip-Hop' },
  { value: 'fun', label: 'Fun' },
];

/**
 * Dance Templates - Viral 2025 Collection
 *
 * Top trending templates based on market research:
 * - Lil Yachty Walk: 50M+ views on TikTok
 * - Aura Farming: Travis Kelce version hit 14M views
 * - Baby Dance: Dominating TikTok and Instagram
 */
export const DANCE_TEMPLATES: DanceTemplate[] = [
  // ========== TOP VIRAL TEMPLATES ==========

  // Lil Yachty Walkout - The most requested template
  {
    id: 'tiktok-lil-yachty-walk',
    name: 'Lil Yachty Walk',
    category: 'tiktok',
    description: 'The iconic confident swagger from Lyrical Lemonade 2021. Put this walk on anyone for instant comedy.',
    videoUrl: '/videos/templates/lil-yachty-walk.mp4',
    thumbnailUrl: '/imgs/templates/lil-yachty-walk.jpg',
    duration: 8,
    creditCost: 10,
    popularity: 100,
    trending: true,
  },

  // Aura Farming - 2025's hottest trend
  {
    id: 'tiktok-aura-farming',
    name: 'Aura Farming',
    category: 'tiktok',
    description: 'The Indonesian boat dance that Travis Kelce, PSG & millions recreated. Cultivate your aura.',
    videoUrl: '/videos/templates/aura-farming.mp4',
    thumbnailUrl: '/imgs/templates/aura-farming.jpg',
    duration: 8,
    creditCost: 10,
    popularity: 98,
    trending: true,
    new: true,
  },

  // Baby Dance - Universal appeal
  {
    id: 'fun-baby-dance',
    name: 'Baby Bounce',
    category: 'fun',
    description: 'The adorable baby dance taking over TikTok. Perfect for baby photos or anyone you want to look cute.',
    videoUrl: '/videos/templates/baby-dance.mp4',
    thumbnailUrl: '/imgs/templates/baby-dance.jpg',
    duration: 6,
    creditCost: 10,
    popularity: 96,
    trending: true,
  },

  // ========== TIKTOK VIRAL DANCES ==========

  {
    id: 'tiktok-renegade',
    name: 'Renegade',
    category: 'tiktok',
    description: 'The iconic TikTok dance that took the world by storm',
    videoUrl: '/videos/templates/tiktok-renegade.mp4',
    thumbnailUrl: '/imgs/templates/tiktok-renegade.jpg',
    duration: 8,
    creditCost: 10,
    popularity: 90,
  },
  {
    id: 'tiktok-savage',
    name: 'Savage',
    category: 'tiktok',
    description: 'Megan Thee Stallion viral dance challenge',
    videoUrl: '/videos/templates/tiktok-savage.mp4',
    thumbnailUrl: '/imgs/templates/tiktok-savage.jpg',
    duration: 6,
    creditCost: 10,
    popularity: 88,
  },
  {
    id: 'tiktok-blinding-lights',
    name: 'Blinding Lights',
    category: 'tiktok',
    description: 'The Weeknd dance challenge',
    videoUrl: '/videos/templates/tiktok-blinding-lights.mp4',
    thumbnailUrl: '/imgs/templates/tiktok-blinding-lights.jpg',
    duration: 8,
    creditCost: 10,
    popularity: 85,
  },
  {
    id: 'tiktok-tyla-water',
    name: 'Tyla Water Dance',
    category: 'tiktok',
    description: 'The viral water dance from Tyla. Smooth, fluid movements.',
    videoUrl: '/videos/templates/tyla-water.mp4',
    thumbnailUrl: '/imgs/templates/tyla-water.jpg',
    duration: 8,
    creditCost: 10,
    popularity: 92,
    trending: true,
  },

  // ========== K-POP DANCES ==========

  {
    id: 'kpop-blackpink',
    name: 'BLACKPINK Style',
    category: 'kpop',
    description: 'Iconic K-Pop dance moves from BLACKPINK',
    videoUrl: '/videos/templates/kpop-blackpink.mp4',
    thumbnailUrl: '/imgs/templates/kpop-blackpink.jpg',
    duration: 10,
    creditCost: 10,
    popularity: 85,
  },
  {
    id: 'kpop-bts',
    name: 'BTS Style',
    category: 'kpop',
    description: 'Popular BTS-inspired choreography',
    videoUrl: '/videos/templates/kpop-bts.mp4',
    thumbnailUrl: '/imgs/templates/kpop-bts.jpg',
    duration: 8,
    creditCost: 10,
    popularity: 88,
  },
  {
    id: 'kpop-newjeans',
    name: 'NewJeans Style',
    category: 'kpop',
    description: 'Fresh NewJeans-inspired dance moves',
    videoUrl: '/videos/templates/kpop-newjeans.mp4',
    thumbnailUrl: '/imgs/templates/kpop-newjeans.jpg',
    duration: 8,
    creditCost: 10,
    popularity: 86,
    new: true,
  },

  // ========== HIP-HOP DANCES ==========

  {
    id: 'hiphop-groove',
    name: 'Hip-Hop Groove',
    category: 'hiphop',
    description: 'Classic hip-hop dance moves',
    videoUrl: '/videos/templates/hiphop-groove.mp4',
    thumbnailUrl: '/imgs/templates/hiphop-groove.jpg',
    duration: 8,
    creditCost: 10,
    popularity: 75,
  },
  {
    id: 'hiphop-freestyle',
    name: 'Freestyle',
    category: 'hiphop',
    description: 'Smooth freestyle hip-hop moves',
    videoUrl: '/videos/templates/hiphop-freestyle.mp4',
    thumbnailUrl: '/imgs/templates/hiphop-freestyle.jpg',
    duration: 10,
    creditCost: 10,
    popularity: 70,
  },
  {
    id: 'hiphop-moonwalk',
    name: 'Moonwalk',
    category: 'hiphop',
    description: 'The classic moonwalk - make anyone glide like MJ',
    videoUrl: '/videos/templates/hiphop-moonwalk.mp4',
    thumbnailUrl: '/imgs/templates/hiphop-moonwalk.jpg',
    duration: 6,
    creditCost: 10,
    popularity: 78,
  },

  // ========== FUN DANCES ==========

  {
    id: 'fun-shuffle',
    name: 'Shuffle Dance',
    category: 'fun',
    description: 'Energetic shuffle dance moves',
    videoUrl: '/videos/templates/fun-shuffle.mp4',
    thumbnailUrl: '/imgs/templates/fun-shuffle.jpg',
    duration: 6,
    creditCost: 10,
    popularity: 80,
  },
  {
    id: 'fun-robot',
    name: 'Robot Dance',
    category: 'fun',
    description: 'Classic robot dance moves - perfect for unexpected subjects',
    videoUrl: '/videos/templates/fun-robot.mp4',
    thumbnailUrl: '/imgs/templates/fun-robot.jpg',
    duration: 8,
    creditCost: 10,
    popularity: 72,
  },
  {
    id: 'fun-disco',
    name: 'Disco Fever',
    category: 'fun',
    description: 'Retro disco dance moves',
    videoUrl: '/videos/templates/fun-disco.mp4',
    thumbnailUrl: '/imgs/templates/fun-disco.jpg',
    duration: 8,
    creditCost: 10,
    popularity: 65,
  },
  {
    id: 'fun-macarena',
    name: 'Macarena',
    category: 'fun',
    description: 'The timeless party dance - everybody knows it',
    videoUrl: '/videos/templates/fun-macarena.mp4',
    thumbnailUrl: '/imgs/templates/fun-macarena.jpg',
    duration: 10,
    creditCost: 10,
    popularity: 68,
  },
];

/**
 * Get dance template by ID
 */
export function getDanceTemplateById(id: string): DanceTemplate | undefined {
  return DANCE_TEMPLATES.find((template) => template.id === id);
}

/**
 * Get dance templates by category
 * Returns sorted by popularity (highest first)
 */
export function getDanceTemplatesByCategory(
  category?: DanceCategory
): DanceTemplate[] {
  if (!category) {
    return DANCE_TEMPLATES.sort((a, b) => b.popularity - a.popularity);
  }
  return DANCE_TEMPLATES.filter((template) => template.category === category).sort(
    (a, b) => b.popularity - a.popularity
  );
}

/**
 * Get trending dance templates
 */
export function getTrendingTemplates(): DanceTemplate[] {
  return DANCE_TEMPLATES.filter((template) => template.trending).sort(
    (a, b) => b.popularity - a.popularity
  );
}

/**
 * Get new dance templates
 */
export function getNewTemplates(): DanceTemplate[] {
  return DANCE_TEMPLATES.filter((template) => template.new).sort(
    (a, b) => b.popularity - a.popularity
  );
}

/**
 * Get all dance categories with their templates count
 */
export function getDanceCategoriesWithCount(): {
  value: DanceCategory | 'all';
  label: string;
  count: number;
}[] {
  const allCount = DANCE_TEMPLATES.length;
  const categoryCounts = DANCE_CATEGORIES.map((cat) => ({
    ...cat,
    count: DANCE_TEMPLATES.filter((t) => t.category === cat.value).length,
  }));

  return [{ value: 'all' as const, label: 'All Dances', count: allCount }, ...categoryCounts];
}
