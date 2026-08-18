const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

const TASKS_FILE = path.join(app.getPath('userData'), 'tasks.json');
let tasks = [];
let timers = {};
let tray = null;
let taskWindow = null;
let overlayWindow = null;

// --- Persistence ---
function loadTasks() {
  try {
    tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
    // Drop any tasks whose time has already passed
    const now = Date.now();
    tasks = tasks.filter(t => new Date(t.time).getTime() > now);
    saveTasks();
  } catch {
    tasks = [];
  }
}

function saveTasks() {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

// --- Scheduling ---
function scheduleTask(task) {
  const ms = new Date(task.time).getTime() - Date.now();
  if (ms <= 0) return; // Already past, skip
  // ponytail: setTimeout max is ~24.8 days (2^31-1 ms). Chain if needed later.
  timers[task.id] = setTimeout(() => fireTask(task.id), ms);
}

function scheduleAll() {
  Object.values(timers).forEach(clearTimeout);
  timers = {};
  tasks.forEach(t => scheduleTask(t));
}

function fireTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  delete timers[taskId];

  // Remove from list + save
  tasks = tasks.filter(t => t.id !== taskId);
  saveTasks();
  notifyTaskWindow();

  showOverlay(task.text);
}

// --- Overlay ---
function showOverlay(text) {
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.size;

  overlayWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  overlayWindow.setIgnoreMouseEvents(true);
  if (process.platform === 'darwin') {
    overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }
  overlayWindow.loadFile('overlay.html');
  overlayWindow.webContents.on('did-finish-load', () => {
    overlayWindow.webContents.send('show-reminder', text);
  });
}

// --- Task Window ---
function createTaskWindow() {
  if (taskWindow && !taskWindow.isDestroyed()) {
    taskWindow.show();
    taskWindow.focus();
    return;
  }

  taskWindow = new BrowserWindow({
    width: 420,
    height: 560,
    resizable: false,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  taskWindow.loadFile('task-window.html');
  taskWindow.on('close', (e) => {
    e.preventDefault();
    taskWindow.hide();
  });
}

function notifyTaskWindow() {
  if (taskWindow && !taskWindow.isDestroyed()) {
    taskWindow.webContents.send('tasks-updated', tasks);
  }
}

// --- Tray ---
function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  let trayIcon;
  try {
    trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 22, height: 22 });
  } catch {
    // Fallback: empty icon
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('Remind Me');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Add Task', click: () => createTaskWindow() },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => createTaskWindow());
}

// --- IPC ---
ipcMain.handle('add-task', (_, text, time) => {
  const task = { id: Date.now().toString(), text, time };
  tasks.push(task);
  saveTasks();
  scheduleTask(task);
  return tasks;
});

ipcMain.handle('delete-task', (_, id) => {
  tasks = tasks.filter(t => t.id !== id);
  if (timers[id]) {
    clearTimeout(timers[id]);
    delete timers[id];
  }
  saveTasks();
  return tasks;
});

ipcMain.handle('get-tasks', () => tasks);

ipcMain.on('overlay-done', () => {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
    overlayWindow = null;
  }
});

ipcMain.on('close-task-window', () => {
  if (taskWindow && !taskWindow.isDestroyed()) {
    taskWindow.hide();
  }
});

// --- App lifecycle ---
app.whenReady().then(() => {
  loadTasks();
  createTray();
  scheduleAll();
  createTaskWindow();
});

app.on('window-all-closed', (e) => {
  // Don't quit — tray app
});

app.on('before-quit', () => {
  app.isQuitting = true;
});
