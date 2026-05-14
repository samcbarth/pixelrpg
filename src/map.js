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
      const edge = Math.max(2, Math.floor(tileSize / 8));
      const inset = Math.max(3, Math.floor(tileSize / 6));

      if (tile === "g" || tile === "f") {
        const grassShade = (tx + ty) % 4;
        ctx.fillStyle = grassShade === 0 ? "#4b8a48" : grassShade === 1 ? "#529655" : grassShade === 2 ? "#3f7f42" : "#356f39";
        ctx.fillRect(x, y, tileSize, tileSize);

        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.fillRect(x, y, tileSize, edge);
        ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
        ctx.fillRect(x, y + tileSize - edge, tileSize, edge);

        ctx.fillStyle = "rgba(33, 76, 34, 0.22)";
        ctx.fillRect(x + inset, y + tileSize - inset - 2, 4, 1);
        ctx.fillRect(x + tileSize - inset - 6, y + inset, 5, 1);

        if (tile === "f") {
          ctx.fillStyle = "#8fd66b";
          ctx.fillRect(x + 11, y + 12, 4, 4);
          ctx.fillRect(x + 15, y + 10, 3, 8);
          ctx.fillRect(x + 9, y + 14, 2, 5);
          ctx.fillStyle = "#c4f09a";
          ctx.fillRect(x + 12, y + 11, 1, 6);
          ctx.fillRect(x + 16, y + 11, 1, 5);
        } else if ((tx * 11 + ty * 7) % 17 === 0) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
          ctx.fillRect(x + inset, y + inset, 4, 1);
          ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
          ctx.fillRect(x + tileSize - inset - 6, y + tileSize - inset - 4, 4, 1);
        }
        return;
      }

      if (tile === "p") {
        ctx.fillStyle = "#b9915d";
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.fillStyle = "rgba(255, 240, 200, 0.16)";
        ctx.fillRect(x + 4, y + 6, tileSize - 8, 4);
        ctx.fillStyle = "rgba(96, 68, 35, 0.15)";
        ctx.fillRect(x + 5, y + tileSize - 8, tileSize - 10, 3);
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fillRect(x + 7, y + 12, 6, 1);
        ctx.fillRect(x + 19, y + 14, 4, 1);
        ctx.fillStyle = "rgba(0, 0, 0, 0.09)";
        ctx.fillRect(x + 13, y + 17, 6, 1);
        ctx.fillRect(x + 23, y + 10, 3, 1);
        return;
      }

      if (tile === "w") {
        ctx.fillStyle = "#1f5a9e";
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.fillStyle = "#2f78cc";
        ctx.fillRect(x, y + 6 + (Math.floor(timeSeconds * 4 + tx + ty) % 5), tileSize, 6);
        ctx.fillStyle = "#6fb2ff";
        ctx.fillRect(x + 2, y + 9, tileSize - 4, 3);
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(x + 5, y + 7, 7, 1);
        ctx.fillRect(x + 18, y + 14, 8, 1);
        ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
        ctx.fillRect(x, y + tileSize - 5, tileSize, 3);
        ctx.fillStyle = "rgba(170, 224, 255, 0.14)";
        ctx.fillRect(x + 10, y + 4, 6, 1);
        return;
      }

      if (tile === "t") {
        ctx.fillStyle = "#214b23";
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.fillStyle = "#9a6232";
        ctx.fillRect(x + 13, y + 16, 6, 11);
        ctx.fillStyle = "#704121";
        ctx.fillRect(x + 14, y + 16, 3, 11);
        ctx.fillStyle = "#4c8b3e";
        ctx.fillRect(x + 6, y + 4, 20, 12);
        ctx.fillRect(x + 10, y + 2, 12, 6);
        ctx.fillRect(x + 3, y + 9, 8, 8);
        ctx.fillRect(x + 20, y + 8, 8, 8);
        ctx.fillStyle = "#6fc05f";
        ctx.fillRect(x + 8, y + 6, 5, 3);
        ctx.fillRect(x + 16, y + 5, 4, 3);
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(x + 12, y + 7, 2, 1);
        ctx.fillRect(x + 18, y + 9, 2, 1);
        ctx.fillStyle = "rgba(0,0,0,0.14)";
        ctx.fillRect(x + 6, y + 26, 20, 3);
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

        ctx.fillStyle = "#6b3f2b";
        ctx.fillRect(x, y, tileSize, tileSize);

        if (building) {
          const roofBand = localY === 0;
          const wallBand = localY > 0;

          if (roofBand) {
            ctx.fillStyle = "#5d2f25";
            ctx.fillRect(x, y + 3, tileSize, 8);
            ctx.fillStyle = "#7d4132";
            ctx.fillRect(x + 3, y, tileSize - 6, 6);
            ctx.fillStyle = "#a45d46";
            ctx.fillRect(x + 6, y + 1, tileSize - 12, 2);
            ctx.fillStyle = "#f4d0a7";
            ctx.fillRect(x + 9, y + 5, 4, 1);
          }

          if (wallBand) {
            ctx.fillStyle = "#c18b5f";
            ctx.fillRect(x + 1, y + 2, tileSize - 2, tileSize - 3);
            ctx.fillStyle = "#d8ad7b";
            ctx.fillRect(x + 4, y + 5, tileSize - 8, tileSize - 8);
            ctx.fillStyle = "#8d5c37";
            ctx.fillRect(x + 6, y + 13, tileSize - 12, 6);
            ctx.fillStyle = "#4c2f20";
            ctx.fillRect(x + 3, y + 18, tileSize - 6, 1);
          }

          if (localX === 2 && localY === 2) {
            ctx.fillStyle = "#20140f";
            ctx.fillRect(x + 10, y + 9, 10, 15);
            ctx.fillStyle = "#d8b07a";
            ctx.fillRect(x + 16, y + 18, 3, 3);
          } else if ((localX === 1 || localX === 3) && localY === 1) {
            ctx.fillStyle = "#d7f0ff";
            ctx.fillRect(x + 7, y + 8, 5, 5);
            ctx.fillRect(x + 20, y + 8, 5, 5);
            ctx.fillStyle = "#87b5da";
            ctx.fillRect(x + 8, y + 9, 3, 1);
            ctx.fillRect(x + 21, y + 9, 3, 1);
          } else if (localX === 2 && localY === 1) {
            ctx.fillStyle = "#5f341c";
            ctx.fillRect(x + 12, y + 10, 8, 10);
            ctx.fillStyle = "#87623f";
            ctx.fillRect(x + 13, y + 11, 6, 7);
          } else if (localX === 1 && localY === 2) {
            ctx.fillStyle = "#4d2d1f";
            ctx.fillRect(x + 5, y + 16, 7, 8);
          } else if (localX === 3 && localY === 2) {
            ctx.fillStyle = "#4d2d1f";
            ctx.fillRect(x + 20, y + 16, 7, 8);
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
