import React, { useState } from 'react';
import type { Event, CarpoolOffer, RideRequest } from '../types';
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
  Info
} from 'lucide-react';


interface PassengerViewProps {
  currentEvent: Event;
  offers: CarpoolOffer[];
  requests: RideRequest[];
  onBookSeat: (offerId: string, passengerName: string, passengerPhone: string, count: number, note: string) => boolean;
  onCreateRequest: (request: Omit<RideRequest, 'id' | 'createdAt' | 'status'>) => void;
}

export const PassengerView: React.FC<PassengerViewProps> = ({
  currentEvent,
  offers,
  requests,
  onBookSeat,
  onCreateRequest,
}) => {
  const pendingRequestsCount = requests.filter(
    (r) => r.eventId === currentEvent.id && r.status === 'pending'
  ).length;
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  
  // Booking modal state
  const [bookingOffer, setBookingOffer] = useState<CarpoolOffer | null>(null);

  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [seatCount, setSeatCount] = useState(1);
  const [pickupNote, setPickupNote] = useState('');
  const [bookingSuccessInfo, setBookingSuccessInfo] = useState<{
    driverName: string;
    driverPhone: string;
    departurePoint: string;
    departureTime: string;
    carModel: string;
  } | null>(null);

  // Request modal state (when no cars match)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqName, setReqName] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqCity, setReqCity] = useState('新北市');
  const [reqDistrict, setReqDistrict] = useState('');
  const [reqPoint, setReqPoint] = useState('');
  const [reqCount, setReqCount] = useState(1);
  const [reqNotes, setReqNotes] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Filter offers
  const filteredOffers = offers.filter((offer) => {
    if (offer.eventId !== currentEvent.id) return false;
    if (selectedCity !== 'all' && offer.departureCity !== selectedCity) return false;
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      const matchSpot = offer.departurePoint.toLowerCase().includes(kw);
      const matchDistrict = offer.departureDistrict.toLowerCase().includes(kw);
      const matchDriver = offer.driverName.toLowerCase().includes(kw);
      if (!matchSpot && !matchDistrict && !matchDriver) return false;
    }
    return true;
  });

  const handleOpenBooking = (offer: CarpoolOffer) => {
    setBookingOffer(offer);
    setPassengerName('');
    setPassengerPhone('');
    setSeatCount(1);
    setPickupNote('');
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingOffer) return;
    if (!passengerName.trim() || !passengerPhone.trim()) {
      alert('請填寫搭乘者稱呼與聯絡電話');
      return;
    }

    const success = onBookSeat(
      bookingOffer.id,
      passengerName.trim(),
      passengerPhone.trim(),
      seatCount,
      pickupNote.trim()
    );

    if (success) {
      setBookingSuccessInfo({
        driverName: bookingOffer.driverName,
        driverPhone: bookingOffer.driverPhone,
        departurePoint: `${bookingOffer.departureCity}${bookingOffer.departureDistrict} - ${bookingOffer.departurePoint}`,
        departureTime: bookingOffer.departureTime,
        carModel: `${bookingOffer.carColor || ''} ${bookingOffer.carModel}`,
      });
      setBookingOffer(null);
    } else {
      alert('該車次剩餘座位不足，請選擇其他車次。');
    }
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName.trim() || !reqPhone.trim() || !reqDistrict.trim()) {
      alert('請填寫完整稱呼、電話與希望上車地區');
      return;
    }

    onCreateRequest({
      eventId: currentEvent.id,
      passengerName: reqName.trim(),
      passengerPhone: reqPhone.trim(),
      pickupCity: reqCity,
      pickupDistrict: reqDistrict.trim(),
      pickupPoint: reqPoint.trim() || '配合車主鄰近地點',
      passengerCount: reqCount,
      notes: reqNotes.trim(),
    });

    setRequestSubmitted(true);
    setTimeout(() => {
      setRequestSubmitted(false);
      setIsRequestModalOpen(false);
      setReqName('');
      setReqPhone('');
      setReqDistrict('');
      setReqPoint('');
      setReqCount(1);
      setReqNotes('');
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Event Info Card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100/90 text-amber-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              當期法會活動
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-stone-900 tracking-tight">
              {currentEvent.title}
            </h2>
            <p className="text-sm text-stone-600 font-medium">{currentEvent.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2 text-xs md:text-sm text-stone-700 bg-white/80 p-3 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
              <span><strong>日期：</strong>{currentEvent.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <span><strong>集結：</strong>{currentEvent.assemblyTime}</span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2 md:col-span-1">
              <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
              <span><strong>地點：</strong>{currentEvent.templeName} ({currentEvent.location})</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-start gap-2 text-xs text-amber-900/80">
          <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <span>溫馨提醒：本共乘平台純屬同修義工互助發心結緣，不收取任何車資費用。請準時至集合點等候，感恩您的配合！</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* City Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: '全部區域' },
            { id: '新北市', label: '新北市' },
            { id: '台北市', label: '台北市' },
            { id: '桃園市', label: '桃園市' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedCity(item.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all cursor-pointer ${
                selectedCity === item.id
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Input and Request Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="搜尋捷運站或地名..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-white pl-9 pr-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-900 text-xs md:text-sm font-semibold transition-colors cursor-pointer shrink-0 border border-orange-200"
          >
            <PlusCircle className="w-4 h-4 text-orange-700" />
            <span>登記共乘需求 {pendingRequestsCount > 0 && `(${pendingRequestsCount})`}</span>
          </button>
        </div>
      </div>

      {/* Available Rides List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base md:text-lg text-stone-800 flex items-center gap-2">
            <Car className="w-5 h-5 text-amber-700" />
            目前可搭乘愛心車輛
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
              共 {filteredOffers.length} 部車
            </span>
          </h3>
          <span className="text-xs text-stone-500">點擊「預約搭車」即可完成登記</span>
        </div>

        {filteredOffers.length === 0 ? (
          <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Car className="w-6 h-6" />
            </div>
            <p className="text-stone-700 font-medium">該區域目前暫無開放中的車位</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              您可以點擊下方按鈕登記您的搭乘需求，交通組義工或順路的車主看到後會主動為您協調媒合！
            </p>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              登記我的搭乘需求
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOffers.map((offer) => {
              const isFull = offer.availableSeats <= 0;
              return (
                <div
                  key={offer.id}
                  className={`bg-white rounded-2xl border transition-all shadow-xs hover:shadow-md flex flex-col justify-between ${
                    isFull ? 'border-stone-200 opacity-80' : 'border-amber-200/90'
                  }`}
                >
                  <div className="p-4 space-y-3">
                    {/* Card Top: Location & Time Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-stone-500">
                          <span className="px-2 py-0.5 rounded bg-stone-100 font-medium text-stone-700">
                            {offer.departureCity} {offer.departureDistrict}
                          </span>
                          {offer.returnTrip ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60">
                              去回雙程
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                              僅去程
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-stone-900 mt-1 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                          {offer.departurePoint}
                        </h4>
                      </div>

                      {/* Seats Badge */}
                      <div
                        className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold text-center border ${
                          isFull
                            ? 'bg-stone-100 text-stone-500 border-stone-200'
                            : 'bg-amber-50 text-amber-900 border-amber-300'
                        }`}
                      >
                        {isFull ? (
                          <span>已額滿</span>
                        ) : (
                          <>
                            <div className="text-lg leading-none font-extrabold text-amber-700">
                              {offer.availableSeats}
                            </div>
                            <div className="scale-85 text-[10px] text-amber-800">剩餘空位</div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Schedule & Vehicle */}
                    <div className="bg-stone-50/80 rounded-xl p-2.5 text-xs text-stone-700 space-y-1.5 border border-stone-100">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                        <span><strong>出發時間：</strong>{offer.departureTime} 集合準時出發</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                        <span>
                          <strong>車輛資訊：</strong>
                          {offer.carColor || ''} {offer.carModel}
                          {offer.plateNumber ? ` (${offer.plateNumber})` : ''}
                        </span>
                      </div>
                      {offer.returnTrip && offer.returnTime && (
                        <div className="text-stone-500 pl-5">
                          回程：{offer.returnTime}
                        </div>
                      )}
                    </div>

                    {/* Driver & Notes */}
                    <div className="text-xs text-stone-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-800 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                          車主：{offer.driverName}
                        </span>
                        <span className="text-[11px] text-stone-400">總座位 {offer.totalSeats} 席</span>
                      </div>
                      {offer.notes && (
                        <p className="text-stone-500 bg-amber-50/50 p-2 rounded-lg border border-amber-100/50">
                          {offer.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Action Button */}
                  <div className="p-3 bg-stone-50 border-t border-stone-100 rounded-b-2xl">
                    <button
                      disabled={isFull}
                      onClick={() => handleOpenBooking(offer)}
                      className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isFull
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                      }`}
                    >
                      {isFull ? (
                        <span>座位已滿（可登記候補或另選車輛）</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>預約搭乘此車（尚餘 {offer.availableSeats} 位）</span>
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-stone-100 pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-900">
                  預約搭乘確認
                </h3>
                <button
                  onClick={() => setBookingOffer(null)}
                  className="text-stone-400 hover:text-stone-600 text-xl font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                車主：{bookingOffer.driverName} • 出發地：{bookingOffer.departureCity}{bookingOffer.departureDistrict}
              </p>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-3.5 text-sm">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-xs text-amber-900 space-y-1">
                <div><strong>出發時間：</strong>{bookingOffer.departureTime}</div>
                <div><strong>集合地點：</strong>{bookingOffer.departurePoint}</div>
                <div><strong>剩餘座位：</strong>{bookingOffer.availableSeats} 位</div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1 text-xs">
                  搭乘者姓名 / 法名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例：陳大德 或 妙音居士"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1 text-xs">
                  聯絡電話 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="例：0912-345-678"
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  電話僅供車主行前聯繫集合事宜，不對外公開。
                </p>
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
                  {Array.from({ length: Math.min(bookingOffer.availableSeats, 4) }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} 位
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1 text-xs">
                  備註說明 (選填)
                </label>
                <input
                  type="text"
                  placeholder="例：有長輩行動稍緩、需自備輪椅等..."
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
                  確認預約
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Success Confirmation Modal */}
      {bookingSuccessInfo && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-100 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-stone-900">預約成功！阿彌陀佛</h3>
              <p className="text-xs text-stone-500 mt-1">
                已為您保留車位，請記下車主聯絡資訊以便行前聯繫
              </p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-left space-y-2 text-xs md:text-sm">
              <div className="flex items-center justify-between border-b border-amber-200/50 pb-2">
                <span className="text-stone-500">車主姓名</span>
                <span className="font-bold text-stone-800">{bookingSuccessInfo.driverName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-amber-200/50 pb-2">
                <span className="text-stone-500">車主電話</span>
                <a
                  href={`tel:${bookingSuccessInfo.driverPhone}`}
                  className="font-bold text-amber-700 flex items-center gap-1 underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {bookingSuccessInfo.driverPhone}
                </a>
              </div>
              <div className="flex items-center justify-between border-b border-amber-200/50 pb-2">
                <span className="text-stone-500">集合時間</span>
                <span className="font-bold text-stone-800">{bookingSuccessInfo.departureTime} 集合</span>
              </div>
              <div className="flex items-center justify-between border-b border-amber-200/50 pb-2">
                <span className="text-stone-500">集合地點</span>
                <span className="font-bold text-stone-800 text-right">{bookingSuccessInfo.departurePoint}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">搭乘車款</span>
                <span className="font-medium text-stone-700">{bookingSuccessInfo.carModel}</span>
              </div>
            </div>

            <button
              onClick={() => setBookingSuccessInfo(null)}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
            >
              我知道了，感謝同修成就
            </button>
          </div>
        </div>
      )}

      {/* Request Modal (When no suitable ride found) */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  登記共乘需求
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
                <h4 className="text-base font-bold text-stone-800">登記成功！</h4>
                <p className="text-xs text-stone-500">
                  您的需求已送至交通組媒合看板，一旦有車主接送將電話通知您。
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="space-y-3.5 text-sm">
                <div>
                  <label className="block text-stone-700 font-medium mb-1 text-xs">
                    您的姓名 / 法名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例：林大德 或 蓮池居士"
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
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
                    placeholder="例：0987-654-321"
                    value={reqPhone}
                    onChange={(e) => setReqPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-700 font-medium mb-1 text-xs">
                      期望上車縣市 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={reqCity}
                      onChange={(e) => setReqCity(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                    >
                      <option value="新北市">新北市</option>
                      <option value="台北市">台北市</option>
                      <option value="桃園市">桃園市</option>
                      <option value="基隆市">基隆市</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1 text-xs">
                      行政區 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="例：三峽區、板橋區"
                      value={reqDistrict}
                      onChange={(e) => setReqDistrict(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1 text-xs">
                    期望上車地點或捷運站
                  </label>
                  <input
                    type="text"
                    placeholder="例：永寧捷運站 2 號出口 或 恩主公醫院前"
                    value={reqPoint}
                    onChange={(e) => setReqPoint(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1 text-xs">
                    需要座位數 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reqCount}
                    onChange={(e) => setReqCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                  >
                    <option value={1}>1 位</option>
                    <option value={2}>2 位</option>
                    <option value={3}>3 位</option>
                    <option value={4}>4 位</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1 text-xs">
                    補充備註 (選填)
                  </label>
                  <input
                    type="text"
                    placeholder="例：行動稍微不便、可配合提早出發..."
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
