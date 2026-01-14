'use client';

interface StructuredDataProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function StructuredData({ data }: StructuredDataProps) {
  const jsonLd = Array.isArray(data) ? data : [data];

  return (
    <>
      {jsonLd.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}

// Organization schema
export function getOrganizationSchema(options: {
  name: string;
  url: string;
  logo: string;
  description?: string;
  sameAs?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: options.name,
    url: options.url,
    logo: options.logo,
    description: options.description,
    sameAs: options.sameAs || [],
  };
}

// WebSite schema with SearchAction
export function getWebSiteSchema(options: {
  name: string;
  url: string;
  description: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: options.name,
    url: options.url,
    description: options.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${options.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// WebApplication schema for AI tools
export function getWebApplicationSchema(options: {
  name: string;
  url: string;
  description: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  screenshot?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: options.name,
    url: options.url,
    description: options.description,
    applicationCategory: options.applicationCategory || 'MultimediaApplication',
    operatingSystem: options.operatingSystem || 'All',
    offers: options.offers
      ? {
          '@type': 'Offer',
          price: options.offers.price,
          priceCurrency: options.offers.priceCurrency,
        }
      : undefined,
    aggregateRating: options.aggregateRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: options.aggregateRating.ratingValue,
          reviewCount: options.aggregateRating.reviewCount,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    screenshot: options.screenshot,
  };
}

// HowTo schema for step-by-step guides
export function getHowToSchema(options: {
  name: string;
  description: string;
  image?: string;
  totalTime?: string; // ISO 8601 duration format, e.g., "PT1M" for 1 minute
  estimatedCost?: {
    value: string;
    currency: string;
  };
  steps: Array<{
    name: string;
    text: string;
    image?: string;
    url?: string;
  }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: options.name,
    description: options.description,
    image: options.image,
    totalTime: options.totalTime,
    estimatedCost: options.estimatedCost
      ? {
          '@type': 'MonetaryAmount',
          value: options.estimatedCost.value,
          currency: options.estimatedCost.currency,
        }
      : undefined,
    step: options.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
      url: step.url,
    })),
  };
}

// VideoObject schema
export function getVideoObjectSchema(options: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string; // ISO 8601 duration
  contentUrl?: string;
  embedUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: options.name,
    description: options.description,
    thumbnailUrl: options.thumbnailUrl,
    uploadDate: options.uploadDate,
    duration: options.duration,
    contentUrl: options.contentUrl,
    embedUrl: options.embedUrl,
  };
}

// FAQ schema
export function getFAQSchema(
  items: Array<{
    question: string;
    answer: string;
  }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

// SoftwareApplication schema (alternative to WebApplication)
export function getSoftwareApplicationSchema(options: {
  name: string;
  url: string;
  description: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  featureList?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: options.name,
    url: options.url,
    description: options.description,
    applicationCategory: options.applicationCategory || 'MultimediaApplication',
    operatingSystem: options.operatingSystem || 'Web',
    offers: options.offers
      ? {
          '@type': 'Offer',
          price: options.offers.price,
          priceCurrency: options.offers.priceCurrency,
        }
      : undefined,
    aggregateRating: options.aggregateRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: options.aggregateRating.ratingValue,
          reviewCount: options.aggregateRating.reviewCount,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    featureList: options.featureList,
  };
}

// BreadcrumbList schema
export function getBreadcrumbSchema(
  items: Array<{
    name: string;
    url: string;
  }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
