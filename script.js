const listsContainer = document.querySelector("[data-lists]");
const newListForm = document.querySelector("[data-new-list-form]");
const newListInput = document.querySelector("[data-new-list-input]");
const deleteListButton = document.querySelector("[data-delete-list-button]");
const listDisplayContainer = document.querySelector(
  "[data-list-display-container]"
);
const listTitleElement = document.querySelector("[data-list-title]");
const listCountElement = document.querySelector("[data-list-count]");
const tasksContainer = document.querySelector("[data-tasks]");
const taskTemplate = document.getElementById("task-template");
const newTaskForm = document.querySelector("[data-new-task-form]");
const newTaskInput = document.querySelector("[data-new-task-input]");
const clearCompleteTasksButton = document.querySelector(
  "[data-clear-complete-task-button]"
);

//Local sorage Seceltors..................................
const LOCAL_STORAGE_LIST_KEY = "task.lists";
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = "task.lselectedListId";

let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);

//functions.//////////////////////////////////////////////////////////////////////////////////////////

// ivedus info sukuriamas naujas objektas su unikaliu ID
function createList(name) {
  return {
    id: Date.now().toString(),
    name: name,
    tasks: [],
  };
}

//ivedus uzduoti sukuriamas objetkas su parametrais
function createTask(name) {
  return {
    id: Date.now().toString(),
    name: name,
    complete: false,
  };
}

// kartu kvieciamos abu funkcijos
function saveAndRender() {
  save();
  render();
}

// ivesta info pirmiausiai issaugojama localstorage
function save() {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
}

//Ppopulate my list with info
function render() {
  clearElement(listsContainer);
  renderLists();

  // surandamas pasirinkto darbu saraso pagal id, kuris pasirinktas sarasas
  const selectedList = lists.find((list) => list.id === selectedListId);
  // jeigu niekas nepasirinkta, nerodomas darbu sarasas
  if (selectedListId == null) {
    listDisplayContainer.style.display = "none";
    // jeigu pasirinkta rodomas sarasas darbu
  } else {
    listDisplayContainer.style.display = "";
    // tada is pasrininkto saraso paimamas pavadinimas ir rodomas
    listTitleElement.innerHTML = selectedList.name;
    renderTaskCount(selectedList);
    clearElement(tasksContainer);
    renderTasks(selectedList);
  }
}

function renderTasks(selectedList) {
  // kiekvienam gaunamam saraui sukuriamas atskiras tamplte
  selectedList.tasks.forEach((task) => {
    const taskElement = document.importNode(taskTemplate.content, true);
    const checkBox = taskElement.querySelector("input");
    checkBox.id = task.id;
    checkBox.checked = task.complete;
    const label = taskElement.querySelector("label");
    label.htmlFor = task.id;
    label.append(task.name);
    tasksContainer.appendChild(taskElement);
  });
}

function renderTaskCount(selectedList) {
  // pasirinktos uzduoties objekte ieskoma, kiek yra neuzbaigtu uzduociu
  const incopleteTasks = selectedList.tasks.filter(
    (task) => !task.complete
  ).length;

  const taskString = incopleteTasks === 1 ? "task" : "tasks";
  listCountElement.innerText = `${incopleteTasks} ${taskString} remaining`;
}

// gavus is local storage nauja sarasa kiekvienas naujas elementas sukuriamas ir rodomas html
function renderLists() {
  lists.forEach((list) => {
    const listElement = document.createElement("li");
    listElement.dataset.listId = list.id;
    listElement.classList.add("list-name");
    listElement.innerText = list.name;

    if (list.id === selectedListId) {
      listElement.classList.add("active-list");
    }
    listsContainer.appendChild(listElement);
  });
}

// Patikrina ar yra elementas koks nors sarase, ir jei taip, ji istrina
function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

//EVENT LISTINERS////////////////////////////////////////////////////////////////////////

listsContainer.addEventListener("click", (e) => {
  //patikrina ar clikc atliktas ant li elemento
  if (e.target.tagName.toLowerCase() === "li") {
    // gaunamas id ant kurio LI uzklikinta
    selectedListId = e.target.dataset.listId;

    //isaugojama ant kurio elemento buvo paspauta
    saveAndRender();
  }
});

tasksContainer.addEventListener("click", (e) => {
  // ziurima ar pasirinktas yra input elementas
  if (e.target.tagName.toLowerCase() === "input") {
    // surandama kuris listas pasirinktas pagal id
    const selectedList = lists.find((list) => list.id === selectedListId);
    // surandama kokia pasirinkta uzduotis is pasirinkto listo buvo
    const selectedTask = selectedList.tasks.find(
      (task) => task.id === e.target.id
    );
    // ir tada ji pazymima kaip atlikta
    selectedTask.complete = e.target.checked;
    save();
    renderTaskCount(selectedList);
  }
});

clearCompleteTasksButton.addEventListener("click", (e) => {
  // pirmiausiai gaunamas pasirinktas sarasas
  const selectedList = lists.find((list) => list.id === selectedListId);
  // tada is pasirinkto saraso isfiltruojamos is paliekamos tik neuzbaigtos zuduotys
  selectedList.tasks = selectedList.tasks.filter((task) => !task.complete);
  saveAndRender();
});

// Grazinamas listas isfiltravus ta, kuris buvo pasirinktas
deleteListButton.addEventListener("click", (e) => {
  //isfiltruojama kad gautas sarase nebutu pasirinkto elemento
  lists = lists.filter((list) => list.id !== selectedListId);
  // pasirinktas elementas istrinamas
  selectedListId = null;

  // atnaujinama info visus
  saveAndRender();
});

newListForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //gaunama reiksme ivesta
  const listName = newListInput.value;
  //tikrinama ar tikrai buvo ivesta reiskme
  if (listName == null || listName === "") return;
  // ikeliamas elementas
  const list = createList(listName);
  // isvalomas inoput
  newListInput.value = null;
  // ikeliamas nauja reiksme i lists objeta
  lists.push(list);
  //rodomas atnaujintas listas
  saveAndRender();
});

newTaskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //gaunama reiksme ivesta
  const taskName = newTaskInput.value;
  //tikrinama ar tikrai buvo ivesta reiskme
  if (taskName == null || taskName === "") return;
  // ikeliamas elementas
  const task = createTask(taskName);
  // isvalomas inoput
  newTaskInput.value = null;
  // surandamas kuris listas buvo pasirinktas
  const selectedList = lists.find((list) => list.id === selectedListId);
  // irb tada i jo uzduotis ikeliamos naujos uzduotys
  selectedList.tasks.push(task);
  //rodomas atnaujintas listas
  saveAndRender();
});

render();
