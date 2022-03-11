// Frontend login script. Requires toast from utils.js

// Listener for Login/Logout button top right of page
document.querySelector('.open-login-button').addEventListener('click', async (event) => {
  event.preventDefault();
  loginButtonElement = document.querySelector('.open-login-button');

  // If logged out
  if (loginButtonElement.innerHTML === 'Login') {
    renderLoginWindow();
  } else {
    // If logged in, log out
    logout();
  }
});

// Renders Window to fill with Login/Register form
function renderLoginWindow() {
  // Create div to cast "shadow" over page and act as container for login box
  let loginOverlay = document.createElement('div');
  loginOverlay.classList.add('login-overlay');
  let loginContainer = document.createElement('div');
  loginContainer.classList.add('login-container');

  // Display login
  document.body.appendChild(loginOverlay);
  loginOverlay.appendChild(loginContainer);

  // Add listener to cancel login on click outside login box
  loginOverlay.addEventListener('click', event => {
    if (event.target.className.includes('login-overlay')) { document.body.removeChild(loginOverlay); }
  });
  renderLoginForm(loginOverlay, loginContainer);
}

// Renders Register form in Login/Register Window
function renderRegisterForm(loginOverlay, loginContainer) {
  loginContainer.style.height = '440px';
  loginContainer.innerHTML = `
    <form name="register">
      <h1>Register</h1>
      <label>
        <span>Username: </span><input required name="username" type="text">
      </label>
      <label>
        <span>First Name: </span><input required name="firstName" type="text">
      </label>
      <label>
        <span>Last Name: </span><input required name="lastName" type="text">
      </label>
      <label>
        <span>Email: </span><input required name="email" type="email">
      </label>
      <label>
        <span>Password: </span><input required name="password" type="password">
      </label>
      <label>
        <span>Repeat Password: </span><input required name="passwordRepeated" type="password">
      </label>
      <span>
        <input type="submit" value="Register" class="login-button">
        <input type="button" value="Cancel" class="login-button">
      </span>
    </form>
    <span class="login-message"></span>
    <div class="flex-bottom">
      <p>Already registered? <a href="#" class="login-to-register">Click here!</a></p>
    </div>
  `;

  document.querySelector('.login-to-register').addEventListener('click', event => {
    renderLoginForm(loginOverlay, loginContainer);  // Change from register to login form
  });

  document.querySelector('input[value="Cancel"]').addEventListener('click', (event) => {
    event.preventDefault();
    document.body.removeChild(loginOverlay);
  });

  document.querySelector('form[name="register"]').addEventListener('submit', async (event) => {
    event.preventDefault();
    let formElements = document.forms.register.elements;

    // Store register details in requestBody
    let requestBody = {};
    for (let element of formElements) {
      if (element.type === 'submit' || element.type === 'button') { continue; }
      requestBody[element.name] = element.value;
    }

    if (requestBody.password !== requestBody.passwordRepeated) {
      document.querySelector('.login-message').innerHTML = 'Passwords does not match!';
      return;
    }
    delete requestBody.passwordRepeated;

    // Attempt to Register, store response in result
    let result = {};
    try {
      result = await (await fetch('/api/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })).json();
    } catch (error) {
      console.log(error);
    }

    // Incorrect login
    if (!result || result._error) {
      document.querySelector('.login-message').innerHTML = 'Registration failed';
      return;
    }

    launchToast(`Account created!`);
    renderLoginForm(loginOverlay, loginContainer);
  });
}

function renderLoginForm(loginOverlay, loginContainer, newUser = false) {
  loginContainer.style.height = '300px';
  loginContainer.innerHTML = `
    <form name="login">
      <h1>Login</h1>
      <label>
        <span>Username: </span><input required name="username" type="text">
      </label>
      <label>
        <span>Password: </span><input required name="password" type="password">
      </label>
      <span>
        <input type="submit" value="Login" class="login-button">
        <input type="button" value="Cancel" class="login-button">
      </span>
    </form>
    <span class="login-message">${newUser ? 'Account created!' : ''}</span>
    <div class="flex-bottom">
      <p>Not registered? <a href="#" class="login-to-register">Click here</a></p>
    </div>
  `;

  document.querySelector('.login-to-register').addEventListener('click', event => {
    renderRegisterForm(loginOverlay, loginContainer);   // Change from login to register form
  });

  document.querySelector('input[value="Cancel"]').addEventListener('click', (event) => {
    event.preventDefault();
    document.body.removeChild(loginOverlay);
  });

  // Login function inside listener
  document.querySelector('form[name="login"]').addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('login button listener');

    let formElements = document.forms.login.elements;

    // Store login details in requestBody
    let requestBody = {};
    for (let element of formElements) {
      if (element.type === 'submit') { continue; }
      requestBody[element.name] = element.value;
    }

    // Attempt to login, store response in result
    let result = {};
    try {
      result = await (await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })).json();
    } catch (error) {
      console.log(error);
    }

    // Incorrect login
    if (!result || result._error) {
      document.querySelector('.login-message').innerHTML = 'Invalid login';
      return;
    }

    document.body.removeChild(loginOverlay);  // Destroy login window

    // Show "logged in" top right
    document.querySelector('.logged-on-user').innerHTML = result.firstName + ' ' + result.lastName + ' |';
    document.querySelector('.open-login-button').innerHTML = 'Logout';
    launchToast(`Welcome, ${result.firstName}!`);
  });
}

// Logout function
async function logout() {
  // log out using our REST-api
  let result;
  try {
    result = await (await fetch('/api/login', { method: 'DELETE' })).json();
  }
  catch (error) {
    console.log(error);
  }

  document.location.href = '/'; // Reload start page on logout
}

// Returns logged in user info
async function getLoggedOnUser() {
  // Check if logged in by REST GET 
  let loggedIn;
  try {
    loggedIn = await (await fetch('/api/login')).json();
  }
  catch (error) {
    console.log(error);
  }
  // if not logged in
  if (!loggedIn || loggedIn._error) { return null; }
  return loggedIn;
}

// Update top right of page to show logged in user
async function setupLoggedInUser() {
  loggedIn = await getLoggedOnUser();
  if (loggedIn === null) { return; }

  document.querySelector('.logged-on-user').innerHTML = loggedIn.firstName + ' ' + loggedIn.lastName + ' |';
  document.querySelector('.open-login-button').innerHTML = 'Logout';
}