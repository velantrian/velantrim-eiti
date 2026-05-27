<div align="center">

# 𓆩 VELANTRIM EITI 𓆪

**Персональный AI-ассистент с многослойной памятью**  
_Один HTML-файл. Никаких зависимостей. Работает везде._

[![Version](https://img.shields.io/badge/version-13.4.4-gold?style=flat-square)](https://github.com/velantrian/velantrim-eiti/commits/main)
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

## 🆕 Что нового в v13.4.4

**🔴 Критичное (P0)**
- 🔍 **FTS5 инкрементальный sync** — поиск по заметкам перестал тормозить (O(N²) → O(1) на заметку)
- 🛡️ **DOMPurify XSS-защита** — санитизация AI/web/PDF-текста; работает офлайн (precache в Service Worker)
- 🔐 **AES-GCM шифрование API-ключей** — PBKDF2-100k + AES-256, PIN при старте, синхронный RAM-кеш

**🟡 Важное (P1)**
- 🔊 **Атомарная остановка TTS** — переключение между сообщениями и провайдерами больше не зависает
- ⚙️ **Сохранение настроек при обновлении** — апгрейд версии не сбрасывает выбор AI-провайдера/токены/инструкции
- 👍👎 **Feedback Loop** — обучает PKG/MOSC из реакций на ответы
- 🎚 **Canvas EQ в фоне** — плеер не жрёт CPU когда вкладка скрыта или на паузе
- 🗄 **TTS Cache Manager** — статистика, очистка, TTL-слайдер в настройках
- 📄 **Paste chip для больших вставок** — текст >800 символов сворачивается в чип, не засоряет ввод
- 💡 **Умные подсказки** — параллельный AI генерирует 3 чипа после каждого ответа (Gemini Flash / DeepSeek / OpenRouter)

**🟢 Чистка (P2)**
- 🔄 IDB onblocked → toast + retry · MOSC граф вынесен в `data/mosc_default_v1.json` (-115 КБ в HTML)
- 🗑 TTS cache LRU через openCursor · Blob URL auto-revoke через 5 мин · SW cache → `eiti-v13.4.4`

📜 **Полный список изменений:** [коммиты v13.4.4](https://github.com/velantrian/velantrim-eiti/commits/main)
🔍 **Открыть последнюю версию:** [velantrian.github.io/velantrim-eiti/](https://velantrian.github.io/velantrim-eiti/)

---

## 🌟 Что это

VELANTRIM EITI — монолитный AI-ассистент в **одном HTML-файле**. Никакого Node.js, никакого Python, никакого бэкенда.

Внутри — многоуровневая память, reasoning-движок, база знаний, музыкальный плеер, заметки и файловый менеджер.

---

## ⚡ Ключевые особенности

| | Особенность | Описание |
|---|---|---|
| 🧠 | **DAAD FractalMemory** | Четырёхуровневая архитектура памяти L0 / L1 / L2 / KB |
| 🔌 | **Zero install** | Один `.html` файл, без сборки и пакетного менеджера |
| 📡 | **PWA + Offline** | Устанавливается как приложение, работает без интернета |
| 🤖 | **Мульти-провайдер AI** | DeepSeek · Gemini · Grok Voice · OpenRouter · DDG |
| ⚡ | **Intent Router** | 95+ команд через regex без вызова LLM (заметки, напоминания, расчёты…) |
| 🔔 | **Напоминания** | Браузерные уведомления через Service Worker, точное время |
| 🌐 | **Web Search (DDG)** | Поиск в интернете прямо из чата, результаты идут в контекст AI |
| 📎 | **Вложения** | PDF · DOCX · TXT · MD · JSON · CSV (парсинг в браузере) |
| 🧮 | **Локальная LLM** | Офлайн text-generation через Transformers.js (q4, WASM) |
| 🧬 | **Семантика** | Эмбеддинги Xenova/feature-extraction для смысл-поиска |
| 🔍 | **FTS5 поиск** | Полнотекстовый поиск с BM25 на SQLite WASM |
| 🌍 | **i18n** | Интерфейс RU · EN · DE (без перевода данных пользователя) |
| 🎨 | **Темы** | 10+ тем — скевоморф, стекло, минимализм |
| 🗣️ | **Grok Voice** | Голосовой режим с поиском и контекстом чата |
| 🔐 | **AES-GCM ключи** | PBKDF2-100k + AES-256, PIN при старте |

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
| 🧮 **Local WASM** | Transformers.js (text-generation, q4) — полностью офлайн |
| ⛔ **None** | Без AI, только Intent Router и локальный поиск |

> Облачные провайдеры (DeepSeek/Gemini/Grok/OpenRouter) принимают твои сообщения по своим API. Локально хранятся только данные (история, заметки, KB) и ключи — сами вычисления LLM, если выбран облачный провайдер, идут на сервера вендора.

---

## 🧩 MOSC — Reasoning Graph Engine

- 🔗 Строит семантические связи между понятиями
- 💡 Автоматически обучается из переписки (Feedback Loop 👍👎 → PKG/MOSC)
- 🔎 Находит паттерны в знаниях пользователя
- 📊 Экспортирует граф концептов для анализа

Базовый граф (1225 узлов) лежит в `data/mosc_default_v1.json` и подгружается при первом старте; дальше дополняется в IDB `reasoning`.

---

## ⚡ Intent Router — команды без LLM

Около 95 regex-паттернов перехватывают типовые запросы и обрабатывают их локально, не тратя токены. Примеры:

| Категория | Примеры |
|---|---|
| 📝 Заметки | «создай заметку», «допиши в N», «переименуй заметку», «найди в заметках» |
| 🔔 Напоминания | «напомни в 20:35», «напомни через 15 минут», «поставь будильник» |
| 🧮 Расчёты | «15% от 3400», «сколько будет…», «конвертируй» |
| 📁 Файлы | `<EITI_FILE:...>` — создание/редактирование файлов в IDB |
| 🤖 VB | пользовательские паттерны через `[VB_ADD:intent\|regex]` |

Паттерны можно править в Настройки → Velantrim Brain.

---

## 📱 Вкладки приложения

| Таб | Функционал |
|---|---|
| 💬 **Чат** | Мульти-провайдер диалог, голос Grok, reasoning, вложения PDF/DOCX |
| 📚 **История** | Архив чатов, поиск по всем сессиям |
| 🎵 **Плеер** | Музыкальный плеер с плейлистами, Canvas EQ |
| 📁 **Файлы** | Файловый менеджер, хранение в IndexedDB |
| 📝 **Заметки** | Markdown-заметки, папки, FTS5-поиск |
| 📅 **Лента** | Временная лента событий, заметок и напоминаний |
| ⚙️ **Настройки** | Темы, профиль, API-ключи, локаль (RU/EN/DE), VB-паттерны, TTS |

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

> Ключи хранятся **локально** в браузере под AES-GCM (PBKDF2-100k, PIN при старте) и уходят только напрямую на API выбранного провайдера — не на сторонние серверы. Сами сообщения, если выбран облачный AI, передаются провайдеру по его API; всё, что лежит в IndexedDB (история, заметки, KB), остаётся у тебя.

---

## 📦 Внешние зависимости

В репозитории всё работает из коробки — устанавливать ничего не нужно. По мере необходимости с CDN подгружаются (только когда соответствующая фича включается):

| Библиотека | Когда грузится |
|---|---|
| `pdf.js` | Открытие PDF-вложений |
| `mammoth.js` | Открытие DOCX-вложений |
| `DOMPurify` | Санитизация AI/web/PDF-текста (offline-precache в SW) |
| `@huggingface/transformers` | Семантические эмбеддинги и локальный WASM-LLM |

Локально в репо лежат только: `index.html`, `sql-wasm.js`/`sql-wasm.wasm`, `sw.js`, `manifest.json`, `data/mosc_default_v1.json` и иконки.

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