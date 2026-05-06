import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

type Section = "home" | "catalog" | "orders" | "history" | "profile" | "contacts";

const COMPANY = {
  name: "СИНЕД",
  fullName: "ООО «СИНЕД»",
  tagline: "Поставки топлива · СПБ и СЗФО",
  region: "Санкт-Петербург и Ленинградская область",
  inn: "7800000000",
  phone: "+7 (812) 000-00-00",
  email: "info@sined.ru",
};

const FUEL_DATA = [
  { id: 1, name: "ДТ Летнее", price: 64.20, available: true, volume: "от 1 000 л", change: +1.10 },
  { id: 2, name: "ДТ Зимнее", price: 67.90, available: true, volume: "от 1 000 л", change: +0.50 },
  { id: 3, name: "ДТ Арктическое", price: 74.50, available: true, volume: "от 2 000 л", change: +0.80 },
  { id: 4, name: "Мазут М-100", price: 38.60, available: true, volume: "от 5 000 л", change: -0.40 },
  { id: 5, name: "Топочный мазут", price: 41.20, available: true, volume: "от 5 000 л", change: 0 },
  { id: 6, name: "АИ-92", price: 54.30, available: true, volume: "от 500 л", change: +0.20 },
  { id: 7, name: "АИ-95", price: 57.80, available: true, volume: "от 500 л", change: -0.10 },
  { id: 8, name: "Печное топливо", price: 58.40, available: false, volume: "от 2 000 л", change: 0 },
];

const ORDERS = [
  { id: "СН-2026-0047", fuel: "ДТ Летнее", volume: "5 000 л", total: "321 000 ₽", status: "Доставляется", date: "06.05.2026", statusColor: "text-amber-400", progress: 66 },
  { id: "СН-2026-0046", fuel: "Мазут М-100", volume: "10 000 л", total: "386 000 ₽", status: "Подтверждена", date: "05.05.2026", statusColor: "text-blue-400", progress: 33 },
  { id: "СН-2026-0045", fuel: "ДТ Зимнее", volume: "3 000 л", total: "203 700 ₽", status: "Исполнена", date: "03.05.2026", statusColor: "text-emerald-400", progress: 100 },
];

const HISTORY = [
  { id: "СН-2026-0044", fuel: "ДТ Летнее", volume: "10 000 л", total: "642 000 ₽", date: "28.04.2026" },
  { id: "СН-2026-0038", fuel: "Мазут М-100", volume: "15 000 л", total: "579 000 ₽", date: "15.04.2026" },
  { id: "СН-2026-0031", fuel: "ДТ Зимнее", volume: "5 000 л", total: "339 500 ₽", date: "02.04.2026" },
  { id: "СН-2026-0025", fuel: "Топочный мазут", volume: "8 000 л", total: "329 600 ₽", date: "18.03.2026" },
  { id: "СН-2026-0019", fuel: "ДТ Летнее", volume: "7 000 л", total: "449 400 ₽", date: "05.03.2026" },
];

const MANAGERS = [
  { name: "Алексей Смирнов", role: "Менеджер по продажам", phone: "+7 (812) 000-00-01", email: "smirnov@sined.ru" },
  { name: "Ирина Козлова", role: "Технический консультант", phone: "+7 (812) 000-00-02", email: "kozlova@sined.ru" },
  { name: "Диспетчерская", role: "Круглосуточно", phone: "+7 (812) 000-00-00", email: "dispatch@sined.ru" },
];

interface OrderForm {
  fuel: string;
  volume: string;
  address: string;
  date: string;
  comment: string;
}

// === ЧАТ-БОТ ===
interface ChatMessage {
  from: "bot" | "user";
  text: string;
  options?: string[];
}

type BotStep = "greeting" | "name" | "fuel" | "address" | "volume" | "summary" | "done";

const BOT_FUEL_OPTIONS = ["ДТ Летнее", "ДТ Зимнее", "ДТ Арктическое", "Мазут М-100", "Топочный мазут", "АИ-92 / АИ-95", "Печное топливо"];

function calcPrice(fuel: string, volume: number): string {
  const prices: Record<string, number> = {
    "ДТ Летнее": 64.20, "ДТ Зимнее": 67.90, "ДТ Арктическое": 74.50,
    "Мазут М-100": 38.60, "Топочный мазут": 41.20,
    "АИ-92 / АИ-95": 56.00, "Печное топливо": 58.40,
  };
  const p = prices[fuel] ?? 60;
  const total = Math.round(p * volume);
  return total.toLocaleString("ru-RU") + " ₽";
}

const Index = () => {
  const [section, setSection] = useState<Section>("home");
  const [showModal, setShowModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState<OrderForm>({ fuel: "", volume: "", address: "", date: "", comment: "" });
  const [preselectedFuel, setPreselectedFuel] = useState("");

  // Чат-бот
  const [showChat, setShowChat] = useState(false);
  const [botStep, setBotStep] = useState<BotStep>("greeting");
  const [botData, setBotData] = useState({ name: "", fuel: "", address: "", volume: "" });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: "bot",
      text: "Добрый день! Я помогу оформить заявку на поставку топлива.\n\nКак вас зовут?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        address: "г. Санкт-Петербург, ул. Промышленная, д. 12, котельная №3",
        date: "12.05.2026",
        comment: "Поставка на котельную. Приём с 08:00 до 18:00. Контактное лицо: директор.",
      });
      setAiLoading(false);
    }, 1600);
  };

  const pushMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleBotOption = (option: string) => {
    pushMessage({ from: "user", text: option });
    processBotInput(option);
  };

  const handleBotSend = () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput("");
    pushMessage({ from: "user", text });
    processBotInput(text);
  };

  const processBotInput = (input: string) => {
    setTimeout(() => {
      if (botStep === "greeting" || botStep === "name") {
        const name = input.trim();
        setBotData((d) => ({ ...d, name }));
        setBotStep("fuel");
        pushMessage({
          from: "bot",
          text: `Приятно познакомиться, ${name}!\n\nКакое топливо вам нужно?`,
          options: BOT_FUEL_OPTIONS,
        });
      } else if (botStep === "fuel") {
        setBotData((d) => ({ ...d, fuel: input }));
        setBotStep("address");
        pushMessage({
          from: "bot",
          text: `Отлично, ${input}.\n\nКуда доставить? Укажите адрес объекта (котельная, предприятие) в СПБ или Ленинградской области.`,
        });
      } else if (botStep === "address") {
        setBotData((d) => ({ ...d, address: input }));
        setBotStep("volume");
        pushMessage({
          from: "bot",
          text: "Понял адрес.\n\nКакой объём вам нужен? Укажите в литрах или тоннах.",
          options: ["1 000 л", "3 000 л", "5 000 л", "10 000 л", "20 000 л"],
        });
      } else if (botStep === "volume") {
        const volStr = input.replace(/[^\d]/g, "");
        const vol = parseInt(volStr) || 5000;
        const fuel = botData.fuel;
        const approxPrice = calcPrice(fuel, vol);
        setBotData((d) => ({ ...d, volume: input }));
        setBotStep("summary");
        pushMessage({
          from: "bot",
          text: `Ваша заявка:\n\n👤 Заказчик: ${botData.name}\n⛽ Топливо: ${fuel}\n📍 Адрес: ${botData.address}\n📦 Объём: ${input}\n\n💰 Ориентировочная стоимость: ${approxPrice}\n\n⚠️ Финальная цена уточняется у менеджера — зависит от адреса доставки и условий.\n\nОтправить заявку менеджеру?`,
          options: ["Да, отправить заявку", "Изменить данные"],
        });
      } else if (botStep === "summary") {
        if (input === "Да, отправить заявку") {
          setBotStep("done");
          pushMessage({
            from: "bot",
            text: `Заявка принята! ✅\n\nМенеджер свяжется с вами в течение 30 минут.\n\nПо срочным вопросам:\n📞 ${COMPANY.phone}`,
          });
        } else {
          setBotStep("name");
          setBotData({ name: "", fuel: "", address: "", volume: "" });
          pushMessage({
            from: "bot",
            text: "Хорошо, начнём заново. Как вас зовут?",
          });
        }
      } else if (botStep === "done") {
        pushMessage({
          from: "bot",
          text: `Если нужна новая заявка — напишите «Новая заявка» или просто начните сначала.`,
          options: ["Оформить новую заявку"],
        });
        if (input.toLowerCase().includes("нов")) {
          setBotStep("name");
          setBotData({ name: "", fuel: "", address: "", volume: "" });
        }
      }
    }, 400);
  };

  const resetChat = () => {
    setBotStep("greeting");
    setBotData({ name: "", fuel: "", address: "", volume: "" });
    setMessages([{ from: "bot", text: "Добрый день! Я помогу оформить заявку на поставку топлива.\n\nКак вас зовут?" }]);
  };

  const navItems: { id: Section; label: string; icon: string }[] = [
    { id: "home", label: "Главная", icon: "LayoutDashboard" },
    { id: "catalog", label: "Каталог", icon: "Fuel" },
    { id: "orders", label: "Заявки", icon: "ClipboardList" },
    { id: "history", label: "История", icon: "History" },
    { id: "profile", label: "Профиль", icon: "Building2" },
    { id: "contacts", label: "Контакты", icon: "PhoneCall" },
  ];

  const Modal = () => (
    <div className="fixed inset-0 bg-black/75 flex items-end md:items-center justify-center z-50 p-0 md:p-4"
      onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
      <div className="bg-[#111318] border border-[#1e2330] w-full md:max-w-md animate-scale-in rounded-t-2xl md:rounded-none">
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-[#2a3248] rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2330]">
          <div>
            <div className="font-semibold text-[#e2e8f0]">Новая заявка</div>
            <div className="text-[11px] text-[#4a5568] mt-0.5">СИНЕД · СПБ и Ленинградская область</div>
          </div>
          <button onClick={() => setShowModal(false)} className="text-[#4a5568] hover:text-[#e2e8f0] transition-colors p-1">
            <Icon name="X" size={15} />
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-auto">
          <button onClick={handleAiFill} disabled={aiLoading}
            className="w-full flex items-center justify-center gap-2 py-3 border border-[#c9a84c] text-[#c9a84c] text-sm hover:bg-[#c9a84c] hover:text-black transition-all disabled:opacity-60">
            {aiLoading ? (
              <><div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" /><span>Анализирую историю...</span></>
            ) : (
              <><Icon name="Sparkles" size={13} /><span>Заполнить автоматически (ИИ)</span></>
            )}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#4a5568] mb-1.5">Вид топлива</label>
              <input value={form.fuel} onChange={(e) => setForm({ ...form, fuel: e.target.value })} placeholder="ДТ Летнее"
                className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#2a3248] focus:outline-none focus:border-[#c9a84c] transition-colors" />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#4a5568] mb-1.5">Объём (л)</label>
              <input value={form.volume} onChange={(e) => setForm({ ...form, volume: e.target.value })} placeholder="5 000"
                className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#2a3248] focus:outline-none focus:border-[#c9a84c] transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-[#4a5568] mb-1.5">Адрес доставки</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="СПБ или Ленинградская область"
              className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#2a3248] focus:outline-none focus:border-[#c9a84c] transition-colors" />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-[#4a5568] mb-1.5">Желаемая дата</label>
            <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="ДД.ММ.ГГГГ"
              className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#2a3248] focus:outline-none focus:border-[#c9a84c] transition-colors" />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-[#4a5568] mb-1.5">Комментарий</label>
            <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} rows={3}
              placeholder="Тип объекта, условия приёма..."
              className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#2a3248] focus:outline-none focus:border-[#c9a84c] transition-colors resize-none" />
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-6 pt-1">
          <button onClick={() => setShowModal(false)}
            className="flex-1 py-3 border border-[#1e2330] text-sm text-[#8896aa] hover:border-[#8896aa] transition-colors">Отмена</button>
          <button onClick={() => setShowModal(false)}
            className="flex-1 py-3 bg-[#c9a84c] text-black text-sm font-semibold hover:bg-[#d4b85a] transition-colors">Отправить заявку</button>
        </div>
      </div>
    </div>
  );

  // Чат-виджет
  const ChatWidget = () => (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end gap-3">
      {showChat && (
        <div className="w-[340px] md:w-[380px] bg-[#111318] border border-[#1e2330] shadow-2xl animate-scale-in flex flex-col"
          style={{ height: "520px", maxHeight: "80vh" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2330] bg-[#0d0f14]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#c9a84c] flex items-center justify-center shrink-0">
                <Icon name="Bot" size={13} className="text-black" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#e2e8f0]">Ассистент СИНЕД</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[9px] text-[#4a5568]">Онлайн · оформление заявок</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={resetChat} className="text-[#4a5568] hover:text-[#8896aa] transition-colors p-1" title="Новый диалог">
                <Icon name="RotateCcw" size={13} />
              </button>
              <button onClick={() => setShowChat(false)} className="text-[#4a5568] hover:text-[#e2e8f0] transition-colors p-1">
                <Icon name="X" size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] space-y-2`}>
                  <div className={`px-3 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    msg.from === "bot"
                      ? "bg-[#1a1f2e] text-[#c9d6e5] rounded-tr-xl rounded-br-xl rounded-bl-xl"
                      : "bg-[#c9a84c] text-black rounded-tl-xl rounded-bl-xl rounded-br-xl font-medium"
                  }`}>
                    {msg.text}
                  </div>
                  {msg.options && msg.from === "bot" && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.options.map((opt) => (
                        <button key={opt} onClick={() => handleBotOption(opt)}
                          className="text-[11px] px-2.5 py-1.5 border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-colors">
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          {botStep !== "done" && (
            <div className="border-t border-[#1e2330] px-3 py-3 flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBotSend()}
                placeholder="Введите ответ..."
                className="flex-1 bg-[#0d0f14] border border-[#1e2330] px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#2a3248] focus:outline-none focus:border-[#c9a84c] transition-colors"
              />
              <button onClick={handleBotSend}
                className="px-3 py-2 bg-[#c9a84c] text-black hover:bg-[#d4b85a] transition-colors">
                <Icon name="Send" size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button onClick={() => setShowChat((v) => !v)}
        className="w-12 h-12 bg-[#c9a84c] text-black flex items-center justify-center shadow-lg hover:bg-[#d4b85a] transition-all hover:scale-105">
        <Icon name={showChat ? "X" : "MessageCircle"} size={20} />
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0d0f14] text-[#e2e8f0] font-['IBM_Plex_Sans',sans-serif]">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 min-h-screen bg-[#111318] border-r border-[#1e2330] flex-col shrink-0">
        <div className="px-5 py-5 border-b border-[#1e2330]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#c9a84c] flex items-center justify-center shrink-0">
              <Icon name="Fuel" size={16} className="text-black" />
            </div>
            <div>
              <div className="text-base font-bold tracking-[0.2em] uppercase text-[#e2e8f0]">СИНЕД</div>
              <div className="text-[9px] text-[#4a5568] tracking-wider uppercase mt-0.5">СПБ и СЗФО</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150 text-left ${
                section === item.id ? "bg-[#c9a84c] text-black font-medium" : "text-[#8896aa] hover:bg-[#1a1f2e] hover:text-[#e2e8f0]"
              }`}>
              <Icon name={item.icon} size={15} />
              <span className="tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-[#1e2330]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#1a1f2e] border border-[#2a3248] flex items-center justify-center text-[10px] font-semibold text-[#8896aa]">КП</div>
            <div>
              <div className="text-xs font-medium text-[#c9d6e5]">Котельная «Пулково»</div>
              <div className="text-[9px] text-[#4a5568]">Клиент СИНЕД</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile header */}
        <header className="md:hidden h-14 border-b border-[#1e2330] bg-[#111318] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#c9a84c] flex items-center justify-center shrink-0">
              <Icon name="Fuel" size={12} className="text-black" />
            </div>
            <span className="text-base font-bold tracking-[0.2em] uppercase text-[#e2e8f0]">СИНЕД</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-[#4a5568]">СПБ и СЗФО</span>
          </div>
        </header>

        {/* Desktop header */}
        <header className="hidden md:flex h-12 border-b border-[#1e2330] bg-[#111318] items-center justify-between px-8 shrink-0">
          <div className="text-[9px] text-[#4a5568] uppercase tracking-[0.2em]">
            {navItems.find((n) => n.id === section)?.label}
          </div>
          <div className="flex items-center gap-6">
            <div className="text-[11px] text-[#4a5568]">Санкт-Петербург и Лен. область</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-[#4a5568]">Система активна</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">

          {/* HOME */}
          {section === "home" && (
            <div className="space-y-5 md:space-y-7 animate-fade-in">
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-[#e2e8f0] tracking-tight">Личный кабинет клиента</h1>
                <p className="text-xs text-[#4a5568] mt-1">СИНЕД · Поставки топлива по СПБ и Ленинградской области</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: "Заявок в работе", value: "3", icon: "ClipboardList", sub: "+1 за неделю" },
                  { label: "Закупок в мае", value: "2", icon: "ShoppingCart", sub: "321 000 ₽" },
                  { label: "Итого с начала года", value: "2,3 млн ₽", icon: "TrendingUp", sub: "47 поставок" },
                  { label: "Цена ДТ сегодня", value: "64,20 ₽/л", icon: "Fuel", sub: "+1,10 ₽ за неделю" },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-[#111318] border border-[#1e2330] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] uppercase tracking-[0.12em] text-[#4a5568] leading-tight">{kpi.label}</span>
                      <Icon name={kpi.icon} size={12} className="text-[#2a3248] shrink-0" />
                    </div>
                    <div className="text-base md:text-lg font-semibold text-[#e2e8f0]">{kpi.value}</div>
                    <div className="text-[10px] text-[#4a5568] mt-1">{kpi.sub}</div>
                  </div>
                ))}
              </div>

              {/* Bot CTA */}
              <button onClick={() => setShowChat(true)}
                className="w-full bg-[#1a1f2e] border border-[#c9a84c]/40 p-4 flex items-center gap-4 hover:border-[#c9a84c] transition-colors text-left group">
                <div className="w-10 h-10 bg-[#c9a84c] flex items-center justify-center shrink-0">
                  <Icon name="Bot" size={18} className="text-black" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#e2e8f0]">Оформить заявку через чат</div>
                  <div className="text-[11px] text-[#4a5568] mt-0.5">Бот поможет указать топливо, адрес и объём · расчёт стоимости за 2 минуты</div>
                </div>
                <Icon name="ChevronRight" size={16} className="text-[#4a5568] group-hover:text-[#c9a84c] transition-colors" />
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => openOrder()}
                  className="bg-[#c9a84c] text-black p-4 flex items-center gap-3 hover:bg-[#d4b85a] transition-colors text-left">
                  <Icon name="Plus" size={16} />
                  <div>
                    <div className="text-sm font-semibold">Новая заявка</div>
                    <div className="text-[11px] opacity-70 mt-0.5">Форма с ИИ</div>
                  </div>
                </button>
                <button onClick={() => setSection("catalog")}
                  className="bg-[#111318] border border-[#1e2330] p-4 flex items-center gap-3 hover:bg-[#1a1f2e] transition-colors text-left">
                  <Icon name="Fuel" size={16} className="text-[#8896aa] shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-[#e2e8f0]">Каталог</div>
                    <div className="text-[10px] text-[#4a5568] mt-0.5">8 позиций</div>
                  </div>
                </button>
              </div>

              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#4a5568] mb-3">Последние заявки</div>
                <div className="bg-[#111318] border border-[#1e2330] divide-y divide-[#1e2330]">
                  {ORDERS.map((o) => (
                    <div key={o.id} className="px-4 py-3.5 hover:bg-[#1a1f2e] transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[#c9d6e5]">{o.fuel}</span>
                        <span className={`text-xs font-medium ${o.statusColor}`}>{o.status}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#4a5568]">{o.volume} · {o.date}</span>
                        <span className="text-sm font-semibold text-[#e2e8f0]">{o.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CATALOG */}
          {section === "catalog" && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-[#e2e8f0] tracking-tight">Каталог топлива</h1>
                <p className="text-xs text-[#4a5568] mt-1">СИНЕД · Поставки по СПБ и Ленинградской области · Цены обновлены 06.05.2026</p>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {FUEL_DATA.map((fuel) => (
                  <div key={fuel.id} className="bg-[#111318] border border-[#1e2330] p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-[#c9d6e5]">{fuel.name}</div>
                        <div className="text-[10px] text-[#4a5568] mt-0.5">{fuel.volume}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#e2e8f0]">{fuel.price.toFixed(2)} ₽</div>
                        <div className={`text-xs font-medium ${fuel.change > 0 ? "text-red-400" : fuel.change < 0 ? "text-emerald-400" : "text-[#4a5568]"}`}>
                          {fuel.change > 0 ? "▲ +" : fuel.change < 0 ? "▼ " : ""}{fuel.change !== 0 ? Math.abs(fuel.change).toFixed(2) : "—"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      {fuel.available ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />В наличии
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#4a5568]">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#4a5568]" />Нет в наличии
                        </span>
                      )}
                      {fuel.available && (
                        <button onClick={() => openOrder(fuel.name)}
                          className="text-xs px-4 py-2 bg-[#c9a84c] text-black hover:bg-[#d4b85a] transition-colors font-medium">
                          Заказать
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block bg-[#111318] border border-[#1e2330]">
                <div className="grid grid-cols-6 px-5 py-3 border-b border-[#1e2330]">
                  {["Наименование", "Цена", "Изменение", "Мин. объём", "Доступность", ""].map((h, i) => (
                    <div key={i} className="text-[9px] uppercase tracking-[0.15em] text-[#4a5568]">{h}</div>
                  ))}
                </div>
                {FUEL_DATA.map((fuel, i) => (
                  <div key={fuel.id} className={`grid grid-cols-6 items-center px-5 py-4 ${i < FUEL_DATA.length - 1 ? "border-b border-[#1e2330]" : ""} hover:bg-[#1a1f2e] transition-colors`}>
                    <div className="font-medium text-[#c9d6e5]">{fuel.name}</div>
                    <div className="font-semibold text-[#e2e8f0]">{fuel.price.toFixed(2)} <span className="text-[10px] font-normal text-[#4a5568]">₽/л</span></div>
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
                        <button onClick={() => openOrder(fuel.name)}
                          className="text-xs px-3 py-1.5 bg-[#c9a84c] text-black hover:bg-[#d4b85a] transition-colors font-medium">
                          Заказать
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#111318] border border-[#1e2330] p-4 flex items-start gap-3">
                <Icon name="Info" size={14} className="text-[#c9a84c] mt-0.5 shrink-0" />
                <p className="text-xs text-[#8896aa] leading-relaxed">
                  Указаны ориентировочные цены. Финальная стоимость зависит от объёма, адреса доставки и условий договора.
                  Уточняйте у менеджера или через чат-бота.
                </p>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {section === "orders" && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg md:text-xl font-semibold text-[#e2e8f0] tracking-tight">Заявки</h1>
                  <p className="text-xs text-[#4a5568] mt-1">Создание и отслеживание поставок</p>
                </div>
                <button onClick={() => openOrder()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#c9a84c] text-black text-sm font-medium hover:bg-[#d4b85a] transition-colors">
                  <Icon name="Plus" size={13} />
                  <span className="hidden sm:inline">Создать</span>
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {["Все", "Активные", "Доставляются", "Исполнены"].map((f, i) => (
                  <button key={f}
                    className={`px-3 py-1.5 text-[11px] border transition-colors whitespace-nowrap shrink-0 ${i === 0 ? "border-[#c9a84c] text-[#c9a84c]" : "border-[#1e2330] text-[#4a5568] hover:border-[#8896aa] hover:text-[#8896aa]"}`}>
                    {f}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {ORDERS.map((o) => (
                  <div key={o.id} className="bg-[#111318] border border-[#1e2330] p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-mono text-[10px] text-[#4a5568] mb-0.5">{o.id}</div>
                        <div className="font-semibold text-[#c9d6e5]">{o.fuel}</div>
                      </div>
                      <span className={`text-sm font-medium ${o.statusColor}`}>{o.status}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[{ label: "Объём", value: o.volume }, { label: "Сумма", value: o.total }, { label: "Дата", value: o.date }].map((f) => (
                        <div key={f.label}>
                          <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-0.5">{f.label}</div>
                          <div className="text-sm text-[#c9d6e5] font-medium">{f.value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-[#1e2330]">
                      <div className="flex justify-between text-[9px] text-[#4a5568] uppercase tracking-wider mb-2">
                        {["Создана", "Подтверждена", "В доставке", "Исполнена"].map((s, i) => (
                          <span key={s} className={o.progress >= (i + 1) * 25 || i === 0 ? "text-[#c9a84c]" : ""}>{s}</span>
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
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-[#e2e8f0] tracking-tight">История покупок</h1>
                <p className="text-xs text-[#4a5568] mt-1">Все исполненные заказы</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[{ label: "Всего заказов", value: "47" }, { label: "Общий объём", value: "284 000 л" }, { label: "Общая сумма", value: "18,2 млн ₽" }].map((s) => (
                  <div key={s.label} className="bg-[#111318] border border-[#1e2330] px-4 py-3">
                    <div className="text-[9px] uppercase tracking-[0.12em] text-[#4a5568] mb-1.5 leading-tight">{s.label}</div>
                    <div className="text-base md:text-xl font-semibold text-[#e2e8f0]">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="md:hidden space-y-2">
                {HISTORY.map((h) => (
                  <div key={h.id} className="bg-[#111318] border border-[#1e2330] px-4 py-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#c9d6e5]">{h.fuel}</span>
                      <span className="text-sm font-semibold text-[#e2e8f0]">{h.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#4a5568]">{h.volume}</span>
                      <span className="text-xs text-[#4a5568]">{h.date}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden md:block bg-[#111318] border border-[#1e2330]">
                <div className="grid grid-cols-5 px-5 py-3 border-b border-[#1e2330]">
                  {["№ Заявки", "Топливо", "Объём", "Сумма", "Дата"].map((h) => (
                    <div key={h} className="text-[9px] uppercase tracking-[0.15em] text-[#4a5568]">{h}</div>
                  ))}
                </div>
                {HISTORY.map((h, i) => (
                  <div key={h.id} className={`grid grid-cols-5 items-center px-5 py-3.5 ${i < HISTORY.length - 1 ? "border-b border-[#1e2330]" : ""} hover:bg-[#1a1f2e] transition-colors`}>
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
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-[#e2e8f0] tracking-tight">Профиль компании</h1>
                <p className="text-xs text-[#4a5568] mt-1">Реквизиты и данные организации</p>
              </div>
              <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-5">
                <div className="bg-[#111318] border border-[#1e2330] p-5 space-y-4">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#4a5568] pb-3 border-b border-[#1e2330]">Основная информация</div>
                  {[
                    { label: "Полное наименование", value: "Общество с ограниченной ответственностью «СИНЕД»" },
                    { label: "Краткое наименование", value: "ООО «СИНЕД»" },
                    { label: "ИНН", value: "7800000000" },
                    { label: "КПП", value: "780101001" },
                    { label: "Регион работы", value: "Санкт-Петербург и Ленинградская область" },
                  ].map((f) => (
                    <div key={f.label}>
                      <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-0.5">{f.label}</div>
                      <div className="text-sm text-[#c9d6e5]">{f.value}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-[#111318] border border-[#1e2330] p-5 space-y-4">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#4a5568] pb-3 border-b border-[#1e2330]">Банковские реквизиты</div>
                  {[
                    { label: "Расчётный счёт", value: "40702810700000012345" },
                    { label: "Банк", value: "ПАО «Сбербанк России»" },
                    { label: "БИК", value: "044030653" },
                    { label: "Корр. счёт", value: "30101810500000000653" },
                    { label: "Юридический адрес", value: "191002, г. Санкт-Петербург, ул. Рубинштейна, д. 1" },
                  ].map((f) => (
                    <div key={f.label}>
                      <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-0.5">{f.label}</div>
                      <div className="text-sm text-[#c9d6e5]">{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#111318] border border-[#1e2330] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="Sparkles" size={13} className="text-[#c9a84c]" />
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#c9a84c]">Параметры ИИ-автозаполнения</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Предпочт. топливо", value: "ДТ Летнее / Мазут М-100" },
                    { label: "Стандартный объём", value: "5 000 — 10 000 л" },
                    { label: "Адрес доставки", value: "СПБ, котельная №3" },
                    { label: "Время приёма", value: "08:00 — 18:00" },
                    { label: "Тип объекта", value: "Котельная / Предприятие" },
                    { label: "Периодичность", value: "2 раза в месяц" },
                  ].map((f) => (
                    <div key={f.label}>
                      <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-0.5">{f.label}</div>
                      <div className="text-sm text-[#c9d6e5]">{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CONTACTS */}
          {section === "contacts" && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-[#e2e8f0] tracking-tight">Контакты СИНЕД</h1>
                <p className="text-xs text-[#4a5568] mt-1">Поставки топлива по СПБ и Ленинградской области</p>
              </div>
              <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
                {MANAGERS.map((m) => (
                  <div key={m.name} className="bg-[#111318] border border-[#1e2330] p-5">
                    <div className="flex items-center gap-3 mb-4 md:block">
                      <div className="w-9 h-9 bg-[#1a1f2e] border border-[#2a3248] flex items-center justify-center shrink-0 md:mb-4">
                        <Icon name="User" size={15} className="text-[#8896aa]" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#c9d6e5]">{m.name}</div>
                        <div className="text-[11px] text-[#4a5568]">{m.role}</div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <a href={`tel:${m.phone}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Icon name="Phone" size={12} className="text-[#4a5568]" />
                        <span className="text-xs text-[#8896aa]">{m.phone}</span>
                      </a>
                      <a href={`mailto:${m.email}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Icon name="Mail" size={12} className="text-[#4a5568]" />
                        <span className="text-xs text-[#8896aa]">{m.email}</span>
                      </a>
                    </div>
                    <button className="w-full py-2 border border-[#1e2330] text-[11px] text-[#8896aa] hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors">
                      Написать
                    </button>
                  </div>
                ))}
              </div>
              <div className="bg-[#111318] border border-[#1e2330] p-5">
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#4a5568] mb-4">СИНЕД · Офис</div>
                <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
                  {[
                    { icon: "MapPin", label: "Адрес", value: "191002, г. Санкт-Петербург,\nул. Рубинштейна, д. 1" },
                    { icon: "Clock", label: "Режим работы", value: "Пн–Пт: 09:00–18:00\nДиспетчер: круглосуточно" },
                    { icon: "Globe", label: "Сайт", value: "www.sined.ru" },
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

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111318] border-t border-[#1e2330] flex z-40">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setSection(item.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${section === item.id ? "text-[#c9a84c]" : "text-[#4a5568]"}`}>
              <Icon name={item.icon} size={18} />
              <span className="text-[9px] tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>

      {showModal && <Modal />}
      <ChatWidget />
    </div>
  );
};

export default Index;
