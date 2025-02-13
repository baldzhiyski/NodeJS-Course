const tasksDOM = document.querySelector(".tasks");
const loadingDOM = document.querySelector(".loading-text");
const formDOM = document.querySelector(".task-form");
const taskInputDOM = document.querySelector(".task-input");
const formAlertDOM = document.querySelector(".form-alert");
// Load tasks from /api/tasks
const showTasks = async () => {
  loadingDOM.style.visibility = "visible";
  try {
    const response = await axios.get("/api/v1/tasks");
    const tasks = response.data.data; // Ensure this matches your API response structure

    if (tasks.length < 1) {
      tasksDOM.innerHTML = '<h5 class="empty-list">No tasks in your list</h5>';
      loadingDOM.style.visibility = "hidden";
      return;
    }

    const allTasks = tasks
      .map((task) => {
        const { _id: taskID, title, status } = task;
        const isCompleted = status === "completed" ? "task-completed" : "";

        return `
          <div class="single-task ${isCompleted}">
            <h5>
              <span><i class="far fa-check-circle"></i></span> ${title}
            </h5>
            <p><strong>Status:</strong> ${status}</p>
            <div class="task-links">
              <!-- Edit link -->
              <a href="task.html?id=${taskID}" class="edit-link">
                <i class="fas fa-edit"></i>
              </a>
              <!-- Delete button -->
              <button type="button" class="delete-btn" data-id="${taskID}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>`;
      })
      .join("");

    tasksDOM.innerHTML = allTasks;
  } catch (error) {
    tasksDOM.innerHTML =
      '<h5 class="empty-list">There was an error, please try later....</h5>';
  }
  loadingDOM.style.visibility = "hidden";
};

showTasks();

// delete task /api/tasks/:id

tasksDOM.addEventListener("click", async (e) => {
  const el = e.target;
  if (el.parentElement.classList.contains("delete-btn")) {
    loadingDOM.style.visibility = "visible";
    const id = el.parentElement.dataset.id;
    try {
      await axios.delete(`/api/v1/tasks/${id}`);
      showTasks();
    } catch (error) {
      console.log(error);
    }
  }
  loadingDOM.style.visibility = "hidden";
});

// form

formDOM.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = taskInputDOM.value;

  try {
    await axios.post("/api/v1/tasks", { title });
    showTasks();
    taskInputDOM.value = "";
    formAlertDOM.style.display = "block";
    formAlertDOM.textContent = `success, task added`;
    formAlertDOM.classList.add("text-success");
  } catch (error) {
    formAlertDOM.style.display = "block";
    formAlertDOM.innerHTML = `error, please try again`;
  }
  setTimeout(() => {
    formAlertDOM.style.display = "none";
    formAlertDOM.classList.remove("text-success");
  }, 3000);
});
