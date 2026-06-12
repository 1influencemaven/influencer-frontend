import { cn } from "@/lib/utils";

type DashboardHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

export function DashboardHeader({
  eyebrow,
  title,
  description,
  className,
}: DashboardHeaderProps) {
  return (
    <header className={cn("space-y-2", className)}>
      <p className="text-xs font-semibold tracking-wide text-primary uppercase">
        {eyebrow}
      </p>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </header>
  );
}
