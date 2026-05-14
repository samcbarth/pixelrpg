(function () {
  const root = (window.PixelRPG = window.PixelRPG || {});

  class Player {
    constructor(startX, startY, name) {
      this.x = startX;
      this.y = startY;
      this.width = 24;
      this.height = 32;
      this.name = name;
      this.speed = 84;
      this.facing = "down";
      this.moving = false;
      this.walkTime = 0;
    }

    getBounds() {
      return {
        x: this.x + 4,
        y: this.y + 6,
        width: this.width - 8,
        height: this.height - 6
      };
    }

    getCenter() {
      return {
        x: this.x + this.width / 2,
        y: this.y + this.height / 2
      };
    }

    update(dt, input, world, blockers) {
      let moveX = 0;
      let moveY = 0;

      if (input.isDown("ArrowLeft", "KeyA")) moveX -= 1;
      if (input.isDown("ArrowRight", "KeyD")) moveX += 1;
      if (input.isDown("ArrowUp", "KeyW")) moveY -= 1;
      if (input.isDown("ArrowDown", "KeyS")) moveY += 1;

      if (moveX !== 0 || moveY !== 0) {
        const length = Math.hypot(moveX, moveY) || 1;
        moveX /= length;
        moveY /= length;
      }

      this.moving = moveX !== 0 || moveY !== 0;
      if (this.moving) {
        this.walkTime += dt * 10;
      }

      if (moveX < 0) this.facing = "left";
      if (moveX > 0) this.facing = "right";
      if (moveY < 0) this.facing = "up";
      if (moveY > 0) this.facing = "down";

      const distance = this.speed * dt;
      const dx = moveX * distance;
      const dy = moveY * distance;

      root.Collision.resolveAxis(this, "x", dx, world, blockers);
      root.Collision.resolveAxis(this, "y", dy, world, blockers);
    }

    draw(ctx, camera, timeSeconds) {
      const screenX = Math.round(this.x - camera.x);
      const screenY = Math.round(this.y - camera.y);
      const step = this.moving ? Math.sin(this.walkTime * 1.6) : Math.sin(timeSeconds * 2) * 0.2;
      const legOffset = Math.round(step * 3);
      const sway = this.moving ? Math.sin(this.walkTime * 1.1) : 0;

      // Shadow.
      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      ctx.fillRect(screenX + 3, screenY + 26, 18, 4);

      // Outline.
      ctx.fillStyle = "#1c2540";
      ctx.fillRect(screenX + 6, screenY + 4, 12, 3);
      ctx.fillRect(screenX + 4, screenY + 7, 16, 17);
      ctx.fillRect(screenX + 6, screenY + 24, 12, 4);

      // Hair.
      ctx.fillStyle = "#57392a";
      ctx.fillRect(screenX + 6, screenY + 4, 10, 5);
      ctx.fillRect(screenX + 5, screenY + 6, 12, 2);
      ctx.fillStyle = "#7a523d";
      ctx.fillRect(screenX + 7, screenY + 4, 5, 2);
      ctx.fillStyle = "#3a241b";
      ctx.fillRect(screenX + 14, screenY + 5, 1, 1);

      // Face.
      ctx.fillStyle = "#f1ceb0";
      ctx.fillRect(screenX + 7, screenY + 8, 8, 7);
      ctx.fillStyle = "#ffdca8";
      ctx.fillRect(screenX + 8, screenY + 8, 3, 1);
      ctx.fillStyle = "#e7a98e";
      ctx.fillRect(screenX + 12, screenY + 13, 2, 1);

      // Eyes.
      ctx.fillStyle = "#22314c";
      ctx.fillRect(screenX + 9, screenY + 11, 1, 1);
      ctx.fillRect(screenX + 13, screenY + 11, 1, 1);

      // Neck and shirt.
      ctx.fillStyle = "#d97f6d";
      ctx.fillRect(screenX + 11, screenY + 15, 2, 1);
      ctx.fillStyle = "#4f7cff";
      ctx.fillRect(screenX + 6, screenY + 16, 12, 8);
      ctx.fillStyle = "#6fa3ff";
      ctx.fillRect(screenX + 7, screenY + 17, 4, 3);
      ctx.fillRect(screenX + 12, screenY + 17, 3, 2);

      // Arms.
      ctx.fillStyle = "#f1ceb0";
      ctx.fillRect(screenX + 3 + sway, screenY + 16, 3, 8);
      ctx.fillRect(screenX + 18 - sway, screenY + 16, 3, 8);
      ctx.fillStyle = "#d7b08e";
      ctx.fillRect(screenX + 4 + sway, screenY + 18, 1, 2);
      ctx.fillRect(screenX + 18 - sway, screenY + 18, 1, 2);

      // Pants and boots.
      ctx.fillStyle = "#253756";
      ctx.fillRect(screenX + 7, screenY + 24 + legOffset, 4, 4);
      ctx.fillRect(screenX + 13, screenY + 24 - legOffset, 4, 4);
      ctx.fillStyle = "#18243d";
      ctx.fillRect(screenX + 6, screenY + 28 + legOffset, 5, 2);
      ctx.fillRect(screenX + 13, screenY + 28 - legOffset, 5, 2);

      // Tiny backpack pixel.
      ctx.fillStyle = "#7fd7ff";
      ctx.fillRect(screenX + 18, screenY + 17, 3, 4);
    }
  }

  root.Player = Player;
})();
