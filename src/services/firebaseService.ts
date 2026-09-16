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
    if (snapshot.empty) {
      // Seed initial events if empty
      try {
        const batch = writeBatch(db);
        INITIAL_EVENTS.forEach((evt) => {
          batch.set(doc(db, EVENTS_COL, evt.id), evt);
        });
        await batch.commit();
      } catch (err) {
        console.warn('Could not auto-seed events in Firestore, using local fallback:', err);
        callback(INITIAL_EVENTS);
      }
      return;
    }

    const events: Event[] = [];
    snapshot.forEach((d) => {
      events.push(d.data() as Event);
    });
    callback(events);
  }, (err) => {
    console.warn('Firestore events subscription error, falling back:', err);
    callback(INITIAL_EVENTS);
  });
}

// 2. Subscribe to Offers (Real-time)
export function subscribeOffers(callback: (offers: CarpoolOffer[]) => void) {
  const colRef = collection(db, OFFERS_COL);
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      // Check if we should seed initial offers
      try {
        const batch = writeBatch(db);
        INITIAL_OFFERS.forEach((offer) => {
          batch.set(doc(db, OFFERS_COL, offer.id), offer);
        });
        await batch.commit();
      } catch (err) {
        console.warn('Could not auto-seed offers in Firestore, using local fallback:', err);
        callback(INITIAL_OFFERS);
      }
      return;
    }

    const offers: CarpoolOffer[] = [];
    snapshot.forEach((d) => {
      offers.push(d.data() as CarpoolOffer);
    });
    callback(offers);
  }, (err) => {
    console.warn('Firestore offers subscription error, falling back:', err);
    callback(INITIAL_OFFERS);
  });
}

// 3. Subscribe to Ride Requests (Real-time)
export function subscribeRequests(callback: (requests: RideRequest[]) => void) {
  const colRef = collection(db, REQUESTS_COL);
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      try {
        const batch = writeBatch(db);
        INITIAL_REQUESTS.forEach((req) => {
          batch.set(doc(db, REQUESTS_COL, req.id), req);
        });
        await batch.commit();
      } catch (err) {
        console.warn('Could not auto-seed requests in Firestore, using local fallback:', err);
        callback(INITIAL_REQUESTS);
      }
      return;
    }

    const requests: RideRequest[] = [];
    snapshot.forEach((d) => {
      requests.push(d.data() as RideRequest);
    });
    callback(requests);
  }, (err) => {
    console.warn('Firestore requests subscription error, falling back:', err);
    callback(INITIAL_REQUESTS);
  });
}

// 4. Subscribe to Admin Accounts (Real-time)
export function subscribeAdminAccounts(callback: (accounts: AdminAccount[]) => void) {
  const colRef = collection(db, ACCOUNTS_COL);
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      try {
        const batch = writeBatch(db);
        INITIAL_ADMIN_ACCOUNTS.forEach((acc) => {
          batch.set(doc(db, ACCOUNTS_COL, acc.id), acc);
        });
        await batch.commit();
      } catch (err) {
        console.warn('Could not auto-seed admin accounts in Firestore, using local fallback:', err);
        callback(INITIAL_ADMIN_ACCOUNTS);
      }
      return;
    }

    const accounts: AdminAccount[] = [];
    snapshot.forEach((d) => {
      accounts.push(d.data() as AdminAccount);
    });
    callback(accounts);
  }, (err) => {
    console.warn('Firestore accounts subscription error, falling back:', err);
    callback(INITIAL_ADMIN_ACCOUNTS);
  });
}

// Actions: Events
export async function saveEventToFirestore(event: Event) {
  await setDoc(doc(db, EVENTS_COL, event.id), event, { merge: true });
}

export async function deleteEventFromFirestore(eventId: string) {
  await deleteDoc(doc(db, EVENTS_COL, eventId));
}

// Actions: Offers
export async function saveOfferToFirestore(offer: CarpoolOffer) {
  await setDoc(doc(db, OFFERS_COL, offer.id), offer, { merge: true });
}

export async function deleteOfferFromFirestore(offerId: string) {
  await deleteDoc(doc(db, OFFERS_COL, offerId));
}

// Actions: Requests
export async function saveRequestToFirestore(request: RideRequest) {
  await setDoc(doc(db, REQUESTS_COL, request.id), request, { merge: true });
}

export async function deleteRequestFromFirestore(requestId: string) {
  await deleteDoc(doc(db, REQUESTS_COL, requestId));
}

// Actions: Admin Accounts
export async function saveAdminAccountToFirestore(account: AdminAccount) {
  await setDoc(doc(db, ACCOUNTS_COL, account.id), account, { merge: true });
}

export async function deleteAdminAccountFromFirestore(accountId: string) {
  await deleteDoc(doc(db, ACCOUNTS_COL, accountId));
}
