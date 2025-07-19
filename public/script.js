const sendBtn = document.getElementById("sendBtn");
const questionInput = document.getElementById("question");
const chatWindow = document.getElementById("chat-window");
const micBtn = document.getElementById("micBtn");
const fileInput = document.getElementById("fileInput");
const langPicker = document.getElementById("langPicker");

// Message Display
function addMessage(message, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${sender}`;
  msgDiv.textContent = message;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Translation (client-side demo only)
function translate(text, lang) {
  const translations = {
    ur: "براہ کرم اپنے مسئلے کی وضاحت کریں۔",
    es: "Por favor describe tu problema.",
    fr: "Veuillez décrire votre problème."
  };
  return translations[lang] || text;
}

// Voice Input
micBtn.addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = langPicker.value || "en-US";
  recognition.onresult = (event) => {
    questionInput.value = event.results[0][0].transcript;
  };
  recognition.start();
});

// Handle Send
sendBtn.addEventListener("click", async () => {
  const question = questionInput.value.trim();
  const lang = langPicker.value;

  if (!question) return;
  addMessage(question, "user");

  const formData = new FormData();
  formData.append("question", question);
  if (fileInput.files[0]) {
    formData.append("image", fileInput.files[0]);
  }

  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    const answer = translate(data.answer, lang);
    addMessage(answer, "bot");

    // Track basic usage
    console.log("User asked:", question);
    console.log("Answer:", data.answer);
  } catch (err) {
    addMessage("Error getting answer.", "bot");
    console.error(err);
  }

  questionInput.value = "";
});
