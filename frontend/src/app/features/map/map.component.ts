import { AfterViewInit, Component, OnDestroy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n.service';
import { ProfileService } from '../../core/profile.service';
import { EventCard } from '../../core/models';
import { categoryEmoji, distanceLabel } from '../../shared/format';

@Component({
  selector: 'app-map',
  standalone: true,
  template: `
    <div class="animate-slide-up">
      <h1 class="text-2xl font-black">{{ i18n.t('map.title') }}</h1>
      <p class="mt-0.5 text-sm text-ink-soft">{{ i18n.t('map.hint') }}</p>
    </div>

    <div class="card mt-4 overflow-hidden p-0">
      <div id="expo-map" class="h-[52vh] w-full"></div>
    </div>

    <div class="mt-3 flex items-center gap-3 text-xs font-semibold text-ink-soft">
      <span class="inline-flex items-center gap-1.5">
        <span class="h-3 w-3 rounded-full bg-expo-purple"></span>{{ i18n.t('map.you') }}
      </span>
      <span class="inline-flex items-center gap-1.5">
        <span class="h-3 w-3 rounded-full bg-expo-gold"></span>{{ i18n.t('map.event') }}
      </span>
      <button
        type="button"
        (click)="toggleRadius()"
        class="ms-auto rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold"
      >
        {{ i18n.t('feed.radius') }}: {{ radius() }} {{ i18n.t('common.meters') }}
      </button>
    </div>

    <div class="mt-4 space-y-2">
      @for (card of nearest(); track card.id) {
        <button
          type="button"
          (click)="openDetail(card)"
          class="card flex w-full items-center gap-3 p-3 text-start"
        >
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl text-white"
            [style.background]="'linear-gradient(135deg, ' + card.category.colorStart + ', ' + card.category.colorEnd + ')'"
          >
            {{ emoji(card) }}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-bold">{{ title(card) }}</span>
            <span class="block text-xs text-ink-soft">
              {{ dist(card) }}<span class="mx-1">•</span>{{ card.matchScore }}% {{ i18n.t('feed.match') }}
            </span>
          </span>
          <span class="text-lg text-ink-soft">›</span>
        </button>
      }
    </div>
  `,
})
export class MapComponent implements AfterViewInit, OnDestroy {
  protected readonly i18n = inject(I18nService);
  protected readonly profile = inject(ProfileService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  protected readonly cards = signal<EventCard[]>([]);
  protected readonly radius = signal(600);

  private map?: L.Map;
  private visitorMarker?: L.Marker;
  private radiusCircle?: L.Circle;
  private eventLayer?: L.LayerGroup;

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }
    setTimeout(() => this.initMap(), 0);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMap(): void {
    const center = this.profile.config()?.siteCenter ?? { lat: 24.878738040594087, lng: 46.70069308320736 };
    this.radius.set(this.profile.config()?.defaultRadiusMeters ?? 600);
    const visitor = this.profile.visitor();
    const start = {
      lat: visitor?.latitude ?? center.lat,
      lng: visitor?.longitude ?? center.lng,
    };

    this.map = L.map('expo-map', { zoomControl: true, attributionControl: false }).setView(
      [start.lat, start.lng],
      16,
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    this.radiusCircle = L.circle([start.lat, start.lng], {
      radius: this.radius(),
      color: '#47266c',
      weight: 1.5,
      fillColor: '#95629e',
      fillOpacity: 0.08,
    }).addTo(this.map);

    this.visitorMarker = L.marker([start.lat, start.lng], {
      draggable: true,
      icon: this.dotIcon('#47266c', '🧍'),
    }).addTo(this.map);
    this.visitorMarker.on('dragend', () => this.onVisitorMoved());

    this.eventLayer = L.layerGroup().addTo(this.map);
    this.loadEvents();
  }

  private loadEvents(): void {
    const id = this.profile.visitorId;
    if (!id || !this.map) {
      return;
    }
    this.api.getRecommendations(id, 120, undefined, 40).subscribe((response) => {
      this.cards.set(response.cards);
      this.renderEvents(response.cards);
      this.fitBounds();
    });
  }

  private renderEvents(cards: EventCard[]): void {
    if (!this.eventLayer) {
      return;
    }
    this.eventLayer.clearLayers();
    for (const card of cards) {
      const marker = L.marker([card.venue.latitude, card.venue.longitude], {
        icon: this.dotIcon(card.category.colorStart, categoryEmoji(card.category.code)),
      });
      marker.bindTooltip(
        `${this.i18n.lang() === 'ar' ? card.titleAr : card.titleEn} — ${card.matchScore}%`,
        { direction: 'top' },
      );
      marker.on('click', () => this.router.navigate(['/events', card.id]));
      marker.addTo(this.eventLayer);
    }
  }

  private onVisitorMoved(): void {
    if (!this.visitorMarker) {
      return;
    }
    const position = this.visitorMarker.getLatLng();
    this.profile.setLocalLocation(position.lat, position.lng);
    this.radiusCircle?.setLatLng(position);
    this.profile.updateProfile({ latitude: position.lat, longitude: position.lng }).then(() => {
      this.loadEvents();
    });
  }

  protected toggleRadius(): void {
    const options = [200, 400, 600, 1000, 2000];
    const current = options.indexOf(this.radius());
    const next = options[(current + 1) % options.length];
    this.radius.set(next);
    this.radiusCircle?.setRadius(next);
  }

  protected nearest(): EventCard[] {
    return [...this.cards()]
      .sort((a, b) => (a.distanceMeters ?? 1e9) - (b.distanceMeters ?? 1e9))
      .slice(0, 6);
  }

  protected openDetail(card: EventCard): void {
    this.router.navigate(['/events', card.id]);
  }

  protected title(card: EventCard): string {
    return this.i18n.lang() === 'ar' ? card.titleAr : card.titleEn;
  }

  protected dist(card: EventCard): string {
    return distanceLabel(card.distanceMeters, this.i18n.lang());
  }

  protected emoji(card: EventCard): string {
    return categoryEmoji(card.category.code);
  }

  private fitBounds(): void {
    if (!this.map || this.cards().length === 0) {
      return;
    }
    const points: L.LatLngExpression[] = this.cards().map((c) => [c.venue.latitude, c.venue.longitude]);
    if (this.visitorMarker) {
      points.push(this.visitorMarker.getLatLng());
    }
    this.map.fitBounds(L.latLngBounds(points).pad(0.25));
  }

  private dotIcon(color: string, label: string): L.DivIcon {
    return L.divIcon({
      className: '',
      html: `<span style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:${color};color:#fff;font-size:16px;box-shadow:0 4px 12px rgba(0,0,0,.35);border:2px solid #fff">${label}</span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  }
}
