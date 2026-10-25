'use strict';

(() => {
  const STORAGE_KEY = 'daylist.tasks.v1';
  const $ = (selector) => document.querySelector(selector);
  const list = $('#task-list');
  const input = $('#new-task');
  let tasks = [];
  let filter = 'all';
  let editingId = null;
  // Prevent overwriting corrupt/unknown data until the user can recover it.
  let writesAllowed = true;

  function warn(message) {
    $('#storage-warning').textContent = message;
    $('#storage-warning').hidden = false;
    $('#save-note').textContent = 'Changes are not saved';
  }

  function isValidTask(task) {
    return task && typeof task.id === 'string' && task.id.length > 0 &&
      typeof task.title === 'string' && task.title.trim().length > 0 &&
      task.title.length <= 250 && typeof task.completed === 'boolean';
  }

  function load(raw) {
    if (raw === null) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || !data.every(isValidTask) ||
        new Set(data.map((task) => task.id)).size !== data.length) {
      throw new Error('Unsupported task data');
    }
    return data.map(({ id, title, completed }) => ({ id, title, completed }));
  }

  try {
    tasks = load(localStorage.getItem(STORAGE_KEY));
  } catch {
    writesAllowed = false;
    warn('Saved tasks could not be loaded. Existing storage has been left untouched. You can use this tab temporarily; check browser storage permissions or back up and remove the daylist.tasks.v1 entry to reset.');
  }

  function announce(message) {
    $('#announcement').textContent = message;
  }

  function persist(message) {
    if (writesAllowed) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        $('#storage-warning').hidden = true;
        $('#save-note').textContent = 'Saved on this device';
      } catch {
        warn('Your browser could not save these changes. Tasks are available in this tab only until storage is available again.');
      }
    }
    render();
    announce(message);
  }

  function button(text, action, task) {
    const element = document.createElement('button');
    element.type = 'button';
    element.textContent = text;
    element.dataset.action = action;
    element.className = action;
    element.setAttribute('aria-label', `${text} task: ${task.title}`);
    return element;
  }

  function render() {
    list.replaceChildren();
    const visible = tasks.filter((task) => filter === 'all' ||
      (filter === 'completed' ? task.completed : !task.completed));
    for (const task of visible) {
      const row = document.createElement('li');
      row.className = `task${task.completed ? ' completed' : ''}`;
      row.dataset.id = task.id;
      if (editingId === task.id) {
        const form = document.createElement('form');
        form.className = 'edit-form';
        const editor = document.createElement('input');
        editor.name = 'title';
        editor.value = task.title;
        editor.maxLength = 250;
        editor.required = true;
        editor.setAttribute('aria-label', 'Edit task title');
        const save = button('Save', 'save', task);
        save.type = 'submit';
        form.append(editor, save, button('Cancel', 'cancel', task));
        row.append(form);
      } else {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.setAttribute('aria-label', `Mark ${task.title} as ${task.completed ? 'active' : 'completed'}`);
        const title = document.createElement('span');
        title.className = 'task-title';
        title.textContent = task.title;
        const actions = document.createElement('div');
        actions.className = 'task-actions';
        actions.append(button('Edit', 'edit', task), button('Delete', 'delete', task));
        row.append(checkbox, title, actions);
      }
      list.append(row);
    }
    const completed = tasks.filter((task) => task.completed).length;
    const active = tasks.length - completed;
    $('#total-count').textContent = String(tasks.length);
    $('#remaining').textContent = `${active} task${active === 1 ? '' : 's'} left`;
    $('#clear-completed').disabled = completed === 0;
    $('#progress-label').textContent = tasks.length ? `${completed} of ${tasks.length} completed` : 'Small steps, big things.';
    const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
    $('#progress-fill').style.width = `${percent}%`;
    $('.progress-track').setAttribute('aria-valuenow', String(percent));
    $('#empty-state').hidden = visible.length !== 0;
    $('#empty-title').textContent = tasks.length === 0 ? 'A fresh start.' : filter === 'active' ? 'All caught up!' : 'Nothing here yet.';
    $('#empty-description').textContent = tasks.length === 0 ? 'Add your first task and give your day a little direction.' : filter === 'active' ? 'Take a breath. You’ve earned it.' : 'Completed tasks will appear here.';
    for (const element of document.querySelectorAll('[data-filter]')) {
      element.setAttribute('aria-pressed', String(element.dataset.filter === filter));
    }
    if (editingId) {
      const editor = list.querySelector('.edit-form input');
      if (editor) { editor.focus(); editor.select(); }
    }
  }

  function focusRow(id) {
    const row = Array.from(list.children).find((element) => element.dataset.id === id);
    (row?.querySelector('button') || input).focus();
  }

  $('#add-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const title = input.value.trim();
    if (!title) { input.setCustomValidity('Please enter a task, not just spaces.'); input.reportValidity(); return; }
    const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    tasks.push({ id, title, completed: false });
    editingId = null;
    persist('Task added.');
    input.value = '';
    input.focus();
  });
  input.addEventListener('input', () => input.setCustomValidity(''));

  $('.filters').addEventListener('click', (event) => {
    const target = event.target.closest('[data-filter]');
    if (!target) return;
    filter = target.dataset.filter;
    editingId = null;
    render();
    announce(`Showing ${filter} tasks.`);
  });

  list.addEventListener('change', (event) => {
    if (!event.target.matches('input[type=checkbox]')) return;
    const id = event.target.closest('[data-id]').dataset.id;
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    task.completed = event.target.checked;
    persist(task.completed ? 'Task completed.' : 'Task marked active.');
    const row = Array.from(list.children).find((element) => element.dataset.id === id);
    (row?.querySelector('input') || input).focus();
  });

  list.addEventListener('click', (event) => {
    const target = event.target.closest('button[data-action]');
    if (!target) return;
    const id = target.closest('[data-id]').dataset.id;
    if (target.dataset.action === 'edit') { editingId = id; render(); }
    if (target.dataset.action === 'cancel') { editingId = null; render(); focusRow(id); }
    if (target.dataset.action === 'delete') {
      tasks = tasks.filter((task) => task.id !== id);
      editingId = null;
      persist('Task deleted.');
      input.focus();
    }
  });

  list.addEventListener('submit', (event) => {
    if (!event.target.matches('.edit-form')) return;
    event.preventDefault();
    const editor = event.target.elements.title;
    const title = editor.value.trim();
    if (!title) { editor.setCustomValidity('Please enter a task title.'); editor.reportValidity(); return; }
    const id = event.target.closest('[data-id]').dataset.id;
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    task.title = title;
    editingId = null;
    persist('Task updated.');
    focusRow(id);
  });
  list.addEventListener('input', (event) => event.target.setCustomValidity(''));
  list.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && editingId) {
      const id = editingId;
      editingId = null;
      render();
      focusRow(id);
    }
  });

  $('#clear-completed').addEventListener('click', () => {
    const count = tasks.filter((task) => task.completed).length;
    if (!count || !window.confirm(`Delete ${count} completed task${count === 1 ? '' : 's'}?`)) return;
    tasks = tasks.filter((task) => !task.completed);
    editingId = null;
    persist('Completed tasks cleared.');
    input.focus();
  });

  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    try {
      tasks = load(event.newValue);
      writesAllowed = true;
      editingId = null;
      $('#storage-warning').hidden = true;
      $('#save-note').textContent = 'Saved on this device';
      render();
      announce('Tasks updated from another tab.');
    } catch {
      writesAllowed = false;
      warn('Another tab saved unreadable task data. This tab’s tasks are unchanged and will not overwrite storage.');
    }
  });

  $('#today').textContent = new Intl.DateTimeFormat(undefined, {
    weekday: 'long', month: 'long', day: 'numeric'
  }).format(new Date()).toLocaleUpperCase();
  render();
})();
