(function () {
  const root = (window.PixelRPG = window.PixelRPG || {});

  function rectsOverlap(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  function getTileRange(rect, tileSize) {
    return {
      left: Math.floor(rect.x / tileSize),
      right: Math.floor((rect.x + rect.width - 1) / tileSize),
      top: Math.floor(rect.y / tileSize),
      bottom: Math.floor((rect.y + rect.height - 1) / tileSize)
    };
  }

  function collidesWithWorld(rect, world) {
    const tileSize = world.tileSize;
    const range = getTileRange(rect, tileSize);

    for (let ty = range.top; ty <= range.bottom; ty += 1) {
      for (let tx = range.left; tx <= range.right; tx += 1) {
        if (world.isSolidTile(tx, ty)) {
          return true;
        }
      }
    }

    return false;
  }

  function collidesWithRects(rect, rects) {
    return rects.some((other) => rectsOverlap(rect, other));
  }

  function resolveAxis(entity, axis, amount, world, blockers) {
    if (amount === 0) {
      return false;
    }

    entity[axis] += amount;
    const bounds = entity.getBounds();
    const hitWorld = collidesWithWorld(bounds, world);
    const hitBlockers = blockers.length > 0 && collidesWithRects(bounds, blockers);

    if (hitWorld || hitBlockers) {
      entity[axis] -= amount;
      return true;
    }

    return false;
  }

  root.Collision = {
    rectsOverlap,
    collidesWithWorld,
    collidesWithRects,
    resolveAxis
  };
})();
