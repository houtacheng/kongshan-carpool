import React, { useState } from 'react';
import type { Event, CarpoolOffer, RideRequest } from '../types';
import { EAST_COAST_AREAS } from '../data/mockData';
import { useLanguage } from '../i18n/LanguageContext';
import { getLocalizedArea } from '../i18n/translations';
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
  UserPlus,
  Edit3,
  CheckCircle2
} from 'lucide-react';

interface DriverViewProps {
  currentEvent: Event;
  offers: CarpoolOffer[];
  requests: RideRequest[];
  onCreateOffer: (offer: Omit<CarpoolOffer, 'id' | 'createdAt' | 'outboundPassengers' | 'returnPassengers'>) => void;
  onDeleteOffer: (offerId: string) => void;
  onUpdateOffer?: (offer: CarpoolOffer) => void;
  onMatchRequestToOffer: (requestId: string, offerId: string, leg: 'outbound' | 'return' | 'both') => boolean;
}

export const DriverView: React.FC<DriverViewProps> = ({
  currentEvent,
  offers,
  requests,
  onCreateOffer,
  onDeleteOffer,
  onUpdateOffer,
  onMatchRequestToOffer,
}) => {
  const { t, language } = useLanguage();
  const [driverTab, setDriverTab] = useState<'create' | 'my-cars' | 'pending-requests'>('create');

  // Form states
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [wechatOrLine, setWechatOrLine] = useState('');
  const [departureArea, setDepartureArea] = useState('法拉盛 Flushing (NY)');
  const [departurePoint, setDeparturePoint] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carColor, setCarColor] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Edit Offer Modal states
  const [editingOffer, setEditingOffer] = useState<CarpoolOffer | null>(null);
  const [editDriverName, setEditDriverName] = useState('');
  const [editDriverPhone, setEditDriverPhone] = useState('');
  const [editWechat, setEditWechat] = useState('');
  const [editArea, setEditArea] = useState('法拉盛 Flushing (NY)');
  const [editPoint, setEditPoint] = useState('');
  const [editCarModel, setEditCarModel] = useState('');
  const [editCarColor, setEditCarColor] = useState('');
  const [editPlateNumber, setEditPlateNumber] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editHasOutbound, setEditHasOutbound] = useState(true);
  const [editOutboundTime, setEditOutboundTime] = useState('');
  const [editOutboundMode, setEditOutboundMode] = useState<'volunteer' | 'attendee' | 'both'>('volunteer');
  const [editOutboundTotalSeats, setEditOutboundTotalSeats] = useState(4);
  const [editHasReturn, setEditHasReturn] = useState(true);
  const [editReturnTime, setEditReturnTime] = useState('');
  const [editReturnMode, setEditReturnMode] = useState<'volunteer' | 'attendee' | 'both'>('volunteer');
  const [editReturnTotalSeats, setEditReturnTotalSeats] = useState(4);
  const [editOfferSuccess, setEditOfferSuccess] = useState('');

  const handleOpenEditOffer = (offer: CarpoolOffer) => {
    setEditingOffer(offer);
    setEditDriverName(offer.driverName);
    setEditDriverPhone(offer.driverPhone);
    setEditWechat(offer.wechatOrLine || '');
    setEditArea(offer.departureArea);
    setEditPoint(offer.departurePoint);
    setEditCarModel(offer.carModel);
    setEditCarColor(offer.carColor || '');
    setEditPlateNumber(offer.plateNumber || '');
    setEditNotes(offer.notes || '');
    setEditHasOutbound(offer.hasOutbound);
    setEditOutboundTime(offer.outboundTime);
    setEditOutboundMode(offer.outboundMode);
    setEditOutboundTotalSeats(offer.outboundTotalSeats);
    setEditHasReturn(offer.hasReturn);
    setEditReturnTime(offer.returnTime);
    setEditReturnMode(offer.returnMode);
    setEditReturnTotalSeats(offer.returnTotalSeats);
    setEditOfferSuccess('');
  };

  const handleSaveEditOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer || !onUpdateOffer) return;

    const outPassCount = editingOffer.outboundPassengers.reduce((sum, p) => sum + p.passengerCount, 0);
    const retPassCount = editingOffer.returnPassengers.reduce((sum, p) => sum + p.passengerCount, 0);

    const updated: CarpoolOffer = {
      ...editingOffer,
      driverName: editDriverName.trim(),
      driverPhone: editDriverPhone.trim(),
      wechatOrLine: editWechat.trim(),
      departureArea: editArea,
      departurePoint: editPoint.trim(),
      carModel: editCarModel.trim(),
      carColor: editCarColor.trim(),
      plateNumber: editPlateNumber.trim(),
      notes: editNotes.trim(),
      hasOutbound: editHasOutbound,
      outboundTime: editOutboundTime.trim(),
      outboundMode: editOutboundMode,
      outboundTotalSeats: editOutboundTotalSeats,
      outboundAvailableSeats: Math.max(0, editOutboundTotalSeats - outPassCount),
      hasReturn: editHasReturn,
      returnTime: editReturnTime.trim(),
      returnMode: editReturnMode,
      returnTotalSeats: editReturnTotalSeats,
      returnAvailableSeats: Math.max(0, editReturnTotalSeats - retPassCount)
    };

    onUpdateOffer(updated);
    setEditOfferSuccess(t.updateSuccess);
    setTimeout(() => {
      setEditingOffer(null);
      setEditOfferSuccess('');
    }, 1200);
  };

  // Outbound configs
  const [hasOutbound, setHasOutbound] = useState(true);
  const [outboundTime, setOutboundTime] = useState(language === 'en' ? '06:30 AM (approx 07:50 arrival)' : '06:30 出發 (約 07:50 抵達)');
  const [outboundMode, setOutboundMode] = useState<'volunteer' | 'attendee' | 'both'>('volunteer');
  const [outboundTotalSeats, setOutboundTotalSeats] = useState(4);

  // Return configs
  const [hasReturn, setHasReturn] = useState(true);
  const [returnTime, setReturnTime] = useState(language === 'en' ? '16:30 After event' : '16:30 活動結束後返回');
  const [returnMode, setReturnMode] = useState<'volunteer' | 'attendee' | 'both'>('volunteer');
  const [returnTotalSeats, setReturnTotalSeats] = useState(4);

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [selectedOfferForMatch, setSelectedOfferForMatch] = useState<string>('');
  const [matchLegChoice, setMatchLegChoice] = useState<'outbound' | 'return' | 'both'>('both');

  const myOffers = offers.filter((o) => o.eventId === currentEvent.id);
  const pendingRequests = requests.filter((r) => r.eventId === currentEvent.id && r.status !== 'matched_full');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim() || !driverPhone.trim() || !departurePoint.trim()) {
      alert(language === 'en' ? 'Please fill in driver name, contact phone, and pickup location!' : '請填寫完整車主稱呼、聯絡電話與集合地點！');
      return;
    }
    if (!hasOutbound && !hasReturn) {
      alert(language === 'en' ? 'Please provide seats for at least outbound or return trip!' : '請至少提供「去程」或「回程」車位！');
      return;
    }

    onCreateOffer({
      eventId: currentEvent.id,
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      wechatOrLine: wechatOrLine.trim() || undefined,
      departureArea,
      departurePoint: departurePoint.trim(),
      carModel: carModel.trim() || (language === 'en' ? 'Standard Vehicle' : '自用轎車'),
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
      alert(language === 'en' ? 'Please select your vehicle to assign first!' : '請先選擇您要指派的車輛！');
      return;
    }
    const success = onMatchRequestToOffer(requestId, selectedOfferForMatch, matchLegChoice);
    if (success) {
      alert(language === 'en' ? 'Successfully claimed passenger! Thank you for your support!' : '已成功認領並安排乘客上車！感謝您的熱心協助！');
    } else {
      alert(language === 'en' ? 'Selected vehicle does not have enough remaining seats for this trip.' : '該車次在所選行程的剩餘座位不足，無法排入。');
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
              {t.driverHeroTitle}
            </h2>
            <p className="text-xs md:text-sm text-amber-100/90 mt-1.5 leading-relaxed font-medium">
              {t.driverHeroDesc}
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
          <span>{t.tabOfferSeats}</span>
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
          <span>{t.tabMyCars} ({myOffers.length})</span>
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
          <span>{t.tabClaimPassengers} ({pendingRequests.length})</span>
        </button>
      </div>

      {/* Tab 1: Create Carpool Offer */}
      {driverTab === 'create' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-7 shadow-xs max-w-2xl mx-auto">
          <div className="border-b border-stone-200 pb-3.5 mb-4">
            <h3 className="text-xl md:text-2xl font-black text-stone-900 flex items-center gap-2">
              <Car className="w-6 h-6 text-amber-700" />
              {t.driverFormHeader}
            </h3>
            <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
              {t.driverFormEventDate.replace('{title}', currentEvent.title).replace('{date}', currentEvent.date)}
            </p>
          </div>

          {showSuccessToast && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2.5 text-sm font-bold">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>{t.offerSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm md:text-base">
            {/* Driver Identity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                  {t.driverNameLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.driverNamePlaceholder}
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                  {t.driverPhoneLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder={t.driverPhonePlaceholder}
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                  {t.driverContactLabel}
                </label>
                <input
                  type="text"
                  placeholder={t.driverWhatsappPlaceholder}
                  value={wechatOrLine}
                  onChange={(e) => setWechatOrLine(e.target.value)}
                  className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                  {t.driverAreaLabel} <span className="text-red-500">*</span>
                </label>
                <select
                  value={departureArea}
                  onChange={(e) => setDepartureArea(e.target.value)}
                  className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500 font-bold"
                >
                  {EAST_COAST_AREAS.filter((a) => a !== '全美東區域').map((a) => (
                    <option key={a} value={a}>
                      {getLocalizedArea(a, language)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                {t.driverPointLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={t.driverPointPlaceholderFull}
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
                <span>{t.driverOfferOutbound}</span>
              </label>

              {hasOutbound && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-stone-700 text-xs md:text-sm font-bold mb-1">{t.driverOutboundMode}</label>
                    <select
                      value={outboundMode}
                      onChange={(e) => setOutboundMode(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-stone-300 rounded-xl bg-white font-medium"
                    >
                      <option value="volunteer">{t.driverOutboundOptionVol}</option>
                      <option value="attendee">{t.driverOutboundOptionAtt}</option>
                      <option value="both">{t.driverOutboundOptionBoth}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 text-xs md:text-sm font-bold mb-1">{t.driverOutboundDepartureLabel}</label>
                    <input
                      type="text"
                      value={outboundTime}
                      onChange={(e) => setOutboundTime(e.target.value)}
                      placeholder={language === 'en' ? 'e.g., 06:30 AM departure' : '例：06:30 出發'}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-stone-300 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 text-xs md:text-sm font-bold mb-1">{t.driverOutboundSeats}</label>
                    <select
                      value={outboundTotalSeats}
                      onChange={(e) => setOutboundTotalSeats(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-stone-300 rounded-xl bg-white font-bold"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <option key={n} value={n}>
                          {n} {t.driverEmptySeatsSuffix}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Return Leg Settings */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="flex items-center gap-2.5 cursor-pointer font-bold text-stone-900 text-sm md:text-base">
                  <input
                    type="checkbox"
                    checked={hasReturn}
                    onChange={(e) => setHasReturn(e.target.checked)}
                    className="w-5 h-5 text-amber-600 rounded border-stone-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>{t.driverOfferReturn}</span>
                </label>
                {hasReturn && hasOutbound && (
                  <button
                    type="button"
                    onClick={() => {
                      setReturnMode(outboundMode);
                      setReturnTotalSeats(outboundTotalSeats);
                    }}
                    className="text-xs text-amber-800 hover:text-amber-950 font-bold bg-amber-100/70 hover:bg-amber-200/80 px-2.5 py-1 rounded-lg border border-amber-300 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{t.syncWithOutbound}</span>
                  </button>
                )}
              </div>

              {hasReturn && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-stone-700 text-xs md:text-sm font-bold mb-1">{t.driverReturnMode}</label>
                    <select
                      value={returnMode}
                      onChange={(e) => setReturnMode(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-stone-300 rounded-xl bg-white font-medium"
                    >
                      <option value="volunteer">{t.driverReturnOptionVol}</option>
                      <option value="attendee">{t.driverReturnOptionAtt}</option>
                      <option value="both">{t.driverReturnOptionBoth}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 text-xs md:text-sm font-bold mb-1">{t.driverReturnDepartureLabel}</label>
                    <input
                      type="text"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      placeholder={language === 'en' ? 'e.g., 16:30 after event' : '例：16:30 活動結束'}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-stone-300 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 text-xs md:text-sm font-bold mb-1">{t.driverReturnSeats}</label>
                    <select
                      value={returnTotalSeats}
                      onChange={(e) => setReturnTotalSeats(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs md:text-sm border border-stone-300 rounded-xl bg-white font-bold"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <option key={n} value={n}>
                          {n} {t.driverEmptySeatsSuffix}
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
                  {t.driverCarModelLabel}
                </label>
                <input
                  type="text"
                  placeholder={t.driverCarModelPlaceholder}
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                  {t.driverCarColorLabel}
                </label>
                <input
                  type="text"
                  placeholder={t.driverCarColorPlaceholder}
                  value={carColor}
                  onChange={(e) => setCarColor(e.target.value)}
                  className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                  {t.driverPlateLabel}
                </label>
                <input
                  type="text"
                  placeholder={t.driverPlatePlaceholder}
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-full px-3.5 py-3 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-800 font-bold mb-1.5 text-xs md:text-sm">
                {t.driverNotesLabel}
              </label>
              <input
                type="text"
                placeholder={t.driverNotesPlaceholder}
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
              {t.driverSubmitBtn}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: My Published Offers */}
      {driverTab === 'my-cars' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-stone-900">
              {t.myCarsTitle}
            </h3>
            <button
              onClick={() => setDriverTab('create')}
              className="text-xs md:text-sm bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              {language === 'en' ? 'Add Another Vehicle' : '新增另一部車'}
            </button>
          </div>

          {myOffers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center text-stone-500">
              {t.noMyCarsDesc}
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
                          {offer.driverName} {language === 'en' ? "'s Vehicle" : '的車輛'}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 font-bold border border-stone-200">
                          {offer.carColor || ''} {offer.carModel} {offer.plateNumber ? `[${offer.plateNumber}]` : ''}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-stone-600 flex items-center gap-1 mt-1 font-medium">
                        <MapPin className="w-4 h-4 text-amber-700" />
                        {getLocalizedArea(offer.departureArea, language)} - {offer.departurePoint}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <button
                        onClick={() => handleOpenEditOffer(offer)}
                        className="text-xs md:text-sm text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer font-bold transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-amber-700" />
                        <span>{t.editOfferBtn}</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(language === 'en' ? `Are you sure you want to cancel the ride offered by ${offer.driverName}?` : `確定要取消 ${offer.driverName} 發布的這趟車次嗎？`)) {
                            onDeleteOffer(offer.id);
                          }
                        }}
                        className="text-xs md:text-sm text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer font-bold transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        {language === 'en' ? 'Cancel Ride' : '取消此車發布'}
                      </button>
                    </div>
                  </div>

                  {/* Outbound & Return Passengers Grids */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Outbound list */}
                    {offer.hasOutbound && (
                      <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 space-y-2.5">
                        <div className="flex items-center justify-between text-xs md:text-sm border-b border-amber-200/60 pb-2">
                          <span className="font-black text-amber-950 flex items-center gap-1.5">
                            🚙 {t.outbound} {language === 'en' ? 'Passengers' : '乘客'} ({offer.outboundPassengers.reduce((sum, p) => sum + p.passengerCount, 0)} {language === 'en' ? 'ppl' : '人'})
                          </span>
                          <span className="font-bold text-amber-800">
                            {language === 'en' ? 'Seats left: ' : '剩餘 '}{offer.outboundAvailableSeats} {language === 'en' ? '' : '位'}
                          </span>
                        </div>

                        {offer.outboundPassengers.length === 0 ? (
                          <p className="text-xs text-stone-400 py-1">{language === 'en' ? 'No outbound passengers booked' : '尚無去程乘客預約'}</p>
                        ) : (
                          <div className="space-y-2">
                            {offer.outboundPassengers.map((p) => (
                              <div key={p.id} className="bg-white p-2.5 rounded-xl border border-stone-200 text-xs md:text-sm flex items-center justify-between">
                                <div>
                                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                                    <span>{p.name}</span>
                                    <span className="text-[11px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                                      {p.passengerCount} {t.personCountSuffix}
                                    </span>
                                    <span className={`text-[11px] px-1.5 py-0.2 rounded font-bold ${
                                      p.role === 'volunteer' ? 'bg-orange-100 text-orange-900' : 'bg-emerald-100 text-emerald-900'
                                    }`}>
                                      {p.role === 'volunteer' ? t.roleVolunteer : t.roleAttendee}
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
                            🚗 {t.returnLeg} {language === 'en' ? 'Passengers' : '乘客'} ({offer.returnPassengers.reduce((sum, p) => sum + p.passengerCount, 0)} {language === 'en' ? 'ppl' : '人'})
                          </span>
                          <span className="font-bold text-emerald-800">
                            {language === 'en' ? 'Seats left: ' : '剩餘 '}{offer.returnAvailableSeats} {language === 'en' ? '' : '位'}
                          </span>
                        </div>

                        {offer.returnPassengers.length === 0 ? (
                          <p className="text-xs text-stone-400 py-1">{language === 'en' ? 'No return passengers booked' : '尚無回程乘客預約'}</p>
                        ) : (
                          <div className="space-y-2">
                            {offer.returnPassengers.map((p) => (
                              <div key={p.id} className="bg-white p-2.5 rounded-xl border border-stone-200 text-xs md:text-sm flex items-center justify-between">
                                <div>
                                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                                    <span>{p.name}</span>
                                    <span className="text-[11px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                                      {p.passengerCount} {t.personCountSuffix}
                                    </span>
                                    <span className={`text-[11px] px-1.5 py-0.2 rounded font-bold ${
                                      p.role === 'volunteer' ? 'bg-orange-100 text-orange-900' : 'bg-emerald-100 text-emerald-900'
                                    }`}>
                                      {p.role === 'volunteer' ? t.roleVolunteer : t.roleAttendee}
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
            <strong>{language === 'en' ? 'Match Waiting Passengers: ' : '主動認領乘客：'}</strong>
            {language === 'en'
              ? 'Below are friends who have requested rides. If your route and schedule match, please select your vehicle and click to claim them!'
              : '以下為目前登記搭車需求但尚未安排妥當的朋友。若您的路線與時間剛好合適，請選擇您的愛心車輛並認領接送！'}
          </div>

          {/* Select which car to match */}
          {myOffers.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center gap-3 text-xs md:text-sm">
              <span className="font-black text-stone-900 shrink-0">
                {language === 'en' ? 'Assign to my vehicle:' : '指派到我的車次：'}
              </span>
              <select
                value={selectedOfferForMatch}
                onChange={(e) => setSelectedOfferForMatch(e.target.value)}
                className="border border-stone-300 rounded-xl px-3 py-2 flex-1 font-bold text-stone-900"
              >
                <option value="">{language === 'en' ? '-- Select your vehicle --' : '-- 請選擇您的車輛 --'}</option>
                {myOffers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.driverName} ({getLocalizedArea(o.departureArea, language)}, {t.outbound}: {o.outboundAvailableSeats} / {t.returnLeg}: {o.returnAvailableSeats})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5">
                <span className="text-stone-600 font-bold">
                  {language === 'en' ? 'Trip Leg:' : '認領行程：'}
                </span>
                <select
                  value={matchLegChoice}
                  onChange={(e) => setMatchLegChoice(e.target.value as any)}
                  className="border border-stone-300 rounded-xl px-2.5 py-2 font-bold"
                >
                  <option value="both">{t.bothLegs}</option>
                  <option value="outbound">{t.outbound}</option>
                  <option value="return">{t.returnLeg}</option>
                </select>
              </div>
            </div>
          )}

          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center text-stone-600 font-bold">
              {language === 'en' ? 'All passengers have currently been arranged with rides. Thank you for your support!' : '目前所有乘客皆已順利安排車位，感謝大家的熱心！'}
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
                        {language === 'en' ? 'Needs' : '需求'} {req.passengerCount} {t.personCountSuffix}
                      </span>
                    </div>

                    <div className="text-xs md:text-sm text-stone-700 flex items-center gap-1 font-medium">
                      <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>{getLocalizedArea(req.pickupArea, language)} - {req.pickupPoint}</span>
                    </div>

                    {/* Role & Leg Requirements */}
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {req.needOutbound && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-bold">
                          {t.outbound}: {req.outboundRole === 'volunteer' ? (language === 'en' ? 'Volunteer (Early)' : '義工組(早到)') : (language === 'en' ? 'Attendee' : '正行組')}
                        </span>
                      )}
                      {req.needReturn && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-800 font-bold">
                          {t.returnLeg}: {req.returnRole === 'volunteer' ? (language === 'en' ? 'Volunteer (Cleanup)' : '義工組(善後)') : (language === 'en' ? 'Attendee (After event)' : '正行組(活動後即回)')}
                        </span>
                      )}
                    </div>

                    {req.notes && (
                      <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl">
                        {language === 'en' ? 'Notes' : '備註'}：{req.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-stone-500 font-medium">{language === 'en' ? 'Phone' : '電話'}：{req.passengerPhone}</span>
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
                      {t.claimPassengerBtn}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Offer Modal */}
      {editingOffer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-100 space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in">
            <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-700" />
                  {t.editOfferModalTitle}
                </h3>
                <p className="text-xs md:text-sm text-stone-500 mt-0.5 font-medium">
                  {language === 'en' ? 'Adjust departure times, seat count, and pickup point' : '可隨時調整出發時間、車位數量與接送地點'}
                </p>
              </div>
              <button
                onClick={() => setEditingOffer(null)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {editOfferSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold text-stone-900">{editOfferSuccess}</h4>
              </div>
            ) : (
              <form onSubmit={handleSaveEditOffer} className="space-y-4 text-xs md:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-800 font-bold mb-1">{t.driverNameLabel}</label>
                    <input
                      type="text"
                      required
                      value={editDriverName}
                      onChange={(e) => setEditDriverName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-800 font-bold mb-1">{t.driverPhoneLabel}</label>
                    <input
                      type="tel"
                      required
                      value={editDriverPhone}
                      onChange={(e) => setEditDriverPhone(e.target.value)}
                      className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-800 font-bold mb-1">{t.driverContactLabel}</label>
                    <input
                      type="text"
                      placeholder={t.driverWhatsappPlaceholder}
                      value={editWechat}
                      onChange={(e) => setEditWechat(e.target.value)}
                      className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-800 font-bold mb-1">{t.driverAreaLabel}</label>
                    <select
                      value={editArea}
                      onChange={(e) => setEditArea(e.target.value)}
                      className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500 font-bold"
                    >
                      {EAST_COAST_AREAS.filter((a) => a !== '全美東區域').map((a) => (
                        <option key={a} value={a}>
                          {getLocalizedArea(a, language)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1">{t.driverPointLabel}</label>
                  <input
                    type="text"
                    value={editPoint}
                    onChange={(e) => setEditPoint(e.target.value)}
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-stone-800 font-bold mb-1">{t.driverCarModelLabel}</label>
                    <input
                      type="text"
                      value={editCarModel}
                      onChange={(e) => setEditCarModel(e.target.value)}
                      className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-800 font-bold mb-1">{t.driverCarColorLabel}</label>
                    <input
                      type="text"
                      value={editCarColor}
                      onChange={(e) => setEditCarColor(e.target.value)}
                      className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-800 font-bold mb-1">{t.driverPlateLabel}</label>
                    <input
                      type="text"
                      value={editPlateNumber}
                      onChange={(e) => setEditPlateNumber(e.target.value)}
                      className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Outbound Settings */}
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-900">
                    <input
                      type="checkbox"
                      checked={editHasOutbound}
                      onChange={(e) => setEditHasOutbound(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span>{t.driverOfferOutbound}</span>
                  </label>
                  {editHasOutbound && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <div>
                        <label className="block text-stone-600 text-xs font-bold mb-0.5">{t.departureTime}</label>
                        <input
                          type="text"
                          value={editOutboundTime}
                          onChange={(e) => setEditOutboundTime(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-600 text-xs font-bold mb-0.5">{t.driverOutboundSeats}</label>
                        <select
                          value={editOutboundTotalSeats}
                          onChange={(e) => setEditOutboundTotalSeats(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold"
                        >
                          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                            <option key={n} value={n}>{n} {t.driverEmptySeatsSuffix}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-stone-600 text-xs font-bold mb-0.5">{t.driverOutboundMode}</label>
                        <select
                          value={editOutboundMode}
                          onChange={(e) => setEditOutboundMode(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold"
                        >
                          <option value="volunteer">{t.roleVolunteer}</option>
                          <option value="attendee">{t.roleAttendee}</option>
                          <option value="both">{t.roleBoth}</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Return Settings */}
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-900">
                    <input
                      type="checkbox"
                      checked={editHasReturn}
                      onChange={(e) => setEditHasReturn(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span>{t.driverOfferReturn}</span>
                  </label>
                  {editHasReturn && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <div>
                        <label className="block text-stone-600 text-xs font-bold mb-0.5">{t.departureTime}</label>
                        <input
                          type="text"
                          value={editReturnTime}
                          onChange={(e) => setEditReturnTime(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-600 text-xs font-bold mb-0.5">{t.driverReturnSeats}</label>
                        <select
                          value={editReturnTotalSeats}
                          onChange={(e) => setEditReturnTotalSeats(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold"
                        >
                          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                            <option key={n} value={n}>{n} {t.driverEmptySeatsSuffix}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-stone-600 text-xs font-bold mb-0.5">{t.driverReturnMode}</label>
                        <select
                          value={editReturnMode}
                          onChange={(e) => setEditReturnMode(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold"
                        >
                          <option value="volunteer">{t.roleVolunteer}</option>
                          <option value="attendee">{t.roleAttendee}</option>
                          <option value="both">{t.roleBoth}</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1">{t.driverNotesLabel}</label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingOffer(null)}
                    className="flex-1 py-3 border border-stone-300 rounded-xl text-stone-700 font-bold hover:bg-stone-50 cursor-pointer"
                  >
                    {t.cancelEditBtn}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black shadow-xs cursor-pointer text-base"
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
