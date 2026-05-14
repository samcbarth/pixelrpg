(function () {
  const root = (window.PixelRPG = window.PixelRPG || {});
  const DATA = root.DATA;

  class WorldMap {
    constructor(definition) {
      this.tileSize = definition.tileSize;
      this.width = definition.mapWidth;
      this.height = definition.mapHeight;
      this.tiles = definition.mapTiles;
      this.buildings = definition.buildings || [];
    }

    getTile(tx, ty) {
      if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) {
        return "t";
      }
      return this.tiles[ty][tx];
    }

    isSolidTile(tx, ty) {
      const tile = this.getTile(tx, ty);
      return tile === "t" || tile === "w" || tile === "b";
    }

    draw(ctx, camera, timeSeconds) {
      const tileSize = this.tileSize;
      const startX = Math.max(0, Math.floor(camera.x / tileSize) - 1);
      const endX = Math.min(this.width - 1, Math.ceil((camera.x + camera.width) / tileSize) + 1);
      const startY = Math.max(0, Math.floor(camera.y / tileSize) - 1);
      const endY = Math.min(this.height - 1, Math.ceil((camera.y + camera.height) / tileSize) + 1);

      for (let ty = startY; ty <= endY; ty += 1) {
        for (let tx = startX; tx <= endX; tx += 1) {
          const tile = this.tiles[ty][tx];
          const screenX = Math.round(tx * tileSize - camera.x);
          const screenY = Math.round(ty * tileSize - camera.y);

          this.drawTile(ctx, tile, tx, ty, screenX, screenY, timeSeconds);
        }
      }
    }

    drawTile(ctx, tile, tx, ty, x, y, timeSeconds) {
      const tileSize = this.tileSize;

      if (tile === "g" || tile === "f") {
        const grassShade = (tx + ty) % 3;
        ctx.fillStyle = grassShade === 0 ? "#3d7d43" : grassShade === 1 ? "#4a8d4d" : "#356f3b";
        ctx.fillRect(x, y, tileSize, tileSize);

        if (tile === "f") {
          ctx.fillStyle = "#89cf63";
          ctx.fillRect(x + 6, y + 7, 2, 2);
          ctx.fillRect(x + 8, y + 5, 1, 4);
        } else if ((tx * 11 + ty * 7) % 17 === 0) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
          ctx.fillRect(x + 3, y + 4, 2, 1);
        }
        return;
      }

      if (tile === "p") {
        ctx.fillStyle = "#a88453";
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.fillStyle = "rgba(255, 240, 200, 0.16)";
        ctx.fillRect(x + 2, y + 2, tileSize - 4, 2);
        ctx.fillStyle = "rgba(96, 68, 35, 0.16)";
        ctx.fillRect(x + 4, y + 11, tileSize - 8, 1);
        return;
      }

      if (tile === "w") {
        ctx.fillStyle = "#2c74c9";
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.fillStyle = "#4f98ef";
        ctx.fillRect(x, y + 2 + (Math.floor(timeSeconds * 4 + tx + ty) % 3), tileSize, 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.fillRect(x + 3, y + 8, 6, 1);
        return;
      }

      if (tile === "t") {
        ctx.fillStyle = "#2e5c2a";
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.fillStyle = "#8e5d33";
        ctx.fillRect(x + 7, y + 9, 2, 6);
        ctx.fillStyle = "#4b8d3d";
        ctx.fillRect(x + 2, y + 2, 12, 8);
        ctx.fillRect(x + 4, y + 0, 8, 5);
        ctx.fillRect(x + 1, y + 4, 4, 4);
        ctx.fillRect(x + 11, y + 4, 4, 4);
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(x + 4, y + 3, 2, 1);
        return;
      }

      if (tile === "b") {
        const building = this.buildings.find(
          (entry) =>
            tx >= entry.x &&
            tx < entry.x + entry.w &&
            ty >= entry.y &&
            ty < entry.y + entry.h
        );

        const localX = building ? tx - building.x : 0;
        const localY = building ? ty - building.y : 0;

        ctx.fillStyle = "#7e4f36";
        ctx.fillRect(x, y, tileSize, tileSize);

        if (building) {
          if (localY === 0) {
            ctx.fillStyle = "#8e5b43";
            ctx.fillRect(x, y + 3, tileSize, 10);
            ctx.fillStyle = "#4b2b1d";
            ctx.fillRect(x + 1, y + 2, tileSize - 2, 3);
          } else {
            ctx.fillStyle = "#a76d4d";
            ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
          }

          if (localX === 2 && localY === 2) {
            ctx.fillStyle = "#2b1b14";
            ctx.fillRect(x + 5, y + 4, 6, 8);
            ctx.fillStyle = "#d2b48c";
            ctx.fillRect(x + 9, y + 8, 1, 1);
          } else if ((localX === 1 || localX === 3) && localY === 1) {
            ctx.fillStyle = "#d7f0ff";
            ctx.fillRect(x + 3, y + 4, 3, 3);
            ctx.fillRect(x + 10, y + 4, 3, 3);
          }

          if (localY === 0) {
            ctx.fillStyle = "#c96f4d";
            ctx.fillRect(x + 1, y, tileSize - 2, 2);
          }
        }
        return;
      }

      ctx.fillStyle = "#3d7d43";
      ctx.fillRect(x, y, tileSize, tileSize);
    }
  }

  root.WorldMap = WorldMap;
})();
