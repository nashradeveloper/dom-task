const STORAGE_KEY = "taskManagerTasks";

const taskInput = document.querySelector("#taskInput");
const prioritySelect = document.querySelector("#prioritySelect");
const addTaskButton = document.querySelector("#addTaskBtn");
const taskList = document.querySelector("#taskList");
const taskCount = document.querySelector("#taskCount");
const clearCompletedBtn = document.querySelector("#clearCompletedBtn");
const filterBar = document.querySelector("#filterBar");

let tasks = loadTasks();
let currentFilter = "All";

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Could not read saved tasks:", err);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error("Could not save tasks:", err);
  }
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function categoryClass(category) {
  return "cat-" + category.toLowerCase();
}

function render() {
  taskList.innerHTML = "";

  const visibleTasks = tasks.filter(
    (t) => currentFilter === "All" || t.category === currentFilter,
  );

  if (visibleTasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent =
      tasks.length === 0
        ? "No tasks yet. Add one above to get started."
        : "No tasks in this category.";
    taskList.appendChild(empty);
  } else {
    visibleTasks.forEach((task) => {
      taskList.appendChild(buildTaskElement(task));
    });
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  taskCount.textContent =
    tasks.length === 0
      ? "0 tasks"
      : `${tasks.length} task${tasks.length === 1 ? "" : "s"} · ${completedCount} completed`;
}

function buildTaskElement(task) {
  const item = document.createElement("div");
  item.className = "task-item" + (task.completed ? " completed" : "");
  item.dataset.id = task.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-check";
  checkbox.checked = task.completed;
  checkbox.title = "Mark complete";
  checkbox.addEventListener("change", () => toggleComplete(task.id));

  const category = document.createElement("span");
  category.className = "task-category " + categoryClass(task.category);
  category.textContent = task.category;

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "task-edit-input hidden";
  editInput.value = task.text;

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "editBtn";
  editBtn.title = "Edit";
  editBtn.textContent = "Edit";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "deleteBtn";
  deleteBtn.title = "Delete";
  deleteBtn.textContent = "Delete";

  function enterEditMode() {
    text.classList.add("hidden");
    editInput.classList.remove("hidden");
    editInput.value = task.text;
    editInput.focus();
    editInput.select();
    editBtn.textContent = "Save";
    editBtn.title = "Save";
  }

  function exitEditMode(commit) {
    if (commit) {
      const newText = editInput.value.trim();
      if (newText !== "") {
        task.text = newText;
        text.textContent = newText;
        saveTasks();
      }
    }
    text.classList.remove("hidden");
    editInput.classList.add("hidden");
    editBtn.textContent = "✏️";
    editBtn.title = "Edit";
  }

  editBtn.addEventListener("click", () => {
    const isEditing = !editInput.classList.contains("hidden");
    if (isEditing) {
      exitEditMode(true);
    } else {
      enterEditMode();
    }
  });

  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") exitEditMode(true);
    if (e.key === "Escape") exitEditMode(false);
  });

  editInput.addEventListener("blur", () => {
    if (!editInput.classList.contains("hidden")) exitEditMode(true);
  });

  deleteBtn.addEventListener("click", () => deleteTask(task.id, item));

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  item.appendChild(checkbox);
  item.appendChild(category);
  item.appendChild(text);
  item.appendChild(editInput);
  item.appendChild(actions);

  return item;
}

function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText === "") return;

  tasks.push({
    id: makeId(),
    text: taskText,
    category: prioritySelect.value,
    completed: false,
  });

  saveTasks();
  render();
  taskInput.value = "";
  taskInput.focus();
}

function toggleComplete(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  render();
}

function deleteTask(id, element) {
  element.classList.add("removing");
  element.addEventListener(
    "animationend",
    () => {
      tasks = tasks.filter((t) => t.id !== id);
      saveTasks();
      render();
    },
    { once: true },
  );
}

function clearCompleted() {
  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
  render();
}

addTaskButton.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

clearCompletedBtn.addEventListener("click", clearCompleted);

filterBar.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  currentFilter = btn.dataset.filter;
  filterBar
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.toggle("active", b === btn));
  render();
});

render();
