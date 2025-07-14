const questionInput = document.getElementById("question");
const sendBtn = document.getElementById("sendBtn");
const chatBox = document.getElementById("chat-box");
const fileUpload = document.getElementById("file-upload");
const askBtn = document.getElementById("askBtn");
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-upload"); // reuse same file input
const fileName = document.getElementById("file-name"); // add this span in HTML

const conversationHistory = [
  {
    role: "system",
    content: "You are a helpful assistant providing step-by-step tech support for PCs and mobile devices. Remember the conversation and reply accordingly."
  }
];

dropZone.addEventListener("click", () => { fileInput.click(); });
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => { dropZone.classList.remove("dragover"); });
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const files = e.dataTransfer.files;
  if (files.length) {
    fileInput.files = files;
    fileName.textContent = files[0].name;
  }
});
fileInput.addEventListener("change", () => {
  if (fileInput.files.length) {
    fileName.textContent = fileInput.files[0].name;
  } else {
    fileName.textContent = "No image attached";
  }
});

askBtn.addEventListener("click", async () => {
  const question = questionInput.value.trim();
  if (!question) return;

  addMessage("user", question);
  questionInput.value = "";
  addMessage("ai", "Thinking...");

  // Add user message to history
  conversationHistory.push({ role: "user", content: question });

  try {
    const formData = new FormData();
    formData.append("history", JSON.stringify(conversationHistory));
    if (fileInput.files.length > 0) {
      formData.append("image", fileInput.files[0]);
    }

    const response = await fetch("/api/ask", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    const lastAiMessage = chatBox.querySelector(".message.ai:last-child");
    if (data.answer) {
      // Add assistant reply to history
      conversationHistory.push({ role: "assistant", content: data.answer });

      lastAiMessage.textContent = data.answer;
    } else {
      lastAiMessage.textContent = "Sorry, something went wrong.";
    }
  } catch (err) {
    console.error(err);
    const lastAiMessage = chatBox.querySelector(".message.ai:last-child");
    lastAiMessage.textContent = "Error contacting server.";
  }
});

function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Splash screen logic
window.addEventListener("load", () => {
  setTimeout(() => {
    const splash = document.getElementById("splash-screen");
    splash.classList.add("fade-out");

    setTimeout(() => {
      splash.style.display = "none";
      document.querySelector(".chat-wrapper").style.display = "flex";
    }, 1000); // fade out duration
  }, 3000); // splash screen duration
});
