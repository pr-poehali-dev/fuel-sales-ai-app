const FUNC_URLS = {
  auth: "https://functions.poehali.dev/f55fb982-0998-41cc-bed8-8d2bcbfb1125",
  aiChat: "https://functions.poehali.dev/511310d9-fba4-4dc9-81ec-bfc79075b189",
};

export function getToken(): string {
  return localStorage.getItem("sined_token") || "";
}

export function setToken(token: string) {
  localStorage.setItem("sined_token", token);
}

export function clearToken() {
  localStorage.removeItem("sined_token");
}

async function authFetch(action: string, method: "GET" | "POST", body?: object) {
  const url = `${FUNC_URLS.auth}/?action=${action}`;
  const token = getToken();
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Session-Token": token } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === "string") return JSON.parse(parsed);
    return parsed;
  } catch {
    return { error: text };
  }
}

export const authApi = {
  register: (data: { email: string; password: string; name: string; phone: string; company?: string }) =>
    authFetch("register", "POST", data),
  login: (data: { email: string; password: string }) =>
    authFetch("login", "POST", data),
  me: () => authFetch("me", "GET"),
  logout: () => authFetch("logout", "POST"),
};

export async function sendAiMessage(messages: { from: string; text: string }[], sessionId: string) {
  const res = await fetch(FUNC_URLS.aiChat, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, session_id: sessionId }),
  });
  const text = await res.text();
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === "string") return JSON.parse(parsed);
    return parsed;
  } catch {
    return { error: "Ошибка связи" };
  }
}