import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AppConfig, Category, Visitor } from './models';

const VISITOR_KEY = 'expoecho.visitorId';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ApiService);

  readonly visitor = signal<Visitor | null>(null);
  readonly categories = signal<Category[]>([]);
  readonly config = signal<AppConfig | null>(null);
  readonly ready = signal(false);

  loadReferenceData(): void {
    this.api.getCategories().subscribe((c) => this.categories.set(c));
    this.api.getConfig().subscribe((c) => this.config.set(c));
  }

  init(): void {
    const id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      this.ready.set(true);
      return;
    }
    this.api.getVisitor(id).subscribe({
      next: (v) => {
        this.visitor.set(v);
        this.ready.set(true);
      },
      error: () => {
        localStorage.removeItem(VISITOR_KEY);
        this.ready.set(true);
      },
    });
  }

  createProfile(payload: {
    displayName: string;
    interestCodes: string[];
    availableMinutes: number;
    latitude: number;
    longitude: number;
  }): Promise<Visitor> {
    return new Promise((resolve, reject) => {
      this.api.createVisitor(payload).subscribe({
        next: (v) => {
          localStorage.setItem(VISITOR_KEY, v.id);
          this.visitor.set(v);
          resolve(v);
        },
        error: reject,
      });
    });
  }

  updateProfile(payload: {
    interestCodes?: string[];
    availableMinutes?: number;
    latitude?: number;
    longitude?: number;
  }): Promise<Visitor> {
    const current = this.visitor();
    if (!current) {
      return Promise.reject(new Error('No visitor profile'));
    }
    return new Promise((resolve, reject) => {
      this.api.updateVisitor(current.id, payload).subscribe({
        next: (v) => {
          this.visitor.set(v);
          resolve(v);
        },
        error: reject,
      });
    });
  }

  setLocalLocation(lat: number, lng: number): void {
    const current = this.visitor();
    if (current) {
      this.visitor.set({ ...current, latitude: lat, longitude: lng });
    }
  }

  reset(): void {
    localStorage.removeItem(VISITOR_KEY);
    this.visitor.set(null);
  }

  get visitorId(): string | null {
    return this.visitor()?.id ?? localStorage.getItem(VISITOR_KEY);
  }
}
