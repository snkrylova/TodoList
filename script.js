"use strict";

const listTodo = document.querySelector(".todo-app__list");
const headerTodoList = document.querySelector(".todo-app__header");
const toggleAllTasksButton = document.querySelector(
  ".todo-app__button-toggle-all-tasks"
);
const inputTodo = document.querySelector(".todo-app__input");
const todoItems = listTodo.querySelectorAll(".todo-app__item");
const footer = document.querySelector(".todo-app__footer");
const clearCompletedButton = footer.querySelector(
  ".todo-app__button_clear-completed"
);

class TodoList {
  constructor(list, inputField) {
    this.list = list;
    this.inputField = inputField;
    this.todos = [];

    this.buttons = {
      all: footer.querySelector(".todo-app__button_show-all"),
      active: footer.querySelector(".todo-app__button_show-active"),
      completed: footer.querySelector(".todo-app__button_show-completed"),
    };

    this.init();
  }

  init() {
    this.loadFromLocalStorage();

    this.inputField.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && this.isInputValid()) {
        this.addTodo();
      }

      if (event.key === "Tab") {
        event.preventDefault();
        toggleAllTasksButton.focus();
      }
    });

    toggleAllTasksButton.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        event.preventDefault();
        this.list.querySelector(".todo-app__item").focus();
      }
    });

    this.inputField.addEventListener("blur", () => {
      if (this.isInputValid()) {
        this.addTodo();
      }
    });

    toggleAllTasksButton.addEventListener("click", () => {
      this.toggleStateALLTodoElement();
    });

    window.addEventListener("load", () => {
      this.inputField.focus();
      headerTodoList.classList.add("focus");
    });

    this.inputField.addEventListener("focus", () => {
      headerTodoList.classList.add("focus");
    });

    this.inputField.addEventListener("blur", () => {
      headerTodoList.classList.remove("focus");
    });

    this.setupFilterButtons();

    clearCompletedButton.addEventListener("click", () => {
      this.clearCompletedTodos();
    });
  }

  setupFilterButtons() {
    Object.keys(this.buttons).forEach((filter) => {
      this.buttons[filter].addEventListener("click", () => {
        this.filterTodos(filter);
      });
    });

    this.buttons.all.classList.add("active");
  }

  getCurrentFilter() {
    return (
      Object.keys(this.buttons).find((filter) =>
        this.buttons[filter].classList.contains("active")
      ) || "all"
    );
  }

  filterTodos(filter) {
    Object.values(this.buttons).forEach((button) =>
      button.classList.remove("active")
    );

    this.buttons[filter].classList.add("active");

    this.todos.forEach((todoItem) => {
      const checkbox = todoItem.element.querySelector(".todo-app__checkbox");

      switch (filter) {
        case "all":
          todoItem.element.classList.remove("hidden");
          break;
        case "active":
          todoItem.element.classList.toggle("hidden", checkbox.checked);
          break;
        case "completed":
          todoItem.element.classList.toggle("hidden", !checkbox.checked);
          break;
      }
    });
  }

  clearCompletedTodos() {
    this.todos
      .filter(
        (todoItem) =>
          todoItem.element.querySelector(".todo-app__checkbox").checked
      )
      .forEach((todoItem) => todoItem.removeTodoElement());

    this.updateActiveTaskCount();
    this.updateVisibilityClearCompletedButton();
  }

  updateActiveTaskCount() {
    const countActiveTask = this.todos.filter(
      (todoItem) =>
        !todoItem.element.querySelector(".todo-app__checkbox").checked
    ).length;
    const counter = document.querySelector(".todo-app__count-active-tasks");

    const counterText = countActiveTask === 1 ? "item left" : "items left";

    counter.textContent = `${countActiveTask} ${counterText}`;
  }

  isInputValid() {
    return this.inputField.value.trim();
  }

  updateVisibilityToggleAllTasksButton() {
    toggleAllTasksButton.classList.toggle("visible", this.todos.length);
  }

  updateFooterTodoVisibility() {
    footer.classList.toggle("visible", this.todos.length);
  }

  updateVisibilityClearCompletedButton() {
    const hasCompletedTasks = this.todos.some(
      (todo) => todo.element.querySelector(".todo-app__checkbox").checked
    );
    clearCompletedButton.classList.toggle("visible", hasCompletedTasks);
  }

  addTodo() {
    const todoItem = new TodoItem(this.inputField);

    this.todos.push(todoItem);
    todoItem.addTodoElement(this.list);
    this.updateVisibilityToggleAllTasksButton();
    this.updateFooterTodoVisibility();
    this.updateToggleAllButtonState();
    this.updateActiveTaskCount();
    TodoList.clearInputTodo(this.inputField);
    this.filterTodos(this.getCurrentFilter());

    this.saveToLocalStorage();
  }

  toggleStateALLTodoElement() {
    const allCompleted = this.isAllTasksCompleted();

    this.todos.forEach((todoItem) => {
      const checkbox = todoItem.element.querySelector(".todo-app__checkbox");
      const circle = todoItem.element.querySelector(
        ".todo-app__custom-checkbox-circle"
      );
      const path = todoItem.element.querySelector(
        ".todo-app__custom-checkbox-path"
      );
      const label = todoItem.element.querySelector(".todo-app__task-text");

      if (checkbox.checked !== !allCompleted) {
        todoItem.toggleStateTodoElement(checkbox, circle, path, label);
      }
    });

    this.updateToggleAllButtonState();
  }

  isAllTasksCompleted() {
    return this.todos.every(
      (todoItem) =>
        todoItem.element.querySelector(".todo-app__checkbox").checked
    );
  }

  updateToggleAllButtonState() {
    toggleAllTasksButton.classList.toggle("active", this.isAllTasksCompleted());
    localStorage.setItem(
      "toggleAllActive",
      toggleAllTasksButton.classList.contains("active")
    );
  }

  static clearInputTodo(inputField) {
    inputField.value = "";
  }

  saveToLocalStorage() {
    const todosData = this.todos.map((todo) => ({
      text: todo.text,
      completed: todo.element.querySelector(".todo-app__checkbox").checked,
    }));

    localStorage.setItem("todos", JSON.stringify(todosData));
  }

  loadFromLocalStorage() {
    const savedTodos = JSON.parse(localStorage.getItem("todos")) || [];

    savedTodos.forEach((todoData) => {
      const todoItem = new TodoItem(this.inputField);
      todoItem.text = todoData.text;

      todoItem.element = todoItem.createTodoElement();

      const checkbox = todoItem.element.querySelector(".todo-app__checkbox");
      const circle = todoItem.element.querySelector(
        ".todo-app__custom-checkbox-circle"
      );
      const path = todoItem.element.querySelector(
        ".todo-app__custom-checkbox-path"
      );
      const taskTextField = todoItem.element.querySelector(
        ".todo-app__task-text"
      );

      if (checkbox) checkbox.checked = todoData.completed;
      if (todoData.completed) {
        if (circle) circle.classList.add("completed");
        if (path) path.classList.add("completed");
        if (taskTextField) taskTextField.classList.add("completed");
      }

      this.todos.push(todoItem);
      todoItem.addTodoElement(this.list);
    });

    this.updateFooterTodoVisibility();
    this.updateActiveTaskCount();
    this.updateVisibilityToggleAllTasksButton();
    this.updateVisibilityClearCompletedButton();

    if (this.todos.length === 0) {
      toggleAllTasksButton.classList.remove("active");
      localStorage.removeItem("toggleAllActive");
    } else {
      const savedToggleState =
        localStorage.getItem("toggleAllActive") === "true";
      toggleAllTasksButton.classList.toggle("active", savedToggleState);
    }
  }
}

class TodoItem {
  static currentFocusedElement = null;

  constructor(inputTodo) {
    this.text = inputTodo.value;
    this.inputField = inputTodo;
    this.element = this.createTodoElement();
  }

  createTodoElement() {
    const li = document.createElement("li");
    li.classList.add("todo-app__item");
    li.setAttribute("tabindex", "0");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("todo-app__checkbox");

    const customCheckbox = document.createElement("span");
    customCheckbox.classList.add("todo-app__custom-checkbox");

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "-10 -18 100 135");

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.classList.add("todo-app__custom-checkbox-circle");
    circle.setAttribute("cx", "50");
    circle.setAttribute("cy", "50");
    circle.setAttribute("r", "50");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.classList.add("todo-app__custom-checkbox-path");
    path.setAttribute("d", "M72 25L42 71 27 56l-4 4 20 20 34-52z");

    const label = document.createElement("label");
    label.classList.add("todo-app__task-text");
    label.appendChild(document.createTextNode(this.text));

    const input = document.createElement("input");
    input.classList.add("todo-app__task-text", "hidden");
    input.value = this.text;

    label.addEventListener("dblclick", () => {
      this.editTaskText(input, label);
    });

    const buttonClear = document.createElement("button");
    buttonClear.classList.add("todo-app__button_clear");
    buttonClear.setAttribute("aria-label", "Delete a task");
    buttonClear.setAttribute("tabindex", "-1");

    const updateButtonTabIndex = () => {
      if (li.classList.contains("active")) {
        buttonClear.setAttribute("tabindex", "0");
      } else {
        buttonClear.setAttribute("tabindex", "-1");
      }
    };

    svg.appendChild(circle);
    svg.appendChild(path);
    customCheckbox.appendChild(svg);
    li.appendChild(checkbox);
    li.appendChild(customCheckbox);
    li.appendChild(label);
    li.appendChild(input);
    li.appendChild(buttonClear);

    li.addEventListener("click", (event) => {
      if (!customCheckbox.contains(event.target)) {
        li.classList.add("active");
        li.classList.remove("focus");
      }
    });

    customCheckbox.addEventListener("click", () => {
      li.classList.add("focus");
      this.toggleStateTodoElement(checkbox, circle, path, label);
    });

    buttonClear.addEventListener("click", (event) => {
      event.stopPropagation();
      buttonClear.classList.add("active");

      setTimeout(() => {
        this.removeTodoElement();
      }, 250);
    });

    li.addEventListener("mouseenter", () => {
      li.classList.add("active");
      updateButtonTabIndex();
    });

    li.addEventListener("mouseleave", () => {
      li.classList.remove("active");
      updateButtonTabIndex();
    });

    li.addEventListener("blur", (event) => {
      if (event.relatedTarget === buttonClear) {
        return;
      }

      li.classList.remove("active", "focus");
      updateButtonTabIndex();
    });

    return li;
  }

  editTaskText(input, label) {
    const li = label.closest(".todo-app__item");
    li.classList.add("editing");

    label.classList.add("hidden");
    input.classList.remove("hidden");

    input.focus();

    input.addEventListener("blur", () => {
      this.saveTaskEdit(input, label);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.saveTaskEdit(input, label);
      }
    });
  }

  saveTaskEdit(input, label) {
    const li = input.closest(".todo-app__item");
    const newText = input.value.trim();

    if (newText) {
      this.text = newText;
      label.textContent = newText;

      input.classList.add("hidden");
      label.classList.remove("hidden");

      li.classList.remove("editing");

      label.addEventListener("dblclick", () => this.editTaskText(input, label));

      todoList.updateActiveTaskCount();
      todoList.updateFooterTodoVisibility();
    } else {
      this.removeTodoElement();
    }
  }

  addTodoElement(listTodo) {
    listTodo.insertBefore(this.element, listTodo.firstChild);
  }

  toggleStateTodoElement(checkbox, circle, path, taskTextField) {
    checkbox.checked = !checkbox.checked;

    circle.classList.toggle("completed", checkbox.checked);
    path.classList.toggle("completed", checkbox.checked);
    taskTextField.classList.toggle("completed", checkbox.checked);

    todoList.updateActiveTaskCount();
    todoList.updateVisibilityClearCompletedButton();
    todoList.updateToggleAllButtonState();
    todoList.filterTodos(todoList.getCurrentFilter());

    todoList.saveToLocalStorage();
  }

  removeTodoElement() {
    const index = todoList.todos.findIndex((todo) => todo === this);

    if (index !== -1) {
      todoList.todos.splice(index, 1);
    }

    this.element.remove();

    todoList.updateFooterTodoVisibility();
    todoList.updateVisibilityToggleAllTasksButton();
    todoList.updateVisibilityClearCompletedButton();
    todoList.updateActiveTaskCount();

    todoList.saveToLocalStorage();
  }
}

const todoList = new TodoList(listTodo, inputTodo);
