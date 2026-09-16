import React, { useState } from 'react';
import type { AdminAccount, AdminRole, AccountStatus } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { X, Shield, UserCheck, UserX, Trash2, Plus, Mail, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AccountManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AdminAccount[];
  currentAdmin: AdminAccount;
  onUpdateAccount: (account: AdminAccount) => void;
  onDeleteAccount: (accountId: string) => void;
  onAddAccount: (account: AdminAccount) => void;
}

export const AccountManagementModal: React.FC<AccountManagementModalProps> = ({
  isOpen,
  onClose,
  accounts,
  currentAdmin,
  onUpdateAccount,
  onDeleteAccount,
  onAddAccount
}) => {
  const { t, language } = useLanguage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('staff');
  const [newNote, setNewNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleToggleStatus = (account: AdminAccount) => {
    if (account.id === currentAdmin.id) {
      alert(language === 'en' ? 'You cannot suspend your own logged-in account!' : '您不能暫停目前正在使用的登入帳號！');
      return;
    }
    const newStatus: AccountStatus = account.status === 'active' ? 'suspended' : 'active';
    onUpdateAccount({
      ...account,
      status: newStatus
    });
    setSuccessMsg(
      newStatus === 'active'
        ? (language === 'en' ? `Reactivated ${account.name}` : `已恢復【${account.name}】的登入權限`)
        : (language === 'en' ? `Suspended ${account.name}` : `已暫停【${account.name}】的登入權限`)
    );
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleToggleRole = (account: AdminAccount) => {
    if (account.id === currentAdmin.id) {
      alert(language === 'en' ? 'You cannot change your own role!' : '您不能變更自己的管理員角色！');
      return;
    }
    const newRole: AdminRole = account.role === 'super_admin' ? 'staff' : 'super_admin';
    onUpdateAccount({
      ...account,
      role: newRole
    });
  };

  const handleDelete = (account: AdminAccount) => {
    if (account.id === currentAdmin.id) {
      alert(language === 'en' ? 'You cannot delete your own logged-in account!' : '您不能刪除自己的管理員帳號！');
      return;
    }
    if (window.confirm(`${t.deleteAccountConfirm}\n(${account.name} - ${account.email})`)) {
      onDeleteAccount(account.id);
      setSuccessMsg(language === 'en' ? `Deleted account: ${account.name}` : `已成功刪除幹部帳號：${account.name}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedEmail = newEmail.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg(language === 'en' ? 'Please enter a valid Gmail address' : '請輸入正確的 Gmail 信箱地址');
      return;
    }

    if (accounts.some((a) => a.email.toLowerCase() === trimmedEmail)) {
      setErrorMsg(language === 'en' ? 'This email is already registered!' : '此 Google 信箱已存在於名冊中！');
      return;
    }

    const newAccount: AdminAccount = {
      id: `acc-${Date.now()}`,
      email: trimmedEmail,
      name: newName.trim() || trimmedEmail.split('@')[0],
      role: newRole,
      status: 'active',
      authProvider: 'google',
      registeredAt: new Date().toLocaleString('zh-TW', { hour12: false }),
      note: newNote.trim()
    };

    onAddAccount(newAccount);
    setSuccessMsg(language === 'en' ? `Successfully authorized ${newAccount.name}` : `已成功授權新幹部：${newAccount.name}`);
    setNewEmail('');
    setNewName('');
    setNewNote('');
    setShowAddForm(false);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-900 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-xl font-black">{t.accountManagementTitle}</h3>
              <p className="text-xs text-amber-200 font-medium">{t.accountManagementSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
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
          {/* Top Info & Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div>
              <div className="text-xs text-stone-500 font-bold uppercase tracking-wider">
                {language === 'en' ? 'Current Logged-in Super Admin' : '當前操作者'}
              </div>
              <div className="text-sm font-black text-stone-900 mt-0.5 flex items-center gap-2">
                <span>{currentAdmin.name}</span>
                <span className="text-xs font-medium text-stone-500">({currentAdmin.email})</span>
              </div>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addNewStaffBtn}</span>
            </button>
          </div>

          {/* Add Staff Form Accordion */}
          {showAddForm && (
            <form onSubmit={handleAddStaffSubmit} className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                <h4 className="font-black text-amber-950 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-700" />
                  <span>{language === 'en' ? 'Authorize New Google Account' : '預先授權新的 Google 帳號'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-amber-800 font-bold hover:underline"
                >
                  {t.cancelEditBtn}
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-stone-800 mb-1">
                    {t.staffEmailLabel} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-xl bg-white text-sm font-medium focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-800 mb-1">
                    {t.staffNameLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'en' ? 'e.g. Brother Chen' : '例如：陳同修 (報到組)'}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-xl bg-white text-sm font-medium focus:outline-hidden focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-stone-800 mb-1">
                    {t.roleLabel}
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as AdminRole)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-xl bg-white text-sm font-medium focus:outline-hidden focus:border-amber-600"
                  >
                    <option value="staff">{t.accountRoleStaff}</option>
                    <option value="super_admin">{t.accountRoleSuperAdmin}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-800 mb-1">
                    {t.noteLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'en' ? 'e.g. Flushing team coordinator' : '例如：負責法拉盛車輛調度'}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-xl bg-white text-sm font-medium focus:outline-hidden focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-black rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  {language === 'en' ? 'Confirm Authorization' : '確認新增授權'}
                </button>
              </div>
            </form>
          )}

          {/* Accounts List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-stone-900">
                {language === 'en' ? 'Registered Staff Roster' : '報名報到組後台授權名冊'} ({accounts.length})
              </h4>
              <span className="text-xs text-stone-500 font-medium">
                {language === 'en' ? 'Changes sync immediately across cloud' : '變更將即時於雲端生效'}
              </span>
            </div>

            <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              {accounts.map((acc) => {
                const isCurrent = acc.id === currentAdmin.id;
                const isSuspended = acc.status === 'suspended';

                return (
                  <div
                    key={acc.id}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      isSuspended ? 'bg-red-50/40' : 'hover:bg-stone-50/80'
                    }`}
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        {acc.avatar ? (
                          <img
                            src={acc.avatar}
                            alt={acc.name}
                            className="w-11 h-11 rounded-full object-cover border-2 border-amber-300"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-900 font-black flex items-center justify-center text-sm">
                            {acc.name.slice(0, 1)}
                          </div>
                        )}
                        {acc.role === 'super_admin' && (
                          <div className="absolute -bottom-1 -right-1 bg-amber-600 text-white rounded-full p-0.5" title={t.accountRoleSuperAdmin}>
                            <Shield className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-stone-900 text-sm">{acc.name}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full border border-amber-200">
                              {language === 'en' ? 'Current' : '本機登入中'}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 text-[10px] font-black rounded-full border ${
                              acc.role === 'super_admin'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                          >
                            {acc.role === 'super_admin' ? t.accountRoleSuperAdmin : t.accountRoleStaff}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-black rounded-full border ${
                              isSuspended
                                ? 'bg-red-100 text-red-800 border-red-200'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {isSuspended ? t.accountStatusSuspended : t.accountStatusActive}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500 font-medium truncate mt-0.5">
                          {acc.email}
                        </div>
                        {acc.note && (
                          <div className="text-[11px] text-stone-400 font-medium mt-0.5">
                            📌 {acc.note}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {/* Toggle Role Button */}
                      {!isCurrent && (
                        <button
                          onClick={() => handleToggleRole(acc)}
                          className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          title={language === 'en' ? 'Change Role' : '切換幹部/管理員角色'}
                        >
                          {acc.role === 'super_admin' ? (language === 'en' ? 'Set Staff' : '改為幹事') : (language === 'en' ? 'Set Admin' : '設為總幹事')}
                        </button>
                      )}

                      {/* Suspend / Reactivate Button */}
                      {!isCurrent && (
                        <button
                          onClick={() => handleToggleStatus(acc)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer flex items-center gap-1 border ${
                            isSuspended
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-200'
                          }`}
                        >
                          {isSuspended ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>{t.activateAccountBtn}</span>
                            </>
                          ) : (
                            <>
                              <UserX className="w-3.5 h-3.5 text-amber-800" />
                              <span>{t.suspendAccountBtn}</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Delete Button */}
                      {!isCurrent && (
                        <button
                          onClick={() => handleDelete(acc)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title={t.deleteAccountBtn}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
