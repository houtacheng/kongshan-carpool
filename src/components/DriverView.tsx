import React, { useState } from 'react';
import type { Event, CarpoolOffer, RideRequest } from '../types';
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
  onCreateOffer: (offer: Omit<CarpoolOffer, 'id' | 'createdAt' | 'passengers'>) => void;
  onDeleteOffer: (offerId: string) => void;
  onMatchRequestToOffer: (requestId: string, offerId: string) => boolean;
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
  const [lineId, setLineId] = useState('');
  const [departureCity, setDepartureCity] = useState('新北市');
  const [departureDistrict, setDepartureDistrict] = useState('');
  const [departurePoint, setDeparturePoint] = useState('');
  const [departureTime, setDepartureTime] = useState('07:20');
  const [returnTrip, setReturnTrip] = useState(true);
  const [returnTime, setReturnTime] = useState('16:30 法會圓滿後返回');
  const [totalSeats, setTotalSeats] = useState(3);
  const [carModel, setCarModel] = useState('');
  const [carColor, setCarColor] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Selected offer for matching pending requests
  const [selectedOfferForMatch, setSelectedOfferForMatch] = useState<string>('');

  const myOffers = offers.filter((o) => o.eventId === currentEvent.id);
  const pendingRequests = requests.filter((r) => r.eventId === currentEvent.id && r.status === 'pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim() || !driverPhone.trim() || !departureDistrict.trim() || !departurePoint.trim()) {
      alert('請填寫完整車主姓名、手機、出發行政區與集合地點！');
      return;
    }

    onCreateOffer({
      eventId: currentEvent.id,
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      lineId: lineId.trim() || undefined,
      departureCity,
      departureDistrict: departureDistrict.trim(),
      departurePoint: departurePoint.trim(),
      departureTime,
      returnTrip,
      returnTime: returnTrip ? returnTime.trim() : undefined,
      totalSeats,
      availableSeats: totalSeats,
      carModel: carModel.trim() || '自用轎車',
      carColor: carColor.trim() || undefined,
      plateNumber: plateNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      setDriverTab('my-cars');
      // Reset some fields
      setDeparturePoint('');
      setNotes('');
    }, 1500);
  };

  const handleClaimPassenger = (requestId: string) => {
    if (!selectedOfferForMatch) {
      alert('請先選擇您要指派的車次！');
      return;
    }
    const success = onMatchRequestToOffer(requestId, selectedOfferForMatch);
    if (success) {
      alert('已成功認領並將同修加入您的車次名冊！');
    } else {
      alert('該車次剩餘座位不足，無法容納該申請人數。');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Gratitude Hero Banner */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-orange-700 text-amber-50 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-600/60 border border-amber-400/40 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-amber-200 fill-amber-300" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight">
              發心出車 • 功德無量
            </h2>
            <p className="text-xs md:text-sm text-amber-100/90 mt-1 leading-relaxed">
              感恩師兄師姐慈悲佈施車位，讓無交通工具的同修長輩能安住身心、一同共赴靈山法會。您所發布的車位將即時呈現於共乘清單中供同修預約。
            </p>
          </div>
        </div>
      </div>

      {/* Driver Sub-tabs */}
      <div className="flex border-b border-stone-200 gap-4 text-sm font-semibold">
        <button
          onClick={() => setDriverTab('create')}
          className={`pb-3 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
            driverTab === 'create'
              ? 'border-amber-600 text-amber-700 font-bold'
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
              ? 'border-amber-600 text-amber-700 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>已發布車輛 ({myOffers.length})</span>
        </button>

        <button
          onClick={() => setDriverTab('pending-requests')}
          className={`pb-3 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
            driverTab === 'pending-requests'
              ? 'border-amber-600 text-amber-700 font-bold'
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
              <Car className="w-5 h-5 text-amber-600" />
              登記法會共乘愛心車輛
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              活動：{currentEvent.title} • {currentEvent.date}
            </p>
          </div>

          {showSuccessToast && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>車位登記成功！已同步至法會共乘名單。</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            {/* Driver Identity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-medium mb-1 text-xs">
                  車主稱呼 / 法名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例：林師兄 或 慈濟師姐"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1 text-xs">
                  聯絡手機號碼 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="例：0912-345-678"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1 text-xs">
                LINE ID (選填，方便同修加好友協調)
              </label>
              <input
                type="text"
                placeholder="例：lin_dharma88"
                value={lineId}
                onChange={(e) => setLineId(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Departure Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-medium mb-1 text-xs">
                  出發縣市 <span className="text-red-500">*</span>
                </label>
                <select
                  value={departureCity}
                  onChange={(e) => setDepartureCity(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                >
                  <option value="新北市">新北市</option>
                  <option value="台北市">台北市</option>
                  <option value="桃園市">桃園市</option>
                  <option value="基隆市">基隆市</option>
                  <option value="新竹市">新竹市</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1 text-xs">
                  行政區 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例：板橋區、三重區、文山區"
                  value={departureDistrict}
                  onChange={(e) => setDepartureDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1 text-xs">
                具體集合地點說明 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="例：新埔捷運站 2 號出口（馥華飯店門口避車道）"
                value={departurePoint}
                onChange={(e) => setDeparturePoint(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Timing & Seats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-medium mb-1 text-xs">
                  預計出發時間 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1 text-xs">
                  提供空位數量 <span className="text-red-500">*</span>
                </label>
                <select
                  value={totalSeats}
                  onChange={(e) => setTotalSeats(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} 個空位
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Return Trip Option */}
            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={returnTrip}
                  onChange={(e) => setReturnTrip(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500 cursor-pointer"
                />
                <span className="font-semibold text-xs md:text-sm text-stone-800">
                  提供回程共乘（去回同行）
                </span>
              </label>

              {returnTrip && (
                <div className="pt-1">
                  <label className="block text-stone-600 text-xs mb-1">
                    回程說明 / 預計時間
                  </label>
                  <input
                    type="text"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    placeholder="例：16:30 法會圓滿後於原車返回"
                    className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg bg-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Vehicle Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-stone-700 font-medium mb-1 text-xs">
                  車款型號 (選填)
                </label>
                <input
                  type="text"
                  placeholder="例：Toyota RAV4"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1 text-xs">
                  車身顏色 (選填)
                </label>
                <input
                  type="text"
                  placeholder="例：白色、深灰"
                  value={carColor}
                  onChange={(e) => setCarColor(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1 text-xs">
                  車牌號碼 (選填)
                </label>
                <input
                  type="text"
                  placeholder="例：ABC-1234"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1 text-xs">
                特殊說明 / 備註
              </label>
              <input
                type="text"
                placeholder="例：準時出發恕不等候、車內禁食、後車廂可放大行李..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-base"
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
              已發布車輛與預約名單
            </h3>
            <button
              onClick={() => setDriverTab('create')}
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              新增另一部車
            </button>
          </div>

          {myOffers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-500">
              尚未發布任何車位，請切換至「登記提供車位」發布！
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
                          {offer.driverName} 的愛心車
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                          剩餘 {offer.availableSeats} / {offer.totalSeats} 位
                        </span>
                        {offer.returnTrip && (
                          <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                            去回雙程
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-700" />
                        {offer.departureCity}{offer.departureDistrict} - {offer.departurePoint}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (confirm(`確定要刪除 ${offer.driverName} 的這趟車次嗎？`)) {
                            onDeleteOffer(offer.id);
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        取消發布車位
                      </button>
                    </div>
                  </div>

                  {/* Passengers Section */}
                  <div>
                    <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-700" />
                      已預約搭乘同修 ({offer.passengers.reduce((acc, p) => acc + p.passengerCount, 0)} 人)
                    </h4>

                    {offer.passengers.length === 0 ? (
                      <p className="text-xs text-stone-400 bg-stone-50 p-3 rounded-xl">
                        目前尚無同修預約，車位開放中。
                      </p>
                    ) : (
                      <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden text-xs">
                        {offer.passengers.map((p) => (
                          <div key={p.id} className="p-3 bg-stone-50/50 flex items-center justify-between">
                            <div>
                              <div className="font-bold text-stone-800 flex items-center gap-2">
                                <span>{p.name}</span>
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold text-[11px]">
                                  {p.passengerCount} 位
                                </span>
                              </div>
                              <div className="text-stone-500 mt-0.5">
                                {p.pickupNote ? `備註：${p.pickupNote}` : '準時集合'}
                              </div>
                            </div>

                            <a
                              href={`tel:${p.phone}`}
                              className="flex items-center gap-1 text-amber-700 font-bold bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg border border-amber-200 cursor-pointer"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {p.phone}
                            </a>
                          </div>
                        ))}
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
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
            <strong>主動認領同修：</strong>以下為目前登記搭車需求但尚未配對成功的同修。若您的出發路線剛好順路，可選擇您的車次並點選「認領接送」！
          </div>

          {/* Select which car to match */}
          {myOffers.length > 0 && (
            <div className="bg-white p-3 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
              <span className="font-semibold text-stone-700 shrink-0">指派到我的車次：</span>
              <select
                value={selectedOfferForMatch}
                onChange={(e) => setSelectedOfferForMatch(e.target.value)}
                className="border border-stone-200 rounded-lg px-2.5 py-1.5 flex-1 font-medium text-stone-800 focus:outline-hidden focus:border-amber-500"
              >
                <option value="">-- 請選擇您的車輛 --</option>
                {myOffers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.driverName} ({o.departureCity}{o.departureDistrict}，剩餘 {o.availableSeats} 位)
                  </option>
                ))}
              </select>
            </div>
          )}

          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-500">
              目前沒有未媒合的需求同修，所有同修皆已順利安排！
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-xl border border-orange-200 p-4 shadow-xs space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm">{req.passengerName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold">
                        需求 {req.passengerCount} 位
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{req.pickupCity} {req.pickupDistrict} - {req.pickupPoint}</span>
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
