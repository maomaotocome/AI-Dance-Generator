import Link from 'next/link';

import { SEO_TEMPLATE_PAGES } from '@/config/seo-pages';

const PAGE_DISPLAY_NAMES: Record<string, string> = {
  'template/ai-baby-dance': 'AI Baby Dance Generator',
  'template/aura-farming-dance': 'Aura Farming Dance Generator',
  'template/lil-yachty-walk': 'Lil Yachty Walk Generator',
  'template/viggle-alternative': 'Viggle AI Alternative',
  'template/ai-tiktok-dance-generator': 'TikTok Dance Generator',
  'template/ai-wedding-dance-generator': 'Wedding Dance Generator',
  'template/ai-dance-video-maker': 'AI Dance Video Maker',
  'template/make-photo-dance': 'Make Photo Dance',
  'template/hip-hop-dance-generator': 'Hip-Hop Dance Generator',
  'template/kpop-dance-generator': 'K-Pop Dance Generator',
  'template/ai-pet-dance-generator': 'AI Pet Dance Generator',
  'template/ai-sway-dance-filter': 'AI Sway Dance Filter',
  'template/birthday-dance-video-generator': 'Birthday Dance Video Generator',
  'template/ai-dance-generator-free': 'Free AI Dance Generator',
  'template/dreamoai-alternative': 'DreamoAI Alternative',
};

export function SeoPageLinkGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="mb-2 text-center text-2xl font-bold">
        AI Dance Generator Tools
      </h2>
      <p className="text-muted-foreground mb-8 text-center">
        Create viral dance videos for every occasion and style
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {SEO_TEMPLATE_PAGES.map((page) => (
          <Link
            key={page.slug}
            href={`/${page.slug}`}
            className="bg-card group rounded-lg border p-3 transition-shadow hover:shadow-md"
          >
            <span className="group-hover:text-primary text-sm font-medium">
              {PAGE_DISPLAY_NAMES[page.slug] || page.slug}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
