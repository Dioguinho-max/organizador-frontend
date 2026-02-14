const API = "https://organizador-backend-dqxr.onrender.com";

async function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(API + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    document.getElementById("mensagem").innerText = data.mensagem || data.erro;
}

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.token) {

        // 🔐 Salva o token
        localStorage.setItem("token", data.token);

        // Redireciona
        window.location.href = "dashboard.html";

    } else {
        document.getElementById("mensagem").innerText = data.erro || "Erro no login";
    }
}
