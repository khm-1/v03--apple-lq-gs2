import { useQuery } from "@tanstack/react-query";
import { ApiService } from "../../infrastructure/api/ApiService";
import { PortfolioViewModel } from "../view-models/PortfolioViewModel";
import { DashboardDataDto } from "@shared/application/dto/PortfolioDto";

const apiService = new ApiService();

/**
 * Custom hook for portfolio data management
 */
export function usePortfolio(userId: number) {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useQuery<DashboardDataDto>({
    queryKey: [`dashboard-${userId}`],
    queryFn: () => apiService.getDashboardData(userId),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });

  const viewModel = dashboardData
    ? new PortfolioViewModel(
        dashboardData.portfolio,
        dashboardData.stocks,
        dashboardData.transactions
      )
    : null;

  return {
    viewModel,
    dashboardData,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for portfolio data only
 */
export function usePortfolioData(userId: number) {
  return useQuery({
    queryKey: [`portfolio-${userId}`],
    queryFn: () => apiService.getPortfolio(userId),
    staleTime: 30000,
  });
}

/**
 * Hook for market data only
 */
export function useMarketData() {
  return useQuery({
    queryKey: ['market-data'],
    queryFn: () => apiService.getMarketData(),
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // 2 minutes
  });
}

/**
 * Hook for transactions data only
 */
export function useTransactions(userId: number) {
  return useQuery({
    queryKey: [`transactions-${userId}`],
    queryFn: () => apiService.getTransactions(userId),
    staleTime: 30000,
  });
}
