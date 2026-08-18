const taskInput = document.getElementById('task-input');
const timeInput = document.getElementById('time-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const closeBtn = document.getElementById('close-btn');

// Set default time to 5 minutes from now
function setDefaultTime() {
  const d = new Date(Date.now() + 5 * 60 * 1000);
  // datetime-local needs YYYY-MM-DDTHH:MM format
  const pad = (n) => String(n).padStart(2, '0');
  timeInput.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
setDefaultTime();

// Set min to now
function setMinTime() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  timeInput.min = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
setMinTime();

closeBtn.addEventListener('click', () => window.remindMe.closeWindow());

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });

async function addTask() {
  const text = taskInput.value.trim();
  const time = timeInput.value;
  if (!text || !time) return;

  const scheduled = new Date(time);
  if (scheduled.getTime() <= Date.now()) {
    taskInput.style.borderColor = 'rgba(255, 80, 100, 0.5)';
    setTimeout(() => { taskInput.style.borderColor = ''; }, 1000);
    return;
  }

  const tasks = await window.remindMe.addTask(text, time);
  taskInput.value = '';
  setDefaultTime();
  renderTasks(tasks);
}

async function deleteTask(id) {
  const tasks = await window.remindMe.deleteTask(id);
  renderTasks(tasks);
}

function renderTasks(tasks) {
  if (!tasks.length) {
    taskList.innerHTML = '<div class="empty-state">No reminders yet ✨</div>';
    return;
  }

  // Sort by time
  tasks.sort((a, b) => new Date(a.time) - new Date(b.time));

  taskList.innerHTML = tasks.map(t => {
    const d = new Date(t.time);
    const timeStr = d.toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    return `
      <div class="task-item">
        <div class="task-info">
          <div class="task-text">${escapeHtml(t.text)}</div>
          <div class="task-time">${timeStr}</div>
        </div>
        <button class="delete-btn" onclick="deleteTask('${t.id}')">✕</button>
      </div>
    `;
  }).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Initial load
window.remindMe.getTasks().then(renderTasks);

// Listen for updates from main process (e.g. after a task fires)
window.remindMe.onTasksUpdated(renderTasks);
