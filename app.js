const WORKOUT_TYPES = {
  "Chest/Triceps": {
    label: "Chest & Triceps",
    exercises: [
      { name: "Incline Dumbbell Press", sets: 6, targetReps: "8-10" },
      { name: "Normal Chest Flies", sets: 4, targetReps: "8-10" },
      { name: "Lower Chest Flies", sets: 3, targetReps: "8-10" },
      { name: "Machine/Bar Flat Chest Press", sets: 5, targetReps: "8-10" },
      { name: "Dips", sets: 4, targetReps: "8-10", bodyweight: true },
      { name: "Tricep Machine 1", sets: 3, targetReps: "8" },
    ],
  },
  "Back/Biceps": {
    label: "Back & Biceps",
    exercises: [
      { name: "Lat Pull Down", sets: 6, targetReps: "8-10" },
      { name: "1 Arm Cable Pull Machine", sets: 2, targetReps: "8", note: "each arm" },
      { name: "Leg-Support Row Machine", sets: 3, targetReps: "8-10" },
      { name: "1 Arm Row Machine", sets: 3, targetReps: "8", note: "each arm" },
      { name: "Pull Ups", sets: 4, targetReps: "6", bodyweight: true },
      { name: "Bicep/Hammer Curl Machine", sets: 6, targetReps: "10" },
      { name: "Straight Arm Pull Down", sets: 3, targetReps: "10" },
    ],
  },
  Legs: {
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
  "Shoulders & Legs": {
    label: "Shoulders & Legs",
    exercises: [
      { name: "Shoulder Press Machine", sets: 4, targetReps: "9-11" },
      { name: "Dumbbell Lateral Raises", sets: 3, targetReps: "10" },
      { name: "Rear Delt Machine", sets: 4, targetReps: "8-10", note: "each arm" },
      { name: "Chest Fly Machine", sets: 4, targetReps: "8-10" },
      { name: "Leg Press Machine", sets: 5, targetReps: "10-12" },
      { name: "Cable Lateral Raises", sets: 2, targetReps: "10", note: "each arm" },
      { name: "Cable Chest/back Workouts", sets: 6, targetReps: "12" },
    ],
  },
  Rest: { label: "Rest Day", exercises: [] },
};

const WORKOUT_TYPE_NAMES = Object.keys(WORKOUT_TYPES);

const WORKOUT_TYPE_SLUGS = {
  "Chest/Triceps": "chest",
  "Back/Biceps": "back",
  Legs: "legs",
  "Shoulders & Legs": "shoulders",
  Rest: "rest",
};

function typeSlug(name) {
  return WORKOUT_TYPE_SLUGS[name] || "";
}

const ABS_BASE_NAME = "Abs Workout";
const ABS_EXERCISE_DEF = { targetReps: "11-18", initialSets: 2 };

const RUN_FIELDS = [
  { key: "duration", label: "min", step: "1", min: "0" },
  { key: "speed", label: "mph", step: "0.5", min: "2", max: "8" },
  { key: "incline", label: "incline", step: "0.1", min: "2", max: "10" },
];

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DRAFTS_KEY = "gymTrackerDrafts";
const HISTORY_KEY = "gymTrackerHistory";
const FOLDERS_KEY = "gymTrackerFolders";
const DEFAULT_SETS = 3;
const MIN_SETS = 2;

const daySelect = document.getElementById("day-select");
const dayPanel = document.getElementById("day-panel");
const historyToggle = document.getElementById("history-toggle");
const historyClose = document.getElementById("history-close");
const historyPanel = document.getElementById("history-panel");
const historyList = document.getElementById("history-list");

let currentDay = todayName();
let drafts = loadDrafts();
let collapsedExerciseCards = new Set();
let openHistoryEntries = new Set();

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
  return {
    day,
    type: null,
    abs: false,
    run: false,
    absExtraCount: 0,
    exercises: {},
    runData: { duration: "", speed: "", incline: "" },
    date: todayISODate(),
  };
}

function getDraft(day) {
  if (!drafts[day]) {
    drafts[day] = emptyDraftFor(day);
  }
  const draft = drafts[day];
  if (draft.type === undefined) draft.type = null;
  if (draft.abs === undefined) draft.abs = false;
  if (draft.run === undefined) draft.run = false;
  if (draft.absExtraCount === undefined) draft.absExtraCount = 0;
  if (!draft.exercises) draft.exercises = {};
  if (!draft.runData) draft.runData = { duration: "", speed: "", incline: "" };
  if (!draft.date) draft.date = todayISODate();
  return draft;
}

function absNameForIndex(i) {
  return i === 1 ? ABS_BASE_NAME : `${ABS_BASE_NAME} ${i}`;
}

function activeExerciseNames(draft) {
  const names = [];
  if (draft.type && draft.type !== "Rest") {
    WORKOUT_TYPES[draft.type].exercises.forEach((ex) => names.push(ex.name));
  }
  if (draft.abs) {
    for (let i = 1; i <= 1 + draft.absExtraCount; i++) {
      names.push(absNameForIndex(i));
    }
  }
  return names;
}

function exerciseDefFor(draft, name) {
  if (draft.type && draft.type !== "Rest") {
    const found = WORKOUT_TYPES[draft.type].exercises.find((ex) => ex.name === name);
    if (found) return found;
  }
  if (name.startsWith(ABS_BASE_NAME)) return ABS_EXERCISE_DEF;
  return { targetReps: "" };
}

function isSetFull(ex, s) {
  return s.reps !== "" && (ex.bodyweight || s.weight !== "");
}

function isSetTouched(ex, s) {
  return s.reps !== "" || (!ex.bodyweight && s.weight !== "");
}

function syncDraftExercises(draft) {
  activeExerciseNames(draft).forEach((name) => {
    if (!draft.exercises[name]) {
      const def = exerciseDefFor(draft, name);
      draft.exercises[name] = Array.from({ length: def.initialSets || DEFAULT_SETS }, () => ({ reps: "", weight: "" }));
    }
  });
}

function hasLoggedData(draft) {
  const hasSets = activeExerciseNames(draft).some((name) =>
    (draft.exercises[name] || []).some((s) => s.reps !== "")
  );
  const hasRun = Object.values(draft.runData).some((v) => v !== "");
  return hasSets || hasRun;
}

function lastLoggedFor(exerciseName) {
  const history = loadHistory();
  const entry = history.find(
    (h) => h.exercises && h.exercises[exerciseName] && h.exercises[exerciseName].some((s) => s.reps !== "")
  );
  return entry ? entry.exercises[exerciseName] : null;
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

function renderSetupHtml(draft) {
  const typeButtonsHtml = WORKOUT_TYPE_NAMES.map((name) => {
    const selected = draft.type === name;
    return `<button class="type-btn type-chip-${typeSlug(name)} ${selected ? "selected" : ""}" data-type="${escapeAttr(name)}">${name}</button>`;
  }).join("");

  return `
    <div class="workout-setup">
      <div class="type-picker">${typeButtonsHtml}</div>
      <div class="extra-toggles">
        <label class="toggle-check"><input type="checkbox" id="abs-toggle" ${draft.abs ? "checked" : ""} /> Abs</label>
        <label class="toggle-check"><input type="checkbox" id="run-toggle" ${draft.run ? "checked" : ""} /> Run/Jog</label>
      </div>
      <div class="session-date-row">
        <label for="session-date-input">Session date</label>
        <input type="date" id="session-date-input" class="date-input" value="${draft.date}" />
      </div>
    </div>
  `;
}

function wireSetupListeners(draft) {
  dayPanel.querySelectorAll(".type-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      draft.type = btn.dataset.type;
      syncDraftExercises(draft);
      saveDrafts();
      renderDay();
    });
  });

  const absToggle = document.getElementById("abs-toggle");
  if (absToggle) {
    absToggle.addEventListener("change", (e) => {
      draft.abs = e.target.checked;
      syncDraftExercises(draft);
      saveDrafts();
      renderDay();
    });
  }

  const runToggle = document.getElementById("run-toggle");
  if (runToggle) {
    runToggle.addEventListener("change", (e) => {
      draft.run = e.target.checked;
      saveDrafts();
      renderDay();
    });
  }

  const sessionDateInput = document.getElementById("session-date-input");
  if (sessionDateInput) {
    sessionDateInput.addEventListener("change", (e) => {
      if (!e.target.value) return;
      draft.date = e.target.value;
      saveDrafts();
    });
  }
}

function exerciseCardHtml(draft, name) {
  const ex = exerciseDefFor(draft, name);
  const setState = draft.exercises[name];
  const allFull = setState.every((s) => isSetFull(ex, s));
  const anyTouched = setState.some((s) => isSetTouched(ex, s));
  const partial = anyTouched && !allFull;
  const lastEx = lastLoggedFor(name);
  const collapsed = collapsedExerciseCards.has(name);
  const canDelete = setState.length > MIN_SETS;

  const isMainTypeExercise =
    draft.type && draft.type !== "Rest" && WORKOUT_TYPES[draft.type].exercises.some((e) => e.name === name);
  const typeChipClass = isMainTypeExercise ? `type-chip-${typeSlug(draft.type)}` : "";

  const rowsHtml = setState
    .map((s, i) => {
      const logged = isSetFull(ex, s);
      const weightInputHtml = ex.bodyweight
        ? ""
        : `<input type="number" inputmode="decimal" placeholder="lbs" value="${s.weight}" data-field="weight" />`;
      return `
        <div class="set-row ${ex.bodyweight ? "bodyweight" : ""} ${logged ? "logged" : ""}" data-exercise="${escapeAttr(name)}" data-set-index="${i}">
          <div class="set-num">${i + 1}</div>
          <input type="number" inputmode="numeric" placeholder="reps" value="${s.reps}" data-field="reps" />
          ${weightInputHtml}
          <div class="check"></div>
          <button class="delete-set-btn" data-exercise="${escapeAttr(name)}" data-set-index="${i}" ${canDelete ? "" : "disabled"} aria-label="Delete set" title="Delete set">×</button>
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
    <div class="exercise-card ${typeChipClass} ${allFull ? "complete" : ""} ${partial ? "partial" : ""} ${collapsed ? "collapsed" : ""}" data-exercise-card="${escapeAttr(name)}">
      <div class="exercise-header">
        <div class="exercise-name">${name}</div>
        <div class="exercise-header-right">
          <div class="exercise-target">${ex.targetReps} reps</div>
          <span class="collapse-arrow">▾</span>
        </div>
      </div>
      <div class="exercise-card-body">
        ${ex.note ? `<div class="exercise-note">${ex.note}</div>` : ""}
        ${lastTimeHtml}
        <div class="set-rows">${rowsHtml}</div>
        <button class="add-set-btn" data-exercise="${escapeAttr(name)}">+ Add Set</button>
      </div>
    </div>
  `;
}

function runRowHtml(draft) {
  const fieldsHtml = RUN_FIELDS.map(
    (f) => `
      <div class="run-field">
        <input type="number" inputmode="decimal" placeholder="${f.label}" value="${draft.runData[f.key]}" data-field="${f.key}" step="${f.step}" min="${f.min}" ${f.max ? `max="${f.max}"` : ""} />
        <div class="run-field-label">${f.label}</div>
      </div>
    `
  ).join("");

  return `
    <div class="exercise-card run-card">
      <div class="exercise-header">
        <div class="exercise-name">Run / Jog</div>
      </div>
      <div class="run-row">${fieldsHtml}</div>
    </div>
  `;
}

function renderDay() {
  const draft = getDraft(currentDay);
  const setupHtml = renderSetupHtml(draft);

  const hasType = !!draft.type;
  const showRestMessage = draft.type === "Rest" && !draft.abs && !draft.run;

  let bodyHtml = "";

  if (!hasType) {
    bodyHtml = `<div class="empty-state">Pick a workout type above to get started.</div>`;
  } else if (showRestMessage) {
    bodyHtml = `<div class="rest-day">Rest day. Go touch grass. 🌱</div>`;
  } else {
    syncDraftExercises(draft);
    const names = activeExerciseNames(draft);

    let totalSets = 0;
    let loggedSets = 0;
    names.forEach((name) => {
      const setState = draft.exercises[name];
      totalSets += setState.length;
      setState.forEach((s) => {
        if (s.reps !== "") loggedSets++;
      });
    });
    const pct = totalSets === 0 ? 0 : Math.round((loggedSets / totalSets) * 100);

    const cardsHtml = names.map((name) => exerciseCardHtml(draft, name)).join("");
    const addAbsBtnHtml = draft.abs ? `<button id="add-abs-btn" class="add-set-btn">+ Add Abs Exercise</button>` : "";
    const runHtml = draft.run ? runRowHtml(draft) : "";
    const finishEnabled = hasLoggedData(draft);

    bodyHtml = `
      ${
        totalSets > 0
          ? `<div class="progress-wrap">
              <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
              <div class="progress-label">${loggedSets} / ${totalSets} sets logged</div>
            </div>`
          : ""
      }
      ${cardsHtml}
      ${addAbsBtnHtml}
      ${runHtml}
      <div class="finish-bar">
        <button id="finish-btn" class="finish-btn" ${finishEnabled ? "" : "disabled"}>Finish Workout</button>
      </div>
    `;
  }

  dayPanel.innerHTML = setupHtml + bodyHtml;
  wireSetupListeners(draft);

  if (hasType && !showRestMessage) {
    dayPanel.querySelectorAll(".set-row input").forEach((input) => {
      input.addEventListener("input", onSetInputChange);
    });

    dayPanel.querySelectorAll(".add-set-btn[data-exercise]").forEach((btn) => {
      btn.addEventListener("click", onAddSetClick);
    });

    dayPanel.querySelectorAll(".delete-set-btn").forEach((btn) => {
      btn.addEventListener("click", onDeleteSetClick);
    });

    dayPanel.querySelectorAll(".exercise-card:not(.run-card) > .exercise-header").forEach((header) => {
      header.addEventListener("click", onExerciseHeaderClick);
    });

    const addAbsBtn = document.getElementById("add-abs-btn");
    if (addAbsBtn) addAbsBtn.addEventListener("click", onAddAbsClick);

    dayPanel.querySelectorAll(".run-row input").forEach((input) => {
      input.addEventListener("input", onRunInputChange);
    });

    const finishBtn = document.getElementById("finish-btn");
    if (finishBtn) finishBtn.addEventListener("click", finishWorkout);
  }
}

function onExerciseHeaderClick(e) {
  const card = e.currentTarget.closest(".exercise-card");
  const name = card.dataset.exerciseCard;
  const nowCollapsed = card.classList.toggle("collapsed");
  if (nowCollapsed) collapsedExerciseCards.add(name);
  else collapsedExerciseCards.delete(name);
}

function onAddSetClick(e) {
  const exerciseName = e.target.dataset.exercise;
  const draft = getDraft(currentDay);
  draft.exercises[exerciseName].push({ reps: "", weight: "" });
  saveDrafts();
  renderDay();
}

function onDeleteSetClick(e) {
  const exerciseName = e.currentTarget.dataset.exercise;
  const setIndex = Number(e.currentTarget.dataset.setIndex);
  const draft = getDraft(currentDay);
  const sets = draft.exercises[exerciseName];
  if (!sets || sets.length <= MIN_SETS) return;
  sets.splice(setIndex, 1);
  saveDrafts();
  renderDay();
}

function onAddAbsClick() {
  const draft = getDraft(currentDay);
  draft.absExtraCount++;
  syncDraftExercises(draft);
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

  updateRowAndProgress(draft, exerciseName, row);
}

function onRunInputChange(e) {
  const field = e.target.dataset.field;
  const draft = getDraft(currentDay);
  draft.runData[field] = e.target.value;
  saveDrafts();

  const finishBtn = document.getElementById("finish-btn");
  if (finishBtn) finishBtn.disabled = !hasLoggedData(draft);
}

function updateRowAndProgress(draft, exerciseName, row) {
  const ex = exerciseDefFor(draft, exerciseName);
  const setState = draft.exercises[exerciseName];
  const logged = isSetFull(ex, setState[Number(row.dataset.setIndex)]);
  row.classList.toggle("logged", logged);

  const card = dayPanel.querySelector(`[data-exercise-card="${cssEscape(exerciseName)}"]`);
  const allFull = setState.every((s) => isSetFull(ex, s));
  const anyTouched = setState.some((s) => isSetTouched(ex, s));
  card.classList.toggle("complete", allFull);
  card.classList.toggle("partial", anyTouched && !allFull);

  const names = activeExerciseNames(draft);
  let totalSets = 0;
  let loggedSets = 0;
  names.forEach((name) => {
    const s = draft.exercises[name] || [];
    totalSets += s.length;
    s.forEach((set) => {
      if (set.reps !== "") loggedSets++;
    });
  });
  const pct = totalSets === 0 ? 0 : Math.round((loggedSets / totalSets) * 100);
  const fill = dayPanel.querySelector(".progress-bar-fill");
  if (fill) fill.style.width = `${pct}%`;
  const label = dayPanel.querySelector(".progress-label");
  if (label) label.textContent = `${loggedSets} / ${totalSets} sets logged`;

  const finishBtn = document.getElementById("finish-btn");
  if (finishBtn) finishBtn.disabled = !hasLoggedData(draft);
}

function finishWorkout() {
  const draft = getDraft(currentDay);
  if (!hasLoggedData(draft)) return;

  const exercisesToSave = {};
  activeExerciseNames(draft).forEach((name) => {
    exercisesToSave[name] = draft.exercises[name];
  });

  const history = loadHistory();
  history.unshift({
    id: makeId(),
    folderId: null,
    date: draft.date,
    day: currentDay,
    type: draft.type,
    abs: draft.abs,
    run: draft.run,
    exercises: exercisesToSave,
    runData: draft.run ? draft.runData : undefined,
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

  const runHtml = entry.runData
    ? `<div class="history-exercise"><span class="h-name">Run:</span> ${entry.runData.duration || "—"} min · ${entry.runData.speed || "—"} mph · ${entry.runData.incline || "—"} incline</div>`
    : "";

  const folderOptionsHtml =
    `<option value="" ${entry.folderId ? "" : "selected"}>Unsorted</option>` +
    folders
      .map((f) => `<option value="${f.id}" ${entry.folderId === f.id ? "selected" : ""}>${escapeAttr(f.name)}</option>`)
      .join("");

  const headerLabel = entry.type
    ? `${entry.day} — ${entry.type}${entry.abs ? " + Abs" : ""}${entry.run ? " + Run" : ""}`
    : entry.day;

  const typeDotHtml = entry.type ? `<span class="type-dot type-chip-${typeSlug(entry.type)}"></span>` : "";

  const collapsed = !openHistoryEntries.has(entry.id);

  return `
    <div class="history-entry ${collapsed ? "collapsed" : ""}" data-entry-id="${entry.id}">
      <div class="history-entry-header">
        <span class="history-entry-title"><span class="collapse-arrow">▾</span>${typeDotHtml}${headerLabel}</span>
        <span class="h-date">${entry.date}</span>
      </div>
      <div class="history-entry-body">
        ${exercisesHtml}
        ${runHtml}
        <div class="history-entry-controls">
          <select class="move-folder-select" data-entry-id="${entry.id}">${folderOptionsHtml}</select>
          <button class="ghost-btn small delete-entry-btn" data-entry-id="${entry.id}">Delete</button>
        </div>
      </div>
    </div>
  `;
}

function renderHistory() {
  const history = loadHistory();
  const folders = loadFolders();
  const byDateDesc = (a, b) => (b.date || "").localeCompare(a.date || "");

  const folderSectionsHtml = folders
    .map((f) => {
      const entries = history.filter((h) => h.folderId === f.id).sort(byDateDesc);
      return `
        <div class="folder-section">
          <div class="folder-header" data-folder-id="${f.id}">
            <span class="folder-name-view">
              <span class="folder-name">${escapeAttr(f.name)}</span> <span class="folder-count">(${entries.length})</span>
            </span>
            <input type="text" class="folder-name-edit hidden" value="${escapeAttr(f.name)}" data-folder-id="${f.id}" />
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

  const unsorted = history.filter((h) => !h.folderId).sort(byDateDesc);
  const unsortedHtml = `
    <div class="folder-section">
      <div class="folder-header"><span class="folder-name-view"><span class="folder-name">Unsorted</span></span></div>
      ${unsorted.length ? unsorted.map((e) => historyEntryHtml(e, folders)).join("") : `<div class="empty-state small">Nothing unsorted.</div>`}
    </div>
  `;

  if (history.length === 0 && folders.length === 0) {
    historyList.innerHTML = `<div class="empty-state">No sessions logged yet.</div>`;
    return;
  }

  historyList.innerHTML = folderSectionsHtml + unsortedHtml;

  historyList.querySelectorAll(".history-entry-header").forEach((header) => {
    header.addEventListener("click", () => {
      const entry = header.closest(".history-entry");
      const id = entry.dataset.entryId;
      const nowCollapsed = entry.classList.toggle("collapsed");
      if (nowCollapsed) openHistoryEntries.delete(id);
      else openHistoryEntries.add(id);
    });
  });

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
      const header = e.target.closest(".folder-header");
      header.querySelector(".folder-name-view").classList.add("hidden");
      const input = header.querySelector(".folder-name-edit");
      input.classList.remove("hidden");
      input.focus();
      input.select();
    });
  });

  historyList.querySelectorAll(".folder-name-edit").forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
      if (e.key === "Escape") {
        input.dataset.cancelled = "true";
        input.blur();
      }
    });
    input.addEventListener("blur", () => {
      if (input.dataset.cancelled === "true") {
        renderHistory();
        return;
      }
      const folderId = input.dataset.folderId;
      const newName = input.value.trim();
      const f = loadFolders();
      const folder = f.find((x) => x.id === folderId);
      if (folder && newName) {
        folder.name = newName;
        saveFolders(f);
      }
      renderHistory();
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
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cssEscape(str) {
  return str.replace(/(["\\])/g, "\\$1");
}

daySelect.addEventListener("change", () => {
  currentDay = daySelect.value;
  collapsedExerciseCards.clear();
  renderDay();
});

historyToggle.addEventListener("click", () => {
  renderHistory();
  historyPanel.classList.remove("hidden");
});

historyClose.addEventListener("click", () => {
  historyPanel.classList.add("hidden");
});

const newFolderForm = document.getElementById("new-folder-form");
const newFolderInput = document.getElementById("new-folder-input");

document.getElementById("new-folder-btn").addEventListener("click", () => {
  newFolderForm.classList.remove("hidden");
  newFolderInput.value = "";
  newFolderInput.focus();
});

document.getElementById("new-folder-cancel").addEventListener("click", () => {
  newFolderForm.classList.add("hidden");
});

function createFolderFromInput() {
  const name = newFolderInput.value.trim();
  if (!name) return;
  const folders = loadFolders();
  folders.push({ id: makeId(), name });
  saveFolders(folders);
  newFolderForm.classList.add("hidden");
  renderHistory();
}

document.getElementById("new-folder-confirm").addEventListener("click", createFolderFromInput);

newFolderInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") createFolderFromInput();
  if (e.key === "Escape") newFolderForm.classList.add("hidden");
});

populateDaySelect();
renderDay();
