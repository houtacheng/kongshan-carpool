import type { Event, CarpoolOffer, RideRequest } from '../types';

export const EAST_COAST_AREAS = [
  '全美東區域',
  '法拉盛 Flushing (NY)',
  '曼哈頓華埠 Chinatown (NY)',
  '布魯克林 Brooklyn (NY)',
  '長島 Long Island (NY)',
  '新澤西 Fort Lee / Edison (NJ)',
  '威徹斯特 Westchester (NY)',
  '康州 Connecticut (CT)',
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt-2026-pucha',
    title: '空山寺中秋普茶',
    theme: '《以法團圓．以心相聚》——明月之光，永耀藍空',
    subtitle: '值此中秋佳節，空山寺誠摯邀請您與家人法友齊聚湖畔，共度一場充滿法喜與溫暖的中秋普茶活動。',
    date: '2026年9月27日（週日）',
    templeName: '空山寺 (Kong Shan Temple)',
    location: '174 Hynes RD, Poughquag, NY 12570',
    volunteerArrivalTime: '08:00 前抵達寺院（素烤備料、會場佈置、交通接待）',
    attendeeArrivalTime: '09:00 ~ 09:30 入寺，09:30 湖畔集合',
    assemblyNotes: '午間於湖畔共享素烤盛宴，下午由各班分享學習心得與修學收穫，並進行廣論快問快答。美東各區車程約 1.5 ~ 2 小時，請大家寬裕估算時間。',
    reminders: [
      '各班請自備野餐墊和環保餐具、水杯。',
      '各班要準備班級總結（每班要報名）。',
      '廣論班快問快答範圍：業果。',
      '空山寺備有湖畔素烤豐盛食材供大眾共享。'
    ],
    schedule: [
      { time: '09:00 ~ 09:30', activity: '入寺報到', detail: '大眾抵達寺院停車整裝' },
      { time: '09:30', activity: '湖畔集合', detail: '湖畔草坪集合' },
      { time: '09:30 ~ 10:15', activity: '中秋課誦 + 繞湖持咒共修', detail: '緣起讚、廣論祈願文、密集嘛', highlight: true },
      { time: '10:15 ~ 11:00', activity: '休息（移動至佛堂）', detail: '整隊入佛堂' },
      { time: '11:00 ~ 11:15', activity: '法師中秋開示', detail: '聆聽法師慈悲開示' },
      { time: '11:15 ~ 11:45', activity: '佛前大供', detail: '莊嚴供佛' },
      { time: '11:45 ~ 14:00', activity: '湖畔素烤盛宴', detail: '湖畔共享素烤、交流法誼', highlight: true },
      { time: '14:00 ~ 15:30', activity: '湖畔總結與快問快答', detail: '各班學習總結 (45 min) • 廣論快問快答：業果 (20 min) • 空山寺總結+結示 (25 min)', highlight: true },
      { time: '15:30 ~ 16:30', activity: '善後整理 / 賦歸', detail: '正行大眾賦歸（15:30）/ 義工善後整理完畢賦歸（16:30）' }
    ]
  }
];

export const INITIAL_OFFERS: CarpoolOffer[] = [
  {
    id: 'offer-flushing-1',
    eventId: 'evt-2026-pucha',
    driverName: '林先生',
    driverPhone: '917-234-5678',
    wechatOrLine: 'lin_ny_car',
    departureArea: '法拉盛 Flushing (NY)',
    departurePoint: '緬街 7 號地鐵站旁 Sheraton 喜來登飯店大門口',
    carModel: 'Toyota Sienna (8人座豪華休旅車)',
    carColor: '珍珠白',
    plateNumber: 'NY • KST-888',
    notes: '去程專為【義工】提早出發（協助素烤備料）；回程則於【15:30 活動結束】後返回法拉盛，歡迎義工或正行朋友搭乘。',
    hasOutbound: true,
    outboundTime: '06:30 出發 (約 07:50 抵達寺院備料)',
    outboundMode: 'volunteer', // 義工車
    outboundTotalSeats: 6,
    outboundAvailableSeats: 3,
    outboundPassengers: [
      {
        id: 'p-fl-1',
        name: '陳女士 (素烤備餐組義工)',
        phone: '646-111-2222',
        passengerCount: 2,
        role: 'volunteer',
        pickupNote: '喜來登大門準時等候',
        bookedAt: '2026-09-20 10:15',
      },
      {
        id: 'p-fl-2',
        name: '王先生 (會場組義工)',
        phone: '718-333-4444',
        passengerCount: 1,
        role: 'volunteer',
        pickupNote: '準時集合',
        bookedAt: '2026-09-21 14:20',
      }
    ],
    hasReturn: true,
    returnTime: '15:30 活動總結後返回',
    returnMode: 'attendee', // 正行車
    returnTotalSeats: 6,
    returnAvailableSeats: 4,
    returnPassengers: [
      {
        id: 'p-fl-ret-1',
        name: '張先生 (正行參加者)',
        phone: '929-555-6666',
        passengerCount: 2,
        role: 'attendee',
        pickupNote: '同車返回法拉盛',
        bookedAt: '2026-09-22 09:30',
      }
    ],
    createdAt: '2026-09-18 11:00',
  },
  {
    id: 'offer-nj-1',
    eventId: 'evt-2026-pucha',
    driverName: '陳女士',
    driverPhone: '201-987-6543',
    wechatOrLine: 'chen_fortlee',
    departureArea: '新澤西 Fort Lee / Edison (NJ)',
    departurePoint: 'Fort Lee 喬治華盛頓大橋旁 H Mart 超市停車場',
    carModel: 'Honda CR-V (5人座SUV)',
    carColor: '鐵灰色',
    plateNumber: 'NJ • ZEN-168',
    notes: '【正行專車】配合 09:00~09:30 入寺，回程 15:30 活動結束後返回新澤西。',
    hasOutbound: true,
    outboundTime: '07:40 出發 (約 09:10 抵達寺院入寺)',
    outboundMode: 'attendee',
    outboundTotalSeats: 3,
    outboundAvailableSeats: 1,
    outboundPassengers: [
      {
        id: 'p-nj-1',
        name: '劉先生夫婦 (正行參加者)',
        phone: '201-333-7777',
        passengerCount: 2,
        role: 'attendee',
        pickupNote: 'H Mart 集合',
        bookedAt: '2026-09-21 16:00',
      }
    ],
    hasReturn: true,
    returnTime: '15:30 活動結束後返回',
    returnMode: 'attendee',
    returnTotalSeats: 3,
    returnAvailableSeats: 1,
    returnPassengers: [
      {
        id: 'p-nj-1',
        name: '劉先生夫婦 (正行參加者)',
        phone: '201-333-7777',
        passengerCount: 2,
        role: 'attendee',
        pickupNote: '同車返回 NJ',
        bookedAt: '2026-09-21 16:00',
      }
    ],
    createdAt: '2026-09-19 09:30',
  },
  {
    id: 'offer-chinatown-1',
    eventId: 'evt-2026-pucha',
    driverName: '黃先生 (交通接待組)',
    driverPhone: '917-888-9999',
    departureArea: '曼哈頓華埠 Chinatown (NY)',
    departurePoint: '華埠包厘街孔子大廈正門口 (Bowery St)',
    carModel: 'Subaru Outback (全時四驅休旅車)',
    carColor: '深藍色',
    notes: '去回程皆為【義工組專車】，下午 16:30 場地善後整理完畢後返程。',
    hasOutbound: true,
    outboundTime: '06:15 出發 (約 07:45 抵達寺院)',
    outboundMode: 'volunteer',
    outboundTotalSeats: 4,
    outboundAvailableSeats: 2,
    outboundPassengers: [
      {
        id: 'p-ct-1',
        name: '李先生 (交通接待義工)',
        phone: '917-444-1234',
        passengerCount: 2,
        role: 'volunteer',
        pickupNote: '孔子大廈門口',
        bookedAt: '2026-09-20 08:30',
      }
    ],
    hasReturn: true,
    returnTime: '16:30 善後整理完畢後返回',
    returnMode: 'volunteer',
    returnTotalSeats: 4,
    returnAvailableSeats: 2,
    returnPassengers: [
      {
        id: 'p-ct-1',
        name: '李先生 (交通接待義工)',
        phone: '917-444-1234',
        passengerCount: 2,
        role: 'volunteer',
        pickupNote: '同車返程',
        bookedAt: '2026-09-20 08:30',
      }
    ],
    createdAt: '2026-09-19 15:45',
  },
  {
    id: 'offer-bk-1',
    eventId: 'evt-2026-pucha',
    driverName: '張小姐',
    driverPhone: '347-666-8888',
    departureArea: '布魯克林 Brooklyn (NY)',
    departurePoint: '八大道 60 街華埠超市旁',
    carModel: 'Toyota Highlander (7人座)',
    carColor: '銀色',
    notes: '【正行車次】配合 09:30 湖畔集合，車內寬敞平穩，歡迎長輩同行。',
    hasOutbound: true,
    outboundTime: '07:45 出發 (約 09:20 抵達寺院入寺)',
    outboundMode: 'attendee',
    outboundTotalSeats: 4,
    outboundAvailableSeats: 4,
    outboundPassengers: [],
    hasReturn: true,
    returnTime: '15:30 活動結束返回',
    returnMode: 'attendee',
    returnTotalSeats: 4,
    returnAvailableSeats: 4,
    returnPassengers: [],
    createdAt: '2026-09-20 18:00',
  }
];

export const INITIAL_REQUESTS: RideRequest[] = [
  {
    id: 'req-1',
    eventId: 'evt-2026-pucha',
    passengerName: '趙奶奶 (素烤備餐長輩)',
    passengerPhone: '917-555-1212',
    pickupArea: '法拉盛 Flushing (NY)',
    pickupPoint: '緬街法拉盛圖書館門口',
    passengerCount: 1,
    needOutbound: true,
    outboundRole: 'volunteer', // 去程需要義工早車 (08:00前到)
    needReturn: true,
    returnRole: 'attendee',   // 回程想搭正行車 (15:30結束後提早回家休息)
    notes: '長輩提早去協助洗切素烤食材，希望活動於 15:30 總結後就能隨正行車返回法拉盛。',
    status: 'pending',
    createdAt: '2026-09-21 11:20',
  },
  {
    id: 'req-2',
    eventId: 'evt-2026-pucha',
    passengerName: '何先生夫婦 (廣論班學員)',
    passengerPhone: '718-999-7777',
    pickupArea: '布魯克林 Brooklyn (NY)',
    pickupPoint: '八大道 N 車地鐵站旁',
    passengerCount: 2,
    needOutbound: true,
    outboundRole: 'attendee', // 正行參加中秋普茶
    needReturn: true,
    returnRole: 'attendee',
    notes: '正行參加者，可自備野餐墊及環保餐具，時間配合車主。',
    status: 'pending',
    createdAt: '2026-09-22 09:00',
  }
];
