document.addEventListener("DOMContentLoaded", () => {

const API = "https://organizador-backend-dqxr.onrender.com";
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
    return;
}

/* =========================================
   LOGOUT PROFISSIONAL
========================================= */

const btnSair = document.getElementById("btnSair");
const modalLogout = document.getElementById("modalLogout");
const cancelarLogout = document.getElementById("cancelarLogout");
const confirmarLogout = document.getElementById("confirmarLogout");

// Abrir modal
if (btnSair) {
    btnSair.addEventListener("click", () => {
        modalLogout.style.display = "flex";
    });
}

// Cancelar logout
if (cancelarLogout) {
    cancelarLogout.addEventListener("click", () => {
        fecharModalLogout();
    });
}

// Confirmar logout
if (confirmarLogout) {
    confirmarLogout.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.replace("index.html");
    });
}

// Fechar clicando fora
if (modalLogout) {
    modalLogout.addEventListener("click", (e) => {
        if (e.target === modalLogout) {
            fecharModalLogout();
        }
    });
}

// Fechar com ESC
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalLogout.style.display === "flex") {
        fecharModalLogout();
    }
});

// Função fechar
function fecharModalLogout() {
    modalLogout.style.display = "none";
}

/* =========================================
   FORMATADOR PROFISSIONAL DA IA
========================================= */

function formatarPlanoIA(texto) {
    return texto
        .replace(/### (.*)/g, "<h3>$1</h3>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/---/g, "<hr>")
        .replace(/\n\n/g, "<br><br>")
        .replace(/\n/g, "<br>")
        .replace(/(\d+)\. (.*)/g, "<br><strong>$1.</strong> $2");
}

/* =========================================
   CRIAR TAREFA
========================================= */

async function criarTarefa() {

    const titulo = document.getElementById("novaTarefa").value.trim();
    const descricao = document.getElementById("descricaoTarefa").value.trim();
    const nota = document.getElementById("notaTarefa").value;

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

    document.getElementById("novaTarefa").value = "";
    document.getElementById("descricaoTarefa").value = "";
    document.getElementById("notaTarefa").value = "";

    carregarTarefas();
}

const btnCriar = document.getElementById("btnCriarTarefa");
if (btnCriar) btnCriar.addEventListener("click", criarTarefa);

/* =========================================
   LISTAR TAREFAS
========================================= */

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
            btnConcluir.classList.add("btn-concluir");
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

async function excluir(id) {
    await fetch(`${API}/tarefas/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });
    carregarTarefas();
}

/* =========================================
   RANKING
========================================= */

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

/* =========================================
   IA
========================================= */

const modalIA = document.getElementById("modalIA");
const modalHistoricoIA = document.getElementById("modalHistoricoIA");
const btnIA = document.getElementById("btnIA");
const btnHistoricoIA = document.getElementById("btnHistoricoIA");
const fecharIA = document.getElementById("fecharIA");
const fecharHistoricoIA = document.getElementById("fecharHistoricoIA");
const enviarIA = document.getElementById("enviarIA");
const chatIA = document.getElementById("chatIA");
const historicoIA = document.getElementById("historicoIA");

btnIA && (btnIA.onclick = () => modalIA.style.display = "flex");

btnHistoricoIA && (btnHistoricoIA.onclick = () => {
    modalHistoricoIA.style.display = "flex";
    carregarHistorico();
});

fecharIA && (fecharIA.onclick = () => modalIA.style.display = "none");
fecharHistoricoIA && (fecharHistoricoIA.onclick = () => modalHistoricoIA.style.display = "none");

enviarIA && (enviarIA.onclick = async () => {

    const materia = document.getElementById("materiaIA").value.trim();
    const nivel = document.getElementById("nivelIA").value;
    const horas = document.getElementById("horasIA").value;

    if (!materia || !nivel || !horas) {
        alert("Preencha todos os campos!");
        return;
    }

    chatIA.innerHTML += `
        <div class="mensagem-user">
            📚 ${materia}<br>
            📊 ${nivel}<br>
            ⏳ ${horas}h por dia
        </div>
    `;

    chatIA.innerHTML += `<div class="mensagem-ia" id="loadingIA">IA pensando...</div>`;
    chatIA.scrollTop = chatIA.scrollHeight;

    try {
        const res = await fetch(`${API}/gerar-plano`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ materia, nivel, horas })
        });

        const data = await res.json();
        document.getElementById("loadingIA")?.remove();

        chatIA.innerHTML += `
            <div class="mensagem-ia">
                ${formatarPlanoIA(data.plano)}
            </div>
        `;

        chatIA.scrollTop = chatIA.scrollHeight;

        document.getElementById("materiaIA").value = "";
        document.getElementById("nivelIA").value = "";
        document.getElementById("horasIA").value = "";

    } catch (erro) {
        document.getElementById("loadingIA")?.remove();

        chatIA.innerHTML += `
            <div class="mensagem-ia">
                ❌ Erro ao gerar plano.
            </div>
        `;

        console.error(erro);
    }
});

async function carregarHistorico() {

    historicoIA.innerHTML = "Carregando...";

    const res = await fetch(`${API}/historico-ia`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const dados = await res.json();
    historicoIA.innerHTML = "";

    dados.forEach(item => {
        historicoIA.innerHTML += `
            <div class="mensagem-user">${item.pergunta}</div>
            <div class="mensagem-ia">${formatarPlanoIA(item.resposta)}</div>
            <hr>
        `;
    });
}

/* =========================================
   INICIALIZAÇÃO
========================================= */

carregarTarefas();
carregarRanking();

});
