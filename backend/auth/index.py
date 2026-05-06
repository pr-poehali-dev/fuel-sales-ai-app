"""Авторизация пользователей СИНЕД: регистрация, вход, проверка сессии, выход"""
import json
import os
import hashlib
import secrets
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

def get_db():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    conn.autocommit = True
    return conn

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def make_token() -> str:
    return secrets.token_hex(32)

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    schema = os.environ["MAIN_DB_SCHEMA"]
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")
    body = json.loads(event.get("body") or "{}") if method == "POST" else {}

    # Регистрация: POST ?action=register
    if action == "register" and method == "POST":
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""
        name = (body.get("name") or "").strip()
        phone = (body.get("phone") or "").strip()
        company = (body.get("company") or "").strip()

        if not email or not password:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Email и пароль обязательны"})}
        if len(password) < 6:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Пароль минимум 6 символов"})}

        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {schema}.users WHERE email = %s", (email,))
        if cur.fetchone():
            conn.close()
            return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": "Email уже зарегистрирован"})}

        token = make_token()
        password_hash = hash_password(password)
        cur.execute(
            f"INSERT INTO {schema}.users (email, password_hash, name, phone, company, session_token) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, email, name, phone, company",
            (email, password_hash, name, phone, company, token)
        )
        row = cur.fetchone()
        conn.close()

        user = {"id": row[0], "email": row[1], "name": row[2], "phone": row[3], "company": row[4]}
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "token": token, "user": user})}

    # Вход: POST ?action=login
    if action == "login" and method == "POST":
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""

        if not email or not password:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Введите email и пароль"})}

        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"SELECT id, email, name, phone, company, password_hash FROM {schema}.users WHERE email = %s", (email,))
        row = cur.fetchone()

        if not row or row[5] != hash_password(password):
            conn.close()
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверный email или пароль"})}

        token = make_token()
        cur.execute(f"UPDATE {schema}.users SET session_token = %s, updated_at = NOW() WHERE id = %s", (token, row[0]))
        conn.close()

        user = {"id": row[0], "email": row[1], "name": row[2], "phone": row[3], "company": row[4]}
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "token": token, "user": user})}

    # Проверка сессии: GET ?action=me
    if action == "me" and method == "GET":
        token = (event.get("headers") or {}).get("X-Session-Token") or ""
        if not token:
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"SELECT id, email, name, phone, company FROM {schema}.users WHERE session_token = %s", (token,))
        row = cur.fetchone()
        conn.close()

        if not row:
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}

        user = {"id": row[0], "email": row[1], "name": row[2], "phone": row[3], "company": row[4]}
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "user": user})}

    # Выход: POST ?action=logout
    if action == "logout" and method == "POST":
        token = (event.get("headers") or {}).get("X-Session-Token") or ""
        if token:
            conn = get_db()
            cur = conn.cursor()
            cur.execute(f"UPDATE {schema}.users SET session_token = NULL WHERE session_token = %s", (token,))
            conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Неизвестное действие"})}