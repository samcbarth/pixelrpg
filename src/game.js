(function () {
  const root = (window.PixelRPG = window.PixelRPG || {});
  const DATA = root.DATA;

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.ctx.imageSmoothingEnabled = false;

      this.input = new root.InputManager();
      this.map = new root.WorldMap(DATA);
      this.camera = new root.Camera(
        DATA.canvasWidth,
        DATA.canvasHeight,
        DATA.worldWidth,
        DATA.worldHeight
      );
      this.player = new root.Player(
        DATA.playerStart.x,
        DATA.playerStart.y,
        DATA.playerName
      );
      this.inventory = new root.Inventory();
      this.dialogue = new root.DialogueBox();
      this.quest = new root.QuestState(DATA.quest);
      this.npcs = DATA.npcs.map((definition) => new root.NPC(definition));
      this.items = DATA.items.map((definition) => ({ ...definition, collected: false }));
      this.day = 3;
      this.gold = 2958;

      this.menuOpen = false;
      this.time = 0;
      this.lastTimestamp = 0;
      this.toastText = "";
      this.toastTimer = 0;

      this.dom = {
        prompt: document.getElementById("prompt"),
        toast: document.getElementById("toast"),
        dialogueBox: document.getElementById("dialogueBox"),
        pauseMenu: document.getElementById("pauseMenu"),
        resumeButton: document.getElementById("resumeButton"),
        menuPlayerName: document.getElementById("menuPlayerName"),
        inventoryList: document.getElementById("inventoryList"),
        questSummary: document.getElementById("questSummary"),
        questDetails: document.getElementById("questDetails")
      };

      this.dom.resumeButton.addEventListener("click", () => {
        this.setMenuOpen(false);
      });
    }

    start() {
      this.camera.follow(this.player);
      this.render(0);
      requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    loop(timestamp) {
      const dt = Math.min((timestamp - this.lastTimestamp) / 1000 || 0, 0.033);
      this.lastTimestamp = timestamp;
      this.update(dt);
      this.render(timestamp / 1000);
      requestAnimationFrame((nextTimestamp) => this.loop(nextTimestamp));
    }

    update(dt) {
      this.time += dt;

      if (this.toastTimer > 0) {
        this.toastTimer -= dt;
        if (this.toastTimer <= 0) {
          this.toastText = "";
        }
      }

      if (this.input.consumePressed("Escape")) {
        if (this.dialogue.visible) {
          this.dialogue.close();
        } else {
          this.setMenuOpen(!this.menuOpen);
        }
      }

      if (this.menuOpen) {
        return;
      }

      if (this.dialogue.visible) {
        if (this.input.consumePressed("KeyE", "Enter", "Space")) {
          this.dialogue.advance();
        }
        this.camera.follow(this.player);
        return;
      }

      if (this.input.consumePressed("KeyE", "Enter", "Space")) {
        this.handleInteract();
      }

      const blockers = this.npcs.map((npc) => npc.getBounds());
      this.player.update(dt, this.input, this.map, blockers);
      this.camera.follow(this.player);
      this.checkQuestItemPickup();
    }

    handleInteract() {
      const npc = this.findNearbyNpc();
      if (npc) {
        const dialogue = npc.getDialogue(this);
        this.dialogue.open(npc.name, dialogue.lines, dialogue.onComplete);
        return;
      }

      const item = this.findNearbyItem();
      if (item && !item.collected && this.quest.stage === "accepted") {
        item.collected = true;
        this.inventory.add(item.name);
        this.quest.markCollected();
        this.showToast(`Picked up ${item.name}`);
        this.dialogue.open(
          "Inventory",
          [
            `You picked up ${item.name}.`,
            "Return to Mira to finish the quest."
          ]
        );
      }
    }

    checkQuestItemPickup() {
      // The quest item is intentionally interactable with E rather than auto-collected.
      // This keeps the starter RPG easier to understand and makes the pickup feel deliberate.
    }

    findNearbyNpc() {
      const playerCenter = this.player.getCenter();
      return this.npcs.find((npc) => {
        const center = npc.getCenter();
        const distance = Math.hypot(center.x - playerCenter.x, center.y - playerCenter.y);
        return distance < 18;
      });
    }

    findNearbyItem() {
      const playerCenter = this.player.getCenter();
      return this.items.find((item) => {
        if (item.collected) {
          return false;
        }
        const center = {
          x: item.x + item.width / 2,
          y: item.y + item.height / 2
        };
        const distance = Math.hypot(center.x - playerCenter.x, center.y - playerCenter.y);
        return distance < 18;
      });
    }

    setMenuOpen(nextState) {
      this.menuOpen = nextState;
      if (this.menuOpen) {
        this.dialogue.close();
      }
    }

    showToast(text, duration = 2.1) {
      this.toastText = text;
      this.toastTimer = duration;
    }

    getPromptText() {
      if (this.menuOpen || this.dialogue.visible) {
        return "";
      }

      const npc = this.findNearbyNpc();
      if (npc) {
        return `E Talk to ${npc.name}`;
      }

      const item = this.findNearbyItem();
      if (item && this.quest.stage === "accepted") {
        return `E Pick up ${item.name}`;
      }

      return "";
    }

    drawItem(ctx, item) {
      if (item.collected) {
        return;
      }

      const x = Math.round(item.x - this.camera.x);
      const y = Math.round(item.y - this.camera.y);
      const sparkle = Math.floor(this.time * 5) % 2;

      ctx.fillStyle = "#6fe08a";
      ctx.fillRect(x + 2, y + 4, 4, 3);
      ctx.fillStyle = "#3ca553";
      ctx.fillRect(x + 5, y + 3, 2, 5);
      ctx.fillStyle = "#9ff2b2";
      ctx.fillRect(x + 3, y + 2, 1, 6);
      ctx.fillRect(x + 7, y + 4, 1, 3);
      if (sparkle === 0) {
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.fillRect(x + 1, y + 1, 1, 1);
        ctx.fillRect(x + 8, y + 2, 1, 1);
      }
    }

    render(timeSeconds) {
      const ctx = this.ctx;

      ctx.clearRect(0, 0, DATA.canvasWidth, DATA.canvasHeight);
      ctx.fillStyle = "#7cb6ff";
      ctx.fillRect(0, 0, DATA.canvasWidth, DATA.canvasHeight);
      ctx.fillStyle = "#a7dcff";
      ctx.fillRect(0, 0, DATA.canvasWidth, 34);

      this.map.draw(ctx, this.camera, timeSeconds);

      this.items.forEach((item) => this.drawItem(ctx, item));

      const sortedNpcs = this.npcs
        .slice()
        .sort((a, b) => a.y - b.y);
      sortedNpcs.forEach((npc) => npc.draw(ctx, this.camera, timeSeconds));

      this.player.draw(ctx, this.camera, timeSeconds);
      this.drawHUD(ctx);
      this.syncDom();
    }

    drawHUD(ctx) {
      ctx.save();
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      const questText = this.quest.summary;
      const statusText = this.menuOpen ? "Paused" : this.dialogue.visible ? "Talking" : "Exploring";
      const timeValue = this.getClockText();
      const panelX = DATA.canvasWidth - 190;
      const panelY = 10;

      // Top-right status panel.
      this.drawPanel(ctx, panelX, panelY, 180, 86);

      ctx.fillStyle = "#fff8e6";
      ctx.beginPath();
      ctx.arc(panelX + 20, panelY + 24, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#7a4b23";
      ctx.beginPath();
      ctx.arc(panelX + 20, panelY + 24, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffe7a3";
      ctx.fillRect(panelX + 19, panelY + 16, 2, 4);
      ctx.fillRect(panelX + 24, panelY + 23, 4, 2);

      ctx.fillStyle = "#4b2b19";
      ctx.font = "bold 15px serif";
      ctx.fillText(`Day ${this.day}`, panelX + 42, panelY + 22);
      ctx.font = "12px serif";
      ctx.fillText(timeValue, panelX + 42, panelY + 39);
      ctx.fillText(`${this.gold}g`, panelX + 42, panelY + 56);

      ctx.fillStyle = "#7a4b23";
      ctx.fillRect(panelX + 13, panelY + 59, 154, 1);
      ctx.fillStyle = "#5c3419";
      ctx.font = "11px serif";
      ctx.fillText(statusText, panelX + 13, panelY + 75);

      // Quest banner under the panel.
      if (this.quest.stage !== "inactive") {
        this.drawPanel(ctx, panelX - 16, panelY + 92, 196, 36);
        ctx.fillStyle = "#5f341c";
        ctx.font = "11px serif";
        const questLines = this.wrapText(ctx, `Quest: ${questText}`, 168);
        questLines.slice(0, 2).forEach((line, index) => {
          ctx.fillText(line, panelX - 4, panelY + 112 + index * 12);
        });
      }

      // Bottom hotbar.
      const slotCount = 8;
      const slotSize = 30;
      const gap = 4;
      const hotbarWidth = slotCount * slotSize + (slotCount - 1) * gap + 12;
      const hotbarX = Math.round((DATA.canvasWidth - hotbarWidth) / 2);
      const hotbarY = DATA.canvasHeight - 44;
      this.drawPanel(ctx, hotbarX, hotbarY, hotbarWidth, 34);

      const inventoryEntries = this.inventory.entries();
      for (let i = 0; i < slotCount; i += 1) {
        const slotX = hotbarX + 6 + i * (slotSize + gap);
        const slotY = hotbarY + 5;
        const hasItem = inventoryEntries[i];
        ctx.fillStyle = i === 0 ? "#f6e4b8" : "#d2b47a";
        ctx.fillRect(slotX, slotY, slotSize, slotSize);
        ctx.fillStyle = "#7a4b23";
        ctx.fillRect(slotX + 1, slotY + 1, slotSize - 2, slotSize - 2);
        ctx.fillStyle = i === 0 ? "#fff1cf" : "#e4c98d";
        ctx.fillRect(slotX + 3, slotY + 3, slotSize - 6, slotSize - 6);
        if (hasItem) {
          const [name, amount] = hasItem;
          ctx.fillStyle = "#2e1a10";
          ctx.font = "10px serif";
          ctx.fillText(String(amount), slotX + 10, slotY + 18);
          if (name === this.quest.itemName) {
            ctx.fillStyle = "#5ac66a";
            ctx.fillRect(slotX + 11, slotY + 9, 8, 8);
          }
        }
      }

      ctx.fillStyle = "#5f341c";
      ctx.font = "11px serif";
      ctx.fillText("WASD / Arrows", hotbarX + hotbarWidth + 10, hotbarY + 14);
      ctx.fillText("E talk", hotbarX + hotbarWidth + 10, hotbarY + 26);
      ctx.fillText("Esc menu", hotbarX + hotbarWidth + 10, hotbarY + 38);
      ctx.restore();
    }

    drawPanel(ctx, x, y, w, h) {
      ctx.fillStyle = "#6a4a25";
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "#c39a5f";
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
      ctx.fillStyle = "#f2ddb4";
      ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
      ctx.fillStyle = "rgba(255,255,255,0.32)";
      ctx.fillRect(x + 5, y + 5, w - 10, 2);
      ctx.fillStyle = "rgba(93, 56, 25, 0.18)";
      ctx.fillRect(x + 5, y + h - 7, w - 10, 2);
    }

    getClockText() {
      const totalMinutes = Math.floor(this.time * 10);
      const hours = 6 + Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const suffix = hours >= 12 ? "pm" : "am";
      const displayHour = ((hours - 1) % 12) + 1;
      return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
    }

    wrapText(ctx, text, maxWidth) {
      const words = text.split(" ");
      const lines = [];
      let current = "";

      words.forEach((word) => {
        const testLine = current ? `${current} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && current) {
          lines.push(current);
          current = word;
        } else {
          current = testLine;
        }
      });

      if (current) {
        lines.push(current);
      }

      return lines;
    }

    syncDom() {
      const promptText = this.getPromptText();
      this.dom.prompt.textContent = promptText;
      this.dom.prompt.classList.toggle("hidden", !promptText);

      this.dom.toast.textContent = this.toastText;
      this.dom.toast.classList.toggle("hidden", !this.toastText);

      this.dom.dialogueBox.classList.toggle("hidden", !this.dialogue.visible);
      if (this.dialogue.visible) {
        this.dom.dialogueBox.innerHTML = `
          <div class="dialogue-speaker">${this.escapeHtml(this.dialogue.speaker)}</div>
          <p class="dialogue-line">${this.escapeHtml(this.dialogue.currentLine)}</p>
          <p class="dialogue-hint">Press E to continue</p>
        `;
      } else {
        this.dom.dialogueBox.innerHTML = "";
      }

      this.dom.pauseMenu.classList.toggle("hidden", !this.menuOpen);
      this.dom.pauseMenu.setAttribute("aria-hidden", String(!this.menuOpen));

      this.dom.menuPlayerName.textContent = this.player.name;
      this.dom.questSummary.textContent = this.quest.summary;
      this.dom.questDetails.textContent = this.quest.details;

      const entries = this.inventory.entries();
      if (entries.length === 0) {
        this.dom.inventoryList.innerHTML = "<li>No items yet.</li>";
      } else {
        this.dom.inventoryList.innerHTML = entries
          .map(([name, amount]) => `<li>${this.escapeHtml(name)} x${amount}</li>`)
          .join("");
      }
    }

    escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }
  }

  root.Game = Game;
})();
