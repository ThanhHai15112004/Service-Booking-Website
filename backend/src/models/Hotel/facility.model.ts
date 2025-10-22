export interface Facility {
  facility_id: string;
  name: string;
  category: "HOTEL" | "ROOM";
  icon?: string;
  created_at?: Date;
}
