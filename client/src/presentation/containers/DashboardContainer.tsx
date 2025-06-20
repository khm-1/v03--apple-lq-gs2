import { usePortfolio } from "../hooks/usePortfolio";
import { DashboardView } from "../components/DashboardView";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";

interface DashboardContainerProps {
  userId: number;
}

/**
 * Container component that manages dashboard state and connects to use cases
 */
export function DashboardContainer({ userId }: DashboardContainerProps) {
  const { viewModel, dashboardData, isLoading, error, refetch } = usePortfolio(userId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage 
          message="Failed to load dashboard data" 
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!viewModel || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message="No data available" />
      </div>
    );
  }

  return (
    <DashboardView 
      viewModel={viewModel}
      dashboardData={dashboardData}
      onRefresh={refetch}
    />
  );
}
