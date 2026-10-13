import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AppConfig,
  AppNotification,
  Booking,
  Category,
  EventCard,
  RecommendationResponse,
  Visitor,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api';

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/categories`);
  }

  getConfig(): Observable<AppConfig> {
    return this.http.get<AppConfig>(`${this.base}/config`);
  }

  createVisitor(payload: {
    displayName: string;
    interestCodes: string[];
    availableMinutes: number;
    latitude: number;
    longitude: number;
  }): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.base}/visitors`, payload);
  }

  updateVisitor(
    id: string,
    payload: {
      interestCodes?: string[];
      availableMinutes?: number;
      latitude?: number;
      longitude?: number;
    },
  ): Observable<Visitor> {
    return this.http.put<Visitor>(`${this.base}/visitors/${id}`, payload);
  }

  getVisitor(id: string): Observable<Visitor> {
    return this.http.get<Visitor>(`${this.base}/visitors/${id}`);
  }

  getRecommendations(
    visitorId: string,
    minutes?: number,
    radius?: number,
    limit = 20,
  ): Observable<RecommendationResponse> {
    const params: Record<string, string> = { visitorId, limit: String(limit) };
    if (minutes) {
      params['minutes'] = String(minutes);
    }
    if (radius) {
      params['radius'] = String(radius);
    }
    return this.http.get<RecommendationResponse>(`${this.base}/recommendations`, { params });
  }

  getEvent(id: number): Observable<EventCard | null> {
    return this.http.get<EventCard | null>(`${this.base}/events/${id}`);
  }

  book(visitorId: string, eventId: number): Observable<Booking> {
    return this.http.post<Booking>(`${this.base}/bookings`, { visitorId, eventId });
  }

  cancel(visitorId: string, eventId: number): Observable<Booking> {
    return this.http.delete<Booking>(`${this.base}/bookings`, {
      params: { visitorId, eventId: String(eventId) },
    });
  }

  getBookings(visitorId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.base}/bookings`, { params: { visitorId } });
  }

  getNotifications(visitorId: string): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.base}/notifications`, { params: { visitorId } });
  }

  calendarUrl(eventId: number): string {
    return `${this.base}/events/${eventId}/calendar.ics`;
  }
}
