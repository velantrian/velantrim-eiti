<div align="center">

# 𓆩 VELANTRIM EITI 𓆪

**Персональный AI-ассистент с многослойной памятью**  
_Клиентское PWA без backend и build step. Основной интерфейс — один HTML-файл._

[![Version](https://img.shields.io/badge/version-13.7.5-gold?style=flat-square)](https://github.com/velantrian/velantrim-eiti/commits/main)
[![No Build Step](https://img.shields.io/badge/build-none-brightgreen?style=flat-square)](#)
[![PWA](https://img.shields.io/badge/PWA-ready-blue?style=flat-square)](#)
[![Offline Core](https://img.shields.io/badge/offline-core-orange?style=flat-square)](#)

</div>

---

## 🚀 Установить приложение

<div align="center">

### [▶️ Открыть VELANTRIM EITI](https://velantrian.github.io/velantrim-eiti/)

**📱 На телефоне:** открой ссылку в Chrome → меню (⋮) → «Добавить на главный экран»

**💻 На компьютере:** открой ссылку в Chrome → значок установки в адресной строке (⊕)

</div>

---

## ⬇️ Локальный запуск

Скачайте [полный репозиторий](https://github.com/velantrian/velantrim-eiti/archive/refs/heads/main.zip) и запустите его через статический HTTP-сервер:

```bash
python3 -m http.server 8080
```

Откройте `http://localhost:8080/index.html`. Для полного функционала нужны companion-файлы `sw.js`, `manifest.json`, иконки, `sql-wasm.js/.wasm` и `data/`. Один `index.html`, открытый через `file://`, может показать базовый UI, но Service Worker, SQLite-поиск и часть импорта документов не гарантируются.

---

## 🆕 Что нового в v13.7.5

**🔴 Безопасность и корректность**
- 🛡️ Экранированы user/model-controlled поля в Trace, KB и PKG перед HTML-рендером.
- 🔁 Устранено повторное исполнение AI-команд и двойное/четверное усиление PKG.
- 👎 Отрицательная обратная связь теперь ослабляет узлы, а не усиливает их.
- 🔒 Strict Memory закрывается при отказе Trace/Truth Gate и требует явной confidence.

**🟡 Стабильность**
- 📖 Сброс лемматизатора использует встроенный базовый словарь без отсутствующего `lemma.json`.
- 📡 Service Worker ожидает cache writes и не принимает неполный CORE cache за успешную установку.
- 🧹 Удалены запросы к отсутствующим legacy-файлам и необязательному DE patch.

📜 **Полный список изменений:** [коммиты main](https://github.com/velantrian/velantrim-eiti/commits/main)  
🔍 **Открыть последнюю версию:** [velantrian.github.io/velantrim-eiti/](https://velantrian.github.io/velantrim-eiti/)

---

## 🌟 Что это

VELANTRIM EITI — клиентский AI-ассистент, основной UI и runtime которого находятся в **одном HTML-файле**. Для запуска приложения не нужны Node.js, Python, build step или собственный backend; SQLite/PWA и импорт документов используют companion-файлы и внешние библиотеки.

Внутри — многоуровневая память, reasoning-движок, база знаний, музыкальный плеер, заметки и файловый менеджер.

---

## ⚡ Ключевые особенности

| | Особенность | Описание |
|---|---|---|
| 🧠 | **DAAD FractalMemory** | Четырёхуровневая архитектура памяти L0 / L1 / L2 / KB |
| 🔌 | **Без сборки** | Нет build step и runtime backend; приложение раздаётся как статические файлы |
| 📡 | **PWA + Offline Core** | Основной интерфейс и кешированные локальные данные доступны офлайн; AI-провайдеры требуют сеть |
| 🤖 | **Мульти-провайдер AI** | DeepSeek · Gemini · Grok Voice · OpenRouter · DDG · ChatGPT |
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

**Текущие runtime-статусы KB:** `Observed`, `Hypothesized`, `Supported`, `Validated`, `ImmutableCore`, `Contradicted`, `Deprecated`, `Retracted`.

> Sprint 3 определяет целевой lowercase-контракт статусов и режимов памяти, но его UI/pipeline wiring пока остаётся отдельным следующим шагом.

---

## 🤖 AI Провайдеры

| Провайдер | Описание |
|---|---|
| 🤖 **DeepSeek** | Основной ассистент, глубокая интеграция с памятью |
| ⚡ **Google Gemini** | Быстрые ответы, мультимодальность |
| 🟢 **ChatGPT / OpenAI** | Streaming chat, reasoning-модели, vision/file flows |
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
| ChatGPT / OpenAI | [platform.openai.com](https://platform.openai.com) |
| xAI Grok | [console.x.ai](https://console.x.ai) |
| OpenRouter | [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys) |

> Ключи хранятся **локально** в браузере и не отправляются на backend EITI. При AI-запросе выбранный ключ передаётся непосредственно соответствующему API-провайдеру для авторизации.

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