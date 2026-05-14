(function () {
  const root = (window.PixelRPG = window.PixelRPG || {});

  class DialogueBox {
    constructor() {
      this.visible = false;
      this.speaker = "";
      this.lines = [];
      this.index = 0;
      this.onComplete = null;
    }

    open(speaker, lines, onComplete = null) {
      this.visible = true;
      this.speaker = speaker;
      this.lines = Array.isArray(lines) ? lines.slice() : [String(lines)];
      this.index = 0;
      this.onComplete = onComplete;
    }

    close() {
      if (!this.visible) {
        return;
      }

      this.visible = false;
      this.speaker = "";
      this.lines = [];
      this.index = 0;

      const complete = this.onComplete;
      this.onComplete = null;
      if (typeof complete === "function") {
        complete();
      }
    }

    advance() {
      if (!this.visible) {
        return false;
      }

      if (this.index < this.lines.length - 1) {
        this.index += 1;
        return true;
      }

      this.close();
      return true;
    }

    get currentLine() {
      return this.lines[this.index] || "";
    }
  }

  root.DialogueBox = DialogueBox;
})();
