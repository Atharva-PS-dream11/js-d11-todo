// Input elements
const form = document.getElementById('input-form');
const task = document.getElementById('taskDetails-input');
const assignee = document.getElementById('assignee-input');
const dueDate = document.getElementById('dueDate-input');
const locate = document.getElementById('location-input'); // Renamed variable
const btn = document.querySelector('button');

// In-progress and completed divs
const inProgress = document.querySelector('.task-inProgress');
const completed = document.querySelector('.task-completed');
const autoCompleteDiv = document.querySelector('.autocomplete');

// Separate arrays for tasks
let inProgressTaskArray = [];
let completedTaskArray = [];

//fetch api
const URL = "https://jsonplaceholder.typicode.com/posts";


// Load tasks from local storage on page load
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  renderTasks();
});


// auto complete logic
locate.addEventListener('keyup', async () => {
  let input = locate.value;
  if (input.length) {
    // Fetch cities based on the input
  try{
    const response = await fetch(URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    // Filter cities based on input
    const filtered = data
      .filter(city => city.title.toLowerCase().trim().includes(input.toLowerCase().trim()))
      .map(city => city.title);
    display(filtered);
    if (!filtered.length) {
      autoCompleteDiv.innerHTML = '';
    }
  } catch (error) {
    console.error('Fetch error:', error);
    autoCompleteDiv.innerHTML = "error occured";
  }

  }
});

function display(filtered) {
  const content = filtered.map((item) => {
    return "<li onclick=selectInput(this) >" + item + "</li>";
  });
  autoCompleteDiv.innerHTML = "<ul>" + content.join('') + "</ul>";
}

function selectInput(list) {
  locate.value = list.innerHTML;
  autoCompleteDiv.innerHTML = '';
}

// Submit listener for form
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (await validateInput()) {
    addTask();
  }
});

// Error and success functions
const setError = (element, msg) => {
  const input = element.parentElement;
  const errorDiv = input.querySelector('.error');
  errorDiv.innerText = msg;
  input.classList.add('error');
  input.classList.remove('success');
};

const setSuccess = (element) => {
  const input = element.parentElement;
  const errorDiv = input.querySelector('.error');
  errorDiv.innerText = '';
  input.classList.add('success');
  input.classList.remove('error');
};

// Email validation function
function validateEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@dream11\.com$/;
  return re.test(email);
}

// Due date validation function
function validateDueDate(dueDateValue) {
  const today = new Date();
  const dueDate = new Date(dueDateValue);
  return Number(dueDate) >= Number(today);
}

// location validation function
async function validateCity(locateValue) {
  try {
    // Fetch cities based on the input
    const response = await fetch(URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    //check if data has city name ?
    const validCities = data.map(city => city.title.toLowerCase().trim());
    // Check if the provided location exists in the list of valid cities
    return validCities.includes(locateValue.toLowerCase().trim());
  } catch (error) {
    console.error('Fetch error:', error);
    return false;
  }
  
}


// Validate input function
async function validateInput() {
  const taskValue = task.value.trim();
  const assigneeValue = assignee.value.trim();
  const dueDateValue = dueDate.value.trim();
  const locateValue = locate.value.trim();

  let isValid = true;

  // Validation: task details
  if (taskValue === '') {
    setError(task, "Task Details Are Required!");
    isValid = false;
  } else {
    setSuccess(task);
  }

  // Validation: assignee details
  if (assigneeValue === '') {
    setError(assignee, "Assignee Details Are Required!");
    isValid = false;
  } else if (!validateEmail(assigneeValue)) {
    setError(assignee, "Assignee Details Are Invalid!");
    isValid = false;
  } else {
    setSuccess(assignee);
  }

  // Validation: due date details
  if (dueDateValue === '') {
    setError(dueDate, "Due Date is Required!");
    isValid = false;
  } else if (!validateDueDate(dueDateValue)) {
    setError(dueDate, "Due Date Already Passed!");
    isValid = false;
  } else {
    setSuccess(dueDate);
  }

  // Validation: location details
  if (locateValue === '') {
    setError(locate, "Location is Required!");
    isValid = false;
  } else if (! await validateCity(locateValue)) {
    setError(locate, "Location is Invalid!");
    isValid = false;
  } else {
    setSuccess(locate);
  }

  console.log(isValid);
  return isValid;
}

// Add task function
function addTask() {
  const taskObj = {
    "Task": task.value,
    "Assignee": assignee.value,
    "Due Date": dueDate.value,
    "location": locate.value
  };
  inProgressTaskArray.push(taskObj);
  renderTasks();
  saveTasks();
  // Reset form
  form.reset();
}

// Render tasks
function renderTasks() {
  renderInProgressTasks();
  renderCompletedTasks();
}

// Render in-progress tasks
function renderInProgressTasks() {
  // Sort tasks by due date
  inProgressTaskArray.sort((a, b) => new Date(a["Due Date"]) - new Date(b["Due Date"]));

  // Clear existing tasks
  const inProgressBody = inProgress.querySelector('tbody');
  inProgressBody.innerHTML = '';

  // Populate inProgress div
  inProgressTaskArray.forEach((task, index) => {
    const row = document.createElement('tr');
    for (let t in task) {
      const td = document.createElement('td');
      const textNode = document.createTextNode(task[t]);
      td.appendChild(textNode);
      row.appendChild(td);
    }

    // Create and append checkbox
    const checkTD = document.createElement('td');
    const inputTD = document.createElement('input');
    inputTD.type = 'checkbox';
    inputTD.className = 'input-checkbox';
    inputTD.dataset.index = `${index}`;
    checkTD.appendChild(inputTD);
    row.appendChild(checkTD);
    inProgressBody.appendChild(row);
  });

  // Add event listeners for checkboxes
  const checkboxes = document.querySelectorAll('.input-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const index = e.target.getAttribute('data-index');
      if (e.target.checked) {
        completeTask(parseInt(index));
      }
    });
  });
}

// Complete task function
function completeTask(index) {
  const completedTask = inProgressTaskArray.splice(index, 1)[0];
  completedTaskArray.push(completedTask);
  renderTasks();
  saveTasks();
}

// Render completed tasks
function renderCompletedTasks() {
  // Clear existing tasks
  const completedBody = completed.querySelector('tbody');
  completedBody.innerHTML = '';
  // Populate completed div
  completedTaskArray.forEach(task => {
    const row = document.createElement('tr');
    for (let t in task) {
      const td = document.createElement('td');
      // console.log(t);
      const textNode = document.createTextNode(task[t]);
      td.appendChild(textNode);
      row.appendChild(td);
    }
    completedBody.appendChild(row);
  });
}

// Save tasks to local storage
function saveTasks() {
  localStorage.setItem('inProgressTasks', JSON.stringify(inProgressTaskArray));
  localStorage.setItem('completedTasks', JSON.stringify(completedTaskArray));
}

// Load tasks from local storage
function loadTasks() {
  const savedInProgressTasks = localStorage.getItem('inProgressTasks');
  const savedCompletedTasks = localStorage.getItem('completedTasks');

  if (savedInProgressTasks) {
    inProgressTaskArray = JSON.parse(savedInProgressTasks);
  }

  if (savedCompletedTasks) {
    completedTaskArray = JSON.parse(savedCompletedTasks);
  }
}
