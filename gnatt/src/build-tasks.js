const { DateTime } = require("luxon");
const fs = require("fs");

const rawTasks = [
  {
    expectedStart: "2025-05-01",
    expectedEnd: "2025-05-07",
    // ... other fields
  },
  // ... more tasks
];

function toUtcIso(dateStr) {
  return DateTime.fromISO(dateStr, {
    zone: DateTime.local().zoneName, // Auto-detects user's current zone
  })
    .startOf("day")
    .toUTC()
    .toISO();
}


const converted = rawTasks.map(task => ({
  ...task,
  expectedStart: toUtcIso(task.expectedStart),
  expectedEnd: toUtcIso(task.expectedEnd),
  actualStart: toUtcIso(task.actualStart),
  actualEnd: toUtcIso(task.actualEnd),
  userOverwriteStart: task.userOverwriteStart ? toUtcIso(task.userOverwriteStart) : "",
  userOverwriteEnd: task.userOverwriteEnd ? toUtcIso(task.userOverwriteEnd) : "",
  clientAgreedEnd: toUtcIso(task.clientAgreedEnd),
}));

fs.writeFileSync(
  "./src/data/tasks.js",
  `const tasks = ${JSON.stringify(converted, null, 2)};\n\nexport default tasks;`
);
