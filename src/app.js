/* ============================================================
 *  LAUDS — Daily Prayer & Discipline tracker
 *  Vanilla JS, localStorage-backed, zero dependencies.
 * ============================================================ */
(function () {
  "use strict";

  const STORAGE_KEY = "lauds.v1";
  const TIME_BLOCKS = ["morning", "afternoon", "evening"];
  const ALL_BLOCKS = ["morning", "afternoon", "evening", "todo"];

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
    return Math.round((parseYmd(b) - parseYmd(a)) / 86400000);
  }
  function uid() {
    return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  /* ---------- State ---------- */
  let state = null;
  let currentDate = ymd(new Date());

  function defaultState() {
    const items = [];
    window.DEFAULT_PRAYERS.forEach((p) => {
      items.push({
        id: uid(), key: p.key, kind: "prayer", title: p.title, text: p.text || "",
        timeOfDay: p.timeOfDay, points: p.points, active: p.defaultActive, builtin: true,
      });
    });
    window.DEFAULT_TODOS.forEach((t) => {
      items.push({
        id: uid(), key: t.key, kind: "todo", title: t.title, text: "",
        timeOfDay: "todo", points: t.points, active: t.defaultActive, builtin: true,
      });
    });
    return { items, completions: {}, settings: { showCompleted: false, theme: "light" } };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) { state = defaultState(); save(); }
      else {
        state = JSON.parse(raw);
        if (!state.items) state.items = [];
        if (!state.completions) state.completions = {};
        if (!state.settings) state.settings = {};
        if (typeof state.settings.showCompleted !== "boolean") state.settings.showCompleted = false;
        if (!state.settings.theme) state.settings.theme = "light";
      }
    } catch (e) {
      console.error("Failed to load state, resetting.", e);
      state = defaultState(); save();
    }
    applyTheme();
  }

  let saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
      catch (e) { console.error(e); toast("Could not save — storage may be full."); }
    }, 120);
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.settings.theme === "dark" ? "dark" : "light");
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

  function activeItems() { return state.items.filter((i) => i.active); }
  function itemById(id) { return state.items.find((i) => i.id === id); }
  function blockOf(item) { return item.kind === "todo" ? "todo" : item.timeOfDay; }

  function pointsForDate(dateKey) {
    const comp = state.completions[dateKey];
    if (!comp) return 0;
    let total = 0;
    for (const id in comp) { const it = itemById(id); if (it) total += it.points; }
    return total;
  }
  function maxPointsForDate(dateKey) {
    let total = 0;
    activeItems().forEach((i) => (total += i.points));
    const comp = state.completions[dateKey] || {};
    for (const id in comp) { const it = itemById(id); if (it && !it.active) total += it.points; }
    return total;
  }

  /* ============================================================
   *  Element cache
   * ============================================================ */
  const els = {};
  function cacheEls() {
    [
      "todayPoints", "sideStreak", "sideToday",
      "dateMain", "dateSub", "dayProgressFill", "dayProgressText",
      "showCompletedToggle", "showCompletedToggle2", "themeToggle",
      "statStreak", "statBest", "statTotal", "statDays", "stat30", "statAvg",
      "heatmap", "heatmapRange", "barChart", "habitBars",
      "manageList", "modal", "modalTitle", "modalText", "modalComplete", "modalClose", "toast",
    ].forEach((id) => (els[id] = document.getElementById(id)));
    ALL_BLOCKS.forEach((b) => {
      els["list-" + b] = document.getElementById("list-" + b);
      els["count-" + b] = document.getElementById("count-" + b);
    });
  }

  /* ============================================================
   *  Daily view
   * ============================================================ */
  function renderDay() {
    const today = ymd(new Date());
    const dObj = parseYmd(currentDate);
    els.dateMain.textContent = currentDate === today ? "Today" : dObj.toLocaleDateString(undefined, { weekday: "long" });
    els.dateSub.textContent = dObj.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });

    const modalOpenId = els.modal.dataset.itemId;

    ALL_BLOCKS.forEach((block) => {
      const list = els["list-" + block];
      list.innerHTML = "";
      const items = activeItems().filter((i) => blockOf(i) === block);
      let done = 0;
      items.forEach((item) => {
        const completed = isDone(currentDate, item.id);
        if (completed) done++;
        if (completed && !state.settings.showCompleted) return;
        list.appendChild(renderRow(item, completed));
      });
      if (list.children.length === 0) {
        const li = document.createElement("li");
        li.className = "empty-row";
        if (items.length === 0) li.textContent = block === "todo" ? "No tasks yet — tap + to add one." : "Nothing here — tap + to add a prayer.";
        else { li.textContent = "All done. " + (block === "todo" ? "Well worked." : "Well prayed."); li.classList.add("empty-done"); }
        list.appendChild(li);
      }
      els["count-" + block].textContent = items.length ? `${done}/${items.length}` : "";
    });

    const pts = pointsForDate(currentDate);
    const maxPts = maxPointsForDate(currentDate);
    els.todayPoints.textContent = pts;
    els.dayProgressText.textContent = `${pts} / ${maxPts} pts`;
    els.dayProgressFill.style.width = (maxPts > 0 ? Math.round((pts / maxPts) * 100) : 0) + "%";

    els.sideStreak.textContent = currentStreak();
    els.sideToday.textContent = pointsForDate(today);

    els.showCompletedToggle.checked = state.settings.showCompleted;
    if (els.showCompletedToggle2) els.showCompletedToggle2.checked = state.settings.showCompleted;
    if (els.themeToggle) els.themeToggle.checked = state.settings.theme === "dark";

    if (modalOpenId && els.modal.hidden === false) {
      const it = itemById(modalOpenId);
      if (it) syncModalButton(it);
    }
  }

  function renderRow(item, completed) {
    const li = document.createElement("li");
    li.className = "prayer-row" + (completed ? " done" : "");
    li.dataset.id = item.id;
    li.draggable = true;

    const handle = document.createElement("span");
    handle.className = "drag-handle";
    handle.innerHTML = "&#8942;&#8942;";
    handle.title = "Drag to move";

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

    const remove = document.createElement("button");
    remove.className = "row-remove";
    remove.innerHTML = "&times;";
    remove.title = "Remove from list";
    remove.addEventListener("click", (e) => {
      e.stopPropagation();
      removeItem(item.id);
    });

    li.appendChild(handle);
    li.appendChild(check);
    li.appendChild(main);
    li.appendChild(pts);
    li.appendChild(remove);

    if (item.kind === "prayer" && item.text) {
      main.style.cursor = "pointer";
      main.addEventListener("click", () => openModal(item));
    }

    // drag source
    li.addEventListener("dragstart", (e) => {
      dragId = item.id;
      li.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/plain", item.id); } catch (_) {}
    });
    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
      clearDropIndicators();
      dragId = null;
    });
    return li;
  }

  function pulsePoints() {
    [els.todayPoints, els.sideToday].forEach((el) => {
      el.classList.remove("pulse"); void el.offsetWidth; el.classList.add("pulse");
    });
  }

  function removeItem(id) {
    const item = itemById(id);
    if (!item) return;
    item.active = false;
    save();
    renderAll();
    toast(`Removed "${item.title}" — restore in Settings → Library.`);
  }

  /* ---------- Drag & drop ---------- */
  let dragId = null;
  function compatible(item, block) {
    return item.kind === "todo" ? block === "todo" : block !== "todo";
  }
  function clearDropIndicators() {
    document.querySelectorAll(".drop-before").forEach((r) => r.classList.remove("drop-before"));
    document.querySelectorAll(".drop-active").forEach((l) => l.classList.remove("drop-active"));
  }
  function rowToInsertBefore(list, clientY) {
    const rows = [...list.querySelectorAll(".prayer-row:not(.dragging)")];
    for (const row of rows) {
      const box = row.getBoundingClientRect();
      if (clientY < box.top + box.height / 2) return row;
    }
    return null;
  }
  function moveItem(id, block, beforeId) {
    const arr = state.items;
    const fromIdx = arr.findIndex((i) => i.id === id);
    if (fromIdx === -1) return;
    const [it] = arr.splice(fromIdx, 1);
    if (it.kind === "prayer") it.timeOfDay = block;
    it.active = true;
    let insertIdx;
    if (beforeId) {
      insertIdx = arr.findIndex((i) => i.id === beforeId);
      if (insertIdx === -1) insertIdx = arr.length;
    } else {
      let last = -1;
      arr.forEach((x, idx) => { if (blockOf(x) === block) last = idx; });
      insertIdx = last + 1;
    }
    arr.splice(insertIdx, 0, it);
    save();
  }
  function wireDropTarget(list) {
    list.addEventListener("dragover", (e) => {
      if (!dragId) return;
      const item = itemById(dragId);
      const block = list.dataset.block;
      if (!item || !compatible(item, block)) { e.dataTransfer.dropEffect = "none"; return; }
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      clearDropIndicators();
      list.classList.add("drop-active");
      const before = rowToInsertBefore(list, e.clientY);
      if (before) before.classList.add("drop-before");
    });
    list.addEventListener("dragleave", (e) => {
      if (e.target === list) list.classList.remove("drop-active");
    });
    list.addEventListener("drop", (e) => {
      if (!dragId) return;
      const item = itemById(dragId);
      const block = list.dataset.block;
      if (!item || !compatible(item, block)) return;
      e.preventDefault();
      const before = rowToInsertBefore(list, e.clientY);
      moveItem(dragId, block, before ? before.dataset.id : null);
      clearDropIndicators();
      renderAll();
    });
  }

  /* ---------- Inline add ---------- */
  let openInlineBlock = null;
  function openInlineAdd(block) {
    if (openInlineBlock === block) { renderDay(); openInlineBlock = null; return; }
    renderDay();
    openInlineBlock = block;
    const list = els["list-" + block];
    const isPrayer = block !== "todo";

    const li = document.createElement("li");
    li.className = "add-inline";

    const title = document.createElement("input");
    title.type = "text";
    title.placeholder = isPrayer ? "Prayer name" : "Task name";
    title.maxLength = 80;

    let text;
    if (isPrayer) {
      text = document.createElement("textarea");
      text.rows = 2;
      text.placeholder = "Prayer text (optional)";
    }

    const rowWrap = document.createElement("div");
    rowWrap.className = "add-inline-row";
    const pts = document.createElement("input");
    pts.type = "number"; pts.min = "1"; pts.max = "100"; pts.value = "1"; pts.className = "ai-pts";
    pts.title = "Points";

    const actions = document.createElement("div");
    actions.className = "ai-actions";
    const saveBtn = document.createElement("button");
    saveBtn.className = "btn btn-accent btn-sm"; saveBtn.textContent = "Add";
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn btn-sm"; cancelBtn.textContent = "Cancel";
    actions.appendChild(cancelBtn); actions.appendChild(saveBtn);

    rowWrap.appendChild(pts);
    rowWrap.appendChild(actions);

    li.appendChild(title);
    if (text) li.appendChild(text);
    li.appendChild(rowWrap);
    list.insertBefore(li, list.firstChild);
    title.focus();

    function commit() {
      const t = title.value.trim();
      if (!t) { title.focus(); return; }
      const p = Math.max(1, Math.min(100, parseInt(pts.value, 10) || 1));
      state.items.push({
        id: uid(), key: null, kind: isPrayer ? "prayer" : "todo", title: t,
        text: text ? text.value.trim() : "", timeOfDay: block, points: p, active: true, builtin: false,
      });
      save();
      openInlineBlock = null;
      renderAll();
      toast(`Added "${t}".`);
    }
    function cancel() { openInlineBlock = null; renderDay(); }

    saveBtn.addEventListener("click", commit);
    cancelBtn.addEventListener("click", cancel);
    title.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } if (e.key === "Escape") cancel(); });
  }

  /* ============================================================
   *  Streak & stats
   * ============================================================ */
  function dayHasActivity(dateKey) { return pointsForDate(dateKey) > 0; }
  function currentStreak() {
    let streak = 0;
    let cursor = new Date();
    if (!dayHasActivity(ymd(cursor))) cursor = addDays(cursor, -1);
    while (dayHasActivity(ymd(cursor))) { streak++; cursor = addDays(cursor, -1); }
    return streak;
  }
  function bestStreak() {
    const days = Object.keys(state.completions).filter(dayHasActivity).sort();
    if (days.length === 0) return 0;
    let best = 1, run = 1;
    for (let i = 1; i < days.length; i++) {
      run = daysBetween(days[i - 1], days[i]) === 1 ? run + 1 : 1;
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
    let activeIn30 = 0;
    for (let i = 0; i < 30; i++) if (dayHasActivity(ymd(addDays(new Date(), -i)))) activeIn30++;
    els.stat30.textContent = Math.round((activeIn30 / 30) * 100) + "%";
    renderHeatmap();
    renderBarChart();
    renderHabitBars();
  }

  function renderHeatmap() {
    const weeks = 26;
    const container = els.heatmap;
    container.innerHTML = "";
    const today = new Date();
    const start = addDays(today, -(weeks * 7 - 1));
    start.setDate(start.getDate() - start.getDay());
    let maxPts = 1;
    for (let i = 0; i <= daysBetween(ymd(start), ymd(today)); i++) maxPts = Math.max(maxPts, pointsForDate(ymd(addDays(start, i))));
    const grid = document.createElement("div");
    grid.className = "heat-grid";
    const cursorEnd = ymd(today);
    let col = document.createElement("div");
    col.className = "heat-col";
    let cur = new Date(start);
    while (ymd(cur) <= cursorEnd) {
      if (cur.getDay() === 0 && col.children.length) { grid.appendChild(col); col = document.createElement("div"); col.className = "heat-col"; }
      const key = ymd(cur);
      const pts = pointsForDate(key);
      const cell = document.createElement("span");
      const level = pts === 0 ? 0 : Math.min(4, Math.ceil((pts / maxPts) * 4));
      cell.className = "heat-cell l" + level;
      cell.title = `${key} — ${pts} pts`;
      if (key === cursorEnd) cell.classList.add("today");
      col.appendChild(cell);
      cur = addDays(cur, 1);
    }
    if (col.children.length) grid.appendChild(col);
    container.appendChild(grid);
    els.heatmapRange.textContent =
      parseYmd(ymd(start)).toLocaleDateString(undefined, { month: "short", year: "numeric" }) + " – " +
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
    els.barChart.innerHTML = "";
    data.forEach((d) => {
      const wrap = document.createElement("div");
      wrap.className = "bar-col";
      const bar = document.createElement("div");
      bar.className = "bar" + (d.pts === 0 ? " empty" : "");
      bar.style.height = (d.pts / max) * 100 + "%";
      bar.title = `${d.key} — ${d.pts} pts`;
      wrap.appendChild(bar);
      els.barChart.appendChild(wrap);
    });
  }

  function renderHabitBars() {
    const container = els.habitBars;
    container.innerHTML = "";
    const items = activeItems();
    if (items.length === 0) { container.innerHTML = '<p class="muted small">No active items to measure.</p>'; return; }
    items.forEach((item) => {
      let hits = 0;
      for (let i = 0; i < 30; i++) if (isDone(ymd(addDays(new Date(), -i)), item.id)) hits++;
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
   *  Library (Settings)
   * ============================================================ */
  function renderManage() {
    const container = els.manageList;
    container.innerHTML = "";
    const groups = [
      { key: "morning", label: "Morning" }, { key: "afternoon", label: "Afternoon" },
      { key: "evening", label: "Evening" }, { key: "todo", label: "Tasks" },
    ];
    groups.forEach((g) => {
      const items = state.items.filter((i) => blockOf(i) === g.key);
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
        name.className = "manage-title"; name.textContent = item.title;
        const meta = document.createElement("span");
        meta.className = "manage-meta";
        meta.textContent = `${item.points} pt${item.points > 1 ? "s" : ""}` + (item.builtin ? "" : " · custom");
        left.appendChild(name); left.appendChild(meta);

        const right = document.createElement("div");
        right.className = "manage-right";

        const ptsInput = document.createElement("input");
        ptsInput.type = "number"; ptsInput.min = "1"; ptsInput.max = "100"; ptsInput.value = item.points;
        ptsInput.className = "pts-input"; ptsInput.title = "Points";
        ptsInput.addEventListener("change", () => {
          const v = Math.max(1, Math.min(100, parseInt(ptsInput.value, 10) || 1));
          item.points = v; ptsInput.value = v; save(); renderAll();
        });

        const toggle = document.createElement("label");
        toggle.className = "switch small";
        const cb = document.createElement("input");
        cb.type = "checkbox"; cb.checked = item.active;
        cb.addEventListener("change", () => { item.active = cb.checked; save(); renderAll(); });
        const track = document.createElement("span");
        track.className = "switch-track"; track.innerHTML = '<span class="switch-thumb"></span>';
        toggle.appendChild(cb); toggle.appendChild(track);

        right.appendChild(ptsInput); right.appendChild(toggle);

        if (!item.builtin) {
          const del = document.createElement("button");
          del.className = "icon-btn del"; del.innerHTML = "&times;"; del.title = "Delete permanently";
          del.addEventListener("click", () => {
            if (confirm(`Delete "${item.title}" permanently? Past history is kept.`)) {
              state.items = state.items.filter((x) => x.id !== item.id);
              save(); renderAll();
            }
          });
          right.appendChild(del);
        }

        row.appendChild(left); row.appendChild(right);
        container.appendChild(row);
      });
    });
  }

  /* ============================================================
   *  Modal
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
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  let toastTimer = null;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.hidden = false;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { els.toast.classList.remove("show"); setTimeout(() => (els.toast.hidden = true), 250); }, 2400);
  }

  function switchView(view) {
    openInlineBlock = null;
    document.querySelectorAll(".nav-item").forEach((t) => t.classList.toggle("active", t.dataset.view === view));
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.getElementById("view-" + view).classList.add("active");
    if (view === "stats") renderStats();
    if (view === "settings") renderManage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderAll() {
    renderDay();
    if (document.getElementById("view-stats").classList.contains("active")) renderStats();
    if (document.getElementById("view-settings").classList.contains("active")) renderManage();
  }

  /* ---------- Data ---------- */
  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `lauds-backup-${ymd(new Date())}.json`; a.click();
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
        if (!state.settings) state.settings = { showCompleted: false, theme: "light" };
        if (!state.settings.theme) state.settings.theme = "light";
        save(); applyTheme(); renderAll();
        toast("Backup restored.");
      } catch (e) { toast("Invalid backup file."); }
    };
    reader.readAsText(file);
  }
  function resetAll() {
    if (!confirm("Reset everything — prayers, tasks, and all history? This cannot be undone.")) return;
    state = defaultState(); save(); applyTheme();
    currentDate = ymd(new Date());
    renderAll(); switchView("day");
    toast("Reset complete.");
  }

  /* ============================================================
   *  Wiring
   * ============================================================ */
  function setShowCompleted(val) {
    state.settings.showCompleted = val;
    save();
    renderDay();
  }

  function wire() {
    document.querySelectorAll(".nav-item").forEach((tab) =>
      tab.addEventListener("click", () => switchView(tab.dataset.view)));

    document.getElementById("prevDay").addEventListener("click", () => { currentDate = ymd(addDays(parseYmd(currentDate), -1)); renderDay(); });
    document.getElementById("nextDay").addEventListener("click", () => {
      const next = ymd(addDays(parseYmd(currentDate), 1));
      if (next <= ymd(new Date())) { currentDate = next; renderDay(); }
    });
    document.getElementById("todayBtn").addEventListener("click", () => { currentDate = ymd(new Date()); renderDay(); });

    els.showCompletedToggle.addEventListener("change", () => setShowCompleted(els.showCompletedToggle.checked));
    if (els.showCompletedToggle2) els.showCompletedToggle2.addEventListener("change", () => setShowCompleted(els.showCompletedToggle2.checked));
    if (els.themeToggle) els.themeToggle.addEventListener("change", () => {
      state.settings.theme = els.themeToggle.checked ? "dark" : "light";
      save(); applyTheme();
    });

    // inline add buttons + drop targets
    document.querySelectorAll(".add-mini").forEach((btn) =>
      btn.addEventListener("click", () => openInlineAdd(btn.dataset.add)));
    ALL_BLOCKS.forEach((b) => wireDropTarget(els["list-" + b]));

    // modal
    els.modalClose.addEventListener("click", closeModal);
    els.modal.addEventListener("click", (e) => { if (e.target === els.modal) closeModal(); });
    els.modalComplete.addEventListener("click", () => {
      const id = els.modal.dataset.itemId;
      const wasDone = isDone(currentDate, id);
      toggleDone(currentDate, id);
      const it = itemById(id);
      if (it) syncModalButton(it);
      renderAll();
      if (!wasDone) { pulsePoints(); closeModal(); }
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !els.modal.hidden) closeModal(); });

    // settings add form
    const addType = document.getElementById("addType");
    const addTextWrap = document.getElementById("addTextWrap");
    function syncTextVisibility() { addTextWrap.style.display = addType.value === "todo" ? "none" : ""; }
    addType.addEventListener("change", syncTextVisibility);
    syncTextVisibility();

    document.getElementById("addForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const type = addType.value;
      const title = document.getElementById("addTitle").value.trim();
      const text = document.getElementById("addText").value.trim();
      const points = Math.max(1, Math.min(100, parseInt(document.getElementById("addPoints").value, 10) || 1));
      if (!title) return;
      state.items.push({
        id: uid(), key: null, kind: type === "todo" ? "todo" : "prayer", title,
        text: type === "todo" ? "" : text, timeOfDay: type === "todo" ? "todo" : type,
        points, active: true, builtin: false,
      });
      save();
      e.target.reset();
      document.getElementById("addPoints").value = 1;
      syncTextVisibility();
      renderAll();
      toast(`Added "${title}".`);
    });

    document.getElementById("exportBtn").addEventListener("click", exportData);
    document.getElementById("importBtn").addEventListener("click", () => document.getElementById("importFile").click());
    document.getElementById("importFile").addEventListener("change", (e) => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ""; });
    document.getElementById("resetBtn").addEventListener("click", resetAll);
  }

  document.addEventListener("DOMContentLoaded", () => {
    cacheEls();
    load();
    wire();
    renderDay();
  });
})();
