import GlassPanel from "./glass-panel";
import { Plus, Minus, BarChart3, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuickActions() {
  return (
    <GlassPanel>
      <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="ghost"
          className="glass-morphism-dark rounded-xl p-4 h-auto flex-col hover:bg-white/20 transition-all duration-300 hover:scale-105"
        >
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
            <Plus className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-white font-medium text-sm">Buy</div>
        </Button>
        
        <Button
          variant="ghost"
          className="glass-morphism-dark rounded-xl p-4 h-auto flex-col hover:bg-white/20 transition-all duration-300 hover:scale-105"
        >
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mb-3">
            <Minus className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-white font-medium text-sm">Sell</div>
        </Button>
        
        <Button
          variant="ghost"
          className="glass-morphism-dark rounded-xl p-4 h-auto flex-col hover:bg-white/20 transition-all duration-300 hover:scale-105"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-white font-medium text-sm">Analyze</div>
        </Button>
        
        <Button
          variant="ghost"
          className="glass-morphism-dark rounded-xl p-4 h-auto flex-col hover:bg-white/20 transition-all duration-300 hover:scale-105"
        >
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-white font-medium text-sm">Report</div>
        </Button>
      </div>
    </GlassPanel>
  );
}
