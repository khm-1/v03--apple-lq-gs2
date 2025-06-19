import { cn } from "@/lib/utils";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export default function GlassPanel({ children, className, dark = false }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6",
        dark ? "glass-morphism-dark" : "glass-morphism",
        className
      )}
    >
      {children}
    </div>
  );
}
