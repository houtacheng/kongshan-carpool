import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Event, CarpoolOffer, RideRequest, AdminAccount } from '../types';
import { INITIAL_EVENTS, INITIAL_OFFERS, INITIAL_REQUESTS, INITIAL_ADMIN_ACCOUNTS } from '../data/mockData';

const EVENTS_COL = 'events';
const OFFERS_COL = 'carpool_offers';
const REQUESTS_COL = 'ride_requests';
const ACCOUNTS_COL = 'admin_accounts';

// 1. Subscribe to Events (Real-time)
export function subscribeEvents(callback: (events: Event[]) => void) {
  const colRef = collection(db, EVENTS_COL);
  return onSnapshot(colRef, async (snapshot) => {
    const hasSeeded = localStorage.getItem('kongshan_seeded_events_v2');

    if (snapshot.empty && !hasSeeded) {
      try {
        const batch = writeBatch(db);
        INITIAL_EVENTS.forEach((evt) => {
          batch.set(doc(db, EVENTS_COL, evt.id), evt);
        });
        await batch.commit();
        localStorage.setItem('kongshan_seeded_events_v2', 'true');
      } catch (err) {
        console.warn('Could not auto-seed events in Firestore:', err);
      }
      return;
    }

    const events: Event[] = [];
    snapshot.forEach((d) => {
      events.push(d.data() as Event);
    });
    if (events.length > 0) {
      localStorage.setItem('kongshan_seeded_events_v2', 'true');
      callback(events);
    }
  }, (err) => {
    console.warn('Firestore events subscription error (rules or offline):', err);
  });
}

// 2. Subscribe to Offers (Real-time)
export function subscribeOffers(callback: (offers: CarpoolOffer[]) => void) {
  const colRef = collection(db, OFFERS_COL);
  return onSnapshot(colRef, async (snapshot) => {
    const hasSeeded = localStorage.getItem('kongshan_seeded_offers_v2');

    if (snapshot.empty) {
      if (!hasSeeded) {
        try {
          const batch = writeBatch(db);
          INITIAL_OFFERS.forEach((offer) => {
            batch.set(doc(db, OFFERS_COL, offer.id), offer);
          });
          await batch.commit();
          localStorage.setItem('kongshan_seeded_offers_v2', 'true');
        } catch (err) {
          console.warn('Could not auto-seed offers in Firestore:', err);
        }
      } else {
        // User intentionally deleted all offers
        callback([]);
      }
      return;
    }

    const offers: CarpoolOffer[] = [];
    snapshot.forEach((d) => {
      offers.push(d.data() as CarpoolOffer);
    });
    localStorage.setItem('kongshan_seeded_offers_v2', 'true');
    callback(offers);
  }, (err) => {
    console.warn('Firestore offers subscription error (rules or offline):', err);
    // DO NOT override local state with INITIAL_OFFERS on error!
  });
}

// 3. Subscribe to Ride Requests (Real-time)
export function subscribeRequests(callback: (requests: RideRequest[]) => void) {
  const colRef = collection(db, REQUESTS_COL);
  return onSnapshot(colRef, async (snapshot) => {
    const hasSeeded = localStorage.getItem('kongshan_seeded_requests_v2');

    if (snapshot.empty) {
      if (!hasSeeded) {
        try {
          const batch = writeBatch(db);
          INITIAL_REQUESTS.forEach((req) => {
            batch.set(doc(db, REQUESTS_COL, req.id), req);
          });
          await batch.commit();
          localStorage.setItem('kongshan_seeded_requests_v2', 'true');
        } catch (err) {
          console.warn('Could not auto-seed requests in Firestore:', err);
        }
      } else {
        // User intentionally deleted all requests
        callback([]);
      }
      return;
    }

    const requests: RideRequest[] = [];
    snapshot.forEach((d) => {
      requests.push(d.data() as RideRequest);
    });
    localStorage.setItem('kongshan_seeded_requests_v2', 'true');
    callback(requests);
  }, (err) => {
    console.warn('Firestore requests subscription error (rules or offline):', err);
    // DO NOT override local state with INITIAL_REQUESTS on error!
  });
}

// 4. Subscribe to Admin Accounts (Real-time)
export function subscribeAdminAccounts(callback: (accounts: AdminAccount[]) => void) {
  const colRef = collection(db, ACCOUNTS_COL);
  return onSnapshot(colRef, async (snapshot) => {
    const hasSeeded = localStorage.getItem('kongshan_seeded_accounts_v2');

    if (snapshot.empty) {
      if (!hasSeeded) {
        try {
          const batch = writeBatch(db);
          INITIAL_ADMIN_ACCOUNTS.forEach((acc) => {
            batch.set(doc(db, ACCOUNTS_COL, acc.id), acc);
          });
          await batch.commit();
          localStorage.setItem('kongshan_seeded_accounts_v2', 'true');
        } catch (err) {
          console.warn('Could not auto-seed admin accounts in Firestore:', err);
        }
      } else {
        callback([]);
      }
      return;
    }

    const accounts: AdminAccount[] = [];
    snapshot.forEach((d) => {
      accounts.push(d.data() as AdminAccount);
    });
    localStorage.setItem('kongshan_seeded_accounts_v2', 'true');
    callback(accounts);
  }, (err) => {
    console.warn('Firestore accounts subscription error (rules or offline):', err);
  });
}

// Actions: Events
export async function saveEventToFirestore(event: Event) {
  try {
    await setDoc(doc(db, EVENTS_COL, event.id), event, { merge: true });
  } catch (err) {
    console.warn('saveEventToFirestore error:', err);
  }
}

export async function deleteEventFromFirestore(eventId: string) {
  try {
    await deleteDoc(doc(db, EVENTS_COL, eventId));
  } catch (err) {
    console.warn('deleteEventFromFirestore error:', err);
  }
}

// Actions: Offers
export async function saveOfferToFirestore(offer: CarpoolOffer) {
  try {
    await setDoc(doc(db, OFFERS_COL, offer.id), offer, { merge: true });
  } catch (err) {
    console.warn('saveOfferToFirestore error:', err);
  }
}

export async function deleteOfferFromFirestore(offerId: string) {
  try {
    await deleteDoc(doc(db, OFFERS_COL, offerId));
  } catch (err) {
    console.warn('deleteOfferFromFirestore error:', err);
  }
}

// Actions: Requests
export async function saveRequestToFirestore(request: RideRequest) {
  try {
    await setDoc(doc(db, REQUESTS_COL, request.id), request, { merge: true });
  } catch (err) {
    console.warn('saveRequestToFirestore error:', err);
  }
}

export async function deleteRequestFromFirestore(requestId: string) {
  try {
    await deleteDoc(doc(db, REQUESTS_COL, requestId));
  } catch (err) {
    console.warn('deleteRequestFromFirestore error:', err);
  }
}

// Actions: Admin Accounts
export async function saveAdminAccountToFirestore(account: AdminAccount) {
  try {
    await setDoc(doc(db, ACCOUNTS_COL, account.id), account, { merge: true });
  } catch (err) {
    console.warn('saveAdminAccountToFirestore error:', err);
  }
}

export async function deleteAdminAccountFromFirestore(accountId: string) {
  try {
    await deleteDoc(doc(db, ACCOUNTS_COL, accountId));
  } catch (err) {
    console.warn('deleteAdminAccountFromFirestore error:', err);
  }
}
