(function () {
  const root = (window.PixelRPG = window.PixelRPG || {});

  class NPC {
    constructor(definition) {
      Object.assign(this, definition);
      this.width = definition.width || 24;
      this.height = definition.height || 32;
      this.bobSeed = Math.random() * Math.PI * 2;
    }

    getBounds() {
      return {
        x: this.x,
        y: this.y + 6,
        width: this.width,
        height: this.height - 6
      };
    }

    getCenter() {
      return {
        x: this.x + this.width / 2,
        y: this.y + this.height / 2
      };
    }

    draw(ctx, camera, timeSeconds) {
      const screenX = Math.round(this.x - camera.x);
      const screenY = Math.round(this.y - camera.y + Math.sin(timeSeconds * 4 + this.bobSeed) * 1.4);

      // Shadow.
      ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
      ctx.fillRect(screenX + 3, screenY + 26, 18, 4);

      // Outline.
      ctx.fillStyle = "#1c2540";
      ctx.fillRect(screenX + 6, screenY + 4, 12, 3);
      ctx.fillRect(screenX + 4, screenY + 7, 16, 17);
      ctx.fillRect(screenX + 6, screenY + 24, 12, 4);

      // Hair.
      ctx.fillStyle = this.hair;
      ctx.fillRect(screenX + 6, screenY + 4, 10, 5);
      ctx.fillRect(screenX + 5, screenY + 6, 12, 2);
      ctx.fillStyle = "#8a5a40";
      ctx.fillRect(screenX + 7, screenY + 4, 5, 2);

      // Head.
      ctx.fillStyle = "#f4d2b1";
      ctx.fillRect(screenX + 7, screenY + 8, 8, 7);
      ctx.fillStyle = "#ffdca8";
      ctx.fillRect(screenX + 8, screenY + 8, 3, 1);

      // Eyes.
      ctx.fillStyle = "#24324d";
      ctx.fillRect(screenX + 9, screenY + 11, 1, 1);
      ctx.fillRect(screenX + 13, screenY + 11, 1, 1);

      // Body.
      ctx.fillStyle = this.clothing;
      ctx.fillRect(screenX + 6, screenY + 16, 12, 8);
      ctx.fillStyle = this.color;
      ctx.fillRect(screenX + 8, screenY + 18, 2, 2);
      ctx.fillRect(screenX + 12, screenY + 18, 2, 2);
      ctx.fillStyle = "#d3a064";
      ctx.fillRect(screenX + 10, screenY + 16, 4, 1);

      // Tiny name bar.
      ctx.fillStyle = "rgba(12, 19, 33, 0.9)";
      ctx.fillRect(screenX - 1, screenY - 10, 26, 6);
      ctx.fillStyle = "#eaf3ff";
      ctx.font = "8px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(this.name, screenX + 12, screenY - 5);
    }

    getDialogue(game) {
      if (this.role === "quest_giver") {
        if (game.quest.stage === "inactive") {
          return {
            lines: [
              "Oh good, someone else is awake.",
              "The river herb is missing from the meadow.",
              "Could you bring one back for my tea?"
            ],
            onComplete: () => {
              game.quest.accept();
              game.showToast(`Quest started: ${game.quest.title}`);
            }
          };
        }

        if (game.quest.stage === "accepted") {
          return {
            lines: [
              "The herb grows near the water on the east side of the map.",
              "Look for a glowing plant in the river clearing."
            ],
            onComplete: null
          };
        }

        if (game.quest.stage === "collected") {
          return {
            lines: [
              "You found it!",
              "This is exactly what I needed for the village tea."
            ],
            onComplete: () => {
              if (game.inventory.has(game.quest.itemName)) {
                game.inventory.remove(game.quest.itemName);
              }
              game.quest.complete();
              game.showToast("Quest complete!");
            }
          };
        }

        return {
          lines: [
            "Thanks again for helping with the herb.",
            "The village feels calmer already."
          ],
          onComplete: null
        };
      }

      return {
        lines: this.lines && this.lines.length ? this.lines : ["Hello there."],
        onComplete: null
      };
    }
  }

  root.NPC = NPC;
})();
