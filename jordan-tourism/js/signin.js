
/* ==================================================
   MASAR AUTHENTICATION — FIREBASE
================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


/* ==================================================
   FIREBASE CONFIG
================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyBLi9GZ9I-yARpthtf2zVrcugBxLlUwXSU",
  authDomain: "masar-bb6bb.firebaseapp.com",
  databaseURL: "https://masar-bb6bb-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "masar-bb6bb",
  storageBucket: "masar-bb6bb.firebasestorage.app",
  messagingSenderId: "525831043288",
  appId: "1:525831043288:web:531ac5150c0cea9c5a7fad",
  measurementId: "G-1YV5H3LZ7C"
};


/* ==================================================
   INITIALIZE FIREBASE
================================================== */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


/* ==================================================
   ELEMENTS
================================================== */

const signInTab = document.getElementById("signInTab");
const signUpTab = document.getElementById("signUpTab");

const signInPanel = document.getElementById("signInPanel");
const signUpPanel = document.getElementById("signUpPanel");

const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");

const signInError = document.getElementById("signInError");
const signUpError = document.getElementById("signUpError");


/* ==================================================
   SWITCH TO SIGN IN
================================================== */

signInTab.addEventListener("click", function () {

    signInTab.classList.add("is-active");
    signUpTab.classList.remove("is-active");

    signInPanel.classList.add("is-active");
    signUpPanel.classList.remove("is-active");

    signInError.style.display = "none";
    signUpError.style.display = "none";
});


/* ==================================================
   SWITCH TO SIGN UP
================================================== */

signUpTab.addEventListener("click", function () {

    signUpTab.classList.add("is-active");
    signInTab.classList.remove("is-active");

    signUpPanel.classList.add("is-active");
    signInPanel.classList.remove("is-active");

    signInError.style.display = "none";
    signUpError.style.display = "none";
});


/* ==================================================
   FIREBASE ERROR MESSAGES
================================================== */

function getFirebaseErrorMessage(error) {

    switch (error.code) {

        case "auth/email-already-in-use":
            return "This email is already registered.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/weak-password":
            return "Password must be at least 6 characters.";

        case "auth/user-not-found":
            return "No account found with this email.";

        case "auth/wrong-password":
            return "Incorrect email or password.";

        case "auth/invalid-credential":
    return "The email or password is incorrect. Please check your details and try again.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";

        default:
            console.error("Firebase error:", error);
            return "Something went wrong. Please try again.";
    }
}


/* ==================================================
   SIGN UP
================================================== */

signUpForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    signUpError.style.display = "none";

    const name = document
        .getElementById("signUpName")
        .value
        .trim();

    const email = document
        .getElementById("signUpEmail")
        .value
        .trim()
        .toLowerCase();

    const password = document
        .getElementById("signUpPassword")
        .value;

    const confirmPassword = document
        .getElementById("signUpConfirmPassword")
        .value;


    /* Check password */

    if (password !== confirmPassword) {

        signUpError.textContent =
            "Passwords do not match.";

        signUpError.style.color = "#a23a2b";
        signUpError.style.display = "block";

        return;
    }


    /* Check password length */

    if (password.length < 6) {

        signUpError.textContent =
            "Password must be at least 6 characters.";

        signUpError.style.color = "#a23a2b";
        signUpError.style.display = "block";

        return;
    }


    /* Check name */

    if (!name) {

        signUpError.textContent =
            "Please enter your name.";

        signUpError.style.color = "#a23a2b";
        signUpError.style.display = "block";

        return;
    }


    /* Disable button while creating account */

    const signUpButton =
        signUpForm.querySelector('button[type="submit"]');

    signUpButton.disabled = true;
    signUpButton.textContent = "Creating Account...";


    try {

        /* Create Firebase account */

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user = userCredential.user;


        /*
         * Firebase Authentication stores:
         * - Email
         * - Password securely
         * - UID
         *
         * The name is not stored automatically.
         *
         * We store the display name locally for the UI.
         */

        localStorage.setItem(
            "masar_current_user",
            JSON.stringify({
                name: name,
                email: user.email,
                uid: user.uid
            })
        );


        /* Account created successfully */

        signUpError.textContent =
            "Account created successfully. You can sign in now.";

        signUpError.style.color = "#6d7651";
        signUpError.style.display = "block";


        /* Switch to Sign In */

        signUpTab.classList.remove("is-active");
        signInTab.classList.add("is-active");

        signUpPanel.classList.remove("is-active");
        signInPanel.classList.add("is-active");


        /* Put email into Sign In */

        document.getElementById("signInEmail").value = email;

        document.getElementById("signInPassword").value = "";


    } catch (error) {

    console.error("Firebase signup error:", error);

    signUpError.textContent =
        error.message;

    signUpError.style.color = "#a23a2b";
    signUpError.style.display = "block";

}

});


/* ==================================================
   SIGN IN
================================================== */

signInForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    signInError.style.display = "none";

    const email = document
        .getElementById("signInEmail")
        .value
        .trim()
        .toLowerCase();

    const password = document
        .getElementById("signInPassword")
        .value;


    /* Disable button while signing in */

    const signInButton =
        signInForm.querySelector('button[type="submit"]');

    signInButton.disabled = true;
    signInButton.textContent = "Signing In...";


    try {

        /* Sign in with Firebase */

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user = userCredential.user;


        /*
         * Firebase keeps the authentication session.
         *
         * We only store basic display information locally.
         * The password is NEVER stored in localStorage.
         */

        localStorage.setItem(
            "masar_logged_in",
            "true"
        );

        localStorage.setItem(
            "masar_current_user",
            JSON.stringify({
                name: user.displayName || "",
                email: user.email,
                uid: user.uid
            })
        );


        /* Go back to Home */

        window.location.href = "index.html";


    } catch (error) {

    console.error("Firebase signin error:", error);

    signInError.textContent =
        error.message;

    signInError.style.color = "#a23a2b";
    signInError.style.display = "block";

} finally {

    signInButton.disabled = false;
    signInButton.textContent = "Sign In";

}

});
