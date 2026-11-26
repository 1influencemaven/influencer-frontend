import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { DashboardMetric, MetricAccent } from "@/types/dashboard";

const accentStyles: Record<MetricAccent, string> = {
  sky: "bg-notion-sky",
  purple: "bg-notion-purple",
  teal: "bg-notion-teal",
  green: "bg-notion-green",
  pink: "bg-notion-pink",
  orange: "bg-destructive",
};

type MetricCardProps = Pick<
  DashboardMetric,
  "label" | "value" | "hint" | "accent" | "isPlaceholder" | "href"
>;

export function MetricCard({
  label,
  value,
  hint,
  accent = "sky",
  isPlaceholder = false,
  href,
}: MetricCardProps) {
  const card = (
    <Card
      className={cn(
        "gap-0 overflow-hidden border-border/80 py-0 shadow-xs transition-colors",
        href && "hover:border-primary/40 hover:bg-muted/20",
      )}
    >
      <div className={cn("h-1 w-full", accentStyles[accent])} aria-hidden />
      <CardHeader className="gap-1 py-4">
        <CardDescription className="text-sm">{label}</CardDescription>
        <CardTitle
          className={cn(
            "text-3xl font-bold tracking-tight",
            isPlaceholder && "text-muted-foreground",
          )}
        >
          {value}
        </CardTitle>
      </CardHeader>
      {hint ? (
        <CardContent className="pt-0 pb-4">
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      ) : null}
    </Card>
  );

  if (!href) {
    return card;
  }

  return (
    <Link href={href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {card}
    </Link>
  );
}
