const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

let db;

function getLegacyDatabasePaths(targetDbPath) {
  const appDataPath = app.getPath('appData');
  const candidateDirs = [
    'Hyperion Task Manager',
    'hyperion-task-manager',
    'Turing',
    'turing-task-manager',
  ];

  return candidateDirs
    .map((dir) => path.join(appDataPath, dir, 'turing-tasks.db'))
    .filter((candidatePath) => candidatePath !== targetDbPath);
}

function migrateLegacyDatabase(dbPath) {
  if (fs.existsSync(dbPath)) {
    return;
  }

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const legacyDbPath = getLegacyDatabasePaths(dbPath).find((candidatePath) => fs.existsSync(candidatePath));
  if (!legacyDbPath) {
    return;
  }

  for (const suffix of ['', '-wal', '-shm']) {
    const sourcePath = `${legacyDbPath}${suffix}`;
    const targetPath = `${dbPath}${suffix}`;
    if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'turing-tasks.db');
  migrateLegacyDatabase(dbPath);
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

  ensureColumn('elapsedTimeMs', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('timerStartedAt', 'INTEGER');
  ensureColumn('status', "TEXT NOT NULL DEFAULT 'active'");

  return db;
}

function ensureColumn(columnName, definition) {
  const columns = db.prepare('PRAGMA table_info(tasks)').all();
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    db.exec(`ALTER TABLE tasks ADD COLUMN ${columnName} ${definition}`);
  }
}

function buildTaskTree(rows) {
  const taskMap = new Map();
  const roots = [];

  for (const row of rows) {
    taskMap.set(row.id, {
      id: row.id,
      number: '',
      title: row.title,
      status: row.status === 'backlog' ? 'backlog' : 'active',
      completed: row.completed === 1,
      level: row.level,
      score: row.score,
      subtasks: [],
      createdAt: row.createdAt,
      completedAt: row.completedAt || undefined,
      expanded: row.expanded === 1,
      context: row.context || undefined,
      elapsedTimeMs: row.elapsedTimeMs || 0,
      timerStartedAt: row.timerStartedAt || undefined,
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
      status: task.status ?? 'active',
      completed: task.completed ? 1 : 0,
      level: task.level,
      score: task.score,
      createdAt: task.createdAt,
      completedAt: task.completedAt ?? null,
      context: task.context ?? null,
      expanded: task.expanded !== false ? 1 : 0,
      elapsedTimeMs: task.elapsedTimeMs || 0,
      timerStartedAt: task.timerStartedAt ?? null,
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

function addTask({ title, parentId, context, status }) {
  const now = Date.now();
  const id = `${now}-${Math.random().toString(36).substr(2, 9)}`;
  const level = parentId ? (db.prepare('SELECT level FROM tasks WHERE id = ?').get(parentId)?.level ?? 0) + 1 : 0;
  const inheritedStatus = parentId
    ? (db.prepare('SELECT status FROM tasks WHERE id = ?').get(parentId)?.status ?? 'active')
    : (status === 'backlog' ? 'backlog' : 'active');
  const score = Math.max(0, 100 - level * 10);
  const sortOrder = parentId
    ? db.prepare('SELECT COUNT(*) as cnt FROM tasks WHERE parentId = ?').get(parentId).cnt
    : db.prepare('SELECT COUNT(*) as cnt FROM tasks WHERE parentId IS NULL').get().cnt;

  db.prepare(`
    INSERT INTO tasks (id, parentId, title, status, completed, level, score, createdAt, completedAt, context, expanded, elapsedTimeMs, timerStartedAt, sortOrder)
    VALUES (?, ?, ?, ?, 0, ?, ?, ?, NULL, ?, 1, 0, NULL, ?)
  `).run(id, parentId, title.trim(), inheritedStatus, level, score, now, context || null, sortOrder);

  if (parentId) {
    const parentTask = db.prepare('SELECT elapsedTimeMs, timerStartedAt FROM tasks WHERE id = ?').get(parentId);
    const parentElapsedTimeMs = parentTask?.timerStartedAt
      ? parentTask.elapsedTimeMs + Math.max(0, now - parentTask.timerStartedAt)
      : parentTask?.elapsedTimeMs;

    db.prepare('UPDATE tasks SET expanded = 1, elapsedTimeMs = ?, timerStartedAt = NULL WHERE id = ?')
      .run(parentElapsedTimeMs ?? 0, parentId);
  }

  return getAllTasks();
}

function deleteTask(taskId) {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
  return getAllTasks();
}

function toggleComplete(taskId) {
  const task = db.prepare('SELECT completed, elapsedTimeMs, timerStartedAt FROM tasks WHERE id = ?').get(taskId);
  if (!task) return getAllTasks();

  const newCompleted = task.completed === 1 ? 0 : 1;
  const now = Date.now();
  const completedAt = newCompleted === 1 ? now : null;
  const elapsedTimeMs = task.timerStartedAt
    ? task.elapsedTimeMs + Math.max(0, now - task.timerStartedAt)
    : task.elapsedTimeMs;

  db.prepare('UPDATE tasks SET completed = ?, completedAt = ?, elapsedTimeMs = ?, timerStartedAt = NULL WHERE id = ?')
    .run(newCompleted, completedAt, elapsedTimeMs, taskId);

  return getAllTasks();
}

function toggleExpand(taskId) {
  const task = db.prepare('SELECT expanded FROM tasks WHERE id = ?').get(taskId);
  if (!task) return getAllTasks();

  db.prepare('UPDATE tasks SET expanded = ? WHERE id = ?')
    .run(task.expanded === 1 ? 0 : 1, taskId);

  return getAllTasks();
}

function startTaskTimer(taskId) {
  const now = Date.now();
  const updateStmt = db.prepare(`
    UPDATE tasks
    SET timerStartedAt = ?
    WHERE id = ?
      AND completed = 0
      AND timerStartedAt IS NULL
  `);

  updateStmt.run(now, taskId);
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
    values.push(updates.context ?? null);
  }
  if (updates.completed !== undefined) {
    setClauses.push('completed = ?', 'completedAt = ?');
    values.push(updates.completed ? 1 : 0, updates.completed ? Date.now() : null);
  }
  if (updates.expanded !== undefined) {
    setClauses.push('expanded = ?');
    values.push(updates.expanded ? 1 : 0);
  }
  if (updates.elapsedTimeMs !== undefined) {
    setClauses.push('elapsedTimeMs = ?');
    values.push(updates.elapsedTimeMs);
  }
  if (updates.timerStartedAt !== undefined) {
    setClauses.push('timerStartedAt = ?');
    values.push(updates.timerStartedAt ?? null);
  }
  if (updates.status !== undefined) {
    const nextStatus = updates.status === 'backlog' ? 'backlog' : 'active';
    db.prepare(`
      WITH RECURSIVE task_tree(id) AS (
        SELECT id FROM tasks WHERE id = ?
        UNION ALL
        SELECT tasks.id
        FROM tasks
        INNER JOIN task_tree ON tasks.parentId = task_tree.id
      )
      UPDATE tasks
      SET status = ?
      WHERE id IN (SELECT id FROM task_tree)
    `).run(taskId, nextStatus);
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
    INSERT OR IGNORE INTO tasks (id, parentId, title, status, completed, level, score, createdAt, completedAt, context, expanded, elapsedTimeMs, timerStartedAt, sortOrder)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      insertStmt.run(
        row.id, row.parentId, row.title, row.status, row.completed, row.level,
        row.score, row.createdAt, row.completedAt, row.context,
        row.expanded, row.elapsedTimeMs, row.timerStartedAt, row.sortOrder
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

function reorderTasks(taskIds) {
  const updateStmt = db.prepare('UPDATE tasks SET sortOrder = ? WHERE id = ?');
  const updateMany = db.transaction((ids) => {
    ids.forEach((id, index) => {
      updateStmt.run(index, id);
    });
  });
  updateMany(taskIds);
  return getAllTasks();
}

function closeDatabase() {
  if (!db) {
    return;
  }

  db.close();
  db = null;
}

module.exports = {
  initDatabase,
  getAllTasks,
  addTask,
  deleteTask,
  toggleComplete,
  toggleExpand,
  startTaskTimer,
  updateTask,
  reorderTasks,
  importFromLocalStorage,
  getTasksByDateRange,
  getDailyScores,
  closeDatabase,
};
