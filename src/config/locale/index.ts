import { envConfigs } from '..';

export const localeNames: any = {
  en: 'English',
  zh: '中文',
};

export const locales = ['en', 'zh'];

export const defaultLocale = envConfigs.locale;

export const localePrefix = 'as-needed';

export const localeDetection = false;

export const localeMessagesRootPath = '@/config/locale/messages';

export const localeMessagesPaths = [
  'common',
  'landing',
  'showcases',
  'blog',
  'updates',
  'pricing',
  'settings/sidebar',
  'settings/profile',
  'settings/security',
  'settings/billing',
  'settings/payments',
  'settings/credits',
  'settings/apikeys',
  'admin/sidebar',
  'admin/users',
  'admin/roles',
  'admin/permissions',
  'admin/categories',
  'admin/posts',
  'admin/payments',
  'admin/subscriptions',
  'admin/credits',
  'admin/settings',
  'admin/apikeys',
  'admin/ai-tasks',
  'admin/chats',
  'ai/music',
  'ai/chat',
  'ai/image',
  'ai/video',
  'ai/dance',
  'activity/sidebar',
  'activity/ai-tasks',
  'activity/chats',
  'pages/index',
  'pages/pricing',
  'pages/showcases',
  'pages/blog',
  'pages/updates',
  // Programmatic SEO pages (template/keyword landing pages)
  'pages/template/ai-baby-dance',
  'pages/template/aura-farming-dance',
  'pages/template/lil-yachty-walk',
  'pages/template/viggle-alternative',
  'pages/template/ai-tiktok-dance-generator',
  'pages/template/ai-wedding-dance-generator',
  'pages/template/ai-dance-video-maker',
  'pages/template/make-photo-dance',
  'pages/template/hip-hop-dance-generator',
  'pages/template/kpop-dance-generator',
  'pages/template/ai-pet-dance-generator',
  'pages/template/ai-sway-dance-filter',
  'pages/template/birthday-dance-video-generator',
  'pages/template/ai-dance-generator-free',
  'pages/template/dreamoai-alternative',
];
