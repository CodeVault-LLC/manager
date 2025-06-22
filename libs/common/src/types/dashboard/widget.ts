export interface IDashboardWidgetItem {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
  settings?: Record<string, any>;

  active: boolean;
  data?: any;
}
