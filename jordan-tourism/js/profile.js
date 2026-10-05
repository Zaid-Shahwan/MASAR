/* ==================================================
   MASAR PROFILE — FIREBASE
================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

/* ==================================================
   FIREBASE CONFIG
================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyBLi9GZ9I-yARpthtf2zVrcugBxLlUwXSU",
  authDomain: "masar-bb6bb.firebaseapp.com",
  databaseURL:
    "https://masar-bb6bb-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "masar-bb6bb",
  storageBucket: "masar-bb6bb.firebasestorage.app",
  messagingSenderId: "525831043288",
  appId: "1:525831043288:web:531ac5150c0cea9c5a7fad",
  measurementId: "G-1YV5H3LZ7C",
};

/* ==================================================
   INITIALIZE FIREBASE
================================================== */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

/* ==================================================
   ELEMENTS
================================================== */

const profileAvatar = document.getElementById("profileAvatar");

const profileName = document.getElementById("profileName");

const profileEmail = document.getElementById("profileEmail");

const infoName = document.getElementById("infoName");

const infoEmail = document.getElementById("infoEmail");

const signOutButton = document.getElementById("signOutButton");

const changePasswordButton = document.getElementById("changePasswordButton");

const passwordMessage = document.getElementById("passwordMessage");

const passwordDisplay = document.getElementById("passwordDisplay");

const showPasswordButton = document.getElementById("showPasswordButton");

const passwordNote = document.getElementById("passwordNote");

const profileMessage = document.getElementById("profileMessage");

const savedDestinations = document.getElementById("savedDestinations");

const emptySaved = document.getElementById("emptySaved");

/* ==================================================
   SAVED DESTINATIONS
================================================== */

/* Favorites start empty. Experiences are added from the Save buttons
   on the Plan Your Trip page. */

/* ==================================================
   GET SAVED DESTINATIONS
================================================== */

function getSavedDestinations() {
  try {
    const saved = JSON.parse(localStorage.getItem("masar_saved_destinations"));

    if (Array.isArray(saved)) {
      return saved;
    }
  } catch (error) {
    console.error("Unable to read saved destinations:", error);
  }

  return [];
}

/* ==================================================
   SAVE DESTINATIONS
================================================== */

function saveDestinations(destinations) {
  localStorage.setItem(
    "masar_saved_destinations",
    JSON.stringify(destinations),
  );
}

/* ==================================================
   RENDER SAVED DESTINATIONS
================================================== */

function renderSavedDestinations() {
  const destinations = getSavedDestinations();

  savedDestinations.innerHTML = "";

  if (destinations.length === 0) {
    savedDestinations.style.display = "none";

    emptySaved.style.display = "block";

    return;
  }

  savedDestinations.style.display = "grid";

  emptySaved.style.display = "none";

  destinations.forEach((destination) => {
    const card = document.createElement("article");

    card.className = "saved-card";

    card.innerHTML = `

            <button
                type="button"
                class="remove-saved"
                data-id="${destination.id}"
                aria-label="Remove ${destination.name}"
            >
                ×
            </button>

            <img
                src="${destination.image}"
                alt="${destination.name}"
                loading="lazy"
            >

            <div class="saved-card-overlay">

                <h3>
                    ${destination.name}
                </h3>

                <p>
                    ${destination.description}
                </p>

            </div>

        `;

    savedDestinations.appendChild(card);
  });
}

/* ==================================================
   REMOVE SAVED DESTINATION
================================================== */

if (savedDestinations) {
  savedDestinations.addEventListener("click", (event) => {
    const button = event.target.closest(".remove-saved");

    if (!button) {
      return;
    }

    const destinationId = button.dataset.id;

    const destinations = getSavedDestinations().filter(
      (destination) => destination.id !== destinationId,
    );

    saveDestinations(destinations);

    renderSavedDestinations();
  });
}

/* ==================================================
   FIREBASE AUTH STATE
================================================== */

onAuthStateChanged(auth, (user) => {
  console.log("PROFILE FIREBASE USER:", user);

  /* ==================================================
       CHECK AUTHENTICATION
    ================================================== */

  if (!user) {
    console.log("PROFILE: NO USER FOUND");

    window.location.href = "signin.html";

    return;
  }

  /* ==================================================
       USER IS SIGNED IN
    ================================================== */

  console.log("PROFILE USER EMAIL:", user.email);
  console.log("PROFILE USER UID:", user.uid);

  /* ==================================================
       GET SAVED LOCAL USER
    ================================================== */

  let savedUser = {};

  try {
    savedUser = JSON.parse(localStorage.getItem("masar_current_user")) || {};
  } catch (error) {
    console.error("Unable to read saved user:", error);

    savedUser = {};
  }

  /* ==================================================
       USER NAME
    ================================================== */

  const name = user.displayName || savedUser.name || "MASAR Traveler";

  const email = user.email || "";

  /* ==================================================
       UPDATE PROFILE
    ================================================== */

  profileName.textContent = name;

  profileEmail.textContent = email;

  infoName.textContent = name;

  infoEmail.textContent = email;

  /* ==================================================
       AVATAR
    ================================================== */

  profileAvatar.textContent = name.charAt(0).toUpperCase();

  /* ==================================================
       LOAD SAVED DESTINATIONS
    ================================================== */

  renderSavedDestinations();
});

/* ==================================================
   SHOW PASSWORD
================================================== */

if (showPasswordButton) {
  showPasswordButton.addEventListener("click", () => {
    passwordMessage.textContent =
      "For your security, Firebase does not allow your original password to be viewed or recovered. You can change it using the button below.";

    passwordMessage.style.color = "#777";

    passwordMessage.style.display = "block";

    showPasswordButton.classList.add("active");

    showPasswordButton.setAttribute(
      "aria-label",
      "Password cannot be displayed",
    );

    showPasswordButton.setAttribute("title", "Password cannot be displayed");

    setTimeout(() => {
      showPasswordButton.classList.remove("active");

      showPasswordButton.setAttribute("aria-label", "Show password");

      showPasswordButton.setAttribute("title", "Show password");
    }, 1000);
  });
}

/* ==================================================
   CHANGE PASSWORD
================================================== */

changePasswordButton.addEventListener("click", async () => {
  const user = auth.currentUser;

  if (!user || !user.email) {
    passwordMessage.textContent = "Please sign in again.";

    passwordMessage.style.display = "block";

    return;
  }

  changePasswordButton.disabled = true;

  changePasswordButton.textContent = "Sending...";

  try {
    await sendPasswordResetEmail(auth, user.email);

    passwordMessage.textContent = `A password reset link has been sent to ${user.email}. Check your email.`;

    passwordMessage.style.color = "#6d7651";

    passwordMessage.style.display = "block";
  } catch (error) {
    console.error("Password reset error:", error);

    passwordMessage.textContent =
      "Unable to send the password reset email. Please try again.";

    passwordMessage.style.color = "#a23a2b";

    passwordMessage.style.display = "block";
  } finally {
    changePasswordButton.disabled = false;

    changePasswordButton.textContent = "Change Password";
  }
});

/* ==================================================
   SIGN OUT
================================================== */

signOutButton.addEventListener("click", async () => {
  signOutButton.disabled = true;

  signOutButton.textContent = "Signing Out...";

  try {
    await signOut(auth);

    localStorage.removeItem("masar_logged_in");

    localStorage.removeItem("masar_current_user");

    window.location.href = "signin.html";
  } catch (error) {
    console.error("Sign out error:", error);

    profileMessage.textContent = "Unable to sign out. Please try again.";

    profileMessage.style.display = "block";

    signOutButton.disabled = false;

    signOutButton.textContent = "Sign Out";
  }
});
