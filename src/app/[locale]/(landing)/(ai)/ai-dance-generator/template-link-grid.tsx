import Link from 'next/link';

import type { DanceTemplate } from '@/config/dance-templates';

export function TemplateLinkGrid({
  templates,
}: {
  templates: DanceTemplate[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="mb-8 text-center text-2xl font-bold">
        Explore Dance Styles
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {templates.map((template) => (
          <Link
            key={template.id}
            href={`/ai-dance-generator/${template.id}`}
            className="group bg-card rounded-xl border p-4 transition-shadow hover:shadow-lg"
          >
            <h3 className="group-hover:text-primary font-semibold">
              {template.name}
            </h3>
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
              {template.description}
            </p>
            <span className="text-primary mt-2 inline-block text-xs">
              Try {template.name} Dance →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
