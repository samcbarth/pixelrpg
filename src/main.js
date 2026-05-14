(function () {
  const root = (window.PixelRPG = window.PixelRPG || {});

  window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("game");
    if (!canvas) {
      return;
    }

    const game = new root.Game(canvas);
    window.pixelRpgGame = game;
    game.start();
  });
})();
