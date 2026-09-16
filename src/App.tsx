import { useState, useEffect } from 'react';
import type { Event, CarpoolOffer, RideRequest, ParticipantRole, AdminAccount } from './types';
import { INITIAL_EVENTS, INITIAL_OFFERS, INITIAL_REQUESTS, INITIAL_ADMIN_ACCOUNTS } from './data/mockData';
import { Header } from './components/Header';
import { PassengerView } from './components/PassengerView';
import { DriverView } from './components/DriverView';
import { AdminView } from './components/AdminView';
import { MapPin } from 'lucide-react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { getLocalizedArea } from './i18n/translations';
import {
  subscribeEvents,
  subscribeOffers,
  subscribeRequests,
  subscribeAdminAccounts,
  saveEventToFirestore,
  deleteEventFromFirestore,
  saveOfferToFirestore,
  deleteOfferFromFirestore,
  saveRequestToFirestore,
  deleteRequestFromFirestore,
  saveAdminAccountToFirestore,
  deleteAdminAccountFromFirestore
} from './services/firebaseService';

function AppContent() {
  const { t, language } = useLanguage();

  // Multi-Event State (with Firestore sync & localStorage cache)
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('kongshan_events_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved events', e);
      }
    }
    return INITIAL_EVENTS;
  });

  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    return INITIAL_EVENTS[0].id;
  });

  const [currentTab, setCurrentTab] = useState<'passenger' | 'driver' | 'admin'>('passenger');

  // Admin Accounts & Session State
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(() => {
    const saved = localStorage.getItem('kongshan_admin_accounts_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved admin accounts', e);
      }
    }
    return INITIAL_ADMIN_ACCOUNTS;
  });

  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(() => {
    const saved = localStorage.getItem('kongshan_current_admin_user_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.name === '系統總幹事' || parsed.name === '系統總護持' || parsed.note?.includes('總幹事') || parsed.note?.includes('總護持'))) {
          parsed.name = '系統管理員';
          if (parsed.note) parsed.note = parsed.note.replace('總幹事', '管理員').replace('總護持', '管理員');
          localStorage.setItem('kongshan_current_admin_user_v2', JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved current admin', e);
      }
    }
    return null;
  });

  // Offers and Requests State
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

  // Real-time Cloud Sync with Firebase Firestore
  useEffect(() => {
    const unsubEvents = subscribeEvents((liveEvents) => {
      if (liveEvents && liveEvents.length > 0) {
        setEvents(liveEvents);
        localStorage.setItem('kongshan_events_v2', JSON.stringify(liveEvents));
      }
    });

    const unsubOffers = subscribeOffers((liveOffers) => {
      if (liveOffers) {
        setOffers(liveOffers);
        localStorage.setItem('kongshan_carpool_offers_v2', JSON.stringify(liveOffers));
      }
    });

    const unsubRequests = subscribeRequests((liveRequests) => {
      if (liveRequests) {
        setRequests(liveRequests);
        localStorage.setItem('kongshan_carpool_requests_v2', JSON.stringify(liveRequests));
      }
    });

    const unsubAccounts = subscribeAdminAccounts((liveAccounts) => {
      if (liveAccounts) {
        setAdminAccounts(liveAccounts);
        localStorage.setItem('kongshan_admin_accounts_v2', JSON.stringify(liveAccounts));

        // Auto-check if logged in account was suspended or deleted
        if (currentAdmin) {
          const fresh = liveAccounts.find((a) => a.id === currentAdmin.id);
          if (!fresh || fresh.status === 'suspended') {
            setCurrentAdmin(null);
            localStorage.removeItem('kongshan_current_admin_user_v2');
          } else {
            setCurrentAdmin(fresh);
            localStorage.setItem('kongshan_current_admin_user_v2', JSON.stringify(fresh));
          }
        }
      }
    });

    return () => {
      unsubEvents();
      unsubOffers();
      unsubRequests();
      unsubAccounts();
    };
  }, [currentAdmin]);

  // Current active event (fall back to first event if selectedEventId not found)
  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Action: Save Event
  const handleSaveEvent = (event: Event) => {
    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === event.id);
      const updated = idx >= 0 ? prev.map((e) => (e.id === event.id ? event : e)) : [event, ...prev];
      localStorage.setItem('kongshan_events_v2', JSON.stringify(updated));
      return updated;
    });
    saveEventToFirestore(event).catch(console.warn);
  };

  // Action: Delete Event
  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => {
      const updated = prev.filter((e) => e.id !== eventId);
      localStorage.setItem('kongshan_events_v2', JSON.stringify(updated));
      return updated;
    });
    if (selectedEventId === eventId) {
      const remaining = events.filter((e) => e.id !== eventId);
      if (remaining.length > 0) {
        setSelectedEventId(remaining[0].id);
      }
    }
    deleteEventFromFirestore(eventId).catch(console.warn);
  };

  // Action: Update Admin Account
  const handleUpdateAccount = (account: AdminAccount) => {
    setAdminAccounts((prev) => {
      const updated = prev.map((a) => (a.id === account.id ? account : a));
      localStorage.setItem('kongshan_admin_accounts_v2', JSON.stringify(updated));
      return updated;
    });

    if (currentAdmin?.id === account.id) {
      if (account.status === 'suspended') {
        setCurrentAdmin(null);
        localStorage.removeItem('kongshan_current_admin_user_v2');
      } else {
        setCurrentAdmin(account);
        localStorage.setItem('kongshan_current_admin_user_v2', JSON.stringify(account));
      }
    }
    saveAdminAccountToFirestore(account).catch(console.warn);
  };

  // Action: Delete Admin Account
  const handleDeleteAccount = (accountId: string) => {
    setAdminAccounts((prev) => {
      const updated = prev.filter((a) => a.id !== accountId);
      localStorage.setItem('kongshan_admin_accounts_v2', JSON.stringify(updated));
      return updated;
    });
    if (currentAdmin?.id === accountId) {
      setCurrentAdmin(null);
      localStorage.removeItem('kongshan_current_admin_user_v2');
    }
    deleteAdminAccountFromFirestore(accountId).catch(console.warn);
  };

  // Action: Add Admin Account
  const handleAddAccount = (account: AdminAccount) => {
    setAdminAccounts((prev) => {
      const updated = [account, ...prev];
      localStorage.setItem('kongshan_admin_accounts_v2', JSON.stringify(updated));
      return updated;
    });
    saveAdminAccountToFirestore(account).catch(console.warn);
  };

  // Action: Login with Google
  const handleLoginWithGoogle = (account: AdminAccount) => {
    setCurrentAdmin(account);
    localStorage.setItem('kongshan_current_admin_user_v2', JSON.stringify(account));
    saveAdminAccountToFirestore(account).catch(console.warn);
  };

  // Action: Logout
  const handleLogout = () => {
    setCurrentAdmin(null);
    localStorage.removeItem('kongshan_current_admin_user_v2');
  };

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

    const nowStr = new Date().toLocaleString('zh-TW', { hour12: false });
    let newOutboundPassengers = [...targetOffer.outboundPassengers];
    let newOutboundAvailable = targetOffer.outboundAvailableSeats;

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

    let newReturnPassengers = [...targetOffer.returnPassengers];
    let newReturnAvailable = targetOffer.returnAvailableSeats;

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

    const updatedOffer: CarpoolOffer = {
      ...targetOffer,
      outboundAvailableSeats: newOutboundAvailable,
      outboundPassengers: newOutboundPassengers,
      returnAvailableSeats: newReturnAvailable,
      returnPassengers: newReturnPassengers,
    };

    setOffers((prevOffers) =>
      prevOffers.map((offer) => (offer.id === offerId ? updatedOffer : offer))
    );

    saveOfferToFirestore(updatedOffer).catch(console.warn);
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
    saveOfferToFirestore(newOffer).catch(console.warn);
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
    const updatedRequests = requests.map((req) => {
      const isOutboundMatched = req.matchedOutboundOfferId === offerId;
      const isReturnMatched = req.matchedReturnOfferId === offerId;

      if (isOutboundMatched || isReturnMatched) {
        const remainingOutbound = isOutboundMatched ? undefined : req.matchedOutboundOfferId;
        const remainingReturn = isReturnMatched ? undefined : req.matchedReturnOfferId;

        let newStatus: RideRequest['status'] = 'pending';
        if (remainingOutbound || remainingReturn) {
          newStatus = 'matched_partial';
        }

        const ejectedReq: RideRequest = {
          ...req,
          status: newStatus,
          matchedOutboundOfferId: remainingOutbound,
          matchedReturnOfferId: remainingReturn,
          isEjected: true,
          ejectedReason: reasonText,
          ejectedAt: nowStr,
        };
        saveRequestToFirestore(ejectedReq).catch(console.warn);
        return ejectedReq;
      }
      return req;
    });

    // 2. Also check if any directly-booked passengers do not have a RideRequest entry
    const allOfferPassengers = [...targetOffer.outboundPassengers, ...targetOffer.returnPassengers];
    const newlyCreatedRequests: RideRequest[] = [];

    allOfferPassengers.forEach((p) => {
      const alreadyTracked = updatedRequests.some(
        (r) =>
          (r.passengerPhone === p.phone || r.passengerName === p.name) &&
          (r.isEjected || r.matchedOutboundOfferId === offerId || r.matchedReturnOfferId === offerId)
      );

      if (!alreadyTracked && !newlyCreatedRequests.some((nr) => nr.passengerPhone === p.phone)) {
        const isOutbound = targetOffer.outboundPassengers.some((op) => op.id === p.id);
        const isReturn = targetOffer.returnPassengers.some((rp) => rp.id === p.id);

        const newReq: RideRequest = {
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
        };
        newlyCreatedRequests.push(newReq);
        saveRequestToFirestore(newReq).catch(console.warn);
      }
    });

    const finalRequests = [...newlyCreatedRequests, ...updatedRequests];
    setRequests(finalRequests);
    setOffers((prev) => {
      const finalOffers = prev.filter((o) => o.id !== offerId);
      localStorage.setItem('kongshan_carpool_offers_v2', JSON.stringify(finalOffers));
      return finalOffers;
    });
    localStorage.setItem('kongshan_carpool_requests_v2', JSON.stringify(finalRequests));
    deleteOfferFromFirestore(offerId).catch(console.warn);
    alert(language === 'en' ? 'Vehicle deleted successfully.' : '車輛已成功刪除！');
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

    // 1. Release seat and update offer
    const updatedOffer: CarpoolOffer = {
      ...targetOffer,
      ...(leg === 'outbound'
        ? {
            outboundPassengers: targetOffer.outboundPassengers.filter((p) => p.id !== passengerId),
            outboundAvailableSeats: Math.min(targetOffer.outboundTotalSeats, targetOffer.outboundAvailableSeats + passenger.passengerCount),
          }
        : {
            returnPassengers: targetOffer.returnPassengers.filter((p) => p.id !== passengerId),
            returnAvailableSeats: Math.min(targetOffer.returnTotalSeats, targetOffer.returnAvailableSeats + passenger.passengerCount),
          }),
    };

    setOffers((prev) => prev.map((o) => (o.id === offerId ? updatedOffer : o)));
    saveOfferToFirestore(updatedOffer).catch(console.warn);

    // 2. Update or create request as ejected
    const existingReqIndex = requests.findIndex(
      (r) =>
        (r.passengerPhone === passenger.phone || r.passengerName === passenger.name) &&
        (leg === 'outbound' ? r.matchedOutboundOfferId === offerId : r.matchedReturnOfferId === offerId)
    );

    if (existingReqIndex >= 0) {
      const existing = requests[existingReqIndex];
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
      setRequests((prev) => {
        const copy = [...prev];
        copy[existingReqIndex] = updatedReq;
        return copy;
      });
      saveRequestToFirestore(updatedReq).catch(console.warn);
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
      setRequests((prev) => [newReq, ...prev]);
      saveRequestToFirestore(newReq).catch(console.warn);
    }
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
    saveRequestToFirestore(newReq).catch(console.warn);
  };

  // Action: Match request to offer
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
    let updatedOutboundPassengers = [...offer.outboundPassengers];
    let updatedOutboundSeats = offer.outboundAvailableSeats;

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

    let updatedReturnPassengers = [...offer.returnPassengers];
    let updatedReturnSeats = offer.returnAvailableSeats;

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

    const updatedOffer: CarpoolOffer = {
      ...offer,
      outboundAvailableSeats: updatedOutboundSeats,
      outboundPassengers: updatedOutboundPassengers,
      returnAvailableSeats: updatedReturnSeats,
      returnPassengers: updatedReturnPassengers,
    };

    setOffers((prev) => prev.map((o) => (o.id === offerId ? updatedOffer : o)));
    saveOfferToFirestore(updatedOffer).catch(console.warn);

    // 2. Update Request
    const isFullyMatched = leg === 'both' || (!req.needOutbound && leg === 'return') || (!req.needReturn && leg === 'outbound');
    const updatedReq: RideRequest = {
      ...req,
      status: isFullyMatched ? 'matched_full' : 'matched_partial',
      matchedOutboundOfferId: needOut ? offerId : req.matchedOutboundOfferId,
      matchedReturnOfferId: needRet ? offerId : req.matchedReturnOfferId,
      isEjected: isFullyMatched ? false : req.isEjected,
      ejectedReason: isFullyMatched ? undefined : req.ejectedReason,
    };

    setRequests((prev) => prev.map((r) => (r.id === requestId ? updatedReq : r)));
    saveRequestToFirestore(updatedReq).catch(console.warn);

    return true;
  };

  // Action: Update an existing carpool offer
  const handleUpdateOffer = (updatedOffer: CarpoolOffer) => {
    setOffers((prev) => prev.map((o) => (o.id === updatedOffer.id ? updatedOffer : o)));
    saveOfferToFirestore(updatedOffer).catch(console.warn);
  };

  // Action: Update a ride request
  const handleUpdateRequest = (updatedRequest: RideRequest) => {
    setRequests((prev) => prev.map((r) => (r.id === updatedRequest.id ? updatedRequest : r)));
    saveRequestToFirestore(updatedRequest).catch(console.warn);
  };

  // Action: Delete a ride request (freeing vehicle seats if assigned)
  const handleDeleteRequest = (requestId: string) => {
    const targetReq = requests.find((r) => r.id === requestId);
    if (!targetReq) return;

    if (targetReq.matchedOutboundOfferId || targetReq.matchedReturnOfferId) {
      setOffers((prevOffers) =>
        prevOffers.map((o) => {
          let updated = { ...o };
          let changed = false;
          if (o.id === targetReq.matchedOutboundOfferId) {
            updated.outboundPassengers = o.outboundPassengers.filter(
              (p) => p.phone !== targetReq.passengerPhone && p.name !== targetReq.passengerName
            );
            updated.outboundAvailableSeats = Math.min(
              o.outboundTotalSeats,
              o.outboundAvailableSeats + targetReq.passengerCount
            );
            changed = true;
          }
          if (o.id === targetReq.matchedReturnOfferId) {
            updated.returnPassengers = o.returnPassengers.filter(
              (p) => p.phone !== targetReq.passengerPhone && p.name !== targetReq.passengerName
            );
            updated.returnAvailableSeats = Math.min(
              o.returnTotalSeats,
              o.returnAvailableSeats + targetReq.passengerCount
            );
            changed = true;
          }
          if (changed) {
            saveOfferToFirestore(updated).catch(console.warn);
          }
          return updated;
        })
      );
    }

    setRequests((prev) => {
      const finalRequests = prev.filter((r) => r.id !== requestId);
      localStorage.setItem('kongshan_carpool_requests_v2', JSON.stringify(finalRequests));
      return finalRequests;
    });
    deleteRequestFromFirestore(requestId).catch(console.warn);
    alert(language === 'en' ? 'Ride request deleted successfully.' : '需求已成功刪除！');
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
              allEvents={events}
              onSelectEvent={setSelectedEventId}
              onSaveEvent={handleSaveEvent}
              onDeleteEvent={handleDeleteEvent}
              offers={offers}
              requests={requests}
              adminAccounts={adminAccounts}
              currentAdmin={currentAdmin}
              onLoginWithGoogle={handleLoginWithGoogle}
              onLogout={handleLogout}
              onUpdateAccount={handleUpdateAccount}
              onDeleteAccount={handleDeleteAccount}
              onAddAccount={handleAddAccount}
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
