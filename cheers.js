(() => {
  "use strict";

  const launcher = document.getElementById("rpc-cheer-launcher");
  const dialog = document.getElementById("rpc-cheer-dialog");
  if (!launcher || !dialog) return;

  const closeButton = dialog.querySelector(".rpc-cheer-close");
  const optionButtons = dialog.querySelectorAll("[data-cheer]");
  const status = document.getElementById("rpc-cheer-status");
  const countsLabel = document.getElementById("rpc-cheer-counts");
  const equivalent = document.getElementById("rpc-cheer-equivalent");
  const meterFill = document.getElementById("rpc-cheer-meter-fill");
  const effects = dialog.querySelector(".rpc-cheer-effects");

  const counts = { love: 0, strength: 0 };
  const moraleMinutesPerCheer = 7;
  let lastSentAt = 0;

  const messages = {
    love: [
      "Love received. The internet feels 12% kinder.",
      "Heart successfully added to the build.",
      "Delivered with excellent timing.",
    ],
    strength: [
      "Strength delivered. One more hard thing looks doable.",
      "Extra voltage received. Grit reserves topped up.",
      "Power-up delivered. The next problem should be worried.",
    ],
  };

  const track = (eventName, parameters = {}) => {
    if (typeof window.rpcTrack === "function") {
      window.rpcTrack(eventName, parameters);
    }
  };

  const updateReceipt = (type) => {
    const total = counts.love + counts.strength;
    const choices = messages[type];
    status.textContent = choices[(counts[type] - 1) % choices.length];
    countsLabel.textContent = `This visit: ${counts.love} love · ${counts.strength} strength`;
    equivalent.textContent = `In highly unscientific units, you have powered ${
      total * moraleMinutesPerCheer
    } minutes of brave debugging.`;
    meterFill.style.width = `${Math.min(100, total * 12.5)}%`;
  };

  const createBurst = (type, sourceButton) => {
    const symbols = type === "love" ? ["♥", "♡", "♥"] : ["⚡", "✦", "⚡"];
    const panelRect = dialog.querySelector(".rpc-cheer-panel").getBoundingClientRect();
    const buttonRect = sourceButton.getBoundingClientRect();
    const startX = buttonRect.left + buttonRect.width / 2 - panelRect.left;
    const startY = buttonRect.top + buttonRect.height / 2 - panelRect.top;

    Array.from({ length: 9 }).forEach((_, index) => {
      const particle = document.createElement("span");
      const angle = (Math.PI * 2 * index) / 9 - Math.PI / 2;
      const distance = 58 + (index % 3) * 14;
      particle.className = `rpc-cheer-particle rpc-cheer-particle-${type}`;
      particle.textContent = symbols[index % symbols.length];
      particle.style.setProperty("--rpc-particle-x", `${startX}px`);
      particle.style.setProperty("--rpc-particle-y", `${startY}px`);
      particle.style.setProperty("--rpc-particle-dx", `${Math.cos(angle) * distance}px`);
      particle.style.setProperty("--rpc-particle-dy", `${Math.sin(angle) * distance}px`);
      particle.style.setProperty("--rpc-particle-delay", `${index * 18}ms`);
      effects.appendChild(particle);
      particle.addEventListener("animationend", () => particle.remove(), { once: true });
    });
  };

  const openDialog = () => {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    track("cheer_panel_open");
  };

  const closeDialog = () => {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    launcher.focus();
  };

  launcher.addEventListener("click", openDialog);
  closeButton.addEventListener("click", closeDialog);

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    closeDialog();
  });

  dialog.addEventListener("close", () => launcher.focus());

  optionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const now = Date.now();
      if (now - lastSentAt < 350) return;
      lastSentAt = now;

      const type = button.dataset.cheer;
      if (!(type in counts)) return;

      counts[type] += 1;
      updateReceipt(type);
      createBurst(type, button);
      track(type === "love" ? "send_love" : "send_strength", {
        cheer_type: type,
        cheers_this_visit: counts.love + counts.strength,
      });

      button.classList.add("is-sent");
      window.setTimeout(() => button.classList.remove("is-sent"), 420);
    });
  });
})();
