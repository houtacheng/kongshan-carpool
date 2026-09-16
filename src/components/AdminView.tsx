import React, { useState } from 'react';
import type { Event, CarpoolOffer, RideRequest, ParticipantRole, AdminAccount } from '../types';
import { EAST_COAST_AREAS } from '../data/mockData';
import { useLanguage } from '../i18n/LanguageContext';
import { getLocalizedArea } from '../i18n/translations';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { AccountManagementModal } from './AccountManagementModal';
import { EventManagerModal } from './EventManagerModal';
import {
  Car,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  UserPlus,
  Phone,
  MapPin,
  Send,
  Lock,
  LogOut,
  Sparkles,
  Wand2,
  ThumbsUp,
  Edit3,
  Trash2,
  Shield,
  Calendar,
  Users,
  ShieldCheck,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

interface AdminViewProps {
  currentEvent: Event;
  allEvents: Event[];
  onSelectEvent: (eventId: string) => void;
  onSaveEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  offers: CarpoolOffer[];
  requests: RideRequest[];
  adminAccounts: AdminAccount[];
  currentAdmin: AdminAccount | null;
  onLoginWithGoogle: (account: AdminAccount) => void;
  onLogout: () => void;
  onUpdateAccount: (account: AdminAccount) => void;
  onDeleteAccount: (accountId: string) => void;
  onAddAccount: (account: AdminAccount) => void;
  onMatchRequestToOffer: (requestId: string, offerId: string, leg: 'outbound' | 'return' | 'both') => boolean;
  onCreateOffer: (offer: Omit<CarpoolOffer, 'id' | 'createdAt' | 'outboundPassengers' | 'returnPassengers'>) => void;
  onCreateRequest: (request: Omit<RideRequest, 'id' | 'createdAt' | 'status'>) => void;
  onUpdateOffer?: (offer: CarpoolOffer) => void;
  onUpdateRequest?: (request: RideRequest) => void;
  onCancelRequest?: (requestId: string) => void;
  onDeleteOffer?: (offerId: string) => void;
  onDeleteRequest?: (requestId: string) => void;
  onEjectPassenger?: (offerId: string, passengerId: string, leg: 'outbound' | 'return') => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentEvent,
  allEvents,
  onSelectEvent,
  onSaveEvent,
  onDeleteEvent,
  offers,
  requests,
  adminAccounts,
  currentAdmin,
  onLoginWithGoogle,
  onLogout,
  onUpdateAccount,
  onDeleteAccount,
  onAddAccount,
  onMatchRequestToOffer,
  onCreateOffer,
  onCreateRequest,
  onUpdateOffer,
  onUpdateRequest,
  onCancelRequest,
  onDeleteOffer,
  onDeleteRequest,
  onEjectPassenger,
}) => {
  const { t, language } = useLanguage();
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');

  const currentOffers = offers.filter((o) => o.eventId === currentEvent.id);
  const currentRequests = requests.filter((r) => r.eventId === currentEvent.id);
  const pendingRequests = currentRequests
    .filter((r) => r.status !== 'matched_full')
    .sort((a, b) => {
      if (a.isEjected && !b.isEjected) return -1;
      if (!a.isEjected && b.isEjected) return 1;
      return 0;
    });
  const ejectedRequests = pendingRequests.filter((r) => r.isEjected);
  const ejectedCount = ejectedRequests.length;

  // Manual assignment state
  const [selectedOfferMap, setSelectedOfferMap] = useState<{ [reqId: string]: string }>({});
  const [selectedLegMap, setSelectedLegMap] = useState<{ [reqId: string]: 'outbound' | 'return' | 'both' }>({});

  // Quick Phone Registration Modal for elderly members
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneType, setPhoneType] = useState<'need-ride' | 'offer-ride'>('need-ride');
  const [elderlyName, setElderlyName] = useState('');
  const [elderlyPhone, setElderlyPhone] = useState('');
  const [elderlyWechat, setElderlyWechat] = useState('');
  const [elderlyArea, setElderlyArea] = useState('法拉盛 Flushing (NY)');
  const [elderlyPoint, setElderlyPoint] = useState('');
  const [elderlyCount, setElderlyCount] = useState(1);
  const [elderlyOutboundRole, setElderlyOutboundRole] = useState<ParticipantRole>('volunteer');
  const [elderlyReturnRole, setElderlyReturnRole] = useState<ParticipantRole>('volunteer');
  const [elderlyNotes, setElderlyNotes] = useState('');

  // Admin Editing Request State
  const [adminEditingRequest, setAdminEditingRequest] = useState<RideRequest | null>(null);
  const [adminEditReqName, setAdminEditReqName] = useState('');
  const [adminEditReqPhone, setAdminEditReqPhone] = useState('');
  const [adminEditReqWechat, setAdminEditReqWechat] = useState('');
  const [adminEditReqArea, setAdminEditReqArea] = useState('');
  const [adminEditReqPoint, setAdminEditReqPoint] = useState('');
  const [adminEditReqCount, setAdminEditReqCount] = useState(1);
  const [adminEditReqNeedOutbound, setAdminEditReqNeedOutbound] = useState(true);
  const [adminEditReqOutboundRole, setAdminEditReqOutboundRole] = useState<ParticipantRole>('volunteer');
  const [adminEditReqNeedReturn, setAdminEditReqNeedReturn] = useState(true);
  const [adminEditReqReturnRole, setAdminEditReqReturnRole] = useState<ParticipantRole>('volunteer');
  const [adminEditReqNotes, setAdminEditReqNotes] = useState('');

  const handleOpenAdminEditRequest = (req: RideRequest) => {
    setAdminEditingRequest(req);
    setAdminEditReqName(req.passengerName);
    setAdminEditReqPhone(req.passengerPhone);
    setAdminEditReqWechat(req.wechatOrLine || '');
    setAdminEditReqArea(req.pickupArea);
    setAdminEditReqPoint(req.pickupPoint);
    setAdminEditReqCount(req.passengerCount);
    setAdminEditReqNeedOutbound(req.needOutbound);
    setAdminEditReqOutboundRole(req.outboundRole);
    setAdminEditReqNeedReturn(req.needReturn);
    setAdminEditReqReturnRole(req.returnRole);
    setAdminEditReqNotes(req.notes || '');
  };

  const handleSaveAdminEditRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEditingRequest || !onUpdateRequest) return;
    const updated: RideRequest = {
      ...adminEditingRequest,
      passengerName: adminEditReqName.trim(),
      passengerPhone: adminEditReqPhone.trim(),
      wechatOrLine: adminEditReqWechat.trim(),
      pickupArea: adminEditReqArea,
      pickupPoint: adminEditReqPoint.trim(),
      passengerCount: adminEditReqCount,
      needOutbound: adminEditReqNeedOutbound,
      outboundRole: adminEditReqOutboundRole,
      needReturn: adminEditReqNeedReturn,
      returnRole: adminEditReqReturnRole,
      notes: adminEditReqNotes.trim()
    };
    onUpdateRequest(updated);
    setAdminEditingRequest(null);
  };

  // Admin Editing Offer State
  const [adminEditingOffer, setAdminEditingOffer] = useState<CarpoolOffer | null>(null);
  const [adminEditDriverName, setAdminEditDriverName] = useState('');
  const [adminEditDriverPhone, setAdminEditDriverPhone] = useState('');
  const [adminEditDriverWechat, setAdminEditDriverWechat] = useState('');
  const [adminEditDriverArea, setAdminEditDriverArea] = useState('');
  const [adminEditDriverPoint, setAdminEditDriverPoint] = useState('');
  const [adminEditCarModel, setAdminEditCarModel] = useState('');
  const [adminEditCarColor, setAdminEditCarColor] = useState('');
  const [adminEditPlateNumber, setAdminEditPlateNumber] = useState('');
  const [adminEditNotes, setAdminEditNotes] = useState('');
  const [adminEditHasOutbound, setAdminEditHasOutbound] = useState(true);
  const [adminEditOutboundTime, setAdminEditOutboundTime] = useState('');
  const [adminEditOutboundTotalSeats, setAdminEditOutboundTotalSeats] = useState(4);
  const [adminEditHasReturn, setAdminEditHasReturn] = useState(true);
  const [adminEditReturnTime, setAdminEditReturnTime] = useState('');
  const [adminEditReturnTotalSeats, setAdminEditReturnTotalSeats] = useState(4);

  const handleOpenAdminEditOffer = (offer: CarpoolOffer) => {
    setAdminEditingOffer(offer);
    setAdminEditDriverName(offer.driverName);
    setAdminEditDriverPhone(offer.driverPhone);
    setAdminEditDriverWechat(offer.wechatOrLine || '');
    setAdminEditDriverArea(offer.departureArea);
    setAdminEditDriverPoint(offer.departurePoint);
    setAdminEditCarModel(offer.carModel);
    setAdminEditCarColor(offer.carColor || '');
    setAdminEditPlateNumber(offer.plateNumber || '');
    setAdminEditNotes(offer.notes || '');
    setAdminEditHasOutbound(offer.hasOutbound);
    setAdminEditOutboundTime(offer.outboundTime);
    setAdminEditOutboundTotalSeats(offer.outboundTotalSeats);
    setAdminEditHasReturn(offer.hasReturn);
    setAdminEditReturnTime(offer.returnTime);
    setAdminEditReturnTotalSeats(offer.returnTotalSeats);
  };

  const handleSaveAdminEditOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEditingOffer || !onUpdateOffer) return;

    let finalOutboundPassengers = [...adminEditingOffer.outboundPassengers];
    let finalReturnPassengers = [...adminEditingOffer.returnPassengers];
    let ejectedCountInModal = 0;

    // Outbound leg check
    if (!adminEditHasOutbound) {
      finalOutboundPassengers.forEach((p) => {
        onEjectPassenger?.(adminEditingOffer.id, p.id, 'outbound');
        ejectedCountInModal++;
      });
      finalOutboundPassengers = [];
    } else {
      let outCount = finalOutboundPassengers.reduce((sum, p) => sum + p.passengerCount, 0);
      while (outCount > adminEditOutboundTotalSeats && finalOutboundPassengers.length > 0) {
        const popped = finalOutboundPassengers[finalOutboundPassengers.length - 1];
        onEjectPassenger?.(adminEditingOffer.id, popped.id, 'outbound');
        finalOutboundPassengers.pop();
        outCount -= popped.passengerCount;
        ejectedCountInModal++;
      }
    }

    // Return leg check
    if (!adminEditHasReturn) {
      finalReturnPassengers.forEach((p) => {
        onEjectPassenger?.(adminEditingOffer.id, p.id, 'return');
        ejectedCountInModal++;
      });
      finalReturnPassengers = [];
    } else {
      let retCount = finalReturnPassengers.reduce((sum, p) => sum + p.passengerCount, 0);
      while (retCount > adminEditReturnTotalSeats && finalReturnPassengers.length > 0) {
        const popped = finalReturnPassengers[finalReturnPassengers.length - 1];
        onEjectPassenger?.(adminEditingOffer.id, popped.id, 'return');
        finalReturnPassengers.pop();
        retCount -= popped.passengerCount;
        ejectedCountInModal++;
      }
    }

    const outPassCount = finalOutboundPassengers.reduce((sum, p) => sum + p.passengerCount, 0);
    const retPassCount = finalReturnPassengers.reduce((sum, p) => sum + p.passengerCount, 0);

    const updated: CarpoolOffer = {
      ...adminEditingOffer,
      driverName: adminEditDriverName.trim(),
      driverPhone: adminEditDriverPhone.trim(),
      wechatOrLine: adminEditDriverWechat.trim(),
      departureArea: adminEditDriverArea,
      departurePoint: adminEditDriverPoint.trim(),
      carModel: adminEditCarModel.trim(),
      carColor: adminEditCarColor.trim(),
      plateNumber: adminEditPlateNumber.trim(),
      notes: adminEditNotes.trim(),
      hasOutbound: adminEditHasOutbound,
      outboundTime: adminEditOutboundTime.trim(),
      outboundTotalSeats: adminEditOutboundTotalSeats,
      outboundAvailableSeats: Math.max(0, adminEditOutboundTotalSeats - outPassCount),
      outboundPassengers: finalOutboundPassengers,
      hasReturn: adminEditHasReturn,
      returnTime: adminEditReturnTime.trim(),
      returnTotalSeats: adminEditReturnTotalSeats,
      returnAvailableSeats: Math.max(0, adminEditReturnTotalSeats - retPassCount),
      returnPassengers: finalReturnPassengers,
    };
    onUpdateOffer(updated);
    setAdminEditingOffer(null);

    if (ejectedCountInModal > 0) {
      alert(language === 'en'
        ? `Notice: ${ejectedCountInModal} passenger(s) were automatically popped out due to reduced seat capacity or cancelled leg!`
        : `提示：因車輛容量縮減或行程變更，已有 ${ejectedCountInModal} 位乘客被自動彈出並重新列入等候名單！`
      );
    }
  };

  // Stats calculation
  const totalCars = currentOffers.length;
  const outboundCapacity = currentOffers.reduce((sum, o) => sum + (o.hasOutbound ? o.outboundTotalSeats : 0), 0);
  const outboundMatched = currentOffers.reduce(
    (sum, o) => sum + (o.hasOutbound ? o.outboundPassengers.reduce((pSum, p) => pSum + p.passengerCount, 0) : 0),
    0
  );
  const returnCapacity = currentOffers.reduce((sum, o) => sum + (o.hasReturn ? o.returnTotalSeats : 0), 0);
  const returnMatched = currentOffers.reduce(
    (sum, o) => sum + (o.hasReturn ? o.returnPassengers.reduce((pSum, p) => pSum + p.passengerCount, 0) : 0),
    0
  );
  const totalPendingPassengers = pendingRequests.reduce((sum, r) => sum + r.passengerCount, 0);

  // --- SMART SUGGESTED MATCHING ALGORITHM ---
  interface SuggestedMatch {
    requestId: string;
    offerId: string;
    offer: CarpoolOffer;
    leg: 'outbound' | 'return' | 'both';
    score: number;
    reason: string;
  }

  const findBestSuggestion = (req: RideRequest): SuggestedMatch | null => {
    let bestMatch: SuggestedMatch | null = null;
    let maxScore = -1;

    for (const offer of currentOffers) {
      let score = 0;
      const reasons: string[] = [];

      // 1. Same area matching
      if (offer.departureArea === req.pickupArea) {
        score += 50;
        reasons.push(language === 'en' ? 'Same departure area' : '同出發區域');
      } else if (
        offer.departureArea.includes(req.pickupArea.split(' ')[0]) ||
        req.pickupArea.includes(offer.departureArea.split(' ')[0])
      ) {
        score += 30;
        reasons.push(language === 'en' ? 'Adjacent community' : '相鄰生活圈');
      }

      // 2. Leg & Seats check
      const canOutbound =
        req.needOutbound &&
        offer.hasOutbound &&
        offer.outboundAvailableSeats >= req.passengerCount;

      const canReturn =
        req.needReturn &&
        offer.hasReturn &&
        offer.returnAvailableSeats >= req.passengerCount;

      if (!canOutbound && !canReturn) {
        continue; // Cannot fit either leg
      }

      let matchLeg: 'outbound' | 'return' | 'both' = 'both';

      if (canOutbound && canReturn) {
        score += 40;
        reasons.push(language === 'en' ? 'Both legs can be covered' : '去回雙程皆可搭乘');
        matchLeg = 'both';
      } else if (canOutbound) {
        score += 20;
        reasons.push(language === 'en' ? 'Can take outbound leg' : '可接送去程');
        matchLeg = 'outbound';
      } else {
        score += 20;
        reasons.push(language === 'en' ? 'Can take return leg' : '可接送回程');
        matchLeg = 'return';
      }

      // 3. Role compatibility
      if (canOutbound) {
        if (offer.outboundMode === req.outboundRole || offer.outboundMode === 'both') {
          score += 15;
          reasons.push(
            language === 'en'
              ? (req.outboundRole === 'volunteer' ? 'Matches volunteer early ride' : 'Matches attendee schedule')
              : (req.outboundRole === 'volunteer' ? '符合義工早車' : '符合正行時間')
          );
        }
      }

      if (canReturn) {
        if (offer.returnMode === req.returnRole || offer.returnMode === 'both') {
          score += 15;
          reasons.push(
            language === 'en'
              ? (req.returnRole === 'volunteer' ? 'Matches volunteer return ride' : 'Matches attendee departure')
              : (req.returnRole === 'volunteer' ? '符合善後返程' : '符合活動結束即回')
          );
        }
      }

      if (req.isEjected) {
        score += 30;
        reasons.unshift(language === 'en' ? '⚠️ Priority: Ejected passenger' : '⚠️ 優先安排：車輛異動彈出');
      }

      if (score > maxScore) {
        maxScore = score;
        bestMatch = {
          requestId: req.id,
          offerId: offer.id,
          offer,
          leg: matchLeg,
          score,
          reason: reasons.join(' • '),
        };
      }
    }

    return bestMatch;
  };

  // Pre-calculate suggestions for all pending requests
  const suggestionsMap: { [reqId: string]: SuggestedMatch } = {};
  pendingRequests.forEach((req) => {
    const sug = findBestSuggestion(req);
    if (sug) {
      suggestionsMap[req.id] = sug;
    }
  });

  const totalSuggestionsCount = Object.keys(suggestionsMap).length;

  // Handler: Apply one suggestion
  const handleApplySuggestion = (sug: SuggestedMatch) => {
    const success = onMatchRequestToOffer(sug.requestId, sug.offerId, sug.leg);
    if (success) {
      alert(language === 'en' ? `Adopted recommendation: passenger assigned to ${sug.offer.driverName}'s vehicle!` : `已成功採納建議，將乘客指派至 ${sug.offer.driverName} 的車輛！`);
    } else {
      alert(language === 'en' ? 'This car has insufficient seats remaining.' : '該車次剩餘座位不足，無法排入。');
    }
  };

  // Handler: Apply ALL suggestions in batch
  const handleApplyAllSuggestions = () => {
    if (totalSuggestionsCount === 0) {
      alert(language === 'en' ? 'No recommendations available to pair automatically.' : '目前沒有可自動配對的建議。');
      return;
    }

    if (!confirm(language === 'en' ? `System will automatically apply optimal carpool matches for ${totalSuggestionsCount} passengers. Proceed?` : `系統即將自動為 ${totalSuggestionsCount} 位乘客套用最佳車位配對，是否確認？`)) {
      return;
    }

    let successCount = 0;
    for (const req of pendingRequests) {
      const sug = suggestionsMap[req.id];
      if (sug) {
        const ok = onMatchRequestToOffer(sug.requestId, sug.offerId, sug.leg);
        if (ok) successCount++;
      }
    }

    alert(language === 'en' ? `Smart matching complete! Successfully paired ${successCount} passenger(s).` : `智慧媒合完成！成功配對 ${successCount} 筆乘客名單。`);
  };

  // Google Sign-In handler (Firebase Auth + Google OAuth)
  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    setAuthError('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const email = (user.email || '').toLowerCase();
      const displayName = user.displayName || email.split('@')[0] || 'Google User';
      const photoURL = user.photoURL || undefined;

      const existingAccount = adminAccounts.find((a) => a.email.toLowerCase() === email);

      if (existingAccount) {
        if (existingAccount.status === 'suspended') {
          setAuthError(t.accountSuspendedNotice);
          return;
        }
        if (existingAccount.status === 'pending') {
          setAuthError(t.accountPendingNotice);
          return;
        }
        onLoginWithGoogle({
          ...existingAccount,
          lastLoginAt: new Date().toLocaleString('zh-TW', { hour12: false })
        });
        return;
      }

      // Check if designated Super Administrator
      const isSuper = email === 'houtacheng@gmail.com' || adminAccounts.length === 0;

      if (isSuper) {
        const newAccount: AdminAccount = {
          id: `acc-${Date.now()}`,
          email,
          name: displayName || '系統管理員',
          avatar: photoURL,
          role: 'super_admin',
          status: 'active',
          authProvider: 'google',
          registeredAt: new Date().toLocaleString('zh-TW', { hour12: false }),
          lastLoginAt: new Date().toLocaleString('zh-TW', { hour12: false }),
          note: '系統管理員 (最高權限)'
        };
        onAddAccount(newAccount);
        onLoginWithGoogle(newAccount);
      } else {
        // Any unknown Google account must be approved by 系統管理員 first
        const pendingAccount: AdminAccount = {
          id: `acc-${Date.now()}`,
          email,
          name: displayName,
          avatar: photoURL,
          role: 'staff',
          status: 'pending',
          authProvider: 'google',
          registeredAt: new Date().toLocaleString('zh-TW', { hour12: false }),
          lastLoginAt: new Date().toLocaleString('zh-TW', { hour12: false }),
          note: '新註冊待審核'
        };
        onAddAccount(pendingAccount);
        setAuthError(
          language === 'en'
            ? `⏳ Your Google account (${email}) is pending review. Access will be granted upon System Administrator approval.`
            : `⏳ 您的 Google 帳號 (${email}) 已提出授權申請。本後台含有信眾個人機密資料，請聯繫系統管理員審核啟用後方可存取！`
        );
      }
    } catch (err: any) {
      console.warn('Google Sign-in error:', err);
      if (err?.code === 'auth/popup-blocked') {
        setAuthError(language === 'en' ? 'Popup was blocked by browser. Please allow popups.' : '瀏覽器封鎖了 Google 登入視窗，請允許彈跳視窗後再試一次！');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setAuthError(language === 'en' ? 'Google sign-in was cancelled.' : 'Google 登入已取消。');
      } else {
        setAuthError(err?.message || (language === 'en' ? 'Google sign-in failed.' : 'Google 登入失敗，請稍後再試。'));
      }
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleManualAssign = (requestId: string) => {
    const targetOfferId = selectedOfferMap[requestId];
    const targetLeg = selectedLegMap[requestId] || 'both';

    if (!targetOfferId) {
      alert(language === 'en' ? 'Please select a vehicle to assign!' : '請先選擇要指派的車輛！');
      return;
    }
    const success = onMatchRequestToOffer(requestId, targetOfferId, targetLeg);
    if (success) {
      alert(language === 'en' ? 'Assigned successfully! Passenger added to roster.' : '指派成功！已將乘客排入指定車次名冊。');
    } else {
      alert(language === 'en' ? 'This vehicle does not have enough remaining seats for the selected leg.' : '該車次在指定行程的剩餘座位不足，無法排入！');
    }
  };

  const handleElderlySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!elderlyName.trim() || !elderlyPhone.trim() || !elderlyPoint.trim()) {
      alert(language === 'en' ? 'Please fill in name, phone, and pickup point!' : '請填妥姓名、電話與集合地點！');
      return;
    }

    if (phoneType === 'need-ride') {
      onCreateRequest({
        eventId: currentEvent.id,
        passengerName: `${elderlyName.trim()} (${language === 'en' ? 'Assisted by Admin' : '報名報到組代報'})`,
        passengerPhone: elderlyPhone.trim(),
        wechatOrLine: elderlyWechat.trim() || undefined,
        pickupArea: elderlyArea,
        pickupPoint: elderlyPoint.trim(),
        passengerCount: elderlyCount,
        needOutbound: true,
        outboundRole: elderlyOutboundRole,
        needReturn: true,
        returnRole: elderlyReturnRole,
        notes: elderlyNotes.trim() ? `[${language === 'en' ? 'Assisted' : '代報'}] ${elderlyNotes.trim()}` : (language === 'en' ? '[Phone assisted by Admin]' : '[報名報到組電話代錄]'),
      });
      alert(language === 'en' ? 'Ride request registered successfully!' : '已成功登記搭乘需求！');
    } else {
      onCreateOffer({
        eventId: currentEvent.id,
        driverName: `${elderlyName.trim()} (${language === 'en' ? 'Assisted by Admin' : '報名報到組代報'})`,
        driverPhone: elderlyPhone.trim(),
        wechatOrLine: elderlyWechat.trim() || undefined,
        departureArea: elderlyArea,
        departurePoint: elderlyPoint.trim(),
        carModel: language === 'en' ? 'Standard Vehicle' : '自用車',
        notes: elderlyNotes.trim() || undefined,
        hasOutbound: true,
        outboundTime: elderlyOutboundRole === 'volunteer' ? (language === 'en' ? '06:30 Volunteer' : '06:30 義工車') : (language === 'en' ? '08:00 Attendee' : '08:00 正行車'),
        outboundMode: elderlyOutboundRole,
        outboundTotalSeats: elderlyCount,
        outboundAvailableSeats: elderlyCount,
        hasReturn: true,
        returnTime: elderlyReturnRole === 'volunteer' ? (language === 'en' ? '16:30 Volunteer Cleanup' : '16:30 善後後回') : (language === 'en' ? '15:30 Attendee Return' : '15:30 活動結束即回'),
        returnMode: elderlyReturnRole,
        returnTotalSeats: elderlyCount,
        returnAvailableSeats: elderlyCount,
      });
      alert(language === 'en' ? 'Vehicle seats registered successfully!' : '已成功登記車位！');
    }

    setIsPhoneModalOpen(false);
    setElderlyName('');
    setElderlyPhone('');
    setElderlyPoint('');
    setElderlyNotes('');
  };

  const handleExportCSV = () => {
    const isEn = language === 'en';
    const rows = [
      [isEn ? 'Event Name' : '活動名稱', currentEvent.title],
      [isEn ? 'Event Theme' : '活動主題', currentEvent.theme],
      [isEn ? 'Event Date' : '活動日期', currentEvent.date],
      [isEn ? 'Location' : '活動地點', `${currentEvent.templeName} (${currentEvent.location})`],
      [isEn ? 'Organizing Team' : '負責組別', isEn ? 'Kong Shan Temple Registration Team' : '空山寺 報名報到組'],
      [''],
      [
        isEn ? 'Trip Leg' : '行程類別',
        isEn ? 'Departure Area' : '出發區域',
        isEn ? 'Meeting Point' : '集合點',
        isEn ? 'Driver Name' : '車主姓名',
        isEn ? 'Driver Phone' : '車主電話',
        isEn ? 'Vehicle' : '車型',
        isEn ? 'Departure Time' : '發車時間',
        isEn ? 'Service Type' : '班次屬性',
        isEn ? 'Passenger Name' : '乘客姓名',
        isEn ? 'Passenger Phone' : '乘客電話',
        isEn ? 'Seats' : '搭乘人數',
        isEn ? 'Role' : '乘客身分(義工/正行)',
        isEn ? 'Notes' : '備註',
      ],
    ];

    currentOffers.forEach((offer) => {
      // Outbound rows
      if (offer.hasOutbound) {
        const outboundRoleStr = offer.outboundMode === 'volunteer' ? (isEn ? 'Volunteer (Early)' : '義工早車') : (isEn ? 'Attendee' : '正行車');
        if (offer.outboundPassengers.length === 0) {
          rows.push([
            isEn ? 'Outbound (To Temple)' : '去程 (前往空山寺)',
            getLocalizedArea(offer.departureArea, language),
            offer.departurePoint,
            offer.driverName,
            offer.driverPhone,
            offer.carModel,
            offer.outboundTime,
            outboundRoleStr,
            isEn ? '(No passengers)' : '(尚無乘客)',
            '-',
            '0',
            '-',
            offer.notes || '',
          ]);
        } else {
          offer.outboundPassengers.forEach((p) => {
            rows.push([
              isEn ? 'Outbound (To Temple)' : '去程 (前往空山寺)',
              getLocalizedArea(offer.departureArea, language),
              offer.departurePoint,
              offer.driverName,
              offer.driverPhone,
              offer.carModel,
              offer.outboundTime,
              outboundRoleStr,
              p.name,
              p.phone,
              p.passengerCount.toString(),
              p.role === 'volunteer' ? (isEn ? 'Volunteer' : '義工組') : (isEn ? 'Attendee' : '正行組'),
              p.pickupNote || '',
            ]);
          });
        }
      }

      // Return rows
      if (offer.hasReturn) {
        const returnRoleStr = offer.returnMode === 'volunteer' ? (isEn ? 'Volunteer (Cleanup)' : '義工善後車') : (isEn ? 'Attendee' : '正行車');
        if (offer.returnPassengers.length === 0) {
          rows.push([
            isEn ? 'Return (Heading Back)' : '回程 (返回紐約/新澤西)',
            getLocalizedArea(offer.departureArea, language),
            offer.departurePoint,
            offer.driverName,
            offer.driverPhone,
            offer.carModel,
            offer.returnTime,
            returnRoleStr,
            isEn ? '(No passengers)' : '(尚無乘客)',
            '-',
            '0',
            '-',
            offer.notes || '',
          ]);
        } else {
          offer.returnPassengers.forEach((p) => {
            rows.push([
              isEn ? 'Return (Heading Back)' : '回程 (返回紐約/新澤西)',
              getLocalizedArea(offer.departureArea, language),
              offer.departurePoint,
              offer.driverName,
              offer.driverPhone,
              offer.carModel,
              offer.returnTime,
              returnRoleStr,
              p.name,
              p.phone,
              p.passengerCount.toString(),
              p.role === 'volunteer' ? (isEn ? 'Volunteer' : '義工組') : (isEn ? 'Attendee' : '正行組'),
              p.pickupNote || '',
            ]);
          });
        }
      }
    });

    const csvContent =
      '\uFEFF' + rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', isEn ? `${currentEvent.title}_Carpool_Roster.csv` : `${currentEvent.title}_共乘名冊.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- RENDER LOGIN VIEW IF NOT AUTHENTICATED ---
  if (!currentAdmin) {
    return (
      <div className="max-w-md mx-auto py-10 px-4 animate-in fade-in">
        <div className="bg-white rounded-3xl border border-amber-200 p-6 md:p-8 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-200">
            <ShieldCheck className="w-8 h-8 text-amber-800" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              {language === 'en' ? 'Registration & Check-In Admin Portal' : '報名報到組後台'}
            </h2>
            <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
              {language === 'en' ? 'Protected by Google Account Authorization & Cloud Security Rules' : '由 Google 帳號授權與雲端權限規則保護'}
            </p>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs md:text-sm p-3.5 rounded-xl font-bold flex items-center gap-2 text-left">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Google Sign-in Button Only */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleSigningIn}
              className="w-full py-3.5 px-4 bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-200 hover:border-stone-300 rounded-2xl font-black text-sm transition-all shadow-xs flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isGoogleSigningIn ? (language === 'en' ? 'Connecting to Google...' : '正在連線 Google 帳號...') : t.googleSignInBtn}</span>
            </button>
          </div>

          {/* Privacy & Security Note */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-left text-xs text-stone-500 space-y-1 leading-relaxed">
            <div className="font-bold text-stone-800 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>{language === 'en' ? 'Security & Privacy Compliance' : '個資保護與安全合規：'}</span>
            </div>
            <p>
              {language === 'en'
                ? 'Only verified and active staff accounts can view unmasked passenger phone numbers and WhatsApp IDs.'
                : '本後台含有信眾與同修之個人電話與聯絡方式，唯有經系統管理員審核啟用之 Google 帳號方可存取。'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER FULL ADMIN DASHBOARD ---
  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner with Current Admin Profile & Actions */}
      <div className="bg-stone-900 text-stone-100 p-5 md:p-6 rounded-3xl shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl md:text-2xl font-black tracking-tight">
                {language === 'en' ? 'Kong Shan Temple Registration & Check-In Hub' : '空山寺 報名報到組調度中樞'}
              </h2>
              <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-0.5 rounded-full border border-amber-500/30 font-bold">
                {language === 'en' ? 'US East Hub' : '美東總調度'}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full border font-bold flex items-center gap-1 ${
                  currentAdmin.role === 'super_admin'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
              >
                <Shield className="w-3 h-3" />
                <span>{currentAdmin.role === 'super_admin' ? t.accountRoleSuperAdmin : t.accountRoleStaff}</span>
              </span>
            </div>

            <div className="flex items-center gap-2.5 mt-2 text-xs text-stone-300">
              {currentAdmin.avatar ? (
                <img src={currentAdmin.avatar} alt={currentAdmin.name} className="w-6 h-6 rounded-full border border-amber-400" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-amber-800 text-white font-bold flex items-center justify-center text-[10px]">
                  {currentAdmin.name.slice(0, 1)}
                </div>
              )}
              <span className="font-black text-white">{currentAdmin.name}</span>
              <span className="text-stone-400">({currentAdmin.email})</span>
              <span className="text-stone-500 hidden sm:inline">•</span>
              <span className="text-stone-400 hidden sm:inline">{currentEvent.title}</span>
            </div>
          </div>

          {/* Quick Management Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsPhoneModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'en' ? 'Phone Registration' : '代長輩登記'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{language === 'en' ? 'Export CSV' : '匯出 CSV'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>{language === 'en' ? 'Print' : '列印名冊'}</span>
            </button>

            {/* Event Management Button (Multi-Event) */}
            <button
              onClick={() => setShowEventModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-800 hover:bg-amber-700 text-amber-100 border border-amber-600/50 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title={language === 'en' ? 'Manage Temple Events (Team Leader & Admin authorized)' : '🎪 法會營隊管理（報名報到組組長與系統管理員皆可管理）'}
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>{t.eventManagementBtn}</span>
            </button>

            {/* Super Admin: Account Management Button */}
            {currentAdmin.role === 'super_admin' && (
              <button
                onClick={() => setShowAccountModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700/60 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Users className="w-4 h-4 text-purple-300" />
                <span>{t.accountManagementBtn}</span>
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-3 py-2 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800/60 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-300" />
              <span>{t.adminLogoutBtn}</span>
            </button>
          </div>
        </div>

        {/* Event Selector Sub-Bar */}
        <div className="pt-3 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-stone-400 font-bold">{t.currentManagingEvent}:</span>
            <div className="relative inline-block">
              <select
                value={currentEvent.id}
                onChange={(e) => onSelectEvent(e.target.value)}
                className="bg-stone-800 text-amber-300 font-black px-3 py-1.5 pr-8 rounded-xl border border-stone-700 focus:outline-hidden focus:border-amber-500 cursor-pointer appearance-none text-xs"
              >
                {allEvents.map((evt) => (
                  <option key={evt.id} value={evt.id} className="bg-stone-900 text-white">
                    {evt.title} ({evt.status === 'published' ? '🟢 公開' : '🟡 隱藏'})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="text-stone-400 font-medium truncate">
            📍 寺院地址：{currentEvent.location}
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs md:text-sm font-bold">
            <span>{language === 'en' ? 'Registered Cars' : '登記愛心車輛'}</span>
            <Car className="w-5 h-5 text-amber-700" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-stone-900 mt-1.5">
            {totalCars} <span className="text-xs md:text-sm font-normal text-stone-500">{language === 'en' ? 'cars' : '部'}</span>
          </div>
          <div className="text-xs text-stone-400 mt-0.5 font-medium">
            {language === 'en' ? 'Flushing / Brooklyn / NJ' : '服務法拉盛/布魯克林/NJ'}
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs md:text-sm font-bold">
            <span>{language === 'en' ? 'Outbound (To Temple)' : '去程 (上山入席)'}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-emerald-700 mt-1.5">
            {outboundMatched} / {outboundCapacity} <span className="text-xs md:text-sm font-normal text-stone-500">{language === 'en' ? 'seats' : '人'}</span>
          </div>
          <div className="text-xs text-emerald-700 mt-0.5 font-bold">
            {language === 'en' ? 'Occupancy' : '入席率'} {outboundCapacity > 0 ? Math.round((outboundMatched / outboundCapacity) * 100) : 0}%
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs md:text-sm font-bold">
            <span>{language === 'en' ? 'Return (Heading Back)' : '回程 (返市區入席)'}</span>
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-amber-800 mt-1.5">
            {returnMatched} / {returnCapacity} <span className="text-xs md:text-sm font-normal text-stone-500">{language === 'en' ? 'seats' : '人'}</span>
          </div>
          <div className="text-xs text-amber-800 mt-0.5 font-bold">
            {language === 'en' ? 'Occupancy' : '入席率'} {returnCapacity > 0 ? Math.round((returnMatched / returnCapacity) * 100) : 0}%
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs md:text-sm font-bold">
            <span>{language === 'en' ? 'Pending Passengers' : '待安排需求乘客'}</span>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-orange-600 mt-1.5">
            {totalPendingPassengers} <span className="text-xs md:text-sm font-normal text-stone-500">{language === 'en' ? 'passengers' : '人'}</span>
          </div>
          <div className="text-xs text-orange-700 mt-0.5 font-bold">
            {language === 'en' ? `${pendingRequests.length} pending` : `${pendingRequests.length} 筆待調度`}
          </div>
        </div>
      </div>

      {/* Urgent Ejected Alert Banner */}
      {ejectedCount > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-200 text-rose-800 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-rose-700" />
            </div>
            <div>
              <h4 className="font-black text-sm md:text-base flex items-center gap-2 flex-wrap">
                <span>{language === 'en' ? `Priority Alert: ${ejectedCount} Passenger(s) Ejected Due to Vehicle Change/Deletion` : `⚠️ 特別注意：目前有 ${ejectedCount} 筆需求因車輛修改或刪除而彈出！`}</span>
                <span className="px-2.5 py-0.5 bg-rose-200 text-rose-900 rounded-full text-xs font-black animate-pulse border border-rose-300">
                  {t.ejectedBadge}
                </span>
              </h4>
              <p className="text-xs md:text-sm text-rose-700 font-medium mt-0.5">
                {t.ejectedNotice}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- SMART SUGGESTED MATCHING HERO SECTION --- */}
      {totalSuggestionsCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-5 md:p-6 shadow-md space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Wand2 className="w-6 h-6 text-amber-200" />
                <h3 className="text-lg md:text-xl font-black tracking-tight">
                  ✨ {language === 'en' ? 'System Smart Match Recommendations' : '系統智慧建議媒合中心 (Smart Suggestion)'}
                </h3>
              </div>
              <p className="text-xs md:text-sm text-amber-100 font-medium">
                {language === 'en' ? 'The system has calculated optimal pairings based on area, schedule, and remaining seat capacity!' : '系統已根據「同出發區域」、「義工早到/正行需求」與「空位數」，自動計算出最佳推薦方案！'}
              </p>
            </div>

            <button
              onClick={handleApplyAllSuggestions}
              className="px-5 py-3 bg-white hover:bg-stone-50 text-orange-900 rounded-2xl font-black text-xs md:text-sm transition-all cursor-pointer shadow-lg hover:scale-102 flex items-center justify-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>⚡ {language === 'en' ? `Apply All Suggestions (${totalSuggestionsCount})` : `一鍵套用所有建議 (${totalSuggestionsCount} 筆)`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Unmatched Requests Center with Smart Suggestions */}
      <div className="bg-white rounded-3xl border border-amber-200 p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-lg md:text-xl font-black text-stone-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              {language === 'en' ? `Pending Passenger Requests (${pendingRequests.length})` : `待協調乘客名冊 (${pendingRequests.length} 筆)`}
            </h3>
            <p className="text-xs md:text-sm text-stone-500 mt-0.5 font-medium">
              {language === 'en' ? 'For unassigned passengers, you can adopt smart recommendations or manually assign vehicles!' : '尚未配對之乘客，報名報到組可直接「採納系統建議」或「手動指派」至相應車次！'}
            </p>
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-sm text-emerald-800 bg-emerald-50 p-4 rounded-2xl text-center font-bold">
            {language === 'en' ? '🎉 Great! All passenger rides have been successfully arranged.' : '🎉 太棒了！目前所有乘客的去程與回程需求均已全數安排妥當。'}
          </p>
        ) : (
          <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden text-xs md:text-sm">
            {pendingRequests.map((req) => {
              const suggestion = suggestionsMap[req.id];

              return (
                <div
                  key={req.id}
                  className={`p-4 md:p-5 flex flex-col gap-3 transition-colors ${
                    req.isEjected
                      ? 'bg-rose-50/70 border-l-4 border-l-rose-500 hover:bg-rose-50'
                      : 'bg-white hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between gap-2.5 flex-wrap">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-black text-base md:text-lg text-stone-900">
                            {req.passengerName}
                          </span>
                          {req.isEjected && (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 font-black text-xs flex items-center gap-1 border border-rose-300 animate-pulse">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                              {t.ejectedBadge}
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 rounded bg-orange-100 text-orange-900 font-bold text-xs">
                            {language === 'en' ? 'Needs' : '需求'} {req.passengerCount} {t.personCountSuffix}
                          </span>
                          <span className="text-stone-500 font-medium">{language === 'en' ? 'Phone:' : '電話：'}{req.passengerPhone}</span>
                          {req.wechatOrLine && (
                            <span className="text-stone-500 font-medium">WhatsApp: {req.wechatOrLine}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenAdminEditRequest(req)}
                            className="px-2.5 py-1 text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                            <span>{t.editRequestBtn}</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(t.deleteRequestConfirm)) {
                                (onDeleteRequest || onCancelRequest)?.(req.id);
                              }
                            }}
                            className="px-2.5 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t.deleteRequestBtn}</span>
                          </button>
                        </div>
                      </div>

                      {/* Ejected Reason Callout */}
                      {req.isEjected && req.ejectedReason && (
                        <div className="bg-rose-100/90 border border-rose-300 text-rose-950 rounded-xl p-2.5 text-xs flex items-start gap-2 shadow-2xs">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold text-rose-900">{t.ejectedReasonPrefix}</strong>
                            <span>{req.ejectedReason}</span>
                            {req.ejectedAt && (
                              <span className="text-rose-600 ml-2 font-mono text-[11px]">({req.ejectedAt})</span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="text-stone-700 flex items-center gap-1 font-medium">
                        <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>
                          {language === 'en' ? 'Preferred Location:' : '期望地點：'} <strong className="text-stone-900">{getLocalizedArea(req.pickupArea, language)}</strong> - {req.pickupPoint}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-0.5 text-xs">
                        {req.needOutbound && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                            {t.outbound}: {req.outboundRole === 'volunteer' ? (language === 'en' ? 'Volunteer (Early 08:00)' : '義工組 (08:00前早到)') : (language === 'en' ? 'Attendee' : '正行組')}
                          </span>
                        )}
                        {req.needReturn && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-800 border border-stone-200 font-bold">
                            {t.returnLeg}: {req.returnRole === 'volunteer' ? (language === 'en' ? 'Volunteer (Cleanup)' : '義工組 (善後賦歸)') : (language === 'en' ? 'Attendee (15:30)' : '正行組 (15:30即回)')}
                          </span>
                        )}
                      </div>

                      {req.notes && (
                        <div className="text-stone-600 bg-stone-50 p-2 rounded-xl text-xs">
                          {language === 'en' ? 'Notes:' : '備註：'}{req.notes}
                        </div>
                      )}
                    </div>

                    {/* SMART SUGGESTION BADGE & QUICK APPLY */}
                    {suggestion && (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-3 text-xs md:text-sm space-y-1.5 md:max-w-sm self-stretch md:self-auto flex flex-col justify-between">
                        <div className="flex items-center gap-1.5 font-black text-amber-950">
                          <ThumbsUp className="w-4 h-4 text-amber-700" />
                          <span>{language === 'en' ? 'Recommended Vehicle:' : '系統推薦最佳車輛：'}</span>
                        </div>
                        <div className="font-bold text-stone-900 text-xs">
                          🚗 {suggestion.offer.driverName} ({getLocalizedArea(suggestion.offer.departureArea, language).split(',')[0]}，{suggestion.leg === 'both' ? (language === 'en' ? 'Both Ways' : '去回雙程') : suggestion.leg === 'outbound' ? (language === 'en' ? 'Outbound' : '去程') : (language === 'en' ? 'Return' : '回程')})
                        </div>
                        <div className="text-[11px] text-amber-900/80 font-medium">
                          {suggestion.reason}
                        </div>
                        <button
                          onClick={() => handleApplySuggestion(suggestion)}
                          className="w-full mt-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Adopt Recommendation' : '採納此建議指派'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Manual Assignment Controls */}
                  <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-stone-500 font-medium">
                      {language === 'en' ? 'Or manually assign to another vehicle:' : '或自行手動指派其他車次：'}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={selectedOfferMap[req.id] || ''}
                        onChange={(e) =>
                          setSelectedOfferMap((prev) => ({
                            ...prev,
                            [req.id]: e.target.value,
                          }))
                        }
                        className="border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 font-bold focus:outline-hidden focus:border-amber-500 max-w-[200px]"
                      >
                        <option value="">{language === 'en' ? '-- Select Vehicle --' : '-- 手動選擇車輛 --'}</option>
                        {currentOffers.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.driverName} ({getLocalizedArea(o.departureArea, language).split(',')[0]}，{language === 'en' ? `Out:${o.outboundAvailableSeats}/Ret:${o.returnAvailableSeats}` : `去餘${o.outboundAvailableSeats}/回餘${o.returnAvailableSeats}`})
                          </option>
                        ))}
                      </select>

                      <select
                        value={selectedLegMap[req.id] || 'both'}
                        onChange={(e) =>
                          setSelectedLegMap((prev) => ({
                            ...prev,
                            [req.id]: e.target.value as any,
                          }))
                        }
                        className="border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs text-stone-800 font-bold"
                      >
                        <option value="both">{language === 'en' ? 'Both Outbound & Return' : '指派去回雙程'}</option>
                        <option value="outbound">{language === 'en' ? 'Outbound Only' : '僅指派去程'}</option>
                        <option value="return">{language === 'en' ? 'Return Only' : '僅指派回程'}</option>
                      </select>

                      <button
                        onClick={() => handleManualAssign(req.id)}
                        disabled={!selectedOfferMap[req.id]}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer shadow-xs ${
                          selectedOfferMap[req.id]
                            ? 'bg-stone-800 hover:bg-black text-white'
                            : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        <Send className="w-3 h-3" />
                        {language === 'en' ? 'Assign' : '手動指派'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fleet & Passenger Roster by Vehicle */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="text-lg md:text-xl font-black text-stone-900 flex items-center gap-2">
            <Car className="w-6 h-6 text-amber-700" />
            {language === 'en' ? 'Fleet Manifest & Trip Roster' : '全場車隊去回程入席調度名冊'}
          </h3>
          <span className="text-xs md:text-sm text-stone-500 font-medium">{currentEvent.title}</span>
        </div>

        <div className="space-y-4">
          {currentOffers.map((offer) => (
            <div
              key={offer.id}
              className="border border-stone-200 rounded-2xl overflow-hidden text-xs md:text-sm shadow-2xs"
            >
              {/* Driver Bar */}
              <div className="bg-stone-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-black text-stone-900 text-base">
                    🚗 {offer.driverName}
                  </span>
                  <a
                    href={`tel:${offer.driverPhone}`}
                    className="text-amber-800 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {offer.driverPhone}
                  </a>
                  {offer.wechatOrLine && (
                    <span className="text-stone-500 font-medium">WhatsApp: {offer.wechatOrLine}</span>
                  )}
                  <span className="text-stone-300">|</span>
                  <span className="text-stone-600 font-medium">
                    {offer.carColor || ''} {offer.carModel} {offer.plateNumber ? `[${offer.plateNumber}]` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-lg bg-white border border-stone-200 text-stone-800 font-bold">
                    📍 {getLocalizedArea(offer.departureArea, language)} ({offer.departurePoint})
                  </span>
                  <button
                    onClick={() => handleOpenAdminEditOffer(offer)}
                    className="px-2.5 py-1 text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t.editOfferBtn}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(t.deleteOfferConfirm)) {
                        onDeleteOffer?.(offer.id);
                      }
                    }}
                    className="px-2.5 py-1 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.deleteOfferBtn}</span>
                  </button>
                </div>
              </div>

              {/* Legs comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-100 bg-white">
                {/* Outbound column */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                    <span className="font-black text-amber-950 flex items-center gap-1.5">
                      🚙 {language === 'en' ? 'Outbound to Kong Shan Temple' : '去程前往空山寺'} ({offer.outboundTime})
                    </span>
                    <span className="font-bold text-amber-800 text-xs">
                      {language === 'en'
                        ? `${offer.outboundPassengers.reduce((sum, p) => sum + p.passengerCount, 0)} / ${offer.outboundTotalSeats} seats booked`
                        : `已排 ${offer.outboundPassengers.reduce((sum, p) => sum + p.passengerCount, 0)} / ${offer.outboundTotalSeats} 席`}
                    </span>
                  </div>

                  {offer.outboundPassengers.length === 0 ? (
                    <p className="text-stone-400 italic py-1 text-xs">{language === 'en' ? 'No outbound passengers yet' : '尚無去程乘客'}</p>
                  ) : (
                    <div className="space-y-2">
                      {offer.outboundPassengers.map((p) => (
                        <div key={p.id} className="bg-stone-50 p-2.5 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-bold text-stone-900 flex items-center gap-2">
                              <span>{p.name}</span>
                              <span className="text-xs px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                                {p.passengerCount} {language === 'en' ? 'seats' : '人'}
                              </span>
                              <span className={`text-xs px-1.5 py-0.2 rounded font-bold ${
                                p.role === 'volunteer' ? 'bg-orange-100 text-orange-900' : 'bg-emerald-100 text-emerald-900'
                              }`}>
                                {p.role === 'volunteer' ? (language === 'en' ? 'Volunteer' : '義工早車') : (language === 'en' ? 'Attendee' : '正行')}
                              </span>
                            </div>
                            <div className="text-xs text-stone-500 mt-0.5 font-medium">
                              {p.pickupNote || (language === 'en' ? 'Meet on time' : '準時集合')}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <a href={`tel:${p.phone}`} className="text-stone-600 hover:text-amber-800 p-1 rounded-lg hover:bg-stone-200">
                              <Phone className="w-4 h-4" />
                            </a>
                            {onEjectPassenger && (
                              <button
                                onClick={() => {
                                  if (confirm(t.ejectPassengerConfirm)) {
                                    onEjectPassenger(offer.id, p.id, 'outbound');
                                  }
                                }}
                                className="px-2 py-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1"
                                title={t.ejectPassengerBtn}
                              >
                                <Trash2 className="w-3 h-3" />
                                <span className="hidden sm:inline">{t.ejectPassengerBtn}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Return column */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                    <span className="font-black text-stone-900 flex items-center gap-1.5">
                      🚗 {language === 'en' ? 'Return Heading Back' : '回程返市區'} ({offer.returnTime})
                    </span>
                    <span className="font-bold text-emerald-800 text-xs">
                      {language === 'en'
                        ? `${offer.returnPassengers.reduce((sum, p) => sum + p.passengerCount, 0)} / ${offer.returnTotalSeats} seats booked`
                        : `已排 ${offer.returnPassengers.reduce((sum, p) => sum + p.passengerCount, 0)} / ${offer.returnTotalSeats} 席`}
                    </span>
                  </div>

                  {offer.returnPassengers.length === 0 ? (
                    <p className="text-stone-400 italic py-1 text-xs">{language === 'en' ? 'No return passengers yet' : '尚無回程乘客'}</p>
                  ) : (
                    <div className="space-y-2">
                      {offer.returnPassengers.map((p) => (
                        <div key={p.id} className="bg-stone-50 p-2.5 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-bold text-stone-900 flex items-center gap-2">
                              <span>{p.name}</span>
                              <span className="text-xs px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                                {p.passengerCount} {language === 'en' ? 'seats' : '人'}
                              </span>
                              <span className={`text-xs px-1.5 py-0.2 rounded font-bold ${
                                p.role === 'volunteer' ? 'bg-orange-100 text-orange-900' : 'bg-emerald-100 text-emerald-900'
                              }`}>
                                {p.role === 'volunteer' ? (language === 'en' ? 'Volunteer' : '義工善後') : (language === 'en' ? 'Attendee' : '活動即回')}
                              </span>
                            </div>
                            <div className="text-xs text-stone-500 mt-0.5 font-medium">
                              {p.pickupNote || (language === 'en' ? 'Meet on time' : '準時集合')}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <a href={`tel:${p.phone}`} className="text-stone-600 hover:text-amber-800 p-1 rounded-lg hover:bg-stone-200">
                              <Phone className="w-4 h-4" />
                            </a>
                            {onEjectPassenger && (
                              <button
                                onClick={() => {
                                  if (confirm(t.ejectPassengerConfirm)) {
                                    onEjectPassenger(offer.id, p.id, 'return');
                                  }
                                }}
                                className="px-2 py-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1"
                                title={t.ejectPassengerBtn}
                              >
                                <Trash2 className="w-3 h-3" />
                                <span className="hidden sm:inline">{t.ejectPassengerBtn}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phone Registration Modal */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-7 shadow-2xl border border-stone-100 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-stone-900">
                  {language === 'en' ? 'Assisted Phone Registration' : language === 'zh-CN' ? '代长辈电话登记' : '代長輩電話登記'}
                </h3>
                <p className="text-xs md:text-sm text-stone-500 mt-0.5 font-medium">
                  {language === 'en' ? 'When receiving calls from seniors or friends, registration desk can input details here' : language === 'zh-CN' ? '接获长辈或朋友电话报名时，报名报到组可直接在此登打' : '接獲長輩或朋友電話報名時，報名報到組可直接在此登打'}
                </p>
              </div>
              <button
                onClick={() => setIsPhoneModalOpen(false)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleElderlySubmit} className="space-y-4 text-xs md:text-sm">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPhoneType('need-ride')}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs md:text-sm cursor-pointer ${
                    phoneType === 'need-ride'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {language === 'en' ? 'Ride Request (No Car)' : language === 'zh-CN' ? '登记搭乘需求（无车）' : '登記搭乘需求（無車）'}
                </button>
                <button
                  type="button"
                  onClick={() => setPhoneType('offer-ride')}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs md:text-sm cursor-pointer ${
                    phoneType === 'offer-ride'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {language === 'en' ? 'Offer Seats (Has Car)' : language === 'zh-CN' ? '登记提供车位（有车）' : '登記提供車位（有車）'}
                </button>
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                  {language === 'en' ? 'Full Name' : language === 'zh-CN' ? '乘客/车主姓名' : '乘客/車主姓名'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'en' ? 'e.g. Auntie Chen (Entered by Registration Desk)' : language === 'zh-CN' ? '例：陈阿姨 (由报名报到组代录)' : '例：陳阿姨 (由報名報到組代錄)'}
                  value={elderlyName}
                  onChange={(e) => setElderlyName(e.target.value)}
                  className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                    {t.requestPhoneLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={language === 'en' ? 'e.g. 917-000-1111' : '例：917-000-1111'}
                    value={elderlyPhone}
                    onChange={(e) => setElderlyPhone(e.target.value)}
                    className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                    WhatsApp ({language === 'en' ? 'Optional' : language === 'zh-CN' ? '选填' : '選填'})
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'en' ? 'e.g. +1 917-xxx-xxxx' : '例：+1 917-xxx-xxxx'}
                    value={elderlyWechat}
                    onChange={(e) => setElderlyWechat(e.target.value)}
                    className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                    {t.requestAreaLabel} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={elderlyArea}
                    onChange={(e) => setElderlyArea(e.target.value)}
                    className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500 font-bold"
                  >
                    {EAST_COAST_AREAS.filter((a) => a !== '全美東區域').map((a) => (
                      <option key={a} value={a}>
                        {getLocalizedArea(a, language)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                    {language === 'en' ? 'Count / Seats' : language === 'zh-CN' ? '人数 / 车位' : '人數 / 車位'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={elderlyCount}
                    onChange={(e) => setElderlyCount(Number(e.target.value))}
                    className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500 font-bold"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} {t.personCountSuffix}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                  {language === 'en' ? 'Pickup / Meeting Location' : language === 'zh-CN' ? '详细集合地点说明' : '詳細集合地點說明'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'en' ? 'e.g. Flushing Main St Library, Chinatown Confucius Plaza...' : language === 'zh-CN' ? '例：法拉盛缅街图书馆前、孔子大厦门口...' : '例：法拉盛緬街圖書館前、孔子大廈門口...'}
                  value={elderlyPoint}
                  onChange={(e) => setElderlyPoint(e.target.value)}
                  className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <div>
                  <label className="block text-stone-800 font-bold mb-1 text-xs">
                    {language === 'en' ? 'Outbound Role' : language === 'zh-CN' ? '去程身份' : '去程身份'}
                  </label>
                  <select
                    value={elderlyOutboundRole}
                    onChange={(e) => {
                      const val = e.target.value as ParticipantRole;
                      setElderlyOutboundRole(val);
                      setElderlyReturnRole(val);
                    }}
                    className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs font-bold"
                  >
                    <option value="volunteer">{language === 'en' ? 'Volunteer' : language === 'zh-CN' ? '义工组' : '義工組'}</option>
                    <option value="attendee">{language === 'en' ? 'Attendee' : language === 'zh-CN' ? '正行组' : '正行組'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1 text-xs">
                    {language === 'en' ? 'Return Role' : language === 'zh-CN' ? '回程身份' : '回程身份'}
                  </label>
                  <select
                    value={elderlyReturnRole}
                    onChange={(e) => setElderlyReturnRole(e.target.value as ParticipantRole)}
                    className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs font-bold"
                  >
                    <option value="volunteer">{language === 'en' ? 'Volunteer' : language === 'zh-CN' ? '义工组' : '義工組'}</option>
                    <option value="attendee">{language === 'en' ? 'Attendee' : language === 'zh-CN' ? '正行组' : '正行組'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                  {t.driverNotesLabel}
                </label>
                <input
                  type="text"
                  placeholder={language === 'en' ? 'e.g. Senior walks slowly, prefers steady ride...' : language === 'zh-CN' ? '例：年长行动较慢、需搭乘平稳轿车...' : '例：年長行動較慢、需搭乘平穩轎車...'}
                  value={elderlyNotes}
                  onChange={(e) => setElderlyNotes(e.target.value)}
                  className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPhoneModalOpen(false)}
                  className="flex-1 py-3.5 border border-stone-300 rounded-xl text-stone-700 font-bold hover:bg-stone-50 cursor-pointer"
                >
                  {t.cancelEditBtn}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black shadow-xs cursor-pointer text-base"
                >
                  {language === 'en' ? 'Confirm Registration' : language === 'zh-CN' ? '确认登记' : '確認登記'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Edit Request Modal */}
      {adminEditingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100 space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in">
            <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-700" />
                  {t.editRequestModalTitle}
                </h3>
                <p className="text-xs md:text-sm text-stone-500 mt-0.5 font-medium">
                  {language === 'en' ? 'Registration Desk Records Modification' : language === 'zh-CN' ? '报名报到组后台管理修订' : '報名報到組後台管理修訂'}
                </p>
              </div>
              <button
                onClick={() => setAdminEditingRequest(null)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdminEditRequest} className="space-y-4 text-xs md:text-sm">
              <div>
                <label className="block text-stone-800 font-bold mb-1">{t.requestNameLabel} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={adminEditReqName}
                  onChange={(e) => setAdminEditReqName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-stone-800 font-bold mb-1">{t.requestPhoneLabel} <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    required
                    value={adminEditReqPhone}
                    onChange={(e) => setAdminEditReqPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-800 font-bold mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={adminEditReqWechat}
                    onChange={(e) => setAdminEditReqWechat(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-stone-800 font-bold mb-1">{t.requestAreaLabel}</label>
                  <select
                    value={adminEditReqArea}
                    onChange={(e) => setAdminEditReqArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl font-bold"
                  >
                    {EAST_COAST_AREAS.filter((a) => a !== '全美東區域').map((a) => (
                      <option key={a} value={a}>{getLocalizedArea(a, language)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-800 font-bold mb-1">{t.requestCountLabel}</label>
                  <select
                    value={adminEditReqCount}
                    onChange={(e) => setAdminEditReqCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl font-bold"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n} {t.personCountSuffix}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">{t.requestPointLabel}</label>
                <input
                  type="text"
                  value={adminEditReqPoint}
                  onChange={(e) => setAdminEditReqPoint(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-900">
                    <input
                      type="checkbox"
                      checked={adminEditReqNeedOutbound}
                      onChange={(e) => setAdminEditReqNeedOutbound(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span>{t.requestOutboundCheck}</span>
                  </label>
                  {adminEditReqNeedOutbound && (
                    <select
                      value={adminEditReqOutboundRole}
                      onChange={(e) => {
                        const val = e.target.value as ParticipantRole;
                        setAdminEditReqOutboundRole(val);
                        setAdminEditReqReturnRole(val);
                      }}
                      className="text-xs border border-stone-300 rounded px-2 py-1 font-bold"
                    >
                      <option value="volunteer">{language === 'en' ? 'Volunteer' : language === 'zh-CN' ? '义工组' : '義工組'}</option>
                      <option value="attendee">{language === 'en' ? 'Attendee' : language === 'zh-CN' ? '正行组' : '正行組'}</option>
                    </select>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-900">
                    <input
                      type="checkbox"
                      checked={adminEditReqNeedReturn}
                      onChange={(e) => setAdminEditReqNeedReturn(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span>{t.requestReturnCheck}</span>
                  </label>
                  {adminEditReqNeedReturn && (
                    <select
                      value={adminEditReqReturnRole}
                      onChange={(e) => setAdminEditReqReturnRole(e.target.value as ParticipantRole)}
                      className="text-xs border border-stone-300 rounded px-2 py-1 font-bold"
                    >
                      <option value="volunteer">{language === 'en' ? 'Volunteer' : language === 'zh-CN' ? '义工组' : '義工組'}</option>
                      <option value="attendee">{language === 'en' ? 'Attendee' : language === 'zh-CN' ? '正行组' : '正行組'}</option>
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">{t.requestNotesLabel}</label>
                <input
                  type="text"
                  value={adminEditReqNotes}
                  onChange={(e) => setAdminEditReqNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAdminEditingRequest(null)}
                  className="flex-1 py-3 border border-stone-300 rounded-xl text-stone-700 font-bold hover:bg-stone-50 cursor-pointer"
                >
                  {t.cancelEditBtn}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black shadow-xs cursor-pointer text-base"
                >
                  {t.saveChangesBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Edit Offer Modal */}
      {adminEditingOffer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-100 space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in">
            <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-700" />
                  {t.editOfferModalTitle}
                </h3>
                <p className="text-xs md:text-sm text-stone-500 mt-0.5 font-medium">
                  {language === 'en' ? 'Registration Desk Records Modification' : language === 'zh-CN' ? '报名报到组后台管理修订' : '報名報到組後台管理修訂'}
                </p>
              </div>
              <button
                onClick={() => setAdminEditingOffer(null)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdminEditOffer} className="space-y-4 text-xs md:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-800 font-bold mb-1">{t.driverNameLabel}</label>
                  <input
                    type="text"
                    required
                    value={adminEditDriverName}
                    onChange={(e) => setAdminEditDriverName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-800 font-bold mb-1">{t.driverPhoneLabel}</label>
                  <input
                    type="tel"
                    required
                    value={adminEditDriverPhone}
                    onChange={(e) => setAdminEditDriverPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-800 font-bold mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={adminEditDriverWechat}
                    onChange={(e) => setAdminEditDriverWechat(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-800 font-bold mb-1">{t.driverAreaLabel}</label>
                  <select
                    value={adminEditDriverArea}
                    onChange={(e) => setAdminEditDriverArea(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-bold"
                  >
                    {EAST_COAST_AREAS.filter((a) => a !== '全美東區域').map((a) => (
                      <option key={a} value={a}>{getLocalizedArea(a, language)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">{t.driverPointLabel}</label>
                <input
                  type="text"
                  value={adminEditDriverPoint}
                  onChange={(e) => setAdminEditDriverPoint(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-stone-800 font-bold mb-1">{t.driverCarModelLabel}</label>
                  <input
                    type="text"
                    value={adminEditCarModel}
                    onChange={(e) => setAdminEditCarModel(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-800 font-bold mb-1">{t.driverCarColorLabel}</label>
                  <input
                    type="text"
                    value={adminEditCarColor}
                    onChange={(e) => setAdminEditCarColor(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-800 font-bold mb-1">{t.driverPlateLabel}</label>
                  <input
                    type="text"
                    value={adminEditPlateNumber}
                    onChange={(e) => setAdminEditPlateNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Legs */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900">{language === 'en' ? 'Outbound Time / Seats:' : language === 'zh-CN' ? '去程出发时间 / 车位：' : '去程出發時間 / 車位：'}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={adminEditOutboundTime}
                      onChange={(e) => setAdminEditOutboundTime(e.target.value)}
                      className="w-32 px-2 py-1 text-xs border border-stone-300 rounded"
                    />
                    <select
                      value={adminEditOutboundTotalSeats}
                      onChange={(e) => setAdminEditOutboundTotalSeats(Number(e.target.value))}
                      className="text-xs border border-stone-300 rounded px-2 py-1 font-bold"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <option key={n} value={n}>{n} {t.seatCountSuffix}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                  <span className="font-bold text-stone-900">{language === 'en' ? 'Return Time / Seats:' : language === 'zh-CN' ? '回程出发时间 / 车位：' : '回程出發時間 / 車位：'}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={adminEditReturnTime}
                      onChange={(e) => setAdminEditReturnTime(e.target.value)}
                      className="w-32 px-2 py-1 text-xs border border-stone-300 rounded"
                    />
                    <select
                      value={adminEditReturnTotalSeats}
                      onChange={(e) => setAdminEditReturnTotalSeats(Number(e.target.value))}
                      className="text-xs border border-stone-300 rounded px-2 py-1 font-bold"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <option key={n} value={n}>{n} {t.seatCountSuffix}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">{t.driverNotesLabel}</label>
                <input
                  type="text"
                  value={adminEditNotes}
                  onChange={(e) => setAdminEditNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                />
              </div>

              {/* Currently Assigned Passengers with Eject Buttons */}
              {(adminEditingOffer.outboundPassengers.length > 0 || adminEditingOffer.returnPassengers.length > 0) && (
                <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 space-y-2 text-xs">
                  <span className="font-black text-amber-950 block text-xs md:text-sm">
                    {language === 'en' ? '👥 Currently Assigned Passengers (Click to Eject):' : '👥 目前已排入之搭乘名單（可個別點擊移出彈出）：'}
                  </span>

                  {adminEditingOffer.outboundPassengers.map((p) => (
                    <div key={`edit-out-${p.id}`} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                      <div>
                        <span className="font-bold text-stone-900">{p.name}</span>
                        <span className="ml-1 text-stone-500 font-medium">({language === 'en' ? 'Outbound' : '去程'} • {p.passengerCount} {t.personCountSuffix})</span>
                      </div>
                      {onEjectPassenger && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(t.ejectPassengerConfirm)) {
                              onEjectPassenger(adminEditingOffer.id, p.id, 'outbound');
                              setAdminEditingOffer((prev) => prev ? {
                                ...prev,
                                outboundPassengers: prev.outboundPassengers.filter((x) => x.id !== p.id),
                                outboundAvailableSeats: Math.min(prev.outboundTotalSeats, prev.outboundAvailableSeats + p.passengerCount),
                              } : null);
                            }
                          }}
                          className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{t.ejectPassengerBtn}</span>
                        </button>
                      )}
                    </div>
                  ))}

                  {adminEditingOffer.returnPassengers.map((p) => (
                    <div key={`edit-ret-${p.id}`} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                      <div>
                        <span className="font-bold text-stone-900">{p.name}</span>
                        <span className="ml-1 text-stone-500 font-medium">({language === 'en' ? 'Return' : '回程'} • {p.passengerCount} {t.personCountSuffix})</span>
                      </div>
                      {onEjectPassenger && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(t.ejectPassengerConfirm)) {
                              onEjectPassenger(adminEditingOffer.id, p.id, 'return');
                              setAdminEditingOffer((prev) => prev ? {
                                ...prev,
                                returnPassengers: prev.returnPassengers.filter((x) => x.id !== p.id),
                                returnAvailableSeats: Math.min(prev.returnTotalSeats, prev.returnAvailableSeats + p.passengerCount),
                              } : null);
                            }
                          }}
                          className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{t.ejectPassengerBtn}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAdminEditingOffer(null)}
                  className="flex-1 py-3 border border-stone-300 rounded-xl text-stone-700 font-bold hover:bg-stone-50 cursor-pointer"
                >
                  {t.cancelEditBtn}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black shadow-xs cursor-pointer text-base"
                >
                  {t.saveChangesBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Management Modal (Super Admin) */}
      {currentAdmin && (
        <AccountManagementModal
          isOpen={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          accounts={adminAccounts}
          currentAdmin={currentAdmin}
          onUpdateAccount={onUpdateAccount}
          onDeleteAccount={onDeleteAccount}
          onAddAccount={onAddAccount}
        />
      )}

      {/* Event Management Modal (All Staff / Super Admin) */}
      <EventManagerModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        events={allEvents}
        activeEventId={currentEvent.id}
        onSelectEvent={onSelectEvent}
        onSaveEvent={onSaveEvent}
        onDeleteEvent={onDeleteEvent}
        offers={offers}
        requests={requests}
      />
    </div>
  );
};
