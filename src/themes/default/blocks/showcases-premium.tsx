'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eye, Flame, Play, TrendingUp } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

// Showcase card with video-style design
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
  };
  index: number;
}) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = item.image?.src && !imageError;

  // Generate gradient based on index for variety
  const gradientIndex = index % 4;
  const gradients = [
    'from-violet-600 via-purple-600 to-fuchsia-600',
    'from-blue-600 via-cyan-600 to-teal-600',
    'from-rose-600 via-pink-600 to-orange-600',
    'from-emerald-600 via-green-600 to-lime-600',
  ];

  const viewCounts = ['2.3M', '1.8M', '950K', '1.5M', '3.2M'];
  const platforms = ['TikTok', 'Reels', 'Shorts', 'TikTok', 'Reels'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      className="group"
    >
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
        {/* Video thumbnail area */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {hasValidImage ? (
            <Image
              src={item.image!.src!}
              alt={item.image?.alt ?? item.title ?? ''}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            // Attractive placeholder when no image
            <div className={cn('absolute inset-0 bg-gradient-to-br', gradients[gradientIndex])}>
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

              {/* Center play icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Play className="ml-1 h-8 w-8 text-white" fill="white" />
                </div>
              </div>

              {/* Animated bars to simulate video waveform */}
              <div className="absolute bottom-4 left-4 flex items-end gap-1">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-white/40"
                    style={{
                      height: `${12 + Math.sin(i * 0.8) * 8}px`,
                      animation: `pulse 1s ease-in-out ${i * 0.1}s infinite alternate`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Play button overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
            <div className="flex h-14 w-14 scale-90 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
              <Play className="ml-1 h-6 w-6 text-white" fill="white" />
            </div>
          </div>

          {/* Stats badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <Eye className="h-3 w-3" />
              {viewCounts[index % viewCounts.length]} views
            </div>
          </div>

          {/* Platform badge */}
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-accent px-2.5 py-1 text-xs font-bold text-white shadow-lg">
            <TrendingUp className="h-3 w-3" />
            {platforms[index % platforms.length]}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="mb-2 line-clamp-1 text-lg font-bold text-foreground">
            {item.title}
          </h3>
          <p
            className="line-clamp-2 text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: item.description ?? '' }}
          />
          {item.button && (
            <div className="mt-4">
              <Button
                asChild
                variant={(item.button.variant as any) || 'default'}
                size="sm"
                className="h-9 w-full rounded-lg bg-gradient-to-r from-primary to-accent font-semibold text-white shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/30"
              >
                <Link href={item.button.url || ''}>
                  {item.button.icon && <SmartIcon name={item.button.icon} className="mr-2 h-4 w-4" />}
                  {item.button.title}
                </Link>
              </Button>
            </div>
          )}
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
      className={cn('relative py-20 md:py-28', section.className, className)}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container">
        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {section.sr_only_title && <h1 className="sr-only">{section.sr_only_title}</h1>}

          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-foreground">Trending Now</span>
          </div>

          <h2
            className="mx-auto mb-4 max-w-3xl text-3xl font-bold text-foreground md:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {section.title}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {section.description}
          </p>
        </motion.div>

        {/* Category filters */}
        {groups.length > 0 && (
          <motion.div
            className="mb-10 flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {groups.map((group: { name: string; title: string }, index: number) => {
              const isSelected = selectedGroup === group.name;
              return (
                <motion.button
                  key={group.name}
                  onClick={() => setSelectedGroup(group.name)}
                  className={cn(
                    'rounded-full px-5 py-2 text-sm font-medium transition-all duration-300',
                    isSelected
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25'
                      : 'border border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5'
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
            })}
          </motion.div>
        )}

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const hasButton = !!(item as any).button;
              const card = <ShowcaseCard key={index} item={item as any} index={index} />;

              return hasButton ? (
                <div key={index}>{card}</div>
              ) : (
                <Link key={index} href={item.url || '#'} target={item.target}>
                  {card}
                </Link>
              );
            })
          ) : (
            <motion.div
              className="col-span-full py-12 text-center text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              No items found in this category.
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
