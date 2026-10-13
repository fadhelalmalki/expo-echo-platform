export interface Category {
  id: number;
  code: string;
  nameEn: string;
  nameAr: string;
  colorStart: string;
  colorEnd: string;
  icon: string;
}

export interface Venue {
  id: number;
  nameEn: string;
  nameAr: string;
  areaCode: string;
  latitude: number;
  longitude: number;
}

export interface ScoreBreakdown {
  interest: number;
  proximity: number;
  timing: number;
  capacity: number;
  popularity: number;
}

export interface EventCard {
  id: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: Category;
  venue: Venue;
  startAt: string;
  endAt: string;
  capacity: number;
  bookedCount: number;
  seatsLeft: number;
  language: string;
  tags: string[];
  imageUrl: string | null;
  matchScore: number;
  breakdown: ScoreBreakdown;
  distanceMeters: number | null;
  minutesToStart: number;
  walkMinutes: number;
  booked: boolean;
  full: boolean;
  aiReasonEn: string | null;
  aiReasonAr: string | null;
}

export interface Visitor {
  id: string;
  displayName: string;
  interests: Category[];
  availableMinutes: number | null;
  latitude: number | null;
  longitude: number | null;
}

export interface RecommendationResponse {
  cards: EventCard[];
  generatedAt: string;
  radiusMeters: number;
  availableMinutes: number | null;
  visitor: Visitor;
}

export interface Booking {
  id: number;
  eventId: number;
  titleEn: string;
  titleAr: string;
  venueNameEn: string;
  venueNameAr: string;
  startAt: string;
  endAt: string;
  category: Category;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

export interface AppNotification {
  id: number;
  eventId: number;
  titleEn: string;
  titleAr: string;
  venueNameEn: string;
  venueNameAr: string;
  fireAt: string;
  startAt: string;
  messageEn: string;
  messageAr: string;
  sent: boolean;
}

export interface AppConfig {
  siteCenter: { lat: number; lng: number };
  defaultRadiusMeters: number;
  maxRadiusMeters: number;
  walkSpeedMetersPerMinute: number;
  reminderLeadMinutes: number;
  aiEnabled: boolean;
}
