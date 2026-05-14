(function () {
  const root = (window.PixelRPG = window.PixelRPG || {});

  class Player {
    constructor(startX, startY, name) {
      this.x = startX;
      this.y = startY;
      this.width = 12;
      this.height = 16;
      this.name = name;
      this.speed = 84;
      this.facing = "down";
      this.moving = false;
      this.walkTime = 0;
    }

    getBounds() {
      return {
        x: this.x + 2,
        y: this.y + 4,
        width: this.width - 4,
        height: this.height - 2
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
      const legOffset = Math.round(step * 1.3);
      const sway = this.moving ? Math.sin(this.walkTime * 1.1) * 0.6 : 0;

      // Shadow.
      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      ctx.fillRect(screenX + 1, screenY + 15, 10, 3);

      // Head.
      ctx.fillStyle = "#f4d2b1";
      ctx.fillRect(screenX + 3, screenY + 2, 6, 5);

      // Hair cap.
      ctx.fillStyle = "#56392a";
      ctx.fillRect(screenX + 2, screenY + 1, 8, 3);
      ctx.fillRect(screenX + 2, screenY + 3, 2, 2);
      ctx.fillRect(screenX + 8, screenY + 3, 2, 2);

      // Eyes.
      ctx.fillStyle = "#24324d";
      ctx.fillRect(screenX + 4, screenY + 4, 1, 1);
      ctx.fillRect(screenX + 7, screenY + 4, 1, 1);

      // Torso.
      ctx.fillStyle = "#5c86ff";
      ctx.fillRect(screenX + 2, screenY + 7, 8, 5);

      // Arms.
      ctx.fillStyle = "#f4d2b1";
      ctx.fillRect(screenX + 1 + sway, screenY + 8, 1, 4);
      ctx.fillRect(screenX + 10 - sway, screenY + 8, 1, 4);

      // Legs.
      ctx.fillStyle = "#2b3f65";
      ctx.fillRect(screenX + 3, screenY + 12 + legOffset, 2, 3);
      ctx.fillRect(screenX + 7, screenY + 12 - legOffset, 2, 3);

      // Tiny backpack pixel.
      ctx.fillStyle = "#7fd7ff";
      ctx.fillRect(screenX + 9, screenY + 8, 1, 2);
    }
  }

  root.Player = Player;
})();
