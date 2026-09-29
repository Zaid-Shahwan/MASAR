/* ==================================================
   MASAR AUTHENTICATION
================================================== */


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

signUpForm.addEventListener("submit", function (event) {

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

        signUpError.style.display = "block";

        return;
    }


    /* Check password length */

    if (password.length < 6) {

        signUpError.textContent =
            "Password must be at least 6 characters.";

        signUpError.style.display = "block";

        return;
    }


    /* Create user object */

    const user = {
        name: name,
        email: email,
        password: password
    };


    /* Save user */

    localStorage.setItem(
        "masar_user",
        JSON.stringify(user)
    );


    /* Show Sign In */

    signUpTab.classList.remove("is-active");
    signInTab.classList.add("is-active");

    signUpPanel.classList.remove("is-active");
    signInPanel.classList.add("is-active");


    /* Put email in Sign In */

    document.getElementById("signInEmail").value = email;

    document.getElementById("signInPassword").value = "";


    /* Show message */

    signInError.textContent =
        "Account created successfully. You can sign in now.";

    signInError.style.color = "#6d7651";
    signInError.style.display = "block";

});


/* ==================================================
   SIGN IN
================================================== */

signInForm.addEventListener("submit", function (event) {

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


    /* Get saved user */

    const savedUser =
        localStorage.getItem("masar_user");


    /* No account */

    if (!savedUser) {

        signInError.textContent =
            "No account found. Please create an account first.";

        signInError.style.color = "#a23a2b";
        signInError.style.display = "block";

        return;
    }


    const user = JSON.parse(savedUser);


    /* Check email */

    if (email !== user.email) {

        signInError.textContent =
            "Incorrect email or password.";

        signInError.style.color = "#a23a2b";
        signInError.style.display = "block";

        return;
    }


    /* Check password */

    if (password !== user.password) {

        signInError.textContent =
            "Incorrect email or password.";

        signInError.style.color = "#a23a2b";
        signInError.style.display = "block";

        return;
    }


    /* Save logged-in user */

    localStorage.setItem(
        "masar_logged_in",
        "true"
    );


    localStorage.setItem(
        "masar_current_user",
        JSON.stringify({
            name: user.name,
            email: user.email
        })
    );


    /* Go back to Home */

    window.location.href = "index.html";

});