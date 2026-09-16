export type ParticipantRole = 'volunteer' | 'attendee'; // 義工 (提早到/晚走) | 正行 (法會共修)

export interface Event {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  templeName: string;
  location: string;
  volunteerArrivalTime: string; // 義工集結時間
  attendeeArrivalTime: string;  // 正行集結時間
  assemblyNotes: string;
}

export interface BookingPassenger {
  id: string;
  name: string;
  phone: string;
  wechatOrLine?: string;
  passengerCount: number;
  role: ParticipantRole; // 該程是義工或正行
  pickupNote?: string;
  bookedAt: string;
}

export interface CarpoolOffer {
  id: string;
  eventId: string;
  driverName: string;
  driverPhone: string;
  wechatOrLine?: string;
  departureArea: string; // 美東主要集結區 (如：法拉盛 Flushing、曼哈頓華埠、布魯克林、新澤西 Fort Lee/Edison 等)
  departurePoint: string; // 具體集合點 (如：法拉盛緬街喜來登門口、八大道60街)
  carModel: string;
  carColor?: string;
  plateNumber?: string;
  notes?: string;

  // 去程 (前往空山寺 174 Hynes RD, Poughquag, NY)
  hasOutbound: boolean;
  outboundTime: string; // 如：06:30
  outboundMode: 'volunteer' | 'attendee' | 'both'; // 該去程車次主要服務義工或正行
  outboundTotalSeats: number;
  outboundAvailableSeats: number;
  outboundPassengers: BookingPassenger[];

  // 回程 (由空山寺返回出發地)
  hasReturn: boolean;
  returnTime: string; // 如：16:30 或 18:00
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
  outboundRole: ParticipantRole; // 去程身份：義工(早到) 或 正行

  // 回程需求
  needReturn: boolean;
  returnRole: ParticipantRole;   // 回程身份：義工(晚走) 或 正行(法會後即回)

  notes?: string;
  status: 'pending' | 'matched_partial' | 'matched_full' | 'cancelled';
  matchedOutboundOfferId?: string;
  matchedReturnOfferId?: string;
  createdAt: string;
}
