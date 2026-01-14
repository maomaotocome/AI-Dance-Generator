'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eye, Flame, Play, TrendingUp, Heart, Share2, Music, Sparkles, CheckCircle2 } from 'lucide-react';

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

  const viewCounts = ['2.3M', '1.8M', '950K', '1.5M', '3.2M', '4.1M', '890K', '5.6M'];
  const platforms = ['TikTok', 'Instagram', 'YouTube', 'TikTok', 'Instagram', 'TikTok', 'YouTube', 'Instagram'];
  const usernames = ['@dance_ai', '@viral_moves', '@ai_creator', '@trend_setter', '@motion_art'];
  
  const views = item.views || viewCounts[index % viewCounts.length];
  const platform = item.platform || platforms[index % platforms.length];
  const username = usernames[index % usernames.length];
  const likes = ((index * 1234) % 900 + 100) + 'K';

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
      <div className="glass relative h-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
        <div className="relative aspect-[9/16] w-full overflow-hidden">
          {hasValidImage ? (
            <Image
              src={item.image!.src!}
              alt={item.image?.alt ?? item.title ?? ''}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={cn('absolute inset-0 bg-gradient-to-br animate-gradient-xy', gradients[gradientIndex])}>
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse" />
              <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/10 blur-3xl animate-pulse delay-700" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-white/30 blur-xl animate-ping opacity-50" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                    <Play className="ml-1 h-8 w-8 text-white" fill="white" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-1 px-10">
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

          <div className="absolute left-3 top-3 right-3 flex justify-between items-start">
            <div className="flex items-center gap-1.5 rounded-full bg-black/40 border border-white/10 px-2.5 py-1 backdrop-blur-md">
               {platform === 'TikTok' && <Music className="h-3 w-3 text-pink-500" />}
               {platform === 'Instagram' && <div className="h-3 w-3 rounded-sm bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500" />}
               {platform === 'YouTube' && <Play className="h-3 w-3 text-red-600 fill-current" />}
               <span className="text-[10px] font-bold text-white uppercase tracking-wider">{platform}</span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-black/40 border border-white/10 px-2 py-1 backdrop-blur-md">
              <Eye className="h-3 w-3 text-white/80" />
              <span className="text-[10px] font-medium text-white">{views}</span>
            </div>
          </div>

          <div className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300",
            isHovered ? "bg-black/20 opacity-100" : "opacity-0"
          )}>
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: isHovered ? 1 : 0.8 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg"
            >
              <Play className="ml-1 h-7 w-7 text-white" fill="white" />
            </motion.div>
          </div>

          <div className="absolute right-3 bottom-24 flex flex-col gap-3 items-center">
            <div className="flex flex-col items-center gap-0.5">
              <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer">
                <Heart className="h-6 w-6 text-white" fill={index % 2 === 0 ? "white" : "none"} />
              </div>
              <span className="text-[10px] font-medium text-white shadow-black drop-shadow-md">{likes}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-[10px] font-medium text-white shadow-black drop-shadow-md">Share</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 pt-12 text-left">
             <div className="mb-2 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 border border-white/20" /> 
                <div className="flex flex-col leading-none">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white shadow-black drop-shadow-md">{username}</span>
                    <CheckCircle2 className="h-3 w-3 text-blue-400 fill-blue-400/20" />
                  </div>
                  <span className="text-[10px] text-white/70">Original Audio</span>
                </div>
             </div>
             
             <div className="pr-12">
               <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-white shadow-black drop-shadow-md leading-tight">
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
      className={cn('relative py-20 md:py-32 overflow-hidden', section.className, className)}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container relative z-10">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {section.sr_only_title && <h1 className="sr-only">{section.sr_only_title}</h1>}

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 backdrop-blur-sm"
          >
            <Flame className="h-4 w-4 text-orange-500 animate-pulse" fill="currentColor" />
            <span className="text-sm font-bold text-orange-500 uppercase tracking-wide">Trending Now</span>
          </motion.div>

          <h2
            className="mx-auto mb-6 max-w-4xl text-4xl font-black tracking-tight text-foreground md:text-6xl lg:text-7xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            videos going <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">viral</span> right now
          </h2>
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground">
            Real results from our users. These videos were generated in under 60 seconds using our AI.
          </p>
        </motion.div>

        {groups.length > 0 && (
          <motion.div
            className="mb-12 flex flex-wrap justify-center gap-3"
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
                    'rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300',
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-2 ring-primary/20'
                      : 'border border-border bg-card/50 text-muted-foreground hover:border-primary/50 hover:text-foreground backdrop-blur-sm'
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

        <div className="grid grid-cols-2 gap-3 md:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const hasButton = !!(item as any).button;
              const content = <ShowcaseCard key={index} item={item as any} index={index} />;

              if (hasButton) return <div key={index}>{content}</div>;
              if (item.url) return <Link key={index} href={item.url} target={item.target}>{content}</Link>;
              return <div key={index}>{content}</div>;
            })
          ) : (
            <motion.div
              className="col-span-full py-20 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-muted-foreground">No videos found in this category yet.</p>
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
            className="h-14 rounded-full bg-gradient-to-r from-primary to-accent px-8 text-lg font-bold text-white shadow-xl shadow-primary/25 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/40"
          >
            <Link href="#generator">
              <Sparkles className="mr-2 h-5 w-5" />
              Create Your Own Viral Video
            </Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required · Generates in seconds
          </p>
        </motion.div>
      </div>
    </section>
  );
}
