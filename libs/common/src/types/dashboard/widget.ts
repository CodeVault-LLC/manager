export interface IDashboardWidgetItem {
  id: string;
  type: string;

  name: string;
  description: string;

  layout: Record<string, { x: number; y: number; w: number; h: number }>;
  static?: boolean;
  settings?: Record<string, any>;

  active: boolean;
  data?: any;
}
