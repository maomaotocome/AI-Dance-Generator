import { envConfigs } from '@/config';
import {
  getFAQSchema,
  getHowToSchema,
  getOrganizationSchema,
  getSoftwareApplicationSchema,
  getWebSiteSchema,
  StructuredData,
} from '@/shared/components/seo/structured-data';

interface HomepageStructuredDataProps {
  locale?: string;
  faqItems?: Array<{ question: string; answer: string }>;
}

export function HomepageStructuredData({
  locale = 'en',
  faqItems,
}: HomepageStructuredDataProps) {
  const appUrl = envConfigs.app_url || 'https://www.aidancegenerator.io';
  const appName = envConfigs.app_name || 'AI Dance Generator';

  const schemas: Record<string, unknown>[] = [
    getOrganizationSchema({
      name: appName,
      url: appUrl,
      logo: `${appUrl}/logo.png`,
      description:
        'AI Dance Generator transforms any photo into viral dance videos. Create TikTok-ready dancing videos in seconds using AI technology.',
      sameAs: [
        'https://twitter.com/aidancegenerator',
        'https://www.youtube.com/@aidancegenerator',
        'https://www.tiktok.com/@aidancegenerator',
      ],
    }),

    getWebSiteSchema({
      name: appName,
      url: appUrl,
      description:
        'Transform any photo into viral dance videos with AI. Create TikTok-ready dancing videos in seconds.',
    }),

    getSoftwareApplicationSchema({
      name: appName,
      url: appUrl,
      description:
        'AI-powered dance video generator. Upload any photo and create viral dancing videos for TikTok, Instagram Reels, and YouTube Shorts.',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web',
      offers: {
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        ratingValue: 4.9,
        reviewCount: 12847,
      },
      featureList: [
        'Transform any photo into dancing video',
        'Trending TikTok dance templates',
        'K-Pop choreography styles',
        'No watermark HD export',
        '30-second video generation',
        'Vertical 9:16 format for social media',
      ],
    }),

    getHowToSchema({
      name: 'How to Create AI Dance Videos',
      description:
        'Learn how to transform any photo into a viral dance video using AI Dance Generator in 3 simple steps.',
      image: `${appUrl}/imgs/features/dance-demo.png`,
      totalTime: 'PT1M',
      estimatedCost: {
        value: '0',
        currency: 'USD',
      },
      steps: [
        {
          name: 'Upload Your Photo',
          text: 'Upload any photo - selfie, pet, baby, anime character, or even a historical figure. Front-facing photos work best for optimal results.',
          image: `${appUrl}/imgs/steps/upload.png`,
          url: `${appUrl}#generator`,
        },
        {
          name: 'Pick a Trending Dance',
          text: 'Choose from viral TikTok dances, K-Pop choreography, Aura farming, or hip-hop moves. Our dance library is updated weekly with the latest trends.',
          image: `${appUrl}/imgs/steps/select.png`,
          url: `${appUrl}#generator`,
        },
        {
          name: 'Download & Share',
          text: 'Get your HD video in 30-60 seconds. No watermark. Ready for TikTok, Instagram Reels, and YouTube Shorts. Download and go viral!',
          image: `${appUrl}/imgs/steps/generate.png`,
          url: `${appUrl}#generator`,
        },
      ],
    }),
  ];

  if (faqItems && faqItems.length > 0) {
    schemas.push(getFAQSchema(faqItems));
  }

  return <StructuredData data={schemas} />;
}
