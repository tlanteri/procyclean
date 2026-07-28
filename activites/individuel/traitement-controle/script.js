const situationScreen = document.querySelector("#situation-screen");
const correctionScreen = document.querySelector("#correction-screen");
const reflexesScreen = document.querySelector("#reflexes-screen");
function showOnly(screen) {
  [situationScreen, correctionScreen, reflexesScreen]
    .forEach((item) => item.hidden = item !== screen);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
document.querySelector("#situation-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const answer = new FormData(event.currentTarget).get("answer");
  const correct = answer === "professional-check";
  document.querySelector("#correction-title").textContent =
    correct ? "Bonne décision !" : "Cette décision doit être reconsidérée";
  showOnly(correctionScreen);
});
document.querySelector("#show-reflexes").addEventListener("click", () =>
  showOnly(reflexesScreen));
document.documentElement.dataset.individualTreatmentReady = "true";
