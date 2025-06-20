export type TPaginationInfo = {
    count: number;
    extra_stats: string | null;
    next_cursor: string;
    next_page_results: boolean;
    prev_cursor: string;
    prev_page_results: boolean;
    total_pages: number;
    per_page?: number;
    total_results: number;
  };