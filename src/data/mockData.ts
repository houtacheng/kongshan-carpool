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
    id: 'evt-2026-midautumn',
    title: '空山寺 丙午年中秋祈福大法會',
    subtitle: '月圓人圓 同霑法益 • 普利十方 祈安植福',
    date: '2026年9月27日（週日）',
    templeName: '空山寺 (Kong Shan Temple)',
    location: '174 Hynes RD, Poughquag, NY 12570',
    volunteerArrivalTime: '08:00 前抵達寺院（大寮備齋、壇場陳設、交通接待組）',
    attendeeArrivalTime: '09:45 正行同修報到入席，10:00 法會準時起經',
    assemblyNotes: '美東各區車程約 1.5 ~ 2 小時，請大眾寬裕估算時間。法會備有精緻中秋清淨素齋結緣。',
  }
];

export const INITIAL_OFFERS: CarpoolOffer[] = [
  {
    id: 'offer-flushing-1',
    eventId: 'evt-2026-midautumn',
    driverName: '林師兄',
    driverPhone: '917-234-5678',
    wechatOrLine: 'lin_ny_dharma',
    departureArea: '法拉盛 Flushing (NY)',
    departurePoint: '緬街 7 號地鐵站旁 Sheraton 喜來登飯店大門口',
    carModel: 'Toyota Sienna (8人座豪華休旅車)',
    carColor: '珍珠白',
    plateNumber: 'NY • KST-888',
    notes: '去程專為【義工同修】提早出發；回程則於【正行圓滿】後即發車回紐約，歡迎義工或正行同修預約搭乘。',
    hasOutbound: true,
    outboundTime: '06:30 出發 (約 07:50 抵達寺院)',
    outboundMode: 'volunteer', // 義工車
    outboundTotalSeats: 6,
    outboundAvailableSeats: 3,
    outboundPassengers: [
      {
        id: 'p-fl-1',
        name: '陳師姐 (大寮組義工)',
        phone: '646-111-2222',
        passengerCount: 2,
        role: 'volunteer',
        pickupNote: '喜來登大門準時等候',
        bookedAt: '2026-09-20 10:15',
      },
      {
        id: 'p-fl-2',
        name: '王大德 (壇場組義工)',
        phone: '718-333-4444',
        passengerCount: 1,
        role: 'volunteer',
        pickupNote: '攜帶居士服',
        bookedAt: '2026-09-21 14:20',
      }
    ],
    hasReturn: true,
    returnTime: '16:30 法會圓滿後賦歸',
    returnMode: 'attendee', // 正行車
    returnTotalSeats: 6,
    returnAvailableSeats: 4,
    returnPassengers: [
      {
        id: 'p-fl-ret-1',
        name: '張居士 (正行同修)',
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
    eventId: 'evt-2026-midautumn',
    driverName: '陳師姐',
    driverPhone: '201-987-6543',
    wechatOrLine: 'chen_fortlee',
    departureArea: '新澤西 Fort Lee / Edison (NJ)',
    departurePoint: 'Fort Lee 喬治華盛頓大橋旁 H Mart 超市停車場',
    carModel: 'Honda CR-V (5人座SUV)',
    carColor: '鐵灰色',
    plateNumber: 'NJ • ZEN-168',
    notes: '【正行專車】適合參加當天 10:00 法會的大眾，回程亦配合法會圓滿同車返程。',
    hasOutbound: true,
    outboundTime: '08:00 出發 (約 09:30 抵達寺院)',
    outboundMode: 'attendee',
    outboundTotalSeats: 3,
    outboundAvailableSeats: 1,
    outboundPassengers: [
      {
        id: 'p-nj-1',
        name: '劉師兄夫妻 (正行同修)',
        phone: '201-333-7777',
        passengerCount: 2,
        role: 'attendee',
        pickupNote: 'H Mart 集合',
        bookedAt: '2026-09-21 16:00',
      }
    ],
    hasReturn: true,
    returnTime: '16:30 法會圓滿後返回',
    returnMode: 'attendee',
    returnTotalSeats: 3,
    returnAvailableSeats: 1,
    returnPassengers: [
      {
        id: 'p-nj-1',
        name: '劉師兄夫妻 (正行同修)',
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
    eventId: 'evt-2026-midautumn',
    driverName: '黃師兄 (交通接待組長)',
    driverPhone: '917-888-9999',
    departureArea: '曼哈頓華埠 Chinatown (NY)',
    departurePoint: '華埠包厘街孔子大廈正門口 (Bowery St)',
    carModel: 'Subaru Outback (全時四驅)',
    carColor: '深藍色',
    notes: '去回程皆為【義工組專車】，下午善後出坡圓滿後預計 18:00 返程。',
    hasOutbound: true,
    outboundTime: '06:15 出發 (約 07:45 抵達寺院)',
    outboundMode: 'volunteer',
    outboundTotalSeats: 4,
    outboundAvailableSeats: 2,
    outboundPassengers: [
      {
        id: 'p-ct-1',
        name: '李師兄 (交通組義工)',
        phone: '917-444-1234',
        passengerCount: 2,
        role: 'volunteer',
        pickupNote: '孔子大廈門口',
        bookedAt: '2026-09-20 08:30',
      }
    ],
    hasReturn: true,
    returnTime: '18:00 義工出坡圓滿後賦歸',
    returnMode: 'volunteer',
    returnTotalSeats: 4,
    returnAvailableSeats: 2,
    returnPassengers: [
      {
        id: 'p-ct-1',
        name: '李師兄 (交通組義工)',
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
    eventId: 'evt-2026-midautumn',
    driverName: '張師姐',
    driverPhone: '347-666-8888',
    departureArea: '布魯克林 Brooklyn (NY)',
    departurePoint: '八大道 60 街華埠超市旁',
    carModel: 'Toyota Highlander (7人座)',
    carColor: '銀色',
    notes: '【正行車次】車內寬敞平穩，歡迎長輩同修同行。',
    hasOutbound: true,
    outboundTime: '07:45 出發 (約 09:30 抵達寺院)',
    outboundMode: 'attendee',
    outboundTotalSeats: 4,
    outboundAvailableSeats: 4,
    outboundPassengers: [],
    hasReturn: true,
    returnTime: '16:30 法會結束返回',
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
    eventId: 'evt-2026-midautumn',
    passengerName: '趙菩薩 (大寮發心長輩)',
    passengerPhone: '917-555-1212',
    pickupArea: '法拉盛 Flushing (NY)',
    pickupPoint: '緬街法拉盛圖書館門口',
    passengerCount: 1,
    needOutbound: true,
    outboundRole: 'volunteer', // 去程需要義工早車 (08:00前到大寮)
    needReturn: true,
    returnRole: 'attendee',   // 回程想搭正行車 (16:30法會後提早回家休息)
    notes: '長輩發心去大寮切菜備齋，但年邁體力有限，希望法會結束 16:30 就能隨正行車返回法拉盛。',
    status: 'pending',
    createdAt: '2026-09-21 11:20',
  },
  {
    id: 'req-2',
    eventId: 'evt-2026-midautumn',
    passengerName: '何居士夫婦',
    passengerPhone: '718-999-7777',
    pickupArea: '布魯克林 Brooklyn (NY)',
    pickupPoint: '八大道 N 車捷運站旁',
    passengerCount: 2,
    needOutbound: true,
    outboundRole: 'attendee', // 正行參讚
    needReturn: true,
    returnRole: 'attendee',
    notes: '正行同修，隨喜車主時間。',
    status: 'pending',
    createdAt: '2026-09-22 09:00',
  }
];
