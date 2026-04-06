"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/app-header";
import { useAuth } from "@/lib/auth-context";
import { updateProfile } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <AppHeader />
        <main className="mx-auto max-w-2xl px-6 py-12 text-center">
          <p className="text-zinc-500">Войдите для доступа к настройкам.</p>
        </main>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateProfile({ name });
      setMessage("Профиль обновлён");
    } catch {
      setMessage("Не удалось обновить профиль");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordMessage("Пароли не совпадают");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage("Пароль должен быть не менее 6 символов");
      return;
    }

    setPasswordSaving(true);
    try {
      await updateProfile({ password: newPassword });
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Пароль успешно изменён");
    } catch {
      setPasswordMessage("Не удалось сменить пароль");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const roleColors: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700",
    manager: "bg-blue-100 text-blue-700",
    agent: "bg-green-100 text-green-700",
    viewer: "bg-zinc-100 text-zinc-700",
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <AppHeader />

      <main className="mx-auto max-w-2xl space-y-6 px-6 py-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          <Shield className="h-5 w-5 text-blue-600" />
          Настройки аккаунта
        </h2>

        {/* Profile */}
        <form
          onSubmit={handleSaveProfile}
          className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Профиль
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Имя
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Электронная почта
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="mt-1 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500">Роль:</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                roleColors[user.role] || roleColors.viewer,
              )}
            >
              {user.role}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {message && (
              <span
                className={cn(
                  "text-xs",
                  message.includes("Не удалось") ? "text-red-500" : "text-green-600",
                )}
              >
                {message}
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="ml-auto flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Сохранить
            </button>
          </div>
        </form>

        {/* Password */}
        <form
          onSubmit={handleChangePassword}
          className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Смена пароля
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Новый пароль
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                placeholder="••••••••"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Подтвердите пароль
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                placeholder="••••••••"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {passwordMessage && (
              <span
                className={cn(
                  "text-xs",
                  passwordMessage.includes("Не удалось") || passwordMessage.includes("не совпадают") || passwordMessage.includes("не менее")
                    ? "text-red-500"
                    : "text-green-600",
                )}
              >
                {passwordMessage}
              </span>
            )}
            <button
              type="submit"
              disabled={passwordSaving || !newPassword}
              className="ml-auto flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {passwordSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Сменить пароль
            </button>
          </div>
        </form>

        {/* Logout */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <button
            onClick={handleLogout}
            className="rounded-md border border-red-200 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
          >
            Выйти из аккаунта
          </button>
        </div>
      </main>
    </div>
  );
}
