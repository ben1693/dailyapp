/* ============================================================
 *  LAUDS — Daily Prayer & Discipline tracker
 *  Vanilla JS, localStorage-backed, zero dependencies.
 * ============================================================ */
(function () {
  "use strict";

  const STORAGE_KEY = "lauds.v1";
  const TIME_BLOCKS = ["morning", "afternoon", "evening"];

  /* ---------- Date helpers (local time, YYYY-MM-DD keys) ---------- */
  function ymd(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  function parseYmd(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  }
  function daysBetween(a, b) {
    const ms = parseYmd(b) - parseYmd(a);
    return Math.round(ms / 86400000);
  }

  /* ---------- ID generator ---------- */
  function uid() {
    return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  /* ---------- State ---------- */
  let state = null;
  let currentDate = ymd(new Date()); // the day being viewed

  function defaultState() {
    const items = [];
    window.DEFAULT_PRAYERS.forEach((p) => {
      items.push({
        id: uid(),
        key: p.key,
        kind: "prayer",
        title: p.title,
        text: p.text || "",
        timeOfDay: p.timeOfDay,
        points: p.points,
        active: p.defaultActive,
        builtin: true,
      });
    });
    window.DEFAULT_TODOS.forEach((t) => {
      items.push({
        id: uid(),
        key: t.key,
        kind: "todo",
        title: t.title,
        text: "",
        timeOfDay: "todo",
        points: t.points,
        active: t.defaultActive,
        builtin: true,
      });
    });
    return {
      items,
      completions: {}, // { "YYYY-MM-DD": { itemId: true } }
      settings: { showCompleted: false },
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        state = defaultState();
        save();
        return;
      }
      state = JSON.parse(raw);
      // light migration / safety
      if (!state.items) state.items = [];
      if (!state.completions) state.completions = {};
      if (!state.settings) state.settings = { showCompleted: false };
    } catch (e) {
      console.error("Failed to load state, resetting.", e);
      state = defaultState();
      save();
    }
  }

  let saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error("Failed to save state", e);
        toast("Could not save — storage may be full.");
      }
    }, 120);
  }

  /* ---------- Completion helpers ---------- */
  function isDone(dateKey, itemId) {
    return !!(state.completions[dateKey] && state.completions[dateKey][itemId]);
  }
  function toggleDone(dateKey, itemId) {
    if (!state.completions[dateKey]) state.completions[dateKey] = {};
    if (state.completions[dateKey][itemId]) {
      delete state.completions[dateKey][itemId];
      if (Object.keys(state.completions[dateKey]).length === 0) delete state.completions[dateKey];
    } else {
      state.completions[dateKey][itemId] = true;
    }
    save();
  }

  function activeItems() {
    return state.items.filter((i) => i.active);
  }
  function itemById(id) {
    return state.items.find((i) => i.id === id);
  }

  // Points earned on a given day (only counts items that were active-or-have-completion)
  function pointsForDate(dateKey) {
    const comp = state.completions[dateKey];
    if (!comp) return 0;
    let total = 0;
    for (const id in comp) {
      const item = itemById(id);
      if (item) total += item.points;
    }
    return total;
  }

  // Max possible points for the currently-active items
  function maxPointsForDate(dateKey) {
    let total = 0;
    activeItems().forEach((i) => (total += i.points));
    // also include any completed-but-now-inactive items so the bar never exceeds 100% oddly
    const comp = state.completions[dateKey] || {};
    for (const id in comp) {
      const item = itemById(id);
      if (item && !item.active) total += item.points;
    }
    return total;
  }

  /* ============================================================
   *  RENDERING — Daily view
   * ============================================================ */
  const els = {};
  function cacheEls() {
    [
      "todayPoints", "sideStreak", "sideToday",
      "dateMain", "dateSub",
      "dayProgressFill", "dayProgressText",
      "showCompletedToggle",
      "statStreak", "statBest", "statTotal", "statDays", "stat30", "statAvg",
      "heatmap", "heatmapRange", "barChart", "habitBars",
      "manageList", "modal", "modalTitle", "modalText", "modalComplete", "modalClose",
      "toast",
    ].forEach((id) => (els[id] = document.getElementById(id)));
    TIME_BLOCKS.concat("todo").forEach((b) => {
      els["list-" + b] = document.getElementById("list-" + b);
      els["count-" + b] = document.getElementById("count-" + b);
    });
  }

  function renderDay() {
    // date strip
    const today = ymd(new Date());
    const dObj = parseYmd(currentDate);
    const weekday = dObj.toLocaleDateString(undefined, { weekday: "long" });
    const full = dObj.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
    els.dateMain.textContent = currentDate === today ? "Today" : weekday;
    els.dateSub.textContent = full;

    let modalOpenId = els.modal.dataset.itemId;

    const blocks = ["morning", "afternoon", "evening", "todo"];
    blocks.forEach((block) => {
      const list = els["list-" + block];
      list.innerHTML = "";
      const items = activeItems().filter((i) =>
        block === "todo" ? i.kind === "todo" : i.timeOfDay === block
      );
      let done = 0;
      items.forEach((item) => {
        const completed = isDone(currentDate, item.id);
        if (completed) done++;
        if (completed && !state.settings.showCompleted) return; // hide for the day
        list.appendChild(renderRow(item, completed));
      });

      // empty-state messaging
      const visibleCount = list.children.length;
      if (visibleCount === 0) {
        const li = document.createElement("li");
        li.className = "empty-row";
        if (items.length === 0) {
          li.textContent = block === "todo" ? "No tasks yet — add some in Manage." : "Nothing here yet.";
        } else {
          li.textContent = "All done. " + (block === "todo" ? "Well worked." : "Well prayed.");
          li.classList.add("empty-done");
        }
        list.appendChild(li);
      }
      els["count-" + block].textContent = items.length ? `${done}/${items.length}` : "";
    });

    // header + progress
    const pts = pointsForDate(currentDate);
    const maxPts = maxPointsForDate(currentDate);
    els.todayPoints.textContent = pts;
    els.dayProgressText.textContent = `${pts} / ${maxPts} pts`;
    const pct = maxPts > 0 ? Math.round((pts / maxPts) * 100) : 0;
    els.dayProgressFill.style.width = pct + "%";

    const streak = currentStreak();
    els.sideStreak.textContent = streak;
    els.sideToday.textContent = pointsForDate(ymd(new Date()));

    els.showCompletedToggle.checked = state.settings.showCompleted;

    // keep modal in sync if open
    if (modalOpenId && els.modal.hidden === false) {
      const it = itemById(modalOpenId);
      if (it) syncModalButton(it);
    }
  }

  function renderRow(item, completed) {
    const li = document.createElement("li");
    li.className = "prayer-row" + (completed ? " done" : "");
    li.dataset.id = item.id;

    const check = document.createElement("button");
    check.className = "check";
    check.setAttribute("aria-label", completed ? "Mark not done" : "Mark done");
    check.innerHTML = completed ? "&#10003;" : "";
    check.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleDone(currentDate, item.id);
      const gained = !completed;
      renderAll();
      if (gained) pulsePoints();
    });

    const main = document.createElement("div");
    main.className = "row-main";
    const title = document.createElement("span");
    title.className = "row-title";
    title.textContent = item.title;
    main.appendChild(title);
    if (item.kind === "prayer" && item.text) {
      const hint = document.createElement("span");
      hint.className = "row-hint";
      hint.textContent = "Tap to read";
      main.appendChild(hint);
    }

    const pts = document.createElement("span");
    pts.className = "row-pts";
    pts.textContent = "+" + item.points;

    li.appendChild(check);
    li.appendChild(main);
    li.appendChild(pts);

    // tapping the body opens the prayer text (prayers only)
    if (item.kind === "prayer" && item.text) {
      main.addEventListener("click", () => openModal(item));
      main.style.cursor = "pointer";
    }
    return li;
  }

  function pulsePoints() {
    els.todayPoints.classList.remove("pulse");
    void els.todayPoints.offsetWidth; // reflow
    els.todayPoints.classList.add("pulse");
  }

  /* ============================================================
   *  Streak & stats
   * ============================================================ */
  function dayHasActivity(dateKey) {
    return pointsForDate(dateKey) > 0;
  }

  function currentStreak() {
    // counts back from today; if today not done yet, streak still counts through yesterday
    let streak = 0;
    let cursor = new Date();
    // allow today to be "in progress": start from today if done, else yesterday
    if (!dayHasActivity(ymd(cursor))) {
      cursor = addDays(cursor, -1);
    }
    while (dayHasActivity(ymd(cursor))) {
      streak++;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  function bestStreak() {
    const days = Object.keys(state.completions).filter(dayHasActivity).sort();
    if (days.length === 0) return 0;
    let best = 1, run = 1;
    for (let i = 1; i < days.length; i++) {
      if (daysBetween(days[i - 1], days[i]) === 1) {
        run++;
      } else {
        run = 1;
      }
      if (run > best) best = run;
    }
    return best;
  }

  function renderStats() {
    const activeDays = Object.keys(state.completions).filter(dayHasActivity);
    let totalPts = 0;
    activeDays.forEach((d) => (totalPts += pointsForDate(d)));

    els.statStreak.textContent = currentStreak();
    els.statBest.textContent = bestStreak();
    els.statTotal.textContent = totalPts;
    els.statDays.textContent = activeDays.length;
    els.statAvg.textContent = activeDays.length ? Math.round(totalPts / activeDays.length) : 0;

    // 30-day completion rate (active days / 30)
    let activeIn30 = 0;
    for (let i = 0; i < 30; i++) {
      if (dayHasActivity(ymd(addDays(new Date(), -i)))) activeIn30++;
    }
    els.stat30.textContent = Math.round((activeIn30 / 30) * 100) + "%";

    renderHeatmap();
    renderBarChart();
    renderHabitBars();
  }

  // GitHub/Anki-style heatmap: ~26 weeks (half year) of squares
  function renderHeatmap() {
    const weeks = 26;
    const container = els.heatmap;
    container.innerHTML = "";

    const today = new Date();
    // start on the Sunday of the week, `weeks` weeks ago
    const start = addDays(today, -(weeks * 7 - 1));
    start.setDate(start.getDate() - start.getDay()); // back to Sunday

    // find a max for scaling color intensity
    let maxPts = 1;
    for (let i = 0; i <= daysBetween(ymd(start), ymd(today)); i++) {
      maxPts = Math.max(maxPts, pointsForDate(ymd(addDays(start, i))));
    }

    const grid = document.createElement("div");
    grid.className = "heat-grid";
    let monthLabels = "";
    let lastMonth = -1;

    const cursorEnd = ymd(today);
    let col = document.createElement("div");
    col.className = "heat-col";
    let cur = new Date(start);
    while (ymd(cur) <= cursorEnd) {
      if (cur.getDay() === 0 && col.children.length) {
        grid.appendChild(col);
        col = document.createElement("div");
        col.className = "heat-col";
      }
      const key = ymd(cur);
      const pts = pointsForDate(key);
      const cell = document.createElement("span");
      const level = pts === 0 ? 0 : Math.min(4, Math.ceil((pts / maxPts) * 4));
      cell.className = "heat-cell l" + level;
      cell.title = `${key} — ${pts} pts`;
      cell.dataset.key = key;
      if (key === cursorEnd) cell.classList.add("today");
      col.appendChild(cell);
      cur = addDays(cur, 1);
    }
    if (col.children.length) grid.appendChild(col);

    container.appendChild(grid);
    els.heatmapRange.textContent =
      parseYmd(ymd(start)).toLocaleDateString(undefined, { month: "short", year: "numeric" }) +
      " – " +
      today.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  }

  function renderBarChart() {
    const days = 30;
    const data = [];
    let max = 1;
    for (let i = days - 1; i >= 0; i--) {
      const key = ymd(addDays(new Date(), -i));
      const pts = pointsForDate(key);
      max = Math.max(max, pts);
      data.push({ key, pts });
    }
    const c = els.barChart;
    c.innerHTML = "";
    data.forEach((d) => {
      const wrap = document.createElement("div");
      wrap.className = "bar-col";
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.height = (d.pts / max) * 100 + "%";
      if (d.pts === 0) bar.classList.add("empty");
      bar.title = `${d.key} — ${d.pts} pts`;
      wrap.appendChild(bar);
      c.appendChild(wrap);
    });
  }

  function renderHabitBars() {
    const container = els.habitBars;
    container.innerHTML = "";
    const items = activeItems();
    if (items.length === 0) {
      container.innerHTML = '<p class="muted small">No active items to measure.</p>';
      return;
    }
    items.forEach((item) => {
      let hits = 0;
      for (let i = 0; i < 30; i++) {
        if (isDone(ymd(addDays(new Date(), -i)), item.id)) hits++;
      }
      const rate = Math.round((hits / 30) * 100);
      const row = document.createElement("div");
      row.className = "habit-row";
      row.innerHTML =
        `<span class="habit-name">${escapeHtml(item.title)}</span>` +
        `<span class="habit-track"><span class="habit-fill" style="width:${rate}%"></span></span>` +
        `<span class="habit-pct">${rate}%</span>`;
      container.appendChild(row);
    });
  }

  /* ============================================================
   *  Manage view
   * ============================================================ */
  function renderManage() {
    const container = els.manageList;
    container.innerHTML = "";
    const groups = [
      { key: "morning", label: "Morning" },
      { key: "afternoon", label: "Afternoon" },
      { key: "evening", label: "Evening" },
      { key: "todo", label: "Tasks" },
    ];
    groups.forEach((g) => {
      const items = state.items.filter((i) =>
        g.key === "todo" ? i.kind === "todo" : i.kind === "prayer" && i.timeOfDay === g.key
      );
      if (items.length === 0) return;
      const header = document.createElement("div");
      header.className = "manage-group";
      header.textContent = g.label;
      container.appendChild(header);

      items.forEach((item) => {
        const row = document.createElement("div");
        row.className = "manage-row" + (item.active ? "" : " inactive");

        const left = document.createElement("div");
        left.className = "manage-left";
        const name = document.createElement("span");
        name.className = "manage-title";
        name.textContent = item.title;
        const meta = document.createElement("span");
        meta.className = "manage-meta";
        meta.textContent = `${item.points} pt${item.points > 1 ? "s" : ""}` + (item.builtin ? "" : " · custom");
        left.appendChild(name);
        left.appendChild(meta);

        const right = document.createElement("div");
        right.className = "manage-right";

        // points editor
        const ptsInput = document.createElement("input");
        ptsInput.type = "number";
        ptsInput.min = "1";
        ptsInput.max = "100";
        ptsInput.value = item.points;
        ptsInput.className = "pts-input";
        ptsInput.title = "Points";
        ptsInput.addEventListener("change", () => {
          const v = Math.max(1, Math.min(100, parseInt(ptsInput.value, 10) || 1));
          item.points = v;
          ptsInput.value = v;
          save();
          renderAll();
        });

        // active toggle
        const toggle = document.createElement("label");
        toggle.className = "switch small";
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = item.active;
        cb.addEventListener("change", () => {
          item.active = cb.checked;
          save();
          renderAll();
        });
        const track = document.createElement("span");
        track.className = "switch-track";
        track.innerHTML = '<span class="switch-thumb"></span>';
        toggle.appendChild(cb);
        toggle.appendChild(track);

        right.appendChild(ptsInput);
        right.appendChild(toggle);

        // delete (custom only)
        if (!item.builtin) {
          const del = document.createElement("button");
          del.className = "icon-btn del";
          del.innerHTML = "&times;";
          del.title = "Delete";
          del.addEventListener("click", () => {
            if (confirm(`Delete "${item.title}"? Past history is kept.`)) {
              state.items = state.items.filter((x) => x.id !== item.id);
              save();
              renderAll();
            }
          });
          right.appendChild(del);
        }

        row.appendChild(left);
        row.appendChild(right);
        container.appendChild(row);
      });
    });
  }

  /* ============================================================
   *  Modal (prayer reading)
   * ============================================================ */
  function openModal(item) {
    els.modal.dataset.itemId = item.id;
    els.modalTitle.textContent = item.title;
    els.modalText.innerHTML = "";
    item.text.split(/\n{2,}/).forEach((para) => {
      const p = document.createElement("p");
      p.innerHTML = escapeHtml(para).replace(/\n/g, "<br/>");
      els.modalText.appendChild(p);
    });
    syncModalButton(item);
    els.modal.hidden = false;
    document.body.classList.add("modal-open");
  }
  function syncModalButton(item) {
    const done = isDone(currentDate, item.id);
    els.modalComplete.textContent = done ? "Prayed ✓ — Undo" : "Mark as Prayed";
    els.modalComplete.classList.toggle("done", done);
  }
  function closeModal() {
    els.modal.hidden = true;
    els.modal.dataset.itemId = "";
    document.body.classList.remove("modal-open");
  }

  /* ============================================================
   *  Misc UI
   * ============================================================ */
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  let toastTimer = null;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.hidden = false;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.classList.remove("show");
      setTimeout(() => (els.toast.hidden = true), 250);
    }, 2200);
  }

  function switchView(view) {
    document.querySelectorAll(".nav-item").forEach((t) => t.classList.toggle("active", t.dataset.view === view));
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.getElementById("view-" + view).classList.add("active");
    if (view === "stats") renderStats();
    if (view === "manage") renderManage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderAll() {
    renderDay();
    const statsVisible = document.getElementById("view-stats").classList.contains("active");
    const manageVisible = document.getElementById("view-manage").classList.contains("active");
    if (statsVisible) renderStats();
    if (manageVisible) renderManage();
  }

  /* ============================================================
   *  Data export / import / reset
   * ============================================================ */
  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lauds-backup-${ymd(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Backup downloaded.");
  }
  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed.items || !parsed.completions) throw new Error("bad file");
        state = parsed;
        if (!state.settings) state.settings = { showCompleted: false };
        save();
        renderAll();
        toast("Backup restored.");
      } catch (e) {
        toast("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  }
  function resetAll() {
    if (!confirm("Reset everything — prayers, tasks, and all history? This cannot be undone.")) return;
    state = defaultState();
    save();
    currentDate = ymd(new Date());
    renderAll();
    switchView("day");
    toast("Reset complete.");
  }

  /* ============================================================
   *  Event wiring
   * ============================================================ */
  function wire() {
    document.querySelectorAll(".nav-item").forEach((tab) => {
      tab.addEventListener("click", () => switchView(tab.dataset.view));
    });

    document.getElementById("prevDay").addEventListener("click", () => {
      currentDate = ymd(addDays(parseYmd(currentDate), -1));
      renderDay();
    });
    document.getElementById("nextDay").addEventListener("click", () => {
      const next = ymd(addDays(parseYmd(currentDate), 1));
      if (next <= ymd(new Date())) {
        currentDate = next;
        renderDay();
      }
    });
    document.getElementById("todayBtn").addEventListener("click", () => {
      currentDate = ymd(new Date());
      renderDay();
    });

    els.showCompletedToggle.addEventListener("change", () => {
      state.settings.showCompleted = els.showCompletedToggle.checked;
      save();
      renderDay();
    });

    // modal
    els.modalClose.addEventListener("click", closeModal);
    els.modal.addEventListener("click", (e) => {
      if (e.target === els.modal) closeModal();
    });
    els.modalComplete.addEventListener("click", () => {
      const id = els.modal.dataset.itemId;
      const wasDone = isDone(currentDate, id);
      toggleDone(currentDate, id);
      const it = itemById(id);
      if (it) syncModalButton(it);
      renderAll();
      if (!wasDone) {
        pulsePoints();
        closeModal();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !els.modal.hidden) closeModal();
    });

    // add form
    const addType = document.getElementById("addType");
    const addTextWrap = document.getElementById("addTextWrap");
    function syncTextVisibility() {
      addTextWrap.style.display = addType.value === "todo" ? "none" : "";
    }
    addType.addEventListener("change", syncTextVisibility);
    syncTextVisibility();

    document.getElementById("addForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const type = addType.value;
      const title = document.getElementById("addTitle").value.trim();
      const text = document.getElementById("addText").value.trim();
      const points = Math.max(1, Math.min(100, parseInt(document.getElementById("addPoints").value, 10) || 1));
      if (!title) return;
      const item = {
        id: uid(),
        key: null,
        kind: type === "todo" ? "todo" : "prayer",
        title,
        text: type === "todo" ? "" : text,
        timeOfDay: type === "todo" ? "todo" : type,
        points,
        active: true,
        builtin: false,
      };
      state.items.push(item);
      save();
      e.target.reset();
      document.getElementById("addPoints").value = 1;
      syncTextVisibility();
      renderAll();
      toast(`Added "${title}".`);
    });

    // data
    document.getElementById("exportBtn").addEventListener("click", exportData);
    document.getElementById("importBtn").addEventListener("click", () =>
      document.getElementById("importFile").click()
    );
    document.getElementById("importFile").addEventListener("change", (e) => {
      if (e.target.files[0]) importData(e.target.files[0]);
      e.target.value = "";
    });
    document.getElementById("resetBtn").addEventListener("click", resetAll);
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    cacheEls();
    load();
    wire();
    renderDay();
  });
})();
