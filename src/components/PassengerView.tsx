import React, { useState } from 'react';
import type { Event, CarpoolOffer, RideRequest, ParticipantRole } from '../types';
import { EAST_COAST_AREAS } from '../data/mockData';
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
  HelpCircle
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
}

export const PassengerView: React.FC<PassengerViewProps> = ({
  currentEvent,
  offers,
  requests,
  onBookSeat,
  onCreateRequest,
}) => {
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
  const [returnRole, setReturnRole] = useState<ParticipantRole>('attendee');
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
  const [reqReturnRole, setReqReturnRole] = useState<ParticipantRole>('attendee');
  const [reqNotes, setReqNotes] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

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
    setOutboundRole(offer.outboundMode === 'attendee' ? 'attendee' : 'volunteer');
    setBookReturn(offer.hasReturn && offer.returnAvailableSeats > 0);
    setReturnRole(offer.returnMode === 'volunteer' ? 'volunteer' : 'attendee');
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingOffer) return;
    if (!passengerName.trim() || !passengerPhone.trim()) {
      alert('請填寫搭乘者姓名與聯絡電話！');
      return;
    }

    if (!bookOutbound && !bookReturn) {
      alert('請至少勾選預約「去程」或「回程」車位！');
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
        parts.push(`去程（${outboundRole === 'volunteer' ? '義工車' : '正行車'}）：${bookingOffer.outboundTime}`);
      }
      if (bookReturn) {
        parts.push(`回程（${returnRole === 'volunteer' ? '義工車' : '正行車'}）：${bookingOffer.returnTime}`);
      }

      setBookingSuccessInfo({
        driverName: bookingOffer.driverName,
        driverPhone: bookingOffer.driverPhone,
        wechatOrLine: bookingOffer.wechatOrLine,
        pickupPoint: `${bookingOffer.departureArea} - ${bookingOffer.departurePoint}`,
        details: parts.join(' ｜ '),
      });
      setBookingOffer(null);
    } else {
      alert('所選車次的剩餘空位不足，請調整人數或選擇其他車次。');
    }
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName.trim() || !reqPhone.trim()) {
      alert('請填寫姓名與聯絡電話');
      return;
    }
    if (!reqNeedOutbound && !reqNeedReturn) {
      alert('請至少勾選需要「去程」或「回程」！');
      return;
    }

    onCreateRequest({
      eventId: currentEvent.id,
      passengerName: reqName.trim(),
      passengerPhone: reqPhone.trim(),
      wechatOrLine: reqWechat.trim() || undefined,
      pickupArea: reqArea,
      pickupPoint: reqPoint.trim() || '配合車主集合點',
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
              空山寺 • 中秋普茶活動
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
              {currentEvent.title}
            </h2>
            <div className="text-sm md:text-base text-amber-900 font-bold bg-amber-100/50 py-1 px-2.5 rounded-lg inline-block border border-amber-200/60">
              {currentEvent.theme}
            </div>
            <p className="text-xs md:text-sm text-stone-600 font-medium leading-relaxed max-w-2xl">
              {currentEvent.subtitle}
            </p>
          </div>

          <div className="space-y-2 text-xs md:text-sm text-stone-800 bg-white/95 p-4 rounded-2xl border border-amber-200 shadow-2xs shrink-0">
            <div className="flex items-center gap-2 font-black text-stone-900 text-sm md:text-base">
              <Calendar className="w-5 h-5 text-amber-700 shrink-0" />
              <span>{currentEvent.date}</span>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-orange-800">義工集合：</span>
                <span className="font-semibold">{currentEvent.volunteerArrivalTime}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-800">入寺集合：</span>
                <span className="font-semibold">{currentEvent.attendeeArrivalTime}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 pt-1.5 border-t border-stone-200 text-stone-700 text-xs">
              <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span className="font-bold">{currentEvent.location}</span>
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
              <span>📋 查看 9/27 當日活動流程時刻表 & 自備用品提醒</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-800">
              <span>{showSchedule ? '收合流程' : '點擊展開'}</span>
              {showSchedule ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showSchedule && (
            <div className="mt-3 bg-white p-4 md:p-5 rounded-2xl border border-amber-200 shadow-xs space-y-4 animate-in fade-in">
              {/* Important Reminders Checklist */}
              <div>
                <h4 className="font-black text-stone-900 text-sm md:text-base flex items-center gap-1.5 mb-2">
                  <HelpCircle className="w-4 h-4 text-orange-600" />
                  注意事項與必備用品：
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                  {currentEvent.reminders.map((item, idx) => (
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
                  9/27 活動完整時間流程：
                </h4>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden text-xs md:text-sm">
                  {currentEvent.schedule.map((item, idx) => (
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
            <strong>搭車小撇步：</strong>
            義工朋友若需清晨提早出發協助素烤備餐或佈置，可<strong>單獨預約【義工車去程】(06:30出發)</strong>；下午 15:30 活動結束若需先行返回紐約，亦可<strong>分開預約【正行車回程】(15:30出發)</strong>，自由組合最安心！
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
              全部車次
            </button>
            <button
              onClick={() => setSelectedLeg('outbound')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                selectedLeg === 'outbound' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🚙 前往空山寺（去程）
            </button>
            <button
              onClick={() => setSelectedLeg('return')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                selectedLeg === 'return' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🚗 返回市區（回程）
            </button>
          </div>

          {/* Role Filter Chips */}
          <div className="flex items-center gap-1.5 text-xs md:text-sm">
            <span className="text-stone-500 font-bold">車次類型：</span>
            <button
              onClick={() => setSelectedRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                selectedRoleFilter === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              全部
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
              義工班次（早到）
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
              正行班次（活動）
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
                {area}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-52">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="搜尋地點、車主..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-stone-50 pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>

            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 text-xs md:text-sm font-black transition-colors cursor-pointer shrink-0 border border-orange-200 shadow-2xs"
            >
              <PlusCircle className="w-4 h-4 text-orange-700" />
              <span>登記搭車需求 {pendingRequestsCount > 0 && `(${pendingRequestsCount})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Carpool Offers Grid */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="font-black text-lg md:text-xl text-stone-900 flex items-center gap-2">
            <Car className="w-6 h-6 text-amber-700" />
            可搭乘車次清單
            <span className="text-xs md:text-sm px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
              共 {filteredOffers.length} 輛車
            </span>
          </h3>
          <span className="text-xs md:text-sm text-stone-500 font-medium">可單選去程或回程</span>
        </div>

        {filteredOffers.length === 0 ? (
          <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
              <Car className="w-7 h-7" />
            </div>
            <p className="text-stone-800 font-bold text-base">該區域或時段目前暫無相應車位</p>
            <p className="text-xs md:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
              您可以點擊下方按鈕登記「搭乘需求」，註明您是義工或正行參加者，報名報到組將為您協調美東車位！
            </p>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-sm hover:bg-amber-700 transition-colors cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              登記我的搭車需求
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
                          📍 {offer.departureArea}
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
                              去程
                            </span>
                            <span>前往空山寺</span>
                            {offer.outboundMode === 'volunteer' ? (
                              <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-900 text-xs font-bold">
                                義工班次（早到）
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-xs font-bold">
                                正行班次
                              </span>
                            )}
                          </div>

                          <div className="font-black text-sm">
                            {offer.outboundAvailableSeats > 0 ? (
                              <span className="text-amber-800">
                                剩 {offer.outboundAvailableSeats} / {offer.outboundTotalSeats} 位
                              </span>
                            ) : (
                              <span className="text-stone-400">已額滿</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-stone-700 font-medium">
                          <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>出發時間：<strong className="text-stone-900">{offer.outboundTime}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Leg 2: Return Info */}
                    {offer.hasReturn && (
                      <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-xs md:text-sm space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-black text-stone-900">
                            <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-800 text-xs font-bold">
                              回程
                            </span>
                            <span>返回 {offer.departureArea.split(' ')[0]}</span>
                            {offer.returnMode === 'volunteer' ? (
                              <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-900 text-xs font-bold">
                                義工班次（善後返回）
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-xs font-bold">
                                正行班次（結束即回）
                              </span>
                            )}
                          </div>

                          <div className="font-black text-sm">
                            {offer.returnAvailableSeats > 0 ? (
                              <span className="text-emerald-800">
                                剩 {offer.returnAvailableSeats} / {offer.returnTotalSeats} 位
                              </span>
                            ) : (
                              <span className="text-stone-400">已額滿</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-stone-700 font-medium">
                          <Clock className="w-4 h-4 text-stone-500 shrink-0" />
                          <span>返程時間：<strong className="text-stone-900">{offer.returnTime}</strong></span>
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
                        <span>該車次已全數額滿</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span>預約此車位（可自選去程/回程）</span>
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

      {/* Booking Modal - Large Clean Touch Controls for Seniors */}
      {bookingOffer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-7 shadow-2xl border border-stone-100 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="border-b border-stone-200 pb-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-stone-900">
                  預約車位登記
                </h3>
                <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
                  車主：{bookingOffer.driverName} • {bookingOffer.departureArea}
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
                  <span>請勾選欲搭乘的行程：</span>
                  <span className="text-amber-800 text-xs font-bold">可單選去程或回程</span>
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
                        <span>🚙 預約【去程】({bookingOffer.outboundTime})</span>
                      </label>
                      <span className="text-xs md:text-sm font-bold text-amber-900">
                        剩 {bookingOffer.outboundAvailableSeats} 位
                      </span>
                    </div>

                    {bookOutbound && (
                      <div className="mt-2.5 pl-7 flex flex-wrap items-center gap-3 text-xs md:text-sm">
                        <span className="text-stone-600 font-bold">您的身份：</span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="outboundRole"
                            checked={outboundRole === 'volunteer'}
                            onChange={() => setOutboundRole('volunteer')}
                            className="w-4 h-4 text-amber-600"
                          />
                          <span className="text-orange-900 font-bold">義工組（早到服務）</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="outboundRole"
                            checked={outboundRole === 'attendee'}
                            onChange={() => setOutboundRole('attendee')}
                            className="w-4 h-4 text-amber-600"
                          />
                          <span className="text-emerald-900 font-bold">正行組（活動參加者）</span>
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
                        <span>🚗 預約【回程】({bookingOffer.returnTime})</span>
                      </label>
                      <span className="text-xs md:text-sm font-bold text-emerald-900">
                        剩 {bookingOffer.returnAvailableSeats} 位
                      </span>
                    </div>

                    {bookReturn && (
                      <div className="mt-2.5 pl-7 flex flex-wrap items-center gap-3 text-xs md:text-sm">
                        <span className="text-stone-600 font-bold">您的身份：</span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="returnRole"
                            checked={returnRole === 'attendee'}
                            onChange={() => setReturnRole('attendee')}
                            className="w-4 h-4 text-amber-600"
                          />
                          <span className="text-emerald-900 font-bold">正行組（活動結束回）</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="returnRole"
                            checked={returnRole === 'volunteer'}
                            onChange={() => setReturnRole('volunteer')}
                            className="w-4 h-4 text-amber-600"
                          />
                          <span className="text-orange-900 font-bold">義工組（善後完畢回）</span>
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
                    乘客姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例：陳先生 或 張女士"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                    聯絡電話 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="例：917-123-4567"
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                    微信 WeChat ID 或 LINE (選填)
                  </label>
                  <input
                    type="text"
                    placeholder="例：chen_ny88"
                    value={wechatOrLine}
                    onChange={(e) => setWechatOrLine(e.target.value)}
                    className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                    搭乘人數 (含本人) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={seatCount}
                    onChange={(e) => setSeatCount(Number(e.target.value))}
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
                <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                  備註說明 (選填)
                </label>
                <input
                  type="text"
                  placeholder="例：有年長長輩隨行、攜帶隨身行李、可在鄰近路口等候..."
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
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black shadow-xs cursor-pointer text-base"
                >
                  確認預約此車
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
              <h3 className="text-2xl font-black text-stone-900">車位預約成功！</h3>
              <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
                已為您保留座位，請記錄車主聯繫資訊
              </p>
            </div>

            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-left space-y-2.5 text-xs md:text-sm">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="text-stone-600 font-medium">車主姓名</span>
                <span className="font-black text-stone-900 text-base">{bookingSuccessInfo.driverName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="text-stone-600 font-medium">車主電話</span>
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
                  <span className="text-stone-600 font-medium">微信/LINE</span>
                  <span className="font-bold text-stone-800">{bookingSuccessInfo.wechatOrLine}</span>
                </div>
              )}
              <div className="flex items-start justify-between border-b border-amber-200 pb-2">
                <span className="text-stone-600 font-medium shrink-0">集合地點</span>
                <span className="font-bold text-stone-900 text-right">{bookingSuccessInfo.pickupPoint}</span>
              </div>
              <div className="pt-1 text-stone-800 font-semibold leading-relaxed">
                <strong>行程明細：</strong>{bookingSuccessInfo.details}
              </div>
            </div>

            <button
              onClick={() => setBookingSuccessInfo(null)}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black shadow-xs cursor-pointer text-base"
            >
              我知道了，感謝車主協助
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
                  登記搭乘需求（無車位協調）
                </h3>
                <p className="text-xs md:text-sm text-stone-500 mt-0.5 font-medium">
                  若無順路車輛，填寫後報名報到組或順路車主將為您協助安排
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
                <h4 className="text-xl font-bold text-stone-900">登記成功！</h4>
                <p className="text-xs md:text-sm text-stone-600">
                  您的需求已送至空山寺報名報到組，一旦有相應車次將主動聯繫您。
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs md:text-sm">
                <div>
                  <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                    乘客姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例：王先生 或 李女士"
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
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
                      value={reqPhone}
                      onChange={(e) => setReqPhone(e.target.value)}
                      className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                      微信 WeChat (選填)
                    </label>
                    <input
                      type="text"
                      placeholder="微信 ID"
                      value={reqWechat}
                      onChange={(e) => setReqWechat(e.target.value)}
                      className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                      希望上車區域 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={reqArea}
                      onChange={(e) => setReqArea(e.target.value)}
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
                      需求人數 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={reqCount}
                      onChange={(e) => setReqCount(Number(e.target.value))}
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
                    希望上車地點
                  </label>
                  <input
                    type="text"
                    placeholder="例：緬街圖書館門口、八大道地鐵站出口..."
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
                      <span>需要【去程】車位</span>
                    </label>

                    {reqNeedOutbound && (
                      <select
                        value={reqOutboundRole}
                        onChange={(e) => setReqOutboundRole(e.target.value as ParticipantRole)}
                        className="text-xs md:text-sm border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold"
                      >
                        <option value="volunteer">義工身份（早到服務）</option>
                        <option value="attendee">正行身份（參加活動）</option>
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
                      <span>需要【回程】車位</span>
                    </label>

                    {reqNeedReturn && (
                      <select
                        value={reqReturnRole}
                        onChange={(e) => setReqReturnRole(e.target.value as ParticipantRole)}
                        className="text-xs md:text-sm border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold"
                      >
                        <option value="attendee">正行身份（活動結束回）</option>
                        <option value="volunteer">義工身份（善後完畢回）</option>
                      </select>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1 text-xs md:text-sm">
                    備註說明
                  </label>
                  <input
                    type="text"
                    placeholder="例：有長輩隨行、時間彈性可配合車主..."
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
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black shadow-xs cursor-pointer text-base"
                  >
                    送出需求登記
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
