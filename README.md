# 🧠 VELANTRIM EITI

<p align="center">
  <img src="./icon-512.png" width="120"/>
</p>

![Offline](https://img.shields.io/badge/offline-first-green)
![PWA](https://img.shields.io/badge/PWA-supported-blue)
![Version](https://img.shields.io/badge/version-v12-orange)
![Status](https://img.shields.io/badge/status-experimental-yellow)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

🚀 **[Open EITI App](https://velantrian.github.io/velantrim-eiti/)**

Offline-first modular AI system  
Knowledge · Memory · Reasoning · Local Intelligence

---

## ⚡ Overview

VELANTRIM EITI — это локальная (offline-first) система, построенная как экзокортекс мышления.

Она объединяет:

- 🧠 базу знаний (KB)
- 🔤 лемматизацию (язык)
- 🗃 локальную БД (WASM SQLite)
- 🌐 PWA-интерфейс (работает как приложение)
- ⚙️ офлайн-движок без зависимости от API

👉 Система работает без интернета после загрузки.

---

## 🧾 Version

v12.0 — experimental build  
Local-first PWA system with offline engine

---

## 🧩 Core Components

- 📄 `index.html` — UI + логика системы  
- 🔧 `sw.js` — Service Worker (offline + cache)  
- 📦 `manifest.json` — PWA конфигурация  
- 🧠 `eiti_kb.json` — локальная база знаний (ключевой источник ответов системы)  
- 🔤 `lemma.json` — словарь нормализации  
- 🗄 `sql-wasm.js` + `.wasm` — локальная база данных  

---

## 🚀 Features

- 📡 Offline-first — работает без интернета  
- 🧠 Local Knowledge Base — данные хранятся локально  
- 🔍 Search + normalization — поиск с учётом форм слов  
- ⚡ Fast startup — без серверов и API  
- 📱 PWA app — можно установить как приложение  
- 🔒 Privacy-first — данные не покидают устройство  

---

## 📱 Install as App

You can install EITI as a PWA:

- Open in Chrome / Edge  
- Tap **"Add to Home Screen"**  
- Use as standalone app  

✔ Works offline after first load  
✔ No installation required  

---

## 🛠 How to Run

### 🌐 GitHub Pages

Open in browser:  
https://velantrian.github.io/velantrim-eiti/

⚠️ Recommended: use HTTPS for full PWA + Service Worker support

---

### 💻 Local run

```bash
git clone https://github.com/velantrian/velantrim-eiti.git
cd velantrim-eiti
