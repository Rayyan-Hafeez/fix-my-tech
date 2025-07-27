window.addEventListener("DOMContentLoaded", () => {
  const questionInput = document.getElementById("question");
  const sendBtn = document.getElementById("sendBtn");
  const chatBox = document.getElementById("chat-box");
  const fileUpload = document.getElementById("file-upload");
  const fileName = document.getElementById("file-name");

  const conversationHistory = [
    {
      role: "system",
      content: "You are a helpful assistant providing step-by-step tech support for PCs and mobile devices.",
    }
  ];

  sendBtn.addEventListener("click", async () => {
    const question = questionInput.value.trim();
    if (!question) return;

    addMessage("user", question);
    questionInput.value = "";
    addMessage("ai", "Thinking...");

    conversationHistory.push({ role: "user", content: question });

    try {
      const formData = new FormData();
      formData.append("history", JSON.stringify(conversationHistory));
      if (fileUpload.files.length > 0) {
        formData.append("image", fileUpload.files[0]);
        if (fileName) fileName.textContent = fileUpload.files[0].name;
      }

      const response = await fetch("/api/ask", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const lastAiMessage = chatBox.querySelector(".message.ai:last-child");

      if (data.answer) {
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

  // Splash screen fade-out
  const splash = document.getElementById("splash-screen");
  setTimeout(() => {
    splash.classList.add("fade-out");
    setTimeout(() => {
      splash.style.display = "none";
      document.querySelector(".chat-wrapper").style.display = "flex";
    }, 1000);
  }, 3000);
});
