// Chargé avant l'exercice : le solo reste inchangé hors d'une séance intégrée.
(() => {
  const embedded = window.parent !== window && new URLSearchParams(location.search).get("group") === "1";
  if (!embedded) { window.procycleanActivityStorage = localStorage; return; }
  const memory = new Map();
  window.procycleanActivityStorage = {
    getItem: key => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: key => memory.delete(key)
  };
  document.documentElement.classList.add("group-exercise");
  let adapter, initialized = false, records = {}, lastReport = "", timer;
  const send = (type, payload = {}) => parent.postMessage({ channel: "procyclean-group", type, ...payload }, location.origin);
  const text = html => {
    const node = document.createElement("div");
    node.innerHTML = html || "";
    return node.textContent.replace(/\s+/g, " ").trim();
  };
  function flush() {
    if (!initialized || !adapter) return;
    const data = adapter.snapshot();
    const report = { progress: Math.max(0, Math.min(100, data.progress || 0)), complete: !!data.complete,
      records: Object.values(records), snapshot: JSON.stringify({ state: data.state, records }) };
    const serialized = JSON.stringify(report);
    if (serialized === lastReport) return;
    lastReport = serialized;
    send("report", { report });
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(flush, 120); }
  window.ProcycleanGroup = {
    text,
    record(id, prompt, answer, expected = "", explanation = "", correct = null) {
      records[id] = { id, prompt: text(prompt), answer: String(answer ?? ""),
        expected: text(expected), explanation: text(explanation), correct };
      schedule();
    },
    // Formulations lisibles des choix validés, y compris les exercices à plusieurs champs.
    formAnswers(root) {
      return [...root.querySelectorAll("input:checked, select, textarea")].map(input => {
        if (input.tagName === "SELECT") return input.selectedOptions[0]?.textContent || "";
        if (input.tagName === "TEXTAREA") return input.value;
        return input.closest("label")?.textContent.trim() || input.value;
      }).filter(Boolean).join(" · ");
    },
    register(value) { adapter = value; send("ready"); }
  };
  addEventListener("message", event => {
    if (event.source !== parent || event.origin !== location.origin || event.data?.channel !== "procyclean-group") return;
    if (event.data.type === "init" && adapter && !initialized) {
      try {
        const saved = event.data.snapshot ? JSON.parse(event.data.snapshot) : null;
        if (saved) { records = saved.records || {}; adapter.restore(saved.state); }
        initialized = true;
        new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "disabled", "class"] });
        ["click", "change", "input", "submit", "pointerup"].forEach(type => document.addEventListener(type, schedule));
        send("initialized");
        schedule();
      } catch (error) { send("error", { message: "La progression n’a pas pu être restaurée." }); console.error(error); }
    }
  });
  document.addEventListener("click", event => {
    const link = event.target.closest("a");
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && /\/activites\/(individuel\/)?index\.html$/.test(url.pathname)) {
      event.preventDefault(); event.stopImmediatePropagation(); send("leave");
    }
  }, true);
  addEventListener("pagehide", flush);
})();
