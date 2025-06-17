if (window.__COMMAND_PALETTE_ACTIVE) return;
window.__COMMAND_PALETTE_ACTIVE = true;

function injectHTML() {
  const html = document.createElement("div");
  html.innerHTML = `<div id="command-backdrop" style="display:none;">
    <div id="command-palette">
      <input id="command-input" placeholder="Cari mata kuliah atau event..." />
      <div id="command-list"></div>
    </div>
  </div>`;
  document.body.appendChild(html);
}

function getCourses() {
  const links = document.querySelectorAll("#inst75 ul.unlist a");
  return Array.from(links).map((link) => ({
    type: "course",
    title: link.textContent.trim(),
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
    title: link.textContent.trim(),
    url: link.href,
    icon: "🍔",
  }));
}

function createCommandPalette() {
  const backdrop = document.getElementById("command-backdrop");
  const input = document.getElementById("command-input");
  const list = document.getElementById("command-list");

  backdrop.style.display = "block";
  const data = [...getCourses(), ...getEvents()];
  let filtered = data;
  let selectedIndex = 0;

  function scrollToSelected() {
    const active = list.querySelector(".command-item.active");
    if (active) active.scrollIntoView({ block: "nearest" });
  }

  function render() {
    list.innerHTML = "";
    filtered.forEach((item, i) => {
      const div = document.createElement("div");
      div.className = "command-item" + (i === selectedIndex ? " active" : "");
      div.innerHTML = `<span class="command-icon">${item.icon}</span>${item.title}`;
      div.onclick = () => {
        location.href = item.url;
        backdrop.style.display = "none";
      };
      list.appendChild(div);
    });
    scrollToSelected();
  }

  input.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    filtered = data.filter((d) => d.title.toLowerCase().includes(q));
    selectedIndex = 0;
    render();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % filtered.length;
      render();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + filtered.length) % filtered.length;
      render();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        location.href = filtered[selectedIndex].url;
        backdrop.style.display = "none";
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      backdrop.style.display = "none";
    }
  });

  input.focus();
  render();
}

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p") {
    e.preventDefault();
    if (!document.getElementById("command-backdrop")) injectHTML();
    createCommandPalette();
  }
});
