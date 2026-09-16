import React, { useState } from 'react';
import type { Event, CarpoolOffer, RideRequest, ParticipantRole } from '../types';
import { EAST_COAST_AREAS } from '../data/mockData';
import {
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
  onMatchRequestToOffer: (requestId: string, offerId: string, leg: 'outbound' | 'return' | 'both') => boolean;
  onCreateOffer: (offer: Omit<CarpoolOffer, 'id' | 'createdAt' | 'outboundPassengers' | 'returnPassengers'>) => void;
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

  const handleManualAssign = (requestId: string) => {
    const targetOfferId = selectedOfferMap[requestId];
    const targetLeg = selectedLegMap[requestId] || 'both';

    if (!targetOfferId) {
      alert('請先選擇要指派的車輛！');
      return;
    }
    const success = onMatchRequestToOffer(requestId, targetOfferId, targetLeg);
    if (success) {
      alert('指派成功！已將同修排入指定車次名冊。');
    } else {
      alert('該車次在指定行程的剩餘座位不足，無法排入！');
    }
  };

  const handleElderlySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!elderlyName.trim() || !elderlyPhone.trim() || !elderlyPoint.trim()) {
      alert('請填妥長輩大德姓名、電話與集合地點！');
      return;
    }

    if (phoneType === 'need-ride') {
      onCreateRequest({
        eventId: currentEvent.id,
        passengerName: `${elderlyName.trim()} (交通組代報)`,
        passengerPhone: elderlyPhone.trim(),
        wechatOrLine: elderlyWechat.trim() || undefined,
        pickupArea: elderlyArea,
        pickupPoint: elderlyPoint.trim(),
        passengerCount: elderlyCount,
        needOutbound: true,
        outboundRole: elderlyOutboundRole,
        needReturn: true,
        returnRole: elderlyReturnRole,
        notes: elderlyNotes.trim() ? `[代報] ${elderlyNotes.trim()}` : '[交通組電話代錄]',
      });
      alert('已成功登記長輩搭乘需求！');
    } else {
      onCreateOffer({
        eventId: currentEvent.id,
        driverName: `${elderlyName.trim()} (交通組代報)`,
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
        returnTime: elderlyReturnRole === 'volunteer' ? '18:00 義工善後' : '16:30 正行回',
        returnMode: elderlyReturnRole,
        returnTotalSeats: elderlyCount,
        returnAvailableSeats: elderlyCount,
      });
      alert('已成功登記發心車位！');
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
      ['活動日期', currentEvent.date],
      ['活動地點', `${currentEvent.templeName} (${currentEvent.location})`],
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
        '同修乘客姓名',
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
    link.setAttribute('download', `空山寺中秋法會共乘名冊.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-stone-900 text-stone-100 p-5 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-black tracking-tight">空山寺交通組調度中樞</h2>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              美東總調度
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            活動：{currentEvent.title} • 寺址：174 Hynes RD, Poughquag, NY 12570
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPhoneModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>代長輩電話登記</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>匯出名冊 CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>列印當日名冊</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>登記發心車輛</span>
            <Car className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-black text-stone-900 mt-1">
            {totalCars} <span className="text-xs font-normal text-stone-500">部</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">
            服務法拉盛/布魯克林/NJ
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>去程 (上山入席)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {outboundMatched} / {outboundCapacity} <span className="text-xs font-normal text-stone-500">人</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5 font-semibold">
            入席率 {outboundCapacity > 0 ? Math.round((outboundMatched / outboundCapacity) * 100) : 0}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>回程 (返市區入席)</span>
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800 mt-1">
            {returnMatched} / {returnCapacity} <span className="text-xs font-normal text-stone-500">人</span>
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5 font-semibold">
            入席率 {returnCapacity > 0 ? Math.round((returnMatched / returnCapacity) * 100) : 0}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>待安排需求同修</span>
            <AlertCircle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-black text-orange-600 mt-1">
            {totalPendingPassengers} <span className="text-xs font-normal text-stone-500">人</span>
          </div>
          <div className="text-[11px] text-orange-700 mt-0.5 font-semibold">
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
              待協調同修名冊 ({pendingRequests.length} 筆)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              尚未配對之同修，交通組可依其「義工早到」或「正行」需求，分開指派去程或回程！
            </p>
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-xs text-emerald-700 bg-emerald-50 p-4 rounded-xl text-center font-bold">
            🎉 太棒了！目前所有大眾的去程與回程需求均已全數圓滿媒合。
          </p>
        ) : (
          <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden text-xs">
            {pendingRequests.map((req) => {
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
                      <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-bold text-[11px]">
                        需求 {req.passengerCount} 位
                      </span>
                      <span className="text-stone-400">電話：{req.passengerPhone}</span>
                      {req.wechatOrLine && (
                        <span className="text-stone-400">微信：{req.wechatOrLine}</span>
                      )}
                    </div>

                    <div className="text-stone-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>
                        期望地點：<strong>{req.pickupArea}</strong> - {req.pickupPoint}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-0.5 text-[11px]">
                      {req.needOutbound && (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                          去程需求：{req.outboundRole === 'volunteer' ? '義工車 (08:00前早到)' : '正行車'}
                        </span>
                      )}
                      {req.needReturn && (
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200 font-bold">
                          回程需求：{req.returnRole === 'volunteer' ? '義工車 (善後賦歸)' : '正行車 (16:30即回)'}
                        </span>
                      )}
                    </div>

                    {req.notes && (
                      <div className="text-stone-500 bg-stone-50 p-1.5 rounded text-[11px]">
                        備註：{req.notes}
                      </div>
                    )}
                  </div>

                  {/* Manual Assignment Controls */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
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
                      <option value="">-- 選擇愛心車輛 --</option>
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
                      className="border border-stone-200 rounded-lg px-2 py-1.5 text-xs text-stone-800 font-semibold"
                    >
                      <option value="both">指派去回雙程</option>
                      <option value="outbound">僅指派去程</option>
                      <option value="return">僅指派回程</option>
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

      {/* Fleet & Passenger Roster by Vehicle */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="text-base md:text-lg font-bold text-stone-900 flex items-center gap-2">
            <Car className="w-5 h-5 text-amber-700" />
            全場車隊去回程入席調度名冊
          </h3>
          <span className="text-xs text-stone-500">空山寺中秋法會 (174 Hynes RD, Poughquag, NY)</span>
        </div>

        <div className="space-y-4">
          {currentOffers.map((offer) => (
            <div
              key={offer.id}
              className="border border-stone-200 rounded-xl overflow-hidden text-xs shadow-2xs"
            >
              {/* Driver Bar */}
              <div className="bg-stone-50 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-stone-900 text-sm">
                    🚗 {offer.driverName}
                  </span>
                  <a
                    href={`tel:${offer.driverPhone}`}
                    className="text-amber-700 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    {offer.driverPhone}
                  </a>
                  {offer.wechatOrLine && (
                    <span className="text-stone-500">微信: {offer.wechatOrLine}</span>
                  )}
                  <span className="text-stone-400">|</span>
                  <span className="text-stone-600">
                    {offer.carColor || ''} {offer.carModel} {offer.plateNumber ? `[${offer.plateNumber}]` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2.5 py-0.5 rounded bg-white border border-stone-200 text-stone-800 font-bold">
                    📍 {offer.departureArea} ({offer.departurePoint})
                  </span>
                </div>
              </div>

              {/* Legs comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-100 bg-white">
                {/* Outbound column */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-stone-100">
                    <span className="font-bold text-amber-950 flex items-center gap-1">
                      🚙 去程前往空山寺 ({offer.outboundTime})
                    </span>
                    <span className="font-bold text-amber-800 text-[11px]">
                      已排 {offer.outboundPassengers.reduce((sum, p) => sum + p.passengerCount, 0)} / {offer.outboundTotalSeats} 席
                    </span>
                  </div>

                  {offer.outboundPassengers.length === 0 ? (
                    <p className="text-stone-400 italic py-1 text-[11px]">尚無去程同修</p>
                  ) : (
                    <div className="space-y-1.5">
                      {offer.outboundPassengers.map((p) => (
                        <div key={p.id} className="bg-stone-50 p-2 rounded-lg flex items-center justify-between">
                          <div>
                            <div className="font-bold text-stone-800 flex items-center gap-1">
                              <span>{p.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                                {p.passengerCount} 人
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                p.role === 'volunteer' ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {p.role === 'volunteer' ? '義工早車' : '正行'}
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-400 mt-0.5">
                              {p.pickupNote || '準時集合'}
                            </div>
                          </div>
                          <a href={`tel:${p.phone}`} className="text-stone-600 hover:text-amber-700">
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Return column */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-stone-100">
                    <span className="font-bold text-stone-800 flex items-center gap-1">
                      🚗 回程返市區 ({offer.returnTime})
                    </span>
                    <span className="font-bold text-emerald-700 text-[11px]">
                      已排 {offer.returnPassengers.reduce((sum, p) => sum + p.passengerCount, 0)} / {offer.returnTotalSeats} 席
                    </span>
                  </div>

                  {offer.returnPassengers.length === 0 ? (
                    <p className="text-stone-400 italic py-1 text-[11px]">尚無回程同修</p>
                  ) : (
                    <div className="space-y-1.5">
                      {offer.returnPassengers.map((p) => (
                        <div key={p.id} className="bg-stone-50 p-2 rounded-lg flex items-center justify-between">
                          <div>
                            <div className="font-bold text-stone-800 flex items-center gap-1">
                              <span>{p.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                                {p.passengerCount} 人
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                p.role === 'volunteer' ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {p.role === 'volunteer' ? '義工晚歸' : '正行即回'}
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-400 mt-0.5">
                              {p.pickupNote || '準時集合'}
                            </div>
                          </div>
                          <a href={`tel:${p.phone}`} className="text-stone-600 hover:text-amber-700">
                            <Phone className="w-3.5 h-3.5" />
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  代長輩同修電話登記
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  接獲同修電話報名時，交通組義工可直接在此登打
                </p>
              </div>
              <button
                onClick={() => setIsPhoneModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleElderlySubmit} className="space-y-3.5 text-xs md:text-sm">
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
                <label className="block text-stone-700 font-semibold mb-1 text-xs">
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1 text-xs">
                    美東電話 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="例：917-000-1111"
                    value={elderlyPhone}
                    onChange={(e) => setElderlyPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1 text-xs">
                    微信 (選填)
                  </label>
                  <input
                    type="text"
                    placeholder="微信 ID"
                    value={elderlyWechat}
                    onChange={(e) => setElderlyWechat(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1 text-xs">
                    區域 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={elderlyArea}
                    onChange={(e) => setElderlyArea(e.target.value)}
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
                  <label className="block text-stone-700 font-semibold mb-1 text-xs">
                    人數 <span className="text-red-500">*</span>
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
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 text-xs">
                  詳細集合地點說明 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例：法拉盛緬街圖書館前、孔子大廈門口..."
                  value={elderlyPoint}
                  onChange={(e) => setElderlyPoint(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1 text-xs">
                    去程身份
                  </label>
                  <select
                    value={elderlyOutboundRole}
                    onChange={(e) => setElderlyOutboundRole(e.target.value as ParticipantRole)}
                    className="w-full px-2 py-1.5 border border-stone-300 rounded text-xs"
                  >
                    <option value="volunteer">義工組（早到出坡）</option>
                    <option value="attendee">正行組（參讚法會）</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1 text-xs">
                    回程身份
                  </label>
                  <select
                    value={elderlyReturnRole}
                    onChange={(e) => setElderlyReturnRole(e.target.value as ParticipantRole)}
                    className="w-full px-2 py-1.5 border border-stone-300 rounded text-xs"
                  >
                    <option value="attendee">正行組（法會後即回）</option>
                    <option value="volunteer">義工組（善後圓滿回）</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 text-xs">
                  備註
                </label>
                <input
                  type="text"
                  placeholder="例：年長行動緩慢、需搭乘平穩轎車..."
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
                  確認登記
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
