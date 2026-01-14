'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  CheckCircle2,
  Instagram,
  Music,
  PlaySquare,
  Sparkles,
  Star,
  TrendingUp,
  Upload,
  Wand2,
  Youtube,
  Zap,
} from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

import { SocialAvatars } from './social-avatars';

// --- Assets & Icons ---

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
  </svg>
);

const YouTubeShortsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.7 7.7a2.3 2.3 0 0 0-1.2-1l-8-3.3a2.4 2.4 0 0 0-2.4.4 2.3 2.3 0 0 0-.8 2.3v.1l1.1 5.3a1.5 1.5 0 0 1-.5 1.4L4.8 14a2.3 2.3 0 0 0 .1 3.2 2.3 2.3 0 0 0 2 .5l8 3.3a2.3 2.3 0 0 0 3.2-2.7l-1-5.3a1.5 1.5 0 0 1 .4-1.4l1.1-1a2.3 2.3 0 0 0-.9-2.9zM7.2 9l6.5 3-6.5 3V9z" />
  </svg>
);

// --- Sub-components ---

function FloatingParticle({
  delay,
  duration,
  size,
  left,
  top,
}: {
  delay: number;
  duration: number;
  size: number;
  left: string;
  top: string;
}) {
  return (
    <div
      className="absolute rounded-full opacity-40 mix-blend-screen"
      style={{
        width: size,
        height: size,
        left,
        top,
        background:
          'radial-gradient(circle, oklch(0.72 0.25 300 / 0.8) 0%, transparent 70%)',
        animation: `float ${duration}s ease-in-out ${delay}s infinite`,
        boxShadow: `0 0 ${size * 2}px oklch(0.72 0.25 300 / 0.4)`,
      }}
    />
  );
}

function GradientOrb({
  className,
  size = 400,
  color = 'primary',
}: {
  className?: string;
  size?: number;
  color?: 'primary' | 'accent' | 'secondary';
}) {
  const colors = {
    primary: 'oklch(0.72 0.25 300 / 0.2)',
    accent: 'oklch(0.7 0.22 330 / 0.15)',
    secondary: 'oklch(0.65 0.2 270 / 0.15)',
  };

  return (
    <div
      className={cn(
        'absolute rounded-full mix-blend-screen blur-[100px]',
        className
      )}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${colors[color]} 0%, transparent 70%)`,
        animation: 'float-slow 12s ease-in-out infinite',
      }}
    />
  );
}

function VideoShowcase({
  className,
  gradient = 'from-blue-600 via-violet-600 to-purple-600',
  active = false,
}: {
  className?: string;
  gradient?: string;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black shadow-2xl backdrop-blur-md',
        className
      )}
    >
      {/* Phone frame UI */}
      <div className="absolute top-0 right-0 left-0 z-20 flex h-7 items-center justify-center bg-gradient-to-b from-black/80 to-transparent pt-3">
        <div className="h-2 w-20 rounded-full bg-black/80 backdrop-blur-md" />
      </div>

      {/* Screen Content */}
      <div className="relative aspect-[9/18] w-full overflow-hidden bg-gray-900">
        {/* Animated Gradient Placeholder */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br bg-[length:400%_400%]',
            gradient,
            active ? 'animate-gradient-xy' : 'opacity-80'
          )}
        />

        {/* Silhouette / Content Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center opacity-50 mix-blend-overlay">
          <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center grayscale" />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {/* Floating UI Elements (Simulating an App Interface) */}
        <div className="absolute right-5 bottom-6 left-5 z-10 flex items-end justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="h-2 w-24 rounded-full bg-white/40" />
            <div className="h-2 w-16 rounded-full bg-white/20" />
            <div className="mt-2 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md">
              <Music className="h-3 w-3 text-white" />
              <span className="text-[10px] font-medium text-white">
                Original Audio
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
              <ArrowRight className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Border glow & Reflections */}
      <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] border border-white/10 ring-1 ring-white/5" />

      {/* Dynamic Shine effect */}
      <div className="group-hover:animate-shine absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20" />
    </div>
  );
}

function TransformationStep({
  icon: Icon,
  label,
  isLast = false,
}: {
  icon: any;
  label: string;
  isLast?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-inner backdrop-blur-sm transition-colors hover:bg-white/20">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs font-medium text-white/70">{label}</span>
      </div>
      {!isLast && <ArrowRight className="mb-5 h-4 w-4 text-white/20" />}
    </div>
  );
}

function HeroVideoCarousel() {
  const [active, setActive] = useState(0);

  const items = [
    { id: 0, gradient: 'from-violet-600 via-fuchsia-600 to-pink-600' },
    { id: 1, gradient: 'from-cyan-500 via-blue-600 to-indigo-600' },
    { id: 2, gradient: 'from-orange-500 via-amber-500 to-yellow-500' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getStyles = (index: number) => {
    const position = (index - active + items.length) % items.length;

    if (position === 0) {
      return 'z-30 scale-100 opacity-100 translate-x-0 rotate-0 shadow-[0_0_50px_-10px_rgba(168,85,247,0.4)]';
    } else if (position === 1) {
      return 'z-10 scale-[0.85] opacity-40 translate-x-[60%] rotate-6 blur-[1px] grayscale-[0.5] hidden sm:block';
    } else {
      return 'z-10 scale-[0.85] opacity-40 -translate-x-[60%] -rotate-6 blur-[1px] grayscale-[0.5] hidden sm:block';
    }
  };

  return (
    <div className="relative flex h-[400px] w-full items-center justify-center sm:h-[500px]">
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-3 py-1 backdrop-blur-md sm:-top-12 sm:px-4 sm:py-1.5">
        <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase sm:text-sm">
          Before → After
        </span>
      </div>

      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            'absolute transition-all duration-700 ease-in-out will-change-transform',
            getStyles(index)
          )}
          style={{ width: 'clamp(200px, 70vw, 280px)' }}
        >
          <VideoShowcase gradient={item.gradient} active={index === active} />
        </div>
      ))}

      <div className="animate-bounce-subtle absolute -right-4 bottom-20 z-40 hidden lg:block">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/60 p-4 shadow-xl backdrop-blur-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Viral Ready</p>
            <p className="text-xs text-white/50">Optimized for TikTok</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroPremium({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  const highlightText = section.highlight_text ?? '';
  let texts: (string | undefined)[] | null = null;
  if (highlightText && section.title) {
    texts = section.title.split(highlightText, 2);
  }

  return (
    <section
      ref={sectionRef}
      id={section.id}
      className={cn(
        'relative min-h-[100vh] overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24',
        section.className,
        className
      )}
    >
      {/* Background effects */}
      <div className="absolute inset-0 -z-10 bg-[#0A0A0A]">
        <div className="via-background dark:animated-gradient-bg absolute inset-0 bg-gradient-to-br from-indigo-950/20 to-purple-950/20" />

        <GradientOrb
          className="-top-[10%] -left-[10%]"
          size={800}
          color="primary"
        />
        <GradientOrb
          className="top-[20%] right-[10%]"
          size={600}
          color="accent"
        />
        <GradientOrb
          className="bottom-[10%] left-[20%]"
          size={500}
          color="secondary"
        />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #4a4a4a 1px, transparent 1px),
                             linear-gradient(to bottom, #4a4a4a 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem',
            maskImage:
              'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />

        <div className="particles-container">
          <FloatingParticle
            delay={0}
            duration={8}
            size={4}
            left="15%"
            top="25%"
          />
          <FloatingParticle
            delay={2}
            duration={12}
            size={6}
            left="85%"
            top="15%"
          />
          <FloatingParticle
            delay={1}
            duration={10}
            size={3}
            left="75%"
            top="65%"
          />
        </div>
      </div>

      <div className="relative z-10 container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column - Content */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {/* Announcement Pill */}
            <div
              className="animate-fade-in-up mb-8 inline-flex opacity-0"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="group relative flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 backdrop-blur-md transition-all hover:border-violet-500/40 hover:bg-violet-500/10">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500"></span>
                </span>
                <span className="text-sm font-medium text-violet-200">
                  New: V2 Motion Model Released
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-violet-400 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>

            {/* Headline */}
            <h1
              className="animate-fade-in-up relative max-w-3xl text-5xl font-extrabold tracking-tight text-white opacity-0 sm:text-6xl md:text-7xl lg:text-7xl"
              style={{
                animationDelay: '0.2s',
                fontFamily: 'var(--font-display)',
                lineHeight: '0.95',
              }}
            >
              {texts && texts.length > 0 ? (
                <>
                  {texts[0]}
                  <span className="relative inline-block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                    {highlightText}
                    <svg
                      className="absolute -bottom-2 left-0 h-3 w-full opacity-60"
                      viewBox="0 0 100 10"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 5 Q 50 10 100 5"
                        stroke="url(#gradient)"
                        strokeWidth="4"
                        fill="none"
                      />
                      <defs>
                        <linearGradient
                          id="gradient"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor="oklch(0.72 0.25 300)" />
                          <stop offset="100%" stopColor="oklch(0.7 0.22 330)" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                  {texts[1]}
                </>
              ) : (
                section.title
              )}
            </h1>

            {/* Subheadline */}
            <p
              className="text-muted-foreground/90 animate-fade-in-up mt-6 max-w-xl text-lg opacity-0 sm:text-xl"
              style={{ animationDelay: '0.3s' }}
              dangerouslySetInnerHTML={{ __html: section.description ?? '' }}
            />

            {/* Transformation Steps */}
            <div
              className="animate-fade-in-up mt-8 flex items-center gap-2 opacity-0 lg:gap-4"
              style={{ animationDelay: '0.4s' }}
            >
              <TransformationStep icon={Upload} label="Upload" />
              <TransformationStep icon={Wand2} label="AI Magic" />
              <TransformationStep icon={PlaySquare} label="Video" isLast />
            </div>

            {/* CTA Buttons */}
            {section.buttons && (
              <div
                className="animate-fade-in-up mt-10 flex flex-col gap-4 opacity-0 sm:flex-row"
                style={{ animationDelay: '0.5s' }}
              >
                {section.buttons.map((button, idx) => (
                  <Button
                    asChild
                    key={idx}
                    size="lg"
                    className={cn(
                      'relative h-16 min-w-[180px] overflow-hidden rounded-full text-base font-bold transition-all hover:scale-105',
                      idx === 0
                        ? 'border-none bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_30px_-5px_oklch(0.72_0.25_300_/_0.5)] hover:shadow-[0_0_40px_-5px_oklch(0.72_0.25_300_/_0.7)]'
                        : 'border border-white/20 bg-white/5 text-white backdrop-blur-sm hover:border-white/30 hover:bg-white/10'
                    )}
                  >
                    <Link
                      href={button.url ?? '#generator'}
                      target={button.target ?? '_self'}
                      className="flex items-center justify-center gap-2"
                    >
                      {idx === 0 && (
                        <Sparkles className="h-5 w-5 animate-pulse" />
                      )}
                      <span>{button.title}</span>
                      {idx === 0 && <ArrowRight className="h-5 w-5" />}
                      {idx === 0 && (
                        <div className="absolute inset-0 -z-10 bg-white/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                      )}
                    </Link>
                  </Button>
                ))}
              </div>
            )}

            {/* Social Proof & Platforms */}
            <div
              className="animate-fade-in-up mt-12 flex flex-col items-center gap-6 opacity-0 lg:flex-row lg:items-center"
              style={{ animationDelay: '0.7s' }}
            >
              {section.show_avatars && (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <SocialAvatars tip={section.avatars_tip || ''} />
                    <div className="absolute -right-2 -bottom-2 flex items-center justify-center rounded-full border border-white/10 bg-black px-1.5 py-0.5">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span className="ml-1 text-[10px] font-bold text-white">
                        4.9
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-white">
                      Trusted by 50k+
                    </span>
                    <span className="text-muted-foreground text-xs">
                      Content Creators
                    </span>
                  </div>
                </div>
              )}

              <div className="hidden h-8 w-px bg-white/10 lg:block" />

              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground/80 text-[10px] font-semibold tracking-wider uppercase">
                  Works with
                </span>
                <div className="flex items-center gap-4 text-white/60">
                  <div
                    className="flex items-center gap-1.5 transition-colors hover:text-white"
                    title="TikTok"
                  >
                    <TikTokIcon className="h-4 w-4" />
                    <span className="text-xs font-medium">TikTok</span>
                  </div>
                  <div
                    className="flex items-center gap-1.5 transition-colors hover:text-white"
                    title="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                    <span className="text-xs font-medium">Reels</span>
                  </div>
                  <div
                    className="flex items-center gap-1.5 transition-colors hover:text-white"
                    title="YouTube Shorts"
                  >
                    <YouTubeShortsIcon className="h-4 w-4" />
                    <span className="text-xs font-medium">Shorts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Carousel */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div
              className="relative w-full max-w-[600px]"
              style={{ animation: 'fade-in 1s ease 0.4s forwards' }}
            >
              {/* Glow effects behind carousel */}
              <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-20">
                <div className="animate-pulse-glow absolute inset-0 rounded-full bg-violet-600 blur-[120px]" />
                <div className="animate-pulse-glow absolute inset-0 rounded-full bg-fuchsia-600 blur-[100px] delay-1000" />
              </div>

              <HeroVideoCarousel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
