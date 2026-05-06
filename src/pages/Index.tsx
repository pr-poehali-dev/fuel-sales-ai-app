import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

// "landing" — публичная страница, остальные — личный кабинет
type View = "landing" | "cabinet";
type Section = "orders" | "catalog" | "history" | "profile";

const FUEL_DATA = [
  {
    id: 1, name: "ДТ Летнее", price: 64.20, available: true, volume: "от 1 000 л", change: +1.10,
    desc: "Дизельное топливо летнее для техники и котельных. Соответствует ГОСТ 32511-2013.",
    props: [{ k: "Цетановое число", v: "≥51" }, { k: "Фракционный состав 96%", v: "≤360°C" }, { k: "Содержание серы", v: "≤10 мг/кг" }],
    icon: "Droplets",
  },
  {
    id: 2, name: "ДТ Зимнее", price: 67.90, available: true, volume: "от 1 000 л", change: +0.50,
    desc: "Дизельное топливо зимнее, работает при температурах до -35°C. Для котельных и транспорта.",
    props: [{ k: "Темп. застывания", v: "-35°C" }, { k: "Цетановое число", v: "≥48" }, { k: "Содержание серы", v: "≤10 мг/кг" }],
    icon: "Snowflake",
  },
  {
    id: 3, name: "Мазут М-100", price: 38.60, available: true, volume: "от 5 000 л", change: -0.40,
    desc: "Топочный мазут марки М-100 для котельных и промышленных предприятий. Оптовые поставки.",
    props: [{ k: "Вязкость при 100°C", v: "≤ 50 мм²/с" }, { k: "Зольность", v: "≤0.14%" }, { k: "Содержание воды", v: "≤1%" }],
    icon: "Flame",
  },
  {
    id: 4, name: "Топочный мазут", price: 41.20, available: true, volume: "от 5 000 л", change: 0,
    desc: "Мазут топочный для промышленных котлов и теплогенерирующих установок.",
    props: [{ k: "Теплота сгорания", v: "≥39.4 МДж/кг" }, { k: "Температура вспышки", v: "≥90°C" }, { k: "Содержание серы", v: "≤2%" }],
    icon: "Flame",
  },
  {
    id: 5, name: "АИ-92", price: 54.30, available: true, volume: "от 500 л", change: +0.20,
    desc: "Автомобильный бензин АИ-92 для автопарков предприятий. Поставка на объект.",
    props: [{ k: "Октановое число (ИМ)", v: "≥92" }, { k: "Содержание серы", v: "≤10 мг/кг" }, { k: "Давление насыщ. паров", v: "45–80 кПа" }],
    icon: "Car",
  },
  {
    id: 6, name: "АИ-95", price: 57.80, available: true, volume: "от 500 л", change: -0.10,
    desc: "Автомобильный бензин АИ-95 для современных двигателей. Для корпоративных автопарков.",
    props: [{ k: "Октановое число (ИМ)", v: "≥95" }, { k: "Содержание серы", v: "≤10 мг/кг" }, { k: "Кислород", v: "≤2.7%" }],
    icon: "Car",
  },
];

const ORDERS = [
  { id: "СН-2026-0047", fuel: "ДТ Летнее", volume: "5 000 л", total: "321 000 ₽", status: "Доставляется", date: "06.05.2026", statusColor: "text-amber-400", progress: 66, address: "СПБ, ул. Промышленная, д.12, котельная №3", driver: "Иванов А.П.", driverPhone: "+7 (921) 000-11-22" },
  { id: "СН-2026-0046", fuel: "Мазут М-100", volume: "10 000 л", total: "386 000 ₽", status: "Подтверждена", date: "05.05.2026", statusColor: "text-blue-400", progress: 33, address: "Всеволожск, Заводской пр., д.5", driver: "", driverPhone: "" },
  { id: "СН-2026-0045", fuel: "ДТ Зимнее", volume: "3 000 л", total: "203 700 ₽", status: "Исполнена", date: "03.05.2026", statusColor: "text-emerald-400", progress: 100, address: "СПБ, Пулковское ш., д.41", driver: "", driverPhone: "" },
];

const HISTORY = [
  { id: "СН-2026-0044", fuel: "ДТ Летнее", volume: "10 000 л", total: "642 000 ₽", date: "28.04.2026" },
  { id: "СН-2026-0038", fuel: "Мазут М-100", volume: "15 000 л", total: "579 000 ₽", date: "15.04.2026" },
  { id: "СН-2026-0031", fuel: "ДТ Зимнее", volume: "5 000 л", total: "339 500 ₽", date: "02.04.2026" },
  { id: "СН-2026-0025", fuel: "Топочный мазут", volume: "8 000 л", total: "329 600 ₽", date: "18.03.2026" },
  { id: "СН-2026-0019", fuel: "ДТ Летнее", volume: "7 000 л", total: "449 400 ₽", date: "05.03.2026" },
];

interface OrderForm { fuel: string; volume: string; address: string; date: string; comment: string; }

// ===== ЧАТ-БОТ =====
interface ChatMessage { from: "bot" | "user"; text: string; options?: string[]; }
type BotStep = "name" | "fuel" | "address" | "volume" | "summary" | "done";
const BOT_FUEL_OPTIONS = FUEL_DATA.filter(f => f.available).map(f => f.name);
function calcPrice(fuel: string, volume: number): string {
  const f = FUEL_DATA.find(f => f.name === fuel);
  const p = f ? f.price : 60;
  return Math.round(p * volume).toLocaleString("ru-RU") + " ₽";
}

const Index = () => {
  const [view, setView] = useState<View>("landing");
  const [section, setSection] = useState<Section>("orders");
  const [showModal, setShowModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState<OrderForm>({ fuel: "", volume: "", address: "", date: "", comment: "" });
  const [preselectedFuel, setPreselectedFuel] = useState("");
  const [selectedFuel, setSelectedFuel] = useState<typeof FUEL_DATA[0] | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<typeof ORDERS[0] | null>(null);
  const [showMap, setShowMap] = useState(false);

  // Чат
  const [showChat, setShowChat] = useState(false);
  const [botStep, setBotStep] = useState<BotStep>("name");
  const [botData, setBotData] = useState({ name: "", fuel: "", address: "", volume: "" });
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: "bot", text: "Добрый день! Я помогу оформить заявку на поставку топлива СИНЕД.\n\nКак вас зовут?" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const openOrder = (fuel = "") => {
    setPreselectedFuel(fuel);
    setForm({ fuel, volume: "", address: "", date: "", comment: "" });
    setShowModal(true);
  };

  const handleAiFill = () => {
    setAiLoading(true);
    setTimeout(() => {
      setForm({ fuel: preselectedFuel || "ДТ Летнее", volume: "5 000", address: "г. Санкт-Петербург, котельная №3, ул. Промышленная, д. 12", date: "12.05.2026", comment: "Приём с 08:00 до 18:00." });
      setAiLoading(false);
    }, 1500);
  };

  const pushMsg = (msg: ChatMessage) => setMessages(p => [...p, msg]);
  const handleBotOption = (opt: string) => { pushMsg({ from: "user", text: opt }); processBot(opt); };
  const handleBotSend = () => { const t = chatInput.trim(); if (!t) return; setChatInput(""); pushMsg({ from: "user", text: t }); processBot(t); };
  const processBot = (input: string) => {
    setTimeout(() => {
      if (botStep === "name") {
        setBotData(d => ({ ...d, name: input }));
        setBotStep("fuel");
        pushMsg({ from: "bot", text: `Здравствуйте, ${input}!\n\nКакое топливо вас интересует?`, options: BOT_FUEL_OPTIONS });
      } else if (botStep === "fuel") {
        setBotData(d => ({ ...d, fuel: input }));
        setBotStep("address");
        pushMsg({ from: "bot", text: `${input} — принято.\n\nКуда доставить? Укажите адрес объекта (котельная, предприятие) в СПБ или Ленинградской области.` });
      } else if (botStep === "address") {
        setBotData(d => ({ ...d, address: input }));
        setBotStep("volume");
        pushMsg({ from: "bot", text: "Отлично, адрес зафиксировал.\n\nКакой объём нужен?", options: ["1 000 л", "3 000 л", "5 000 л", "10 000 л", "20 000 л"] });
      } else if (botStep === "volume") {
        const vol = parseInt(input.replace(/[^\d]/g, "")) || 5000;
        const price = calcPrice(botData.fuel, vol);
        setBotData(d => ({ ...d, volume: input }));
        setBotStep("summary");
        pushMsg({ from: "bot", text: `Ваша заявка:\n\n👤 ${botData.name}\n⛽ ${botData.fuel}\n📍 ${botData.address}\n📦 ${input}\n\n💰 Ориентировочно: ~${price}\n\n⚠️ Финальная цена — у менеджера.\n\nОтправить заявку?`, options: ["Отправить заявку", "Начать заново"] });
      } else if (botStep === "summary") {
        if (input === "Отправить заявку") {
          setBotStep("done");
          pushMsg({ from: "bot", text: `Заявка отправлена! ✅\n\nМенеджер свяжется с вами в течение 30 минут.\n\n📞 +7 (812) 000-00-00` });
        } else {
          setBotStep("name"); setBotData({ name: "", fuel: "", address: "", volume: "" });
          pushMsg({ from: "bot", text: "Хорошо, начнём сначала. Как вас зовут?" });
        }
      } else if (botStep === "done") {
        setBotStep("name"); setBotData({ name: "", fuel: "", address: "", volume: "" });
        pushMsg({ from: "bot", text: "Оформим ещё одну заявку. Как вас зовут?" });
      }
    }, 350);
  };
  const resetChat = () => { setBotStep("name"); setBotData({ name: "", fuel: "", address: "", volume: "" }); setMessages([{ from: "bot", text: "Добрый день! Я помогу оформить заявку на поставку топлива СИНЕД.\n\nКак вас зовут?" }]); };

  const navItems: { id: Section; label: string; icon: string }[] = [
    { id: "orders", label: "Заявки", icon: "ClipboardList" },
    { id: "catalog", label: "Каталог", icon: "Fuel" },
    { id: "history", label: "История", icon: "History" },
    { id: "profile", label: "Профиль", icon: "Building2" },
  ];

  // =================== LANDING ===================
  if (view === "landing") {
    return (
      <div className="min-h-screen bg-[#0d0f14] text-[#e2e8f0] font-['IBM_Plex_Sans',sans-serif]">
        {/* HEADER */}
        <header className="border-b border-[#1e2330] bg-[#111318] sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#c9a84c] flex items-center justify-center shrink-0">
                <Icon name="Fuel" size={14} className="text-black" />
              </div>
              <div>
                <span className="text-base font-bold tracking-[0.2em] uppercase text-[#e2e8f0]">СИНЕД</span>
                <span className="hidden sm:inline text-[10px] text-[#4a5568] tracking-widest uppercase ml-3">Поставки топлива</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="tel:+78120000000" className="hidden sm:flex items-center gap-2 text-sm text-[#8896aa] hover:text-[#e2e8f0] transition-colors">
                <Icon name="Phone" size={14} />+7 (812) 000-00-00
              </a>
              <button onClick={() => { setView("cabinet"); setSection("orders"); }}
                className="px-4 py-2 bg-[#c9a84c] text-black text-sm font-semibold hover:bg-[#d4b85a] transition-colors">
                Личный кабинет
              </button>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="relative border-b border-[#1e2330] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d0f14] via-[#111318] to-[#1a1f2e]" />
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%), repeating-linear-gradient(90deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)", backgroundSize: "48px 48px" }} />
          <div className="relative max-w-6xl mx-auto px-5 py-16 md:py-24">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#c9a84c]/30 text-[#c9a84c] text-[10px] uppercase tracking-widest mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
                Санкт-Петербург и Ленинградская область
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-[#e2e8f0] tracking-tight leading-tight mb-4">
                Поставки топлива<br />
                <span className="text-[#c9a84c]">для котельных</span><br />
                и предприятий
              </h1>
              <p className="text-[#8896aa] text-base md:text-lg leading-relaxed mb-8 max-w-xl">
                СИНЕД — надёжный поставщик дизельного топлива и мазута по Санкт-Петербургу и Северо-Западному региону. Работаем с котельными, промышленными предприятиями и автопарками.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => setShowChat(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#c9a84c] text-black font-semibold hover:bg-[#d4b85a] transition-colors">
                  <Icon name="MessageCircle" size={16} />
                  Оформить заявку
                </button>
                <button onClick={() => { setView("cabinet"); setSection("catalog"); }}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 border border-[#1e2330] text-[#8896aa] hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors">
                  <Icon name="Fuel" size={16} />
                  Каталог и цены
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ЦИФРЫ */}
        <section className="border-b border-[#1e2330]">
          <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1e2330]">
            {[
              { value: "14 лет", label: "на рынке СЗФО" },
              { value: "500+", label: "клиентов" },
              { value: "48 ч", label: "срок поставки" },
              { value: "24/7", label: "диспетчерская" },
            ].map(s => (
              <div key={s.label} className="bg-[#0d0f14] px-6 py-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#c9a84c] mb-1">{s.value}</div>
                <div className="text-xs text-[#4a5568] uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ЧТО МЫ ПОСТАВЛЯЕМ */}
        <section className="border-b border-[#1e2330]">
          <div className="max-w-6xl mx-auto px-5 py-12 md:py-16">
            <div className="text-[9px] uppercase tracking-[0.25em] text-[#4a5568] mb-2">Продукция</div>
            <h2 className="text-xl md:text-2xl font-bold text-[#e2e8f0] mb-8">Виды топлива</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {FUEL_DATA.map(fuel => (
                <div key={fuel.id} className="bg-[#111318] border border-[#1e2330] p-5 hover:border-[#c9a84c]/40 transition-colors group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 bg-[#1a1f2e] flex items-center justify-center">
                      <Icon name={fuel.icon} size={16} className="text-[#c9a84c]" />
                    </div>
                    {fuel.available ? (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />В наличии
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#4a5568]">Уточняйте</span>
                    )}
                  </div>
                  <div className="font-semibold text-[#e2e8f0] mb-1">{fuel.name}</div>
                  <div className="text-xs text-[#4a5568] mb-3 leading-relaxed">{fuel.desc}</div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#1e2330]">
                    <div>
                      <div className="text-[9px] text-[#4a5568] uppercase tracking-wider">от</div>
                      <div className="text-lg font-bold text-[#e2e8f0]">{fuel.price.toFixed(2)} <span className="text-xs font-normal text-[#4a5568]">₽/л</span></div>
                    </div>
                    <button onClick={() => setShowChat(true)}
                      className="text-xs px-3 py-1.5 bg-[#c9a84c] text-black font-medium hover:bg-[#d4b85a] transition-colors">
                      Заказать
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#4a5568] mt-4">* Цены ориентировочные. Финальная стоимость зависит от объёма и адреса доставки — уточняйте у менеджера.</p>
          </div>
        </section>

        {/* ПРЕИМУЩЕСТВА */}
        <section className="border-b border-[#1e2330]">
          <div className="max-w-6xl mx-auto px-5 py-12 md:py-16">
            <div className="text-[9px] uppercase tracking-[0.25em] text-[#4a5568] mb-2">Почему СИНЕД</div>
            <h2 className="text-xl md:text-2xl font-bold text-[#e2e8f0] mb-8">Надёжный партнёр для вашего бизнеса</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: "MapPin", title: "Региональное присутствие", text: "Работаем по всей Ленинградской области. Знаем специфику северного климата и требования к зимнему топливу." },
                { icon: "Truck", title: "Собственный автопарк", text: "Бензовозы разного объёма для поставки в любой точке СПБ и Ленинградской области." },
                { icon: "Shield", title: "Качество топлива", text: "Сертифицированное топливо от ведущих НПЗ. Паспорт качества и сертификат соответствия на каждую партию." },
                { icon: "Clock", title: "Срочная доставка", text: "Доставка в течение 24–48 часов. Экстренные поставки при аварийных ситуациях на котельных." },
                { icon: "FileText", title: "Полный документооборот", text: "Работаем с НДС. Все необходимые документы: ТТН, счёт-фактура, накладная." },
                { icon: "Users", title: "Персональный менеджер", text: "За каждым клиентом закреплён персональный менеджер. Сопровождение на всех этапах сделки." },
              ].map(f => (
                <div key={f.title} className="bg-[#111318] border border-[#1e2330] p-5">
                  <div className="w-8 h-8 bg-[#1a1f2e] flex items-center justify-center mb-3">
                    <Icon name={f.icon} size={15} className="text-[#c9a84c]" />
                  </div>
                  <div className="font-semibold text-[#c9d6e5] mb-2">{f.title}</div>
                  <div className="text-xs text-[#4a5568] leading-relaxed">{f.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* КЛИЕНТЫ */}
        <section className="border-b border-[#1e2330]">
          <div className="max-w-6xl mx-auto px-5 py-12 md:py-16">
            <div className="text-[9px] uppercase tracking-[0.25em] text-[#4a5568] mb-2">Клиенты</div>
            <h2 className="text-xl md:text-2xl font-bold text-[#e2e8f0] mb-8">Кому мы поставляем</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: "Factory", title: "Котельные", text: "Мазут, ДТ, печное топливо для отопительных систем" },
                { icon: "Building", title: "Предприятия", text: "Регулярные поставки для промышленных объектов" },
                { icon: "Tractor", title: "АПК и фермы", text: "ДТ для сельхозтехники в Ленинградской области" },
                { icon: "Truck", title: "Автопарки", text: "Корпоративные поставки АИ-92 и АИ-95" },
              ].map(c => (
                <div key={c.title} className="bg-[#111318] border border-[#1e2330] p-5 text-center">
                  <div className="w-10 h-10 bg-[#1a1f2e] flex items-center justify-center mx-auto mb-3">
                    <Icon name={c.icon} size={18} className="text-[#c9a84c]" />
                  </div>
                  <div className="font-semibold text-[#c9d6e5] mb-1">{c.title}</div>
                  <div className="text-xs text-[#4a5568]">{c.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA + КОНТАКТЫ */}
        <section className="border-b border-[#1e2330] bg-[#111318]">
          <div className="max-w-6xl mx-auto px-5 py-12 md:py-16 grid md:grid-cols-2 gap-10">
            <div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-[#4a5568] mb-2">Оставить заявку</div>
              <h2 className="text-xl md:text-2xl font-bold text-[#e2e8f0] mb-4">Получите расчёт стоимости за 2 минуты</h2>
              <p className="text-sm text-[#4a5568] mb-6">Наш бот поможет оформить заявку: спросит название компании, адрес объекта, вид топлива и объём — и сразу покажет ориентировочную цену.</p>
              <button onClick={() => setShowChat(true)}
                className="flex items-center gap-2 px-6 py-3.5 bg-[#c9a84c] text-black font-semibold hover:bg-[#d4b85a] transition-colors">
                <Icon name="Bot" size={16} />
                Оформить через бот
              </button>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-[#4a5568] mb-5">Контакты</div>
              <div className="space-y-4">
                {[
                  { icon: "Phone", label: "Телефон", value: "+7 (812) 000-00-00", href: "tel:+78120000000" },
                  { icon: "Mail", label: "E-mail", value: "info@sined.ru", href: "mailto:info@sined.ru" },
                  { icon: "MapPin", label: "Адрес", value: "191002, г. Санкт-Петербург, ул. Рубинштейна, д. 1", href: "" },
                  { icon: "Clock", label: "Диспетчер", value: "Круглосуточно, без выходных", href: "" },
                ].map(c => (
                  <div key={c.label} className="flex items-start gap-3">
                    <Icon name={c.icon} size={14} className="text-[#c9a84c] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-0.5">{c.label}</div>
                      {c.href ? <a href={c.href} className="text-sm text-[#8896aa] hover:text-[#c9a84c] transition-colors">{c.value}</a>
                        : <div className="text-sm text-[#8896aa]">{c.value}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="max-w-6xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#c9a84c] flex items-center justify-center">
              <Icon name="Fuel" size={9} className="text-black" />
            </div>
            <span className="text-xs text-[#4a5568]">© 2026 ООО «СИНЕД» · ИНН 7800000000</span>
          </div>
          <button onClick={() => { setView("cabinet"); setSection("orders"); }}
            className="text-xs text-[#4a5568] hover:text-[#c9a84c] transition-colors">Личный кабинет →</button>
        </footer>

        {/* ЧАТБОТ */}
        <ChatWidget showChat={showChat} setShowChat={setShowChat} messages={messages} chatInput={chatInput} setChatInput={setChatInput} handleBotSend={handleBotSend} handleBotOption={handleBotOption} resetChat={resetChat} chatEndRef={chatEndRef} botStep={botStep} />
      </div>
    );
  }

  // =================== ЛИЧНЫЙ КАБИНЕТ ===================
  return (
    <div className="flex min-h-screen bg-[#0d0f14] text-[#e2e8f0] font-['IBM_Plex_Sans',sans-serif]">

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 min-h-screen bg-[#111318] border-r border-[#1e2330] flex-col shrink-0">
        <div className="px-5 py-5 border-b border-[#1e2330]">
          <button onClick={() => setView("landing")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-[#c9a84c] flex items-center justify-center shrink-0">
              <Icon name="Fuel" size={14} className="text-black" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-[0.2em] uppercase text-[#e2e8f0]">СИНЕД</div>
              <div className="text-[9px] text-[#4a5568] tracking-wider uppercase mt-0.5">Личный кабинет</div>
            </div>
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all text-left ${section === item.id ? "bg-[#c9a84c] text-black font-medium" : "text-[#8896aa] hover:bg-[#1a1f2e] hover:text-[#e2e8f0]"}`}>
              <Icon name={item.icon} size={15} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-[#1e2330]">
          <button onClick={() => setView("landing")} className="flex items-center gap-2 text-xs text-[#4a5568] hover:text-[#c9a84c] transition-colors">
            <Icon name="ArrowLeft" size={12} />На главную
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile header */}
        <header className="md:hidden h-14 border-b border-[#1e2330] bg-[#111318] flex items-center justify-between px-4 shrink-0">
          <button onClick={() => setView("landing")} className="flex items-center gap-2">
            <Icon name="ArrowLeft" size={16} className="text-[#4a5568]" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#c9a84c] flex items-center justify-center">
                <Icon name="Fuel" size={10} className="text-black" />
              </div>
              <span className="font-bold tracking-[0.2em] uppercase text-sm">СИНЕД</span>
            </div>
          </button>
          <span className="text-xs text-[#4a5568]">{navItems.find(n => n.id === section)?.label}</span>
        </header>

        {/* Desktop header */}
        <header className="hidden md:flex h-12 border-b border-[#1e2330] bg-[#111318] items-center justify-between px-8 shrink-0">
          <div className="text-[9px] text-[#4a5568] uppercase tracking-[0.2em]">{navItems.find(n => n.id === section)?.label}</div>
          <div className="flex items-center gap-4">
            <div className="text-[11px] text-[#4a5568]">СПБ и Ленинградская область</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-[#4a5568]">Система активна</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">

          {/* ——— ЗАЯВКИ ——— */}
          {section === "orders" && !showMap && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg md:text-xl font-semibold text-[#e2e8f0]">Мои заявки</h1>
                  <p className="text-xs text-[#4a5568] mt-1">Текущие и завершённые поставки</p>
                </div>
                <button onClick={() => openOrder()} className="flex items-center gap-2 px-4 py-2.5 bg-[#c9a84c] text-black text-sm font-medium hover:bg-[#d4b85a] transition-colors">
                  <Icon name="Plus" size={13} />
                  <span className="hidden sm:inline">Новая заявка</span>
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {["Все", "Активные", "Доставляются", "Исполнены"].map((f, i) => (
                  <button key={f} className={`px-3 py-1.5 text-[11px] border whitespace-nowrap shrink-0 transition-colors ${i === 0 ? "border-[#c9a84c] text-[#c9a84c]" : "border-[#1e2330] text-[#4a5568] hover:border-[#8896aa]"}`}>{f}</button>
                ))}
              </div>

              <div className="space-y-3">
                {ORDERS.map(o => (
                  <div key={o.id} className="bg-[#111318] border border-[#1e2330] p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-mono text-[10px] text-[#4a5568] mb-0.5">{o.id}</div>
                        <div className="font-semibold text-[#c9d6e5]">{o.fuel}</div>
                        <div className="text-xs text-[#4a5568] mt-0.5 flex items-center gap-1">
                          <Icon name="MapPin" size={10} />{o.address}
                        </div>
                      </div>
                      <span className={`text-sm font-medium shrink-0 ml-3 ${o.statusColor}`}>{o.status}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[{ l: "Объём", v: o.volume }, { l: "Сумма", v: o.total }, { l: "Дата", v: o.date }].map(f => (
                        <div key={f.l}>
                          <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-0.5">{f.l}</div>
                          <div className="text-sm text-[#c9d6e5] font-medium">{f.v}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-[9px] text-[#4a5568] uppercase tracking-wider mb-1.5">
                        {["Создана", "Подтверждена", "В доставке", "Исполнена"].map((s, i) => (
                          <span key={s} className={o.progress >= (i + 1) * 25 || i === 0 ? "text-[#c9a84c]" : ""}>{s}</span>
                        ))}
                      </div>
                      <div className="h-0.5 bg-[#1e2330]">
                        <div className="h-0.5 bg-[#c9a84c] transition-all" style={{ width: `${o.progress}%` }} />
                      </div>
                    </div>

                    {o.status === "Доставляется" && (
                      <button onClick={() => { setSelectedOrder(o); setShowMap(true); }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#c9a84c]/50 text-[#c9a84c] text-sm hover:bg-[#c9a84c]/10 transition-colors">
                        <Icon name="MapPin" size={14} />
                        Смотреть на карте — где сейчас водитель
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#4a5568] mb-3">Последние покупки</div>
                <div className="bg-[#111318] border border-[#1e2330] divide-y divide-[#1e2330]">
                  {HISTORY.slice(0, 3).map(h => (
                    <div key={h.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-[#c9d6e5]">{h.fuel}</div>
                        <div className="text-xs text-[#4a5568]">{h.volume} · {h.date}</div>
                      </div>
                      <div className="text-sm font-semibold text-[#e2e8f0]">{h.total}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ——— КАРТА ВОДИТЕЛЯ ——— */}
          {section === "orders" && showMap && selectedOrder && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowMap(false)} className="flex items-center gap-1.5 text-xs text-[#4a5568] hover:text-[#e2e8f0] transition-colors">
                  <Icon name="ArrowLeft" size={14} />Назад
                </button>
                <div className="w-px h-4 bg-[#1e2330]" />
                <div>
                  <div className="font-mono text-[10px] text-[#4a5568]">{selectedOrder.id}</div>
                  <div className="text-sm font-semibold text-[#e2e8f0]">{selectedOrder.fuel} · {selectedOrder.volume}</div>
                </div>
                <span className={`ml-auto text-sm font-medium ${selectedOrder.statusColor}`}>{selectedOrder.status}</span>
              </div>

              {/* Карта — Yandex Maps embed */}
              <div className="relative bg-[#111318] border border-[#1e2330] overflow-hidden" style={{ height: "360px" }}>
                <iframe
                  src="https://yandex.ru/map-widget/v1/?ll=30.315869%2C59.939095&z=12&l=map&pt=30.315869%2C59.939095%2Cpm2rdl~30.355%2C59.955%2Cpm2gnl"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  title="Местоположение водителя"
                  allowFullScreen
                />
                {/* Overlay info */}
                <div className="absolute top-3 left-3 bg-[#111318]/90 border border-[#1e2330] px-3 py-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-medium text-[#e2e8f0]">Водитель в пути</span>
                  </div>
                  <div className="text-[10px] text-[#4a5568]">Обновлено: только что</div>
                </div>
              </div>

              {/* Водитель и маршрут */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#111318] border border-[#1e2330] p-4">
                  <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-3">Водитель</div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1a1f2e] flex items-center justify-center">
                      <Icon name="User" size={16} className="text-[#8896aa]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#c9d6e5]">{selectedOrder.driver}</div>
                      <a href={`tel:${selectedOrder.driverPhone}`} className="text-xs text-[#c9a84c] flex items-center gap-1 mt-0.5">
                        <Icon name="Phone" size={10} />{selectedOrder.driverPhone}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="bg-[#111318] border border-[#1e2330] p-4">
                  <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-3">Маршрут</div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] mt-1.5 shrink-0" />
                      <div className="text-xs text-[#8896aa]">База СИНЕД, СПБ</div>
                    </div>
                    <div className="w-px h-4 bg-[#2a3248] ml-[2.5px]" />
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0 animate-pulse" />
                      <div className="text-xs text-amber-400">Сейчас: Московский р-н, СПБ</div>
                    </div>
                    <div className="w-px h-4 bg-[#2a3248] ml-[2.5px]" />
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2a3248] mt-1.5 shrink-0" />
                      <div className="text-xs text-[#4a5568]">Пункт назначения: {selectedOrder.address}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#111318] border border-[#1e2330]/60 border-l-2 border-l-amber-400 p-4 flex items-start gap-3">
                <Icon name="Clock" size={14} className="text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-[#e2e8f0]">Ожидаемое время прибытия: ~40 минут</div>
                  <div className="text-xs text-[#4a5568] mt-0.5">Осталось примерно 18 км. При изменениях — менеджер свяжется с вами.</div>
                </div>
              </div>
            </div>
          )}

          {/* ——— КАТАЛОГ ——— */}
          {section === "catalog" && !selectedFuel && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-[#e2e8f0]">Каталог топлива</h1>
                <p className="text-xs text-[#4a5568] mt-1">Нажмите на позицию чтобы увидеть подробную информацию</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {FUEL_DATA.map(fuel => (
                  <button key={fuel.id} onClick={() => setSelectedFuel(fuel)}
                    className="bg-[#111318] border border-[#1e2330] p-5 text-left hover:border-[#c9a84c]/50 transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 bg-[#1a1f2e] flex items-center justify-center group-hover:bg-[#c9a84c]/10 transition-colors">
                        <Icon name={fuel.icon} size={16} className="text-[#c9a84c]" />
                      </div>
                      {fuel.available
                        ? <span className="text-[10px] text-emerald-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />В наличии</span>
                        : <span className="text-[10px] text-[#4a5568]">Уточняйте</span>}
                    </div>
                    <div className="font-semibold text-[#c9d6e5] mb-1">{fuel.name}</div>
                    <div className="text-xs text-[#4a5568] mb-3 leading-relaxed line-clamp-2">{fuel.desc}</div>
                    <div className="flex items-center justify-between pt-3 border-t border-[#1e2330]">
                      <div>
                        <div className="text-[9px] text-[#4a5568]">{fuel.volume}</div>
                        <div className="text-lg font-bold text-[#e2e8f0]">{fuel.price.toFixed(2)} <span className="text-xs font-normal text-[#4a5568]">₽/л</span></div>
                      </div>
                      <div className={`text-xs font-medium ${fuel.change > 0 ? "text-red-400" : fuel.change < 0 ? "text-emerald-400" : "text-[#4a5568]"}`}>
                        {fuel.change > 0 ? "▲ +" : fuel.change < 0 ? "▼ " : ""}{fuel.change !== 0 ? Math.abs(fuel.change).toFixed(2) : "—"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#4a5568]">* Цены ориентировочные. Финальная стоимость зависит от объёма и адреса — уточняйте у менеджера.</p>
            </div>
          )}

          {/* ——— ДЕТАЛЬНАЯ КАРТОЧКА ТОПЛИВА ——— */}
          {section === "catalog" && selectedFuel && (
            <div className="space-y-5 animate-fade-in">
              <button onClick={() => setSelectedFuel(null)} className="flex items-center gap-1.5 text-xs text-[#4a5568] hover:text-[#e2e8f0] transition-colors">
                <Icon name="ArrowLeft" size={14} />Назад к каталогу
              </button>

              <div className="bg-[#111318] border border-[#1e2330] p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1a1f2e] flex items-center justify-center">
                      <Icon name={selectedFuel.icon} size={22} className="text-[#c9a84c]" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-[#e2e8f0]">{selectedFuel.name}</h1>
                      <div className="text-xs text-[#4a5568] mt-0.5">Минимальный заказ: {selectedFuel.volume}</div>
                    </div>
                  </div>
                  {selectedFuel.available
                    ? <span className="text-sm text-emerald-400 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" />В наличии</span>
                    : <span className="text-sm text-[#4a5568]">Уточняйте</span>}
                </div>

                <p className="text-sm text-[#8896aa] leading-relaxed mb-6">{selectedFuel.desc}</p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-[#0d0f14] border border-[#1e2330] p-4">
                    <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-1">Цена</div>
                    <div className="text-2xl font-bold text-[#e2e8f0]">{selectedFuel.price.toFixed(2)} ₽/л</div>
                    <div className={`text-xs mt-1 font-medium ${selectedFuel.change > 0 ? "text-red-400" : selectedFuel.change < 0 ? "text-emerald-400" : "text-[#4a5568]"}`}>
                      {selectedFuel.change > 0 ? "▲ +" : selectedFuel.change < 0 ? "▼ " : ""}{selectedFuel.change !== 0 ? `${Math.abs(selectedFuel.change).toFixed(2)} к прошлой неделе` : "Без изменений"}
                    </div>
                  </div>
                  <div className="bg-[#0d0f14] border border-[#1e2330] p-4">
                    <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-1">Регион поставки</div>
                    <div className="text-sm font-semibold text-[#e2e8f0]">СПБ и Лен. область</div>
                    <div className="text-xs text-[#4a5568] mt-1">Срок: 24–48 часов</div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-3">Технические характеристики</div>
                  <div className="space-y-2">
                    {selectedFuel.props.map(p => (
                      <div key={p.k} className="flex items-center justify-between py-2 border-b border-[#1e2330]">
                        <span className="text-xs text-[#8896aa]">{p.k}</span>
                        <span className="text-xs font-medium text-[#e2e8f0]">{p.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Калькулятор */}
                <div className="bg-[#0d0f14] border border-[#1e2330] p-4 mb-4">
                  <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-3">Быстрый расчёт стоимости</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1000, 3000, 5000, 10000, 20000, 50000].map(vol => (
                      <div key={vol} className="bg-[#111318] border border-[#1e2330] px-3 py-2 text-center hover:border-[#c9a84c]/40 transition-colors cursor-default">
                        <div className="text-xs text-[#4a5568]">{vol.toLocaleString("ru-RU")} л</div>
                        <div className="text-sm font-semibold text-[#e2e8f0] mt-0.5">{calcPrice(selectedFuel.name, vol)}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#4a5568] mt-3">Финальная цена уточняется у менеджера — зависит от адреса доставки.</p>
                </div>

                {selectedFuel.available && (
                  <button onClick={() => openOrder(selectedFuel.name)}
                    className="w-full py-3.5 bg-[#c9a84c] text-black font-semibold hover:bg-[#d4b85a] transition-colors">
                    Оформить заявку на {selectedFuel.name}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ——— ИСТОРИЯ ——— */}
          {section === "history" && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-[#e2e8f0]">История покупок</h1>
                <p className="text-xs text-[#4a5568] mt-1">Все исполненные заказы</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[{ l: "Всего заказов", v: "47" }, { l: "Общий объём", v: "284 000 л" }, { l: "Общая сумма", v: "18,2 млн ₽" }].map(s => (
                  <div key={s.l} className="bg-[#111318] border border-[#1e2330] px-4 py-3">
                    <div className="text-[9px] uppercase tracking-[0.12em] text-[#4a5568] mb-1.5 leading-tight">{s.l}</div>
                    <div className="text-base md:text-xl font-semibold text-[#e2e8f0]">{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="md:hidden space-y-2">
                {HISTORY.map(h => (
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
                  {["№ Заявки", "Топливо", "Объём", "Сумма", "Дата"].map(h => (
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

          {/* ——— ПРОФИЛЬ ——— */}
          {section === "profile" && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-[#e2e8f0]">Профиль компании</h1>
                <p className="text-xs text-[#4a5568] mt-1">Реквизиты и контактная информация</p>
              </div>
              <div className="space-y-4 md:grid md:grid-cols-2 md:gap-5 md:space-y-0">
                <div className="bg-[#111318] border border-[#1e2330] p-5 space-y-4">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#4a5568] pb-3 border-b border-[#1e2330]">Основная информация</div>
                  {[
                    { l: "Полное наименование", v: "Общество с ограниченной ответственностью «СИНЕД»" },
                    { l: "Краткое наименование", v: "ООО «СИНЕД»" },
                    { l: "ИНН", v: "7800000000" },
                    { l: "КПП", v: "780101001" },
                    { l: "Регион", v: "Санкт-Петербург и Ленинградская область" },
                  ].map(f => (
                    <div key={f.l}>
                      <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-0.5">{f.l}</div>
                      <div className="text-sm text-[#c9d6e5]">{f.v}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-[#111318] border border-[#1e2330] p-5 space-y-4">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#4a5568] pb-3 border-b border-[#1e2330]">Банковские реквизиты</div>
                  {[
                    { l: "Расчётный счёт", v: "40702810700000012345" },
                    { l: "Банк", v: "ПАО «Сбербанк России»" },
                    { l: "БИК", v: "044030653" },
                    { l: "Корр. счёт", v: "30101810500000000653" },
                    { l: "Юр. адрес", v: "191002, г. Санкт-Петербург, ул. Рубинштейна, д. 1" },
                  ].map(f => (
                    <div key={f.l}>
                      <div className="text-[9px] uppercase tracking-wider text-[#4a5568] mb-0.5">{f.l}</div>
                      <div className="text-sm text-[#c9d6e5]">{f.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111318] border-t border-[#1e2330] flex z-40">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setSection(item.id); setShowMap(false); setSelectedFuel(null); }}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${section === item.id ? "text-[#c9a84c]" : "text-[#4a5568]"}`}>
              <Icon name={item.icon} size={18} />
              <span className="text-[9px]">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/75 flex items-end md:items-center justify-center z-50 p-0 md:p-4"
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-[#111318] border border-[#1e2330] w-full md:max-w-md animate-scale-in rounded-t-2xl md:rounded-none">
            <div className="flex justify-center pt-3 pb-1 md:hidden"><div className="w-10 h-1 bg-[#2a3248] rounded-full" /></div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2330]">
              <div>
                <div className="font-semibold text-[#e2e8f0]">Новая заявка</div>
                <div className="text-[11px] text-[#4a5568] mt-0.5">СИНЕД · СПБ и Ленинградская область</div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[#4a5568] hover:text-[#e2e8f0] p-1"><Icon name="X" size={15} /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-auto">
              <button onClick={handleAiFill} disabled={aiLoading}
                className="w-full flex items-center justify-center gap-2 py-3 border border-[#c9a84c] text-[#c9a84c] text-sm hover:bg-[#c9a84c] hover:text-black transition-all disabled:opacity-60">
                {aiLoading ? <><div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" /><span>Анализирую...</span></>
                  : <><Icon name="Sparkles" size={13} /><span>Заполнить автоматически (ИИ)</span></>}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-[#4a5568] mb-1.5">Вид топлива</label>
                  <input value={form.fuel} onChange={e => setForm({ ...form, fuel: e.target.value })} placeholder="ДТ Летнее"
                    className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#2a3248] focus:outline-none focus:border-[#c9a84c] transition-colors" />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-[#4a5568] mb-1.5">Объём (л)</label>
                  <input value={form.volume} onChange={e => setForm({ ...form, volume: e.target.value })} placeholder="5 000"
                    className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#2a3248] focus:outline-none focus:border-[#c9a84c] transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-[#4a5568] mb-1.5">Адрес доставки</label>
                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="СПБ или Ленинградская область"
                  className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#2a3248] focus:outline-none focus:border-[#c9a84c] transition-colors" />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-[#4a5568] mb-1.5">Дата</label>
                <input value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} placeholder="ДД.ММ.ГГГГ"
                  className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#2a3248] focus:outline-none focus:border-[#c9a84c] transition-colors" />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-[#4a5568] mb-1.5">Комментарий</label>
                <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} rows={3}
                  placeholder="Тип объекта, условия приёма..."
                  className="w-full bg-[#0d0f14] border border-[#1e2330] px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#2a3248] focus:outline-none focus:border-[#c9a84c] transition-colors resize-none" />
              </div>
            </div>
            <div className="flex gap-3 px-5 pb-6 pt-1">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-[#1e2330] text-sm text-[#8896aa] hover:border-[#8896aa] transition-colors">Отмена</button>
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-[#c9a84c] text-black text-sm font-semibold hover:bg-[#d4b85a] transition-colors">Отправить</button>
            </div>
          </div>
        </div>
      )}

      <ChatWidget showChat={showChat} setShowChat={setShowChat} messages={messages} chatInput={chatInput} setChatInput={setChatInput} handleBotSend={handleBotSend} handleBotOption={handleBotOption} resetChat={resetChat} chatEndRef={chatEndRef} botStep={botStep} />
    </div>
  );
};

// ===== ЧАТБОТ ВИДЖЕТ (отдельный компонент) =====
interface ChatWidgetProps {
  showChat: boolean; setShowChat: (v: boolean) => void;
  messages: ChatMessage[]; chatInput: string; setChatInput: (v: string) => void;
  handleBotSend: () => void; handleBotOption: (o: string) => void;
  resetChat: () => void; chatEndRef: React.RefObject<HTMLDivElement>;
  botStep: BotStep;
}
const ChatWidget = ({ showChat, setShowChat, messages, chatInput, setChatInput, handleBotSend, handleBotOption, resetChat, chatEndRef, botStep }: ChatWidgetProps) => (
  <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end gap-3">
    {showChat && (
      <div className="w-[320px] md:w-[360px] bg-[#111318] border border-[#1e2330] shadow-2xl animate-scale-in flex flex-col" style={{ height: "500px", maxHeight: "80vh" }}>
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
          <div className="flex items-center gap-1">
            <button onClick={resetChat} className="text-[#4a5568] hover:text-[#8896aa] p-1 transition-colors" title="Новый диалог"><Icon name="RotateCcw" size={13} /></button>
            <button onClick={() => setShowChat(false)} className="text-[#4a5568] hover:text-[#e2e8f0] p-1 transition-colors"><Icon name="X" size={14} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[85%] space-y-2">
                <div className={`px-3 py-2.5 text-sm leading-relaxed whitespace-pre-line ${msg.from === "bot" ? "bg-[#1a1f2e] text-[#c9d6e5] rounded-tr-xl rounded-br-xl rounded-bl-xl" : "bg-[#c9a84c] text-black rounded-tl-xl rounded-bl-xl rounded-br-xl font-medium"}`}>
                  {msg.text}
                </div>
                {msg.options && msg.from === "bot" && (
                  <div className="flex flex-wrap gap-1.5">
                    {msg.options.map(opt => (
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
        {botStep !== "done" && (
          <div className="border-t border-[#1e2330] px-3 py-3 flex gap-2">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleBotSend()}
              placeholder="Введите ответ..."
              className="flex-1 bg-[#0d0f14] border border-[#1e2330] px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#2a3248] focus:outline-none focus:border-[#c9a84c] transition-colors" />
            <button onClick={handleBotSend} className="px-3 py-2 bg-[#c9a84c] text-black hover:bg-[#d4b85a] transition-colors">
              <Icon name="Send" size={14} />
            </button>
          </div>
        )}
      </div>
    )}
    <button onClick={() => setShowChat(v => !v)}
      className="w-12 h-12 bg-[#c9a84c] text-black flex items-center justify-center shadow-lg hover:bg-[#d4b85a] transition-all hover:scale-105">
      <Icon name={showChat ? "X" : "MessageCircle"} size={20} />
    </button>
  </div>
);

export default Index;
