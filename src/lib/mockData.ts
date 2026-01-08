// Mock cafe data for KahveQR

import { Cafe, AppState } from './types';

export const mockCafes: Cafe[] = [
  {
    id: 'cafe-1',
    name: 'Starbucks',
    distanceKm: 0.2,
    address: 'Bağdat Cad. No:432, Kadıköy',
    openNow: true,
    category: 'Kahve Zinciri',
    program: {
      stampsRequired: 10,
      rewardName: 'Ücretsiz Grande İçecek',
    },
  },
  {
    id: 'cafe-2',
    name: 'Kahve Dünyası',
    distanceKm: 0.4,
    address: 'Teşvikiye Cad. Şişli',
    openNow: true,
    category: 'Türk Kahvesi',
    program: {
      stampsRequired: 8,
      rewardName: 'Ücretsiz Türk Kahvesi',
    },
  },
  {
    id: 'cafe-3',
    name: 'Espresso Lab',
    distanceKm: 0.6,
    address: 'Kemankeş Mah. Karaköy',
    openNow: true,
    category: 'Specialty Coffee',
    program: {
      stampsRequired: 10,
      rewardName: 'Ücretsiz Filtre Kahve',
    },
  },
  {
    id: 'cafe-4',
    name: 'Petra Roasting',
    distanceKm: 0.9,
    address: 'Arnavutköy, Beşiktaş',
    openNow: false,
    category: 'Roastery',
    program: {
      stampsRequired: 10,
      rewardName: 'Ücretsiz Espresso Based',
    },
  },
  {
    id: 'cafe-5',
    name: 'Kronotrop',
    distanceKm: 1.1,
    address: 'Bebek Cad. No:56',
    openNow: true,
    category: 'Specialty Coffee',
    program: {
      stampsRequired: 10,
      rewardName: 'Ücretsiz Filtre Kahve',
    },
  },
  {
    id: 'cafe-6',
    name: 'Mambocino',
    distanceKm: 1.3,
    address: 'Cihangir Mah. Beyoğlu',
    openNow: true,
    category: 'Cafe & Bistro',
    program: {
      stampsRequired: 8,
      rewardName: 'Ücretsiz Kahve + Kurabiye',
    },
  },
  {
    id: 'cafe-7',
    name: 'Motto Coffee',
    distanceKm: 0.5,
    address: 'Nişantaşı, Şişli',
    openNow: true,
    category: 'Specialty Coffee',
    program: {
      stampsRequired: 10,
      rewardName: 'Ücretsiz Latte',
    },
  },
  {
    id: 'cafe-8',
    name: 'Coffee Gutta',
    distanceKm: 0.7,
    address: 'Etiler Mah. Beşiktaş',
    openNow: true,
    category: 'Specialty Coffee',
    program: {
      stampsRequired: 8,
      rewardName: 'Ücretsiz Americano',
    },
  },
  {
    id: 'cafe-9',
    name: 'Fazıl Bey',
    distanceKm: 1.2,
    address: 'Kadıköy Çarşı',
    openNow: true,
    category: 'Türk Kahvesi',
    program: {
      stampsRequired: 8,
      rewardName: 'Ücretsiz Dibek Kahvesi',
    },
  },
  {
    id: 'cafe-10',
    name: 'Gaia Coffee',
    distanceKm: 0.8,
    address: 'Ortaköy, Beşiktaş',
    openNow: true,
    category: 'Specialty Coffee',
    program: {
      stampsRequired: 10,
      rewardName: 'Ücretsiz Flat White',
    },
  },
  {
    id: 'cafe-11',
    name: 'Brew Mood',
    distanceKm: 1.5,
    address: 'Moda Cad. Kadıköy',
    openNow: false,
    category: 'Artisan Coffee',
    program: {
      stampsRequired: 10,
      rewardName: 'Ücretsiz V60 Pour Over',
    },
  },
];

// Initial mock memberships with various states
export const getInitialMockState = (userId: string): Partial<AppState> => ({
  memberships: [
    {
      cafeId: 'cafe-1', // Starbucks - Tamamlanmış (10/10)
      stamps: 10,
      joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastStampAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      cafeId: 'cafe-2', // Kahve Dünyası - Yarım (4/8)
      stamps: 4,
      joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      lastStampAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      cafeId: 'cafe-3', // Espresso Lab - Tamamlanmış (10/10)
      stamps: 10,
      joinedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      lastStampAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      cafeId: 'cafe-4', // Petra - Boş (0/10)
      stamps: 0,
      joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      cafeId: 'cafe-5', // Kronotrop - Yarım (6/10)
      stamps: 6,
      joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      lastStampAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      cafeId: 'cafe-7', // Motto Coffee - Tamamlanmış (10/10)
      stamps: 10,
      joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      lastStampAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      cafeId: 'cafe-8', // Coffee Gutta - Yarım (5/8)
      stamps: 5,
      joinedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      lastStampAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      cafeId: 'cafe-9', // Fazıl Bey - Tamamlanmış (8/8)
      stamps: 8,
      joinedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
      lastStampAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      cafeId: 'cafe-10', // Gaia Coffee - Yarım (3/10)
      stamps: 3,
      joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      lastStampAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    },
    {
      cafeId: 'cafe-11', // Brew Mood - Boş (0/10)
      stamps: 0,
      joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  activities: [],
});