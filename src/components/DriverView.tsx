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
  const [returnTime, setReturnTime] = useState('16:30 法會圓滿後賦歸');
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
      alert('請填寫完整車主稱呼、美東電話與集合地點！');
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
      alert('請先選擇您要指派的愛心車次！');
      return;
    }
    const success = onMatchRequestToOffer(requestId, selectedOfferForMatch, matchLegChoice);
    if (success) {
      alert('已成功認領並安排同修上車！阿彌陀佛！');
    } else {
      alert('該車次在所選行程的剩餘座位不足，無法排入。');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Gratitude Hero Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-amber-50 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-600/30 border border-amber-400/30 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6 text-amber-300 fill-amber-300/40" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black tracking-tight">
              發心出車 • 接引十方同修共赴空山寺
            </h2>
            <p className="text-xs md:text-sm text-amber-100/90 mt-1 leading-relaxed">
              感恩大德菩薩慈悲佈施車位。空山寺位於紐約上州 Poughquag，單程約 1.5 ~ 2 小時。您的發心成就，無論是載送晨間出坡的【義工】或是同修【正行】，皆功德難量！
            </p>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-stone-200 gap-4 text-xs md:text-sm font-bold">
        <button
          onClick={() => setDriverTab('create')}
          className={`pb-3 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
            driverTab === 'create'
              ? 'border-amber-600 text-amber-700 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>登記提供車位</span>
        </button>

        <button
          onClick={() => setDriverTab('my-cars')}
          className={`pb-3 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
            driverTab === 'my-cars'
              ? 'border-amber-600 text-amber-700 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>已發布車輛與乘客 ({myOffers.length})</span>
        </button>

        <button
          onClick={() => setDriverTab('pending-requests')}
          className={`pb-3 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
            driverTab === 'pending-requests'
              ? 'border-amber-600 text-amber-700 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>等待認領的同修 ({pendingRequests.length})</span>
        </button>
      </div>

      {/* Tab 1: Create Carpool Offer */}
      {driverTab === 'create' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 md:p-6 shadow-xs max-w-2xl mx-auto">
          <div className="border-b border-stone-100 pb-3 mb-4">
            <h3 className="text-base md:text-lg font-bold text-stone-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-amber-700" />
              登記美東愛心共乘車位
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              活動：{currentEvent.title} • {currentEvent.date}
            </p>
          </div>

          {showSuccessToast && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs md:text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>車位登記成功！已同步發布至空山寺共乘名單。</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs md:text-sm">
            {/* Driver Identity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1 text-xs">
                  車主稱呼 / 法名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例：林師兄 或 慈悲居士"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 text-xs">
                  美東聯絡電話 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="例：917-123-4567"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1 text-xs">
                  微信 WeChat ID 或 LINE (選填)
                </label>
                <input
                  type="text"
                  placeholder="例：lin_dharma"
                  value={wechatOrLine}
                  onChange={(e) => setWechatOrLine(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 text-xs">
                  出發區域 <span className="text-red-500">*</span>
                </label>
                <select
                  value={departureArea}
                  onChange={(e) => setDepartureArea(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
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
              <label className="block text-stone-700 font-semibold mb-1 text-xs">
                具體集合地點說明 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="例：法拉盛緬街 7 號地鐵喜來登門口、Fort Lee H Mart停車場"
                value={departurePoint}
                onChange={(e) => setDeparturePoint(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Outbound Leg Settings */}
            <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-900 text-xs md:text-sm">
                <input
                  type="checkbox"
                  checked={hasOutbound}
                  onChange={(e) => setHasOutbound(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500 cursor-pointer"
                />
                <span>🚙 提供【去程】前往空山寺車位</span>
              </label>

              {hasOutbound && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div>
                    <label className="block text-stone-600 text-xs mb-1">去程性質</label>
                    <select
                      value={outboundMode}
                      onChange={(e) => setOutboundMode(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg bg-white"
                    >
                      <option value="volunteer">義工車（08:00前早到出坡）</option>
                      <option value="attendee">正行車（10:00前到參讚）</option>
                      <option value="both">義工與正行皆可</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-600 text-xs mb-1">集合出發時間</label>
                    <input
                      type="text"
                      value={outboundTime}
                      onChange={(e) => setOutboundTime(e.target.value)}
                      placeholder="例：06:30 出發"
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 text-xs mb-1">去程空位數</label>
                    <select
                      value={outboundTotalSeats}
                      onChange={(e) => setOutboundTotalSeats(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg bg-white"
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
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-900 text-xs md:text-sm">
                <input
                  type="checkbox"
                  checked={hasReturn}
                  onChange={(e) => setHasReturn(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500 cursor-pointer"
                />
                <span>🚗 提供【回程】返回紐約/新澤西車位</span>
              </label>

              {hasReturn && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div>
                    <label className="block text-stone-600 text-xs mb-1">回程性質</label>
                    <select
                      value={returnMode}
                      onChange={(e) => setReturnMode(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg bg-white"
                    >
                      <option value="attendee">正行車（16:30 法會後即走）</option>
                      <option value="volunteer">義工車（18:00 善後出坡後回）</option>
                      <option value="both">義工與正行皆可</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-600 text-xs mb-1">回程出發時間</label>
                    <input
                      type="text"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      placeholder="例：16:30 法會結束"
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 text-xs mb-1">回程空位數</label>
                    <select
                      value={returnTotalSeats}
                      onChange={(e) => setReturnTotalSeats(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg bg-white"
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
                <label className="block text-stone-700 font-semibold mb-1 text-xs">
                  車型
                </label>
                <input
                  type="text"
                  placeholder="例：Toyota Sienna / CR-V"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 text-xs">
                  車色
                </label>
                <input
                  type="text"
                  placeholder="例：白色、銀色"
                  value={carColor}
                  onChange={(e) => setCarColor(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 text-xs">
                  車牌 (選填，現場認車)
                </label>
                <input
                  type="text"
                  placeholder="例：NY • ABC-1234"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1 text-xs">
                出車說明 / 備註
              </label>
              <input
                type="text"
                placeholder="例：準時發車、後座寬敞、歡迎同修共乘結緣..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-sm md:text-base"
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
            <h3 className="text-base md:text-lg font-bold text-stone-900">
              已發布車輛與預約名冊
            </h3>
            <button
              onClick={() => setDriverTab('create')}
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              新增另一部車
            </button>
          </div>

          {myOffers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-500">
              尚未發布任何車位，請切換至「登記提供車位」登記發布！
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-stone-900">
                          {offer.driverName} 的車輛
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold">
                          {offer.carColor || ''} {offer.carModel} {offer.plateNumber ? `[${offer.plateNumber}]` : ''}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-700" />
                        {offer.departureArea} - {offer.departurePoint}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`確定要取消 ${offer.driverName} 發布的這趟車次嗎？`)) {
                          onDeleteOffer(offer.id);
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer self-start md:self-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      取消此車發布
                    </button>
                  </div>

                  {/* Outbound & Return Passengers Grids */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Outbound list */}
                    {offer.hasOutbound && (
                      <div className="bg-amber-50/40 border border-amber-200/60 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs border-b border-amber-200/50 pb-1.5">
                          <span className="font-bold text-amber-950 flex items-center gap-1">
                            🚙 去程乘客 ({offer.outboundPassengers.reduce((sum, p) => sum + p.passengerCount, 0)} 人)
                          </span>
                          <span className="font-semibold text-amber-800 text-[11px]">
                            餘 {offer.outboundAvailableSeats} 位
                          </span>
                        </div>

                        {offer.outboundPassengers.length === 0 ? (
                          <p className="text-[11px] text-stone-400 py-1">尚無去程同修預約</p>
                        ) : (
                          <div className="space-y-1.5">
                            {offer.outboundPassengers.map((p) => (
                              <div key={p.id} className="bg-white p-2 rounded-lg border border-stone-200 text-xs flex items-center justify-between">
                                <div>
                                  <div className="font-bold text-stone-800 flex items-center gap-1">
                                    <span>{p.name}</span>
                                    <span className="text-[10px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                                      {p.passengerCount} 位
                                    </span>
                                    <span className={`text-[10px] px-1 py-0.2 rounded ${
                                      p.role === 'volunteer' ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                      {p.role === 'volunteer' ? '義工' : '正行'}
                                    </span>
                                  </div>
                                  {p.pickupNote && (
                                    <div className="text-[11px] text-stone-400 mt-0.5">{p.pickupNote}</div>
                                  )}
                                </div>
                                <a href={`tel:${p.phone}`} className="text-amber-700 font-bold p-1 hover:bg-amber-50 rounded">
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Return list */}
                    {offer.hasReturn && (
                      <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs border-b border-stone-200 pb-1.5">
                          <span className="font-bold text-stone-800 flex items-center gap-1">
                            🚗 回程乘客 ({offer.returnPassengers.reduce((sum, p) => sum + p.passengerCount, 0)} 人)
                          </span>
                          <span className="font-semibold text-emerald-700 text-[11px]">
                            餘 {offer.returnAvailableSeats} 位
                          </span>
                        </div>

                        {offer.returnPassengers.length === 0 ? (
                          <p className="text-[11px] text-stone-400 py-1">尚無回程同修預約</p>
                        ) : (
                          <div className="space-y-1.5">
                            {offer.returnPassengers.map((p) => (
                              <div key={p.id} className="bg-white p-2 rounded-lg border border-stone-200 text-xs flex items-center justify-between">
                                <div>
                                  <div className="font-bold text-stone-800 flex items-center gap-1">
                                    <span>{p.name}</span>
                                    <span className="text-[10px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                                      {p.passengerCount} 位
                                    </span>
                                    <span className={`text-[10px] px-1 py-0.2 rounded ${
                                      p.role === 'volunteer' ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                      {p.role === 'volunteer' ? '義工' : '正行'}
                                    </span>
                                  </div>
                                  {p.pickupNote && (
                                    <div className="text-[11px] text-stone-400 mt-0.5">{p.pickupNote}</div>
                                  )}
                                </div>
                                <a href={`tel:${p.phone}`} className="text-amber-700 font-bold p-1 hover:bg-amber-50 rounded">
                                  <Phone className="w-3.5 h-3.5" />
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
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-950">
            <strong>主動認領美東同修：</strong>以下為目前登記搭車需求但尚未安排妥當的同修。若您的路線與時段剛好合適，請選擇您的愛心車輛並認領接送！
          </div>

          {/* Select which car to match */}
          {myOffers.length > 0 && (
            <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
              <span className="font-bold text-stone-700 shrink-0">指派到我的車次：</span>
              <select
                value={selectedOfferForMatch}
                onChange={(e) => setSelectedOfferForMatch(e.target.value)}
                className="border border-stone-200 rounded-lg px-2.5 py-1.5 flex-1 font-semibold text-stone-800"
              >
                <option value="">-- 請選擇您的車輛 --</option>
                {myOffers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.driverName} ({o.departureArea}，去程餘 {o.outboundAvailableSeats} / 回程餘 {o.returnAvailableSeats})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1">
                <span className="text-stone-500">認領行程：</span>
                <select
                  value={matchLegChoice}
                  onChange={(e) => setMatchLegChoice(e.target.value as any)}
                  className="border border-stone-200 rounded-lg px-2 py-1.5 text-xs font-semibold"
                >
                  <option value="both">去回程皆接送</option>
                  <option value="outbound">僅接送去程</option>
                  <option value="return">僅接送回程</option>
                </select>
              </div>
            </div>
          )}

          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-500">
              目前所有同修皆已順利安排車位，隨喜感恩！
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-xl border border-orange-200 p-4 shadow-xs space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm">{req.passengerName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
                        需求 {req.passengerCount} 位
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{req.pickupArea} - {req.pickupPoint}</span>
                    </div>

                    {/* Role & Leg Requirements */}
                    <div className="flex flex-wrap gap-1 text-[11px]">
                      {req.needOutbound && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
                          去程：{req.outboundRole === 'volunteer' ? '義工組(早到)' : '正行組'}
                        </span>
                      )}
                      {req.needReturn && (
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 font-semibold">
                          回程：{req.returnRole === 'volunteer' ? '義工組(善後)' : '正行組(法會後即回)'}
                        </span>
                      )}
                    </div>

                    {req.notes && (
                      <p className="text-xs text-stone-500 bg-stone-50 p-2 rounded-lg">
                        備註：{req.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-stone-400">電話：{req.passengerPhone}</span>
                    <button
                      onClick={() => handleClaimPassenger(req.id)}
                      disabled={!selectedOfferForMatch}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        selectedOfferForMatch
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
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
