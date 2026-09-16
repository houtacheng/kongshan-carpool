import { useState, useEffect } from 'react';
import type { Event, CarpoolOffer, RideRequest, ParticipantRole } from './types';
import { INITIAL_EVENTS, INITIAL_OFFERS, INITIAL_REQUESTS } from './data/mockData';
import { Header } from './components/Header';
import { PassengerView } from './components/PassengerView';
import { DriverView } from './components/DriverView';
import { AdminView } from './components/AdminView';
import { MapPin } from 'lucide-react';


export function App() {
  const [events] = useState<Event[]>(INITIAL_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string>(INITIAL_EVENTS[0].id);
  const [currentTab, setCurrentTab] = useState<'passenger' | 'driver' | 'admin'>('passenger');

  // Persistence with localStorage
  const [offers, setOffers] = useState<CarpoolOffer[]>(() => {
    const saved = localStorage.getItem('kongshan_carpool_offers_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved offers', e);
      }
    }
    return INITIAL_OFFERS;
  });

  const [requests, setRequests] = useState<RideRequest[]>(() => {
    const saved = localStorage.getItem('kongshan_carpool_requests_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved requests', e);
      }
    }
    return INITIAL_REQUESTS;
  });

  useEffect(() => {
    localStorage.setItem('kongshan_carpool_offers_v2', JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    localStorage.setItem('kongshan_carpool_requests_v2', JSON.stringify(requests));
  }, [requests]);

  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Action: Passenger books seat (decoupled outbound / return)
  const handleBookSeat = (
    offerId: string,
    passengerName: string,
    passengerPhone: string,
    wechatOrLine: string,
    count: number,
    bookOutbound: boolean,
    outboundRole: ParticipantRole,
    bookReturn: boolean,
    returnRole: ParticipantRole,
    note: string
  ): boolean => {
    const targetOffer = offers.find((o) => o.id === offerId);
    if (!targetOffer) return false;

    if (bookOutbound && targetOffer.outboundAvailableSeats < count) return false;
    if (bookReturn && targetOffer.returnAvailableSeats < count) return false;

    setOffers((prevOffers) =>
      prevOffers.map((offer) => {
        if (offer.id === offerId) {
          const nowStr = new Date().toLocaleString('zh-TW', { hour12: false });
          let newOutboundPassengers = [...offer.outboundPassengers];
          let newOutboundAvailable = offer.outboundAvailableSeats;

          if (bookOutbound) {
            newOutboundPassengers.push({
              id: `p-out-${Date.now()}`,
              name: passengerName,
              phone: passengerPhone,
              wechatOrLine,
              passengerCount: count,
              role: outboundRole,
              pickupNote: note,
              bookedAt: nowStr,
            });
            newOutboundAvailable -= count;
          }

          let newReturnPassengers = [...offer.returnPassengers];
          let newReturnAvailable = offer.returnAvailableSeats;

          if (bookReturn) {
            newReturnPassengers.push({
              id: `p-ret-${Date.now()}`,
              name: passengerName,
              phone: passengerPhone,
              wechatOrLine,
              passengerCount: count,
              role: returnRole,
              pickupNote: note,
              bookedAt: nowStr,
            });
            newReturnAvailable -= count;
          }

          return {
            ...offer,
            outboundAvailableSeats: newOutboundAvailable,
            outboundPassengers: newOutboundPassengers,
            returnAvailableSeats: newReturnAvailable,
            returnPassengers: newReturnPassengers,
          };
        }
        return offer;
      })
    );

    return true;
  };

  // Action: Driver / Admin creates an offer
  const handleCreateOffer = (
    newOfferData: Omit<CarpoolOffer, 'id' | 'createdAt' | 'outboundPassengers' | 'returnPassengers'>
  ) => {
    const newOffer: CarpoolOffer = {
      ...newOfferData,
      id: `offer-${Date.now()}`,
      createdAt: new Date().toLocaleString('zh-TW', { hour12: false }),
      outboundPassengers: [],
      returnPassengers: [],
    };
    setOffers((prev) => [newOffer, ...prev]);
  };

  // Action: Delete offer
  const handleDeleteOffer = (offerId: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== offerId));
  };

  // Action: Passenger creates request
  const handleCreateRequest = (newReqData: Omit<RideRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: RideRequest = {
      ...newReqData,
      id: `req-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toLocaleString('zh-TW', { hour12: false }),
    };
    setRequests((prev) => [newReq, ...prev]);
  };

  // Action: Match request to offer (with leg selection)
  const handleMatchRequestToOffer = (
    requestId: string,
    offerId: string,
    leg: 'outbound' | 'return' | 'both'
  ): boolean => {
    const req = requests.find((r) => r.id === requestId);
    const offer = offers.find((o) => o.id === offerId);
    if (!req || !offer) return false;

    const needOut = (leg === 'outbound' || leg === 'both') && req.needOutbound;
    const needRet = (leg === 'return' || leg === 'both') && req.needReturn;

    if (needOut && offer.outboundAvailableSeats < req.passengerCount) return false;
    if (needRet && offer.returnAvailableSeats < req.passengerCount) return false;

    const nowStr = new Date().toLocaleString('zh-TW', { hour12: false });

    // 1. Update Offer
    setOffers((prev) =>
      prev.map((o) => {
        if (o.id === offerId) {
          let updatedOutboundPassengers = [...o.outboundPassengers];
          let updatedOutboundSeats = o.outboundAvailableSeats;

          if (needOut) {
            updatedOutboundPassengers.push({
              id: `p-out-${Date.now()}`,
              name: req.passengerName,
              phone: req.passengerPhone,
              wechatOrLine: req.wechatOrLine,
              passengerCount: req.passengerCount,
              role: req.outboundRole,
              pickupNote: `${req.pickupArea} ${req.pickupPoint} ${req.notes ? `(${req.notes})` : ''}`,
              bookedAt: nowStr,
            });
            updatedOutboundSeats -= req.passengerCount;
          }

          let updatedReturnPassengers = [...o.returnPassengers];
          let updatedReturnSeats = o.returnAvailableSeats;

          if (needRet) {
            updatedReturnPassengers.push({
              id: `p-ret-${Date.now()}`,
              name: req.passengerName,
              phone: req.passengerPhone,
              wechatOrLine: req.wechatOrLine,
              passengerCount: req.passengerCount,
              role: req.returnRole,
              pickupNote: `${req.pickupArea} ${req.pickupPoint} ${req.notes ? `(${req.notes})` : ''}`,
              bookedAt: nowStr,
            });
            updatedReturnSeats -= req.passengerCount;
          }

          return {
            ...o,
            outboundAvailableSeats: updatedOutboundSeats,
            outboundPassengers: updatedOutboundPassengers,
            returnAvailableSeats: updatedReturnSeats,
            returnPassengers: updatedReturnPassengers,
          };
        }
        return o;
      })
    );

    // 2. Update Request Status
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          const isFullyMatched = leg === 'both' || (!r.needOutbound && leg === 'return') || (!r.needReturn && leg === 'outbound');
          return {
            ...r,
            status: isFullyMatched ? 'matched_full' : 'matched_partial',
            matchedOutboundOfferId: needOut ? offerId : r.matchedOutboundOfferId,
            matchedReturnOfferId: needRet ? offerId : r.matchedReturnOfferId,
          };
        }
        return r;
      })
    );

    return true;
  };

  // Reset to initial mock data
  const handleResetData = () => {
    if (confirm('確定要還原空山寺中秋法會的展示資料為初始狀態嗎？')) {
      localStorage.removeItem('kongshan_carpool_offers_v2');
      localStorage.removeItem('kongshan_carpool_requests_v2');
      setOffers(INITIAL_OFFERS);
      setRequests(INITIAL_REQUESTS);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/70 flex flex-col justify-between">
      <div>
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          events={events}
          selectedEventId={selectedEventId}
          setSelectedEventId={setSelectedEventId}
          onResetData={handleResetData}
        />

        <main className="max-w-5xl mx-auto px-4 pt-6">
          {currentTab === 'passenger' && (
            <PassengerView
              currentEvent={currentEvent}
              offers={offers}
              requests={requests}
              onBookSeat={handleBookSeat}
              onCreateRequest={handleCreateRequest}
            />
          )}

          {currentTab === 'driver' && (
            <DriverView
              currentEvent={currentEvent}
              offers={offers}
              requests={requests}
              onCreateOffer={handleCreateOffer}
              onDeleteOffer={handleDeleteOffer}
              onMatchRequestToOffer={handleMatchRequestToOffer}
            />
          )}

          {currentTab === 'admin' && (
            <AdminView
              currentEvent={currentEvent}
              offers={offers}
              requests={requests}
              onMatchRequestToOffer={handleMatchRequestToOffer}
              onCreateOffer={handleCreateOffer}
              onCreateRequest={handleCreateRequest}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500 space-y-2 mt-12">
        <div className="flex items-center justify-center gap-2 font-bold text-stone-800">
          <img src="/kongshan_logo.png" alt="空山" className="w-5 h-5 object-contain bg-black rounded" />
          <span>空山寺 (Kong Shan Temple) • 美東中秋法會共乘服務網</span>
        </div>
        <p className="text-stone-400 flex items-center justify-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-amber-700" />
          <span>174 Hynes RD, Poughquag, NY 12570</span>
          <span>•</span>
          <span>隨喜十方大德護持發心 • 同車同行 共赴菩提法筵 • 阿彌陀佛</span>
        </p>
      </footer>
    </div>
  );
}

export default App;
