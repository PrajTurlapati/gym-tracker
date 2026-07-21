const WORKOUT_PLAN = {
  Monday: {
    label: "Chest & Triceps & Abs",
    exercises: [
      { name: "Incline Dumbbell Press", sets: 6, targetReps: "8-10" },
      { name: "Normal Chest Flies", sets: 4, targetReps: "8-10" },
      { name: "Lower Chest Flies", sets: 3, targetReps: "8-10" },
      { name: "Machine/Bar Flat Chest Press", sets: 5, targetReps: "8-10" },
      { name: "Dips", sets: 4, targetReps: "8-10", bodyweight: true },
      { name: "Tricep Machine 1", sets: 3, targetReps: "8" },
      { name: "Abs Workout", sets: 4, targetReps: "11-18" },
    ],
  },
  Tuesday: {
    label: "Back & Biceps & Abs",
    exercises: [
      { name: "Lat Pull Down", sets: 6, targetReps: "8-10" },
      { name: "1 Arm Cable Pull Machine", sets: 2, targetReps: "8", note: "each arm" },
      { name: "Leg-Support Row Machine", sets: 3, targetReps: "8-10" },
      { name: "1 Arm Row Machine", sets: 3, targetReps: "8", note: "each arm" },
      { name: "Pull Ups", sets: 4, targetReps: "6", bodyweight: true },
      { name: "Bicep/Hammer Curl Machine", sets: 6, targetReps: "10" },
      { name: "Straight Arm Pull Down", sets: 3, targetReps: "10" },
      { name: "Abs Workout", sets: 4, targetReps: "11-18" },
    ],
  },
  Wednesday: {
    label: "Legs",
    exercises: [
      { name: "Hack Saw Squats Round 1", sets: 3, targetReps: "6-8" },
      { name: "Machine Leg Press Round 2", sets: 4, targetReps: "8-10" },
      { name: "Leg Extensions", sets: 3, targetReps: "10-12" },
      { name: "Rev Extensions", sets: 3, targetReps: "10-12" },
      { name: "Calf Raises", sets: 4, targetReps: "8-10" },
      { name: "Inner Leg Machine", sets: 2, targetReps: "10" },
      { name: "Outer Leg Machine", sets: 2, targetReps: "10" },
    ],
  },
  Thursday: { label: "Rest Day", exercises: [] },
  Friday: {
    label: "Shoulder & Full Body",
    exercises: [
      { name: "Shoulder Press Machine", sets: 4, targetReps: "9-11" },
      { name: "Dumbbell Lateral Raises", sets: 3, targetReps: "10" },
      { name: "Rear Delt Machine", sets: 4, targetReps: "8-10", note: "each arm" },
      { name: "Chest Fly Machine", sets: 4, targetReps: "8-10" },
      { name: "Leg Press Machine", sets: 5, targetReps: "10-12" },
      { name: "Ab Workout 1", sets: 3, targetReps: "13-15", note: "both sides" },
      { name: "Cable Lateral Raises", sets: 2, targetReps: "10", note: "each arm" },
      { name: "Cable Chest/back Workouts", sets: 6, targetReps: "12" },
    ],
  },
  Saturday: { label: "Rest Day", exercises: [] },
  Sunday: { label: "Rest Day", exercises: [] },
};

const DAY_NAMES = Object.keys(WORKOUT_PLAN);
const DRAFTS_KEY = "gymTrackerDrafts";
const HISTORY_KEY = "gymTrackerHistory";
const FOLDERS_KEY = "gymTrackerFolders";
const DEFAULT_SETS = 3;

const daySelect = document.getElementById("day-select");
const dayPanel = document.getElementById("day-panel");
const historyToggle = document.getElementById("history-toggle");
const historyClose = document.getElementById("history-close");
const historyPanel = document.getElementById("history-panel");
const historyList = document.getElementById("history-list");

let currentDay = todayName();
let drafts = loadDrafts();

function todayName() {
  return DAY_NAMES[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
}

function todayISODate() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function loadDrafts() {
  try {
    return JSON.parse(localStorage.getItem(DRAFTS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveDrafts() {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadHistory() {
  let history;
  try {
    history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    history = [];
  }
  let migrated = false;
  history.forEach((h) => {
    if (!h.id) {
      h.id = makeId();
      migrated = true;
    }
    if (h.folderId === undefined) {
      h.folderId = null;
      migrated = true;
    }
  });
  if (migrated) saveHistory(history);
  return history;
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function loadFolders() {
  try {
    return JSON.parse(localStorage.getItem(FOLDERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFolders(folders) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

function emptyDraftFor(day) {
  const plan = WORKOUT_PLAN[day];
  const exercises = {};
  plan.exercises.forEach((ex) => {
    exercises[ex.name] = Array.from({ length: DEFAULT_SETS }, () => ({ reps: "", weight: "" }));
  });
  return { day, exercises };
}

function getDraft(day) {
  if (!drafts[day]) {
    drafts[day] = emptyDraftFor(day);
  }
  return drafts[day];
}

function lastSessionFor(day) {
  const history = loadHistory();
  return history.find((h) => h.day === day) || null;
}

function populateDaySelect() {
  daySelect.innerHTML = "";
  DAY_NAMES.forEach((day) => {
    const opt = document.createElement("option");
    opt.value = day;
    opt.textContent = day === todayName() ? `${day} (Today)` : day;
    daySelect.appendChild(opt);
  });
  daySelect.value = currentDay;
}

function renderDay() {
  const plan = WORKOUT_PLAN[currentDay];
  const draft = getDraft(currentDay);

  if (plan.exercises.length === 0) {
    dayPanel.innerHTML = `
      <p class="day-title">${plan.label}</p>
      <div class="rest-day">Rest day. Go touch grass. 🌱</div>
    `;
    return;
  }

  const lastSession = lastSessionFor(currentDay);

  let totalSets = 0;
  let loggedSets = 0;
  plan.exercises.forEach((ex) => {
    totalSets += draft.exercises[ex.name].length;
    draft.exercises[ex.name].forEach((s) => {
      if (s.reps !== "") loggedSets++;
    });
  });
  const pct = totalSets === 0 ? 0 : Math.round((loggedSets / totalSets) * 100);

  const cardsHtml = plan.exercises
    .map((ex) => {
      const setState = draft.exercises[ex.name];
      const allLogged = setState.every((s) => s.reps !== "");
      const lastEx = lastSession && lastSession.exercises[ex.name];

      const rowsHtml = setState
        .map((s, i) => {
          const logged = s.reps !== "";
          const weightInputHtml = ex.bodyweight
            ? ""
            : `<input type="number" inputmode="decimal" placeholder="lbs" value="${s.weight}" data-field="weight" />`;
          return `
            <div class="set-row ${ex.bodyweight ? "bodyweight" : ""} ${logged ? "logged" : ""}" data-exercise="${escapeAttr(ex.name)}" data-set-index="${i}">
              <div class="set-num">${i + 1}</div>
              <input type="number" inputmode="numeric" placeholder="reps" value="${s.reps}" data-field="reps" />
              ${weightInputHtml}
              <div class="check"></div>
            </div>
          `;
        })
        .join("");

      const lastTimeHtml = lastEx
        ? `<div class="last-time">Last time: ${lastEx
            .map((s) => (s.reps !== "" ? `${s.reps}${s.weight !== "" ? "×" + s.weight + "lb" : ""}` : "—"))
            .join(", ")}</div>`
        : "";

      return `
        <div class="exercise-card ${allLogged ? "complete" : ""}" data-exercise-card="${escapeAttr(ex.name)}">
          <div class="exercise-header">
            <div class="exercise-name">${ex.name}</div>
            <div class="exercise-target">${ex.targetReps} reps</div>
          </div>
          ${ex.note ? `<div class="exercise-note">${ex.note}</div>` : ""}
          ${lastTimeHtml}
          <div class="set-rows">${rowsHtml}</div>
          <button class="add-set-btn" data-exercise="${escapeAttr(ex.name)}">+ Add Set</button>
        </div>
      `;
    })
    .join("");

  dayPanel.innerHTML = `
    <p class="day-title">${plan.label}</p>
    <div class="progress-wrap">
      <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
      <div class="progress-label">${loggedSets} / ${totalSets} sets logged</div>
    </div>
    ${cardsHtml}
    <div class="finish-bar">
      <button id="finish-btn" class="finish-btn" ${loggedSets === 0 ? "disabled" : ""}>Finish Workout</button>
    </div>
  `;

  dayPanel.querySelectorAll(".set-row input").forEach((input) => {
    input.addEventListener("input", onSetInputChange);
  });

  dayPanel.querySelectorAll(".add-set-btn").forEach((btn) => {
    btn.addEventListener("click", onAddSetClick);
  });

  const finishBtn = document.getElementById("finish-btn");
  if (finishBtn) finishBtn.addEventListener("click", finishWorkout);
}

function onAddSetClick(e) {
  const exerciseName = e.target.dataset.exercise;
  const draft = getDraft(currentDay);
  draft.exercises[exerciseName].push({ reps: "", weight: "" });
  saveDrafts();
  renderDay();
}

function onSetInputChange(e) {
  const row = e.target.closest(".set-row");
  const exerciseName = row.dataset.exercise;
  const setIndex = Number(row.dataset.setIndex);
  const field = e.target.dataset.field;

  const draft = getDraft(currentDay);
  draft.exercises[exerciseName][setIndex][field] = e.target.value;
  saveDrafts();

  updateRowAndProgress(exerciseName, row);
}

function updateRowAndProgress(exerciseName, row) {
  const draft = getDraft(currentDay);
  const setState = draft.exercises[exerciseName];
  const logged = setState[Number(row.dataset.setIndex)].reps !== "";
  row.classList.toggle("logged", logged);

  const card = dayPanel.querySelector(`[data-exercise-card="${cssEscape(exerciseName)}"]`);
  const allLogged = setState.every((s) => s.reps !== "");
  card.classList.toggle("complete", allLogged);

  const plan = WORKOUT_PLAN[currentDay];
  let totalSets = 0;
  let loggedSets = 0;
  plan.exercises.forEach((ex) => {
    totalSets += draft.exercises[ex.name].length;
    draft.exercises[ex.name].forEach((s) => {
      if (s.reps !== "") loggedSets++;
    });
  });
  const pct = totalSets === 0 ? 0 : Math.round((loggedSets / totalSets) * 100);
  dayPanel.querySelector(".progress-bar-fill").style.width = `${pct}%`;
  dayPanel.querySelector(".progress-label").textContent = `${loggedSets} / ${totalSets} sets logged`;

  const finishBtn = document.getElementById("finish-btn");
  if (finishBtn) finishBtn.disabled = loggedSets === 0;
}

function finishWorkout() {
  const draft = getDraft(currentDay);
  const hasAnyLogged = Object.values(draft.exercises).some((sets) => sets.some((s) => s.reps !== ""));
  if (!hasAnyLogged) return;

  const history = loadHistory();
  history.unshift({
    id: makeId(),
    folderId: null,
    date: todayISODate(),
    day: currentDay,
    exercises: draft.exercises,
  });
  saveHistory(history);

  delete drafts[currentDay];
  saveDrafts();

  renderDay();
  alert("Workout saved. Nice work.");
}

function historyEntryHtml(entry, folders) {
  const exercisesHtml = Object.entries(entry.exercises)
    .map(([name, sets]) => {
      const loggedSets = sets.filter((s) => s.reps !== "");
      if (loggedSets.length === 0) return "";
      const setsStr = loggedSets
        .map((s) => `${s.reps}${s.weight !== "" ? "×" + s.weight + "lb" : ""}`)
        .join(", ");
      return `<div class="history-exercise"><span class="h-name">${name}:</span> ${setsStr}</div>`;
    })
    .join("");

  const folderOptionsHtml =
    `<option value="" ${entry.folderId ? "" : "selected"}>Unsorted</option>` +
    folders
      .map((f) => `<option value="${f.id}" ${entry.folderId === f.id ? "selected" : ""}>${escapeAttr(f.name)}</option>`)
      .join("");

  return `
    <div class="history-entry" data-entry-id="${entry.id}">
      <div class="history-entry-header">
        <span>${entry.day}</span>
        <span class="h-date">${entry.date}</span>
      </div>
      ${exercisesHtml}
      <div class="history-entry-controls">
        <select class="move-folder-select" data-entry-id="${entry.id}">${folderOptionsHtml}</select>
        <button class="ghost-btn small delete-entry-btn" data-entry-id="${entry.id}">Delete</button>
      </div>
    </div>
  `;
}

function renderHistory() {
  const history = loadHistory();
  const folders = loadFolders();

  const folderSectionsHtml = folders
    .map((f) => {
      const entries = history.filter((h) => h.folderId === f.id);
      return `
        <div class="folder-section">
          <div class="folder-header">
            <span class="folder-name">${escapeAttr(f.name)} <span class="folder-count">(${entries.length})</span></span>
            <div class="folder-actions">
              <button class="ghost-btn small rename-folder-btn" data-folder-id="${f.id}">Rename</button>
              <button class="ghost-btn small delete-folder-btn" data-folder-id="${f.id}">Delete</button>
            </div>
          </div>
          ${entries.length ? entries.map((e) => historyEntryHtml(e, folders)).join("") : `<div class="empty-state small">No sessions moved here yet.</div>`}
        </div>
      `;
    })
    .join("");

  const unsorted = history.filter((h) => !h.folderId);
  const unsortedHtml = `
    <div class="folder-section">
      <div class="folder-header"><span class="folder-name">Unsorted</span></div>
      ${unsorted.length ? unsorted.map((e) => historyEntryHtml(e, folders)).join("") : `<div class="empty-state small">Nothing unsorted.</div>`}
    </div>
  `;

  if (history.length === 0 && folders.length === 0) {
    historyList.innerHTML = `<div class="empty-state">No sessions logged yet.</div>`;
    return;
  }

  historyList.innerHTML = folderSectionsHtml + unsortedHtml;

  historyList.querySelectorAll(".move-folder-select").forEach((sel) => {
    sel.addEventListener("change", (e) => {
      const entryId = e.target.dataset.entryId;
      const folderId = e.target.value || null;
      const h = loadHistory();
      const entry = h.find((x) => x.id === entryId);
      if (entry) {
        entry.folderId = folderId;
        saveHistory(h);
        renderHistory();
      }
    });
  });

  historyList.querySelectorAll(".delete-entry-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const entryId = e.target.dataset.entryId;
      if (!confirm("Delete this workout session? This can't be undone.")) return;
      const h = loadHistory().filter((x) => x.id !== entryId);
      saveHistory(h);
      renderHistory();
    });
  });

  historyList.querySelectorAll(".rename-folder-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const folderId = e.target.dataset.folderId;
      const f = loadFolders();
      const folder = f.find((x) => x.id === folderId);
      if (!folder) return;
      const newName = prompt("Rename folder", folder.name);
      if (newName && newName.trim()) {
        folder.name = newName.trim();
        saveFolders(f);
        renderHistory();
      }
    });
  });

  historyList.querySelectorAll(".delete-folder-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const folderId = e.target.dataset.folderId;
      if (!confirm("Delete this folder? Sessions inside will move back to Unsorted.")) return;
      const f = loadFolders().filter((x) => x.id !== folderId);
      saveFolders(f);
      const h = loadHistory();
      h.forEach((entry) => {
        if (entry.folderId === folderId) entry.folderId = null;
      });
      saveHistory(h);
      renderHistory();
    });
  });
}

function escapeAttr(str) {
  return str.replace(/"/g, "&quot;");
}

function cssEscape(str) {
  return str.replace(/(["\\])/g, "\\$1");
}

daySelect.addEventListener("change", () => {
  currentDay = daySelect.value;
  renderDay();
});

historyToggle.addEventListener("click", () => {
  renderHistory();
  historyPanel.classList.remove("hidden");
});

historyClose.addEventListener("click", () => {
  historyPanel.classList.add("hidden");
});

document.getElementById("new-folder-btn").addEventListener("click", () => {
  const name = prompt("New folder name (e.g. Week of Jul 20)");
  if (name && name.trim()) {
    const folders = loadFolders();
    folders.push({ id: makeId(), name: name.trim() });
    saveFolders(folders);
    renderHistory();
  }
});

populateDaySelect();
renderDay();
