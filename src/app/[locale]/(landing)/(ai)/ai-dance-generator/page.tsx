import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { DANCE_TEMPLATES } from '@/config/dance-templates';
import { SEO_TEMPLATE_PAGES } from '@/config/seo-pages';
import { DanceGenerator } from '@/shared/blocks/generator';
import { getMetadata } from '@/shared/lib/seo';
import { DynamicPage } from '@/shared/types/blocks/landing';

import { SeoPageLinkGrid } from './seo-page-link-grid';
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

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does the AI Dance Generator work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Upload any photo of a person, baby, or pet. Choose a dance style template, and our AI will generate a realistic dance video in about 30 seconds. The AI uses motion-control technology to animate your photo with the selected dance moves.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the AI Dance Generator free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can try the AI Dance Generator for free with starter credits. Each dance video generation costs 10 credits. Additional credits can be purchased from the pricing page.',
        },
      },
      {
        '@type': 'Question',
        name: 'What types of dance videos can I create?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We offer 20+ dance styles including TikTok viral dances, K-Pop choreography, hip-hop moves, baby dance, pet dance, sway dance filter, wedding first dance, and more. New templates are added regularly.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I make my baby or pet dance with AI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Our AI Baby Dance and Pet Dance templates are specifically designed for baby photos and pet photos. Upload a clear front-facing photo and choose a baby or pet dance template to create adorable viral videos.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the AI sway dance filter?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The AI sway dance filter is a trending effect that makes any photo gently sway and dance. It went viral on TikTok and Instagram. Our Gentle Sway, Romantic Sway, and Sway Filter templates recreate this popular effect.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does it take to generate a dance video?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most dance videos are generated in 30-60 seconds. The AI processes your photo and applies the dance motion in real-time. You can download the HD video immediately after generation.',
        },
      },
    ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Page locale={locale} page={page} />
      <TemplateLinkGrid templates={DANCE_TEMPLATES} />
      <SeoPageLinkGrid />
    </>
  );
}
