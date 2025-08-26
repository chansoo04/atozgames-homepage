export interface Display {
  id: number;
  /**
   * @min 1
   */
  section_no: number;
  product_id: number;
  name: string;
  thumbnail: string;
  remuneration_fee: number;
  start_at: Date | number | string;
  end_at: Date | number | string;
}

export interface MerchantDisplayItem {
  id: number;
  title: string;
  image: string;
  price: number;
  cost: number;
  hospital: number;
}

export interface MerchantOfflineCampaignItem {
  id: number;
  title: string;
  thumbnail: string;
  hospital: number;
  start_date;
  end_date;
  pickup_date;
  date;
  picktup_end;
}
