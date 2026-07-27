import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCX6Y_ImG1YNEMY19pSSl4FxaHKqo72B3s",
  authDomain: "activites-procyclean.firebaseapp.com",
  databaseURL:
    "https://activites-procyclean-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "activites-procyclean",
  storageBucket: "activites-procyclean.firebasestorage.app",
  messagingSenderId: "900663423725",
  appId: "1:900663423725:web:bc51501dcf653bfd1052e4"
};

const EDUCATOR_EMAIL = "prevention.dopage@ffc.fr";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const openLoginButton = document.querySelector("#open-educator-login");
const closeLoginButton = document.querySelector("#close-educator-login");
const loginPanel = document.querySelector("#educator-login-panel");
const library = document.querySelector("#educator-library");
const loginForm = document.querySelector("#educator-login-form");
const passwordInput = document.querySelector("#educator-password");
const loginButton = document.querySelector("#educator-login-button");
const loginMessage = document.querySelector("#educator-login-message");
const logoutButton = document.querySelector("#educator-logout-button");
const togglePreviewButton = document.querySelector(
  "#toggle-preview-button"
);
const previewContainer = document.querySelector("#preview-container");
const resourcePreview = document.querySelector("#resource-preview");

function userIsEducator(user) {
  return Boolean(
    user &&
    !user.isAnonymous &&
    user.email?.toLowerCase() === EDUCATOR_EMAIL.toLowerCase()
  );
}

function showLibrary() {
  loginPanel.hidden = true;
  library.hidden = false;
  if (!resourcePreview.src) {
    resourcePreview.src = resourcePreview.dataset.src;
  }
  library.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showLogin() {
  library.hidden = true;
  loginPanel.hidden = false;
  loginMessage.textContent = "";
  passwordInput.focus();
  loginPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

openLoginButton.addEventListener("click", () => {
  if (userIsEducator(auth.currentUser)) {
    showLibrary();
  } else {
    showLogin();
  }
});

closeLoginButton.addEventListener("click", () => {
  loginPanel.hidden = true;
  loginForm.reset();
  loginMessage.textContent = "";
  openLoginButton.focus();
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const confidentialCode = passwordInput.value.trim();
  loginButton.disabled = true;
  loginButton.textContent = "Connexion…";
  loginMessage.textContent = "";

  try {
    await signInWithEmailAndPassword(
      auth,
      EDUCATOR_EMAIL,
      confidentialCode
    );
    loginForm.reset();
    showLibrary();
  } catch (error) {
    console.error("Connexion éducateur refusée :", error);
    loginMessage.textContent = "Le code confidentiel est incorrect.";
    passwordInput.select();
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Se connecter";
  }
});

logoutButton.addEventListener("click", async () => {
  await signOut(auth);
  resourcePreview.removeAttribute("src");
  previewContainer.hidden = true;
  togglePreviewButton.textContent = "Prévisualiser le document";
  library.hidden = true;
  openLoginButton.focus();
});

togglePreviewButton.addEventListener("click", () => {
  const willOpen = previewContainer.hidden;
  previewContainer.hidden = !willOpen;
  togglePreviewButton.textContent = willOpen
    ? "Masquer la prévisualisation"
    : "Prévisualiser le document";

  if (willOpen) {
    previewContainer.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
});

onAuthStateChanged(auth, (user) => {
  if (!userIsEducator(user)) {
    library.hidden = true;
  }
});
