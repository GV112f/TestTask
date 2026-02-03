const form = document.getElementById("sixweeksForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const messageInput = document.getElementById("message");

const emailError = document.getElementById("emailError");
const toast = document.getElementById("toast");
const submitBtn = document.getElementById("submitBtn");

function showToast(type, text) {
  toast.className = `toast show ${type}`;
  toast.textContent = text;

  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => {
    toast.className = "toast";
    toast.textContent = "";
  }, 4500);
}

function isValidEmail(value) {
  const v = String(value || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

function setEmailError(msg) {
  emailError.textContent = msg || "";
  if (msg) emailInput.setAttribute("aria-invalid", "true");
  else emailInput.removeAttribute("aria-invalid");
}

emailInput.addEventListener("input", () => setEmailError(""));

form.addEventListener("reset", () => {
  setEmailError("");
  showToast("ok", "Форма очищена.");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const message = messageInput.value.trim();

  if (!email) {
    setEmailError("Поле Email є обов’язковим.");
    emailInput.focus();
    showToast("bad", "Перевірте форму: Email не заповнений.");
    return;
  }

  if (!isValidEmail(email)) {
    setEmailError("Некоректний формат Email. Приклад: name@example.com");
    emailInput.focus();
    showToast("bad", "Перевірте форму: неправильний формат Email.");
    return;
  }

  setEmailError("");
  submitBtn.disabled = true;
  showToast("ok", "Надсилаємо…");

  try {
    const r = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });

    const j = await r.json().catch(() => ({}));

    if (r.ok && j.ok) {
      showToast("ok", "Надіслано! Лист відправлено.");
      form.reset();
    } else {
      showToast("bad", j.error ? `Помилка: ${j.error}` : "Помилка відправки. Спробуйте ще раз.");
    }
  } catch (err) {
    showToast("bad", "Мережева помилка. Спробуйте ще раз.");
  } finally {
    submitBtn.disabled = false;
  }
});
