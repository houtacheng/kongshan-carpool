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
  Flame
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
    (r) => r.eventId === currentEvent.id && r.status === 'pending'
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
      alert('請填寫搭乘同修姓名與美東聯絡電話！');
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
    <div className="space-y-6 pb-12">
      {/* Event Info Card */}
      <div className="bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50/60 border border-amber-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              美東道場 • 中秋殊勝法會
            </div>
            <h2 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              <span>{currentEvent.title}</span>
            </h2>
            <p className="text-sm text-stone-600 font-medium">{currentEvent.subtitle}</p>
          </div>

          <div className="space-y-1.5 text-xs md:text-sm text-stone-700 bg-white/90 p-3.5 rounded-xl border border-amber-200/80 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{currentEvent.date}</span>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-orange-800">義工集結：</span>
                <span>{currentEvent.volunteerArrivalTime}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-800">正行入座：</span>
                <span>{currentEvent.attendeeArrivalTime}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 pt-1 border-t border-stone-100 text-stone-600 text-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>{currentEvent.location}</span>
            </div>
          </div>
        </div>

        {/* Highlight Banner on Volunteer vs Attendee decoupled rides */}
        <div className="mt-4 pt-3 border-t border-amber-200/70 flex items-start gap-2 text-xs text-amber-950/80 bg-amber-100/50 p-2.5 rounded-xl">
          <Info className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
          <div className="leading-relaxed">
            <strong>靈活參與模式支援：</strong>
            義工菩薩若需清晨前往大寮/壇場出坡，可<strong>單獨預約【義工車去程】</strong>；下午法會結束若需先回紐約，亦可<strong>分開預約【正行車回程】</strong>，請依照您的作息自由組合！
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        {/* Row 1: Leg Selector & Role Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
          {/* Outbound vs Return Leg Filter */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedLeg('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedLeg === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              全部行程
            </button>
            <button
              onClick={() => setSelectedLeg('outbound')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedLeg === 'outbound' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🚙 前往寺院（去程）
            </button>
            <button
              onClick={() => setSelectedLeg('return')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedLeg === 'return' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🚗 返回市區（回程）
            </button>
          </div>

          {/* Role Filter Chips */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-stone-400 font-medium">車次性質：</span>
            <button
              onClick={() => setSelectedRoleFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                selectedRoleFilter === 'all'
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              不限
            </button>
            <button
              onClick={() => setSelectedRoleFilter('volunteer')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer flex items-center gap-1 transition-colors ${
                selectedRoleFilter === 'volunteer'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100'
              }`}
            >
              <Flame className="w-3 h-3" />
              義工班次（早到/善後）
            </button>
            <button
              onClick={() => setSelectedRoleFilter('attendee')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer flex items-center gap-1 transition-colors ${
                selectedRoleFilter === 'attendee'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Sun className="w-3 h-3" />
              正行班次（共修參讚）
            </button>
          </div>
        </div>

        {/* Row 2: US East Coast Area Chips & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {EAST_COAST_AREAS.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
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
            <div className="relative flex-1 md:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="搜尋地名、車主..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-stone-50 pl-8 pr-3 py-1 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>

            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-900 text-xs font-bold transition-colors cursor-pointer shrink-0 border border-orange-200"
            >
              <PlusCircle className="w-3.5 h-3.5 text-orange-700" />
              <span>登記搭車需求 {pendingRequestsCount > 0 && `(${pendingRequestsCount})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Carpool Offers Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base md:text-lg text-stone-800 flex items-center gap-2">
            <Car className="w-5 h-5 text-amber-700" />
            美東發心愛心車次
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
              共 {filteredOffers.length} 輛車
            </span>
          </h3>
          <span className="text-xs text-stone-500">可單獨預約去程或回程</span>
        </div>

        {filteredOffers.length === 0 ? (
          <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
              <Car className="w-6 h-6" />
            </div>
            <p className="text-stone-700 font-bold">該區域或時段目前暫無相應車位</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              您可以點擊下方按鈕登記「搭乘需求」，註明您是義工或正行同修，交通組將為您協調美東車位！
            </p>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors cursor-pointer"
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
                  <div className="p-4 space-y-3">
                    {/* Header: Area & Driver */}
                    <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                      <div>
                        <div className="inline-block px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-800 font-bold text-xs">
                          📍 {offer.departureArea}
                        </div>
                        <h4 className="text-sm md:text-base font-black text-stone-900 mt-1 flex items-center gap-1">
                          {offer.departurePoint}
                        </h4>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-stone-800 text-xs flex items-center justify-end gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                          <span>{offer.driverName}</span>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {offer.carColor || ''} {offer.carModel}
                        </div>
                      </div>
                    </div>

                    {/* Leg 1: Outbound Info */}
                    {offer.hasOutbound && (
                      <div className="bg-amber-50/50 rounded-xl p-2.5 border border-amber-100/80 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-stone-900">
                            <span className="px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 text-[10px]">
                              去程
                            </span>
                            <span>前往空山寺</span>
                            {offer.outboundMode === 'volunteer' ? (
                              <span className="px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 text-[10px] font-bold">
                                義工班次（早到）
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                正行班次
                              </span>
                            )}
                          </div>

                          <div className="font-bold text-[11px]">
                            {offer.outboundAvailableSeats > 0 ? (
                              <span className="text-amber-800 font-black">
                                剩 {offer.outboundAvailableSeats} / {offer.outboundTotalSeats} 位
                              </span>
                            ) : (
                              <span className="text-stone-400">已額滿</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-stone-600 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>出發時間：<strong>{offer.outboundTime}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Leg 2: Return Info */}
                    {offer.hasReturn && (
                      <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/80 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-stone-900">
                            <span className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-800 text-[10px]">
                              回程
                            </span>
                            <span>返回 {offer.departureArea.split(' ')[0]}</span>
                            {offer.returnMode === 'volunteer' ? (
                              <span className="px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 text-[10px] font-bold">
                                義工班次（善後賦歸）
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                正行班次（圓滿即回）
                              </span>
                            )}
                          </div>

                          <div className="font-bold text-[11px]">
                            {offer.returnAvailableSeats > 0 ? (
                              <span className="text-emerald-700 font-black">
                                剩 {offer.returnAvailableSeats} / {offer.returnTotalSeats} 位
                              </span>
                            ) : (
                              <span className="text-stone-400">已額滿</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-stone-600 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-stone-500" />
                          <span>返程時間：<strong>{offer.returnTime}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {offer.notes && (
                      <p className="text-[11px] text-stone-500 bg-stone-50 p-2 rounded-lg leading-relaxed">
                        {offer.notes}
                      </p>
                    )}
                  </div>

                  {/* Booking Trigger Button */}
                  <div className="p-3 bg-stone-50/80 border-t border-stone-100 rounded-b-2xl">
                    <button
                      disabled={totallyFull}
                      onClick={() => handleOpenBooking(offer)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        totallyFull
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                      }`}
                    >
                      {totallyFull ? (
                        <span>該車次已全數額滿</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
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

      {/* Booking Modal */}
      {bookingOffer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  預約車位（可單選或雙選去回程）
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  車主：{bookingOffer.driverName} • {bookingOffer.departureArea}
                </p>
              </div>
              <button
                onClick={() => setBookingOffer(null)}
                className="text-stone-400 hover:text-stone-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-4 text-xs md:text-sm">
              {/* Leg Selection with Role */}
              <div className="space-y-2.5 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <div className="font-bold text-stone-800 text-xs flex items-center justify-between">
                  <span>請勾選欲搭乘的行程：</span>
                  <span className="text-amber-800 text-[11px]">可依義工/正行身份靈活搭配</span>
                </div>

                {/* Outbound Checkbox */}
                {bookingOffer.hasOutbound && (
                  <div
                    className={`p-2.5 rounded-lg border transition-all ${
                      bookOutbound ? 'bg-amber-50/80 border-amber-300' : 'bg-white border-stone-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-900">
                        <input
                          type="checkbox"
                          checked={bookOutbound}
                          disabled={bookingOffer.outboundAvailableSeats <= 0}
                          onChange={(e) => setBookOutbound(e.target.checked)}
                          className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                        />
                        <span>🚙 預約【去程】前往空山寺 ({bookingOffer.outboundTime})</span>
                      </label>
                      <span className="text-[11px] text-stone-500">
                        剩 {bookingOffer.outboundAvailableSeats} 位
                      </span>
                    </div>

                    {bookOutbound && (
                      <div className="mt-2 pl-6 flex items-center gap-3 text-xs">
                        <span className="text-stone-600">您的去程身份：</span>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="outboundRole"
                            checked={outboundRole === 'volunteer'}
                            onChange={() => setOutboundRole('volunteer')}
                            className="text-amber-600"
                          />
                          <span className="text-orange-800 font-semibold">義工組（早到出坡）</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="outboundRole"
                            checked={outboundRole === 'attendee'}
                            onChange={() => setOutboundRole('attendee')}
                            className="text-amber-600"
                          />
                          <span className="text-emerald-800 font-semibold">正行組（參讚法會）</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* Return Checkbox */}
                {bookingOffer.hasReturn && (
                  <div
                    className={`p-2.5 rounded-lg border transition-all ${
                      bookReturn ? 'bg-amber-50/80 border-amber-300' : 'bg-white border-stone-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-900">
                        <input
                          type="checkbox"
                          checked={bookReturn}
                          disabled={bookingOffer.returnAvailableSeats <= 0}
                          onChange={(e) => setBookReturn(e.target.checked)}
                          className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                        />
                        <span>🚗 預約【回程】返回市區 ({bookingOffer.returnTime})</span>
                      </label>
                      <span className="text-[11px] text-stone-500">
                        剩 {bookingOffer.returnAvailableSeats} 位
                      </span>
                    </div>

                    {bookReturn && (
                      <div className="mt-2 pl-6 flex items-center gap-3 text-xs">
                        <span className="text-stone-600">您的回程身份：</span>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="returnRole"
                            checked={returnRole === 'attendee'}
                            onChange={() => setReturnRole('attendee')}
                            className="text-amber-600"
                          />
                          <span className="text-emerald-800 font-semibold">正行組（法會後即回）</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="returnRole"
                            checked={returnRole === 'volunteer'}
                            onChange={() => setReturnRole('volunteer')}
                            className="text-amber-600"
                          />
                          <span className="text-orange-800 font-semibold">義工組（善後圓滿走）</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Passenger Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1 text-xs">
                    同修姓名 / 法名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例：陳大德 或 妙心居士"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1 text-xs">
                    美東手機號碼 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="例：917-123-4567"
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1 text-xs">
                    微信 WeChat ID 或 LINE (選填)
                  </label>
                  <input
                    type="text"
                    placeholder="方便車主建立共乘小組群"
                    value={wechatOrLine}
                    onChange={(e) => setWechatOrLine(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1 text-xs">
                    搭乘人數 (含本人) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={seatCount}
                    onChange={(e) => setSeatCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} 位同修
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1 text-xs">
                  特殊備註 (選填)
                </label>
                <input
                  type="text"
                  placeholder="例：有年邁長輩隨行、攜帶海青、可在附近路口上車..."
                  value={pickupNote}
                  onChange={(e) => setPickupNote(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setBookingOffer(null)}
                  className="flex-1 py-2.5 border border-stone-200 rounded-xl text-stone-600 font-medium hover:bg-stone-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-100 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-stone-900">車位預約成功！阿彌陀佛</h3>
              <p className="text-xs text-stone-500 mt-1">
                已為您保留車位，請妥善記錄車主聯繫資訊
              </p>
            </div>

            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-1.5">
                <span className="text-stone-500">車主姓名</span>
                <span className="font-bold text-stone-800">{bookingSuccessInfo.driverName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-1.5">
                <span className="text-stone-500">車主電話</span>
                <a
                  href={`tel:${bookingSuccessInfo.driverPhone}`}
                  className="font-bold text-amber-700 flex items-center gap-1 underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {bookingSuccessInfo.driverPhone}
                </a>
              </div>
              {bookingSuccessInfo.wechatOrLine && (
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-1.5">
                  <span className="text-stone-500">微信/LINE</span>
                  <span className="font-bold text-stone-800">{bookingSuccessInfo.wechatOrLine}</span>
                </div>
              )}
              <div className="flex items-start justify-between border-b border-amber-200/60 pb-1.5">
                <span className="text-stone-500 shrink-0">集合地點</span>
                <span className="font-bold text-stone-800 text-right">{bookingSuccessInfo.pickupPoint}</span>
              </div>
              <div className="pt-1 text-stone-700 font-medium">
                <strong>行程明細：</strong>{bookingSuccessInfo.details}
              </div>
            </div>

            <button
              onClick={() => setBookingSuccessInfo(null)}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
            >
              感恩同修成就，我已記下資訊
            </button>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  登記搭乘需求（無車位協調）
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  若無順路車輛，填寫後交通組或順路車主將為您協助媒合
                </p>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {requestSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-stone-800">登記成功！阿彌陀佛</h4>
                <p className="text-xs text-stone-500">
                  您的需求已送至空山寺交通組，一旦有相應車次將主動聯繫您。
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="space-y-3.5 text-xs md:text-sm">
                <div>
                  <label className="block text-stone-700 font-medium mb-1 text-xs">
                    同修姓名 / 法名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例：王居士"
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-700 font-medium mb-1 text-xs">
                      美東電話 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="例：917-000-1111"
                      value={reqPhone}
                      onChange={(e) => setReqPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1 text-xs">
                      微信 WeChat (選填)
                    </label>
                    <input
                      type="text"
                      placeholder="微信 ID"
                      value={reqWechat}
                      onChange={(e) => setReqWechat(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-700 font-medium mb-1 text-xs">
                      期望上車區域 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={reqArea}
                      onChange={(e) => setReqArea(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                    >
                      {EAST_COAST_AREAS.filter((a) => a !== '全美東區域').map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1 text-xs">
                      需求人數 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={reqCount}
                      onChange={(e) => setReqCount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
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
                  <label className="block text-stone-700 font-medium mb-1 text-xs">
                    詳細上車地點期望
                  </label>
                  <input
                    type="text"
                    placeholder="例：緬街圖書館、八大道地鐵站出口..."
                    value={reqPoint}
                    onChange={(e) => setReqPoint(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                {/* Need Outbound & Role */}
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-900">
                      <input
                        type="checkbox"
                        checked={reqNeedOutbound}
                        onChange={(e) => setReqNeedOutbound(e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded border-stone-300"
                      />
                      <span>需要【去程】車位</span>
                    </label>

                    {reqNeedOutbound && (
                      <select
                        value={reqOutboundRole}
                        onChange={(e) => setReqOutboundRole(e.target.value as ParticipantRole)}
                        className="text-xs border border-stone-300 rounded px-2 py-1 font-semibold"
                      >
                        <option value="volunteer">義工身份（早到出坡）</option>
                        <option value="attendee">正行身份（參加法會）</option>
                      </select>
                    )}
                  </div>

                  {/* Need Return & Role */}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-900">
                      <input
                        type="checkbox"
                        checked={reqNeedReturn}
                        onChange={(e) => setReqNeedReturn(e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded border-stone-300"
                      />
                      <span>需要【回程】車位</span>
                    </label>

                    {reqNeedReturn && (
                      <select
                        value={reqReturnRole}
                        onChange={(e) => setReqReturnRole(e.target.value as ParticipantRole)}
                        className="text-xs border border-stone-300 rounded px-2 py-1 font-semibold"
                      >
                        <option value="attendee">正行身份（法會結束回）</option>
                        <option value="volunteer">義工身份（善後圓滿回）</option>
                      </select>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1 text-xs">
                    補充說明
                  </label>
                  <input
                    type="text"
                    placeholder="例：有長輩隨行、時間彈性可配合車主..."
                    value={reqNotes}
                    onChange={(e) => setReqNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="flex-1 py-2.5 border border-stone-200 rounded-xl text-stone-600 font-medium hover:bg-stone-50 cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                  >
                    送出登記
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
