// konfigurasi
const USERS_API = "https://dummyjson.com/users";
const SESSION_KEY = "firstName";

// sudah login
if (localStorage.getItem(SESSION_KEY) !== null) {
  window.location.replace("index.html");
}

// elemen
const loginForm = document.querySelector("#login-form");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const togglePassword = document.querySelector("#toggle-password");
const loginError = document.querySelector("#login-error");
const loginButton = document.querySelector("#login-button");
const buttonSpinner = loginButton.querySelector(".spinner");
const buttonLabel = loginButton.querySelector(".btn-label");

// tampilan status
const showError = (message) => {
  loginError.textContent = message;
  loginError.hidden = false;
};

const hideError = () => {
  loginError.textContent = "";
  loginError.hidden = true;
};

const setLoading = (isLoading) => {
  loginButton.disabled = isLoading;
  buttonSpinner.hidden = !isLoading;
  buttonLabel.textContent = isLoading ? "Memverifikasi..." : "Masuk";
};

// autentikasi
const findUser = async (username) => {
  const url = `${USERS_API}/filter?key=username&value=${encodeURIComponent(username)}&select=username,password,firstName`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.users.find((user) => user.username === username) ?? null;
};

// submit form
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideError();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (username === "" || password === "") {
    showError("Username dan password wajib diisi.");
    (username === "" ? usernameInput : passwordInput).focus();
    return;
  }

  setLoading(true);

  try {
    const user = await findUser(username);

    if (user === null || user.password !== password) {
      showError("Username atau password salah.");
      passwordInput.value = "";
      passwordInput.focus();
      return;
    }

    localStorage.setItem(SESSION_KEY, user.firstName);
    window.location.replace("index.html");
  } catch (error) {
    showError("Gagal terhubung ke server. Periksa koneksi internet lalu coba lagi.");
  } finally {
    setLoading(false);
  }
});

// lihat password
togglePassword.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePassword.textContent = isHidden ? "Sembunyi" : "Lihat";
  togglePassword.setAttribute("aria-label", isHidden ? "Sembunyikan password" : "Tampilkan password");
});
