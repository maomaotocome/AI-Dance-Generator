import { MetadataRoute } from 'next';

import { envConfigs } from '@/config';
import { DANCE_TEMPLATES } from '@/config/dance-templates';
import { defaultLocale, locales } from '@/config/locale';
import { SEO_TEMPLATE_PAGES } from '@/config/seo-pages';

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = envConfigs.app_url;

  const corePages = ['', '/ai-dance-generator', '/pricing', '/blog'];

  const entries: MetadataRoute.Sitemap = [];

  for (const page of corePages) {
    for (const locale of locales) {
      const prefix = locale === defaultLocale ? '' : `/${locale}`;
      entries.push({
        url: `${appUrl}${prefix}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority:
          page === '' ? 1.0 : page === '/ai-dance-generator' ? 0.9 : 0.7,
      });
    }
  }

  for (const template of DANCE_TEMPLATES) {
    for (const locale of locales) {
      const prefix = locale === defaultLocale ? '' : `/${locale}`;
      entries.push({
        url: `${appUrl}${prefix}/ai-dance-generator/${template.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  for (const seoPage of SEO_TEMPLATE_PAGES) {
    for (const locale of locales) {
      const prefix = locale === defaultLocale ? '' : `/${locale}`;
      entries.push({
        url: `${appUrl}${prefix}/${seoPage.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: seoPage.priority,
      });
    }
  }

  return entries;
}
