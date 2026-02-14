import Link from 'next/link';

import { SEO_TEMPLATE_PAGES } from '@/config/seo-pages';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

const PAGE_LABELS: Record<string, { en: string; zh: string }> = {
  'template/ai-baby-dance': { en: 'AI Baby Dance', zh: 'AI 宝宝跳舞' },
  'template/aura-farming-dance': {
    en: 'Aura Farming Dance',
    zh: 'Aura 灵气舞蹈',
  },
  'template/lil-yachty-walk': { en: 'Lil Yachty Walk', zh: 'Lil Yachty 走路' },
  'template/viggle-alternative': {
    en: 'Viggle Alternative',
    zh: 'Viggle 替代方案',
  },
  'template/ai-tiktok-dance-generator': {
    en: 'TikTok Dance Generator',
    zh: 'TikTok 舞蹈生成器',
  },
  'template/ai-wedding-dance-generator': {
    en: 'Wedding Dance Generator',
    zh: '婚礼舞蹈生成器',
  },
  'template/ai-dance-video-maker': {
    en: 'Dance Video Maker',
    zh: '舞蹈视频制作',
  },
  'template/make-photo-dance': { en: 'Make Photo Dance', zh: '让照片跳舞' },
  'template/hip-hop-dance-generator': { en: 'Hip-Hop Dance', zh: '嘻哈舞蹈' },
  'template/kpop-dance-generator': { en: 'K-Pop Dance', zh: 'K-Pop 舞蹈' },
  'template/ai-pet-dance-generator': {
    en: 'Pet Dance Generator',
    zh: '宠物跳舞生成器',
  },
  'template/ai-sway-dance-filter': {
    en: 'Sway Dance Filter',
    zh: '摇摆舞蹈滤镜',
  },
  'template/birthday-dance-video-generator': {
    en: 'Birthday Dance Video',
    zh: '生日舞蹈视频',
  },
  'template/ai-dance-generator-free': {
    en: 'Free AI Dance Generator',
    zh: '免费 AI 舞蹈生成器',
  },
  'template/dreamoai-alternative': {
    en: 'DreamoAI Alternative',
    zh: 'DreamoAI 替代方案',
  },
};

export function RelatedPages({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const currentSlug = section.current_slug || '';
  const locale = (section.locale as string) || 'en';

  const pages = SEO_TEMPLATE_PAGES.filter((p) => p.slug !== currentSlug);

  return (
    <section
      id={section.id}
      className={cn('py-16 md:py-24', section.className, className)}
    >
      <div className="container">
        <h2 className="mb-4 text-center text-2xl font-semibold md:text-3xl">
          {section.title}
        </h2>
        {section.description && (
          <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-center">
            {section.description}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {pages.map((page) => {
            const label = PAGE_LABELS[page.slug];
            const displayName = label
              ? locale === 'zh'
                ? label.zh
                : label.en
              : page.slug.split('/').pop()?.replace(/-/g, ' ') || page.slug;

            return (
              <Link
                key={page.slug}
                href={`/${page.slug}`}
                className="bg-card hover:border-primary/50 group rounded-lg border p-3 transition-all hover:shadow-sm"
              >
                <span className="group-hover:text-primary text-sm font-medium">
                  {displayName}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
