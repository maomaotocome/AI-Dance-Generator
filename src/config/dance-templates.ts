/**
 * Dance Template Configuration
 * Pre-defined dance video templates for AI Dance Generator
 *
 * Using Mixkit CDN videos (100% free for commercial use, no attribution required)
 * Videos are vertical 9:16 format, optimized for TikTok/Reels/Shorts
 */

export type DanceCategory = 'tiktok' | 'kpop' | 'hiphop' | 'fun';

export interface DanceTemplate {
  id: string;
  name: string;
  category: DanceCategory;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  creditCost: number;
  popularity: number;
  trending?: boolean;
  new?: boolean;
}

export const DANCE_CATEGORIES: { value: DanceCategory; label: string }[] = [
  { value: 'tiktok', label: 'TikTok Viral' },
  { value: 'kpop', label: 'K-Pop' },
  { value: 'hiphop', label: 'Hip-Hop' },
  { value: 'fun', label: 'Fun' },
];

/**
 * Dance Templates - Real Video Collection
 * All videos from Mixkit (free commercial license)
 */
export const DANCE_TEMPLATES: DanceTemplate[] = [
  // ========== TRENDING TEMPLATES ==========
  {
    id: 'tiktok-silhouette-dance',
    name: 'Silhouette Groove',
    category: 'tiktok',
    description:
      'Colorful silhouette dance with vibrant neon background. Perfect for dramatic TikTok videos.',
    videoUrl: 'https://assets.mixkit.co/videos/51282/51282-720.mp4',
    thumbnailUrl: '',
    duration: 20,
    creditCost: 10,
    popularity: 100,
    trending: true,
  },
  {
    id: 'tiktok-elegant-dance',
    name: 'Elegant Flow',
    category: 'tiktok',
    description:
      'Graceful dance movements in white attire. Smooth, flowing choreography for elegant content.',
    videoUrl: 'https://assets.mixkit.co/videos/51275/51275-720.mp4',
    thumbnailUrl: '',
    duration: 28,
    creditCost: 10,
    popularity: 98,
    trending: true,
    new: true,
  },
  {
    id: 'fun-happy-dance',
    name: 'Happy Vibes',
    category: 'fun',
    description:
      'Joyful, energetic dance moves that spread happiness. Great for fun, upbeat content.',
    videoUrl: 'https://assets.mixkit.co/videos/34497/34497-720.mp4',
    thumbnailUrl: '',
    duration: 12,
    creditCost: 10,
    popularity: 95,
    trending: true,
  },

  // ========== KPOP STYLE ==========
  {
    id: 'kpop-studio-dance',
    name: 'K-Pop Studio',
    category: 'kpop',
    description:
      'Professional K-Pop style dance in a studio setting. Sharp, synchronized movements.',
    videoUrl: 'https://assets.mixkit.co/videos/42397/42397-720.mp4',
    thumbnailUrl: '',
    duration: 15,
    creditCost: 10,
    popularity: 90,
  },
  {
    id: 'kpop-neon-dance',
    name: 'Neon Pop',
    category: 'kpop',
    description:
      'Dynamic dance with neon lighting effects. Modern K-Pop aesthetic for viral content.',
    videoUrl: 'https://assets.mixkit.co/videos/34540/34540-720.mp4',
    thumbnailUrl: '',
    duration: 10,
    creditCost: 10,
    popularity: 88,
    new: true,
  },

  // ========== HIP-HOP ==========
  {
    id: 'hiphop-street-dance',
    name: 'Street Style',
    category: 'hiphop',
    description:
      'Urban hip-hop dance moves with street vibes. Raw, authentic energy.',
    videoUrl: 'https://assets.mixkit.co/videos/34555/34555-720.mp4',
    thumbnailUrl: '',
    duration: 14,
    creditCost: 10,
    popularity: 85,
  },
  {
    id: 'hiphop-freestyle',
    name: 'Urban Freestyle',
    category: 'hiphop',
    description:
      'Smooth freestyle hip-hop moves. Cool, casual choreography for laid-back content.',
    videoUrl: 'https://assets.mixkit.co/videos/34563/34563-720.mp4',
    thumbnailUrl: '',
    duration: 16,
    creditCost: 10,
    popularity: 82,
  },

  // ========== FUN ==========
  {
    id: 'fun-party-dance',
    name: 'Party Mode',
    category: 'fun',
    description:
      'Fun party dance moves everyone can enjoy. Perfect for celebrations and memes.',
    videoUrl: 'https://assets.mixkit.co/videos/34521/34521-720.mp4',
    thumbnailUrl: '',
    duration: 11,
    creditCost: 10,
    popularity: 80,
  },
];

export function getDanceTemplateById(id: string): DanceTemplate | undefined {
  return DANCE_TEMPLATES.find((template) => template.id === id);
}

export function getDanceTemplatesByCategory(
  category?: DanceCategory
): DanceTemplate[] {
  if (!category) {
    return DANCE_TEMPLATES.sort((a, b) => b.popularity - a.popularity);
  }
  return DANCE_TEMPLATES.filter(
    (template) => template.category === category
  ).sort((a, b) => b.popularity - a.popularity);
}

export function getTrendingTemplates(): DanceTemplate[] {
  return DANCE_TEMPLATES.filter((template) => template.trending).sort(
    (a, b) => b.popularity - a.popularity
  );
}

export function getNewTemplates(): DanceTemplate[] {
  return DANCE_TEMPLATES.filter((template) => template.new).sort(
    (a, b) => b.popularity - a.popularity
  );
}

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

  return [
    { value: 'all' as const, label: 'All Dances', count: allCount },
    ...categoryCounts,
  ];
}
