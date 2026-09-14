/**
 * Multiple classes for the memory game.
 *
 * IA
 */
import { STRINGS } from "../lang/messages/en/user.js";

/**
 * Represents a single button in the game.
 */
class MemoryButton {
  constructor(orderNumber, color) {
    this.orderNumber = orderNumber;
    this.color = color;
    this.element = document.createElement("button");
    this.initializeElement();
  }

  initializeElement() {
    this.element.className = "game-btn";
    this.element.style.backgroundColor = this.color;
    this.showOrder();
  }

  showOrder() {
    this.element.textContent = this.orderNumber.toString();
  }

  hideOrder() {
    this.element.textContent = "";
  }

  setClickable(isClickable, callback = null) {
    if (isClickable) {
      this.element.classList.add("clickable");
      this.element.onclick = callback;
    } else {
      this.element.classList.remove("clickable");
      this.element.onclick = null;
    }
  }

  /**
   * Reads current container and repositions within limits
   */
  moveToRandomPosition(containerWidth, containerHeight) {
    this.element.classList.add("scattered");

    const btnWidth = this.element.offsetWidth;
    const btnHeight = this.element.offsetHeight;

    const maxLeft = Math.max(0, containerWidth - btnWidth);
    const maxTop = Math.max(0, containerHeight - btnHeight);

    const randomLeft = Math.floor(Math.random() * maxLeft);
    const randomTop = Math.floor(Math.random() * maxTop);

    this.element.style.left = `${randomLeft}px`;
    this.element.style.top = `${randomTop}px`;
  }

  destroy() {
    this.element.remove();
  }
}

/**
 * Handles DOM, text rendering, and messages
 */
class UIController {
  constructor() {
    this.labelPrompt = document.getElementById("prompt-label");
    this.inputCount = document.getElementById("button-count");
    this.btnStart = document.getElementById("start-btn");
    this.gameArea = document.getElementById("game-area");
    this.messageDisplay = document.getElementById("message-display");

    this.applyLanguageStrings();
  }

  applyLanguageStrings() {
    this.labelPrompt.textContent = STRINGS.LABEL_PROMPT;
    this.btnStart.textContent = STRINGS.BTN_GO;
  }

  getInputValue() {
    return parseInt(this.inputCount.value, 10);
  }

  showMessage(text, color = "black") {
    this.messageDisplay.textContent = text;
    this.messageDisplay.style.color = color;
  }

  clearMessage() {
    this.messageDisplay.textContent = "";
  }

  getGameAreaBounds() {
    return {
      width: this.gameArea.clientWidth,
      height: this.gameArea.clientHeight,
    };
  }

  resetGameArea() {
    this.gameArea.innerHTML = "";
    this.gameArea.className = "button-row";
  }

  bindStartHandler(handler) {
    this.btnStart.addEventListener("click", handler);
  }
}

/**
 * Manages game state, validation, timers, scrambling, and user evaluation
 */
class GameEngine {
  constructor(ui) {
    this.ui = ui;
    this.buttons = [];
    this.expectedIndex = 1;
    this.scrambleTimer = null;
    this.pauseTimer = null;

    this.ui.bindStartHandler(() => this.startGame());
  }

  validateInput(n) {
    return !isNaN(n) && n >= 3 && n <= 7;
  }

  generateRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  clearTimers() {
    if (this.scrambleTimer) {
      clearInterval(this.scrambleTimer);
      this.scrambleTimer = null;
    }
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }
  }

  startGame() {
    const n = this.ui.getInputValue();

    if (!this.validateInput(n)) {
      this.ui.showMessage(STRINGS.ERR_INVALID_RANGE, "red");
      return;
    }

    this.clearTimers();
    this.ui.clearMessage();
    this.ui.resetGameArea();

    // remove existing buttons from DOM
    this.buttons.forEach((btn) => btn.destroy());
    this.buttons = [];
    this.expectedIndex = 1;

    // Create n buttons
    for (let i = 1; i <= n; i++) {
      const color = this.generateRandomColor();
      const btn = new MemoryButton(i, color);
      this.buttons.push(btn);
      this.ui.gameArea.appendChild(btn.element);
    }

    // Wait n seconds, then begin scrambling n times at 2 second intervals
    this.pauseTimer = setTimeout(() => {
      this.startScramblingSequence(n);
    }, n * 1000);
  }

  startScramblingSequence(totalScrambles) {
    let count = 0;

    this.scrambleButtons();
    count++;

    if (count >= totalScrambles) {
      this.enableUserInteraction();
      return;
    }

    this.scrambleTimer = setInterval(() => {
      this.scrambleButtons();
      count++;

      if (count >= totalScrambles) {
        clearInterval(this.scrambleTimer);
        this.scrambleTimer = null;
        this.enableUserInteraction();
      }
    }, 2000);
  }

  scrambleButtons() {
    const bounds = this.ui.getGameAreaBounds();
    this.buttons.forEach((btn) => {
      btn.moveToRandomPosition(bounds.width, bounds.height);
    });
  }

  enableUserInteraction() {
    this.buttons.forEach((btn) => {
      btn.hideOrder();
      btn.setClickable(true, () => this.handleButtonClick(btn));
    });
  }

  handleButtonClick(clickedButton) {
    if (clickedButton.orderNumber === this.expectedIndex) {
      clickedButton.showOrder();
      clickedButton.setClickable(false);
      this.expectedIndex++;

      if (this.expectedIndex > this.buttons.length) {
        this.ui.showMessage(STRINGS.MSG_EXCELLENT, "green");
      }
    } else {
      this.ui.showMessage(STRINGS.MSG_WRONG, "red");
      this.revealAllAndEnd();
    }
  }

  revealAllAndEnd() {
    this.buttons.forEach((btn) => {
      btn.showOrder();
      btn.setClickable(false);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UIController();
  new GameEngine(ui);
});
