import React, { useState } from 'react';
import type { Event, CarpoolOffer, RideRequest } from '../types';
import { EAST_COAST_AREAS } from '../data/mockData';
import {
  Car,
  MapPin,
  Users,
  PlusCircle,
  Phone,
  Trash2,
  Sparkles,
  Heart,
  CheckCircle,
  UserPlus
} from 'lucide-react';

interface DriverViewProps {
  currentEvent: Event;
  offers: CarpoolOffer[];
  requests: RideRequest[];
  onCreateOffer: (offer: Omit<CarpoolOffer, 'id' | 'createdAt' | 'outboundPassengers' | 'returnPassengers'>) => void;
  onDeleteOffer: (offerId: string) => void;
  onMatchRequestToOffer: (requestId: string, offerId: string, leg: 'outbound' | 'return' | 'both') => boolean;
}

export const DriverView: React.FC<DriverViewProps> = ({
  currentEvent,
  offers,
  requests,
  onCreateOffer,
  onDeleteOffer,
  onMatchRequestToOffer,
}) => {
  const [driverTab, setDriverTab] = useState<'create' | 'my-cars' | 'pending-requests'>('create');

  // Form states
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [wechatOrLine, setWechatOrLine] = useState('');
  const [departureArea, setDepartureArea] = useState('法拉盛 Flushing (NY)');
  const [departurePoint, setDeparturePoint] = useState('');
  const [carModel, setCarModel] = useState('Toyota Sienna (7人座)');
  const [carColor, setCarColor] = useState('白色');
  const [plateNumber, setPlateNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Outbound configs
  const [hasOutbound, setHasOutbound] = useState(true);
  const [outboundTime, setOutboundTime] = useState('06:30 出發 (約 07:50 抵達)');
  const [outboundMode, setOutboundMode] = useState<'volunteer' | 'attendee' | 'both'>('volunteer');
  const [outboundTotalSeats, setOutboundTotalSeats] = useState(4);

  // Return configs
  const [hasReturn, setHasReturn] = useState(true);
  const [returnTime, setReturnTime] = useState('16:30 活動結束後返回');
  const [returnMode, setReturnMode] = useState<'volunteer' | 'attendee' | 'both'>('attendee');
  const [returnTotalSeats, setReturnTotalSeats] = useState(4);

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [selectedOfferForMatch, setSelectedOfferForMatch] = useState<string>('');
  const [matchLegChoice, setMatchLegChoice] = useState<'outbound' | 'return' | 'both'>('both');

  const myOffers = offers.filter((o) => o.eventId === currentEvent.id);
  const pendingRequests = requests.filter((r) => r.eventId === currentEvent.id && r.status !== 'matched_full');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim() || !driverPhone.trim() || !departurePoint.trim()) {
      alert('請填寫完整車主稱呼、聯絡電話與集合地點！');
      return;
    }
    if (!hasOutbound && !hasReturn) {
      alert('請至少提供「去程」或「回程」車位！');
      return;
    }

    onCreateOffer({
      eventId: currentEvent.id,
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      wechatOrLine: wechatOrLine.trim() || undefined,
      departureArea,
      departurePoint: departurePoint.trim(),
      carModel: carModel.trim() || '自用轎車',
      carColor: carColor.trim() || undefined,
      plateNumber: plateNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      hasOutbound,
      outboundTime: hasOutbound ? outboundTime.trim() : '',
      outboundMode,
      outboundTotalSeats: hasOutbound ? outboundTotalSeats : 0,
      outboundAvailableSeats: hasOutbound ? outboundTotalSeats : 0,
      hasReturn,
      returnTime: hasReturn ? returnTime.trim() : '',
      returnMode,
      returnTotalSeats: hasReturn ? returnTotalSeats : 0,
      returnAvailableSeats: hasReturn ? returnTotalSeats : 0,
    });

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      setDriverTab('my-cars');
      setDeparturePoint('');
      setNotes('');
    }, 1500);
  };

  const handleClaimPassenger = (requestId: string) => {
    if (!selectedOfferForMatch) {
      alert('請先選擇您要指派的車輛！');
      return;
    }
    const success = onMatchRequestToOffer(requestId, selectedOfferForMatch, matchLegChoice);
    if (success) {
      alert('已成功認領並安排乘客上車！感謝您的熱心協助！');
    } else {
      alert('該車次在所選行程的剩餘座位不足，無法排入。');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Gratitude Hero Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-amber-50 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/30 border border-amber-400/30 flex items-center justify-center shrink-0">
            <Heart className="w-7 h-7 text-amber-300 fill-amber-300/40" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              熱心出車 • 協助大家一同前往空山寺
            </h2>
            <p className="text-xs md:text-sm text-amber-100/90 mt-1.5 leading-relaxed font-medium">
              感謝您提供愛心車輛！空山寺位於紐約上州 Poughquag，單程約 1.5 ~ 2 小時。您的熱心支援，讓晨間協助的【義工】與參加活動的長輩都能平安、便利地抵達！
            </p>
          </div>
        </div>
      </div>

      {/* Sub-tabs - Large Touch Target */}
      <div className="flex border-b border-stone-200 gap-4 text-sm md:text-base font-bold">
        <button
          onClick={() => setDriverTab('create')}
          className={`pb-3.5 flex items-center gap-2 transition-colors cursor-pointer border-b-2 ${
            driverTab === 'create'
              ? 'border-amber-600 text-amber-700 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span>登記提供車位</span>
        </button>

        <button
          onClick={() => setDriverTab('my-cars')}
          className={`pb-3.5 flex items-center gap-2 transition-colors cursor-pointer border-b-2 ${
            driverTab === 'my-cars'
              ? 'border-amber-600 text-amber-700 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Car className="w-5 h-5" />
          <span>已發布車輛與名單 ({myOffers.length})</span>
        </button>

        <button
          onClick={() => setDriverTab('pending-requests')}
          className={`pb-3.5 flex items-center gap-2 transition-colors cursor-pointer border-b-2 ${
            driverTab === 'pending-requests'
              ? 'border-amber-600 text-amber-700 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>等待安排的乘客 ({pendingRequests.length})</span>
        </button>
      </div>

      {/* Tab 1: Create Carpool Offer */}
      {driverTab === 'create' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-7 shadow-xs max-w-2xl mx-auto">
          <div className="border-b border-stone-200 pb-3.5 mb-4">
            <h3 className="text-xl md:text-2xl font-black text-stone-900 flex items-center gap-2">
              <Car className="w-6 h-6 text-amber-700" />
              登記美東愛心共乘車位
            </h3>
            <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
              活動：{currentEvent.title} • {currentEvent.date}
            </p>
          </div>

          {showSuccessToast && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2.5 text-sm font-bold">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>車位登記成功！已同步發布至空山寺共乘名單。</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm md:text-base">
            {/* Driver Identity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                  車主稱呼 / 姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例：林先生 或 陳女士"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                  美東聯絡電話 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="例：917-123-4567"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
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
                  placeholder="例：lin_ny88"
                  value={wechatOrLine}
                  onChange={(e) => setWechatOrLine(e.target.value)}
                  className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                  出發區域 <span className="text-red-500">*</span>
                </label>
                <select
                  value={departureArea}
                  onChange={(e) => setDepartureArea(e.target.value)}
                  className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500 font-bold"
                >
                  {EAST_COAST_AREAS.filter((a) => a !== '全美東區域').map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                詳細集合地點 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="例：法拉盛緬街 7 號地鐵喜來登飯店門口、Fort Lee H Mart 停車場"
                value={departurePoint}
                onChange={(e) => setDeparturePoint(e.target.value)}
                className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Outbound Leg Settings */}
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer font-bold text-stone-900 text-sm md:text-base">
                <input
                  type="checkbox"
                  checked={hasOutbound}
                  onChange={(e) => setHasOutbound(e.target.checked)}
                  className="w-5 h-5 text-amber-600 rounded border-stone-300 focus:ring-amber-500 cursor-pointer"
                />
                <span>🚙 提供【去程】前往空山寺車位</span>
              </label>

              {hasOutbound && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-stone-700 text-xs md:text-sm font-bold mb-1">去程類型</label>
                    <select
                      value={outboundMode}
                      onChange={(e) => setOutboundMode(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-stone-300 rounded-xl bg-white font-medium"
                    >
                      <option value="volunteer">義工車（08:00前早到服務）</option>
                      <option value="attendee">正行車（10:00前到參加）</option>
                      <option value="both">義工與正行皆可</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 text-xs md:text-sm font-bold mb-1">集合出發時間</label>
                    <input
                      type="text"
                      value={outboundTime}
                      onChange={(e) => setOutboundTime(e.target.value)}
                      placeholder="例：06:30 出發"
                      className="w-full px-3 py-2 text-xs md:text-sm border border-stone-300 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 text-xs md:text-sm font-bold mb-1">去程空位數</label>
                    <select
                      value={outboundTotalSeats}
                      onChange={(e) => setOutboundTotalSeats(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-stone-300 rounded-xl bg-white font-bold"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <option key={n} value={n}>
                          {n} 個空位
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Return Leg Settings */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer font-bold text-stone-900 text-sm md:text-base">
                <input
                  type="checkbox"
                  checked={hasReturn}
                  onChange={(e) => setHasReturn(e.target.checked)}
                  className="w-5 h-5 text-amber-600 rounded border-stone-300 focus:ring-amber-500 cursor-pointer"
                />
                <span>🚗 提供【回程】返回紐約/新澤西車位</span>
              </label>

              {hasReturn && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-stone-700 text-xs md:text-sm font-bold mb-1">回程類型</label>
                    <select
                      value={returnMode}
                      onChange={(e) => setReturnMode(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-stone-300 rounded-xl bg-white font-medium"
                    >
                      <option value="attendee">正行車（16:30 活動後即回）</option>
                      <option value="volunteer">義工車（18:00 善後整理後回）</option>
                      <option value="both">義工與正行皆可</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 text-xs md:text-sm font-bold mb-1">回程出發時間</label>
                    <input
                      type="text"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      placeholder="例：16:30 活動結束"
                      className="w-full px-3 py-2 text-xs md:text-sm border border-stone-300 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 text-xs md:text-sm font-bold mb-1">回程空位數</label>
                    <select
                      value={returnTotalSeats}
                      onChange={(e) => setReturnTotalSeats(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-stone-300 rounded-xl bg-white font-bold"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <option key={n} value={n}>
                          {n} 個空位
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                  車款型號
                </label>
                <input
                  type="text"
                  placeholder="例：Toyota Sienna / CR-V"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                  車身顏色
                </label>
                <input
                  type="text"
                  placeholder="例：白色、銀色"
                  value={carColor}
                  onChange={(e) => setCarColor(e.target.value)}
                  className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                  車牌 (選填)
                </label>
                <input
                  type="text"
                  placeholder="例：NY • ABC-1234"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                補充備註說明
              </label>
              <input
                type="text"
                placeholder="例：準時發車、後座寬敞、歡迎共乘互相照應..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-base md:text-lg"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              確認發布愛心車位
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: My Published Offers */}
      {driverTab === 'my-cars' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-stone-900">
              已發布車輛與預約名單
            </h3>
            <button
              onClick={() => setDriverTab('create')}
              className="text-xs md:text-sm bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              新增另一部車
            </button>
          </div>

          {myOffers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center text-stone-500">
              尚未發布任何車位，請切換至「登記提供車位」登記發布！
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-3xl border border-stone-200 p-5 md:p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100 pb-3.5">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-black text-lg md:text-xl text-stone-900">
                          {offer.driverName} 的車輛
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 font-bold border border-stone-200">
                          {offer.carColor || ''} {offer.carModel} {offer.plateNumber ? `[${offer.plateNumber}]` : ''}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-stone-600 flex items-center gap-1 mt-1 font-medium">
                        <MapPin className="w-4 h-4 text-amber-700" />
                        {offer.departureArea} - {offer.departurePoint}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`確定要取消 ${offer.driverName} 發布的這趟車次嗎？`)) {
                          onDeleteOffer(offer.id);
                        }
                      }}
                      className="text-xs md:text-sm text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer self-start md:self-auto font-bold"
                    >
                      <Trash2 className="w-4 h-4" />
                      取消此車發布
                    </button>
                  </div>

                  {/* Outbound & Return Passengers Grids */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Outbound list */}
                    {offer.hasOutbound && (
                      <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 space-y-2.5">
                        <div className="flex items-center justify-between text-xs md:text-sm border-b border-amber-200/60 pb-2">
                          <span className="font-black text-amber-950 flex items-center gap-1.5">
                            🚙 去程乘客 ({offer.outboundPassengers.reduce((sum, p) => sum + p.passengerCount, 0)} 人)
                          </span>
                          <span className="font-bold text-amber-800">
                            剩餘 {offer.outboundAvailableSeats} 位
                          </span>
                        </div>

                        {offer.outboundPassengers.length === 0 ? (
                          <p className="text-xs text-stone-400 py-1">尚無去程乘客預約</p>
                        ) : (
                          <div className="space-y-2">
                            {offer.outboundPassengers.map((p) => (
                              <div key={p.id} className="bg-white p-2.5 rounded-xl border border-stone-200 text-xs md:text-sm flex items-center justify-between">
                                <div>
                                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                                    <span>{p.name}</span>
                                    <span className="text-[11px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                                      {p.passengerCount} 位
                                    </span>
                                    <span className={`text-[11px] px-1.5 py-0.2 rounded font-bold ${
                                      p.role === 'volunteer' ? 'bg-orange-100 text-orange-900' : 'bg-emerald-100 text-emerald-900'
                                    }`}>
                                      {p.role === 'volunteer' ? '義工' : '正行'}
                                    </span>
                                  </div>
                                  {p.pickupNote && (
                                    <div className="text-xs text-stone-500 mt-0.5">{p.pickupNote}</div>
                                  )}
                                </div>
                                <a href={`tel:${p.phone}`} className="text-amber-800 font-bold p-1.5 hover:bg-amber-50 rounded-lg">
                                  <Phone className="w-4 h-4" />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Return list */}
                    {offer.hasReturn && (
                      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2.5">
                        <div className="flex items-center justify-between text-xs md:text-sm border-b border-stone-200 pb-2">
                          <span className="font-black text-stone-900 flex items-center gap-1.5">
                            🚗 回程乘客 ({offer.returnPassengers.reduce((sum, p) => sum + p.passengerCount, 0)} 人)
                          </span>
                          <span className="font-bold text-emerald-800">
                            剩餘 {offer.returnAvailableSeats} 位
                          </span>
                        </div>

                        {offer.returnPassengers.length === 0 ? (
                          <p className="text-xs text-stone-400 py-1">尚無回程乘客預約</p>
                        ) : (
                          <div className="space-y-2">
                            {offer.returnPassengers.map((p) => (
                              <div key={p.id} className="bg-white p-2.5 rounded-xl border border-stone-200 text-xs md:text-sm flex items-center justify-between">
                                <div>
                                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                                    <span>{p.name}</span>
                                    <span className="text-[11px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                                      {p.passengerCount} 位
                                    </span>
                                    <span className={`text-[11px] px-1.5 py-0.2 rounded font-bold ${
                                      p.role === 'volunteer' ? 'bg-orange-100 text-orange-900' : 'bg-emerald-100 text-emerald-900'
                                    }`}>
                                      {p.role === 'volunteer' ? '義工' : '正行'}
                                    </span>
                                  </div>
                                  {p.pickupNote && (
                                    <div className="text-xs text-stone-500 mt-0.5">{p.pickupNote}</div>
                                  )}
                                </div>
                                <a href={`tel:${p.phone}`} className="text-amber-800 font-bold p-1.5 hover:bg-amber-50 rounded-lg">
                                  <Phone className="w-4 h-4" />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Proactive Passenger Claiming */}
      {driverTab === 'pending-requests' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs md:text-sm text-stone-800 leading-relaxed">
            <strong>主動認領乘客：</strong>以下為目前登記搭車需求但尚未安排妥當的朋友。若您的路線與時間剛好合適，請選擇您的愛心車輛並認領接送！
          </div>

          {/* Select which car to match */}
          {myOffers.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center gap-3 text-xs md:text-sm">
              <span className="font-black text-stone-900 shrink-0">指派到我的車次：</span>
              <select
                value={selectedOfferForMatch}
                onChange={(e) => setSelectedOfferForMatch(e.target.value)}
                className="border border-stone-300 rounded-xl px-3 py-2 flex-1 font-bold text-stone-900"
              >
                <option value="">-- 請選擇您的車輛 --</option>
                {myOffers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.driverName} ({o.departureArea}，去程餘 {o.outboundAvailableSeats} / 回程餘 {o.returnAvailableSeats})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5">
                <span className="text-stone-600 font-bold">認領行程：</span>
                <select
                  value={matchLegChoice}
                  onChange={(e) => setMatchLegChoice(e.target.value as any)}
                  className="border border-stone-300 rounded-xl px-2.5 py-2 font-bold"
                >
                  <option value="both">去回程皆接送</option>
                  <option value="outbound">僅接送去程</option>
                  <option value="return">僅接送回程</option>
                </select>
              </div>
            </div>
          )}

          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center text-stone-600 font-bold">
              目前所有乘客皆已順利安排車位，感謝大家的熱心！
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-orange-200 p-4 md:p-5 shadow-xs space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-stone-900 text-base">{req.passengerName}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 text-xs md:text-sm font-black">
                        需求 {req.passengerCount} 位
                      </span>
                    </div>

                    <div className="text-xs md:text-sm text-stone-700 flex items-center gap-1 font-medium">
                      <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>{req.pickupArea} - {req.pickupPoint}</span>
                    </div>

                    {/* Role & Leg Requirements */}
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {req.needOutbound && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-bold">
                          去程：{req.outboundRole === 'volunteer' ? '義工組(早到)' : '正行組'}
                        </span>
                      )}
                      {req.needReturn && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-800 font-bold">
                          回程：{req.returnRole === 'volunteer' ? '義工組(善後)' : '正行組(活動後即回)'}
                        </span>
                      )}
                    </div>

                    {req.notes && (
                      <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl">
                        備註：{req.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-stone-500 font-medium">電話：{req.passengerPhone}</span>
                    <button
                      onClick={() => handleClaimPassenger(req.id)}
                      disabled={!selectedOfferForMatch}
                      className={`text-xs md:text-sm px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        selectedOfferForMatch
                          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      <UserPlus className="w-4 h-4" />
                      認領接送
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
