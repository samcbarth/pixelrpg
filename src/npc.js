(function () {
  const root = (window.PixelRPG = window.PixelRPG || {});

  class NPC {
    constructor(definition) {
      Object.assign(this, definition);
      this.width = definition.width || 16;
      this.height = definition.height || 24;
      this.bobSeed = Math.random() * Math.PI * 2;
    }

    getBounds() {
      return {
        x: this.x,
        y: this.y + 5,
        width: this.width,
        height: this.height - 5
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
      ctx.fillRect(screenX + 2, screenY + 17, 12, 3);

      // Outline.
      ctx.fillStyle = "#1c2540";
      ctx.fillRect(screenX + 4, screenY + 2, 8, 2);
      ctx.fillRect(screenX + 3, screenY + 4, 10, 13);
      ctx.fillRect(screenX + 5, screenY + 17, 6, 3);

      // Hair.
      ctx.fillStyle = this.hair;
      ctx.fillRect(screenX + 5, screenY + 2, 6, 4);
      ctx.fillRect(screenX + 4, screenY + 4, 8, 2);
      ctx.fillStyle = "#8a5a40";
      ctx.fillRect(screenX + 6, screenY + 2, 3, 1);

      // Head.
      ctx.fillStyle = "#f4d2b1";
      ctx.fillRect(screenX + 5, screenY + 5, 6, 5);
      ctx.fillStyle = "#ffdca8";
      ctx.fillRect(screenX + 6, screenY + 5, 2, 1);

      // Eyes.
      ctx.fillStyle = "#24324d";
      ctx.fillRect(screenX + 6, screenY + 7, 1, 1);
      ctx.fillRect(screenX + 9, screenY + 7, 1, 1);

      // Body.
      ctx.fillStyle = this.clothing;
      ctx.fillRect(screenX + 4, screenY + 11, 8, 6);
      ctx.fillStyle = this.color;
      ctx.fillRect(screenX + 5, screenY + 12, 2, 2);
      ctx.fillRect(screenX + 8, screenY + 12, 2, 2);
      ctx.fillStyle = "#d3a064";
      ctx.fillRect(screenX + 6, screenY + 11, 4, 1);

      // Tiny name bar.
      ctx.fillStyle = "rgba(12, 19, 33, 0.9)";
      ctx.fillRect(screenX - 1, screenY - 8, 18, 5);
      ctx.fillStyle = "#eaf3ff";
      ctx.font = "6px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(this.name, screenX + 8, screenY - 4);
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
