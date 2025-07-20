const questionInput = document.getElementById("question");
const sendBtn = document.getElementById("sendBtn");
const chatBox = document.getElementById("chat-box");
const fileUpload = document.getElementById("file-upload");

// Maintain full message history
const history = [];

sendBtn.addEventListener("click", async () => {
  const question = questionInput.value.trim();
  if (!question) return;

  // Add user message to chat and history
  addMessage("user", question);
  history.push({ role: "user", content: question });
  questionInput.value = "";

  // Show "thinking" AI message in UI and track it
  addMessage("ai", "Thinking...");
  history.push({ role: "assistant", content: "Thinking..." }); // placeholder

  try {
    const formData = new FormData();
    formData.append("history", JSON.stringify(history.slice(0, -1))); // Exclude placeholder
    if (fileUpload.files.length > 0) {
      formData.append("image", fileUpload.files[0]);
    }

    const response = await fetch("/api/ask", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    const lastAiMessage = chatBox.querySelector(".message.ai:last-child");

    if (data.answer) {
      lastAiMessage.textContent = data.answer;
      history[history.length - 1].content = data.answer; // update placeholder
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
    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => {
        splash.style.display = "none";
        document.querySelector(".chat-wrapper").style.display = "block";
        document.getElementById("language-select").style.display = "block";
      }, 1000);
    }
  }, 3000);
});
