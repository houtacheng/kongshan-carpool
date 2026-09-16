import { useState, useEffect } from 'react';
import type { Event, CarpoolOffer, RideRequest, ParticipantRole } from './types';
import { INITIAL_EVENTS, INITIAL_OFFERS, INITIAL_REQUESTS } from './data/mockData';
import { Header } from './components/Header';
import { PassengerView } from './components/PassengerView';
import { DriverView } from './components/DriverView';
import { AdminView } from './components/AdminView';
import { MapPin } from 'lucide-react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { getLocalizedArea } from './i18n/translations';

function AppContent() {
  const { t, language } = useLanguage();
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

  // Action: Delete offer with automatic passenger ejection
  const handleDeleteOffer = (offerId: string) => {
    const targetOffer = offers.find((o) => o.id === offerId);
    if (!targetOffer) return;

    const nowStr = new Date().toLocaleString('zh-TW', { hour12: false });
    const reasonText = language === 'en'
      ? `Original vehicle [${targetOffer.driverName} - ${targetOffer.carModel || 'Vehicle'} (${getLocalizedArea(targetOffer.departureArea, 'en')})] was deleted by admin. Requires priority re-assignment.`
      : language === 'zh-CN'
      ? `原安排车辆【${targetOffer.driverName} - ${targetOffer.carModel || '自用车'} (${targetOffer.departureArea})】已被删除，需优先重新安排车位`
      : `原安排車輛【${targetOffer.driverName} - ${targetOffer.carModel || '自用車'} (${targetOffer.departureArea})】已被刪除，需優先重新安排車位`;

    // 1. Eject matched requests back to pending queue
    setRequests((prevRequests) => {
      let updated = prevRequests.map((req) => {
        const isOutboundMatched = req.matchedOutboundOfferId === offerId;
        const isReturnMatched = req.matchedReturnOfferId === offerId;

        if (isOutboundMatched || isReturnMatched) {
          const remainingOutbound = isOutboundMatched ? undefined : req.matchedOutboundOfferId;
          const remainingReturn = isReturnMatched ? undefined : req.matchedReturnOfferId;

          let newStatus: RideRequest['status'] = 'pending';
          if (remainingOutbound || remainingReturn) {
            newStatus = 'matched_partial';
          }

          return {
            ...req,
            status: newStatus,
            matchedOutboundOfferId: remainingOutbound,
            matchedReturnOfferId: remainingReturn,
            isEjected: true,
            ejectedReason: reasonText,
            ejectedAt: nowStr,
          };
        }
        return req;
      });

      // 2. Also check if any directly-booked passengers do not have a RideRequest entry
      const allOfferPassengers = [...targetOffer.outboundPassengers, ...targetOffer.returnPassengers];
      const newlyCreatedRequests: RideRequest[] = [];

      allOfferPassengers.forEach((p) => {
        const alreadyTracked = updated.some(
          (r) =>
            (r.passengerPhone === p.phone || r.passengerName === p.name) &&
            (r.isEjected || r.matchedOutboundOfferId === offerId || r.matchedReturnOfferId === offerId)
        );

        if (!alreadyTracked && !newlyCreatedRequests.some((nr) => nr.passengerPhone === p.phone)) {
          const isOutbound = targetOffer.outboundPassengers.some((op) => op.id === p.id);
          const isReturn = targetOffer.returnPassengers.some((rp) => rp.id === p.id);

          newlyCreatedRequests.push({
            id: `req-ejected-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            eventId: targetOffer.eventId || selectedEventId,
            passengerName: p.name,
            passengerPhone: p.phone,
            wechatOrLine: p.wechatOrLine,
            pickupArea: targetOffer.departureArea,
            pickupPoint: p.pickupNote || targetOffer.departurePoint,
            passengerCount: p.passengerCount,
            needOutbound: isOutbound,
            outboundRole: p.role,
            needReturn: isReturn,
            returnRole: p.role,
            notes: p.pickupNote,
            status: 'pending',
            isEjected: true,
            ejectedReason: reasonText,
            ejectedAt: nowStr,
            createdAt: nowStr,
          });
        }
      });

      return [...newlyCreatedRequests, ...updated];
    });

    // 3. Remove offer
    setOffers((prev) => prev.filter((o) => o.id !== offerId));
  };

  // Action: Eject an individual passenger from a vehicle
  const handleEjectPassengerFromOffer = (offerId: string, passengerId: string, leg: 'outbound' | 'return') => {
    const targetOffer = offers.find((o) => o.id === offerId);
    if (!targetOffer) return;

    const passenger = leg === 'outbound'
      ? targetOffer.outboundPassengers.find((p) => p.id === passengerId)
      : targetOffer.returnPassengers.find((p) => p.id === passengerId);
    if (!passenger) return;

    const nowStr = new Date().toLocaleString('zh-TW', { hour12: false });
    const legLabel = leg === 'outbound'
      ? (language === 'en' ? 'Outbound' : '去程')
      : (language === 'en' ? 'Return' : '回程');
    const reasonText = language === 'en'
      ? `Ejected from vehicle [${targetOffer.driverName}] (${legLabel}) by admin. Requires re-assignment.`
      : language === 'zh-CN'
      ? `由后台管理员从【${targetOffer.driverName}】车次移出（${legLabel}行程），需重新安排`
      : `由後台管理員從【${targetOffer.driverName}】車次移出（${legLabel}行程），需重新安排`;

    // 1. Release seat and remove passenger from offer
    setOffers((prevOffers) =>
      prevOffers.map((o) => {
        if (o.id === offerId) {
          if (leg === 'outbound') {
            return {
              ...o,
              outboundPassengers: o.outboundPassengers.filter((p) => p.id !== passengerId),
              outboundAvailableSeats: Math.min(o.outboundTotalSeats, o.outboundAvailableSeats + passenger.passengerCount),
            };
          } else {
            return {
              ...o,
              returnPassengers: o.returnPassengers.filter((p) => p.id !== passengerId),
              returnAvailableSeats: Math.min(o.returnTotalSeats, o.returnAvailableSeats + passenger.passengerCount),
            };
          }
        }
        return o;
      })
    );

    // 2. Update or create request as ejected
    setRequests((prevRequests) => {
      const existingReqIndex = prevRequests.findIndex(
        (r) =>
          (r.passengerPhone === passenger.phone || r.passengerName === passenger.name) &&
          (leg === 'outbound' ? r.matchedOutboundOfferId === offerId : r.matchedReturnOfferId === offerId)
      );

      if (existingReqIndex >= 0) {
        const existing = prevRequests[existingReqIndex];
        const newOut = leg === 'outbound' ? undefined : existing.matchedOutboundOfferId;
        const newRet = leg === 'return' ? undefined : existing.matchedReturnOfferId;
        const updatedReq: RideRequest = {
          ...existing,
          status: newOut || newRet ? 'matched_partial' : 'pending',
          matchedOutboundOfferId: newOut,
          matchedReturnOfferId: newRet,
          isEjected: true,
          ejectedReason: reasonText,
          ejectedAt: nowStr,
        };
        const copy = [...prevRequests];
        copy[existingReqIndex] = updatedReq;
        return copy;
      } else {
        const newReq: RideRequest = {
          id: `req-ejected-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          eventId: targetOffer.eventId || selectedEventId,
          passengerName: passenger.name,
          passengerPhone: passenger.phone,
          wechatOrLine: passenger.wechatOrLine,
          pickupArea: targetOffer.departureArea,
          pickupPoint: passenger.pickupNote || targetOffer.departurePoint,
          passengerCount: passenger.passengerCount,
          needOutbound: leg === 'outbound',
          outboundRole: passenger.role,
          needReturn: leg === 'return',
          returnRole: passenger.role,
          notes: passenger.pickupNote,
          status: 'pending',
          isEjected: true,
          ejectedReason: reasonText,
          ejectedAt: nowStr,
          createdAt: nowStr,
        };
        return [newReq, ...prevRequests];
      }
    });
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

    // 2. Update Request Status & Clear Ejection
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          const isFullyMatched = leg === 'both' || (!r.needOutbound && leg === 'return') || (!r.needReturn && leg === 'outbound');
          return {
            ...r,
            status: isFullyMatched ? 'matched_full' : 'matched_partial',
            matchedOutboundOfferId: needOut ? offerId : r.matchedOutboundOfferId,
            matchedReturnOfferId: needRet ? offerId : r.matchedReturnOfferId,
            isEjected: isFullyMatched ? false : r.isEjected,
            ejectedReason: isFullyMatched ? undefined : r.ejectedReason,
          };
        }
        return r;
      })
    );

    return true;
  };

  // Action: Update an existing carpool offer
  const handleUpdateOffer = (updatedOffer: CarpoolOffer) => {
    setOffers((prev) => prev.map((o) => (o.id === updatedOffer.id ? updatedOffer : o)));
  };

  // Action: Update a ride request
  const handleUpdateRequest = (updatedRequest: RideRequest) => {
    setRequests((prev) => prev.map((r) => (r.id === updatedRequest.id ? updatedRequest : r)));
  };

  // Action: Delete a ride request (freeing vehicle seats if assigned)
  const handleDeleteRequest = (requestId: string) => {
    const targetReq = requests.find((r) => r.id === requestId);
    if (!targetReq) return;

    if (targetReq.matchedOutboundOfferId || targetReq.matchedReturnOfferId) {
      setOffers((prevOffers) =>
        prevOffers.map((o) => {
          let updated = { ...o };
          if (o.id === targetReq.matchedOutboundOfferId) {
            updated.outboundPassengers = o.outboundPassengers.filter(
              (p) => p.phone !== targetReq.passengerPhone && p.name !== targetReq.passengerName
            );
            updated.outboundAvailableSeats = Math.min(
              o.outboundTotalSeats,
              o.outboundAvailableSeats + targetReq.passengerCount
            );
          }
          if (o.id === targetReq.matchedReturnOfferId) {
            updated.returnPassengers = o.returnPassengers.filter(
              (p) => p.phone !== targetReq.passengerPhone && p.name !== targetReq.passengerName
            );
            updated.returnAvailableSeats = Math.min(
              o.returnTotalSeats,
              o.returnAvailableSeats + targetReq.passengerCount
            );
          }
          return updated;
        })
      );
    }

    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  // Action: Cancel a ride request
  const handleCancelRequest = (requestId: string) => {
    handleDeleteRequest(requestId);
  };

  // Reset to initial mock data
  const handleResetData = () => {
    if (confirm(t.resetConfirmPrompt)) {
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
              onUpdateRequest={handleUpdateRequest}
              onCancelRequest={handleCancelRequest}
            />
          )}

          {currentTab === 'driver' && (
            <DriverView
              currentEvent={currentEvent}
              offers={offers}
              requests={requests}
              onCreateOffer={handleCreateOffer}
              onDeleteOffer={handleDeleteOffer}
              onUpdateOffer={handleUpdateOffer}
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
              onUpdateOffer={handleUpdateOffer}
              onUpdateRequest={handleUpdateRequest}
              onCancelRequest={handleCancelRequest}
              onDeleteOffer={handleDeleteOffer}
              onDeleteRequest={handleDeleteRequest}
              onEjectPassenger={handleEjectPassengerFromOffer}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 text-center text-xs md:text-sm text-stone-600 space-y-2 mt-16">
        <div className="flex items-center justify-center gap-2 font-black text-stone-900 text-sm md:text-base">
          <img src="./kongshan_logo.png" alt="Kong Shan" className="w-6 h-6 object-contain bg-black rounded-md" />
          <span>{t.footerTagline}</span>
        </div>
        <p className="text-stone-500 flex flex-wrap items-center justify-center gap-1 font-medium">
          <MapPin className="w-4 h-4 text-amber-700" />
          <span>{t.templeAddress}</span>
          <span>•</span>
          <span>{t.footerSlogan}</span>
        </p>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
