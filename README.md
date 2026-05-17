<div align="center">

# 𓆩 VELANTRIM EITI 𓆪

**Персональный AI-ассистент с многослойной памятью**  
_Один HTML-файл. Никаких зависимостей. Работает везде._

[![Version](https://img.shields.io/badge/version-13.2.0-gold?style=flat-square)](#)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen?style=flat-square)](#)
[![PWA](https://img.shields.io/badge/PWA-ready-blue?style=flat-square)](#)
[![Offline](https://img.shields.io/badge/offline-supported-orange?style=flat-square)](#)

</div>

---

## 🚀 Установить приложение

<div align="center">

### [▶️ Открыть VELANTRIM EITI](https://velantrian.github.io/velantrim-eiti/)

**📱 На телефоне:** открой ссылку в Chrome → меню (⋮) → «Добавить на главный экран»

**💻 На компьютере:** открой ссылку в Chrome → значок установки в адресной строке (⊕)

</div>

---

## ⬇️ Скачать локально

**[→ Скачать index.html](https://raw.githubusercontent.com/velantrian/velantrim-eiti/main/index.html)**  
_(правой кнопкой → Сохранить как)_

Открой скачанный файл в браузере — всё работает без сервера и интернета.

---

## 🌟 Что это

VELANTRIM EITI — монолитный AI-ассистент в **одном HTML-файле**. Никакого Node.js, никакого Python, никакого бэкенда.

Внутри — многоуровневая память, reasoning-движок, база знаний, музыкальный плеер, заметки и файловый менеджер.

---

## ⚡ Ключевые особенности

| | Особенность | Описание |
|---|---|---|
| 🧠 | **DAAD FractalMemory** | Четырёхуровневая архитектура памяти L0 / L1 / L2 / KB |
| 🔌 | **Zero Dependencies** | Один `.html` файл, никаких установок |
| 📡 | **PWA + Offline** | Устанавливается как приложение, работает без интернета |
| 🤖 | **Мульти-провайдер AI** | DeepSeek · Gemini · Grok Voice · OpenRouter · DDG |
| 🔍 | **FTS5 поиск** | Полнотекстовый поиск с BM25 на SQLite WASM |
| 🎨 | **Темы** | 10+ тем — скевоморф, стекло, минимализм |
| 🗣️ | **Grok Voice** | Голосовой режим с поиском и контекстом чата |

---

## 🧠 Архитектура памяти — DAAD FractalMemory

```
┌─────────────────────────────────────────────────────────┐
│                   DAAD FractalMemory                    │
│                                                         │
│  L0 RAM ──── топ-25 сообщений по DAAD-score             │
│              JS-память · Ebbinghaus decay · per-domain  │
│                                                         │
│  L1 IDB ──── полная история чатов                       │
│              IndexedDB · FTS5 поиск · до 500 сообщ/чат  │
│                                                         │
│  L2 digest── дайджесты прошлых сессий (до 50)           │
│              авто-генерация через AI · decay + BM25     │
│                                                         │
│  L3 Core ─── профиль пользователя + выученные факты     │
│              IDB store 'l3' · авто-извлечение паттернов │
│                                                         │
│  KB ──────── база знаний · без лимита                   │
│              IDB + BM25/Embeddings · эпистемика         │
│                                                         │
│  MOSC ─────── граф рассуждений (слово → концепт: вес)   │
│              IDB 'reasoning' · обучается из переписки   │
│                                                         │
│  PKG ──────── Хеббианский граф знаний                   │
│              вес концептов растёт при повторении        │
│                                                         │
│  RNE ──────── дневник: цели · факты · вопросы · пробелы │
│              IDB 'reasoning' · авто-извлечение через AI │
│                                                         │
│  Daily Log ── ежедневные записи активности              │
│              IDB 'reasoning' · prefix daily_log:        │
└─────────────────────────────────────────────────────────┘
```

**Эпистемические статусы KB:**
- `accepted` — проверенный факт
- `hypothesis` — рабочая гипотеза
- `unverified` — требует проверки
- `deprecated` — устаревшая информация

---

## 🤖 AI Провайдеры

| Провайдер | Описание |
|---|---|
| 🤖 **DeepSeek** | Основной ассистент, глубокая интеграция с памятью |
| ⚡ **Google Gemini** | Быстрые ответы, мультимодальность |
| 🗣️ **xAI Grok Voice** | Голосовой режим реального времени с историей чатов |
| 🔀 **OpenRouter** | 300+ моделей (Claude, GPT, Llama, Mistral...) |
| 🦆 **DuckDuckGo AI** | Бесплатно, без API-ключа |
| ⛔ **None** | Полностью офлайн, только локальный поиск |

---

## 🧩 MOSC — Reasoning Graph Engine

- 🔗 Строит семантические связи между понятиями
- 💡 Автоматически обучается из переписки
- 🔎 Находит паттерны в знаниях пользователя
- 📊 Экспортирует граф концептов для анализа

---

## 📱 Вкладки приложения

| Таб | Функционал |
|---|---|
| 💬 **Чат** | Мульти-провайдер диалог, голос Grok, reasoning |
| 📚 **История** | Архив чатов, поиск по всем сессиям |
| 🎵 **Плеер** | Музыкальный плеер с плейлистами |
| 📁 **Файлы** | Файловый менеджер, хранение в IndexedDB |
| 📝 **Заметки** | Markdown-заметки, папки, FTS5-поиск |
| 📅 **Лента** | Временная лента событий и заметок |
| ⚙️ **Настройки** | Темы, профиль, API-ключи |

---

## 🗄️ Хранилище

| Слой | Технология | Для чего |
|---|---|---|
| **IndexedDB** | ~500 МБ | Чаты, заметки, файлы, KB, L2, L3, RNE, Daily Log, VB паттерны |
| **localStorage** | ~5 МБ | Тема, UI-флаги, API-ключи, мелкие переключатели |
| **SQLite WASM** | sql.js | FTS5-поиск, BM25, Attention Graph, эпистемика |
| **JS RAM** | Сессия | L0-память, MOSC-граф, VB-контекст |

> SQL = индекс поиска. IndexedDB = единственный источник истины. MOSC = граф рассуждений.

---

## 🔑 API-ключи

| Провайдер | Где получить |
|---|---|
| DeepSeek | [platform.deepseek.com](https://platform.deepseek.com) |
| Google Gemini | [aistudio.google.com](https://aistudio.google.com) |
| xAI Grok | [console.x.ai](https://console.x.ai) |
| OpenRouter | [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys) |

> Все ключи хранятся **локально** в браузере. Никакой передачи на сторонние серверы.

---

## 🛠️ Публичное API (консоль браузера)

```javascript
eitiSearchNotes("запрос")        // поиск по заметкам
eitiSearchKB("запрос")           // поиск по базе знаний
eitiAttentionTouch(id)           // обновить вес записи
eitiSQLStats()                   // статистика SQLite
eitiKBSetTruth(id, 'hypothesis') // эпистемический статус
```

---

<div align="center">

**𓆩 VELANTRIM EITI 𓆪**

_Сделано с 🖤 для тех, кто строит своё AI_

[🚀 Открыть](https://velantrian.github.io/velantrim-eiti/) · [⬇️ Скачать](https://raw.githubusercontent.com/velantrian/velantrim-eiti/main/index.html) · [🐛 Issues](https://github.com/velantrian/velantrim-eiti/issues)

</div>
