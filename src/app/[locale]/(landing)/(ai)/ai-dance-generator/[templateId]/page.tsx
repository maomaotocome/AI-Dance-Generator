import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { envConfigs } from '@/config';
import {
  DANCE_TEMPLATES,
  getDanceTemplateById,
} from '@/config/dance-templates';
import { defaultLocale, locales } from '@/config/locale';
import { DanceGenerator } from '@/shared/blocks/generator';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const revalidate = 3600;

export function generateStaticParams() {
  return DANCE_TEMPLATES.flatMap((template) =>
    locales.map((locale) => ({
      locale,
      templateId: template.id,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; templateId: string }>;
}): Promise<Metadata> {
  const { locale, templateId } = await params;
  const template = getDanceTemplateById(templateId);
  if (!template) return {};

  const appUrl = envConfigs.app_url;
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  const canonicalUrl = `${appUrl}${prefix}/ai-dance-generator/${templateId}`;

  const title = `${template.name} AI Dance Generator - Make Any Photo Dance ${template.name} Style`;
  const description = `${template.description} Upload your photo and create a viral ${template.name} dance video with AI. Free online tool, HD quality, ready for TikTok & Instagram.`;

  return {
    title,
    description,
    keywords: `${template.name} dance, AI ${template.category} dance, ${template.name} dance generator, photo to dance, AI dance video maker`,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        locales.map((l) => {
          const p = l === defaultLocale ? '' : `/${l}`;
          return [l, `${appUrl}${p}/ai-dance-generator/${templateId}`];
        })
      ),
    },
    openGraph: {
      type: 'website',
      locale,
      url: canonicalUrl,
      title,
      description,
      siteName: envConfigs.app_name,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function TemplateLandingPage({
  params,
}: {
  params: Promise<{ locale: string; templateId: string }>;
}) {
  const { locale, templateId } = await params;
  setRequestLocale(locale);

  const template = getDanceTemplateById(templateId);
  if (!template) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${template.name} AI Dance Generator`,
    description: template.description,
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
        title: `${template.name} Dance`,
        description: template.description,
        background_image: {
          src: '/imgs/bg/tree.jpg',
          alt: `${template.name} dance background`,
        },
      },
      generator: {
        component: (
          <DanceGenerator
            templates={DANCE_TEMPLATES}
            initialTemplateId={templateId}
            srOnlyTitle={`Create ${template.name} Dance Video`}
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
    </>
  );
}
