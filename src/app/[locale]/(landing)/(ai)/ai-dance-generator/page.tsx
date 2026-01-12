import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { VideoGenerator } from '@/shared/blocks/generator';
import { getMetadata } from '@/shared/lib/seo';
import { DynamicPage } from '@/shared/types/blocks/landing';

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
          <VideoGenerator
            srOnlyTitle={t.raw('generator.title')}
            i18nNamespace="ai.dance.generator"
            initialTab="video-to-video"
            initialProvider="fal"
            initialModel="fal-ai/kling-video/o1/video-to-video/edit"
            initialPrompt="Keep the same choreography, timing, and camera framing as the input video. Transform the dancer into a cute stylized character, high quality, smooth motion, consistent body."
            allowedTabs={['video-to-video', 'text-to-video']}
            allowReferenceImagesInVideoToVideo
          />
        ),
      },
    },
  };

  const Page = await getThemePage('dynamic-page');

  return <Page locale={locale} page={page} />;
}
