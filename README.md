# ✨ Remind Me — Desktop Ninja Reminder

<p align="center">
  <img src="assets/tray-icon.png" width="96" height="96" alt="Remind Me Ninja Icon" />
</p>

<p align="center">
  <b>A cute, aesthetic desktop reminder app with an animated pixel art ninja avatar.</b><br>
  <i>Runs quietly in your system tray. When a timer hits, an animated ninja leaps onto your screen, delivers your reminder, and flips away.</i>
</p>

<p align="center">
  <a href="https://github.com/Aditya290605/remind_me/releases/latest"><img src="https://img.shields.io/badge/Download-macOS%20(.dmg)-black?style=for-the-badge&logo=apple" alt="Download macOS" /></a>
  <a href="https://github.com/Aditya290605/remind_me/releases/latest"><img src="https://img.shields.io/badge/Download-Windows%20(.exe)-0078D6?style=for-the-badge&logo=windows" alt="Download Windows" /></a>
</p>

---

## 🥷 Features

- **Frame-by-Frame Ninja Animation**: A cute pixel art ninja runs onto your screen with realistic footstep bounce, executes high front-flips, lands facing you, presents your reminder in an aesthetic speech bubble, and front-flips back out.
- **Aesthetic Glassmorphism UI**: Deep violet/dark theme with smooth glows, backdrop blur, modern typography (*Outfit* font), and a minimalist task manager.
- **Persistent Storage**: Tasks are saved locally to `tasks.json`. Schedule a task 7 minutes or 7 days in advance — it persists even across system restarts and auto-cleans once completed.
- **Zero Battery / CPU Drain**: Uses standard `setTimeout` timers and lives quietly in the background menu bar / system tray. No database, no constant polling, no background listeners.
- **Non-Intrusive Overlay**: Transparent, frameless, and click-through overlay window. Won't steal your focus or disrupt your active workspace.
- **Synthesized Chime**: Plays a gentle C-major arpeggio chime built directly using the Web Audio API (no external sound files required).
- **Cross-Platform**: Works seamlessly on both **macOS** and **Windows**.

---

## 📥 Downloads & Installation

### 🍏 For macOS:
1. Download **`Remind Me-1.0.0-arm64.dmg`** from [Releases](https://github.com/Aditya290605/remind_me/releases/latest).
2. Open the `.dmg` file and drag **Remind Me** into your **Applications** folder.
3. Open **Remind Me** from Applications. The ninja icon will appear in your top menu bar.

### 🪟 For Windows:
1. Download **`Remind Me Setup 1.0.0.exe`** from [Releases](https://github.com/Aditya290605/remind_me/releases/latest).
2. Double-click the installer and follow the setup wizard.
3. The ninja icon will appear in your system tray (bottom-right).

---

## 📖 How It Works

1. **Add a Reminder**: Click the Ninja icon in your system menu bar / tray to open the task window.
2. **Schedule**: Type your task name, pick the scheduled date & time, and hit **Add Reminder**.
3. **Minimize / Close**: Close the window (`×`). The app keeps running silently in your system tray.
4. **Ninja Delivery**: When the scheduled time arrives:
   - 🔔 A soft audio chime plays.
   - 🏃 The ninja runs in from the screen edge with synced bounce animations.
   - 🤸 He performs a front-flip and lands facing you.
   - 💬 A speech bubble appears with your reminder text.
   - ↪️ He turns, runs back toward the same edge, and flips off-screen.
   - 🗑️ The task is automatically cleared from storage.

---

## 🛠️ For Developers (Run from Source)

```bash
# Clone the repository
git clone https://github.com/Aditya290605/remind_me.git
cd remind_me

# Install dependencies
npm install

# Run locally in development
npm start

# Build standalone installers (.dmg & .exe)
npm run build:mac   # Builds .dmg in dist/
npm run build:win   # Builds .exe in dist/
```

---

## 📁 Project Structure

```text
remind_me/
├── assets/
│   ├── character/             # Pixel art sprite sheets & frame rotations
│   └── tray-icon.png          # System tray icon
├── main.js                    # Electron main process (tray, scheduling, persistence)
├── preload.js                 # Safe context bridge / IPC handlers
├── task-window.html           # Task manager UI markup
├── task-window.css            # Glassmorphism dark aesthetic styles
├── task-window.js             # Task manager renderer logic
├── overlay.html               # Transparent reminder canvas markup
├── overlay.css                # Speech bubble styling & canvas layout
├── overlay.js                 # Frame-by-frame animation & audio engine
└── package.json               # App configuration & electron-builder settings
```

---

## 📜 License

MIT License. Free to use and share!