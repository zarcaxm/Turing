const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

let db;

function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'turing-tasks.db');
  db = new Database(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          TEXT PRIMARY KEY,
      parentId    TEXT,
      title       TEXT NOT NULL,
      completed   INTEGER NOT NULL DEFAULT 0,
      level       INTEGER NOT NULL DEFAULT 0,
      score       INTEGER NOT NULL DEFAULT 100,
      createdAt   INTEGER NOT NULL,
      completedAt INTEGER,
      context     TEXT,
      expanded    INTEGER NOT NULL DEFAULT 1,
      sortOrder   INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (parentId) REFERENCES tasks(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_parentId ON tasks(parentId);
    CREATE INDEX IF NOT EXISTS idx_tasks_completedAt ON tasks(completedAt);
    CREATE INDEX IF NOT EXISTS idx_tasks_createdAt ON tasks(createdAt);
  `);

  return db;
}

function buildTaskTree(rows) {
  const taskMap = new Map();
  const roots = [];

  for (const row of rows) {
    taskMap.set(row.id, {
      id: row.id,
      number: '',
      title: row.title,
      completed: row.completed === 1,
      level: row.level,
      score: row.score,
      subtasks: [],
      createdAt: row.createdAt,
      completedAt: row.completedAt || undefined,
      expanded: row.expanded === 1,
      context: row.context || undefined,
    });
  }

  for (const row of rows) {
    const task = taskMap.get(row.id);
    if (row.parentId === null) {
      roots.push(task);
    } else {
      const parent = taskMap.get(row.parentId);
      if (parent) {
        parent.subtasks.push(task);
      }
    }
  }

  return roots;
}

function flattenTasks(tasks, parentId) {
  const rows = [];
  tasks.forEach((task, index) => {
    rows.push({
      id: task.id,
      parentId: parentId,
      title: task.title,
      completed: task.completed ? 1 : 0,
      level: task.level,
      score: task.score,
      createdAt: task.createdAt,
      completedAt: null,
      context: task.context || null,
      expanded: task.expanded !== false ? 1 : 0,
      sortOrder: index,
    });
    if (task.subtasks && task.subtasks.length > 0) {
      rows.push(...flattenTasks(task.subtasks, task.id));
    }
  });
  return rows;
}

function getAllTasks() {
  const rows = db.prepare('SELECT * FROM tasks ORDER BY parentId, sortOrder').all();
  return buildTaskTree(rows);
}

function addTask({ title, parentId, context }) {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const level = parentId ? (db.prepare('SELECT level FROM tasks WHERE id = ?').get(parentId)?.level ?? 0) + 1 : 0;
  const score = Math.max(0, 100 - level * 10);
  const sortOrder = parentId
    ? db.prepare('SELECT COUNT(*) as cnt FROM tasks WHERE parentId = ?').get(parentId).cnt
    : db.prepare('SELECT COUNT(*) as cnt FROM tasks WHERE parentId IS NULL').get().cnt;

  db.prepare(`
    INSERT INTO tasks (id, parentId, title, completed, level, score, createdAt, completedAt, context, expanded, sortOrder)
    VALUES (?, ?, ?, 0, ?, ?, ?, NULL, ?, 1, ?)
  `).run(id, parentId, title.trim(), level, score, Date.now(), context || null, sortOrder);

  if (parentId) {
    db.prepare('UPDATE tasks SET expanded = 1 WHERE id = ?').run(parentId);
  }

  return getAllTasks();
}

function deleteTask(taskId) {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
  return getAllTasks();
}

function toggleComplete(taskId) {
  const task = db.prepare('SELECT completed FROM tasks WHERE id = ?').get(taskId);
  if (!task) return getAllTasks();

  const newCompleted = task.completed === 1 ? 0 : 1;
  const completedAt = newCompleted === 1 ? Date.now() : null;

  db.prepare('UPDATE tasks SET completed = ?, completedAt = ? WHERE id = ?')
    .run(newCompleted, completedAt, taskId);

  return getAllTasks();
}

function toggleExpand(taskId) {
  const task = db.prepare('SELECT expanded FROM tasks WHERE id = ?').get(taskId);
  if (!task) return getAllTasks();

  db.prepare('UPDATE tasks SET expanded = ? WHERE id = ?')
    .run(task.expanded === 1 ? 0 : 1, taskId);

  return getAllTasks();
}

function updateTask(taskId, updates) {
  const setClauses = [];
  const values = [];

  if (updates.title !== undefined) {
    setClauses.push('title = ?');
    values.push(updates.title);
  }
  if (updates.context !== undefined) {
    setClauses.push('context = ?');
    values.push(updates.context || null);
  }
  if (updates.completed !== undefined) {
    setClauses.push('completed = ?', 'completedAt = ?');
    values.push(updates.completed ? 1 : 0, updates.completed ? Date.now() : null);
  }
  if (updates.expanded !== undefined) {
    setClauses.push('expanded = ?');
    values.push(updates.expanded ? 1 : 0);
  }

  if (setClauses.length > 0) {
    values.push(taskId);
    db.prepare(`UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
  }

  return getAllTasks();
}

function importFromLocalStorage(nestedTasks) {
  const flatRows = flattenTasks(nestedTasks, null);
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO tasks (id, parentId, title, completed, level, score, createdAt, completedAt, context, expanded, sortOrder)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      insertStmt.run(
        row.id, row.parentId, row.title, row.completed, row.level,
        row.score, row.createdAt, row.completedAt, row.context,
        row.expanded, row.sortOrder
      );
    }
    return rows.length;
  });

  return insertMany(flatRows);
}

function getTasksByDateRange(startDate, endDate) {
  return db.prepare(
    'SELECT * FROM tasks WHERE completedAt BETWEEN ? AND ? ORDER BY completedAt'
  ).all(startDate, endDate);
}

function getDailyScores(startDate, endDate) {
  return db.prepare(`
    SELECT
      date(completedAt / 1000, 'unixepoch', 'localtime') as date,
      SUM(score) as totalScore,
      COUNT(*) as completedCount
    FROM tasks
    WHERE completedAt BETWEEN ? AND ?
    GROUP BY date(completedAt / 1000, 'unixepoch', 'localtime')
    ORDER BY date
  `).all(startDate, endDate);
}

function closeDatabase() {
  if (db) db.close();
}

module.exports = {
  initDatabase,
  getAllTasks,
  addTask,
  deleteTask,
  toggleComplete,
  toggleExpand,
  updateTask,
  importFromLocalStorage,
  getTasksByDateRange,
  getDailyScores,
  closeDatabase,
};