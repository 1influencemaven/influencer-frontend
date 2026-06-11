import { cn } from "@/lib/utils";

type FormErrorAlertProps = {
  message: string;
  className?: string;
};

export function FormErrorAlert({ message, className }: FormErrorAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive",
        className,
      )}
    >
      {message}
    </div>
  );
}
