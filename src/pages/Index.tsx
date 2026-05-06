import { useState } from "react";
import Icon from "@/components/ui/icon";

type Section = "home" | "catalog" | "orders" | "history" | "profile" | "contacts";

const FUEL_DATA = [
  { id: 1, name: "АИ-92", price: 54.30, available: true, volume: "от 1 000 л", change: +0.20 },
  { id: 2, name: "АИ-95", price: 57.80, available: true, volume: "от 1 000 л", change: -0.10 },
  { id: 3, name: "АИ-98", price: 63.50, available: true, volume: "от 500 л", change: +0.50 },
  { id: 4, name: "ДТ Летнее", price: 64.20, available: true, volume: "от 2 000 л", change: +1.10 },
  { id: 5, name: "ДТ Зимнее", price: 67.90, available: false, volume: "от 2 000 л", change: 0 },
  { id: 6, name: "Авиакеросин ТС-1", price: 82.40, available: true, volume: "от 5 000 л", change: -0.80 },
];

const ORDERS = [
  { id: "ЗВ-2024-0847", fuel: "ДТ Летнее", volume: "5 000 л", total: "321 000 ₽", status: "Доставляется", date: "06.05.2026", statusColor: "text-amber-400", progress: 66 },
  { id: "ЗВ-2024-0846", fuel: "АИ-92", volume: "3 000 л", total: "162 900 ₽", status: "Подтверждена", date: "05.05.2026", statusColor: "text-blue-400", progress: 33 },
  { id: "ЗВ-2024-0845", fuel: "АИ-95", volume: "2 000 л", total: "115 600 ₽", status: "Исполнена", date: "03.05.2026", statusColor: "text-emerald-400", progress: 100 },
];

const HISTORY = [
  { id: "ЗВ-2024-0844", fuel: "ДТ Летнее", volume: "10 000 л", total: "642 000 ₽", date: "28.04.2026" },
  { id: "ЗВ-2024-0831", fuel: "АИ-92", volume: "5 000 л", total: "271 500 ₽", date: "15.04.2026" },
  { id: "ЗВ-2024-0819", fuel: "АИ-95", volume: "3 000 л", total: "173 400 ₽", date: "02.04.2026" },
  { id: "ЗВ-2024-0802", fuel: "Авиакеросин ТС-1", volume: "8 000 л", total: "659 200 ₽", date: "18.03.2026" },
  { id: "ЗВ-2024-0790", fuel: "ДТ Летнее", volume: "7 000 л", total: "449 400 ₽", date: "05.03.2026" },
];

const MANAGERS = [
  { name: "Александр Петров", role: "Персональный менеджер", phone: "+7 (495) 123-45-67", email: "petrov@toplivohub.ru" },
  { name: "Елена Смирнова", role: "Технический консультант", phone: "+7 (495) 123-45-68", email: "smirnova@toplivohub.ru" },
  { name: "Служба поддержки", role: "24/7 горячая линия", phone: "8-800-555-35-35", email: "support@toplivohub.ru" },
];

interface OrderForm {
  fuel: string;
  volume: string;
  address: string;
  date: string;
  comment: string;
}

const Index = () => {
  const [section, setSection] = useState<Section>("home");
  const [showModal, setShowModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState<OrderForm>({ fuel: "", volume: "", address: "", date: "", comment: "" });
  const [preselectedFuel, setPreselectedFuel] = useState("");

  const openOrder = (fuel = "") => {
    setPreselectedFuel(fuel);
    setForm({ fuel, volume: "", address: "", date: "", comment: "" });
    setShowModal(true);
  };

  const handleAiFill = () => {
    setAiLoading(true);
    setTimeout(() => {
      setForm({
        fuel: preselectedFuel || "ДТ Летнее",
        volume: "5 000",
        address: "г. Москва, ул. Промышленная, д. 12, база №3",
        date: "12.05.2026",
        comment: "Стандартная поставка. Приём с 08:00 до 18:00. Контактное лицо: Иванов А.В.",
      });
      setAiLoading(false);
    }, 1600);
  };

  const navItems: { id: Section; label: string; icon: string }[] = [
    { id: "home", label: "Главная", icon: "LayoutDashboard" },
    { id: "catalog", label: "Каталог", icon: "Fuel" },
    { id: "orders", label: "Заявки", icon: "ClipboardList" },
    { id: "history", label: "История", icon: "History" },
    { id: "profile", label: "Профиль", icon: "Building2" },
    { id: "contacts", label: "Контакты", icon: "PhoneCall" },
  ];

  return (
    <div className="flex min-h-screen bg-[#0d0f14] text-[#e2e8f0] font-['IBM_Plex_Sans',sans-serif]">
      {/* Sidebar */}
      <aside className="w-60 min-h-screen bg-[#111318] border-r border-[#1e2330] flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-[#1e2330]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#c9a84c] flex items-center justify-center shrink-0">
              <Icon name="Fuel" size={14} className="text-black" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-[0.15em] uppercase text-[#e2e8f0]">ТопливоХаб</div>
              <div className="text-[9px] text-[#4a5568] tracking-widest uppercase mt-0.5">B2B Платформа</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150 text-left ${
                section === item.id
                  ? "bg-[#c9a84c] text-black font-medium"
                  : "text-[#8896aa] hover:bg-[#1a1f2e] hover:text-[#e2e8f0]"
              }`}
            >
              <Icon name={item.icon} size={15} />
              <span className="tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-[#1e2330]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#1a1f2e] border border-[#2a3248] flex items-center justify-center text-[10px] font-semibold text-[#8896aa]">АГ</div>
            <div>
              <div className="text-xs font-medium text-[#c9d6e5]">АО «АгроГрупп»</div>
              <div className="text-[9px] text-[#4a5568]">ИНН 7701234567</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 border-b border-[#1e2330] bg-[#111318] flex items-center justify-between px-8 shrink-0">
          <div className="text-[9px] text-[#4a5568] uppercase tracking-[0.2em]">
            {navItems.find((n) => n.id === section)?.label}
          </div>
          <div className="flex items-center gap-6">
            <div className="text-[11px] text-[#4a5568]">06 мая 2026</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-[#4a5568]">Система активна</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">

          {/* HOME */}
          {section === "home" && (
            <div className="space-y-7 animate-fade-in">
              <div>
                <h1 className="text-xl font-semibold text-[#e2e8f0] tracking-tight">Добро пожаловать, АО «АгроГрупп»</h1>
                <p className="text-xs text-[#4a5568] mt-1 tracking-wide">Актуальные данные по вашим закупкам топлива на 06.05.2026</p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Заявок в работе", value: "3", icon: "ClipboardList", sub: "+1 за неделю" },
                  { label: "Закупок в мае", value: "2", icon: "ShoppingCart", sub: "321 000 ₽" },
                  { label: "Итого с начала года", value: "2,3 млн ₽", icon: "TrendingUp", sub: "47 поставок" },
                  { label: "Цена ДТ сегодня", value: "64,20 ₽/л", icon: "Fuel", sub: "+1,10 ₽ за неделю" },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-[#111318] border border-[#1e2330] p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] uppercase tracking-[0.15em] text-[#4a5568]">{kpi.label}</span>
                      <Icon name={kpi.icon} size={13} className="text-[#2a3248]" />
                    </div>
                    <div className="text-lg font-semibold text-[#e2e8f0]">{kpi.value}</div>
                    <div className="text-[10px] text-[#4a5568] mt-1">{kpi.sub}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => openOrder()}
                  className="bg-[#c9a84c] text-black p-5 flex items-center gap-3 hover:bg-[#d4b85a] transition-colors text-left"
                >
                  <Icon name="Plus" size={16} />
                  <div>
                    <div className="text-sm font-semibold">Новая заявка</div>
                    <div className="text-[11px] opacity-70 mt-0.5">ИИ заполнит по истории</div>
                  </div>
                </button>
                <button
                  onClick={() => setSection("catalog")}
                  className="bg-[#111318] border border-[#1e2330] p-5 flex items-center gap-3 hover:bg-[#1a1f2e] transition-colors text-left"
                >
                  <Icon name="Fuel" size={16} className="text-[#8896aa]" />
                  <div>
                    <div className="text-sm font-semibold text-[#e2e8f0]">Каталог топлива</div>
                    <div className="text-[11px] text-[#4a5568] mt-0.5">6 позиций, цены актуальны</div>
                  </div>
                </button>
                <button
                  onClick={() => setSection("orders")}
                  className="bg-[#111318] border border-[#1e2330] p-5 flex items-center gap-3 hover:bg-[#1a1f2e] transition-colors text-left"
                >
                  <Icon name="Truck" size={16} className="text-[#8896aa]" />
                  <div>
                    <div className="text-sm font-semibold text-[#e2e8f0]">Мои заявки</div>
                    <div className="text-[11px] text-[#4a5568] mt-0.5">3 активных заявки</div>
                  </div>
                </button>
              </div>

              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#4a5568] mb-3">Последние заявки</div>
                <div className="bg-[#111318] border border-[#1e2330]">
                  {ORDERS.map((o, i) => (
                    <div key={o.id} className={`flex items-center justify-between px-5 py-3.5 ${i < ORDERS.length - 1 ? "border-b border-[#1e2330]" : ""} hover:bg-[#1a1f2e] transition-colors`}>
                      <div className="flex items-center gap-5">
                        <span className="text-[10px] font-mono text-[#4a5568] w-28">{o.id}</span>
                        <span className="text-sm text-[#c9d6e5]">{o.fuel}</span>
                        <span className="text-xs text-[#4a5568]">{o.volume}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-sm font-medium text-[#e2e8f0]">{o.total}</span>
                        <span className={`text-xs ${o.statusColor}`}>{o.status}</span>
                        <span className="text-[11px] text-[#4a5568]">{o.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CATALOG */}
          {section === "catalog" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-xl font-semibold text-[#e2e8f0] tracking-tight">Каталог топлива</h1>
                <p className="text-xs text-[#4a5568] mt-1">Цены обновлены: 06.05.2026, 09:00 МСК</p>
              </div>

              <div className="bg-[#111318] border border-[#1e2330]">
                <div className="grid grid-cols-6 px-5 py-3 border-b border-[#1e2330]">
                  {["Наименование", "Цена", "Изменение", "Мин. объём", "Доступность", ""].map((h, i) => (
                    <div key={i} className="text-[9px] uppercase tracking-[0.15em] text-[#4a5568]">{h}</div>
                  ))}
                </div>
                {FUEL_DATA.map((fuel, i) => (
                  <div
                    key={fuel.id}
                    className={`grid grid-cols-6 items-center px-5 py-4 ${i < FUEL_DATA.length - 1 ? "border-b border-[#1e2330]" : ""} hover:bg-[#1a1f2e] transition-colors`}
                  >
                    <div className="font-medium text-[#c9d6e5]">{fuel.name}</div>
                    <div className="font-semibold text-[#e2e8f0]">
                      {fuel.price.toFixed(2)} <span className="text-[10px] font-normal text-[#4a5568]">₽/л</span>
                    </div>
                    <div className={`text-sm font-medium ${fuel.change > 0 ? "text-red-400" : fuel.change < 0 ? "text-emerald-400" : "text-[#4a5568]"}`}>
                      {fuel.change > 0 ? "▲ +" : fuel.change < 0 ? "▼ " : ""}{fuel.change !== 0 ? Math.abs(fuel.change).toFixed(2) : "—"}
                    </div>
                    <div className="text-xs text-[#8896aa]">{fuel.volume}</div>
                    <div>
                      {fuel.available ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />В наличии
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#4a5568]">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#4a5568]" />Нет в наличии
                        </span>
                      )}
                    </div>
                    <div>
                      {fuel.available && (
                        <button
                          onClick={() => openOrder(fuel.name)}
                          className="text-xs px-3 py-1.5 bg-[#c9a84c] text-black hover:bg-[#d4b85a] transition-colors font-medium"
                        >
                          Заказать
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ORDERS */}
          {section === "orders" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-[#e2e8f0] tracking-tight">Заявки</h1>
                  <p className="text-xs text-[#4a5568] mt-1">Создание и отслеживание заявок на поставку</p>
                </div>
                <button
                  onClick={() => openOrder()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#c9a84c] text-black text-sm font-medium hover:bg-[#d4b85a] transition-colors"
                >
                  <Icon name="Plus" size={13} />
                  Создать заявку
                </button>
              </div>

              <div className="flex gap-2">
                {["Все", "Активные", "Доставляются", "Исполнены"].map((f, i) => (
                  <button
                    key={f}
                    className={`px-3 py-1.5 text-[11px] border transition-colors ${i === 0 ? "border-[#c9a84c] text-[#c9a84c]" : "border-[#1e2330] text-[#4a5568] hover:border-[#8896aa] hover:text-[#8896aa]"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {ORDERS.map((o) => (
                  <div key={o.id} className="bg-[#111318] border border-[#1e2330] p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-5">
                        <div>
                          <div className="font-mono text-[10px] text-[#4a5568] mb-1">{o.id}</div>
                          <div className="font-medium text-[#c9d6e5]">{o.fuel}</div>
                        </div>
                        <div className="w-px h-9 bg-[#1e2330]" />
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-1">Объём</div>
                          <div className="text-sm text-[#c9d6e5]">{o.volume}</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-1">Сумма</div>
                          <div className="text-sm font-semibold text-[#e2e8f0]">{o.total}</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-1">Дата</div>
                          <div className="text-sm text-[#c9d6e5]">{o.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${o.statusColor}`}>{o.status}</span>
                        <button className="text-[11px] px-3 py-1.5 border border-[#1e2330] text-[#8896aa] hover:border-[#8896aa] transition-colors">
                          Подробнее
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#1e2330]">
                      <div className="flex justify-between text-[9px] text-[#4a5568] uppercase tracking-wider mb-2">
                        {["Создана", "Подтверждена", "В доставке", "Исполнена"].map((s, i) => (
                          <span key={s} className={o.progress >= (i + 1) * 25 || (i === 0) ? "text-[#c9a84c]" : ""}>{s}</span>
                        ))}
                      </div>
                      <div className="h-0.5 bg-[#1e2330]">
                        <div className="h-0.5 bg-[#c9a84c] transition-all" style={{ width: `${o.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HISTORY */}
          {section === "history" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-xl font-semibold text-[#e2e8f0] tracking-tight">История покупок</h1>
                <p className="text-xs text-[#4a5568] mt-1">Все исполненные заказы</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Всего заказов", value: "47" },
                  { label: "Общий объём", value: "284 000 л" },
                  { label: "Общая сумма", value: "18,2 млн ₽" },
                ].map((s) => (
                  <div key={s.label} className="bg-[#111318] border border-[#1e2330] px-5 py-4">
                    <div className="text-[9px] uppercase tracking-[0.15em] text-[#4a5568] mb-2">{s.label}</div>
                    <div className="text-xl font-semibold text-[#e2e8f0]">{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="bg-[#111318] border border-[#1e2330]">
                <div className="grid grid-cols-5 px-5 py-3 border-b border-[#1e2330]">
                  {["№ Заявки", "Топливо", "Объём", "Сумма", "Дата"].map((h) => (
                    <div key={h} className="text-[9px] uppercase tracking-[0.15em] text-[#4a5568]">{h}</div>
                  ))}
                </div>
                {HISTORY.map((h, i) => (
                  <div
                    key={h.id}
                    className={`grid grid-cols-5 items-center px-5 py-3.5 ${i < HISTORY.length - 1 ? "border-b border-[#1e2330]" : ""} hover:bg-[#1a1f2e] transition-colors`}
                  >
                    <div className="font-mono text-[10px] text-[#4a5568]">{h.id}</div>
                    <div className="text-sm text-[#c9d6e5]">{h.fuel}</div>
                    <div className="text-sm text-[#8896aa]">{h.volume}</div>
                    <div className="text-sm font-medium text-[#e2e8f0]">{h.total}</div>
                    <div className="text-[11px] text-[#4a5568]">{h.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE */}
          {section === "profile" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-xl font-semibold text-[#e2e8f0] tracking-tight">Профиль компании</h1>
                <p className="text-xs text-[#4a5568] mt-1">Реквизиты и данные организации</p>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="bg-[#111318] border border-[#1e2330] p-6 space-y-5">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#4a5568] pb-3 border-b border-[#1e2330]">Основная информация</div>
                  {[
                    { label: "Полное наименование", value: "Акционерное общество «АгроГрупп»" },
                    { label: "Краткое наименование", value: "АО «АгроГрупп»" },
                    { label: "ИНН", value: "7701234567" },
                    { label: "КПП", value: "770101001" },
                    { label: "ОГРН", value: "1027700123456" },
                  ].map((f) => (
                    <div key={f.label}>
                      <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-1">{f.label}</div>
                      <div className="text-sm text-[#c9d6e5]">{f.value}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#111318] border border-[#1e2330] p-6 space-y-5">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#4a5568] pb-3 border-b border-[#1e2330]">Банковские реквизиты</div>
                  {[
                    { label: "Расчётный счёт", value: "40702810700000012345" },
                    { label: "Банк", value: "ПАО «Сбербанк России»" },
                    { label: "БИК", value: "044525225" },
                    { label: "Корр. счёт", value: "30101810400000000225" },
                    { label: "Юридический адрес", value: "125009, г. Москва, ул. Тверская, д. 1" },
                  ].map((f) => (
                    <div key={f.label}>
                      <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-1">{f.label}</div>
                      <div className="text-sm text-[#c9d6e5]">{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#111318] border border-[#1e2330] p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Icon name="Sparkles" size={14} className="text-[#c9a84c]" />
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#c9a84c]">Параметры ИИ-автозаполнения</div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { label: "Предпочтительное топливо", value: "ДТ Летнее / ДТ Зимнее" },
                    { label: "Стандартный объём", value: "5 000 — 10 000 л" },
                    { label: "Адрес доставки", value: "г. Москва, ул. Промышленная, д. 12" },
                    { label: "Время приёма", value: "08:00 — 18:00" },
                    { label: "Контактное лицо", value: "Иванов А.В., +7 (495) 999-88-77" },
                    { label: "Периодичность", value: "2 раза в месяц" },
                  ].map((f) => (
                    <div key={f.label}>
                      <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-1">{f.label}</div>
                      <div className="text-sm text-[#c9d6e5]">{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CONTACTS */}
          {section === "contacts" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-xl font-semibold text-[#e2e8f0] tracking-tight">Контакты и поддержка</h1>
                <p className="text-xs text-[#4a5568] mt-1">Персональные менеджеры и служба поддержки</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {MANAGERS.map((m) => (
                  <div key={m.name} className="bg-[#111318] border border-[#1e2330] p-6">
                    <div className="w-10 h-10 bg-[#1a1f2e] border border-[#2a3248] flex items-center justify-center mb-4">
                      <Icon name="User" size={16} className="text-[#8896aa]" />
                    </div>
                    <div className="font-semibold text-[#c9d6e5] mb-0.5">{m.name}</div>
                    <div className="text-[11px] text-[#4a5568] mb-4">{m.role}</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon name="Phone" size={11} className="text-[#4a5568]" />
                        <span className="text-xs text-[#8896aa]">{m.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Mail" size={11} className="text-[#4a5568]" />
                        <span className="text-xs text-[#8896aa]">{m.email}</span>
                      </div>
                    </div>
                    <button className="mt-5 w-full py-2 border border-[#1e2330] text-[11px] text-[#8896aa] hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors">
                      Написать
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-[#111318] border border-[#1e2330] p-6">
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#4a5568] mb-5">Офис компании</div>
                <div className="grid grid-cols-3 gap-8">
                  {[
                    { icon: "MapPin", label: "Адрес", value: "125009, г. Москва,\nул. Тверская, д. 1, офис 301" },
                    { icon: "Clock", label: "Режим работы", value: "Пн–Пт: 09:00–18:00\nСб–Вс: выходной" },
                    { icon: "Globe", label: "Сайт", value: "www.toplivohub.ru" },
                  ].map((c) => (
                    <div key={c.label} className="flex gap-3">
                      <Icon name={c.icon} size={14} className="text-[#c9a84c] mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-1">{c.label}</div>
                        <div className="text-sm text-[#8896aa] whitespace-pre-line">{c.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-[#111318] border border-[#1e2330] w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2330]">
              <div>
                <div className="font-semibold text-[#e2e8f0]">Новая заявка на поставку</div>
                <div className="text-[11px] text-[#4a5568] mt-0.5">Заполните параметры или используйте ИИ</div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[#4a5568] hover:text-[#e2e8f0] transition-colors">
                <Icon name="X" size={15} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <button
                onClick={handleAiFill}
                disabled={aiLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#c9a84c] text-[#c9a84c] text-sm hover:bg-[#c9a84c] hover:text-black transition-all disabled:opacity-60"
              >
                {aiLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                    <span>ИИ анализирует историю заказов...</span>
                  </>
                ) : (
                  <>
                    <Icon name="Sparkles" size={13} />
                    <span>Заполнить автоматически (ИИ)</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-[#4a5568] mb-1.5">Вид топлива</label>
                  <input
                    value={form.fuel}
                    onChange={(e) => setForm({ ...form, fuel: e.target.value })}
                    placeholder="ДТ Летнее"
                    className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#2a3248] focus:outline-none focus:border-[#c9a84c] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-[#4a5568] mb-1.5">Объём (л)</label>
                  <input
                    value={form.volume}
                    onChange={(e) => setForm({ ...form, volume: e.target.value })}
                    placeholder="5 000"
                    className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#2a3248] focus:outline-none focus:border-[#c9a84c] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-[#4a5568] mb-1.5">Адрес доставки</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Полный адрес"
                  className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#2a3248] focus:outline-none focus:border-[#c9a84c] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-[#4a5568] mb-1.5">Желаемая дата</label>
                <input
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  placeholder="ДД.ММ.ГГГГ"
                  className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#2a3248] focus:outline-none focus:border-[#c9a84c] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-[#4a5568] mb-1.5">Комментарий</label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  rows={3}
                  placeholder="Дополнительные условия поставки"
                  className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#2a3248] focus:outline-none focus:border-[#c9a84c] transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-[#1e2330] text-sm text-[#8896aa] hover:border-[#8896aa] transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 bg-[#c9a84c] text-black text-sm font-semibold hover:bg-[#d4b85a] transition-colors"
              >
                Отправить заявку
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
