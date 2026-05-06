import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { sendAiMessage } from "@/lib/api";

interface Message {
  from: "bot" | "user";
  text: string;
}

interface AiChatWidgetProps {
  show: boolean;
  onClose: () => void;
}

const SESSION_ID = `chat_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const WELCOME = `Добрый день! Я AI-консультант компании СИНЕД 🤖

Могу помочь вам:
• Рассчитать потребление топлива для вашего объекта
• Подобрать подходящий вид топлива
• Ответить на вопросы о хранении и доставке
• Оформить заявку на поставку

Задайте любой вопрос или напишите, что вас интересует!`;

export default function AiChatWidget({ show, onClose }: AiChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [wantsOperator, setWantsOperator] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const newMessages: Message[] = [...messages, { from: "user", text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await sendAiMessage(newMessages, SESSION_ID);
      if (res.reply) {
        setMessages(prev => [...prev, { from: "bot", text: res.reply }]);
        if (res.wants_operator) setWantsOperator(true);
      } else {
        setMessages(prev => [...prev, { from: "bot", text: "Произошла ошибка. Попробуйте ещё раз или позвоните нам: +7 (812) 000-00-00" }]);
      }
    } catch {
      setMessages(prev => [...prev, { from: "bot", text: "Нет связи с сервером. Позвоните нам: +7 (812) 000-00-00" }]);
    }
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const quickQuestions = [
    "Сколько мазута нужно на зиму для дома 200 м²?",
    "В чём хранить дизельное топливо?",
    "Хочу оформить заявку",
    "Позвать оператора",
  ];

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] flex flex-col shadow-2xl" style={{ maxHeight: "min(600px, calc(100vh - 2rem))" }}>
      {/* Header */}
      <div className="bg-[#111318] border border-[#1e2330] px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#c9a84c] flex items-center justify-center shrink-0">
            <Icon name="Bot" size={14} className="text-black" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#e2e8f0]">AI-консультант СИНЕД</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-[#4a5568]">онлайн</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="tel:+78120000000" className="flex items-center gap-1 text-[10px] text-[#4a5568] hover:text-[#c9a84c] transition-colors">
            <Icon name="Phone" size={11} />оператор
          </a>
          <button onClick={onClose} className="text-[#4a5568] hover:text-[#e2e8f0] transition-colors ml-1">
            <Icon name="X" size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-[#0d0f14] border-x border-[#1e2330] p-3 space-y-3 min-h-0">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            {m.from === "bot" && (
              <div className="w-6 h-6 bg-[#1a1f2e] flex items-center justify-center shrink-0 mr-2 mt-0.5">
                <Icon name="Bot" size={12} className="text-[#c9a84c]" />
              </div>
            )}
            <div className={`max-w-[80%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
              m.from === "user"
                ? "bg-[#c9a84c] text-black"
                : "bg-[#111318] border border-[#1e2330] text-[#c9d6e5]"
            }`}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-[#1a1f2e] flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="Bot" size={12} className="text-[#c9a84c]" />
            </div>
            <div className="bg-[#111318] border border-[#1e2330] px-3 py-2 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#c9a84c] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 bg-[#c9a84c] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 bg-[#c9a84c] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {wantsOperator && (
          <div className="bg-[#1a1f2e] border border-[#c9a84c]/30 p-3 text-center">
            <div className="text-xs text-[#c9a84c] mb-2 font-medium">Связь с оператором</div>
            <a href="tel:+78120000000" className="flex items-center justify-center gap-2 py-2 bg-[#c9a84c] text-black text-sm font-semibold hover:bg-[#d4b85a] transition-colors">
              <Icon name="Phone" size={14} />+7 (812) 000-00-00
            </a>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick questions (only at start) */}
      {messages.length <= 1 && !loading && (
        <div className="bg-[#0d0f14] border-x border-[#1e2330] px-3 pb-2 flex flex-wrap gap-1.5">
          {quickQuestions.map(q => (
            <button key={q} onClick={() => { setInput(q); }}
              className="text-[10px] px-2 py-1 border border-[#1e2330] text-[#4a5568] hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors text-left">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="bg-[#111318] border border-[#1e2330] p-3 flex gap-2 shrink-0">
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder="Напишите вопрос..."
          rows={1}
          className="flex-1 bg-[#0d0f14] border border-[#1e2330] px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#2d3748] resize-none focus:outline-none focus:border-[#c9a84c] transition-colors" />
        <button onClick={send} disabled={loading || !input.trim()}
          className="w-9 h-9 bg-[#c9a84c] text-black flex items-center justify-center hover:bg-[#d4b85a] transition-colors disabled:opacity-40 shrink-0">
          <Icon name="Send" size={15} />
        </button>
      </div>
    </div>
  );
}
