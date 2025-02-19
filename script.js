"use strict";

class TodoList {
  constructor() {
    this.header = document.querySelector(".todo-app__header");
    this.toggleAllTasksButton = this.header.querySelector(
      ".todo-app__button-toggle-all-tasks"
    );
    this.inputField = this.header.querySelector(".todo-app__input");

    this.list = document.querySelector(".todo-app__list");
    this.todos = [];

    this.footer = document.querySelector(".todo-app__footer");
    this.counter = this.footer.querySelector(".todo-app__count-active-tasks");
    this.buttons = {
      all: this.footer.querySelector(".todo-app__button_show-all"),
      active: this.footer.querySelector(".todo-app__button_show-active"),
      completed: this.footer.querySelector(".todo-app__button_show-completed"),
    };
    this.clearCompletedButton = this.footer.querySelector(
      ".todo-app__button_clear-completed"
    );

    this.init();
  }

  init() {
    this.loadFromLocalStorage();

    window.addEventListener("load", () => {
      this.inputField.focus();
      this.header.classList.add("focus");
    });

    this.inputField.addEventListener("focus", () => {
      this.header.classList.add("focus");
    });

    this.inputField.addEventListener("blur", () => {
      this.header.classList.remove("focus");
    });

    this.inputField.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && this.isInputValid()) {
        this.addTodo();
      } else if (event.key === "Tab") {
        event.preventDefault();
        this.toggleAllTasksButton.focus();
      }
    });

    this.inputField.addEventListener("blur", () => {
      if (this.isInputValid()) {
        this.addTodo();
      }
    });

    this.toggleAllTasksButton.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        event.preventDefault();
        this.list.querySelector(".todo-app__item").focus();
      }
    });

    this.toggleAllTasksButton.addEventListener("click", () => {
      this.toggleStateALLTodoElement();
    });

    this.setupFilterButtons();

    this.clearCompletedButton.addEventListener("click", () => {
      this.clearCompletedTodos();
    });
  }

  isInputValid() {
    return this.inputField.value.trim();
  }

  updateActiveTaskCount() {
    const countActiveTask = this.todos.filter(
      (todoItem) => !todoItem.checkbox.checked
    ).length;

    const counterText = countActiveTask === 1 ? "item left" : "items left";

    this.counter.textContent = `${countActiveTask} ${counterText}`;
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
      switch (filter) {
        case "all":
          todoItem.element.classList.remove("hidden");
          break;
        case "active":
          todoItem.element.classList.toggle(
            "hidden",
            todoItem.checkbox.checked
          );
          break;
        case "completed":
          todoItem.element.classList.toggle(
            "hidden",
            !todoItem.checkbox.checked
          );
          break;
      }
    });
  }

  clearCompletedTodos() {
    this.todos
      .filter((todoItem) => todoItem.checkbox.checked)
      .forEach((todoItem) => todoItem.removeTodoElement());

    this.updateActiveTaskCount();
    this.updateVisibilityClearCompletedButton();
  }

  updateVisibilityToggleAllTasksButton() {
    this.toggleAllTasksButton.classList.toggle("visible", this.todos.length);
  }

  updateVisibilityFooterTodo() {
    this.footer.classList.toggle("visible", this.todos.length);
  }

  updateVisibilityClearCompletedButton() {
    const hasCompletedTasks = this.todos.some((todo) => todo.checkbox.checked);
    this.clearCompletedButton.classList.toggle("visible", hasCompletedTasks);
  }

  addTodo() {
    const todoItem = new TodoItem(this.inputField);

    this.todos.push(todoItem);
    todoItem.addTodoElement(this.list);

    this.updateVisibilityToggleAllTasksButton();
    this.updateVisibilityFooterTodo();
    this.updateToggleAllButtonState();
    this.updateActiveTaskCount();

    TodoList.clearInputTodo(this.inputField);
    this.filterTodos(this.getCurrentFilter());

    this.saveToLocalStorage();
  }

  toggleStateALLTodoElement() {
    const allCompleted = this.isAllTasksCompleted();

    this.todos.forEach((todoItem) => {
      if (todoItem.checkbox.checked !== !allCompleted) {
        todoItem.toggleStateTodoElement(
          todoItem.checkbox,
          todoItem.circle,
          todoItem.path,
          todoItem.label
        );
      }
    });

    this.updateToggleAllButtonState();
  }

  isAllTasksCompleted() {
    return this.todos.every((todoItem) => todoItem.checkbox.checked);
  }

  updateToggleAllButtonState() {
    this.toggleAllTasksButton.classList.toggle(
      "active",
      this.isAllTasksCompleted()
    );
    localStorage.setItem(
      "toggleAllActive",
      this.toggleAllTasksButton.classList.contains("active")
    );
  }

  static clearInputTodo(inputField) {
    inputField.value = "";
  }

  saveToLocalStorage() {
    const todosData = this.todos.map((todo) => ({
      text: todo.text,
      completed: todo.checkbox.checked,
    }));

    localStorage.setItem("todos", JSON.stringify(todosData));
  }

  loadFromLocalStorage() {
    const savedTodos = JSON.parse(localStorage.getItem("todos")) || [];

    savedTodos.forEach((todoData) => {
      const todoItem = new TodoItem(this.inputField, todoData);

      todoItem.checkbox.checked = todoData.completed;

      if (todoItem.checkbox.checked) {
        todoItem.circle.classList.add("completed");
        todoItem.path.classList.add("completed");
        todoItem.label.classList.add("completed");
      }

      this.todos.push(todoItem);
      todoItem.addTodoElement(this.list);
    });

    this.updateVisibilityFooterTodo();
    this.updateActiveTaskCount();
    this.updateVisibilityToggleAllTasksButton();
    this.updateVisibilityClearCompletedButton();

    if (this.todos.length === 0) {
      this.toggleAllTasksButton.classList.remove("active");
      localStorage.removeItem("toggleAllActive");
    } else {
      const savedToggleState =
        localStorage.getItem("toggleAllActive") === "true";
      this.toggleAllTasksButton.classList.toggle("active", savedToggleState);
    }
  }
}

class TodoItem {
  constructor(inputTodo, savedData = null) {
    if (savedData) {
      this.text = savedData.text;
    } else {
      this.text = inputTodo.value;
    }

    this.inputField = inputTodo;
    this.element = this.createTodoElement();
    this.init();
  }

  createTodoElement() {
    this.li = document.createElement("li");
    this.li.classList.add("todo-app__item");
    this.li.setAttribute("tabindex", "0");

    this.checkbox = document.createElement("input");
    this.checkbox.type = "checkbox";
    this.checkbox.classList.add("todo-app__checkbox");

    this.customCheckbox = document.createElement("span");
    this.customCheckbox.classList.add("todo-app__custom-checkbox");

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "-10 -18 100 135");

    this.circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    this.circle.classList.add("todo-app__custom-checkbox-circle");
    this.circle.setAttribute("cx", "50");
    this.circle.setAttribute("cy", "50");
    this.circle.setAttribute("r", "50");

    this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.path.classList.add("todo-app__custom-checkbox-path");
    this.path.setAttribute("d", "M72 25L42 71 27 56l-4 4 20 20 34-52z");

    this.label = document.createElement("label");
    this.label.classList.add("todo-app__task-text");
    this.label.appendChild(document.createTextNode(this.text));

    this.input = document.createElement("input");
    this.input.classList.add("todo-app__task-text", "hidden");
    this.input.value = this.text;

    this.buttonClear = document.createElement("button");
    this.buttonClear.classList.add("todo-app__button-clear");
    this.buttonClear.setAttribute("aria-label", "Delete a task");
    this.buttonClear.setAttribute("tabindex", "-1");

    svg.appendChild(this.circle);
    svg.appendChild(this.path);
    this.customCheckbox.appendChild(svg);
    this.li.appendChild(this.checkbox);
    this.li.appendChild(this.customCheckbox);
    this.li.appendChild(this.label);
    this.li.appendChild(this.input);
    this.li.appendChild(this.buttonClear);

    return this.li;
  }

  init() {
    const updateButtonTabIndex = () => {
      if (this.element.classList.contains("active")) {
        this.buttonClear.setAttribute("tabindex", "0");
      } else {
        this.buttonClear.setAttribute("tabindex", "-1");
      }
    };

    this.element.addEventListener("click", (event) => {
      if (!this.customCheckbox.contains(event.target)) {
        this.element.classList.add("active");
        this.element.classList.remove("focus");
      }
    });

    this.customCheckbox.addEventListener("click", () => {
      this.element.classList.add("focus");

      this.toggleStateTodoElement(
        this.checkbox,
        this.circle,
        this.path,
        this.label
      );
    });

    this.buttonClear.addEventListener("click", (event) => {
      event.stopPropagation();

      this.buttonClear.classList.add("active");

      setTimeout(() => {
        this.removeTodoElement();
      }, 250);
    });

    this.element.addEventListener("mouseenter", () => {
      this.element.classList.add("active");

      updateButtonTabIndex();
    });

    this.element.addEventListener("mouseleave", () => {
      this.element.classList.remove("active");

      updateButtonTabIndex();
    });

    this.element.addEventListener("blur", (event) => {
      if (event.relatedTarget === this.buttonClear) {
        return;
      }

      this.element.classList.remove("active", "focus");

      updateButtonTabIndex();
    });

    this.label.addEventListener("dblclick", () => {
      this.editTaskText(this.input, this.label);
    });
  }

  addTodoElement(list) {
    list.insertBefore(this.element, list.firstChild);
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

    todoList.updateVisibilityFooterTodo();
    todoList.updateVisibilityToggleAllTasksButton();
    todoList.updateVisibilityClearCompletedButton();
    todoList.updateActiveTaskCount();

    todoList.saveToLocalStorage();
  }

  editTaskText(input, label) {
    this.element.classList.add("editing");

    label.classList.add("hidden");
    input.classList.remove("hidden");

    input.focus();

    input.addEventListener("blur", () => {
      this.saveTaskEdit(input, label);
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.saveTaskEdit(input, label);
      }
    });
  }

  saveTaskEdit(input, label) {
    const newText = input.value.trim();

    if (newText) {
      this.text = newText;
      label.textContent = newText;

      input.classList.add("hidden");
      label.classList.remove("hidden");
      this.element.classList.remove("editing");

      todoList.updateActiveTaskCount();
      todoList.updateVisibilityFooterTodo();
    } else {
      setTimeout(() => {
        if (this.element && this.element.parentNode) {
          this.removeTodoElement();
        }
      }, 0);
    }
  }
}

const todoList = new TodoList();
