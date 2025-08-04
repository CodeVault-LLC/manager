export interface IModule {
  /**
   * A hook ran when the Electron window has loaded
   * @param appWindow AppWindow
   * @returns
   */
  onWindowLoad: (appWindow: any) => void;

  addSidebarItem: (item: any) => void;

  getSidebarItems: () => {
    id: string; // e.g., 'entertainment-movies'
    label: string;
    icon: string; // Icon name from a library like lucide-react
    path: string; // React Router path
  }[];
}
