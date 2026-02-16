const API = "https://organizador-backend-dqxr.onrender.com";
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

// ===============================
// CRIAR TAREFA
// ===============================
async function criarTarefa() {
    const inputNova = document.getElementById("novaTarefa");
    const inputDescricao = document.getElementById("descricaoTarefa");
    const inputNota = document.getElementById("notaTarefa");

    const titulo = inputNova.value.trim();
    const descricao = inputDescricao.value.trim();
    const nota = inputNota.value;

    if (!titulo) {
        alert("Digite uma tarefa!");
        return;
    }

    try {
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
        inputDescricao.value = "";
        inputNota.value = "";

        carregarTarefas();

    } catch (error) {
        alert("Erro ao criar tarefa");
        console.error(error);
    }
}

// ===============================
// LISTAR TAREFAS
// ===============================
async function carregarTarefas() {
    try {
        const response = await fetch(`${API}/tarefas`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const tarefas = await response.json();

        const lista = document.getElementById("listaTarefas");
        lista.innerHTML = "";

        tarefas.forEach(t => {
            const li = document.createElement("li");

            if (t.concluida) {
                li.classList.add("concluida");
            }

            const texto = document.createElement("div");

            texto.innerHTML = `
                <strong>${t.titulo}</strong>
                ${t.descricao ? `<div class="descricao">${t.descricao}</div>` : ""}
                ${t.nota !== null ? `<span class="badge">Nota: ${t.nota}</span>` : ""}
            `;

            li.appendChild(texto);

            // BOTÃO CONCLUIR (só se não estiver concluída)
            if (!t.concluida) {
                const btnConcluir = document.createElement("button");
                btnConcluir.textContent = "✔";
                btnConcluir.classList.add("btn-concluir");
                btnConcluir.onclick = () => concluir(t.id);
                li.appendChild(btnConcluir);
            }

            // BOTÃO EXCLUIR (sempre aparece)
            const btnExcluir = document.createElement("button");
            btnExcluir.textContent = "🗑";
            btnExcluir.onclick = () => excluir(t.id);
            li.appendChild(btnExcluir);

            lista.appendChild(li);
        });

    } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
    }
}

// ===============================
// CONCLUIR TAREFA
// ===============================
async function concluir(id) {
    try {
        await fetch(`${API}/tarefas/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                concluida: true
            })
        });

        carregarTarefas();

    } catch (error) {
        console.error("Erro ao concluir tarefa:", error);
    }
}

// ===============================
// EXCLUIR TAREFA
// ===============================
async function excluir(id) {
    try {
        await fetch(`${API}/tarefas/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        carregarTarefas();

    } catch (error) {
        console.error("Erro ao excluir tarefa:", error);
    }
}

// ===============================
// RANKING
// ===============================
async function carregarRanking() {
    try {
        const response = await fetch(`${API}/ranking`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const ranking = await response.json();

        const lista = document.getElementById("listaRanking");
        lista.innerHTML = "";

        ranking.forEach(user => {
            const li = document.createElement("li");
            li.textContent = `${user.username} - Média: ${user.media}`;
            lista.appendChild(li);
        });

    } catch (error) {
        console.error("Erro ao carregar ranking:", error);
    }
}

// ===============================
// SISTEMA IA MODAL CHAT
// ===============================

const API_URL = "https://organizador-backend-dqxr.onrender.com";

const modalIA = document.getElementById("modalIA");
const modalHistoricoIA = document.getElementById("modalHistoricoIA");

const btnIA = document.getElementById("btnIA");
const btnHistoricoIA = document.getElementById("btnHistoricoIA");

const fecharIA = document.getElementById("fecharIA");
const fecharHistoricoIA = document.getElementById("fecharHistoricoIA");

const enviarIA = document.getElementById("enviarIA");
const chatIA = document.getElementById("chatIA");
const historicoIA = document.getElementById("historicoIA");


// ====================
// ABRIR CHAT IA
// ====================
btnIA.onclick = () => {
    modalIA.style.display = "flex";
};

// ====================
// ABRIR HISTÓRICO
// ====================
btnHistoricoIA.onclick = async () => {
    modalHistoricoIA.style.display = "flex";
    carregarHistorico();
};

fecharIA.onclick = () => modalIA.style.display = "none";
fecharHistoricoIA.onclick = () => modalHistoricoIA.style.display = "none";


// ====================
// ENVIAR PERGUNTA
// ====================
enviarIA.onclick = async () => {

    const token = localStorage.getItem("token");
    const perguntaInput = document.getElementById("perguntaIA");
    const pergunta = perguntaInput.value.trim();

    if (!pergunta) return;

    perguntaInput.value = "";

    chatIA.innerHTML += `<div class="mensagem-user">${pergunta}</div>`;
    chatIA.innerHTML += `<div class="mensagem-ia" id="loadingIA">IA pensando...</div>`;
    chatIA.scrollTop = chatIA.scrollHeight;

    const res = await fetch(`${API_URL}/gerar-plano`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            materia: pergunta,
            nivel: "intermediário",
            horas: 2
        })
    });

    const data = await res.json();

    document.getElementById("loadingIA").remove();

    chatIA.innerHTML += `<div class="mensagem-ia">${data.plano}</div>`;
    chatIA.scrollTop = chatIA.scrollHeight;
};


// ====================
// CARREGAR HISTÓRICO
// ====================
async function carregarHistorico() {

    const token = localStorage.getItem("token");

    historicoIA.innerHTML = "Carregando...";

    const res = await fetch(`${API_URL}/historico-ia`, {
        headers: {
            "Authorization": "Bearer " + token
        }
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
function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

// ===============================
// INICIAR
// ===============================
carregarTarefas();
carregarRanking();
