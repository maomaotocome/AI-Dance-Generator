'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Eye,
  Flame,
  Heart,
  Music,
  Play,
  Share2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

function ShowcaseCard({
  item,
  index,
}: {
  item: {
    title?: string;
    description?: string;
    image?: { src?: string; alt?: string };
    url?: string;
    target?: string;
    button?: { title?: string; url?: string; icon?: string; variant?: string };
    views?: string;
    platform?: string;
  };
  index: number;
}) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = item.image?.src && !imageError;
  const [isHovered, setIsHovered] = useState(false);

  const gradientIndex = index % 4;
  const gradients = [
    'from-violet-600 via-purple-600 to-fuchsia-600',
    'from-blue-600 via-cyan-600 to-teal-600',
    'from-rose-600 via-pink-600 to-orange-600',
    'from-emerald-600 via-green-600 to-lime-600',
  ];

  const views = item.views || '';
  const platform = item.platform || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="glass hover:shadow-primary/20 relative h-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
        <div className="relative aspect-[9/16] w-full overflow-hidden">
          {hasValidImage ? (
            <Image
              src={item.image?.src ?? ''}
              alt={item.image?.alt ?? item.title ?? ''}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className={cn(
                'animate-gradient-xy absolute inset-0 bg-gradient-to-br',
                gradients[gradientIndex]
              )}
            >
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute -top-20 -right-20 h-64 w-64 animate-pulse rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-48 w-48 animate-pulse rounded-full bg-white/10 blur-3xl delay-700" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-white/30 opacity-50 blur-xl" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md">
                    <Play className="ml-1 h-8 w-8 text-white" fill="white" />
                  </div>
                </div>
              </div>

              <div className="absolute right-0 bottom-32 left-0 flex justify-center gap-1 px-10">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-white/60"
                    style={{
                      height: `${10 + Math.random() * 30}px`,
                      animation: `pulse 1s ease-in-out ${i * 0.1}s infinite alternate`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />

          <div className="absolute top-3 right-3 left-3 flex items-start justify-between">
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 backdrop-blur-md">
              {platform === 'TikTok' && (
                <Music className="h-3 w-3 text-pink-500" />
              )}
              {platform === 'Instagram' && (
                <div className="h-3 w-3 rounded-sm bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500" />
              )}
              {platform === 'YouTube' && (
                <Play className="h-3 w-3 fill-current text-red-600" />
              )}
              <span className="text-[10px] font-bold tracking-wider text-white uppercase">
                {platform}
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-1 backdrop-blur-md">
              <Eye className="h-3 w-3 text-white/80" />
              <span className="text-[10px] font-medium text-white">
                {views}
              </span>
            </div>
          </div>

          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center transition-all duration-300',
              isHovered ? 'bg-black/20 opacity-100' : 'opacity-0'
            )}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: isHovered ? 1 : 0.8 }}
              className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/20 shadow-lg backdrop-blur-md"
            >
              <Play className="ml-1 h-7 w-7 text-white" fill="white" />
            </motion.div>
          </div>

          <div className="absolute right-3 bottom-24 flex flex-col items-center gap-3">
            <div className="flex flex-col items-center gap-0.5">
              <div className="cursor-pointer rounded-full bg-black/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/20">
                <Heart
                  className="h-6 w-6 text-white"
                  fill={index % 2 === 0 ? 'white' : 'none'}
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="cursor-pointer rounded-full bg-black/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/20">
                <Share2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 left-0 p-4 pt-12 text-left">
            <div className="pr-12">
              <h3 className="mb-1 line-clamp-2 text-sm leading-tight font-semibold text-white shadow-black drop-shadow-md">
                {item.title}
              </h3>
              {item.description && (
                <p className="line-clamp-1 text-xs text-white/80 text-shadow-sm">
                  {item.description.replace(/<[^>]*>/g, '')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ShowcasesPremium({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const groups = (section as any).groups || [];
  const [selectedGroup, setSelectedGroup] = useState<string>(
    groups.length > 0 ? groups[0].name : ''
  );

  const filteredItems = useMemo(() => {
    if (!section.items) return [];
    if (!selectedGroup || !groups.length) return section.items;
    if (selectedGroup === 'all') return section.items;
    return section.items.filter((item) => item.group === selectedGroup);
  }, [section.items, selectedGroup, groups.length]);

  return (
    <section
      id={section.id || section.name}
      className={cn(
        'relative overflow-hidden py-20 md:py-32',
        section.className,
        className
      )}
    >
      <div className="from-primary/10 via-background to-background absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]" />
      <div className="via-primary/50 absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent to-transparent" />

      <div className="relative z-10 container">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {section.sr_only_title && (
            <h1 className="sr-only">{section.sr_only_title}</h1>
          )}

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 backdrop-blur-sm"
          >
            <Flame
              className="h-4 w-4 animate-pulse text-orange-500"
              fill="currentColor"
            />
            <span className="text-sm font-bold tracking-wide text-orange-500 uppercase">
              {(section as any).badge ?? 'Trending Now'}
            </span>
          </motion.div>

          <h2
            className="text-foreground mx-auto mb-6 max-w-4xl text-4xl font-black tracking-tight md:text-6xl lg:text-7xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {section.title}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg md:text-xl">
            {section.description}
          </p>
        </motion.div>

        {groups.length > 0 && (
          <motion.div
            className="mb-12 flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {groups.map(
              (group: { name: string; title: string }, index: number) => {
                const isSelected = selectedGroup === group.name;
                return (
                  <motion.button
                    key={group.name}
                    onClick={() => setSelectedGroup(group.name)}
                    className={cn(
                      'rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300',
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-primary/25 ring-primary/20 shadow-lg ring-2'
                        : 'border-border bg-card/50 text-muted-foreground hover:border-primary/50 hover:text-foreground border backdrop-blur-sm'
                    )}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {group.title}
                  </motion.button>
                );
              }
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const hasButton = !!(item as any).button;
              const content = (
                <ShowcaseCard key={index} item={item as any} index={index} />
              );

              if (hasButton) return <div key={index}>{content}</div>;
              if (item.url)
                return (
                  <Link key={index} href={item.url} target={item.target}>
                    {content}
                  </Link>
                );
              return <div key={index}>{content}</div>;
            })
          ) : (
            <motion.div
              className="col-span-full py-20 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="bg-muted inline-flex h-16 w-16 items-center justify-center rounded-full">
                <Sparkles className="text-muted-foreground h-8 w-8" />
              </div>
              <p className="text-muted-foreground mt-4">
                No videos found in this category yet.
              </p>
            </motion.div>
          )}
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Button
            asChild
            size="lg"
            className="from-primary to-accent shadow-primary/25 hover:shadow-primary/40 h-14 rounded-full bg-gradient-to-r px-8 text-lg font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            <Link href="#generator">
              <Sparkles className="mr-2 h-5 w-5" />
              {(section as any).cta_button ?? 'Create Your Own Viral Video'}
            </Link>
          </Button>
          <p className="text-muted-foreground mt-4 text-sm">
            {(section as any).cta_sub ??
              'No credit card required · Generates in seconds'}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
