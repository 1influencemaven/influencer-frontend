import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-1 items-center bg-background px-6 py-10">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="inline-flex w-fit rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-primary shadow-xs">
          Influencer AI
        </div>

        <div className="max-w-3xl space-y-5">
          <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-6xl">
            Conecta marcas e influencers con una base lista para crecer.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Frontend inicial con Next 16, TailwindCSS y shadcn/ui configurados
            sobre una estética sobria inspirada en Notion.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg">
            Empezar
            <ArrowRight aria-hidden="true" />
          </Button>
          <Button variant="outline" size="lg">
            Ver estructura
          </Button>
        </div>
      </section>
    </main>
  );
}
