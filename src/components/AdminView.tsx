import React, { useState } from 'react';
import type { Event, CarpoolOffer, RideRequest } from '../types';
import {
  Users,
  Car,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  UserPlus,
  Phone,
  MapPin,
  Send
} from 'lucide-react';


interface AdminViewProps {
  currentEvent: Event;
  offers: CarpoolOffer[];
  requests: RideRequest[];
  onMatchRequestToOffer: (requestId: string, offerId: string) => boolean;
  onCreateOffer: (offer: Omit<CarpoolOffer, 'id' | 'createdAt' | 'passengers'>) => void;
  onCreateRequest: (request: Omit<RideRequest, 'id' | 'createdAt' | 'status'>) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentEvent,
  offers,
  requests,
  onMatchRequestToOffer,
  onCreateOffer,
  onCreateRequest,
}) => {
  const currentOffers = offers.filter((o) => o.eventId === currentEvent.id);
  const currentRequests = requests.filter((r) => r.eventId === currentEvent.id);
  const pendingRequests = currentRequests.filter((r) => r.status === 'pending');

  // Selected target offer for manual match
  const [selectedOfferMap, setSelectedOfferMap] = useState<{ [reqId: string]: string }>({});

  // Quick Phone Registration Modal for elderly members
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneType, setPhoneType] = useState<'need-ride' | 'offer-ride'>('need-ride');
  const [elderlyName, setElderlyName] = useState('');
  const [elderlyPhone, setElderlyPhone] = useState('');
  const [elderlyCity, setElderlyCity] = useState('新北市');
  const [elderlyDistrict, setElderlyDistrict] = useState('板橋區');
  const [elderlyPoint, setElderlyPoint] = useState('');
  const [elderlyCount, setElderlyCount] = useState(1);
  const [elderlyNotes, setElderlyNotes] = useState('');

  // Stats
  const totalCars = currentOffers.length;
  const totalCapacity = currentOffers.reduce((sum, o) => sum + o.totalSeats, 0);
  const remainingSeats = currentOffers.reduce((sum, o) => sum + o.availableSeats, 0);
  const totalPassengersMatched = currentOffers.reduce(
    (sum, o) => sum + o.passengers.reduce((pSum, p) => pSum + p.passengerCount, 0),
    0
  );
  const totalPendingPassengers = pendingRequests.reduce((sum, r) => sum + r.passengerCount, 0);

  const handleManualAssign = (requestId: string) => {
    const targetOfferId = selectedOfferMap[requestId];
    if (!targetOfferId) {
      alert('請先選擇要指派的車輛！');
      return;
    }
    const success = onMatchRequestToOffer(requestId, targetOfferId);
    if (success) {
      alert('配對成功！已將同修排入指定車輛。');
    } else {
      alert('該車次剩餘座位不足，無法排入！');
    }
  };

  const handleElderlySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!elderlyName.trim() || !elderlyPhone.trim() || !elderlyPoint.trim()) {
      alert('請填妥長輩大德姓名、電話與地點！');
      return;
    }

    if (phoneType === 'need-ride') {
      onCreateRequest({
        eventId: currentEvent.id,
        passengerName: `${elderlyName.trim()} (交通組代報)`,
        passengerPhone: elderlyPhone.trim(),
        pickupCity: elderlyCity,
        pickupDistrict: elderlyDistrict.trim(),
        pickupPoint: elderlyPoint.trim(),
        passengerCount: elderlyCount,
        notes: elderlyNotes.trim() ? `[代報] ${elderlyNotes.trim()}` : '[代報長輩登記]',
      });
      alert('已成功登記長輩搭乘需求！');
    } else {
      onCreateOffer({
        eventId: currentEvent.id,
        driverName: `${elderlyName.trim()} (交通組代報)`,
        driverPhone: elderlyPhone.trim(),
        departureCity: elderlyCity,
        departureDistrict: elderlyDistrict.trim(),
        departurePoint: elderlyPoint.trim(),
        departureTime: '07:30',
        returnTrip: true,
        returnTime: '16:30 法會圓滿返回',
        totalSeats: elderlyCount,
        availableSeats: elderlyCount,
        carModel: '自用車',
        notes: elderlyNotes.trim() || undefined,
      });
      alert('已成功登記長輩提供之車位！');
    }

    setIsPhoneModalOpen(false);
    setElderlyName('');
    setElderlyPhone('');
    setElderlyPoint('');
    setElderlyNotes('');
  };

  const handleExportCSV = () => {
    const rows = [
      ['法會活動', currentEvent.title],
      ['活動日期', currentEvent.date],
      ['法會地點', currentEvent.templeName],
      [''],
      ['車主姓名', '車主電話', '出發地點', '集合時間', '車型', '回程同行', '搭乘同修姓名', '同修電話', '搭乘人數', '上下車備註'],
    ];

    currentOffers.forEach((offer) => {
      if (offer.passengers.length === 0) {
        rows.push([
          offer.driverName,
          offer.driverPhone,
          `${offer.departureCity}${offer.departureDistrict} ${offer.departurePoint}`,
          offer.departureTime,
          offer.carModel,
          offer.returnTrip ? '是' : '否',
          '（尚無乘客）',
          '-',
          '0',
          '-',
        ]);
      } else {
        offer.passengers.forEach((p) => {
          rows.push([
            offer.driverName,
            offer.driverPhone,
            `${offer.departureCity}${offer.departureDistrict} ${offer.departurePoint}`,
            offer.departureTime,
            offer.carModel,
            offer.returnTrip ? '是' : '否',
            p.name,
            p.phone,
            p.passengerCount.toString(),
            p.pickupNote || '',
          ]);
        });
      }
    });

    const csvContent =
      '\uFEFF' + rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `法會共乘名冊_${currentEvent.title}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-stone-900 text-stone-100 p-5 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">交通組總調度看板</h2>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              義工專用管理視角
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            活動：{currentEvent.title} • 掌握車位供需、長輩代登記與車隊調度
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPhoneModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs md:text-sm font-semibold transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>代電話報名/長輩登記</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs md:text-sm font-semibold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>匯出名冊 CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs md:text-sm font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>列印名冊</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>登記愛心車輛</span>
            <Car className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2">
            {totalCars} <span className="text-xs font-normal text-stone-500">部</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            總承載量 {totalCapacity} 席
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>已成功媒合搭乘</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {totalPassengersMatched} <span className="text-xs font-normal text-stone-500">人</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">
            佔總容量 {totalCapacity > 0 ? Math.round((totalPassengersMatched / totalCapacity) * 100) : 0}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>全場剩餘空位</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">
            {remainingSeats} <span className="text-xs font-normal text-stone-500">席</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            尚可容納需求同修
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>待協調需求同修</span>
            <AlertCircle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600 mt-2">
            {totalPendingPassengers} <span className="text-xs font-normal text-stone-500">人</span>
          </div>
          <div className="text-[11px] text-orange-600/80 mt-1">
            {pendingRequests.length} 筆待調度
          </div>
        </div>
      </div>

      {/* Unmatched Requests Center */}
      <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-base md:text-lg font-bold text-stone-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              待協調與長輩需求名單 ({pendingRequests.length} 筆)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              尚未配對之同修，交通組可依地區指派至有空位的車輛。
            </p>
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-xs text-emerald-700 bg-emerald-50 p-4 rounded-xl text-center">
            🎉 太棒了！目前所有搭車需求均已全數媒合上車。
          </p>
        ) : (
          <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden text-xs">
            {pendingRequests.map((req) => {
              const eligibleOffers = currentOffers.filter(
                (o) => o.availableSeats >= req.passengerCount
              );

              return (
                <div
                  key={req.id}
                  className="p-3.5 bg-white hover:bg-stone-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900">
                        {req.passengerName}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-semibold text-[11px]">
                        需求 {req.passengerCount} 人
                      </span>
                      <span className="text-stone-400">電話：{req.passengerPhone}</span>
                    </div>

                    <div className="text-stone-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>
                        期望地點：<strong>{req.pickupCity} {req.pickupDistrict}</strong> - {req.pickupPoint}
                      </span>
                    </div>

                    {req.notes && (
                      <div className="text-stone-500 bg-stone-50 p-1.5 rounded text-[11px]">
                        備註：{req.notes}
                      </div>
                    )}
                  </div>

                  {/* Manual Assignment Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={selectedOfferMap[req.id] || ''}
                      onChange={(e) =>
                        setSelectedOfferMap((prev) => ({
                          ...prev,
                          [req.id]: e.target.value,
                        }))
                      }
                      className="border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-hidden focus:border-amber-500 max-w-[200px]"
                    >
                      <option value="">-- 選擇調度車次 --</option>
                      {eligibleOffers.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.driverName} ({o.departureDistrict}，餘 {o.availableSeats} 位)
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleManualAssign(req.id)}
                      disabled={!selectedOfferMap[req.id]}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer ${
                        selectedOfferMap[req.id]
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3 h-3" />
                      指派入席
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Fleet & Passenger Roster */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="text-base md:text-lg font-bold text-stone-900 flex items-center gap-2">
            <Car className="w-5 h-5 text-amber-700" />
            全場車輛與乘客對照調度名冊
          </h3>
          <span className="text-xs text-stone-500">已確認配對總覽</span>
        </div>

        <div className="space-y-4">
          {currentOffers.map((offer) => (
            <div
              key={offer.id}
              className="border border-stone-200 rounded-xl overflow-hidden text-xs"
            >
              {/* Driver Bar */}
              <div className="bg-stone-50 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-stone-900 text-sm">
                    🚗 {offer.driverName}
                  </span>
                  <a
                    href={`tel:${offer.driverPhone}`}
                    className="text-amber-700 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    {offer.driverPhone}
                  </a>
                  {offer.lineId && (
                    <span className="text-stone-500">LINE: {offer.lineId}</span>
                  )}
                  <span className="text-stone-400">|</span>
                  <span className="text-stone-600">
                    {offer.carColor || ''} {offer.carModel} {offer.plateNumber ? `[${offer.plateNumber}]` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-700 font-medium">
                    {offer.departureCity}{offer.departureDistrict} {offer.departurePoint} ({offer.departureTime})
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                    餘 {offer.availableSeats} / {offer.totalSeats} 位
                  </span>
                </div>
              </div>

              {/* Passengers Table */}
              <div className="p-3 bg-white">
                {offer.passengers.length === 0 ? (
                  <p className="text-stone-400 italic">尚無同修入席</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {offer.passengers.map((p) => (
                      <div
                        key={p.id}
                        className="bg-stone-50 border border-stone-200 p-2.5 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-stone-800 flex items-center gap-1.5">
                            <span>{p.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                              {p.passengerCount} 人
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            {p.pickupNote || '準時集合'}
                          </div>
                        </div>

                        <a
                          href={`tel:${p.phone}`}
                          className="text-stone-600 hover:text-amber-700"
                          title="撥打電話"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Elderly Phone Entry Modal */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  代長輩同修電話登記
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  接獲同修電話報名時，交通組義工可於此直接登打
                </p>
              </div>
              <button
                onClick={() => setIsPhoneModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleElderlySubmit} className="space-y-3.5 text-sm">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPhoneType('need-ride')}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs cursor-pointer ${
                    phoneType === 'need-ride'
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  登記搭乘需求（無車）
                </button>
                <button
                  type="button"
                  onClick={() => setPhoneType('offer-ride')}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs cursor-pointer ${
                    phoneType === 'offer-ride'
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  登記提供車位（有車）
                </button>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1 text-xs">
                  同修姓名 / 法名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例：陳菩薩 (由交通組代錄)"
                  value={elderlyName}
                  onChange={(e) => setElderlyName(e.target.value)}
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
                  placeholder="例：0911-222-333 或 市話"
                  value={elderlyPhone}
                  onChange={(e) => setElderlyPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-medium mb-1 text-xs">
                    縣市 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={elderlyCity}
                    onChange={(e) => setElderlyCity(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="新北市">新北市</option>
                    <option value="台北市">台北市</option>
                    <option value="桃園市">桃園市</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1 text-xs">
                    行政區 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例：板橋區"
                    value={elderlyDistrict}
                    onChange={(e) => setElderlyDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1 text-xs">
                  地點詳細說明 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例：捷運府中站 1 號出口"
                  value={elderlyPoint}
                  onChange={(e) => setElderlyPoint(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1 text-xs">
                  {phoneType === 'need-ride' ? '需要搭乘人數' : '可提供空位數'}
                </label>
                <select
                  value={elderlyCount}
                  onChange={(e) => setElderlyCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} 位
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1 text-xs">
                  備註
                </label>
                <input
                  type="text"
                  placeholder="例：年長行動不便、需攜帶助行器..."
                  value={elderlyNotes}
                  onChange={(e) => setElderlyNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPhoneModalOpen(false)}
                  className="flex-1 py-2.5 border border-stone-200 rounded-xl text-stone-600 font-medium hover:bg-stone-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  確認儲存登記
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
