# ✨ Remind Me — Desktop Ninja Reminder

<p align="center">
  <img src="assets/tray-icon.png" width="96" height="96" alt="Remind Me Ninja Icon" />
</p>

<p align="center">
  <b>A cute, aesthetic desktop reminder app with an animated pixel art ninja avatar.</b><br>
  <i>Runs quietly in your system tray. When a timer hits, an animated ninja leaps onto your screen, delivers your reminder, and flips away.</i>
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

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm`

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Aditya290605/remind_me.git
   cd remind_me
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Launch the application:**
   ```bash
   npm start
   ```

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
└── package.json               # App configuration & scripts
```

---

## 📦 Packaging for Distribution (Optional)

To package **Remind Me** as an installer (`.dmg` for Mac, `.exe` for Windows):

```bash
# Install electron-builder
npm install --save-dev electron-builder

# Build for your platform
npx electron-builder
```

---

## 📜 License

MIT License. Feel free to use and customize!