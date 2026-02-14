import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { DANCE_TEMPLATES } from '@/config/dance-templates';
import { DanceGenerator } from '@/shared/blocks/generator';
import { getMetadata } from '@/shared/lib/seo';
import { DynamicPage } from '@/shared/types/blocks/landing';

import { TemplateLinkGrid } from './template-link-grid';

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'ai.dance.metadata',
  canonicalUrl: '/ai-dance-generator',
});

export default async function AiDanceGeneratorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('ai.dance');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AI Dance Generator',
    description: t.raw('page.description'),
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const page: DynamicPage = {
    sections: {
      hero: {
        title: t.raw('page.title'),
        description: t.raw('page.description'),
        background_image: {
          src: '/imgs/bg/tree.jpg',
          alt: 'hero background',
        },
      },
      generator: {
        component: (
          <DanceGenerator
            templates={DANCE_TEMPLATES}
            srOnlyTitle={t.raw('generator.title')}
          />
        ),
      },
    },
  };

  const Page = await getThemePage('dynamic-page');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Page locale={locale} page={page} />
      <TemplateLinkGrid templates={DANCE_TEMPLATES} />
    </>
  );
}
