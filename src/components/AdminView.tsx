import React, { useState } from 'react';
import type { Event, CarpoolOffer, RideRequest, ParticipantRole } from '../types';
import { EAST_COAST_AREAS } from '../data/mockData';
import { useLanguage } from '../i18n/LanguageContext';
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
  KeyRound,
  Edit3,
  Trash2
} from 'lucide-react';

interface AdminViewProps {
  currentEvent: Event;
  offers: CarpoolOffer[];
  requests: RideRequest[];
  onMatchRequestToOffer: (requestId: string, offerId: string, leg: 'outbound' | 'return' | 'both') => boolean;
  onCreateOffer: (offer: Omit<CarpoolOffer, 'id' | 'createdAt' | 'outboundPassengers' | 'returnPassengers'>) => void;
  onCreateRequest: (request: Omit<RideRequest, 'id' | 'createdAt' | 'status'>) => void;
  onUpdateOffer?: (offer: CarpoolOffer) => void;
  onUpdateRequest?: (request: RideRequest) => void;
  onCancelRequest?: (requestId: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentEvent,
  offers,
  requests,
  onMatchRequestToOffer,
  onCreateOffer,
  onCreateRequest,
  onUpdateOffer,
  onUpdateRequest,
  onCancelRequest,
}) => {
  const { t } = useLanguage();
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('kongshan_checkin_auth') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const currentOffers = offers.filter((o) => o.eventId === currentEvent.id);
  const currentRequests = requests.filter((r) => r.eventId === currentEvent.id);
  const pendingRequests = currentRequests.filter((r) => r.status !== 'matched_full');

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
  const [elderlyReturnRole, setElderlyReturnRole] = useState<ParticipantRole>('attendee');
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
  const [adminEditReqReturnRole, setAdminEditReqReturnRole] = useState<ParticipantRole>('attendee');
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
    const outPassCount = adminEditingOffer.outboundPassengers.reduce((sum, p) => sum + p.passengerCount, 0);
    const retPassCount = adminEditingOffer.returnPassengers.reduce((sum, p) => sum + p.passengerCount, 0);
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
      hasReturn: adminEditHasReturn,
      returnTime: adminEditReturnTime.trim(),
      returnTotalSeats: adminEditReturnTotalSeats,
      returnAvailableSeats: Math.max(0, adminEditReturnTotalSeats - retPassCount)
    };
    onUpdateOffer(updated);
    setAdminEditingOffer(null);
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
        reasons.push('同出發區域');
      } else if (
        offer.departureArea.includes(req.pickupArea.split(' ')[0]) ||
        req.pickupArea.includes(offer.departureArea.split(' ')[0])
      ) {
        score += 30;
        reasons.push('相鄰生活圈');
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
        reasons.push('去回雙程皆可搭乘');
        matchLeg = 'both';
      } else if (canOutbound) {
        score += 20;
        reasons.push('可接送去程');
        matchLeg = 'outbound';
      } else {
        score += 20;
        reasons.push('可接送回程');
        matchLeg = 'return';
      }

      // 3. Role compatibility
      if (canOutbound) {
        if (offer.outboundMode === req.outboundRole || offer.outboundMode === 'both') {
          score += 15;
          reasons.push(req.outboundRole === 'volunteer' ? '符合義工早車' : '符合正行時間');
        }
      }

      if (canReturn) {
        if (offer.returnMode === req.returnRole || offer.returnMode === 'both') {
          score += 15;
          reasons.push(req.returnRole === 'volunteer' ? '符合善後返程' : '符合活動結束即回');
        }
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
      alert(`已成功採納建議，將乘客指派至 ${sug.offer.driverName} 的車輛！`);
    } else {
      alert('該車次剩餘座位不足，無法排入。');
    }
  };

  // Handler: Apply ALL suggestions in batch
  const handleApplyAllSuggestions = () => {
    if (totalSuggestionsCount === 0) {
      alert('目前沒有可自動配對的建議。');
      return;
    }

    if (!confirm(`系統即將自動為 ${totalSuggestionsCount} 位乘客套用最佳車位配對，是否確認？`)) {
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

    alert(`智慧媒合完成！成功配對 ${successCount} 筆乘客名單。`);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (username.trim().toLowerCase() === 'admin' || username.trim() === '報名報到組') &&
      (password === 'kongshan2026' || password === '1234')
    ) {
      setIsAuthenticated(true);
      localStorage.setItem('kongshan_checkin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('帳號或密碼錯誤！請使用預設幹部帳號：admin / 密碼：kongshan2026');
    }
  };

  // Quick Demo Login
  const handleQuickLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('kongshan_checkin_auth', 'true');
    setLoginError('');
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('kongshan_checkin_auth');
  };

  const handleManualAssign = (requestId: string) => {
    const targetOfferId = selectedOfferMap[requestId];
    const targetLeg = selectedLegMap[requestId] || 'both';

    if (!targetOfferId) {
      alert('請先選擇要指派的車輛！');
      return;
    }
    const success = onMatchRequestToOffer(requestId, targetOfferId, targetLeg);
    if (success) {
      alert('指派成功！已將乘客排入指定車次名冊。');
    } else {
      alert('該車次在指定行程的剩餘座位不足，無法排入！');
    }
  };

  const handleElderlySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!elderlyName.trim() || !elderlyPhone.trim() || !elderlyPoint.trim()) {
      alert('請填妥姓名、電話與集合地點！');
      return;
    }

    if (phoneType === 'need-ride') {
      onCreateRequest({
        eventId: currentEvent.id,
        passengerName: `${elderlyName.trim()} (報名報到組代報)`,
        passengerPhone: elderlyPhone.trim(),
        wechatOrLine: elderlyWechat.trim() || undefined,
        pickupArea: elderlyArea,
        pickupPoint: elderlyPoint.trim(),
        passengerCount: elderlyCount,
        needOutbound: true,
        outboundRole: elderlyOutboundRole,
        needReturn: true,
        returnRole: elderlyReturnRole,
        notes: elderlyNotes.trim() ? `[代報] ${elderlyNotes.trim()}` : '[報名報到組電話代錄]',
      });
      alert('已成功登記搭乘需求！');
    } else {
      onCreateOffer({
        eventId: currentEvent.id,
        driverName: `${elderlyName.trim()} (報名報到組代報)`,
        driverPhone: elderlyPhone.trim(),
        wechatOrLine: elderlyWechat.trim() || undefined,
        departureArea: elderlyArea,
        departurePoint: elderlyPoint.trim(),
        carModel: '自用車',
        notes: elderlyNotes.trim() || undefined,
        hasOutbound: true,
        outboundTime: elderlyOutboundRole === 'volunteer' ? '06:30 義工車' : '08:00 正行車',
        outboundMode: elderlyOutboundRole,
        outboundTotalSeats: elderlyCount,
        outboundAvailableSeats: elderlyCount,
        hasReturn: true,
        returnTime: elderlyReturnRole === 'volunteer' ? '16:30 善後後回' : '15:30 活動結束即回',
        returnMode: elderlyReturnRole,
        returnTotalSeats: elderlyCount,
        returnAvailableSeats: elderlyCount,
      });
      alert('已成功登記車位！');
    }

    setIsPhoneModalOpen(false);
    setElderlyName('');
    setElderlyPhone('');
    setElderlyPoint('');
    setElderlyNotes('');
  };

  const handleExportCSV = () => {
    const rows = [
      ['活動名稱', currentEvent.title],
      ['活動主題', currentEvent.theme],
      ['活動日期', currentEvent.date],
      ['活動地點', `${currentEvent.templeName} (${currentEvent.location})`],
      ['負責組別', '空山寺 報名報到組'],
      [''],
      [
        '行程類別',
        '出發區域',
        '集合點',
        '車主姓名',
        '車主電話',
        '車型',
        '發車時間',
        '班次屬性',
        '乘客姓名',
        '乘客電話',
        '搭乘人數',
        '乘客身分(義工/正行)',
        '備註',
      ],
    ];

    currentOffers.forEach((offer) => {
      // Outbound rows
      if (offer.hasOutbound) {
        if (offer.outboundPassengers.length === 0) {
          rows.push([
            '去程 (前往空山寺)',
            offer.departureArea,
            offer.departurePoint,
            offer.driverName,
            offer.driverPhone,
            offer.carModel,
            offer.outboundTime,
            offer.outboundMode === 'volunteer' ? '義工早車' : '正行車',
            '(尚無乘客)',
            '-',
            '0',
            '-',
            offer.notes || '',
          ]);
        } else {
          offer.outboundPassengers.forEach((p) => {
            rows.push([
              '去程 (前往空山寺)',
              offer.departureArea,
              offer.departurePoint,
              offer.driverName,
              offer.driverPhone,
              offer.carModel,
              offer.outboundTime,
              offer.outboundMode === 'volunteer' ? '義工早車' : '正行車',
              p.name,
              p.phone,
              p.passengerCount.toString(),
              p.role === 'volunteer' ? '義工組' : '正行組',
              p.pickupNote || '',
            ]);
          });
        }
      }

      // Return rows
      if (offer.hasReturn) {
        if (offer.returnPassengers.length === 0) {
          rows.push([
            '回程 (返回紐約/新澤西)',
            offer.departureArea,
            offer.departurePoint,
            offer.driverName,
            offer.driverPhone,
            offer.carModel,
            offer.returnTime,
            offer.returnMode === 'volunteer' ? '義工善後車' : '正行車',
            '(尚無乘客)',
            '-',
            '0',
            '-',
            offer.notes || '',
          ]);
        } else {
          offer.returnPassengers.forEach((p) => {
            rows.push([
              '回程 (返回紐約/新澤西)',
              offer.departureArea,
              offer.departurePoint,
              offer.driverName,
              offer.driverPhone,
              offer.carModel,
              offer.returnTime,
              offer.returnMode === 'volunteer' ? '義工善後車' : '正行車',
              p.name,
              p.phone,
              p.passengerCount.toString(),
              p.role === 'volunteer' ? '義工組' : '正行組',
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
    link.setAttribute('download', `空山寺中秋活動共乘名冊.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- RENDER LOGIN VIEW IF NOT AUTHENTICATED ---
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-8 px-4 animate-in fade-in">
        <div className="bg-white rounded-3xl border border-amber-200 p-6 md:p-8 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-8 h-8 text-amber-800" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              報名報到組幹部後台
            </h2>
            <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
              請輸入管理帳號密碼以進入調度看板
            </p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs md:text-sm p-3 rounded-xl font-bold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-stone-800 text-xs md:text-sm font-bold mb-1.5">
                幹部帳號
              </label>
              <input
                type="text"
                required
                placeholder="請輸入帳號 (例如: admin)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-stone-800 text-xs md:text-sm font-bold mb-1.5">
                安全密碼
              </label>
              <input
                type="password"
                required
                placeholder="請輸入密碼 (例如: kongshan2026)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-600 font-medium"
              />
            </div>

            <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-xs text-amber-950 font-medium leading-relaxed">
              💡 <strong>預設測試憑證：</strong>
              <br />
              帳號：<code className="bg-white px-1.5 py-0.5 rounded font-bold">admin</code> ｜ 密碼：<code className="bg-white px-1.5 py-0.5 rounded font-bold">kongshan2026</code>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-stone-900 hover:bg-black text-white rounded-xl font-black text-base transition-colors cursor-pointer shadow-xs"
            >
              確認登入
            </button>
          </form>

          <div className="pt-2 border-t border-stone-100">
            <button
              onClick={handleQuickLogin}
              className="w-full py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-xs md:text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-4 h-4 text-amber-700" />
              <span>手機快速登入（直接以報名報到組進入）</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER FULL ADMIN DASHBOARD ---
  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner with Logout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-stone-900 text-stone-100 p-5 md:p-6 rounded-3xl shadow-md">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl md:text-2xl font-black tracking-tight">空山寺 報名報到組調度中樞</h2>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-0.5 rounded-full border border-amber-500/30 font-bold">
              美東總調度
            </span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold">
              幹部已登入
            </span>
          </div>
          <p className="text-xs md:text-sm text-stone-400 mt-1 font-medium">
            活動：{currentEvent.title} • 寺址：174 Hynes RD, Poughquag, NY 12570
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPhoneModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs md:text-sm font-bold transition-colors cursor-pointer shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>代長輩電話登記</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs md:text-sm font-bold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>匯出名冊 CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs md:text-sm font-bold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>列印名冊</span>
          </button>

          <button
            onClick={handleLogout}
            title="登出報名報到組後台"
            className="flex items-center gap-1 px-3 py-2 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800/60 rounded-xl text-xs md:text-sm font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-300" />
            <span>登出</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs md:text-sm font-bold">
            <span>登記愛心車輛</span>
            <Car className="w-5 h-5 text-amber-700" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-stone-900 mt-1.5">
            {totalCars} <span className="text-xs md:text-sm font-normal text-stone-500">部</span>
          </div>
          <div className="text-xs text-stone-400 mt-0.5 font-medium">
            服務法拉盛/布魯克林/NJ
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs md:text-sm font-bold">
            <span>去程 (上山入席)</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-emerald-700 mt-1.5">
            {outboundMatched} / {outboundCapacity} <span className="text-xs md:text-sm font-normal text-stone-500">人</span>
          </div>
          <div className="text-xs text-emerald-700 mt-0.5 font-bold">
            入席率 {outboundCapacity > 0 ? Math.round((outboundMatched / outboundCapacity) * 100) : 0}%
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs md:text-sm font-bold">
            <span>回程 (返市區入席)</span>
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-amber-800 mt-1.5">
            {returnMatched} / {returnCapacity} <span className="text-xs md:text-sm font-normal text-stone-500">人</span>
          </div>
          <div className="text-xs text-amber-800 mt-0.5 font-bold">
            入席率 {returnCapacity > 0 ? Math.round((returnMatched / returnCapacity) * 100) : 0}%
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs md:text-sm font-bold">
            <span>待安排需求乘客</span>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-orange-600 mt-1.5">
            {totalPendingPassengers} <span className="text-xs md:text-sm font-normal text-stone-500">人</span>
          </div>
          <div className="text-xs text-orange-700 mt-0.5 font-bold">
            {pendingRequests.length} 筆待調度
          </div>
        </div>
      </div>

      {/* --- SMART SUGGESTED MATCHING HERO SECTION --- */}
      {totalSuggestionsCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-5 md:p-6 shadow-md space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Wand2 className="w-6 h-6 text-amber-200" />
                <h3 className="text-lg md:text-xl font-black tracking-tight">
                  ✨ 系統智慧建議媒合中心 (Smart Suggestion)
                </h3>
              </div>
              <p className="text-xs md:text-sm text-amber-100 font-medium">
                系統已根據「同出發區域」、「義工早到/正行需求」與「空位數」，自動計算出最佳推薦方案！
              </p>
            </div>

            <button
              onClick={handleApplyAllSuggestions}
              className="px-5 py-3 bg-white hover:bg-stone-50 text-orange-900 rounded-2xl font-black text-xs md:text-sm transition-all cursor-pointer shadow-lg hover:scale-102 flex items-center justify-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>⚡ 一鍵套用所有建議 ({totalSuggestionsCount} 筆)</span>
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
              待協調乘客名冊 ({pendingRequests.length} 筆)
            </h3>
            <p className="text-xs md:text-sm text-stone-500 mt-0.5 font-medium">
              尚未配對之乘客，報名報到組可直接「採納系統建議」或「手動指派」至相應車次！
            </p>
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-sm text-emerald-800 bg-emerald-50 p-4 rounded-2xl text-center font-bold">
            🎉 太棒了！目前所有乘客的去程與回程需求均已全數安排妥當。
          </p>
        ) : (
          <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden text-xs md:text-sm">
            {pendingRequests.map((req) => {
              const suggestion = suggestionsMap[req.id];

              return (
                <div
                  key={req.id}
                  className="p-4 md:p-5 bg-white hover:bg-stone-50/50 flex flex-col gap-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2.5 flex-wrap">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-black text-base md:text-lg text-stone-900">
                            {req.passengerName}
                          </span>
                          <span className="px-2.5 py-0.5 rounded bg-orange-100 text-orange-900 font-bold text-xs">
                            需求 {req.passengerCount} 位
                          </span>
                          <span className="text-stone-500 font-medium">電話：{req.passengerPhone}</span>
                          {req.wechatOrLine && (
                            <span className="text-stone-500 font-medium">WhatsApp：{req.wechatOrLine}</span>
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
                              if (confirm(t.cancelRequestConfirm)) {
                                onCancelRequest?.(req.id);
                              }
                            }}
                            className="px-2.5 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t.cancelRequestBtn}</span>
                          </button>
                        </div>
                      </div>

                      <div className="text-stone-700 flex items-center gap-1 font-medium">
                        <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>
                          期望地點：<strong className="text-stone-900">{req.pickupArea}</strong> - {req.pickupPoint}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-0.5 text-xs">
                        {req.needOutbound && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                            去程需求：{req.outboundRole === 'volunteer' ? '義工組 (08:00前早到)' : '正行組'}
                          </span>
                        )}
                        {req.needReturn && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-800 border border-stone-200 font-bold">
                            回程需求：{req.returnRole === 'volunteer' ? '義工組 (善後賦歸)' : '正行組 (15:30即回)'}
                          </span>
                        )}
                      </div>

                      {req.notes && (
                        <div className="text-stone-600 bg-stone-50 p-2 rounded-xl text-xs">
                          備註：{req.notes}
                        </div>
                      )}
                    </div>

                    {/* SMART SUGGESTION BADGE & QUICK APPLY */}
                    {suggestion && (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-3 text-xs md:text-sm space-y-1.5 md:max-w-sm self-stretch md:self-auto flex flex-col justify-between">
                        <div className="flex items-center gap-1.5 font-black text-amber-950">
                          <ThumbsUp className="w-4 h-4 text-amber-700" />
                          <span>系統推薦最佳車輛：</span>
                        </div>
                        <div className="font-bold text-stone-900 text-xs">
                          🚗 {suggestion.offer.driverName} ({suggestion.offer.departureArea.split(' ')[0]}，{suggestion.leg === 'both' ? '去回雙程' : suggestion.leg === 'outbound' ? '去程' : '回程'})
                        </div>
                        <div className="text-[11px] text-amber-900/80 font-medium">
                          {suggestion.reason}
                        </div>
                        <button
                          onClick={() => handleApplySuggestion(suggestion)}
                          className="w-full mt-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>採納此建議指派</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Manual Assignment Controls */}
                  <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-stone-500 font-medium">或自行手動指派其他車次：</span>
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
                        <option value="">-- 手動選擇車輛 --</option>
                        {currentOffers.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.driverName} ({o.departureArea.split(' ')[0]}，去餘{o.outboundAvailableSeats}/回餘{o.returnAvailableSeats})
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
                        <option value="both">指派去回雙程</option>
                        <option value="outbound">僅指派去程</option>
                        <option value="return">僅指派回程</option>
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
                        手動指派
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
            全場車隊去回程入席調度名冊
          </h3>
          <span className="text-xs md:text-sm text-stone-500 font-medium">空山寺中秋普茶</span>
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
                    📍 {offer.departureArea} ({offer.departurePoint})
                  </span>
                  <button
                    onClick={() => handleOpenAdminEditOffer(offer)}
                    className="px-2.5 py-1 text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t.editOfferBtn}</span>
                  </button>
                </div>
              </div>

              {/* Legs comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-100 bg-white">
                {/* Outbound column */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                    <span className="font-black text-amber-950 flex items-center gap-1.5">
                      🚙 去程前往空山寺 ({offer.outboundTime})
                    </span>
                    <span className="font-bold text-amber-800 text-xs">
                      已排 {offer.outboundPassengers.reduce((sum, p) => sum + p.passengerCount, 0)} / {offer.outboundTotalSeats} 席
                    </span>
                  </div>

                  {offer.outboundPassengers.length === 0 ? (
                    <p className="text-stone-400 italic py-1 text-xs">尚無去程乘客</p>
                  ) : (
                    <div className="space-y-2">
                      {offer.outboundPassengers.map((p) => (
                        <div key={p.id} className="bg-stone-50 p-2.5 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-bold text-stone-900 flex items-center gap-2">
                              <span>{p.name}</span>
                              <span className="text-xs px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                                {p.passengerCount} 人
                              </span>
                              <span className={`text-xs px-1.5 py-0.2 rounded font-bold ${
                                p.role === 'volunteer' ? 'bg-orange-100 text-orange-900' : 'bg-emerald-100 text-emerald-900'
                              }`}>
                                {p.role === 'volunteer' ? '義工早車' : '正行'}
                              </span>
                            </div>
                            <div className="text-xs text-stone-500 mt-0.5 font-medium">
                              {p.pickupNote || '準時集合'}
                            </div>
                          </div>
                          <a href={`tel:${p.phone}`} className="text-stone-600 hover:text-amber-800">
                            <Phone className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Return column */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                    <span className="font-black text-stone-900 flex items-center gap-1.5">
                      🚗 回程返市區 ({offer.returnTime})
                    </span>
                    <span className="font-bold text-emerald-800 text-xs">
                      已排 {offer.returnPassengers.reduce((sum, p) => sum + p.passengerCount, 0)} / {offer.returnTotalSeats} 席
                    </span>
                  </div>

                  {offer.returnPassengers.length === 0 ? (
                    <p className="text-stone-400 italic py-1 text-xs">尚無回程乘客</p>
                  ) : (
                    <div className="space-y-2">
                      {offer.returnPassengers.map((p) => (
                        <div key={p.id} className="bg-stone-50 p-2.5 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-bold text-stone-900 flex items-center gap-2">
                              <span>{p.name}</span>
                              <span className="text-xs px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                                {p.passengerCount} 人
                              </span>
                              <span className={`text-xs px-1.5 py-0.2 rounded font-bold ${
                                p.role === 'volunteer' ? 'bg-orange-100 text-orange-900' : 'bg-emerald-100 text-emerald-900'
                              }`}>
                                {p.role === 'volunteer' ? '義工善後' : '活動即回'}
                              </span>
                            </div>
                            <div className="text-xs text-stone-500 mt-0.5 font-medium">
                              {p.pickupNote || '準時集合'}
                            </div>
                          </div>
                          <a href={`tel:${p.phone}`} className="text-stone-600 hover:text-amber-800">
                            <Phone className="w-4 h-4" />
                          </a>
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
                  代長輩電話登記
                </h3>
                <p className="text-xs md:text-sm text-stone-500 mt-0.5 font-medium">
                  接獲長輩或朋友電話報名時，報名報到組可直接在此登打
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
                  登記搭乘需求（無車）
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
                  登記提供車位（有車）
                </button>
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                  乘客姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例：陳阿姨 (由報名報到組代錄)"
                  value={elderlyName}
                  onChange={(e) => setElderlyName(e.target.value)}
                  className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                    聯絡電話 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="例：917-000-1111"
                    value={elderlyPhone}
                    onChange={(e) => setElderlyPhone(e.target.value)}
                    className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                    WhatsApp (選填)
                  </label>
                  <input
                    type="text"
                    placeholder="例：+1 917-xxx-xxxx"
                    value={elderlyWechat}
                    onChange={(e) => setElderlyWechat(e.target.value)}
                    className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                    出發區域 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={elderlyArea}
                    onChange={(e) => setElderlyArea(e.target.value)}
                    className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500 font-bold"
                  >
                    {EAST_COAST_AREAS.filter((a) => a !== '全美東區域').map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                    人數 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={elderlyCount}
                    onChange={(e) => setElderlyCount(Number(e.target.value))}
                    className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500 font-bold"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} 位
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                  詳細集合地點說明 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例：法拉盛緬街圖書館前、孔子大廈門口..."
                  value={elderlyPoint}
                  onChange={(e) => setElderlyPoint(e.target.value)}
                  className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <div>
                  <label className="block text-stone-800 font-bold mb-1 text-xs">
                    去程身份
                  </label>
                  <select
                    value={elderlyOutboundRole}
                    onChange={(e) => setElderlyOutboundRole(e.target.value as ParticipantRole)}
                    className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs font-bold"
                  >
                    <option value="volunteer">義工組（早到服務）</option>
                    <option value="attendee">正行組（參加活動）</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1 text-xs">
                    回程身份
                  </label>
                  <select
                    value={elderlyReturnRole}
                    onChange={(e) => setElderlyReturnRole(e.target.value as ParticipantRole)}
                    className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs font-bold"
                  >
                    <option value="attendee">正行組（活動結束回）</option>
                    <option value="volunteer">義工組（善後完畢回）</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                  備註
                </label>
                <input
                  type="text"
                  placeholder="例：年長行動較慢、需搭乘平穩轎車..."
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
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black shadow-xs cursor-pointer text-base"
                >
                  確認登記
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
                  修改乘客搭車需求
                </h3>
                <p className="text-xs md:text-sm text-stone-500 mt-0.5 font-medium">
                  報名報到組後台管理修訂
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
                <label className="block text-stone-800 font-bold mb-1">乘客姓名 <span className="text-red-500">*</span></label>
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
                  <label className="block text-stone-800 font-bold mb-1">聯絡電話 <span className="text-red-500">*</span></label>
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
                  <label className="block text-stone-800 font-bold mb-1">接送區域</label>
                  <select
                    value={adminEditReqArea}
                    onChange={(e) => setAdminEditReqArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl font-bold"
                  >
                    {EAST_COAST_AREAS.filter((a) => a !== '全美東區域').map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-800 font-bold mb-1">需求人數</label>
                  <select
                    value={adminEditReqCount}
                    onChange={(e) => setAdminEditReqCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl font-bold"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n} 位</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">具體地點</label>
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
                    <span>需要去程</span>
                  </label>
                  {adminEditReqNeedOutbound && (
                    <select
                      value={adminEditReqOutboundRole}
                      onChange={(e) => setAdminEditReqOutboundRole(e.target.value as ParticipantRole)}
                      className="text-xs border border-stone-300 rounded px-2 py-1 font-bold"
                    >
                      <option value="volunteer">義工 (早到)</option>
                      <option value="attendee">正行</option>
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
                    <span>需要回程</span>
                  </label>
                  {adminEditReqNeedReturn && (
                    <select
                      value={adminEditReqReturnRole}
                      onChange={(e) => setAdminEditReqReturnRole(e.target.value as ParticipantRole)}
                      className="text-xs border border-stone-300 rounded px-2 py-1 font-bold"
                    >
                      <option value="attendee">正行 (活動後即回)</option>
                      <option value="volunteer">義工 (善後)</option>
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">備註說明</label>
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
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black shadow-xs cursor-pointer text-base"
                >
                  儲存修改
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
                  修改車輛資訊
                </h3>
                <p className="text-xs md:text-sm text-stone-500 mt-0.5 font-medium">
                  報名報到組後台管理修訂
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
                  <label className="block text-stone-800 font-bold mb-1">車主姓名</label>
                  <input
                    type="text"
                    required
                    value={adminEditDriverName}
                    onChange={(e) => setAdminEditDriverName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-800 font-bold mb-1">車主電話</label>
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
                  <label className="block text-stone-800 font-bold mb-1">出發區域</label>
                  <select
                    value={adminEditDriverArea}
                    onChange={(e) => setAdminEditDriverArea(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-bold"
                  >
                    {EAST_COAST_AREAS.filter((a) => a !== '全美東區域').map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">集合接送點</label>
                <input
                  type="text"
                  value={adminEditDriverPoint}
                  onChange={(e) => setAdminEditDriverPoint(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-stone-800 font-bold mb-1">車型</label>
                  <input
                    type="text"
                    value={adminEditCarModel}
                    onChange={(e) => setAdminEditCarModel(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-800 font-bold mb-1">車色</label>
                  <input
                    type="text"
                    value={adminEditCarColor}
                    onChange={(e) => setAdminEditCarColor(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-800 font-bold mb-1">車牌</label>
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
                  <span className="font-bold text-stone-900">去程出發時間 / 車位：</span>
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
                        <option key={n} value={n}>{n} 位</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                  <span className="font-bold text-stone-900">回程出發時間 / 車位：</span>
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
                        <option key={n} value={n}>{n} 位</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">備註說明</label>
                <input
                  type="text"
                  value={adminEditNotes}
                  onChange={(e) => setAdminEditNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAdminEditingOffer(null)}
                  className="flex-1 py-3 border border-stone-300 rounded-xl text-stone-700 font-bold hover:bg-stone-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black shadow-xs cursor-pointer text-base"
                >
                  儲存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
