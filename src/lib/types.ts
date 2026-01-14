export type Category = {
  id: number;
  name: string;
  event_count: number;
  created_at: string;
  updated_at: string;
};

export type Ticket = {
  id: number;
  price: number;
  name: string;
  tickets_available: number;
  created_at: string;
  updated_at: string;
};

export type Event = {
  id: number;
  name: string;
  description: string;
  venue: string;
  poster: string;
  status: "cancelled" | "postponed" | "active" | "completed";
  category_id: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  tickets: Ticket[];
  category: Category;
};
