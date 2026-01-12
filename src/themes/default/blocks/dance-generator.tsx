import { DanceGenerator } from '@/shared/blocks/generator';
import { DANCE_TEMPLATES } from '@/config/dance-templates';
import type { Section } from '@/shared/types/blocks/landing';

interface DanceGeneratorBlockProps {
  section?: Section;
}

export function DanceGeneratorBlock({ section }: DanceGeneratorBlockProps) {
  return (
    <DanceGenerator
      templates={DANCE_TEMPLATES}
      srOnlyTitle={section?.title as string | undefined}
    />
  );
}
