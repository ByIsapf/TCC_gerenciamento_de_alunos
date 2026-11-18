const form = document.getElementById("studentForm");
const message = document.getElementById("loginMessage");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const ra = document.getElementById("ra").value.trim();
  const password = document.getElementById("password").value.trim();
  const qrCode = document.getElementById("qrCode").value.trim();

  if (!ra || !password || !qrCode) {
    message.textContent = "Preencha todos os campos para registrar o acesso.";
    message.className = "form-message error";
    return;
  }

  message.textContent = "Acesso registrado com sucesso! O sistema recebeu seus dados.";
  message.className = "form-message success";

  // FUTURO BACKEND:
  // Aqui o front deverá enviar RA, senha e código do QR para a API.
  // Exemplo:
  // fetch("/api/acessos", {
  //   method: "POST",
  //   headers: {"Content-Type": "application/json"},
  //   body: JSON.stringify({ ra, password, qrCode })
  // });
});