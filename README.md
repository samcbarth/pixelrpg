# Pixel RPG Starter

This is a small browser-based pixel RPG starter repo built with plain HTML, CSS, and JavaScript.

## What It Includes

- A fixed-size canvas with pixel-art styling
- WASD and arrow-key movement
- Camera follow
- Tile collision
- Two NPCs
- Dialogue
- One simple quest
- A small inventory system
- A pause/menu screen
- Placeholder graphics made with canvas drawing

## Run It

Open `index.html` in a browser, or serve the folder with any simple local server.

## Controls

- `WASD` or arrow keys: move
- `E`: talk, interact, or continue dialogue
- `Escape`: open or close the pause menu

## Project Structure

```text
/pixel-rpg
  index.html
  README.md
  /src
    main.js
    game.js
    player.js
    map.js
    npc.js
    dialogue.js
    quest.js
    inventory.js
    input.js
    camera.js
    collision.js
    data.js
  /styles
    style.css
  /assets
    /sprites
    /tiles
    /audio
```

## How To Add A New NPC

1. Add a new NPC definition in `src/data.js`.
2. Give it a unique `id`, name, position, and dialogue lines.
3. If it should trigger a quest, add a custom `role` or hook in `src/npc.js`.

## How To Add A New Map Tile

1. Add a new tile code in `src/data.js`.
2. Teach `src/map.js` how to draw it.
3. Mark it solid or walkable in `src/map.js` collision rules.

## How To Add A New Quest

1. Extend `src/quest.js` with a new quest state or quest definition.
2. Update the relevant NPC in `src/npc.js` to start or finish it.
3. Add any required item to `src/data.js` and `src/inventory.js`.

## How To Replace Placeholder Sprites

The first version draws everything with canvas shapes.

To swap in real art later:

1. Put sprite sheets in `assets/sprites/`.
2. Update `src/player.js`, `src/npc.js`, and `src/map.js` to load images instead of drawing shapes.
3. Keep the same tile and entity sizes so the rest of the code stays simple.

## Notes

- The project has no build step.
- The code is intentionally split into small files so it is easy to expand later.
- The starter uses beginner-friendly data objects and simple classes instead of a heavy engine.

## Next Features To Add

- Save and load with `localStorage`
- More NPCs and branching dialogue
- Enemy patrols and basic combat
- Sound effects and background music
- Enterable buildings and interior maps
- Multiple quests and a quest log
- Item pickups with crafting or crafting ingredients
