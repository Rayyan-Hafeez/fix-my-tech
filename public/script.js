const fileInput = document.getElementById("image");
const fileName = document.getElementById("file-name");

fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    fileName.textContent = fileInput.files[0].name;
  } else {
    fileName.textContent = "No image attached";
  }
});

document.getElementById("askBtn").addEventListener("click", async () => {
  const question = document.getElementById("question").value;
  const file = fileInput.files[0];

  const formData = new FormData();
  formData.append("question", question);
  if (file) {
    formData.append("image", file);
  }

  document.getElementById("answer").textContent = "Loading...";

  const res = await fetch("/api/ask", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  document.getElementById("answer").textContent = data.answer;
});
