function showPane(name) {
  document.getElementById("pane-login").classList.toggle("active", name === "login");
  document.getElementById("pane-register").classList.toggle("active", name === "register");
  document.getElementById("tab-login").classList.toggle("active", name === "login");
  document.getElementById("tab-register").classList.toggle("active", name === "register");
}

function togglePass(id, btn) {
  const field = document.getElementById(id);
  const isPass = field.type === "password";
  field.type = isPass ? "text" : "password";
  btn.textContent = isPass ? "Hide" : "Show";
}

function checkStrength() {
  const val = document.getElementById("reg-pass").value;
  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const colors = ["#E7DFD2", "#C7693F", "#C7693F", "#7C8B6F", "#586F5C"];
  const bars = ["bar1", "bar2", "bar3", "bar4"];
  bars.forEach((id, i) => {
    document.getElementById(id).style.background = i < score ? colors[score] : "#E7DFD2";
  });
}
