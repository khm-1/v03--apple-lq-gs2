export const mockPortfolioData = [
  { month: 'Jan', value: 750000 },
  { month: 'Feb', value: 785000 },
  { month: 'Mar', value: 820000 },
  { month: 'Apr', value: 795000 },
  { month: 'May', value: 810000 },
  { month: 'Jun', value: 835000 },
  { month: 'Jul', value: 847293 },
  { month: 'Aug', value: 860000 },
  { month: 'Sep', value: 880000 },
  { month: 'Oct', value: 875000 },
  { month: 'Nov', value: 890000 },
  { month: 'Dec', value: 847293 },
];

export const mockAllocationData = [
  { name: 'Technology', value: 45.2, color: '#3b82f6' },
  { name: 'Healthcare', value: 23.8, color: '#22c55e' },
  { name: 'Finance', value: 18.5, color: '#a855f7' },
  { name: 'Energy', value: 12.5, color: '#fb923c' },
];

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};
