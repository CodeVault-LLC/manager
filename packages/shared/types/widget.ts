export interface IDashboardWidget<T = any> {
  name: string;
  description: string;
  status?: "beta" | "stable";
  data?: IDashboardWidget<T>;
}
