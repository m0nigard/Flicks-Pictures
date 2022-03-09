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

function renderLoginWindow() {
  console.log('login');

  // Create div to cast "shadow" over page and act as container for login box
  let loginOverlay = document.createElement('div');
  loginOverlay.classList.add('login-overlay');

  // Display login
  document.body.appendChild(loginOverlay);

  // Add listener to cancel login on click outside login box
  loginOverlay.addEventListener('click', event => {
    if (event.target.className.includes('login-overlay')) { document.body.removeChild(loginOverlay); }
  });

  loginOverlay.innerHTML = `
  <div class="login-container">
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
    <span class="login-message"></span>
    <div class="flex-bottom">
      <p>Not registered? <a>Click here</a></p>
    </div>
  </div>
  `;

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

    console.log(result);

    // Incorrect login
    if (!result || result._error) {
      document.querySelector('.login-message').innerHTML = 'Invalid login';
      return;
    }

    // Show "logged in" top right
    // Show "My bookings"
    document.body.removeChild(loginOverlay);  // Destroy login window

    document.querySelector('.logged-on-user').innerHTML = result.firstName + ' ' + result.lastName + ' |';
    document.querySelector('.open-login-button').innerHTML = 'Logout';
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