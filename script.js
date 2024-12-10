const buttons = document.querySelectorAll(".todo-app__button");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    buttons.forEach((btn) => btn.classList.remove("todo-app__button_active"));

    button.classList.add("todo-app__button_active");
  });
});
