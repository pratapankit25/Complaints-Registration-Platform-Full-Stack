// complaints.js
document.addEventListener('DOMContentLoaded', async () => {
  // Check session and route protection
  const user = await checkSession();
  
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  const path = window.location.pathname;

  // Setup Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // Display user info
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) {
    userDisplay.textContent = `${user.name} (${user.role})`;
  }

  // Handle My Complaints Dashboard
  if (path.endsWith('my-complaints.html')) {
    if (user.role === 'admin') {
      window.location.href = 'admin-dashboard.html';
      return;
    }
    await loadMyComplaints();
  }

  // Handle Admin Dashboard
  if (path.endsWith('admin-dashboard.html')) {
    if (user.role !== 'admin') {
      window.location.href = 'my-complaints.html';
      return;
    }
    await loadAllComplaints();
  }

  // Handle Submit Complaint flow
  const submitForm = document.getElementById('submitComplaintForm');
  const aiSection = document.getElementById('aiSection');
  const finalSubmitBtn = document.getElementById('finalSubmitBtn');
  
  let currentAiQuestion = '';

  if (submitForm) {
    submitForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const complaintText = document.getElementById('complaintText').value;
      const btn = submitForm.querySelector('button');

      try {
        btn.disabled = true;
        btn.textContent = 'Generating AI Follow-up...';
        
        const data = await apiFetch('/complaints/ai/question', {
          method: 'POST',
          body: JSON.stringify({ complaint_text: complaintText })
        });
        
        currentAiQuestion = data.ai_question;
        document.getElementById('aiQuestionText').textContent = currentAiQuestion;
        
        submitForm.classList.add('hidden');
        aiSection.classList.remove('hidden');
      } catch (error) {
        showError('submitAlert', error.message);
        btn.disabled = false;
        btn.textContent = 'Continue';
      }
    });
  }

  if (finalSubmitBtn) {
    finalSubmitBtn.addEventListener('click', async () => {
      const complaintText = document.getElementById('complaintText').value;
      const userAnswer = document.getElementById('userAnswer').value;

      if (!userAnswer.trim()) {
        return showError('aiAlert', 'Please provide an answer');
      }

      try {
        finalSubmitBtn.disabled = true;
        finalSubmitBtn.textContent = 'Submitting...';

        await apiFetch('/complaints', {
          method: 'POST',
          body: JSON.stringify({
            complaint_text: complaintText,
            ai_question: currentAiQuestion,
            user_answer: userAnswer
          })
        });

        window.location.href = 'my-complaints.html';
      } catch (error) {
        showError('aiAlert', error.message);
        finalSubmitBtn.disabled = false;
        finalSubmitBtn.textContent = 'Submit Complaint';
      }
    });
  }
});

async function loadMyComplaints() {
  const container = document.getElementById('complaintsContainer');
  try {
    const complaints = await apiFetch('/complaints/my');
    
    if (complaints.length === 0) {
      container.innerHTML = '<p class="text-muted">You have no complaints yet.</p>';
      return;
    }

    container.innerHTML = complaints.map(renderComplaintCard).join('');
  } catch (error) {
    container.innerHTML = `<p class="alert error">${error.message}</p>`;
  }
}

async function loadAllComplaints() {
  const container = document.getElementById('adminComplaintsContainer');
  try {
    const complaints = await apiFetch('/complaints/admin');
    
    if (complaints.length === 0) {
      container.innerHTML = '<p class="text-muted">No complaints found.</p>';
      return;
    }

    container.innerHTML = complaints.map(c => renderComplaintCard(c, true)).join('');
  } catch (error) {
    container.innerHTML = `<p class="alert error">${error.message}</p>`;
  }
}

function renderComplaintCard(complaint, isAdmin = false) {
  const date = new Date(complaint.created_at).toLocaleDateString();
  
  let userInfo = '';
  if (isAdmin) {
    userInfo = `<div class="user-info">
      <strong>User:</strong> ${complaint.user_name} (${complaint.user_email})
    </div>`;
  }

  return `
    <div class="complaint-item">
      ${userInfo}
      <div class="badge">${date}</div>
      <div class="mt-4">
        <label>Original Complaint</label>
        <p>${complaint.complaint_text}</p>
      </div>
      <div class="mt-4">
        <label>AI Question</label>
        <p><em>${complaint.ai_question}</em></p>
      </div>
      <div class="mt-4">
        <label>User's Answer</label>
        <p>${complaint.user_answer}</p>
      </div>
    </div>
  `;
}
