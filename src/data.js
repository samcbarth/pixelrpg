(function () {
  const root = (window.PixelRPG = window.PixelRPG || {});

  const TILE_SIZE = 24;
  const MAP_WIDTH = 30;
  const MAP_HEIGHT = 22;

  function createGrid() {
    const tiles = Array.from({ length: MAP_HEIGHT }, () =>
      Array.from({ length: MAP_WIDTH }, () => "g")
    );

    const fillRect = (x, y, w, h, code) => {
      for (let row = y; row < y + h; row += 1) {
        for (let col = x; col < x + w; col += 1) {
          if (row >= 0 && row < MAP_HEIGHT && col >= 0 && col < MAP_WIDTH) {
            tiles[row][col] = code;
          }
        }
      }
    };

    const addTrees = (coords) => {
      coords.forEach(([x, y]) => {
        if (x > 0 && y > 0 && x < MAP_WIDTH - 1 && y < MAP_HEIGHT - 1) {
          tiles[y][x] = "t";
        }
      });
    };

    // Outer tree border keeps the world feeling enclosed.
    for (let x = 0; x < MAP_WIDTH; x += 1) {
      tiles[0][x] = "t";
      tiles[MAP_HEIGHT - 1][x] = "t";
    }
    for (let y = 0; y < MAP_HEIGHT; y += 1) {
      tiles[y][0] = "t";
      tiles[y][MAP_WIDTH - 1] = "t";
    }

    // Paths lead the player through the village and to the river.
    fillRect(5, 8, 3, 11, "p");
    fillRect(7, 16, 17, 2, "p");
    fillRect(11, 11, 2, 7, "p");
    fillRect(20, 9, 5, 2, "p");

    // Water sits on the east side of the map.
    fillRect(19, 4, 8, 4, "w");
    fillRect(18, 8, 10, 2, "w");

    // A small house for the quest giver.
    fillRect(4, 3, 5, 4, "b");

    // Tree clusters add simple collision and scenery.
    addTrees([
      [2, 3], [3, 2], [8, 2], [10, 4], [12, 3],
      [2, 13], [3, 14], [4, 15], [10, 19], [13, 4],
      [16, 5], [23, 4], [24, 3], [26, 4], [27, 3],
      [22, 15], [24, 16], [26, 14], [27, 18], [20, 19]
    ]);

    // A few extra grass details so the map does not feel flat.
    tiles[11][18] = "f";
    tiles[12][19] = "f";
    tiles[14][9] = "f";
    tiles[17][21] = "f";

    return tiles;
  }

  root.DATA = {
    title: "Pixel RPG Starter",
    tileSize: TILE_SIZE,
    canvasWidth: 480,
    canvasHeight: 360,
    mapWidth: MAP_WIDTH,
    mapHeight: MAP_HEIGHT,
    worldWidth: MAP_WIDTH * TILE_SIZE,
    worldHeight: MAP_HEIGHT * TILE_SIZE,
    playerName: "Alden",
    playerStart: { x: 8 * TILE_SIZE, y: 18 * TILE_SIZE },
    buildings: [
      { id: "cottage", x: 4, y: 3, w: 5, h: 4, name: "Mira's Cottage" }
    ],
    items: [
      {
        id: "river_herb",
        name: "River Herb",
        x: 23 * TILE_SIZE + 4,
        y: 11 * TILE_SIZE + 4,
        width: 12,
        height: 12,
        questItem: true
      }
    ],
    npcs: [
      {
        id: "mira",
        name: "Mira",
        role: "quest_giver",
        x: 6 * TILE_SIZE + 2,
        y: 6 * TILE_SIZE + 2,
        width: 18,
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
        x: 22 * TILE_SIZE + 2,
        y: 16 * TILE_SIZE + 2,
        width: 18,
        height: 24,
        color: "#81d4ff",
        clothing: "#7c9cff",
        hair: "#6b4b2d",
        lines: [
          "I like to stand by the river and watch the ripples.",
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
