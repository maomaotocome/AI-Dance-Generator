import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { HomepageStructuredData } from '@/shared/components/seo';
import { getMetadata } from '@/shared/lib/seo';
import { DynamicPage, FAQItem } from '@/shared/types/blocks/landing';

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'pages.index.metadata',
  canonicalUrl: '/',
});

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.index');

  const page: DynamicPage = t.raw('page');

  const faqSection = page.sections?.faq as { items?: FAQItem[] } | undefined;
  const faqItems = faqSection?.items
    ?.filter((item): item is FAQItem & { question: string; answer: string } =>
      Boolean(item.question && item.answer)
    )
    .map((item) => ({
      question: item.question,
      answer: item.answer,
    }));

  const Page = await getThemePage('dynamic-page');

  return (
    <>
      <HomepageStructuredData locale={locale} faqItems={faqItems} />
      <Page locale={locale} page={page} />
    </>
  );
}
