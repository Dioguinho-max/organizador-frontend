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

/* ===== ABRIR / FECHAR ===== */

if (btnIA && modalIA) {
    btnIA.addEventListener("click", () => {
        modalIA.classList.add("active");
    });
}

if (btnHistoricoIA && modalHistoricoIA) {
    btnHistoricoIA.addEventListener("click", () => {
        modalHistoricoIA.classList.add("active");
        carregarHistorico();
    });
}

if (fecharIA && modalIA) {
    fecharIA.addEventListener("click", () => {
        modalIA.classList.remove("active");
    });
}

if (fecharHistoricoIA && modalHistoricoIA) {
    fecharHistoricoIA.addEventListener("click", () => {
        modalHistoricoIA.classList.remove("active");
    });
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (modalIA) modalIA.classList.remove("active");
        if (modalHistoricoIA) modalHistoricoIA.classList.remove("active");
    }
});

/* ===== ENVIO IA ===== */

if (enviarIA && chatIA) {

    enviarIA.addEventListener("click", async () => {

        const materiaInput = document.getElementById("materiaIA");
        const nivelInput = document.getElementById("nivelIA");
        const horasInput = document.getElementById("horasIA");

        if (!materiaInput || !nivelInput || !horasInput) return;

        const materia = materiaInput.value.trim();
        const nivel = nivelInput.value;
        const horas = horasInput.value;

        if (!materia || !nivel || !horas) {
            alert("Preencha todos os campos!");
            return;
        }

        // Mensagem do usuário
        chatIA.innerHTML += `
            <div class="mensagem-user">
                📚 ${materia}
                📊 ${nivel}
                ⏳ ${horas}h por dia
            </div>
        `;

        // Indicador
        const loadingDiv = document.createElement("div");
        loadingDiv.classList.add("mensagem-ia");
        loadingDiv.textContent = "IA pensando...";
        chatIA.appendChild(loadingDiv);

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
            loadingDiv.remove();

            const mensagemDiv = document.createElement("div");
            mensagemDiv.classList.add("mensagem-ia");
            mensagemDiv.style.whiteSpace = "pre-wrap"; // mantém quebra de linha natural
            chatIA.appendChild(mensagemDiv);

            // Limite de tamanho
            let texto = (data.plano || "").trim();

            let i = 0;

            function digitar() {
                if (i < texto.length) {
                    mensagemDiv.textContent += texto.charAt(i);
                    i++;
                    chatIA.scrollTop = chatIA.scrollHeight;
                    setTimeout(digitar, 7);
                }
            }

            digitar();

            materiaInput.value = "";
            nivelInput.value = "";
            horasInput.value = "";

        } catch (erro) {

            loadingDiv.remove();

            chatIA.innerHTML += `
                <div class="mensagem-ia">
                    ❌ Erro ao gerar plano.
                </div>
            `;

            console.error(erro);
        }

    });

}

/* ===== HISTÓRICO ===== */

async function carregarHistorico() {

    if (!historicoIA) return;

    historicoIA.innerHTML = "Carregando...";

    try {
        const res = await fetch(`${API}/historico-ia`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const dados = await res.json();
        historicoIA.innerHTML = "";

        dados.forEach(item => {
            const userMsg = document.createElement("div");
            userMsg.classList.add("mensagem-user");
            userMsg.textContent = item.pergunta;

            const iaMsg = document.createElement("div");
            iaMsg.classList.add("mensagem-ia");
            iaMsg.style.whiteSpace = "pre-wrap";
            iaMsg.textContent = item.resposta;

            historicoIA.appendChild(userMsg);
            historicoIA.appendChild(iaMsg);
            historicoIA.appendChild(document.createElement("hr"));
        });

    } catch (erro) {
        historicoIA.innerHTML = "Erro ao carregar histórico.";
        console.error(erro);
    }
}

/* =========================================
   INICIALIZAÇÃO
========================================= */

carregarTarefas();
carregarRanking();

});
