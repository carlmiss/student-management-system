const API = (window.API_BASE_URL || "").replace(/\/+$/, "");
const form = document.getElementById("student-form");
const tbody = document.getElementById("students");
const message = document.getElementById("message");
const statusText = document.getElementById("status");
const searchInput = document.getElementById("search");
let students = [];
let searchTimer;

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

async function request(path, options = {}) {
  if (!API || API.includes("REPLACE-WITH-YOUR")) throw new Error("Set your Render API URL in frontend/config.js first.");
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

async function checkApi() {
  try {
    await request("/api/health");
    statusText.textContent = "API reachable";
  } catch (error) {
    statusText.textContent = "API not connected yet";
  }
}

async function loadStudents() {
  try {
    const query = searchInput.value.trim();
    students = await request(`/api/students${query ? `?search=${encodeURIComponent(query)}` : ""}`);
    renderStudents();
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty">${escapeHtml(error.message)}</td></tr>`;
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function renderStudents() {
  if (!students.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">No student records found.</td></tr>';
    return;
  }
  tbody.innerHTML = students.map(student => `
    <tr>
      <td>${escapeHtml(student.name)}</td>
      <td>${escapeHtml(student.email)}</td>
      <td>${escapeHtml(student.course)}</td>
      <td>${escapeHtml(student.year)}</td>
      <td class="actions-cell">
        <button class="small" data-edit="${student._id}">Edit</button>
        <button class="small danger" data-delete="${student._id}">Delete</button>
      </td>
    </tr>`).join("");
}

function resetForm() {
  form.reset();
  document.getElementById("student-id").value = "";
  document.getElementById("form-title").textContent = "Add a student";
  document.getElementById("save-button").textContent = "Add student";
  document.getElementById("cancel-button").classList.add("hidden");
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const id = document.getElementById("student-id").value;
  const payload = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    course: document.getElementById("course").value.trim(),
    year: Number(document.getElementById("year").value)
  };
  try {
    await request(id ? `/api/students/${id}` : "/api/students", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    showMessage(id ? "Student updated successfully." : "Student added successfully.");
    resetForm();
    await loadStudents();
  } catch (error) {
    showMessage(error.message, true);
  }
});

tbody.addEventListener("click", async event => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;
  if (editId) {
    const student = students.find(item => item._id === editId);
    if (!student) return;
    document.getElementById("student-id").value = student._id;
    document.getElementById("name").value = student.name;
    document.getElementById("email").value = student.email;
    document.getElementById("course").value = student.course;
    document.getElementById("year").value = student.year;
    document.getElementById("form-title").textContent = "Edit student";
    document.getElementById("save-button").textContent = "Save changes";
    document.getElementById("cancel-button").classList.remove("hidden");
    document.getElementById("name").focus();
  }
  if (deleteId && confirm("Delete this student record?")) {
    try {
      await request(`/api/students/${deleteId}`, { method: "DELETE" });
      showMessage("Student deleted successfully.");
      await loadStudents();
    } catch (error) {
      showMessage(error.message, true);
    }
  }
});

document.getElementById("cancel-button").addEventListener("click", resetForm);
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadStudents, 250);
});

checkApi();
loadStudents();
