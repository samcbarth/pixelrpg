(function () {
  const root = (window.PixelRPG = window.PixelRPG || {});

  class Camera {
    constructor(width, height, worldWidth, worldHeight) {
      this.width = width;
      this.height = height;
      this.worldWidth = worldWidth;
      this.worldHeight = worldHeight;
      this.x = 0;
      this.y = 0;
      this.smoothing = 0.12;
    }

    follow(target) {
      const desiredX = target.x + target.width / 2 - this.width / 2;
      const desiredY = target.y + target.height / 2 - this.height / 2;

      this.x += (desiredX - this.x) * this.smoothing;
      this.y += (desiredY - this.y) * this.smoothing;
      this.clamp();
    }

    clamp() {
      const maxX = Math.max(0, this.worldWidth - this.width);
      const maxY = Math.max(0, this.worldHeight - this.height);
      this.x = Math.max(0, Math.min(maxX, this.x));
      this.y = Math.max(0, Math.min(maxY, this.y));
    }
  }

  root.Camera = Camera;
})();
