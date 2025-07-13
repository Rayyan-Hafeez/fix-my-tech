const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("image");
const fileName = document.getElementById("file-name");
const askBtn = document.getElementById("askBtn");
const questionInput = document.getElementById("question");
const answerBox = document.getElementById("answer");

// Drop zone events
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
  if (!question) {
    answerBox.textContent = "Please enter a question.";
    return;
  }

  answerBox.textContent = "Thinking...";

  try {
    const formData = new FormData();
    formData.append("question", question);
    if (fileInput.files[0]) {
      formData.append("image", fileInput.files[0]);
    }

    const response = await fetch("/api/ask", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    if (data.answer) {
      // Split by lines for step-by-step formatting
      const steps = data.answer.split(/\n+/).filter(line => line.trim() !== "");
      answerBox.textContent = steps.map((step, index) => `• ${step}`).join("\n");
    } else {
      answerBox.textContent = "Sorry, there was an error processing your request.";
    }
  } catch (error) {
    console.error(error);
    answerBox.textContent = "Error contacting server.";
  }
});
