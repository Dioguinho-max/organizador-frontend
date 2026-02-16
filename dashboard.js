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

// Botão criar tarefa
const btnCriar = document.getElementById("btnCriarTarefa");
if (btnCriar) {
    btnCriar.addEventListener("click", criarTarefa);
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
// IA
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

if (btnIA) btnIA.onclick = () => modalIA.style.display = "flex";
if (btnHistoricoIA) btnHistoricoIA.onclick = () => {
    modalHistoricoIA.style.display = "flex";
    carregarHistorico();
};

if (fecharIA) fecharIA.onclick = () => modalIA.style.display = "none";
if (fecharHistoricoIA) fecharHistoricoIA.onclick = () => modalHistoricoIA.style.display = "none";

if (enviarIA) {
    enviarIA.onclick = async () => {

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
                body: JSON.stringify({
                    materia,
                    nivel,
                    horas
                })
            });

            const data = await res.json();

            document.getElementById("loadingIA")?.remove();

            chatIA.innerHTML += `
                <div class="mensagem-ia">
                    ${data.plano}
                </div>
            `;

            chatIA.scrollTop = chatIA.scrollHeight;

            // Limpa campos
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
    };
}


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
            <div class="mensagem-ia">${item.resposta}</div>
            <hr>
        `;
    });
}

// ===============================
carregarTarefas();
carregarRanking();

});
