'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import { SmartIcon } from '@/shared/blocks/common';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function FeaturesStep({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const itemCount = section.items?.length ?? 0;
  const gridCols =
    itemCount === 3
      ? '@3xl:grid-cols-3'
      : itemCount === 4
        ? '@3xl:grid-cols-4'
        : '@3xl:grid-cols-3';

  return (
    <section
      id={section.id}
      className={cn('py-16 md:py-24', section.className, className)}
    >
      <div className="m-4 rounded-[2rem]">
        <div className="@container relative container">
          <ScrollAnimation>
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-primary">{section.label}</span>
              <h2 className="text-foreground mt-4 text-4xl font-semibold">
                {section.title}
              </h2>
              <p className="text-muted-foreground mt-4 text-lg text-balance">
                {section.description}
              </p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation delay={0.2}>
            <div className={cn('mt-20 grid gap-12', gridCols)}>
              {section.items?.map((item, idx) => {
                const hasImage = !!(item.image as any)?.src;
                return (
                  <div className="space-y-6" key={idx}>
                    <div className="text-center">
                      <span className="bg-primary/10 text-primary mx-auto flex size-8 items-center justify-center rounded-full text-sm font-bold">
                        {idx + 1}
                      </span>
                      <div className="relative">
                        {hasImage ? (
                          <div className="mx-auto my-6 h-16 w-16 overflow-hidden rounded-2xl">
                            <Image
                              src={(item.image as any).src}
                              alt={(item.image as any).alt ?? item.title ?? ''}
                              width={64}
                              height={64}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="mx-auto my-6 w-fit">
                            {item.icon && (
                              <SmartIcon name={item.icon as string} size={24} />
                            )}
                          </div>
                        )}
                        {idx < itemCount - 1 && (
                          <ArrowRight className="text-primary/40 absolute inset-y-0 right-0 my-auto hidden translate-x-[150%] @3xl:block" />
                        )}
                      </div>
                      <h3 className="text-foreground mb-4 text-lg font-semibold">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-balance">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
