import type { Display } from "./display";

export interface Certification {
  id: number;
  hospital_id: string;
  display_ids: Display["id"][];
  section_images: Record<Display["id"], string>;
  total_remuneration: number;
  created_at: Date | number | string;
}
