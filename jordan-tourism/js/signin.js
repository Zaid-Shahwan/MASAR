/* ==================================================
   MASAR AUTHENTICATION — FIREBASE
================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
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

    const password =
        document.getElementById("signUpPassword").value;

    const confirmPassword =
        document.getElementById("signUpConfirmPassword").value;


    /* Password match */

    if (password !== confirmPassword) {

        signUpError.textContent = "Passwords do not match.";
        signUpError.style.color = "#a23a2b";
        signUpError.style.display = "block";

        return;
    }


    /* Password length */

    if (password.length < 6) {

        signUpError.textContent =
            "Password must be at least 6 characters.";

        signUpError.style.color = "#a23a2b";
        signUpError.style.display = "block";

        return;
    }


    /* Name */

    if (!name) {

        signUpError.textContent =
            "Please enter your name.";

        signUpError.style.color = "#a23a2b";
        signUpError.style.display = "block";

        return;
    }


    const signUpButton =
        signUpForm.querySelector('button[type="submit"]');

    signUpButton.disabled = true;
    signUpButton.textContent = "Creating Account...";


    try {

        /*
         * Make sure Firebase stores the authentication
         * session locally in the browser.
         */

        await setPersistence(
            auth,
            browserLocalPersistence
        );


        /* Create account */

const userCredential =
    await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

const user = userCredential.user;


/* Save the user's name inside Firebase */

await updateProfile(user, {
    displayName: name
});


console.log("ACCOUNT CREATED:", user.email);
console.log("USER NAME:", user.displayName);


/* Save basic user information */

localStorage.setItem(
    "masar_current_user",
    JSON.stringify({
        name: name,
        email: user.email,
        uid: user.uid
    })
);

        signUpError.textContent =
            "Account created successfully. You can sign in now.";

        signUpError.style.color = "#6d7651";
        signUpError.style.display = "block";


        /* Switch to Sign In */

        signUpTab.classList.remove("is-active");
        signInTab.classList.add("is-active");

        signUpPanel.classList.remove("is-active");
        signInPanel.classList.add("is-active");


        document.getElementById("signInEmail").value = email;
        document.getElementById("signInPassword").value = "";


    } catch (error) {

        console.error("Firebase signup error:", error);

        switch (error.code) {

            case "auth/email-already-in-use":
                signUpError.textContent =
                    "This email is already registered. Please sign in instead.";
                break;

            case "auth/invalid-email":
                signUpError.textContent =
                    "Please enter a valid email address.";
                break;

            case "auth/weak-password":
                signUpError.textContent =
                    "Password must be at least 6 characters.";
                break;

            case "auth/network-request-failed":
                signUpError.textContent =
                    "Network error. Please check your internet connection.";
                break;

            case "auth/operation-not-allowed":
                signUpError.textContent =
                    "Email and password authentication is not enabled.";
                break;

            default:
                signUpError.textContent =
                    "Unable to create your account. Please try again.";
        }

        signUpError.style.color = "#a23a2b";
        signUpError.style.display = "block";

    } finally {

        signUpButton.disabled = false;
        signUpButton.textContent = "Create Account";
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

    const password =
        document.getElementById("signInPassword").value;


    const signInButton =
        signInForm.querySelector('button[type="submit"]');

    signInButton.disabled = true;
    signInButton.textContent = "Signing In...";


    try {

        /*
         * IMPORTANT:
         * Set Firebase persistence BEFORE signing in.
         */

        await setPersistence(
            auth,
            browserLocalPersistence
        );


        /* Sign in */

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;


        console.log("SIGNED IN USER:", user);
        console.log("SIGNED IN EMAIL:", user.email);


        /* Save login state */

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


        console.log("LOGIN SAVED SUCCESSFULLY");


        /* Go to Home */

        window.location.href = "index.html";


    } catch (error) {

        console.error("Firebase signin error:", error);

        switch (error.code) {

            case "auth/invalid-credential":
            case "auth/wrong-password":
            case "auth/user-not-found":

                signInError.textContent =
                    "Incorrect email or password.";

                break;

            case "auth/invalid-email":

                signInError.textContent =
                    "Please enter a valid email address.";

                break;

            case "auth/too-many-requests":

                signInError.textContent =
                    "Too many login attempts. Please try again later.";

                break;

            case "auth/network-request-failed":

                signInError.textContent =
                    "Network error. Please check your internet connection.";

                break;

            default:

                signInError.textContent =
                    "Unable to sign in. Please check your email and password.";
        }

        signInError.style.color = "#a23a2b";
        signInError.style.display = "block";


    } finally {

        signInButton.disabled = false;
        signInButton.textContent = "Sign In";
    }

});