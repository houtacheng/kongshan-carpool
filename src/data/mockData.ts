import type { Event, CarpoolOffer, RideRequest, AdminAccount } from '../types';

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

export const INITIAL_ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: 'admin-super-1',
    email: 'houtacheng@gmail.com',
    name: '系統總幹事',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    role: 'super_admin',
    status: 'active',
    authProvider: 'google',
    registeredAt: '2026-09-01 10:00',
    lastLoginAt: '2026-09-16 06:30',
    note: '系統最高權限（可管理帳號權限與所有營隊）'
  },
  {
    id: 'admin-staff-1',
    email: 'checkin.volunteer@gmail.com',
    name: '李同修 (報到組幹部)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    role: 'staff',
    status: 'active',
    authProvider: 'google',
    registeredAt: '2026-09-10 14:20',
    lastLoginAt: '2026-09-15 19:40',
    note: '紐約法拉盛、曼哈頓與長島線路協調幹部'
  },
  {
    id: 'admin-staff-2',
    email: 'volunteer.lin@gmail.com',
    name: '林師姐 (報到組車長)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    role: 'staff',
    status: 'active',
    authProvider: 'google',
    registeredAt: '2026-09-12 09:15',
    lastLoginAt: '2026-09-14 11:05',
    note: '新澤西與康州線路協調幹事'
  }
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
    status: 'published',
    volunteerArrivalTime: '08:00 前抵達寺院（素烤備料、會場佈置、報名報到組）',
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
  },
  {
    id: 'evt-2026-winter-buddha7',
    title: '2026 冬季彌陀佛七精進共修營',
    theme: '《念念彌陀．一心不亂》——念佛成佛，同登安養',
    subtitle: '萬緣放下，攝心歸一。誠邀法友同修精進持名，共結淨土殊勝勝緣。',
    date: '2026年12月19日（週六）~ 12月25日（週五）',
    templeName: '空山寺 (Kong Shan Temple)',
    location: '174 Hynes RD, Poughquag, NY 12570',
    status: 'published',
    volunteerArrivalTime: '07:30 前抵達大殿集合（執事分工與護七行前會）',
    attendeeArrivalTime: '08:30 前辦理入堂掛單',
    assemblyNotes: '共修期間提供住宿掛單與營養蔬食，請自備海青、居士服及個人盥洗用具。',
    reminders: [
      '請穿著深色寬鬆長褲，自備黑色海青與縵衣。',
      '堂內全程禁語，請關閉手機等電子產品。',
      '山區冬日氣候寒冷，請自備保暖外套、厚襪。'
    ],
    schedule: [
      { time: '05:00 ~ 06:30', activity: '早課持名', detail: '大殿早課共修' },
      { time: '08:30 ~ 11:00', activity: '精進繞佛念佛', detail: '止靜、繞佛、默念持名', highlight: true },
      { time: '11:15 ~ 12:30', activity: '過堂用齋 / 經行', detail: '惜福用齋' },
      { time: '14:00 ~ 17:00', activity: '下午念佛共修', detail: '大殿共修持名', highlight: true },
      { time: '19:00 ~ 20:30', activity: '法師開示與大回向', detail: '聆聽淨土法門開示', highlight: true }
    ]
  },
  {
    id: 'evt-2026-youth-zen',
    title: '2026 青年身心舒壓精進禪修營',
    theme: '《靜心觀照．覺醒當下》——回歸本來面目',
    subtitle: '在山林晨光與空山湖畔中，體驗行住坐臥的寧靜與身心覺察。',
    date: '2026年11月07日（週六）',
    templeName: '空山寺 (Kong Shan Temple)',
    location: '174 Hynes RD, Poughquag, NY 12570',
    status: 'hidden',
    volunteerArrivalTime: '08:00 前抵達（會場與茶席佈置）',
    attendeeArrivalTime: '09:00 報到集合',
    assemblyNotes: '本營隊目前籌備中，僅對內部工作幹部開放排班調度。',
    reminders: [
      '請穿著素色寬鬆衣物，勿噴灑香水。',
      '請自備水杯、瑜珈墊或禪坐墊（寺院亦備有坐蒲）。'
    ],
    schedule: [
      { time: '09:30 ~ 10:30', activity: '初階禪修引導', detail: '調身調息調心技巧' },
      { time: '10:45 ~ 11:45', activity: '湖畔經行', detail: '步步分明覺察當下', highlight: true },
      { time: '12:00 ~ 13:30', activity: '正念便當與午休', detail: '正念飲食體驗' },
      { time: '14:00 ~ 16:00', activity: '茶禪一味與心得交流', detail: '茶道與禪心分享', highlight: true }
    ]
  }
];

export function getLocalizedEvent(evt: Event, lang: 'zh-TW' | 'zh-CN' | 'en'): Event {
  if (evt.id !== 'evt-2026-pucha') {
    return evt;
  }

  if (lang === 'en') {
    return {
      ...evt,
      title: 'Kong Shan Temple Mid-Autumn Tea Gathering',
      theme: '“Reunion in Dharma, Gathering in Heart” — Bright Moonlight Shines in the Blue Sky',
      subtitle: 'On this Mid-Autumn Festival, Kong Shan Temple cordially invites you, your family, and friends to gather by the lake for an uplifting and heartwarming tea gathering.',
      date: 'Sunday, September 27, 2026',
      templeName: 'Kong Shan Temple',
      volunteerArrivalTime: 'Arrive before 08:00 (Vegetarian BBQ prep, venue setup, registration team)',
      attendeeArrivalTime: '09:00 ~ 09:30 Arrival, 09:30 Lakeside Assembly',
      assemblyNotes: 'Lakeside vegetarian BBQ at noon, afternoon class study reflections and Lamrim Q&A. Travel time from various NY/NJ/CT areas is approx. 1.5 - 2 hrs; please allow ample travel time.',
      reminders: [
        'Please bring your own picnic mats, reusable dining utensils, and water bottles.',
        'Each class should prepare a class reflection summary (each class signs up).',
        'Lamrim trivia Q&A scope: Karma (Cause and Effect).',
        'Kong Shan Temple will provide hearty vegetarian BBQ ingredients for all to enjoy.'
      ],
      schedule: [
        { time: '09:00 ~ 09:30', activity: 'Arrival & Check-In', detail: 'Arrival at temple and parking' },
        { time: '09:30', activity: 'Lakeside Assembly', detail: 'Gather on lakeside lawn' },
        { time: '09:30 ~ 10:15', activity: 'Mid-Autumn Chanting & Circumambulation', detail: 'Praise of Dependent Arising, Lamrim Prayers, Migtsema', highlight: true },
        { time: '10:15 ~ 11:00', activity: 'Intermission (Move to Main Hall)', detail: 'Enter Main Hall' },
        { time: '11:00 ~ 11:15', activity: "Venerable's Mid-Autumn Dharma Discourse", detail: 'Receive inspiring Dharma discourse' },
        { time: '11:15 ~ 11:45', activity: 'Grand Buddha Offering', detail: 'Solemn offering before the Buddha' },
        { time: '11:45 ~ 14:00', activity: 'Lakeside Vegetarian BBQ Feast', detail: 'Enjoy BBQ feast & fellowship by the lake', highlight: true },
        { time: '14:00 ~ 15:30', activity: 'Lakeside Reflections & Quick Q&A', detail: 'Class reflections (45m) • Lamrim Q&A: Karma (20m) • Summary (25m)', highlight: true },
        { time: '15:30 ~ 16:30', activity: 'Cleanup / Departure', detail: 'Attendees depart at 15:30 / Volunteers depart after cleanup at 16:30' }
      ]
    };
  }

  if (lang === 'zh-CN') {
    return {
      ...evt,
      title: '空山寺中秋普茶',
      theme: '《以法团圆．以心相聚》——明月之光，永耀蓝空',
      subtitle: '值此中秋佳节，空山寺诚挚邀请您与家人朋友齐聚湖畔，共度一场充满法喜与温暖的中秋普茶活动。',
      date: '2026年9月27日（周日）',
      templeName: '空山寺 (Kong Shan Temple)',
      volunteerArrivalTime: '08:00 前抵达寺院（素烤备料、会场布置、报名报到组）',
      attendeeArrivalTime: '09:00 ~ 09:30 入寺，09:30 湖畔集合',
      assemblyNotes: '午间于湖畔共享素烤盛宴，下午由各班分享学习心得与修学收获，并进行广论快问快答。美东各区车程约 1.5 ~ 2 小时，请大家宽裕估算时间。',
      reminders: [
        '各班请自备野餐垫和环保餐具、水杯。',
        '各班要准备班级总结（每班要报名）。',
        '广论班快问快答范围：业果。',
        '空山寺备有湖畔素烤丰盛食材供大众共享。'
      ],
      schedule: [
        { time: '09:00 ~ 09:30', activity: '入寺报到', detail: '大众抵达寺院停车整装' },
        { time: '09:30', activity: '湖畔集合', detail: '湖畔草坪集合' },
        { time: '09:30 ~ 10:15', activity: '中秋课诵 + 绕湖持咒共修', detail: '缘起赞、广论祈愿文、密集嘛', highlight: true },
        { time: '10:15 ~ 11:00', activity: '休息（移动至佛堂）', detail: '整队入佛堂' },
        { time: '11:00 ~ 11:15', activity: '法师中秋开示', detail: '聆听法师慈悲开示' },
        { time: '11:15 ~ 11:45', activity: '佛前大供', detail: '庄严供佛' },
        { time: '11:45 ~ 14:00', activity: '湖畔素烤盛宴', detail: '湖畔共享素烤、交流情谊', highlight: true },
        { time: '14:00 ~ 15:30', activity: '湖畔总结与快问快答', detail: '各班学习总结 (45 min) • 广论快问快答：业果 (20 min) • 空山寺总结+结示 (25 min)', highlight: true },
        { time: '15:30 ~ 16:30', activity: '善后整理 / 赋归', detail: '正行大众赋归（15:30）/ 义工善后整理完毕赋归（16:30）' }
      ]
    };
  }

  return evt;
}

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
    driverName: '黃先生 (報名報到組)',
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
        name: '李先生 (報名報到義工)',
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
        name: '李先生 (報名報到義工)',
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
