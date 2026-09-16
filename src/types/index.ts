export type ParticipantRole = 'volunteer' | 'attendee'; // 義工 (提早到協助) | 正行 (活動參加者)

export type AdminRole = 'super_admin' | 'staff'; // 系統管理員 / 超級管理員 | 報名報到組組長
export type AccountStatus = 'active' | 'suspended' | 'pending'; // 正常使用 | 暫停權限 | 審核中

export interface AdminAccount {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: AdminRole;
  status: AccountStatus;
  authProvider: 'google';
  registeredAt: string;
  lastLoginAt?: string;
  note?: string;
}

export type EventStatus = 'published' | 'draft' | 'hidden'; // 已發布(前台可見) | 草稿 | 已隱藏(僅後台可見)

export interface ScheduleItem {
  time: string;
  activity: string;
  detail?: string;
  highlight?: boolean;
}

export interface Event {
  id: string;
  title: string;
  theme: string;
  subtitle: string;
  date: string;
  templeName: string;
  location: string;
  status: EventStatus;
  volunteerArrivalTime: string; // 義工集合時間 (如 08:00 前)
  attendeeArrivalTime: string;  // 正行參加者集合時間 (09:00~09:30 入寺)
  assemblyNotes: string;
  schedule: ScheduleItem[];
  reminders: string[];
  createdAt?: string;
}

export interface BookingPassenger {
  id: string;
  name: string;
  phone: string;
  wechatOrLine?: string;
  passengerCount: number;
  role: ParticipantRole;
  pickupNote?: string;
  bookedAt: string;
}

export interface CarpoolOffer {
  id: string;
  eventId: string;
  driverName: string;
  driverPhone: string;
  wechatOrLine?: string;
  departureArea: string;
  departurePoint: string;
  carModel: string;
  carColor?: string;
  plateNumber?: string;
  notes?: string;

  // 去程 (前往空山寺 174 Hynes RD, Poughquag, NY)
  hasOutbound: boolean;
  outboundTime: string;
  outboundMode: 'volunteer' | 'attendee' | 'both';
  outboundTotalSeats: number;
  outboundAvailableSeats: number;
  outboundPassengers: BookingPassenger[];

  // 回程 (返回出發地)
  hasReturn: boolean;
  returnTime: string;
  returnMode: 'volunteer' | 'attendee' | 'both';
  returnTotalSeats: number;
  returnAvailableSeats: number;
  returnPassengers: BookingPassenger[];

  createdAt: string;
}

export interface RideRequest {
  id: string;
  eventId: string;
  passengerName: string;
  passengerPhone: string;
  wechatOrLine?: string;
  pickupArea: string;
  pickupPoint: string;
  passengerCount: number;
  
  // 去程需求
  needOutbound: boolean;
  outboundRole: ParticipantRole;

  // 回程需求
  needReturn: boolean;
  returnRole: ParticipantRole;

  notes?: string;
  status: 'pending' | 'matched_partial' | 'matched_full' | 'cancelled';
  matchedOutboundOfferId?: string;
  matchedReturnOfferId?: string;
  createdAt: string;

  // Ejected tracking (due to vehicle deletion or modification)
  isEjected?: boolean;
  ejectedReason?: string;
  ejectedAt?: string;
}
