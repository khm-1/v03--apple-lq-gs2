import { PortfolioViewModel } from "../view-models/PortfolioViewModel";
import { DashboardDataDto } from "@shared/application/dto/PortfolioDto";
import GlassPanel from "@/components/dashboard/glass-panel";
import KPICard from "@/components/dashboard/kpi-card";
import PortfolioChart from "@/components/dashboard/portfolio-chart";
import AllocationChart from "@/components/dashboard/allocation-chart";
import MarketOverview from "@/components/dashboard/market-overview";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import Watchlist from "@/components/dashboard/watchlist";
import QuickActions from "@/components/dashboard/quick-actions";
import { Wallet, TrendingUp, Target, Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardViewProps {
  viewModel: PortfolioViewModel;
  dashboardData: DashboardDataDto;
  onRefresh: () => void;
}

/**
 * Pure presentation component for dashboard
 */
export function DashboardView({ viewModel, dashboardData, onRefresh }: DashboardViewProps) {
  const stocksForDisplay = viewModel.getStocksForDisplay();
  const recentTransactions = viewModel.getRecentTransactionsForDisplay(3);

  return (
    <div className="min-h-screen relative">
      {/* Animated gradient background */}
      <div className="fixed inset-0 gradient-bg -z-10" />
      
      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 p-6 md:p-8 lg:p-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              Portfolio Dashboard
            </h1>
            <p className="text-slate-300 text-lg">
              Real-time insights into your financial performance
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className={`px-4 py-2 rounded-full glass-morphism-dark ${viewModel.getPortfolioStatusColor()}`}>
              <span className="text-sm font-medium">
                Status: {viewModel.getPerformanceStatus()}
              </span>
            </div>
            <Button
              onClick={onRefresh}
              variant="ghost"
              size="sm"
              className="glass-morphism-dark text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            icon={<Wallet className="w-6 h-6 text-white" />}
            title="Total Portfolio"
            value={viewModel.getTotalValueDisplay()}
            change="+12.5%"
            isPositive={true}
            gradient="from-blue-500 to-blue-600"
          />
          <KPICard
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            title="Today's P&L"
            value={viewModel.getDailyPnLDisplay()}
            change={viewModel.getDailyPnLChange()}
            isPositive={true}
            gradient="from-green-500 to-emerald-600"
          />
          <KPICard
            icon={<Activity className="w-6 h-6 text-white" />}
            title="Active Positions"
            value={viewModel.getActivePositionsDisplay()}
            change={viewModel.getActivePositionsChange()}
            isPositive={true}
            gradient="from-purple-500 to-purple-600"
          />
          <KPICard
            icon={<Target className="w-6 h-6 text-white" />}
            title="Success Rate"
            value={viewModel.getSuccessRateDisplay()}
            change="High"
            isPositive={true}
            gradient="from-orange-500 to-red-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            <PortfolioChart performanceData={dashboardData.performanceHistory} />
            {viewModel.hasStocks() && (
              <MarketOverview stocks={stocksForDisplay} />
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <AllocationChart allocation={dashboardData.allocation} />
            {viewModel.hasTransactions() && (
              <RecentTransactions transactions={recentTransactions} />
            )}
            <QuickActions />
          </div>
        </div>

        {/* Additional sections */}
        <div className="mt-8">
          {viewModel.hasStocks() && (
            <Watchlist stocks={stocksForDisplay} />
          )}
        </div>
      </div>
    </div>
  );
}
