(function () {
  const root = (window.PixelRPG = window.PixelRPG || {});

  const TILE_SIZE = 16;
  const MAP_WIDTH = 80;
  const MAP_HEIGHT = 48;

  function createGrid() {
    const tiles = Array.from({ length: MAP_HEIGHT }, () =>
      Array.from({ length: MAP_WIDTH }, () => "g")
    );

    const inBounds = (x, y) => x >= 0 && y >= 0 && x < MAP_WIDTH && y < MAP_HEIGHT;

    const set = (x, y, code) => {
      if (inBounds(x, y)) {
        tiles[y][x] = code;
      }
    };

    const fillRect = (x, y, w, h, code) => {
      for (let yy = y; yy < y + h; yy += 1) {
        for (let xx = x; xx < x + w; xx += 1) {
          set(xx, yy, code);
        }
      }
    };

    const fillEllipse = (cx, cy, rx, ry, code) => {
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y += 1) {
        for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x += 1) {
          const dx = (x - cx) / rx;
          const dy = (y - cy) / ry;
          if (dx * dx + dy * dy <= 1) {
            set(x, y, code);
          }
        }
      }
    };

    const line = (x0, y0, x1, y1, code, thickness = 1) => {
      const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let i = 0; i <= steps; i += 1) {
        const t = steps === 0 ? 0 : i / steps;
        const x = Math.round(x0 + (x1 - x0) * t);
        const y = Math.round(y0 + (y1 - y0) * t);
        for (let yy = -Math.floor(thickness / 2); yy <= Math.floor(thickness / 2); yy += 1) {
          for (let xx = -Math.floor(thickness / 2); xx <= Math.floor(thickness / 2); xx += 1) {
            set(x + xx, y + yy, code);
          }
        }
      }
    };

    const hash = (x, y, seed = 0) => {
      let n = x * 374761393 + y * 668265263 + seed * 1442695041;
      n = (n ^ (n >>> 13)) * 1274126177;
      return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
    };

    // Water and shoreline.
    fillEllipse(11, 36, 9, 7, "w");
    fillEllipse(17, 31, 7, 4, "w");
    line(20, 29, 28, 27, "w", 3);
    line(28, 27, 34, 24, "w", 2);

    // Sand and mud edges around the water.
    for (let y = 0; y < MAP_HEIGHT; y += 1) {
      for (let x = 0; x < MAP_WIDTH; x += 1) {
        if (tiles[y][x] !== "g") {
          continue;
        }
        const adjacentWater = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
          [x - 1, y - 1],
          [x + 1, y - 1],
          [x - 1, y + 1],
          [x + 1, y + 1]
        ].some(([ax, ay]) => inBounds(ax, ay) && tiles[ay][ax] === "w");
        if (adjacentWater) {
          tiles[y][x] = "s";
        }
      }
    }

    // Dirt paths linking the village, lake, and fields.
    line(39, 38, 42, 34, "p", 3);
    line(42, 34, 48, 31, "p", 3);
    line(48, 31, 55, 29, "p", 3);
    line(55, 29, 61, 25, "p", 3);
    fillRect(45, 23, 10, 5, "p");
    fillRect(56, 18, 12, 4, "p");

    // Village clearing and building.
    fillRect(54, 11, 8, 6, "b");
    fillRect(53, 17, 10, 5, "g");
    fillRect(50, 13, 4, 3, "p");
    fillRect(62, 13, 4, 3, "p");

    // Forest canopy clusters. These are intentionally dense to give the scene more layered foliage.
    const forestZones = [
      [10, 5, 18, 12],
      [22, 7, 16, 13],
      [5, 18, 20, 12],
      [64, 6, 14, 12],
      [60, 20, 15, 11],
      [30, 26, 16, 12],
      [2, 28, 16, 10]
    ];

    forestZones.forEach(([zx, zy, zw, zh], zoneIndex) => {
      for (let y = zy; y < zy + zh; y += 1) {
        for (let x = zx; x < zx + zw; x += 1) {
          const n = hash(x, y, zoneIndex);
          if (n > 0.62 && tiles[y][x] === "g") {
            tiles[y][x] = "t";
          } else if (n > 0.44 && n <= 0.62 && tiles[y][x] === "g") {
            tiles[y][x] = "f";
          } else if (n > 0.33 && n <= 0.44 && tiles[y][x] === "g") {
            tiles[y][x] = "m";
          } else if (n > 0.24 && n <= 0.33 && tiles[y][x] === "g") {
            tiles[y][x] = "r";
          }
        }
      }
    });

    // Measured extra trees and shrubs so the map feels busy even in open areas.
    for (let y = 2; y < MAP_HEIGHT - 2; y += 1) {
      for (let x = 2; x < MAP_WIDTH - 2; x += 1) {
        const n = hash(x, y, 19);
        const inVillageEdge = x > 48 && x < 66 && y > 8 && y < 22;
        const inField = x > 34 && x < 68 && y > 20 && y < 40;
        if (tiles[y][x] === "g" && n > 0.86 && !inVillageEdge && !inField) {
          tiles[y][x] = "t";
        } else if (tiles[y][x] === "g" && n > 0.77 && n <= 0.86) {
          tiles[y][x] = "f";
        } else if (tiles[y][x] === "g" && n > 0.68 && n <= 0.77) {
          tiles[y][x] = "r";
        } else if (tiles[y][x] === "g" && n > 0.59 && n <= 0.68 && (x + y) % 3 === 0) {
          tiles[y][x] = "u";
        }
      }
    }

    // Decorative flowers and reeds near the water and along paths.
    [
      [8, 31], [10, 28], [14, 34], [18, 37], [24, 29], [29, 26],
      [35, 27], [40, 30], [44, 32], [49, 28], [58, 24], [64, 27],
      [67, 30], [71, 35], [74, 24]
    ].forEach(([x, y]) => {
      if (tiles[y] && tiles[y][x] === "g") {
        tiles[y][x] = "f";
      }
    });

    // Fallen logs and stones create a more lived-in landscape.
    [
      [12, 39], [15, 33], [21, 37], [25, 21], [37, 19],
      [47, 34], [52, 15], [60, 34], [69, 13], [71, 40]
    ].forEach(([x, y]) => set(x, y, "l"));

    [
      [7, 40], [19, 41], [28, 34], [34, 18], [44, 39],
      [58, 9], [63, 18], [72, 32], [76, 16]
    ].forEach(([x, y]) => set(x, y, "u"));

    // Small walkable crop/tall-grass patch for extra texture.
    fillRect(47, 24, 7, 4, "c");
    fillRect(56, 22, 5, 3, "c");

    // Re-skip any solid set that overlaps the path or building.
    fillRect(54, 11, 8, 6, "b");

    return tiles;
  }

  root.DATA = {
    title: "Pixel RPG Starter",
    tileSize: TILE_SIZE,
    canvasWidth: 800,
    canvasHeight: 450,
    mapWidth: MAP_WIDTH,
    mapHeight: MAP_HEIGHT,
    worldWidth: MAP_WIDTH * TILE_SIZE,
    worldHeight: MAP_HEIGHT * TILE_SIZE,
    playerName: "Alden",
    playerStart: { x: 40 * TILE_SIZE, y: 36 * TILE_SIZE },
    buildings: [
      { id: "cottage", x: 54, y: 11, w: 8, h: 6, name: "Mira's Cottage" }
    ],
    items: [
      {
        id: "river_herb",
        name: "River Herb",
        x: 20 * TILE_SIZE + 4,
        y: 35 * TILE_SIZE + 2,
        width: 10,
        height: 10,
        questItem: true
      }
    ],
    npcs: [
      {
        id: "mira",
        name: "Mira",
        role: "quest_giver",
        x: 57 * TILE_SIZE + 1,
        y: 16 * TILE_SIZE + 1,
        width: 16,
        height: 24,
        color: "#ffd166",
        clothing: "#ff8fab",
        hair: "#6b3c2a",
        lines: [
          "The river herb is missing from the meadow.",
          "Could you bring one back for my tea?",
          "I left some growing near the water to the east."
        ]
      },
      {
        id: "finn",
        name: "Finn",
        role: "villager",
        x: 63 * TILE_SIZE + 1,
        y: 25 * TILE_SIZE + 1,
        width: 16,
        height: 24,
        color: "#81d4ff",
        clothing: "#7c9cff",
        hair: "#6b4b2d",
        lines: [
          "The forest here gets extra dense after sunrise.",
          "If you see a glowing herb, it is probably important."
        ]
      }
    ],
    quest: {
      id: "river_herb",
      title: "Find the River Herb",
      objective: "Collect a river herb and return it to Mira.",
      itemName: "River Herb"
    },
    mapTiles: createGrid()
  };
})();
