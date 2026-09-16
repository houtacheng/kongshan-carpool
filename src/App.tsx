import { useState, useEffect } from 'react';
import type { Event, CarpoolOffer, RideRequest } from './types';
import { INITIAL_EVENTS, INITIAL_OFFERS, INITIAL_REQUESTS } from './data/mockData';
import { Header } from './components/Header';
import { PassengerView } from './components/PassengerView';
import { DriverView } from './components/DriverView';
import { AdminView } from './components/AdminView';
import { Sparkles } from 'lucide-react';


export function App() {
  // Persistence with localStorage
  const [events] = useState<Event[]>(INITIAL_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string>(INITIAL_EVENTS[0].id);
  const [currentTab, setCurrentTab] = useState<'passenger' | 'driver' | 'admin'>('passenger');

  const [offers, setOffers] = useState<CarpoolOffer[]>(() => {
    const saved = localStorage.getItem('temple_carpool_offers');
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
    const saved = localStorage.getItem('temple_carpool_requests');
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
    localStorage.setItem('temple_carpool_offers', JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    localStorage.setItem('temple_carpool_requests', JSON.stringify(requests));
  }, [requests]);

  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Action: Passenger books seat directly
  const handleBookSeat = (
    offerId: string,
    passengerName: string,
    passengerPhone: string,
    count: number,
    note: string
  ): boolean => {
    const targetOffer = offers.find((o) => o.id === offerId);
    if (!targetOffer || targetOffer.availableSeats < count) {
      return false;
    }

    setOffers((prevOffers) =>
      prevOffers.map((offer) => {
        if (offer.id === offerId) {
          const newPassenger = {
            id: `p-${Date.now()}`,
            name: passengerName,
            phone: passengerPhone,
            passengerCount: count,
            pickupNote: note,
            bookedAt: new Date().toLocaleString('zh-TW', { hour12: false }),
          };
          return {
            ...offer,
            availableSeats: offer.availableSeats - count,
            passengers: [...offer.passengers, newPassenger],
          };
        }
        return offer;
      })
    );

    return true;
  };

  // Action: Driver / Admin creates an offer
  const handleCreateOffer = (newOfferData: Omit<CarpoolOffer, 'id' | 'createdAt' | 'passengers'>) => {
    const newOffer: CarpoolOffer = {
      ...newOfferData,
      id: `offer-${Date.now()}`,
      createdAt: new Date().toLocaleString('zh-TW', { hour12: false }),
      passengers: [],
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

  // Action: Match pending request to an offer (Driver or Admin)
  const handleMatchRequestToOffer = (requestId: string, offerId: string): boolean => {
    const req = requests.find((r) => r.id === requestId);
    const offer = offers.find((o) => o.id === offerId);
    if (!req || !offer || offer.availableSeats < req.passengerCount) {
      return false;
    }

    // 1. Update Offer
    setOffers((prev) =>
      prev.map((o) => {
        if (o.id === offerId) {
          return {
            ...o,
            availableSeats: o.availableSeats - req.passengerCount,
            passengers: [
              ...o.passengers,
              {
                id: `p-${Date.now()}`,
                name: req.passengerName,
                phone: req.passengerPhone,
                passengerCount: req.passengerCount,
                pickupNote: `${req.pickupCity}${req.pickupDistrict} ${req.pickupPoint} ${req.notes ? `(${req.notes})` : ''}`,
                bookedAt: new Date().toLocaleString('zh-TW', { hour12: false }),
              },
            ],
          };
        }
        return o;
      })
    );

    // 2. Update Request Status
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'matched',
            matchedOfferId: offerId,
          };
        }
        return r;
      })
    );

    return true;
  };

  // Action: Reset data to initial mock
  const handleResetData = () => {
    if (confirm('確定要還原所有共乘展示資料為初始狀態嗎？')) {
      localStorage.removeItem('temple_carpool_offers');
      localStorage.removeItem('temple_carpool_requests');
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
        <div className="flex items-center justify-center gap-1.5 font-medium text-stone-700">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>蓮華淨苑 • 法會共乘媒合服務網</span>
        </div>
        <p className="text-stone-400">
          隨喜大眾發心護持 • 同車同行 共結菩提清淨法緣 • 南無阿彌陀佛
        </p>
      </footer>
    </div>
  );
}

export default App;
