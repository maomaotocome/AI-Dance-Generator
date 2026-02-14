/**
 * Dance Template Configuration
 * Pre-defined dance video templates for AI Dance Generator
 *
 * Using Mixkit CDN videos (100% free for commercial use, no attribution required)
 * Videos are vertical 9:16 format, optimized for TikTok/Reels/Shorts
 */

export type DanceCategory =
  | 'tiktok'
  | 'kpop'
  | 'hiphop'
  | 'fun'
  | 'baby'
  | 'pet'
  | 'wedding'
  | 'sway';

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
  useCount?: string;
}

export const DANCE_CATEGORIES: { value: DanceCategory; label: string }[] = [
  { value: 'tiktok', label: 'TikTok Viral' },
  { value: 'kpop', label: 'K-Pop' },
  { value: 'hiphop', label: 'Hip-Hop' },
  { value: 'fun', label: 'Fun' },
  { value: 'baby', label: 'Baby Dance' },
  { value: 'pet', label: 'Pet Dance' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'sway', label: 'Sway' },
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

  // ========== BABY DANCE ==========
  {
    id: 'baby-sway-dance',
    name: 'Baby Sway',
    category: 'baby',
    description:
      'Adorable baby sway dance moves. Turn any baby photo into a cute dancing video that goes viral on TikTok.',
    videoUrl: 'https://assets.mixkit.co/videos/34497/34497-720.mp4',
    thumbnailUrl: '',
    duration: 10,
    creditCost: 10,
    popularity: 97,
    trending: true,
    new: true,
  },
  {
    id: 'baby-bounce-dance',
    name: 'Baby Bounce',
    category: 'baby',
    description:
      'Cute bouncing baby dance effect. Perfect for making adorable AI baby dance videos from any photo.',
    videoUrl: 'https://assets.mixkit.co/videos/51275/51275-720.mp4',
    thumbnailUrl: '',
    duration: 12,
    creditCost: 10,
    popularity: 94,
    trending: true,
  },
  {
    id: 'baby-wiggle-dance',
    name: 'Baby Wiggle',
    category: 'baby',
    description:
      'Playful wiggle dance for babies and toddlers. Create the cutest AI dancing baby video in seconds.',
    videoUrl: 'https://assets.mixkit.co/videos/34521/34521-720.mp4',
    thumbnailUrl: '',
    duration: 8,
    creditCost: 10,
    popularity: 91,
    new: true,
  },

  // ========== PET DANCE ==========
  {
    id: 'pet-dance-groove',
    name: 'Pet Groove',
    category: 'pet',
    description:
      'Make your pet dance with AI. Upload any cat or dog photo and watch them groove to viral dance moves.',
    videoUrl: 'https://assets.mixkit.co/videos/34540/34540-720.mp4',
    thumbnailUrl: '',
    duration: 10,
    creditCost: 10,
    popularity: 93,
    trending: true,
    new: true,
  },
  {
    id: 'pet-dance-shake',
    name: 'Pet Shake',
    category: 'pet',
    description:
      'Funny pet shake dance effect. Turn your dog or cat photo into a hilarious dancing pet video.',
    videoUrl: 'https://assets.mixkit.co/videos/42397/42397-720.mp4',
    thumbnailUrl: '',
    duration: 12,
    creditCost: 10,
    popularity: 89,
    trending: true,
  },
  {
    id: 'pet-dance-spin',
    name: 'Pet Spin',
    category: 'pet',
    description:
      'Adorable spinning dance for pets. Create viral AI pet dance videos from any animal photo.',
    videoUrl: 'https://assets.mixkit.co/videos/34555/34555-720.mp4',
    thumbnailUrl: '',
    duration: 8,
    creditCost: 10,
    popularity: 84,
  },

  // ========== SWAY DANCE ==========
  {
    id: 'sway-gentle-dance',
    name: 'Gentle Sway',
    category: 'sway',
    description:
      'Smooth, gentle swaying motion. The viral AI sway dance filter effect for TikTok and Instagram Reels.',
    videoUrl: 'https://assets.mixkit.co/videos/51282/51282-720.mp4',
    thumbnailUrl: '',
    duration: 15,
    creditCost: 10,
    popularity: 96,
    trending: true,
    new: true,
  },
  {
    id: 'sway-romantic-dance',
    name: 'Romantic Sway',
    category: 'sway',
    description:
      'Elegant romantic swaying dance. Perfect for couples photos and wedding content with the AI sway effect.',
    videoUrl: 'https://assets.mixkit.co/videos/51275/51275-720.mp4',
    thumbnailUrl: '',
    duration: 20,
    creditCost: 10,
    popularity: 92,
    trending: true,
  },
  {
    id: 'sway-dance-filter',
    name: 'Sway Filter',
    category: 'sway',
    description:
      'The trending AI sway dance filter. Make any photo sway and dance like the viral TikTok effect.',
    videoUrl: 'https://assets.mixkit.co/videos/34563/34563-720.mp4',
    thumbnailUrl: '',
    duration: 12,
    creditCost: 10,
    popularity: 87,
    new: true,
  },

  // ========== WEDDING ==========
  {
    id: 'wedding-first-dance',
    name: 'First Dance',
    category: 'wedding',
    description:
      'Elegant first dance choreography for weddings. Create a beautiful AI wedding dance video from your photo.',
    videoUrl: 'https://assets.mixkit.co/videos/51275/51275-720.mp4',
    thumbnailUrl: '',
    duration: 25,
    creditCost: 10,
    popularity: 88,
    new: true,
  },
  {
    id: 'wedding-waltz-dance',
    name: 'Wedding Waltz',
    category: 'wedding',
    description:
      'Classic waltz dance for wedding videos. Transform any couple photo into a graceful dancing video.',
    videoUrl: 'https://assets.mixkit.co/videos/51282/51282-720.mp4',
    thumbnailUrl: '',
    duration: 20,
    creditCost: 10,
    popularity: 83,
  },

  // ========== MORE TIKTOK VIRAL ==========
  {
    id: 'tiktok-shuffle-dance',
    name: 'Shuffle Dance',
    category: 'tiktok',
    description:
      'The viral TikTok shuffle dance. Fast footwork and smooth transitions for maximum engagement.',
    videoUrl: 'https://assets.mixkit.co/videos/34555/34555-720.mp4',
    thumbnailUrl: '',
    duration: 15,
    creditCost: 10,
    popularity: 86,
    new: true,
  },
  {
    id: 'tiktok-challenge-dance',
    name: 'Dance Challenge',
    category: 'tiktok',
    description:
      'Trending TikTok dance challenge moves. Join the latest viral dance trend with AI-generated videos.',
    videoUrl: 'https://assets.mixkit.co/videos/34540/34540-720.mp4',
    thumbnailUrl: '',
    duration: 12,
    creditCost: 10,
    popularity: 81,
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
