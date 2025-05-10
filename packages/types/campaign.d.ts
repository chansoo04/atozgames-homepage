export type CampaignRecruit = {
  id: number;
  title: string;
  type: "local" | "online";
  thumbnail: string;
  views: number;
  start_date: string;
  end_date: string;
  pickup_end_date: string;
  applied_count: number;
  product_id: number;
  location?: string[];
  left_pcs?: number;
};

export type CampaignApplication = {
  id: number;
  content: any;
};
