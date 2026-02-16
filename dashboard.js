document.addEventListener("DOMContentLoaded", () => {

const API = "https://organizador-backend-dqxr.onrender.com";
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
    return;
}

// ===============================
// CRIAR TAREFA
// ===============================
async function criarTarefa() {
    const inputNova = document.getElementById("novaTarefa");
    const inputDescricao = document.getElementById("descricaoTarefa");
    const inputNota = document.getElementById("notaTarefa");

    if (!inputNova) return;

    const titulo = inputNova.value.trim();
    const descricao = inputDescricao?.value.trim();
    const nota = inputNota?.value;

    if (!titulo) {
        alert("Digite uma tarefa!");
        return;
    }

    await fetch(`${API}/tarefas`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            titulo,
            descricao,
            nota: nota ? parseFloat(nota) : null
        })
    });

    inputNova.value = "";
    if (inputDescricao) inputDescricao.value = "";
    if (inputNota) inputNota.value = "";

    carregarTarefas();
}

// ===============================
// LISTAR TAREFAS
// ===============================
async function carregarTarefas() {

    const lista = document.getElementById("listaTarefas");
    if (!lista) return;

    const response = await fetch(`${API}/tarefas`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const tarefas = await response.json();
    lista.innerHTML = "";

    tarefas.forEach(t => {
        const li = document.createElement("li");

        if (t.concluida) li.classList.add("concluida");

        li.innerHTML = `
            <div>
                <strong>${t.titulo}</strong>
                ${t.descricao ? `<div class="descricao">${t.descricao}</div>` : ""}
                ${t.nota !== null ? `<span class="badge">Nota: ${t.nota}</span>` : ""}
            </div>
        `;

        if (!t.concluida) {
            const btnConcluir = document.createElement("button");
            btnConcluir.textContent = "✔";
            btnConcluir.onclick = () => concluir(t.id);
            li.appendChild(btnConcluir);
        }

        const btnExcluir = document.createElement("button");
        btnExcluir.textContent = "🗑";
        btnExcluir.onclick = () => excluir(t.id);
        li.appendChild(btnExcluir);

        lista.appendChild(li);
    });
}

// ===============================
// CONCLUIR
// ===============================
async function concluir(id) {
    await fetch(`${API}/tarefas/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ concluida: true })
    });

    carregarTarefas();
}

// ===============================
// EXCLUIR
// ===============================
async function excluir(id) {
    await fetch(`${API}/tarefas/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });

    carregarTarefas();
}

// ===============================
// RANKING
// ===============================
async function carregarRanking() {

    const lista = document.getElementById("listaRanking");
    if (!lista) return;

    const response = await fetch(`${API}/ranking`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const ranking = await response.json();
    lista.innerHTML = "";

    ranking.forEach(user => {
        const li = document.createElement("li");
        li.textContent = `${user.username} - Média: ${user.media}`;
        lista.appendChild(li);
    });
}

// ===============================
// IA (MODAL SEGURO)
// ===============================

const modalIA = document.getElementById("modalIA");
const modalHistoricoIA = document.getElementById("modalHistoricoIA");
const btnIA = document.getElementById("btnIA");
const btnHistoricoIA = document.getElementById("btnHistoricoIA");
const fecharIA = document.getElementById("fecharIA");
const fecharHistoricoIA = document.getElementById("fecharHistoricoIA");
const enviarIA = document.getElementById("enviarIA");
const chatIA = document.getElementById("chatIA");
const historicoIA = document.getElementById("historicoIA");

if (btnIA && modalIA) {
    btnIA.onclick = () => modalIA.style.display = "flex";
}

if (btnHistoricoIA && modalHistoricoIA) {
    btnHistoricoIA.onclick = () => {
        modalHistoricoIA.style.display = "flex";
        carregarHistorico();
    };
}

if (fecharIA) fecharIA.onclick = () => modalIA.style.display = "none";
if (fecharHistoricoIA) fecharHistoricoIA.onclick = () => modalHistoricoIA.style.display = "none";

if (enviarIA && chatIA) {
    enviarIA.onclick = async () => {

        const perguntaInput = document.getElementById("perguntaIA");
        if (!perguntaInput) return;

        const pergunta = perguntaInput.value.trim();
        if (!pergunta) return;

        perguntaInput.value = "";

        chatIA.innerHTML += `<div class="mensagem-user">${pergunta}</div>`;
        chatIA.innerHTML += `<div class="mensagem-ia" id="loadingIA">IA pensando...</div>`;

        const res = await fetch(`${API}/gerar-plano`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                materia: pergunta,
                nivel: "intermediário",
                horas: 2
            })
        });

        const data = await res.json();
        document.getElementById("loadingIA")?.remove();

        chatIA.innerHTML += `<div class="mensagem-ia">${data.plano}</div>`;
        chatIA.scrollTop = chatIA.scrollHeight;
    };
}

async function carregarHistorico() {
    if (!historicoIA) return;

    historicoIA.innerHTML = "Carregando...";

    const res = await fetch(`${API}/historico-ia`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const dados = await res.json();
    historicoIA.innerHTML = "";

    dados.forEach(item => {
        historicoIA.innerHTML += `
            <div class="mensagem-user">${item.pergunta}</div>
            <div class="mensagem-ia">${item.resposta}</div>
            <hr>
        `;
    });
}

// ===============================
// LOGOUT
// ===============================
window.logout = function () {
    localStorage.removeItem("token");
    window.location.href = "index.html";
};

// INICIAR
carregarTarefas();
carregarRanking();

});
