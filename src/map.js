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
      return tile === "t" || tile === "w" || tile === "b" || tile === "r" || tile === "l" || tile === "u";
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
      const edge = Math.max(1, Math.floor(tileSize / 8));
      const inset = Math.max(2, Math.floor(tileSize / 5));
      const half = Math.floor(tileSize / 2);

      const drawSpeck = (px, py, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x + px, y + py, 1, 1);
      };

      if (tile === "g" || tile === "f") {
        const grassShade = (tx + ty) % 5;
        ctx.fillStyle = grassShade === 0 ? "#4e8d45" : grassShade === 1 ? "#5a9b4e" : grassShade === 2 ? "#467f3d" : grassShade === 3 ? "#3c6f35" : "#4b843f";
        ctx.fillRect(x, y, tileSize, tileSize);

        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.fillRect(x, y, tileSize, 1);
        ctx.fillStyle = "rgba(0,0,0,0.07)";
        ctx.fillRect(x, y + tileSize - edge, tileSize, edge);
        drawSpeck(3, 4, "rgba(255,255,255,0.08)");
        drawSpeck(11, 9, "rgba(255,255,255,0.06)");
        drawSpeck(6, 12, "rgba(16, 62, 21, 0.22)");
        drawSpeck(13, 5, "rgba(16, 62, 21, 0.2)");
        drawSpeck(9, 2, "rgba(255, 239, 150, 0.16)");

        if (tile === "f") {
          ctx.fillStyle = "#9fe06f";
          ctx.fillRect(x + 6, y + 7, 3, 5);
          ctx.fillRect(x + 10, y + 5, 2, 8);
          ctx.fillRect(x + 12, y + 9, 2, 3);
          ctx.fillStyle = "#f6f19a";
          ctx.fillRect(x + 7, y + 6, 1, 1);
          ctx.fillRect(x + 11, y + 4, 1, 1);
          ctx.fillRect(x + 13, y + 8, 1, 1);
          ctx.fillStyle = "#ff9f66";
          ctx.fillRect(x + 8, y + 9, 1, 1);
          ctx.fillRect(x + 12, y + 10, 1, 1);
        } else if ((tx * 11 + ty * 7) % 17 === 0) {
          ctx.fillStyle = "rgba(255,255,255,0.1)";
          ctx.fillRect(x + 2, y + 3, 3, 1);
          ctx.fillRect(x + 9, y + 10, 2, 1);
          ctx.fillStyle = "rgba(0,0,0,0.08)";
          ctx.fillRect(x + 12, y + 12, 3, 1);
        }
        return;
      }

      if (tile === "p") {
        ctx.fillStyle = "#b28149";
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.fillStyle = "rgba(255, 236, 190, 0.18)";
        ctx.fillRect(x + 2, y + 4, tileSize - 4, 3);
        ctx.fillStyle = "rgba(118, 80, 42, 0.16)";
        ctx.fillRect(x + 1, y + 11, tileSize - 2, 2);
        ctx.fillRect(x + 4, y + 13, tileSize - 8, 1);
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(x + 6, y + 8, 3, 1);
        ctx.fillRect(x + 12, y + 6, 4, 1);
        ctx.fillStyle = "rgba(71, 45, 18, 0.18)";
        ctx.fillRect(x + 7, y + 10, 2, 1);
        ctx.fillRect(x + 14, y + 14, 2, 1);
        return;
      }

      if (tile === "w") {
        ctx.fillStyle = "#2465ab";
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.fillStyle = "#49a7e8";
        ctx.fillRect(x, y + 5 + (Math.floor(timeSeconds * 5 + tx + ty) % 4), tileSize, 4);
        ctx.fillStyle = "#77cff2";
        ctx.fillRect(x + 1, y + 8, tileSize - 2, 2);
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.fillRect(x + 3, y + 4, 4, 1);
        ctx.fillRect(x + 10, y + 7, 5, 1);
        ctx.fillRect(x + 4, y + 12, 3, 1);
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.fillRect(x, y + tileSize - 3, tileSize, 2);
        ctx.fillStyle = "rgba(190, 242, 255, 0.16)";
        ctx.fillRect(x + 8, y + 2, 4, 1);
        return;
      }

      if (tile === "s") {
        ctx.fillStyle = "#d7be83";
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.fillStyle = "#e8d39f";
        ctx.fillRect(x + 1, y + 1, tileSize - 2, 2);
        ctx.fillStyle = "#b9995d";
        ctx.fillRect(x, y + tileSize - 3, tileSize, 2);
        ctx.fillStyle = "#9a7a43";
        ctx.fillRect(x + 6, y + 8, 1, 1);
        ctx.fillRect(x + 11, y + 11, 1, 1);
        ctx.fillRect(x + 13, y + 5, 1, 1);
        return;
      }

      if (tile === "t") {
        ctx.fillStyle = "#21531f";
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.fillStyle = "#8a542c";
        ctx.fillRect(x + 7, y + 10, 3, 6);
        ctx.fillRect(x + 8, y + 11, 2, 8);
        ctx.fillStyle = "#4e8d3d";
        ctx.fillRect(x + 4, y + 2, 8, 5);
        ctx.fillRect(x + 1, y + 5, 6, 5);
        ctx.fillRect(x + 10, y + 5, 5, 5);
        ctx.fillRect(x + 5, y + 7, 7, 4);
        ctx.fillStyle = "#68b95a";
        ctx.fillRect(x + 5, y + 3, 3, 2);
        ctx.fillRect(x + 10, y + 4, 2, 2);
        ctx.fillStyle = "#2f5e24";
        ctx.fillRect(x + 3, y + 1, 1, 1);
        ctx.fillRect(x + 12, y + 3, 1, 1);
        ctx.fillRect(x + 2, y + 8, 1, 1);
        ctx.fillRect(x + 13, y + 8, 1, 1);
        ctx.fillStyle = "rgba(0,0,0,0.14)";
        ctx.fillRect(x + 4, y + 13, 8, 2);
        return;
      }

      if (tile === "r") {
        ctx.fillStyle = "#6b6f7c";
        ctx.fillRect(x + 3, y + 6, 9, 6);
        ctx.fillRect(x + 5, y + 4, 5, 4);
        ctx.fillStyle = "#adb4c1";
        ctx.fillRect(x + 5, y + 5, 2, 1);
        ctx.fillRect(x + 8, y + 7, 1, 1);
        ctx.fillStyle = "#434a56";
        ctx.fillRect(x + 4, y + 10, 6, 1);
        return;
      }

      if (tile === "l") {
        ctx.fillStyle = "#8a5a32";
        ctx.fillRect(x + 2, y + 7, 12, 4);
        ctx.fillRect(x + 3, y + 6, 10, 2);
        ctx.fillStyle = "#5d381d";
        ctx.fillRect(x + 3, y + 8, 10, 1);
        ctx.fillRect(x + 6, y + 5, 1, 6);
        ctx.fillRect(x + 9, y + 5, 1, 6);
        return;
      }

      if (tile === "u") {
        ctx.fillStyle = "#76481f";
        ctx.fillRect(x + 4, y + 7, 8, 5);
        ctx.fillRect(x + 5, y + 6, 6, 3);
        ctx.fillStyle = "#4d2d16";
        ctx.fillRect(x + 5, y + 8, 6, 1);
        ctx.fillRect(x + 7, y + 5, 2, 6);
        return;
      }

      if (tile === "m") {
        ctx.fillStyle = "#5a8d33";
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.fillStyle = "#6dad47";
        ctx.fillRect(x + 3, y + 9, 1, 5);
        ctx.fillRect(x + 6, y + 7, 1, 7);
        ctx.fillRect(x + 10, y + 8, 1, 6);
        ctx.fillRect(x + 13, y + 10, 1, 4);
        ctx.fillStyle = "#9ad46d";
        ctx.fillRect(x + 2, y + 8, 1, 1);
        ctx.fillRect(x + 8, y + 6, 1, 1);
        return;
      }

      if (tile === "c") {
        ctx.fillStyle = "#6fa348";
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.fillStyle = "#8cc65d";
        ctx.fillRect(x + 2, y + 5, 12, 6);
        ctx.fillRect(x + 4, y + 3, 8, 4);
        ctx.fillStyle = "#d8ef9e";
        ctx.fillRect(x + 5, y + 4, 1, 1);
        ctx.fillRect(x + 10, y + 6, 1, 1);
        ctx.fillStyle = "rgba(0,0,0,0.1)";
        ctx.fillRect(x + 1, y + 12, 14, 2);
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

        ctx.fillStyle = "#6a4328";
        ctx.fillRect(x, y, tileSize, tileSize);

        if (building) {
          const roofBand = localY === 0;
          const wallBand = localY > 0;

          if (roofBand) {
            ctx.fillStyle = "#4c241c";
            ctx.fillRect(x, y + 2, tileSize, 4);
            ctx.fillStyle = "#7a3f2e";
            ctx.fillRect(x + 1, y + 4, tileSize - 2, 6);
            ctx.fillStyle = "#aa6248";
            ctx.fillRect(x + 3, y + 2, tileSize - 6, 2);
            ctx.fillStyle = "#d9a96f";
            ctx.fillRect(x + 6, y + 5, 4, 1);
          }

          if (wallBand) {
            ctx.fillStyle = "#cca272";
            ctx.fillRect(x + 1, y + 6, tileSize - 2, tileSize - 7);
            ctx.fillStyle = "#eed29c";
            ctx.fillRect(x + 3, y + 8, tileSize - 6, tileSize - 11);
            ctx.fillStyle = "#8d5c37";
            ctx.fillRect(x + 4, y + 14, tileSize - 8, 2);
            ctx.fillStyle = "#55321f";
            ctx.fillRect(x + 2, y + 12, 1, tileSize - 13);
            ctx.fillRect(x + tileSize - 3, y + 12, 1, tileSize - 13);
          }

          if (localX === 2 && localY === 2) {
            ctx.fillStyle = "#22120d";
            ctx.fillRect(x + 4, y + 8, 8, 8);
            ctx.fillStyle = "#6d4226";
            ctx.fillRect(x + 5, y + 9, 6, 6);
            ctx.fillStyle = "#e9d3a7";
            ctx.fillRect(x + 8, y + 12, 1, 1);
            ctx.fillStyle = "#c67b4d";
            ctx.fillRect(x + 8, y + 13, 1, 1);
          } else if ((localX === 1 || localX === 3) && localY === 1) {
            ctx.fillStyle = "#d7f0ff";
            ctx.fillRect(x + 4, y + 6, 3, 3);
            ctx.fillRect(x + 9, y + 6, 3, 3);
            ctx.fillStyle = "#87b5da";
            ctx.fillRect(x + 5, y + 7, 1, 1);
            ctx.fillRect(x + 10, y + 7, 1, 1);
          } else if (localX === 2 && localY === 1) {
            ctx.fillStyle = "#5f341c";
            ctx.fillRect(x + 6, y + 7, 4, 10);
            ctx.fillStyle = "#87623f";
            ctx.fillRect(x + 7, y + 8, 2, 8);
          } else if (localX === 1 && localY === 2) {
            ctx.fillStyle = "#4d2d1f";
            ctx.fillRect(x + 2, y + 11, 4, 4);
          } else if (localX === 3 && localY === 2) {
            ctx.fillStyle = "#4d2d1f";
            ctx.fillRect(x + 10, y + 11, 4, 4);
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
