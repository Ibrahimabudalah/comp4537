import { STRINGS } from "../lang/messages/en/user.js";

class NoteItem {
  constructor(content = "", onRemove = null) {
    this.content = content;
    this.onRemove = onRemove;

    //creating elements in the DOM
    this.container = document.createElement("div");
    this.container.className = "note-row";

    this.textarea = document.createElement("textarea");
    this.textarea.className = "note-box";
    this.textarea.value = this.content;

    this.removeBtn = document.createElement("button");
    this.removeBtn.className = "btn-remove";
    this.removeBtn.type = "button";
    this.removeBtn.textContent = STRINGS.BTN_REMOVE;

    this.removeBtn.addEventListener("click", () => {
      this.destroy();
      if (this.onRemove) {
        this.onRemove();
      }
    });

    this.container.appendChild(this.textarea);
    this.container.appendChild(this.removeBtn);
  }

  getValue() {
    return this.textarea.value;
  }

  destroy() {
    this.container.remove();
  }
}

/**
 * Class that represents the read box on reader.html
 */
class ReadOnlyNote {
  constructor(content = "") {
    this.textarea = document.createElement("textarea");
    this.textarea.className = "note-box";
    this.textarea.readOnly = true;
    this.textarea.value = content;
  }
}

//writer.html script
class WriterApp {
  constructor() {
    this.notes = [];
    this.container = document.getElementById("notes-container");
    this.addBtn = document.getElementById("add-btn");
    this.backBtn = document.getElementById("back-btn");
    this.timestampDisplay = document.getElementById("timestamp");

    this.initUI();
    this.loadExistingNotes();
    this.initInterval();
  }

  initUI() {
    if (this.addBtn) this.addBtn.textContent = STRINGS.BTN_ADD;
    if (this.backBtn) this.backBtn.textContent = STRINGS.BTN_BACK;

    if (this.addBtn) {
      this.addBtn.addEventListener("click", () => this.addNote());
    }
  }

  addNote(text = "") {
    const note = new NoteItem(text, () => this.removeNote(note));
    this.notes.push(note);
    this.container.appendChild(note.container);
  }

  removeNote(noteInstance) {
    this.notes = this.notes.filter((item) => item !== noteInstance);
    this.saveNotes(); //remove from localstrage
  }

  //loading notes
  loadExistingNotes() {
    const stored = localStorage.getItem("notesData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((item) => this.addNote(item.content || ""));
        }
      } catch (e) {
        console.error("Error reading localStorage:", e);
      }
    }
  }

  saveNotes() {
    const data = this.notes.map((note) => ({
      content: note.getValue(),
    }));
    localStorage.setItem("notesData", JSON.stringify(data));
    this.updateTimestamp();
  }

  updateTimestamp() {
    if (this.timestampDisplay) {
      const now = new Date();
      this.timestampDisplay.textContent = `${STRINGS.TIME_STORED}${now.toLocaleTimeString()}`;
    }
  }

  initInterval() {
    setInterval(() => this.saveNotes(), 2000);
  }
}

//reader.html script
class ReaderApp {
  constructor() {
    this.container = document.getElementById("notes-container");
    this.backBtn = document.getElementById("back-btn");
    this.timestampDisplay = document.getElementById("timestamp");

    this.initUI();
    this.fetchAndRenderNotes();
    this.initInterval();
  }

  initUI() {
    if (this.backBtn) this.backBtn.textContent = STRINGS.BTN_BACK;
  }

  fetchAndRenderNotes() {
    const stored = localStorage.getItem("notesData");
    if (this.container) {
      this.container.innerHTML = "";
    }

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && this.container) {
          parsed.forEach((item) => {
            const readNote = new ReadOnlyNote(item.content || "");
            this.container.appendChild(readNote.textarea);
          });
        }
      } catch (e) {
        console.error("Error parsing localStorage:", e);
      }
    }
    this.updateTimestamp();
  }

  updateTimestamp() {
    if (this.timestampDisplay) {
      const now = new Date();
      this.timestampDisplay.textContent = `${STRINGS.TIME_UPDATED}${now.toLocaleTimeString()}`;
    }
  }

  initInterval() {
    setInterval(() => this.fetchAndRenderNotes(), 2000);
  }
}

// page routing and main
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.toLowerCase();

  if (path.includes("writer.html")) {
    new WriterApp();
  } else if (path.includes("reader.html")) {
    new ReaderApp();
  } else {
    // landing page
    const pageTitle = document.getElementById("page-title");
    const studentName = document.getElementById("student-name");
    const linkWriter = document.getElementById("link-writer");
    const linkReader = document.getElementById("link-reader");

    if (pageTitle) pageTitle.textContent = STRINGS.APP_TITLE;
    if (studentName) studentName.textContent = STRINGS.STUDENT_INFO;
    if (linkWriter) linkWriter.textContent = STRINGS.BTN_WRITER;
    if (linkReader) linkReader.textContent = STRINGS.BTN_READER;
  }
});
