import GlassPanel from "./glass-panel";
import { cn } from "@/lib/utils";

interface KPICardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  gradient: string;
}

export default function KPICard({ icon, title, value, change, isPositive, gradient }: KPICardProps) {
  return (
    <GlassPanel className="hover-glass cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", gradient)}>
          {icon}
        </div>
        <div className={cn("text-sm font-medium", isPositive ? "text-green-400" : "text-red-400")}>
          {change}
        </div>
      </div>
      <div className="text-white">
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-slate-300 text-sm">{title}</div>
      </div>
    </GlassPanel>
  );
}
