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
      const questText = this.quest.summary;
      const statusText = this.menuOpen ? "Paused" : this.dialogue.visible ? "Talking" : "Exploring";

      ctx.fillStyle = "rgba(10, 17, 31, 0.72)";
      ctx.fillRect(8, 8, 118, 30);

      ctx.fillStyle = "#eef5ff";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText(this.player.name, 14, 20);
      ctx.font = "8px sans-serif";
      ctx.fillStyle = "#d2e0ff";
      ctx.fillText(statusText, 14, 31);

      if (this.quest.stage !== "inactive") {
        ctx.fillStyle = "rgba(10, 17, 31, 0.72)";
        ctx.fillRect(8, 42, 140, 18);
        ctx.fillStyle = "#7fd7ff";
        ctx.font = "7px sans-serif";
        ctx.fillText(`Quest: ${questText}`, 14, 54);
      }
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
