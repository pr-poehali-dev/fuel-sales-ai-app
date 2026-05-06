import { useState } from "react";
import Icon from "@/components/ui/icon";
import { authApi, setToken } from "@/lib/api";

interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  company: string;
}

interface AuthModalProps {
  onSuccess: (user: User, token: string) => void;
  onClose: () => void;
}

export default function AuthModal({ onSuccess, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "", company: "" });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let res;
      if (mode === "login") {
        res = await authApi.login({ email: form.email, password: form.password });
      } else {
        if (!form.name.trim()) { setError("Введите ваше имя"); setLoading(false); return; }
        if (!form.phone.trim()) { setError("Введите номер телефона"); setLoading(false); return; }
        res = await authApi.register({ email: form.email, password: form.password, name: form.name, phone: form.phone, company: form.company });
      }
      if (res.error) {
        setError(res.error);
      } else if (res.ok && res.token) {
        setToken(res.token);
        onSuccess(res.user, res.token);
      }
    } catch {
      setError("Ошибка соединения. Попробуйте ещё раз.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md bg-[#111318] border border-[#1e2330] p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#4a5568] hover:text-[#e2e8f0] transition-colors">
          <Icon name="X" size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-[#c9a84c] flex items-center justify-center shrink-0">
            <Icon name="Fuel" size={14} className="text-black" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-[0.2em] uppercase text-[#e2e8f0]">СИНЕД</div>
            <div className="text-[9px] text-[#4a5568] tracking-wider uppercase">Личный кабинет</div>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-[#0d0f14] p-1">
          <button onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "login" ? "bg-[#c9a84c] text-black" : "text-[#4a5568] hover:text-[#e2e8f0]"}`}>
            Войти
          </button>
          <button onClick={() => { setMode("register"); setError(""); }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "register" ? "bg-[#c9a84c] text-black" : "text-[#4a5568] hover:text-[#e2e8f0]"}`}>
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-[#4a5568] block mb-1">Имя и фамилия *</label>
                <input value={form.name} onChange={e => set("name", e.target.value)}
                  placeholder="Иван Петров"
                  className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#2d3748] focus:outline-none focus:border-[#c9a84c] transition-colors" />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-[#4a5568] block mb-1">Телефон *</label>
                <input value={form.phone} onChange={e => set("phone", e.target.value)}
                  placeholder="+7 (900) 000-00-00" type="tel"
                  className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#2d3748] focus:outline-none focus:border-[#c9a84c] transition-colors" />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-[#4a5568] block mb-1">Компания (необязательно)</label>
                <input value={form.company} onChange={e => set("company", e.target.value)}
                  placeholder="ООО «Ваша компания»"
                  className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#2d3748] focus:outline-none focus:border-[#c9a84c] transition-colors" />
              </div>
            </>
          )}

          <div>
            <label className="text-[9px] uppercase tracking-wider text-[#4a5568] block mb-1">Email *</label>
            <input value={form.email} onChange={e => set("email", e.target.value)}
              placeholder="ivan@company.ru" type="email" required
              className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#2d3748] focus:outline-none focus:border-[#c9a84c] transition-colors" />
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-wider text-[#4a5568] block mb-1">Пароль *</label>
            <input value={form.password} onChange={e => set("password", e.target.value)}
              placeholder={mode === "register" ? "Минимум 6 символов" : "Ваш пароль"} type="password" required
              className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#2d3748] focus:outline-none focus:border-[#c9a84c] transition-colors" />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-950/50 border border-red-800/50 text-red-400 text-sm">
              <Icon name="AlertCircle" size={14} />
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-[#c9a84c] text-black font-semibold text-sm hover:bg-[#d4b85a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
            {loading ? <><Icon name="Loader" size={14} className="animate-spin" />Загрузка...</> : mode === "login" ? "Войти в кабинет" : "Создать аккаунт"}
          </button>
        </form>

        {mode === "login" && (
          <p className="text-xs text-[#4a5568] text-center mt-4">
            Нет аккаунта?{" "}
            <button onClick={() => { setMode("register"); setError(""); }} className="text-[#c9a84c] hover:underline">
              Зарегистрируйтесь
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
