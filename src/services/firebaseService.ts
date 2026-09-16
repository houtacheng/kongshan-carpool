import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Event, CarpoolOffer, RideRequest, AdminAccount } from '../types';

const EVENTS_COL = 'events';
const OFFERS_COL = 'carpool_offers';
const REQUESTS_COL = 'ride_requests';
const ACCOUNTS_COL = 'admin_accounts';

// 1. Subscribe to Events (Real-time)
export function subscribeEvents(callback: (events: Event[]) => void) {
  const colRef = collection(db, EVENTS_COL);
  return onSnapshot(colRef, (snapshot) => {
    const events: Event[] = [];
    snapshot.forEach((d) => {
      events.push(d.data() as Event);
    });
    if (events.length > 0) {
      callback(events);
    }
  }, (err) => {
    console.warn('Firestore events subscription error:', err);
  });
}

// 2. Subscribe to Offers (Real-time)
export function subscribeOffers(callback: (offers: CarpoolOffer[]) => void) {
  const colRef = collection(db, OFFERS_COL);
  return onSnapshot(colRef, (snapshot) => {
    const offers: CarpoolOffer[] = [];
    snapshot.forEach((d) => {
      offers.push(d.data() as CarpoolOffer);
    });
    callback(offers);
  }, (err) => {
    console.warn('Firestore offers subscription error:', err);
  });
}

// 3. Subscribe to Ride Requests (Real-time)
export function subscribeRequests(callback: (requests: RideRequest[]) => void) {
  const colRef = collection(db, REQUESTS_COL);
  return onSnapshot(colRef, (snapshot) => {
    const requests: RideRequest[] = [];
    snapshot.forEach((d) => {
      requests.push(d.data() as RideRequest);
    });
    callback(requests);
  }, (err) => {
    console.warn('Firestore requests subscription error:', err);
  });
}

// 4. Subscribe to Admin Accounts (Real-time)
export function subscribeAdminAccounts(callback: (accounts: AdminAccount[]) => void) {
  const colRef = collection(db, ACCOUNTS_COL);
  return onSnapshot(colRef, (snapshot) => {
    const accounts: AdminAccount[] = [];
    snapshot.forEach((d) => {
      accounts.push(d.data() as AdminAccount);
    });
    callback(accounts);
  }, (err) => {
    console.warn('Firestore accounts subscription error:', err);
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
