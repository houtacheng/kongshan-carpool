export interface Event {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  assemblyTime: string;
  templeName: string;
  location: string;
  notes: string;
}

export interface BookingPassenger {
  id: string;
  name: string;
  phone: string;
  passengerCount: number;
  pickupNote?: string;
  bookedAt: string;
}

export interface CarpoolOffer {
  id: string;
  eventId: string;
  driverName: string;
  driverPhone: string;
  lineId?: string;
  departureCity: string;
  departureDistrict: string;
  departurePoint: string;
  departureTime: string;
  returnTrip: boolean;
  returnTime?: string;
  totalSeats: number;
  availableSeats: number;
  carModel: string;
  carColor?: string;
  plateNumber?: string;
  notes?: string;
  passengers: BookingPassenger[];
  createdAt: string;
}

export interface RideRequest {
  id: string;
  eventId: string;
  passengerName: string;
  passengerPhone: string;
  lineId?: string;
  pickupCity: string;
  pickupDistrict: string;
  pickupPoint: string;
  passengerCount: number;
  notes?: string;
  status: 'pending' | 'matched' | 'cancelled';
  matchedOfferId?: string;
  createdAt: string;
}
