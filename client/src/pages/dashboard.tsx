import { useQuery } from "@tanstack/react-query";
import GlassPanel from "@/components/dashboard/glass-panel";
import KPICard from "@/components/dashboard/kpi-card";
import PortfolioChart from "@/components/dashboard/portfolio-chart";
import AllocationChart from "@/components/dashboard/allocation-chart";
import MarketOverview from "@/components/dashboard/market-overview";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import Watchlist from "@/components/dashboard/watchlist";
import QuickActions from "@/components/dashboard/quick-actions";
import { Wallet, TrendingUp, Target, Activity } from "lucide-react";
import type { Portfolio, Stock, Transaction } from "@shared/schema";

export default function Dashboard() {
  const { data: portfolio } = useQuery<Portfolio>({
    queryKey: ["/api/portfolio/1"],
  });

  const { data: stocks } = useQuery<Stock[]>({
    queryKey: ["/api/stocks"],
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions/1"],
  });

  return (
    <div className="min-h-screen relative">
      {/* Animated gradient background */}
      <div className="fixed inset-0 gradient-bg -z-10" />
      
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <GlassPanel className="mb-8 floating-panel">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Financial Analytics
              </h1>
              <p className="text-slate-200 text-sm md:text-base">
                Real-time market insights and portfolio management
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="glass-morphism-dark rounded-xl px-4 py-2">
                <span className="text-slate-300 text-sm">Last Updated: </span>
                <span className="text-white font-medium">
                  {new Date().toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })} EST
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full glass-morphism flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="text-white">
                  <div className="font-medium">John Portfolio</div>
                  <div className="text-xs text-slate-300">Premium Account</div>
                </div>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            icon={<Wallet className="w-6 h-6 text-white" />}
            title="Total Portfolio"
            value={portfolio ? `$${parseFloat(portfolio.totalValue).toLocaleString()}` : "$847,293"}
            change="+12.5%"
            isPositive={true}
            gradient="from-blue-500 to-blue-600"
          />
          <KPICard
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            title="Today's P&L"
            value={portfolio ? `+$${parseFloat(portfolio.dailyPnL).toLocaleString()}` : "+$4,832.50"}
            change={portfolio ? `+$${parseFloat(portfolio.dailyPnL).toFixed(2)}` : "+$4,832"}
            isPositive={true}
            gradient="from-green-500 to-emerald-600"
          />
          <KPICard
            icon={<Activity className="w-6 h-6 text-white" />}
            title="Active Positions"
            value={portfolio?.activePositions?.toString() || "24"}
            change="24 Active"
            isPositive={true}
            gradient="from-purple-500 to-purple-600"
          />
          <KPICard
            icon={<Target className="w-6 h-6 text-white" />}
            title="Success Rate"
            value={portfolio ? `${parseFloat(portfolio.successRate).toFixed(1)}%` : "78.6%"}
            change="High"
            isPositive={true}
            gradient="from-orange-500 to-red-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            <PortfolioChart />
            <MarketOverview stocks={stocks || []} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <AllocationChart />
            <RecentTransactions transactions={transactions || []} />
            <QuickActions />
          </div>
        </div>

        {/* Bottom Section - Watchlist */}
        <div className="mt-8">
          <Watchlist stocks={stocks || []} />
        </div>
      </div>
    </div>
  );
}
