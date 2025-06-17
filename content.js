(() => {
  if (window.__COMMAND_PALETTE_ACTIVE) return;
  window.__COMMAND_PALETTE_ACTIVE = true;

  let isPaletteOpen = false;
  let selectedIndex = 0;
  let filtered = [];
  let data = [];

  function injectHTML() {
    const html = document.createElement("div");
    html.innerHTML = `
      <div id="command-backdrop" style="display:none;">
        <div id="command-palette">
          <input id="command-input" autocomplete="off" placeholder="Cari mata kuliah atau event..." />
          <div id="command-list"></div>
        </div>
      </div>
    `;
    document.body.appendChild(html);
  }

  function getCourses() {
    const links = document.querySelectorAll("#inst75 ul.unlist a");
    return Array.from(links).map((link) => ({
      type: "course",
      title: `[Course] ${link.textContent.trim()}`,
      url: link.href,
      icon: "📚",
    }));
  }

  function getEvents() {
    const links = document.querySelectorAll(
      '#inst90 .event a[data-type="event"]'
    );
    return Array.from(links).map((link) => ({
      type: "event",
      title: `[Event] ${link.textContent.trim()}`,
      url: link.href,
      icon: "📦",
    }));
  }

  function resetCommandPalette() {
    const backdrop = document.getElementById("command-backdrop");
    const input = document.getElementById("command-input");
    const list = document.getElementById("command-list");

    isPaletteOpen = false;
    selectedIndex = 0;
    filtered = [];
    data = [];

    if (input) input.value = "";
    if (list) {
      list.innerHTML = "";
      list.scrollTop = 0;
    }
    if (backdrop) backdrop.style.display = "none";
  }

  function scrollToSelected() {
    const list = document.getElementById("command-list");
    const active = list?.querySelector(".command-item.active");
    if (active) active.scrollIntoView({ block: "nearest" });
  }

  function render() {
    const list = document.getElementById("command-list");
    list.innerHTML = "";
    if (filtered.length === 0) {
      list.innerHTML = `<div class="command-item"><span class="command-icon">🍔</span> Tidak ada hasil yang ditemukan</div>`;
      return;
    }

    filtered.forEach((item, i) => {
      const div = document.createElement("div");
      div.className = "command-item" + (i === selectedIndex ? " active" : "");
      div.innerHTML = `<span class="command-icon">${item.icon}</span>${item.title}`;
      div.onclick = () => {
        location.href = item.url;
        resetCommandPalette();
      };
      list.appendChild(div);
    });

    scrollToSelected();
  }

  function createCommandPalette() {
    const backdrop = document.getElementById("command-backdrop");
    const input = document.getElementById("command-input");

    data = [...getEvents(), ...getCourses()];
    filtered = [...data];
    selectedIndex = 0;
    isPaletteOpen = true;

    backdrop.style.display = "flex";
    input.focus();
    render();

    input.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      filtered = data.filter((d) => d.title.toLowerCase().includes(q));
      selectedIndex = 0;
      render();
    });
  }

  // 🎯 Listener hanya satu kali
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p") {
      e.preventDefault();
      if (!document.getElementById("command-backdrop")) injectHTML();
      createCommandPalette();
    }

    if (!isPaletteOpen) return;

    if (e.key === "Escape") {
      e.preventDefault();
      resetCommandPalette();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % filtered.length;
      render();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + filtered.length) % filtered.length;
      render();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selectedItem = filtered[selectedIndex];
      if (selectedItem?.url) {
        location.href = selectedItem.url;
        resetCommandPalette();
      }
    }
  });
})();
