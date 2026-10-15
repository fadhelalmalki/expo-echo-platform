import { Injectable, computed, signal } from '@angular/core';

export type Lang = 'ar' | 'en';

type Dict = Record<string, string>;

const TRANSLATIONS: Record<Lang, Dict> = {
  ar: {
    brand: 'إكسبو إيكو',
    tagline: 'رفيقك الذكي في إكسبو 2030 الرياض',
    'app.logoAlt': 'شعار إكسبو إيكو',
    appName: 'إكسبو إيكو',

    'nav.feed': 'لك',
    'nav.map': 'الخريطة',
    'nav.bookings': 'مواعيدي',
    'nav.profile': 'حسابي',

    'onboarding.welcome': 'أهلاً بك في إكسبو 2030 الرياض',
    'onboarding.chooseLanguage': 'اختر لغتك',
    'onboarding.subtitle': 'أخبرنا عن اهتماماتك لنقترح لك أفضل الفعاليات القريبة منك الآن.',
    'onboarding.yourName': 'اسمك',
    'onboarding.namePlaceholder': 'اكتب اسمك',
    'onboarding.pickInterests': 'اختر اهتماماتك',
    'onboarding.interestsHint': 'اختر واحداً على الأقل',
    'onboarding.availableTime': 'الوقت المتاح لديك',
    'onboarding.start': 'ابدأ الاستكشاف',
    'onboarding.needName': 'الرجاء إدخال الاسم',
    'onboarding.needInterest': 'الرجاء اختيار اهتمام واحد على الأقل',
    'onboarding.locationHint': 'افتراضياً سنضعك في موقع إكسبو لمحاكاة التجربة.',
    'onboarding.atExpoSite': 'أنت في موقع إكسبو',
    'onboarding.enableNotifications': 'تفعيل التنبيهات',
    'onboarding.step': 'خطوة',

    'feed.title': 'مقترح لك',
    'feed.forYou': 'مخصص حسب اهتماماتك',
    'feed.match': 'نسبة التطابق',
    'feed.away': 'على بعد',
    'feed.startsIn': 'يبدأ خلال',
    'feed.now': 'الآن',
    'feed.started': 'بدأ بالفعل',
    'feed.walkMin': 'د مشي',
    'feed.confirm': 'تأكيد الحضور',
    'feed.confirmed': 'تم التأكيد',
    'feed.full': 'مكتمل',
    'feed.seatsLeft': 'مقعد متبقٍ',
    'feed.refresh': 'تحديث',
    'feed.reset': 'إعادة الضبط',
    'feed.resetConfirm': 'اضغط مرة أخرى للتأكيد',
    'feed.noResults': 'لا توجد فعاليات قريبة الآن',
    'feed.noResultsHint': 'جرّب توسيع الوقت المتاح أو تغيير الاهتمامات.',
    'feed.why': 'لماذا هذا؟',
    'feed.filterAll': 'الكل',
    'feed.radius': 'النطاق',
    'feed.timeWindow': 'الوقت',

    'map.title': 'خريطة موقع إكسبو',
    'map.hint': 'اسحب مؤشر موقعك لتحديث المسافات',
    'map.you': 'موقعك',
    'map.event': 'الفعاليات',
    'map.eventsByCategory': 'الفعاليات (حسب التصنيف)',
    'map.nearest': 'أقرب الفعاليات',
    'map.recenter': 'إعادة التمركز',
    'map.legend': 'الأساطير',

    'bookings.title': 'مواعيدي',
    'bookings.empty': 'لا توجد حجوزات بعد',
    'bookings.emptyHint': 'احجز فعالية من الصفحة الرئيسية لتظهر هنا.',
    'bookings.cancel': 'إلغاء',
    'bookings.confirmed': 'مؤكد',
    'bookings.cancelled': 'ملغى',
    'bookings.upcoming': 'القادمة',
    'bookings.reminder': 'تنبيه قبل',
    'bookings.minutes': 'دقيقة',
    'bookings.explore': 'استكشف الفعاليات',

    'detail.about': 'عن الفعالية',
    'detail.whyThisMatch': 'لماذا يناسبك؟',
    'detail.score': 'نسبة التطابق',
    'detail.interestFit': 'التزامن مع اهتماماتك',
    'detail.distance': 'القرب',
    'detail.timing': 'التوقيت',
    'detail.availability': 'المقاعد',
    'detail.popularity': 'الشعبية',
    'detail.book': 'تأكيد الحضور',
    'detail.booked': 'أنت مسجل',
    'detail.cancel': 'إلغاء الحضور',
    'detail.venue': 'الموقع',
    'detail.language': 'اللغة',
    'detail.seats': 'المقاعد المتاحة',
    'detail.tags': 'الوسوم',
    'detail.back': 'رجوع',
    'detail.gettingThere': 'وقت الوصول سيراً',

    'profile.title': 'حسابي',
    'profile.name': 'الاسم',
    'profile.interests': 'الاهتمامات',
    'profile.time': 'الوقت المتاح',
    'profile.save': 'حفظ التغييرات',
    'profile.saved': 'تم الحفظ',
    'profile.language': 'اللغة',
    'profile.notifications': 'الإشعارات',
    'profile.notifOff': 'الإشعارات معطلة',
    'profile.notifOn': 'الإشعارات مفعّلة',
    'profile.location': 'الموقع',
    'profile.reset': 'إعادة الضبط',

    'notif.enable': 'تفعيل الإشعارات',
    'notif.enabled': 'تم تفعيل الإشعارات',
    'notif.denied': 'تم رفض الإشعارات من المتصفح',
    'notif.skip': 'لاحقاً',
    'notif.muted': 'تم إيقاف التذكيرات',
    'notif.test': 'إرسال إشعار تجريبي',
    'notif.sent': 'تم إرسال إشعار تجريبي',
    'notif.reminderTitle': 'تذكير فعالية',

    'common.minutesShort': 'د',
    'common.meters': 'م',
    'common.km': 'كم',
    'common.loading': 'جارٍ التحميل...',
    'common.error': 'حدث خطأ',
    'common.retry': 'إعادة المحاولة',
    'common.close': 'إغلاق',
    'common.back': 'رجوع',
    'common.arabic': 'العربية',
    'common.english': 'English',
    'common.language': 'اللغة',
    'common.of': 'من',
  },
  en: {
    brand: 'Expo Echo',
    tagline: 'Your smart companion at Expo 2030 Riyadh',
    'app.logoAlt': 'Expo Echo logo',
    appName: 'Expo Echo',

    'nav.feed': 'For You',
    'nav.map': 'Map',
    'nav.bookings': 'My Plan',
    'nav.profile': 'Profile',

    'onboarding.welcome': 'Welcome to Expo 2030 Riyadh',
    'onboarding.chooseLanguage': 'Choose your language',
    'onboarding.subtitle': "Tell us your interests and we'll suggest the best events near you right now.",
    'onboarding.yourName': 'Your name',
    'onboarding.namePlaceholder': 'Enter your name',
    'onboarding.pickInterests': 'Pick your interests',
    'onboarding.interestsHint': 'Choose at least one',
    'onboarding.availableTime': 'Time available',
    'onboarding.start': 'Start exploring',
    'onboarding.needName': 'Please enter your name',
    'onboarding.needInterest': 'Please pick at least one interest',
    'onboarding.locationHint': 'By default we place you at the Expo site to simulate the experience.',
    'onboarding.atExpoSite': 'You are at the Expo site',
    'onboarding.enableNotifications': 'Enable notifications',
    'onboarding.step': 'Step',

    'feed.title': 'Recommended for you',
    'feed.forYou': 'Personalized to your interests',
    'feed.match': 'match',
    'feed.away': 'away',
    'feed.startsIn': 'starts in',
    'feed.now': 'now',
    'feed.started': 'already started',
    'feed.walkMin': 'min walk',
    'feed.confirm': 'Confirm attendance',
    'feed.confirmed': 'Confirmed',
    'feed.full': 'Full',
    'feed.seatsLeft': 'seats left',
    'feed.refresh': 'Refresh',
    'feed.reset': 'Reset',
    'feed.resetConfirm': 'Tap again to confirm',
    'feed.noResults': 'No nearby events right now',
    'feed.noResultsHint': 'Try a longer time window or different interests.',
    'feed.why': 'Why this?',
    'feed.filterAll': 'All',
    'feed.radius': 'Radius',
    'feed.timeWindow': 'Time',

    'map.title': 'Expo site map',
    'map.hint': 'Drag your marker to update distances',
    'map.you': 'You',
    'map.event': 'Events',
    'map.eventsByCategory': 'Events (by category)',
    'map.nearest': 'Nearest events',
    'map.recenter': 'Recenter',
    'map.legend': 'Legend',

    'bookings.title': 'My plan',
    'bookings.empty': 'No bookings yet',
    'bookings.emptyHint': 'Book an event from the feed and it will show up here.',
    'bookings.cancel': 'Cancel',
    'bookings.confirmed': 'Confirmed',
    'bookings.cancelled': 'Cancelled',
    'bookings.upcoming': 'Upcoming',
    'bookings.reminder': 'Reminder',
    'bookings.minutes': 'min before',
    'bookings.explore': 'Explore events',

    'detail.about': 'About this event',
    'detail.whyThisMatch': 'Why it fits you',
    'detail.score': 'Match score',
    'detail.interestFit': 'Interest fit',
    'detail.distance': 'Proximity',
    'detail.timing': 'Timing',
    'detail.availability': 'Availability',
    'detail.popularity': 'Popularity',
    'detail.book': 'Confirm attendance',
    'detail.booked': "You're in",
    'detail.cancel': 'Cancel attendance',
    'detail.venue': 'Venue',
    'detail.language': 'Language',
    'detail.seats': 'Seats left',
    'detail.tags': 'Tags',
    'detail.back': 'Back',
    'detail.gettingThere': 'Walking time',

    'profile.title': 'Profile',
    'profile.name': 'Name',
    'profile.interests': 'Interests',
    'profile.time': 'Available time',
    'profile.save': 'Save changes',
    'profile.saved': 'Saved',
    'profile.language': 'Language',
    'profile.notifications': 'Notifications',
    'profile.notifOff': 'Notifications off',
    'profile.notifOn': 'Notifications on',
    'profile.location': 'Location',
    'profile.reset': 'Reset',

    'notif.enable': 'Enable notifications',
    'notif.enabled': 'Notifications enabled',
    'notif.denied': 'Browser blocked notifications',
    'notif.skip': 'Not now',
    'notif.muted': 'Reminders turned off',
    'notif.test': 'Send a test notification',
    'notif.sent': 'Test notification sent',
    'notif.reminderTitle': 'Event reminder',

    'common.minutesShort': 'min',
    'common.meters': 'm',
    'common.km': 'km',
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.retry': 'Retry',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.arabic': 'العربية',
    'common.english': 'English',
    'common.language': 'Language',
    'common.of': 'of',
  },
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(this.initialLang());
  readonly dir = computed(() => (this.lang() === 'ar' ? 'rtl' : 'ltr'));
  readonly isRtl = computed(() => this.lang() === 'ar');

  constructor() {
    this.applyToDocument();
  }

  t(key: string): string {
    const lang = this.lang();
    return TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? key;
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
    localStorage.setItem('expoecho.lang', lang);
    this.applyToDocument();
  }

  toggle(): void {
    this.setLang(this.lang() === 'ar' ? 'en' : 'ar');
  }

  private initialLang(): Lang {
    const stored = localStorage.getItem('expoecho.lang');
    if (stored === 'ar' || stored === 'en') {
      return stored;
    }
    const browser = typeof navigator !== 'undefined' ? navigator.language?.toLowerCase() ?? '' : '';
    return browser.startsWith('ar') ? 'ar' : 'en';
  }

  private applyToDocument(): void {
    const html = document.documentElement;
    html.setAttribute('lang', this.lang());
    html.setAttribute('dir', this.dir());
  }
}
