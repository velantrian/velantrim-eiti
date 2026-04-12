🧠 VELANTRIM EITI

Offline-first modular AI system
Knowledge · Memory · Reasoning · Local Intelligence

---

⚡ Overview

VELANTRIM EITI — это локальная (offline-first) система, построенная как экзокортекс мышления.

Она объединяет:

- 🧠 базу знаний (KB)
- 🔤 лемматизацию (язык)
- 🗃 локальную БД (WASM SQLite)
- 🌐 PWA-интерфейс (работает как приложение)
- ⚙️ офлайн-движок без зависимости от API

👉 Система работает без интернета после загрузки.

---

🧩 Core Components

- 📄 "index.html" — UI + логика системы
- 🔧 "sw.js" — Service Worker (offline + cache)
- 📦 "manifest.json" — PWA конфигурация
- 🧠 "eiti_kb.json" — база знаний
- 🔤 "lemma.json" — словарь нормализации
- 🗄 "sql-wasm.js" + ".wasm" — локальная база данных

---

🚀 Features

- 📡 Offline-first — работает без интернета
- 🧠 Local Knowledge Base — данные хранятся локально
- 🔍 Search + normalization — поиск с учётом форм слов
- ⚡ Fast startup — без серверов и API
- 📱 PWA app — можно установить как приложение
- 🔒 Privacy-first — данные не покидают устройство

---

🛠 How to Run

🌐 GitHub Pages

Просто открой:

https://velantrian.github.io/velantrim-eiti/

---

💻 Локально

git clone https://github.com/velantrian/velantrim-eiti.git
cd velantrim-eiti

Открой "index.html" в браузере

---

⚙️ Architecture (Simplified)

User Input
   ↓
Normalization (lemma.json)
   ↓
Search / Retrieval (KB / SQLite)
   ↓
Response

---

⚠️ Notes

- ❗ Система находится в стадии развития
- ❗ Некоторые данные требуют очистки (lemma / KB)
- ❗ Архитектура постепенно переходит к Graph-based модели

---

🧠 Philosophy

VELANTRIM — это не просто AI.

Это:

- 📊 структура мышления
- 🔗 причинно-следственный граф
- 🧭 система ориентации в знаниях

«Graph = Truth
LLM = Voice»

---

📌 Roadmap

- 🔗 Graph Memory integration
- 🧠 Reasoning engine (WHY / HOW / TRACE)
- 🧹 Data cleaning (lemma / KB)
- ⚙️ Modular architecture
- 🛡 Guardian / Truth validation layer

---

👤 Author

Velantrian
Creator of Velantrim system

---

📄 License

MIT (или позже определить)

---

⭐ Project Status

🟡 Active development
🧠 Experimental system
⚙️ Architecture evolving

---
