(function () {
  const root = (window.PixelRPG = window.PixelRPG || {});

  class QuestState {
    constructor(definition) {
      this.id = definition.id;
      this.title = definition.title;
      this.objective = definition.objective;
      this.itemName = definition.itemName;
      this.stage = "inactive";
    }

    accept() {
      if (this.stage === "inactive") {
        this.stage = "accepted";
      }
    }

    markCollected() {
      if (this.stage === "accepted") {
        this.stage = "collected";
      }
    }

    complete() {
      if (this.stage === "collected") {
        this.stage = "complete";
      }
    }

    get summary() {
      switch (this.stage) {
        case "inactive":
          return "Talk to Mira to start the quest.";
        case "accepted":
          return "Find the River Herb near the water.";
        case "collected":
          return "Return the herb to Mira.";
        case "complete":
          return "Quest complete.";
        default:
          return this.objective;
      }
    }

    get details() {
      return this.objective;
    }
  }

  root.QuestState = QuestState;
})();
