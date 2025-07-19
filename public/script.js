const questionInput = document.getElementById("question");
const sendBtn = document.getElementById("sendBtn");
const chatBox = document.getElementById("chat-box");
const fileUpload = document.getElementById("file-upload");

sendBtn.addEventListener("click", async () => {
  const question = questionInput.value.trim();
  if (!question) return;

  addMessage("user", question);
  questionInput.value = "";
  addMessage("ai", "Thinking...");

  try {
    const formData = new FormData();
    formData.append("question", question);
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
