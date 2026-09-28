/* =========================
   MASAR AUTH
========================= */

document.addEventListener("DOMContentLoaded", function () {

    const signInTab = document.getElementById("signInTab");
    const signUpTab = document.getElementById("signUpTab");

    const signInPanel = document.getElementById("signInPanel");
    const signUpPanel = document.getElementById("signUpPanel");

    const signInForm = document.getElementById("signInForm");
    const signUpForm = document.getElementById("signUpForm");

    const signInError = document.getElementById("signInError");
    const signUpError = document.getElementById("signUpError");


    /* =========================
       SWITCH BETWEEN TABS
    ========================= */

    signInTab.addEventListener("click", function () {

        signInTab.classList.add("is-active");
        signUpTab.classList.remove("is-active");

        signInPanel.classList.add("is-active");
        signUpPanel.classList.remove("is-active");

        clearErrors();
    });


    signUpTab.addEventListener("click", function () {

        signUpTab.classList.add("is-active");
        signInTab.classList.remove("is-active");

        signUpPanel.classList.add("is-active");
        signInPanel.classList.remove("is-active");

        clearErrors();
    });


    /* =========================
       SIGN UP
    ========================= */

    signUpForm.addEventListener("submit", function (event) {

        event.preventDefault();

        clearErrors();

        const name = document.getElementById("signUpName").value.trim();
        const email = document.getElementById("signUpEmail").value.trim();
        const password = document.getElementById("signUpPassword").value;
        const confirmPassword =
            document.getElementById("signUpConfirmPassword").value;


        if (!name || !email || !password || !confirmPassword) {
            showError(signUpError, "Please fill in all fields.");
            return;
        }


        if (!email.includes("@")) {
            showError(signUpError, "Please enter a valid email.");
            return;
        }


        if (password.length < 6) {
            showError(
                signUpError,
                "Password must be at least 6 characters."
            );
            return;
        }


        if (password !== confirmPassword) {
            showError(signUpError, "Passwords do not match.");
            return;
        }


        const user = {
            name: name,
            email: email,
            password: password
        };


        localStorage.setItem(
            "masar_user",
            JSON.stringify(user)
        );


        alert("Account created successfully!");


        signUpForm.reset();

        signInTab.click();

        document.getElementById("signInEmail").value = email;

    });


    /* =========================
       SIGN IN
    ========================= */

    signInForm.addEventListener("submit", function (event) {

        event.preventDefault();

        clearErrors();

        const email =
            document.getElementById("signInEmail").value.trim();

        const password =
            document.getElementById("signInPassword").value;


        if (!email || !password) {
            showError(
                signInError,
                "Please enter your email and password."
            );
            return;
        }


        if (!email.includes("@")) {
            showError(
                signInError,
                "Please enter a valid email."
            );
            return;
        }


        const savedUser =
            JSON.parse(localStorage.getItem("masar_user"));


        if (!savedUser) {
            showError(
                signInError,
                "No account found. Please create an account first."
            );
            return;
        }


        if (
            savedUser.email !== email ||
            savedUser.password !== password
        ) {
            showError(
                signInError,
                "Email or password is incorrect."
            );
            return;
        }


        localStorage.setItem(
            "masar_logged_in",
            "true"
        );


        alert("Signed in successfully!");


        window.location.href = "index.html";

    });


    /* =========================
       ERROR FUNCTIONS
    ========================= */

    function showError(element, message) {

        element.textContent = message;
        element.classList.add("is-visible");

    }


    function clearErrors() {

        signInError.textContent = "";
        signUpError.textContent = "";

        signInError.classList.remove("is-visible");
        signUpError.classList.remove("is-visible");

    }

});