"""AI-чатбот для консультации по топливу СИНЕД. Отвечает на вопросы, делает расчёты, собирает заявку."""
import json
import os
import psycopg2
from openai import OpenAI

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

SYSTEM_PROMPT = """Ты — умный ассистент компании СИНЕД (поставщик топлива в Санкт-Петербурге и Ленинградской области).
Твоя задача: помогать клиентам с вопросами о топливе, делать расчёты потребления, принимать заявки на поставку.

КОМПАНИЯ:
- Поставляем: ДТ Летнее (64.20 ₽/л), ДТ Зимнее (67.90 ₽/л), Мазут М-100 (38.60 ₽/л), Топочный мазут (41.20 ₽/л), АИ-92 (54.30 ₽/л), АИ-95 (57.80 ₽/л)
- Минимальный объём: ДТ и бензины — от 500 л, мазут — от 5 000 л
- Доставка по СПБ и Ленинградской области: 24–48 часов
- Телефон диспетчера: +7 (812) 000-00-00 (круглосуточно)

РАСЧЁТ РАСХОДА ТОПЛИВА ДЛЯ КОТЕЛЬНЫХ:
- Для расчёта отопления нужно знать: площадь помещения (м²), количество этажей, тип котла
- Приблизительная формула: 1 л мазута = 9.5 кВт·ч тепла; 1 л ДТ = 10 кВт·ч тепла
- Для дома 200 м² в СПБ на зиму (6 мес) с мазутом: ~8 000–12 000 л (зависит от утепления)
- Для промышленной котельной: уточнить мощность котла в кВт, КПД, часы работы
- Формула: Объём (л) = (Мощность котла × Часы работы × Дни) / (КПД × Теплота сгорания)

ХРАНЕНИЕ ТОПЛИВА:
- Мазут и ДТ хранят в стальных резервуарах (ГОСТ 1561-75), наземных или подземных
- Для котельных: рекомендуем ёмкости от 5 до 50 м³
- Важно: заземление, вентиляция, противопожарные нормы НПБ 111-98
- Срок хранения ДТ: до 1 года; мазута: до 5 лет при правильных условиях

ПРАВИЛА РАБОТЫ:
1. Всегда отвечай по-русски, кратко и по делу
2. Если клиент спрашивает расчёт — сделай его с объяснением
3. Если спрашивает глупый или необычный вопрос — ответь доброжелательно, не отказывай
4. Если клиент хочет оформить заявку — узнай: имя, телефон, адрес доставки, вид топлива, объём
5. Если клиент просит живого оператора или пишет "оператор", "менеджер", "человек" — СРАЗУ дай контакты: +7 (812) 000-00-00 или написать на info@sined.ru
6. После того как собрал данные для заявки (имя + телефон + адрес + топливо + объём) — выведи итог и попроси подтверждение
7. Не придумывай цены отличные от указанных выше
8. Будь дружелюбным, профессиональным, немного тёплым в общении

ВАЖНО: Если пользователь явно просит оператора или живого человека — сразу напиши:
"Соединяю с оператором! 📞 Позвоните: +7 (812) 000-00-00 или напишите на info@sined.ru. Диспетчер работает 24/7."
"""

def get_db():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    conn.autocommit = True
    return conn

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = json.loads(event.get("body") or "{}")
    messages = body.get("messages") or []
    session_id = body.get("session_id") or ""
    schema = os.environ["MAIN_DB_SCHEMA"]

    if not messages:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Нет сообщений"})}

    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    openai_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in messages:
        role = "user" if msg.get("from") == "user" else "assistant"
        openai_messages.append({"role": role, "content": msg.get("text", "")})

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=openai_messages,
        max_tokens=800,
        temperature=0.7,
    )

    reply = response.choices[0].message.content

    # Проверяем — просит ли оператора
    operator_keywords = ["оператор", "менеджер", "живой человек", "живого человека", "позвать", "соедини"]
    last_user_msg = ""
    for m in reversed(messages):
        if m.get("from") == "user":
            last_user_msg = m.get("text", "").lower()
            break
    wants_operator = any(kw in last_user_msg for kw in operator_keywords)

    # Сохраняем сессию в БД если есть session_id
    if session_id:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {schema}.chat_sessions WHERE session_id = %s", (session_id,))
        existing = cur.fetchone()
        all_messages = messages + [{"from": "bot", "text": reply}]
        if existing:
            cur.execute(f"UPDATE {schema}.chat_sessions SET messages = %s, updated_at = NOW() WHERE session_id = %s",
                        (json.dumps(all_messages, ensure_ascii=False), session_id))
        else:
            cur.execute(f"INSERT INTO {schema}.chat_sessions (session_id, messages) VALUES (%s, %s)",
                        (session_id, json.dumps(all_messages, ensure_ascii=False)))
        conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"reply": reply, "wants_operator": wants_operator}, ensure_ascii=False)
    }
