const askBtn = document.getElementById('askBtn');
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');

askBtn.addEventListener('click', async () => {
  const question = questionEl.value.trim();
  if (!question) {
    alert('Please enter your tech problem.');
    return;
  }
  answerEl.textContent = 'Thinking...';

  try {
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    const data = await response.json();
    answerEl.textContent = data.answer;
  } catch (error) {
    answerEl.textContent = 'Sorry, there was an error. Please try again later.';
    console.error(error);
  }
});
