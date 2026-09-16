import React, { useState } from 'react';
import type { Event, EventStatus, CarpoolOffer, RideRequest } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { X, Calendar, Plus, Edit2, Trash2, Eye, EyeOff, CheckCircle2, MapPin, Sparkles } from 'lucide-react';

interface EventManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
  activeEventId: string;
  onSelectEvent: (eventId: string) => void;
  onSaveEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  offers: CarpoolOffer[];
  requests: RideRequest[];
}

export const EventManagerModal: React.FC<EventManagerModalProps> = ({
  isOpen,
  onClose,
  events,
  activeEventId,
  onSelectEvent,
  onSaveEvent,
  onDeleteEvent,
  offers,
  requests
}) => {
  const { t, language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<Event>>({});
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleOpenAddForm = () => {
    setEditingEvent({
      id: `evt-${Date.now()}`,
      title: '',
      theme: '',
      subtitle: '',
      date: '',
      templeName: '空山寺 (Kong Shan Temple)',
      location: '174 Hynes RD, Poughquag, NY 12570',
      status: 'published',
      volunteerArrivalTime: '08:00 前抵達',
      attendeeArrivalTime: '09:00 ~ 09:30 入寺',
      assemblyNotes: '',
      schedule: [
        { time: '09:00 ~ 09:30', activity: '報到入寺', detail: '大眾抵達寺院' },
        { time: '09:30 ~ 11:30', activity: '法會共修', detail: '大殿誦經共修', highlight: true },
        { time: '11:45 ~ 13:30', activity: '午間蔬食饗宴', detail: '過堂用齋' },
        { time: '14:00 ~ 16:00', activity: '下午修學與心得交流', detail: '圓滿賦歸', highlight: true }
      ],
      reminders: [
        '請自備環保餐具與水杯。',
        '共乘同修請寬裕預留交通車程時間。'
      ]
    });
    setIsEditing(true);
  };

  const handleOpenEditForm = (evt: Event) => {
    setEditingEvent({ ...evt });
    setIsEditing(true);
  };

  const handleToggleStatus = (evt: Event) => {
    const nextStatus: EventStatus = evt.status === 'published' ? 'hidden' : 'published';
    const updated = { ...evt, status: nextStatus };
    onSaveEvent(updated);
    const feedback = nextStatus === 'published'
      ? (language === 'en' ? `【${evt.title}】is now Published! Visible to all public.` : `已公開發布【${evt.title}】，前台大眾即刻可見！`)
      : (language === 'en' ? `【${evt.title}】is now Hidden. Only visible to staff.` : `已將【${evt.title}】設為內部隱藏，前台信眾將無法看見。`);
    setSuccessMsg(feedback);
    alert(feedback);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = (evt: Event) => {
    if (events.length <= 1) {
      alert(language === 'en' ? 'Cannot delete the only remaining event!' : '系統必須保留至少一個法會營隊，無法刪除！');
      return;
    }

    if (window.confirm(`${t.deleteEventConfirm}\n(${evt.title})`)) {
      onDeleteEvent(evt.id);
      const feedback = language === 'en' ? `Deleted: ${evt.title}` : `已成功刪除法會營隊：${evt.title}`;
      setSuccessMsg(feedback);
      alert(feedback);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent.title || !editingEvent.date) {
      alert(language === 'en' ? 'Please fill in required fields: Title and Date.' : '請填寫必填欄位：法會名稱與活動日期。');
      return;
    }

    const fullEvent: Event = {
      id: editingEvent.id || `evt-${Date.now()}`,
      title: editingEvent.title || '',
      theme: editingEvent.theme || '',
      subtitle: editingEvent.subtitle || '',
      date: editingEvent.date || '',
      templeName: editingEvent.templeName || '空山寺 (Kong Shan Temple)',
      location: editingEvent.location || '174 Hynes RD, Poughquag, NY 12570',
      status: editingEvent.status || 'published',
      volunteerArrivalTime: editingEvent.volunteerArrivalTime || '08:00 前抵達',
      attendeeArrivalTime: editingEvent.attendeeArrivalTime || '09:00 ~ 09:30 入寺',
      assemblyNotes: editingEvent.assemblyNotes || '',
      schedule: editingEvent.schedule || [],
      reminders: editingEvent.reminders || []
    };

    onSaveEvent(fullEvent);
    setIsEditing(false);
    setSuccessMsg(language === 'en' ? `Saved event: ${fullEvent.title}` : `已成功儲存法會：${fullEvent.title}`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-800 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-xl font-black">{t.eventManagementTitle}</h3>
              <p className="text-xs text-amber-200 font-medium">{t.eventManagementSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {successMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 text-emerald-800 text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Action Bar */}
          {!isEditing && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70">
              <div>
                <h4 className="text-sm font-black text-amber-950">
                  {language === 'en' ? 'Temple Carpool Events Master' : '空山寺法會營隊共乘清單'}
                </h4>
                <p className="text-xs text-amber-800 font-medium mt-0.5">
                  {language === 'en' ? 'Manage multiple seasonal retreats, camps, and gatherings with independent fleets.' : '支援多梯次季節法會、精進營隊與普茶活動，各活動車隊與需求獨立管理。'}
                </p>
              </div>

              <button
                onClick={handleOpenAddForm}
                className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-black shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addEventBtn}</span>
              </button>
            </div>
          )}

          {/* Edit / Add Event Form */}
          {isEditing ? (
            <form onSubmit={handleFormSubmit} className="space-y-4 bg-stone-50 border border-stone-200 rounded-2xl p-5 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h4 className="font-black text-stone-900 text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <span>{editingEvent.id?.startsWith('evt-') ? (language === 'en' ? 'Edit Event' : '編輯法會營隊資訊') : t.addEventBtn}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-stone-600 font-bold hover:underline cursor-pointer"
                >
                  {t.cancelEventBtn}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-stone-800 mb-1">
                    {t.eventTitleLabel} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例如：2026 空山寺冬季佛七精進共修營"
                    value={editingEvent.title || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white text-sm font-medium focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-800 mb-1">
                    {t.eventDateLabel} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例如：2026年12月19日（週六）~ 12月25日"
                    value={editingEvent.date || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white text-sm font-medium focus:outline-hidden focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-stone-800 mb-1">
                    {t.eventThemeLabel}
                  </label>
                  <input
                    type="text"
                    placeholder="例如：《念念彌陀．一心不亂》——念佛成佛"
                    value={editingEvent.theme || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, theme: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white text-sm font-medium focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-800 mb-1">
                    {language === 'en' ? 'Initial Publishing Status' : '公開狀態'}
                  </label>
                  <select
                    value={editingEvent.status || 'published'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value as EventStatus })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white text-sm font-bold focus:outline-hidden focus:border-amber-600"
                  >
                    <option value="published">{t.statusPublished}</option>
                    <option value="hidden">{t.statusHidden}</option>
                    <option value="draft">{t.statusDraft}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-stone-800 mb-1">
                  {t.eventSubtitleLabel}
                </label>
                <textarea
                  rows={2}
                  placeholder="簡要說明此法會活動宗旨與亮點..."
                  value={editingEvent.subtitle || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white text-sm font-medium focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-stone-800 mb-1">
                    {t.eventVolunteerArrivalLabel}
                  </label>
                  <input
                    type="text"
                    placeholder="例如：08:00 前抵達寺院集合"
                    value={editingEvent.volunteerArrivalTime || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, volunteerArrivalTime: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white text-sm font-medium focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-800 mb-1">
                    {t.eventAttendeeArrivalLabel}
                  </label>
                  <input
                    type="text"
                    placeholder="例如：09:00 ~ 09:30 入寺報到"
                    value={editingEvent.attendeeArrivalTime || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, attendeeArrivalTime: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white text-sm font-medium focus:outline-hidden focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-stone-800 mb-1">
                  {t.eventLocationLabel}
                </label>
                <input
                  type="text"
                  placeholder="例如：174 Hynes RD, Poughquag, NY 12570"
                  value={editingEvent.location || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white text-sm font-medium focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-bold rounded-xl cursor-pointer hover:bg-stone-100"
                >
                  {t.cancelEventBtn}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-black text-white text-xs font-black rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  {t.saveEventBtn}
                </button>
              </div>
            </form>
          ) : (
            /* Events Cards List */
            <div className="space-y-4">
              {events.map((evt) => {
                const isActive = evt.id === activeEventId;
                const isPub = evt.status === 'published';
                const eventOffers = offers.filter((o) => o.eventId === evt.id);
                const eventRequests = requests.filter((r) => r.eventId === evt.id);

                return (
                  <div
                    key={evt.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isActive
                        ? 'border-amber-500 bg-amber-50/40 shadow-sm ring-1 ring-amber-500'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Event Overview */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-black text-stone-900 tracking-tight">
                            {evt.title}
                          </h4>

                          {/* Status Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-black border flex items-center gap-1 ${
                              isPub
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : evt.status === 'hidden'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-stone-100 text-stone-600 border-stone-300'
                            }`}
                          >
                            {isPub ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>
                              {isPub ? t.statusPublished : evt.status === 'hidden' ? t.statusHidden : t.statusDraft}
                            </span>
                          </span>

                          {isActive && (
                            <span className="px-2.5 py-0.5 bg-amber-600 text-white rounded-full text-xs font-black">
                              {language === 'en' ? 'Currently Managing' : '當前調度中'}
                            </span>
                          )}
                        </div>

                        {evt.theme && (
                          <div className="text-xs text-amber-900 font-bold italic">
                            {evt.theme}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                            <span>{evt.date}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            <span className="truncate max-w-xs">{evt.location}</span>
                          </span>
                        </div>

                        {/* Fleets Stats */}
                        <div className="flex items-center gap-3 pt-1 text-xs text-stone-500 font-medium">
                          <span>🚗 已登記車輛：<strong className="text-stone-800">{eventOffers.length}</strong> 輛</span>
                          <span>🙋 等候需求：<strong className="text-stone-800">{eventRequests.length}</strong> 筆</span>
                        </div>
                      </div>

                      {/* Control Actions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center">
                        {/* Select as active */}
                        {!isActive && (
                          <button
                            onClick={() => onSelectEvent(evt.id)}
                            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-black transition-colors cursor-pointer"
                          >
                            {language === 'en' ? 'Switch to this' : '切換至此法會'}
                          </button>
                        )}

                        {/* Toggle Publish/Hide */}
                        <button
                          onClick={() => handleToggleStatus(evt)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer border shadow-xs ${
                            isPub
                              ? 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-300'
                              : 'bg-amber-700 hover:bg-amber-800 text-white border-amber-800'
                          }`}
                        >
                          {isPub ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                              <span>{t.hideEventBtn}</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>{t.publishEventBtn}</span>
                            </>
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEditForm(evt)}
                          className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                          title={t.editEventBtn}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(evt)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title={t.deleteEventBtn}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-stone-900 hover:bg-black text-white text-sm font-bold rounded-xl cursor-pointer transition-colors"
          >
            {language === 'en' ? 'Done' : '完成並關閉'}
          </button>
        </div>
      </div>
    </div>
  );
};
