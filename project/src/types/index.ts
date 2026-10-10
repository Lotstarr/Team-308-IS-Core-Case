export interface Profile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  school: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Discount {
  id: string;
  company: string;
  title: string;
  description: string;
  discount_type: 'free' | 'percentage' | 'fixed';
  discount_value: string;
  category: string;
  access_instructions: string;
  website_url: string;
  is_starving_student: boolean;
  is_new: boolean;
  is_ai: boolean;
  is_subscription: boolean;
  image_url: string | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface FoodEvent {
  id: string;
  title: string;
  description: string;
  food_type: string;
  date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  room_number: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface SavedDiscount {
  id: string;
  user_id: string;
  discount_id: string;
  created_at: string;
}

export interface SavedEvent {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
}

export interface UsedDeal {
  id: string;
  user_id: string;
  discount_id: string;
  created_at: string;
}

export type PageName =
  | 'home'
  | 'login'
  | 'signup'
  | 'profile'
  | 'discount-dashboard'
  | 'starving-student-hub'
  | 'free-food'
  | 'calendar'
  | 'map';

export interface DealCategory {
  id: string;
  label: string;
  icon: string;
}
