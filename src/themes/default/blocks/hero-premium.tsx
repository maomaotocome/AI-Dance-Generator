'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Play, Sparkles, Star, Zap } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

import { SocialAvatars } from './social-avatars';

// Floating particle component
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
      className="absolute rounded-full opacity-40"
      style={{
        width: size,
        height: size,
        left,
        top,
        background:
          'radial-gradient(circle, oklch(0.72 0.25 300 / 0.8) 0%, transparent 70%)',
        animation: `float ${duration}s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}

// Animated gradient orb
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
    primary: 'oklch(0.72 0.25 300 / 0.3)',
    accent: 'oklch(0.7 0.22 330 / 0.25)',
    secondary: 'oklch(0.65 0.2 270 / 0.2)',
  };

  return (
    <div
      className={cn('absolute rounded-full blur-3xl', className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${colors[color]} 0%, transparent 70%)`,
        animation: 'float-slow 12s ease-in-out infinite',
      }}
    />
  );
}

// Video showcase mockup
function VideoShowcase({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-1 shadow-2xl backdrop-blur-sm',
        className
      )}
    >
      {/* Phone frame */}
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-black/80">
        {/* Placeholder video content */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
            <Play className="ml-1 h-8 w-8 text-white" fill="white" />
          </div>
        </div>
        {/* Dancing figure silhouette */}
        <div className="absolute bottom-8 left-1/2 h-32 w-20 -translate-x-1/2 rounded-t-full bg-gradient-to-t from-primary/40 to-transparent" />
        {/* Glow effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-primary/30 to-transparent" />
      </div>
      {/* Decorative elements */}
      <div className="absolute -right-2 -top-2 h-4 w-4 animate-pulse rounded-full bg-primary" />
      <div
        className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-accent"
        style={{ animationDelay: '0.5s' }}
      />
    </div>
  );
}

// Stats badge
function StatBadge({
  icon: Icon,
  value,
  label,
  className,
  delay = 0,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        'glass flex items-center gap-3 rounded-2xl px-4 py-3 opacity-0',
        className
      )}
      style={{
        animation: `slide-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s forwards`,
      }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-lg font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
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
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
        'relative min-h-[90vh] overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24',
        section.className,
        className
      )}
    >
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        {/* Animated gradient background for dark mode */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background dark:animated-gradient-bg" />

        {/* Gradient orbs */}
        <GradientOrb
          className="-left-32 -top-32"
          size={600}
          color="primary"
        />
        <GradientOrb
          className="-right-48 top-1/4"
          size={500}
          color="accent"
        />
        <GradientOrb
          className="bottom-0 left-1/4"
          size={400}
          color="secondary"
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(oklch(0.5 0.02 280) 1px, transparent 1px),
                             linear-gradient(90deg, oklch(0.5 0.02 280) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating particles */}
        <div className="particles-container">
          <FloatingParticle delay={0} duration={8} size={6} left="10%" top="20%" />
          <FloatingParticle delay={2} duration={10} size={4} left="85%" top="15%" />
          <FloatingParticle delay={4} duration={9} size={5} left="70%" top="60%" />
          <FloatingParticle delay={1} duration={11} size={3} left="20%" top="70%" />
          <FloatingParticle delay={3} duration={7} size={4} left="50%" top="30%" />
          <FloatingParticle delay={5} duration={12} size={6} left="30%" top="85%" />
        </div>
      </div>

      <div className="container relative z-10">
        {/* Announcement badge */}
        {section.announcement && (
          <div
            className="mb-8 flex justify-center opacity-0"
            style={{ animation: 'slide-down 0.6s ease 0.1s forwards' }}
          >
            <Link
              href={section.announcement.url || '#generator'}
              target={section.announcement.target || '_self'}
              className="group flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-2 py-1.5 pl-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-primary/10"
            >
              {section.announcement.badge && (
                <span className="rounded-full bg-gradient-to-r from-primary to-accent px-3 py-0.5 text-xs font-semibold text-white">
                  {section.announcement.badge}
                </span>
              )}
              <span className="text-sm font-medium text-foreground">
                {section.announcement.title}
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                <ArrowRight className="h-3.5 w-3.5 text-primary transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        )}

        {/* Main content grid */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column - Text content */}
          <div className="text-center lg:text-left">
            {/* Main heading */}
            <h1
              className="text-4xl font-bold tracking-tight text-foreground opacity-0 sm:text-5xl md:text-6xl lg:text-7xl"
              style={{
                animation: 'slide-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards',
                fontFamily: 'var(--font-display)',
                lineHeight: '1.1',
              }}
            >
              {texts && texts.length > 0 ? (
                <>
                  {texts[0]}
                  <span className="gradient-text">{highlightText}</span>
                  {texts[1]}
                </>
              ) : (
                section.title
              )}
            </h1>

            {/* Description */}
            <p
              className="mx-auto mt-6 max-w-xl text-base text-muted-foreground opacity-0 sm:text-lg md:text-xl lg:mx-0"
              style={{ animation: 'slide-up 0.8s ease 0.4s forwards' }}
              dangerouslySetInnerHTML={{ __html: section.description ?? '' }}
            />

            {/* CTA Buttons */}
            {section.buttons && (
              <div
                className="mt-8 flex flex-col items-center gap-4 opacity-0 sm:flex-row lg:justify-start"
                style={{ animation: 'slide-up 0.8s ease 0.5s forwards' }}
              >
                {section.buttons.map((button, idx) => (
                  <Button
                    asChild
                    key={idx}
                    size="lg"
                    variant={button.variant || (idx === 0 ? 'default' : 'outline')}
                    className={cn(
                      'group relative h-14 min-w-[200px] overflow-hidden rounded-xl px-8 text-base font-semibold transition-all duration-300',
                      idx === 0 &&
                        'bg-gradient-to-r from-primary via-primary to-accent shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30'
                    )}
                  >
                    <Link
                      href={button.url ?? '#generator'}
                      target={button.target ?? '_self'}
                    >
                      {button.icon && (
                        <SmartIcon
                          name={button.icon as string}
                          className="mr-2 h-5 w-5"
                        />
                      )}
                      <span>{button.title}</span>
                      {idx === 0 && (
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      )}
                    </Link>
                  </Button>
                ))}
              </div>
            )}

            {/* Social proof */}
            {section.show_avatars && (
              <div
                className="mt-8 opacity-0"
                style={{ animation: 'slide-up 0.8s ease 0.6s forwards' }}
              >
                <SocialAvatars tip={section.avatars_tip || ''} />
              </div>
            )}

            {/* Trust badges */}
            {section.tip && (
              <p
                className="mt-6 text-sm text-muted-foreground opacity-0"
                style={{ animation: 'fade-in 0.8s ease 0.7s forwards' }}
                dangerouslySetInnerHTML={{ __html: section.tip }}
              />
            )}
          </div>

          {/* Right column - Visual showcase */}
          <div className="relative flex items-center justify-center lg:justify-end">
            {/* Main video showcase */}
            <div
              className="relative opacity-0"
              style={{ animation: 'scale-in 0.8s ease 0.4s forwards' }}
            >
              {/* Glow behind */}
              <div className="absolute -inset-8 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-2xl" />

              {/* Video cards arrangement */}
              <div className="relative flex items-center gap-4">
                {/* Secondary video - left */}
                <VideoShowcase className="hidden w-32 rotate-[-6deg] opacity-60 transition-transform duration-500 hover:rotate-0 hover:opacity-100 sm:block" />

                {/* Main video */}
                <div className="relative">
                  <VideoShowcase className="w-48 sm:w-56 md:w-64" />
                  {/* Floating badge */}
                  <div
                    className="absolute -right-4 -top-4 flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-white shadow-lg opacity-0"
                    style={{ animation: 'scale-in 0.5s ease 0.8s forwards' }}
                  >
                    <Zap className="h-4 w-4" fill="currentColor" />
                    <span className="text-sm font-bold">AI Powered</span>
                  </div>
                </div>

                {/* Secondary video - right */}
                <VideoShowcase className="hidden w-32 rotate-[6deg] opacity-60 transition-transform duration-500 hover:rotate-0 hover:opacity-100 sm:block" />
              </div>

              {/* Floating stat badges */}
              <StatBadge
                icon={Star}
                value="50M+"
                label="Views Generated"
                className="absolute -left-8 bottom-8 hidden lg:flex"
                delay={0.9}
              />
              <StatBadge
                icon={Sparkles}
                value="50K+"
                label="Happy Creators"
                className="absolute -right-8 top-8 hidden lg:flex"
                delay={1.0}
              />
            </div>
          </div>
        </div>

        {/* Bottom trust bar */}
        <div
          className="mt-16 border-t border-border/50 pt-8 opacity-0 md:mt-24"
          style={{ animation: 'fade-in 0.8s ease 1s forwards' }}
        >
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Trusted by creators worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50 grayscale transition-all duration-300 hover:opacity-70 hover:grayscale-0 md:gap-12">
            {['TikTok', 'Instagram', 'YouTube', 'Twitter'].map((platform) => (
              <div key={platform} className="text-lg font-semibold text-muted-foreground">
                {platform}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
