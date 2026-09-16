import React, { useState } from 'react';
import type { Event, CarpoolOffer, RideRequest, ParticipantRole } from '../types';
import { EAST_COAST_AREAS, getLocalizedEvent } from '../data/mockData';
import { useLanguage } from '../i18n/LanguageContext';
import { getLocalizedArea } from '../i18n/translations';
import {
  MapPin,
  Clock,
  Car,
  UserCheck,
  PlusCircle,
  Search,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Calendar,
  Sparkles,
  Info,
  Sun,
  Flame,
  ChevronDown,
  ChevronUp,
  Utensils,
  HelpCircle,
  Edit3,
  AlertCircle,
  Trash2,
  FileText
} from 'lucide-react';

interface PassengerViewProps {
  currentEvent: Event;
  offers: CarpoolOffer[];
  requests: RideRequest[];
  onBookSeat: (
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
  ) => boolean;
  onCreateRequest: (request: Omit<RideRequest, 'id' | 'createdAt' | 'status'>) => void;
  onUpdateRequest?: (updatedRequest: RideRequest) => void;
  onCancelRequest?: (requestId: string) => void;
}

export const PassengerView: React.FC<PassengerViewProps> = ({
  currentEvent,
  offers,
  requests,
  onBookSeat,
  onCreateRequest,
  onUpdateRequest,
  onCancelRequest,
}) => {
  const { language, t } = useLanguage();
  const localizedEvent = getLocalizedEvent(currentEvent, language);
  // Filters
  const [selectedLeg, setSelectedLeg] = useState<'all' | 'outbound' | 'return'>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'volunteer' | 'attendee'>('all');
  const [selectedArea, setSelectedArea] = useState<string>('全美東區域');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  // Booking modal state
  const [bookingOffer, setBookingOffer] = useState<CarpoolOffer | null>(null);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [wechatOrLine, setWechatOrLine] = useState('');
  const [seatCount, setSeatCount] = useState(1);
  const [bookOutbound, setBookOutbound] = useState(true);
  const [outboundRole, setOutboundRole] = useState<ParticipantRole>('volunteer');
  const [bookReturn, setBookReturn] = useState(true);
  const [returnRole, setReturnRole] = useState<ParticipantRole>('volunteer');
  const [pickupNote, setPickupNote] = useState('');
  const [bookingSuccessInfo, setBookingSuccessInfo] = useState<{
    driverName: string;
    driverPhone: string;
    wechatOrLine?: string;
    pickupPoint: string;
    details: string;
  } | null>(null);

  // Request modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqName, setReqName] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqWechat, setReqWechat] = useState('');
  const [reqArea, setReqArea] = useState('法拉盛 Flushing (NY)');
  const [reqPoint, setReqPoint] = useState('');
  const [reqCount, setReqCount] = useState(1);
  const [reqNeedOutbound, setReqNeedOutbound] = useState(true);
  const [reqOutboundRole, setReqOutboundRole] = useState<ParticipantRole>('volunteer');
  const [reqNeedReturn, setReqNeedReturn] = useState(true);
  const [reqReturnRole, setReqReturnRole] = useState<ParticipantRole>('volunteer');
  const [reqNotes, setReqNotes] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Section toggle: 'offers' or 'my-requests'
  const [activePassengerSection, setActivePassengerSection] = useState<'offers' | 'my-requests'>('offers');

  // Edit request modal state
  const [editingRequest, setEditingRequest] = useState<RideRequest | null>(null);
  const [editReqName, setEditReqName] = useState('');
  const [editReqPhone, setEditReqPhone] = useState('');
  const [editReqWechat, setEditReqWechat] = useState('');
  const [editReqArea, setEditReqArea] = useState('法拉盛 Flushing (NY)');
  const [editReqPoint, setEditReqPoint] = useState('');
  const [editReqCount, setEditReqCount] = useState(1);
  const [editReqNeedOutbound, setEditReqNeedOutbound] = useState(true);
  const [editReqOutboundRole, setEditReqOutboundRole] = useState<ParticipantRole>('volunteer');
  const [editReqNeedReturn, setEditReqNeedReturn] = useState(true);
  const [editReqReturnRole, setEditReqReturnRole] = useState<ParticipantRole>('attendee');
  const [editReqNotes, setEditReqNotes] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  const handleOpenEditRequest = (req: RideRequest) => {
    setEditingRequest(req);
    setEditReqName(req.passengerName);
    setEditReqPhone(req.passengerPhone);
    setEditReqWechat(req.wechatOrLine || '');
    setEditReqArea(req.pickupArea);
    setEditReqPoint(req.pickupPoint);
    setEditReqCount(req.passengerCount);
    setEditReqNeedOutbound(req.needOutbound);
    setEditReqOutboundRole(req.outboundRole);
    setEditReqNeedReturn(req.needReturn);
    setEditReqReturnRole(req.returnRole);
    setEditReqNotes(req.notes || '');
    setEditSuccessMsg('');
  };

  const handleSaveEditRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest || !onUpdateRequest) return;
    const updated: RideRequest = {
      ...editingRequest,
      passengerName: editReqName.trim(),
      passengerPhone: editReqPhone.trim(),
      wechatOrLine: editReqWechat.trim(),
      pickupArea: editReqArea,
      pickupPoint: editReqPoint.trim(),
      passengerCount: editReqCount,
      needOutbound: editReqNeedOutbound,
      outboundRole: editReqOutboundRole,
      needReturn: editReqNeedReturn,
      returnRole: editReqReturnRole,
      notes: editReqNotes.trim()
    };
    onUpdateRequest(updated);
    setEditSuccessMsg(t.updateSuccess);
    setTimeout(() => {
      setEditingRequest(null);
      setEditSuccessMsg('');
    }, 1200);
  };

  const pendingRequestsCount = requests.filter(
    (r) => r.eventId === currentEvent.id && r.status !== 'matched_full'
  ).length;

  // Filter offers
  const filteredOffers = offers.filter((offer) => {
    if (offer.eventId !== currentEvent.id) return false;
    
    // Area filter
    if (selectedArea !== '全美東區域' && offer.departureArea !== selectedArea) {
      return false;
    }

    // Leg filter
    if (selectedLeg === 'outbound' && !offer.hasOutbound) return false;
    if (selectedLeg === 'return' && !offer.hasReturn) return false;

    // Role filter
    if (selectedRoleFilter !== 'all') {
      const matchOutbound = offer.hasOutbound && (offer.outboundMode === selectedRoleFilter || offer.outboundMode === 'both');
      const matchReturn = offer.hasReturn && (offer.returnMode === selectedRoleFilter || offer.returnMode === 'both');
      if (!matchOutbound && !matchReturn) return false;
    }

    // Keyword search
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      const matchSpot = offer.departurePoint.toLowerCase().includes(kw);
      const matchArea = offer.departureArea.toLowerCase().includes(kw);
      const matchDriver = offer.driverName.toLowerCase().includes(kw);
      if (!matchSpot && !matchArea && !matchDriver) return false;
    }

    return true;
  });

  const handleOpenBooking = (offer: CarpoolOffer) => {
    setBookingOffer(offer);
    setPassengerName('');
    setPassengerPhone('');
    setWechatOrLine('');
    setSeatCount(1);
    setPickupNote('');
    setBookOutbound(offer.hasOutbound && offer.outboundAvailableSeats > 0);
    const initialRole: ParticipantRole = offer.outboundMode === 'attendee' ? 'attendee' : 'volunteer';
    setOutboundRole(initialRole);
    setBookReturn(offer.hasReturn && offer.returnAvailableSeats > 0);
    setReturnRole(offer.returnMode === 'attendee' ? 'attendee' : (offer.returnMode === 'volunteer' ? 'volunteer' : initialRole));
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingOffer) return;
    if (!passengerName.trim() || !passengerPhone.trim()) {
      alert(language === 'en' ? 'Please provide passenger name and contact phone number.' : '請填寫搭乘者姓名與聯絡電話！');
      return;
    }

    if (!bookOutbound && !bookReturn) {
      alert(t.modalSelectLegWarning);
      return;
    }

    const success = onBookSeat(
      bookingOffer.id,
      passengerName.trim(),
      passengerPhone.trim(),
      wechatOrLine.trim(),
      seatCount,
      bookOutbound,
      outboundRole,
      bookReturn,
      returnRole,
      pickupNote.trim()
    );

    if (success) {
      const parts = [];
      if (bookOutbound) {
        const roleLabel = outboundRole === 'volunteer' ? t.roleVolunteer : t.roleAttendee;
        parts.push(`${t.outbound} (${roleLabel}): ${bookingOffer.outboundTime}`);
      }
      if (bookReturn) {
        const roleLabel = returnRole === 'volunteer' ? t.roleVolunteer : t.roleAttendee;
        parts.push(`${t.returnLeg} (${roleLabel}): ${bookingOffer.returnTime}`);
      }

      setBookingSuccessInfo({
        driverName: bookingOffer.driverName,
        driverPhone: bookingOffer.driverPhone,
        wechatOrLine: bookingOffer.wechatOrLine,
        pickupPoint: `${getLocalizedArea(bookingOffer.departureArea, language)} - ${bookingOffer.departurePoint}`,
        details: parts.join(' ｜ '),
      });
      setBookingOffer(null);
    } else {
      alert(language === 'en' ? 'Insufficient available seats in this ride. Please adjust passenger count or choose another ride.' : '所選車次的剩餘空位不足，請調整人數或選擇其他車次。');
    }
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName.trim() || !reqPhone.trim()) {
      alert(language === 'en' ? 'Please provide passenger name and contact phone number.' : '請填寫姓名與聯絡電話');
      return;
    }
    if (!reqNeedOutbound && !reqNeedReturn) {
      alert(t.modalSelectLegWarning);
      return;
    }

    onCreateRequest({
      eventId: currentEvent.id,
      passengerName: reqName.trim(),
      passengerPhone: reqPhone.trim(),
      wechatOrLine: reqWechat.trim() || undefined,
      pickupArea: reqArea,
      pickupPoint: reqPoint.trim() || t.requestDefaultPickupPoint,
      passengerCount: reqCount,
      needOutbound: reqNeedOutbound,
      outboundRole: reqOutboundRole,
      needReturn: reqNeedReturn,
      returnRole: reqReturnRole,
      notes: reqNotes.trim(),
    });

    setRequestSubmitted(true);
    setTimeout(() => {
      setRequestSubmitted(false);
      setIsRequestModalOpen(false);
      setReqName('');
      setReqPhone('');
      setReqWechat('');
      setReqPoint('');
      setReqNotes('');
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Event Info Card - Large Readable Text for Seniors */}
      <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50/70 border border-amber-200/90 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs md:text-sm font-bold border border-amber-300">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>{t.appTitle} • {localizedEvent.title}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
              {localizedEvent.title}
            </h2>
            <div className="text-sm md:text-base text-amber-900 font-bold bg-amber-100/50 py-1 px-2.5 rounded-lg inline-block border border-amber-200/60">
              {localizedEvent.theme}
            </div>
            <p className="text-xs md:text-sm text-stone-600 font-medium leading-relaxed max-w-2xl">
              {localizedEvent.subtitle}
            </p>
          </div>

          <div className="space-y-2 text-xs md:text-sm text-stone-800 bg-white/95 p-4 rounded-2xl border border-amber-200 shadow-2xs shrink-0">
            <div className="flex items-center gap-2 font-black text-stone-900 text-sm md:text-base">
              <Calendar className="w-5 h-5 text-amber-700 shrink-0" />
              <span>{localizedEvent.date}</span>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-orange-800">{t.roleVolunteer}：</span>
                <span className="font-semibold">{localizedEvent.volunteerArrivalTime}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-800">{t.roleAttendee}：</span>
                <span className="font-semibold">{localizedEvent.attendeeArrivalTime}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 pt-1.5 border-t border-stone-200 text-stone-700 text-xs">
              <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span className="font-bold">{localizedEvent.location}</span>
            </div>
          </div>
        </div>

        {/* Schedule & Checklist Expandable Bar */}
        <div className="border-t border-amber-200/80 pt-3">
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-100/80 hover:bg-amber-200/80 text-amber-950 font-black text-sm md:text-base transition-colors cursor-pointer border border-amber-300"
          >
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-800" />
              <span>📋 {showSchedule ? t.scheduleToggleClose : t.scheduleToggleOpen}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-800">
              <span>{showSchedule ? '▲' : '▼'}</span>
              {showSchedule ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showSchedule && (
            <div className="mt-3 bg-white p-4 md:p-5 rounded-2xl border border-amber-200 shadow-xs space-y-4 animate-in fade-in">
              {/* Important Reminders Checklist */}
              <div>
                <h4 className="font-black text-stone-900 text-sm md:text-base flex items-center gap-1.5 mb-2">
                  <HelpCircle className="w-4 h-4 text-orange-600" />
                  {t.remindersTitle}：
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                  {localizedEvent.reminders.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-stone-800 font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Schedule Timeline */}
              <div>
                <h4 className="font-black text-stone-900 text-sm md:text-base flex items-center gap-1.5 mb-2.5">
                  <Clock className="w-4 h-4 text-amber-700" />
                  {t.scheduleTitle}：
                </h4>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden text-xs md:text-sm">
                  {localizedEvent.schedule.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 ${
                        item.highlight ? 'bg-amber-50/60 font-bold' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 font-black text-xs min-w-[100px] text-center">
                          {item.time}
                        </span>
                        <span className="text-stone-900 font-bold text-sm md:text-base">
                          {item.activity}
                        </span>
                      </div>
                      {item.detail && (
                        <span className="text-stone-500 sm:text-right text-xs">
                          {item.detail}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Highlight Banner on Volunteer vs Attendee decoupled rides */}
        <div className="pt-2 flex items-start gap-2 text-xs md:text-sm text-stone-800 bg-amber-50 p-3 rounded-2xl border border-amber-200 leading-relaxed font-medium">
          <Info className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
          <div>
            <strong>{t.decoupledTipTitle} </strong>
            {t.decoupledTipContent}
          </div>
        </div>
      </div>

      {/* Filter Toolbar - Large Touch Target */}
      <div className="space-y-3.5 bg-white p-4 md:p-5 rounded-2xl border border-stone-200 shadow-xs">
        {/* Row 1: Leg Selector & Role Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3.5">
          {/* Outbound vs Return Leg Filter */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-xl text-xs md:text-sm font-bold">
            <button
              onClick={() => setSelectedLeg('all')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                selectedLeg === 'all' ? 'bg-white text-stone-900 shadow-xs ring-1 ring-stone-200' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t.filterAllLegs}
            </button>
            <button
              onClick={() => setSelectedLeg('outbound')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                selectedLeg === 'outbound' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t.filterOutboundLeg}
            </button>
            <button
              onClick={() => setSelectedLeg('return')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                selectedLeg === 'return' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t.filterReturnLeg}
            </button>
          </div>

          {/* Role Filter Chips */}
          <div className="flex items-center gap-1.5 text-xs md:text-sm">
            <span className="text-stone-500 font-bold">{t.filterRoleTypeLabel}</span>
            <button
              onClick={() => setSelectedRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                selectedRoleFilter === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {t.filterRoleAll}
            </button>
            <button
              onClick={() => setSelectedRoleFilter('volunteer')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer flex items-center gap-1 transition-colors ${
                selectedRoleFilter === 'volunteer'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-100'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              {t.filterRoleVolunteer}
            </button>
            <button
              onClick={() => setSelectedRoleFilter('attendee')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer flex items-center gap-1 transition-colors ${
                selectedRoleFilter === 'attendee'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              {t.filterRoleAttendee}
            </button>
          </div>
        </div>

        {/* Row 2: US East Coast Area Chips & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {EAST_COAST_AREAS.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-3.5 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all cursor-pointer ${
                  selectedArea === area
                    ? 'bg-amber-700 text-white shadow-2xs'
                    : 'bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {getLocalizedArea(area, language)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px] md:w-52">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-stone-50 pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>

            {/* Switch between Cars and My Requests */}
            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setActivePassengerSection('offers')}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
                  activePassengerSection === 'offers'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-white'
                }`}
              >
                🚗 {t.tabAvailableCars} ({filteredOffers.length})
              </button>
              <button
                onClick={() => setActivePassengerSection('my-requests')}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
                  activePassengerSection === 'my-requests'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-white'
                }`}
              >
                📋 {t.myRequestsTab} ({requests.filter(r => r.eventId === currentEvent.id).length})
              </button>
            </div>

            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 text-xs md:text-sm font-black transition-colors cursor-pointer shrink-0 border border-orange-200 shadow-2xs"
            >
              <PlusCircle className="w-4 h-4 text-orange-700" />
              <span>{t.registerMyRequestBtn} {pendingRequestsCount > 0 && `(${pendingRequestsCount})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conditionally render Offers OR My Requests */}
      {activePassengerSection === 'my-requests' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg md:text-xl text-stone-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-amber-700" />
              {t.myRequestsTitle}
            </h3>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="text-xs md:text-sm bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              {t.registerNewRequestBtn}
            </button>
          </div>

          {requests.filter((r) => r.eventId === currentEvent.id).length === 0 ? (
            <div className="bg-white border border-dashed border-stone-300 rounded-3xl p-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <p className="text-stone-800 font-bold text-base">{t.noRequestsSubmitted}</p>
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 transition-colors cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                {t.registerMyRequestBtn}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests
                .filter((r) => r.eventId === currentEvent.id)
                .map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-300 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-lg text-stone-900">{req.passengerName}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                              {req.passengerCount} {t.personCountSuffix}
                            </span>
                            {req.isEjected && (
                              <span className="text-xs px-2.5 py-0.5 rounded-full font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 animate-pulse">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                {t.ejectedBadge}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                              req.status === 'matched_full'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'matched_partial'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {req.status === 'matched_full' ? t.statusMatchedFull : req.status === 'matched_partial' ? t.statusMatchedPartial : t.statusPending}
                            </span>
                          </div>
                          <p className="text-xs md:text-sm text-stone-600 flex items-center gap-1 mt-1 font-medium">
                            <Phone className="w-3.5 h-3.5 text-stone-400" />
                            <span>{req.passengerPhone}</span>
                            {req.wechatOrLine && <span className="text-stone-400">({req.wechatOrLine})</span>}
                          </p>

                          {req.isEjected && req.ejectedReason && (
                            <div className="mt-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-2.5 text-xs space-y-0.5">
                              <div className="font-bold flex items-center gap-1 text-rose-900">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>{t.ejectedReasonPrefix}{req.ejectedReason}</span>
                              </div>
                              <p className="text-[11px] text-rose-600">{t.ejectedNotice}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 space-y-2 text-xs md:text-sm">
                        <div className="flex items-start gap-2 text-stone-700">
                          <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-stone-900">{getLocalizedArea(req.pickupArea, language)}</strong> - {req.pickupPoint || (language === 'en' ? 'Coordinate with driver' : '配合車主集合點')}
                          </span>
                        </div>

                        <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-600">{t.outbound}：</span>
                            <span className="font-bold text-stone-900">
                              {req.needOutbound ? `${t.needLabel} (${req.outboundRole === 'volunteer' ? t.roleVolunteer : t.roleAttendee})` : t.notNeedLabel}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-600">{t.returnLeg}：</span>
                            <span className="font-bold text-stone-900">
                              {req.needReturn ? `${t.needLabel} (${req.returnRole === 'volunteer' ? t.roleVolunteer : t.roleAttendee})` : t.notNeedLabel}
                            </span>
                          </div>
                        </div>

                        {req.notes && (
                          <div className="text-stone-500 text-xs italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                            {t.modalNotesLabel}：{req.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                      <button
                        onClick={() => handleOpenEditRequest(req)}
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-amber-200"
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
                        className="py-2 px-3 rounded-xl hover:bg-red-50 text-red-600 text-xs md:text-sm font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-red-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t.cancelRequestBtn}</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      ) : (
        /* Carpool Offers Grid */
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-black text-lg md:text-xl text-stone-900 flex items-center gap-2">
              <Car className="w-6 h-6 text-amber-700" />
              {t.activeCarsListTitle}
              <span className="text-xs md:text-sm px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                {t.carCountBadge.replace('{count}', String(filteredOffers.length))}
              </span>
            </h3>
            <span className="text-xs md:text-sm text-stone-500 font-medium">{t.flexibleLegChoice}</span>
          </div>

        {filteredOffers.length === 0 ? (
          <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
              <Car className="w-7 h-7" />
            </div>
            <p className="text-stone-800 font-bold text-base">{t.emptyCarsTitle}</p>
            <p className="text-xs md:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
              {t.emptyCarsDesc}
            </p>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-sm hover:bg-amber-700 transition-colors cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              {t.registerMyRequestBtn}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOffers.map((offer) => {
              const outboundFull = offer.hasOutbound && offer.outboundAvailableSeats <= 0;
              const returnFull = offer.hasReturn && offer.returnAvailableSeats <= 0;
              const totallyFull = (!offer.hasOutbound || outboundFull) && (!offer.hasReturn || returnFull);

              return (
                <div
                  key={offer.id}
                  className={`bg-white rounded-2xl border transition-all shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden ${
                    totallyFull ? 'border-stone-200 opacity-80' : 'border-amber-200'
                  }`}
                >
                  <div className="p-4 md:p-5 space-y-3.5">
                    {/* Header: Area & Driver */}
                    <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                      <div>
                        <div className="inline-block px-3 py-1 rounded-lg bg-stone-100 text-stone-900 font-bold text-xs md:text-sm">
                          📍 {getLocalizedArea(offer.departureArea, language)}
                        </div>
                        <h4 className="text-base md:text-lg font-black text-stone-900 mt-1.5 flex items-center gap-1.5">
                          {offer.departurePoint}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold text-stone-900 text-sm md:text-base flex items-center justify-end gap-1">
                          <UserCheck className="w-4 h-4 text-amber-700" />
                          <span>{offer.driverName}</span>
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5 font-medium">
                          {offer.carColor || ''} {offer.carModel}
                        </div>
                      </div>
                    </div>

                    {/* Leg 1: Outbound Info */}
                    {offer.hasOutbound && (
                      <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200 text-xs md:text-sm space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-black text-stone-900">
                            <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-xs font-bold">
                              {t.outbound}
                            </span>
                            <span>{t.toTemple}</span>
                            {offer.outboundMode === 'volunteer' ? (
                              <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-900 text-xs font-bold">
                                {t.volunteerEarlyBadge}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-xs font-bold">
                                {t.attendeeRegularBadge}
                              </span>
                            )}
                          </div>

                          <div className="font-black text-sm">
                            {offer.outboundAvailableSeats > 0 ? (
                              <span className="text-amber-800">
                                {t.seatsCountRemaining.replace('{avail}', String(offer.outboundAvailableSeats)).replace('{total}', String(offer.outboundTotalSeats))}
                              </span>
                            ) : (
                              <span className="text-stone-400">{t.fullSeats}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-stone-700 font-medium">
                          <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>{t.departureTime}：<strong className="text-stone-900">{offer.outboundTime}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Leg 2: Return Info */}
                    {offer.hasReturn && (
                      <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-xs md:text-sm space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-black text-stone-900">
                            <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-800 text-xs font-bold">
                              {t.returnLeg}
                            </span>
                            <span>{t.returningToArea} {getLocalizedArea(offer.departureArea, language)}</span>
                            {offer.returnMode === 'volunteer' ? (
                              <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-900 text-xs font-bold">
                                {t.volunteerAfterCleanup}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-xs font-bold">
                                {t.attendeeAfterProgram}
                              </span>
                            )}
                          </div>

                          <div className="font-black text-sm">
                            {offer.returnAvailableSeats > 0 ? (
                              <span className="text-emerald-800">
                                {t.seatsCountRemaining.replace('{avail}', String(offer.returnAvailableSeats)).replace('{total}', String(offer.returnTotalSeats))}
                              </span>
                            ) : (
                              <span className="text-stone-400">{t.fullSeats}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-stone-700 font-medium">
                          <Clock className="w-4 h-4 text-stone-500 shrink-0" />
                          <span>{t.returnDepartureTime}：<strong className="text-stone-900">{offer.returnTime}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {offer.notes && (
                      <p className="text-xs md:text-sm text-stone-600 bg-stone-50 p-2.5 rounded-xl leading-relaxed">
                        {offer.notes}
                      </p>
                    )}
                  </div>

                  {/* Booking Trigger Button - Large Touch Target */}
                  <div className="p-3.5 bg-stone-50 border-t border-stone-100 rounded-b-2xl">
                    <button
                      disabled={totallyFull}
                      onClick={() => handleOpenBooking(offer)}
                      className={`w-full py-3.5 px-4 rounded-xl text-sm md:text-base font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                        totallyFull
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          : 'bg-amber-600 hover:bg-amber-700 text-white'
                      }`}
                    >
                      {totallyFull ? (
                        <span>{t.allLegsFull}</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span>{t.bookThisRideBtn}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    )}

      {/* Booking Modal - Large Clean Touch Controls for Seniors */}
      {bookingOffer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-7 shadow-2xl border border-stone-100 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="border-b border-stone-200 pb-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-stone-900">
                  {t.modalBookingTitle}
                </h3>
                <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
                  {t.carOwner}：{bookingOffer.driverName} • {getLocalizedArea(bookingOffer.departureArea, language)}
                </p>
              </div>
              <button
                onClick={() => setBookingOffer(null)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-4 text-sm md:text-base">
              {/* Leg Selection with Role */}
              <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="font-bold text-stone-900 text-sm md:text-base flex items-center justify-between">
                  <span>{t.selectLegPrompt}</span>
                  <span className="text-amber-800 text-xs font-bold">{t.flexibleLegChoice}</span>
                </div>

                {/* Outbound Checkbox */}
                {bookingOffer.hasOutbound && (
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      bookOutbound ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300' : 'bg-white border-stone-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2.5 cursor-pointer font-bold text-stone-900 text-sm md:text-base">
                        <input
                          type="checkbox"
                          checked={bookOutbound}
                          disabled={bookingOffer.outboundAvailableSeats <= 0}
                          onChange={(e) => setBookOutbound(e.target.checked)}
                          className="w-5 h-5 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                        />
                        <span>🚙 {t.bookOutboundCheck} ({bookingOffer.outboundTime})</span>
                      </label>
                      <span className="text-xs md:text-sm font-bold text-amber-900">
                        {t.seatsCountRemaining.replace('{avail}', String(bookingOffer.outboundAvailableSeats)).replace('{total}', String(bookingOffer.outboundTotalSeats))}
                      </span>
                    </div>

                    {bookOutbound && (
                      <div className="mt-2.5 pl-7 flex flex-wrap items-center gap-3 text-xs md:text-sm">
                        <span className="text-stone-600 font-bold">{t.yourRoleLabel}</span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="outboundRole"
                            checked={outboundRole === 'volunteer'}
                            onChange={() => {
                              setOutboundRole('volunteer');
                              setReturnRole('volunteer');
                            }}
                            className="w-4 h-4 text-amber-600"
                          />
                          <span className="text-orange-900 font-bold">{t.roleVolunteerEarly}</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="outboundRole"
                            checked={outboundRole === 'attendee'}
                            onChange={() => {
                              setOutboundRole('attendee');
                              setReturnRole('attendee');
                            }}
                            className="w-4 h-4 text-amber-600"
                          />
                          <span className="text-emerald-900 font-bold">{t.roleAttendeeRegular}</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* Return Checkbox */}
                {bookingOffer.hasReturn && (
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      bookReturn ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300' : 'bg-white border-stone-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2.5 cursor-pointer font-bold text-stone-900 text-sm md:text-base">
                        <input
                          type="checkbox"
                          checked={bookReturn}
                          disabled={bookingOffer.returnAvailableSeats <= 0}
                          onChange={(e) => setBookReturn(e.target.checked)}
                          className="w-5 h-5 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                        />
                        <span>🚗 {t.bookReturnCheck} ({bookingOffer.returnTime})</span>
                      </label>
                      <span className="text-xs md:text-sm font-bold text-emerald-900">
                        {t.seatsCountRemaining.replace('{avail}', String(bookingOffer.returnAvailableSeats)).replace('{total}', String(bookingOffer.returnTotalSeats))}
                      </span>
                    </div>

                    {bookReturn && (
                      <div className="mt-2.5 pl-7 flex flex-wrap items-center gap-3 text-xs md:text-sm">
                        <span className="text-stone-600 font-bold">{t.yourRoleLabel}</span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="returnRole"
                            checked={returnRole === 'volunteer'}
                            onChange={() => setReturnRole('volunteer')}
                            className="w-4 h-4 text-amber-600"
                          />
                          <span className="text-orange-900 font-bold">{t.roleVolunteerReturn}</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="returnRole"
                            checked={returnRole === 'attendee'}
                            onChange={() => setReturnRole('attendee')}
                            className="w-4 h-4 text-amber-600"
                          />
                          <span className="text-emerald-900 font-bold">{t.roleAttendeeReturn}</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Passenger Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                    {t.modalNameLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.passengerNamePlaceholder}
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                    {t.modalPhoneLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={t.phonePlaceholder}
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                    {t.modalContactLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={t.whatsappPlaceholder}
                    value={wechatOrLine}
                    onChange={(e) => setWechatOrLine(e.target.value)}
                    className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                    {t.modalCountLabel} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={seatCount}
                    onChange={(e) => setSeatCount(Number(e.target.value))}
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
                <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                  {t.modalNotesLabel}
                </label>
                <input
                  type="text"
                  placeholder={t.modalNotesPlaceholder}
                  value={pickupNote}
                  onChange={(e) => setPickupNote(e.target.value)}
                  className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setBookingOffer(null)}
                  className="flex-1 py-3.5 border border-stone-300 rounded-xl text-stone-700 font-bold hover:bg-stone-50 cursor-pointer"
                >
                  {t.modalCancelBtn}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black shadow-xs cursor-pointer text-base"
                >
                  {t.modalConfirmBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Success Confirmation Modal */}
      {bookingSuccessInfo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-7 shadow-2xl border border-stone-100 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-stone-900">{t.bookingConfirmedTitle}</h3>
              <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
                {t.bookingConfirmedDesc}
              </p>
            </div>

            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-left space-y-2.5 text-xs md:text-sm">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="text-stone-600 font-medium">{t.carOwner}</span>
                <span className="font-black text-stone-900 text-base">{bookingSuccessInfo.driverName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="text-stone-600 font-medium">{t.driverPhoneLabel}</span>
                <a
                  href={`tel:${bookingSuccessInfo.driverPhone}`}
                  className="font-black text-amber-800 text-base flex items-center gap-1 underline"
                >
                  <Phone className="w-4 h-4" />
                  {bookingSuccessInfo.driverPhone}
                </a>
              </div>
              {bookingSuccessInfo.wechatOrLine && (
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <span className="text-stone-600 font-medium">WhatsApp</span>
                  <span className="font-bold text-stone-800">{bookingSuccessInfo.wechatOrLine}</span>
                </div>
              )}
              <div className="flex items-start justify-between border-b border-amber-200 pb-2">
                <span className="text-stone-600 font-medium shrink-0">{t.pickupPointLabel}</span>
                <span className="font-bold text-stone-900 text-right">{bookingSuccessInfo.pickupPoint}</span>
              </div>
              <div className="pt-1 text-stone-800 font-semibold leading-relaxed">
                <strong>{t.tripDetails}：</strong>{bookingSuccessInfo.details}
              </div>
            </div>

            <button
              onClick={() => setBookingSuccessInfo(null)}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black shadow-xs cursor-pointer text-base"
            >
              {t.acknowledgedBtn}
            </button>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-stone-100 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-stone-900">
                  {t.requestFormTitle}
                </h3>
                <p className="text-xs md:text-sm text-stone-500 mt-0.5 font-medium">
                  {t.requestFormDesc}
                </p>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {requestSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
                <h4 className="text-xl font-bold text-stone-900">{t.requestSuccess}</h4>
                <p className="text-xs md:text-sm text-stone-600">
                  {language === 'en'
                    ? 'Your request has been forwarded to the registration team. We will contact you once a matching ride is available.'
                    : '您的需求已送至空山寺報名報到組，一旦有相應車次將主動聯繫您。'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs md:text-sm">
                <div>
                  <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                    {t.requestNameLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.passengerNamePlaceholder}
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
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
                      placeholder={t.phonePlaceholder}
                      value={reqPhone}
                      onChange={(e) => setReqPhone(e.target.value)}
                      className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                      {t.requestContactLabel}
                    </label>
                    <input
                      type="text"
                      placeholder={t.whatsappPlaceholder}
                      value={reqWechat}
                      onChange={(e) => setReqWechat(e.target.value)}
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
                      value={reqArea}
                      onChange={(e) => setReqArea(e.target.value)}
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
                      {t.requestCountLabel} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={reqCount}
                      onChange={(e) => setReqCount(Number(e.target.value))}
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
                    {t.requestPointLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={t.requestPointPlaceholder}
                    value={reqPoint}
                    onChange={(e) => setReqPoint(e.target.value)}
                    className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                {/* Need Outbound & Role */}
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer font-bold text-stone-900 text-sm">
                      <input
                        type="checkbox"
                        checked={reqNeedOutbound}
                        onChange={(e) => setReqNeedOutbound(e.target.checked)}
                        className="w-5 h-5 text-amber-600 rounded border-stone-300"
                      />
                      <span>{t.requestOutboundCheck}</span>
                    </label>

                    {reqNeedOutbound && (
                      <select
                        value={reqOutboundRole}
                        onChange={(e) => {
                          const val = e.target.value as ParticipantRole;
                          setReqOutboundRole(val);
                          setReqReturnRole(val);
                        }}
                        className="text-xs md:text-sm border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold"
                      >
                        <option value="volunteer">{t.roleVolunteerEarly}</option>
                        <option value="attendee">{t.roleAttendeeRegular}</option>
                      </select>
                    )}
                  </div>

                  {/* Need Return & Role */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                    <label className="flex items-center gap-2.5 cursor-pointer font-bold text-stone-900 text-sm">
                      <input
                        type="checkbox"
                        checked={reqNeedReturn}
                        onChange={(e) => setReqNeedReturn(e.target.checked)}
                        className="w-5 h-5 text-amber-600 rounded border-stone-300"
                      />
                      <span>{t.requestReturnCheck}</span>
                    </label>

                    {reqNeedReturn && (
                      <select
                        value={reqReturnRole}
                        onChange={(e) => setReqReturnRole(e.target.value as ParticipantRole)}
                        className="text-xs md:text-sm border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold"
                      >
                        <option value="volunteer">{t.roleVolunteerReturn}</option>
                        <option value="attendee">{t.roleAttendeeReturn}</option>
                      </select>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                    {t.requestNotesLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={t.requestNotesPlaceholder}
                    value={reqNotes}
                    onChange={(e) => setReqNotes(e.target.value)}
                    className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="flex-1 py-3.5 border border-stone-300 rounded-xl text-stone-700 font-bold hover:bg-stone-50 cursor-pointer"
                  >
                    {t.modalCancelBtn}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black shadow-xs cursor-pointer text-base"
                  >
                    {t.requestSubmitBtn}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Request Modal */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-stone-100 space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in">
            <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-700" />
                  {t.editRequestModalTitle}
                </h3>
                <p className="text-xs md:text-sm text-stone-500 mt-0.5 font-medium">
                  {language === 'en' ? 'Update your pickup location, passenger count, or trips at any time' : '可隨時修改上車地點、人數或去回程需求'}
                </p>
              </div>
              <button
                onClick={() => setEditingRequest(null)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {editSuccessMsg ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold text-stone-900">{editSuccessMsg}</h4>
              </div>
            ) : (
              <form onSubmit={handleSaveEditRequest} className="space-y-4 text-xs md:text-sm">
                <div>
                  <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                    {t.requestNameLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editReqName}
                    onChange={(e) => setEditReqName(e.target.value)}
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
                      value={editReqPhone}
                      onChange={(e) => setEditReqPhone(e.target.value)}
                      className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                      {t.requestContactLabel}
                    </label>
                    <input
                      type="text"
                      value={editReqWechat}
                      onChange={(e) => setEditReqWechat(e.target.value)}
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
                      value={editReqArea}
                      onChange={(e) => setEditReqArea(e.target.value)}
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
                      {t.requestCountLabel} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editReqCount}
                      onChange={(e) => setEditReqCount(Number(e.target.value))}
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
                    {t.requestPointLabel}
                  </label>
                  <input
                    type="text"
                    value={editReqPoint}
                    onChange={(e) => setEditReqPoint(e.target.value)}
                    className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                {/* Need Outbound & Role */}
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer font-bold text-stone-900 text-sm">
                      <input
                        type="checkbox"
                        checked={editReqNeedOutbound}
                        onChange={(e) => setEditReqNeedOutbound(e.target.checked)}
                        className="w-5 h-5 text-amber-600 rounded border-stone-300"
                      />
                      <span>{t.requestOutboundCheck}</span>
                    </label>

                    {editReqNeedOutbound && (
                      <select
                        value={editReqOutboundRole}
                        onChange={(e) => setEditReqOutboundRole(e.target.value as ParticipantRole)}
                        className="text-xs md:text-sm border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold"
                      >
                        <option value="volunteer">{t.roleVolunteerEarly}</option>
                        <option value="attendee">{t.roleAttendeeRegular}</option>
                      </select>
                    )}
                  </div>

                  {/* Need Return & Role */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                    <label className="flex items-center gap-2.5 cursor-pointer font-bold text-stone-900 text-sm">
                      <input
                        type="checkbox"
                        checked={editReqNeedReturn}
                        onChange={(e) => setEditReqNeedReturn(e.target.checked)}
                        className="w-5 h-5 text-amber-600 rounded border-stone-300"
                      />
                      <span>{t.requestReturnCheck}</span>
                    </label>

                    {editReqNeedReturn && (
                      <select
                        value={editReqReturnRole}
                        onChange={(e) => setEditReqReturnRole(e.target.value as ParticipantRole)}
                        className="text-xs md:text-sm border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold"
                      >
                        <option value="volunteer">{t.roleVolunteerReturn}</option>
                        <option value="attendee">{t.roleAttendeeReturn}</option>
                      </select>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                    {t.modalNotesLabel}
                  </label>
                  <input
                    type="text"
                    value={editReqNotes}
                    onChange={(e) => setEditReqNotes(e.target.value)}
                    className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingRequest(null)}
                    className="flex-1 py-3.5 border border-stone-300 rounded-xl text-stone-700 font-bold hover:bg-stone-50 cursor-pointer"
                  >
                    {t.cancelEditBtn}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black shadow-xs cursor-pointer text-base"
                  >
                    {t.saveChangesBtn}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
