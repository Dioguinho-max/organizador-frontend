document.addEventListener("DOMContentLoaded", () => {

const API = "https://organizador-backend-dqxr.onrender.com";
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
    return;
}

/* =========================================
   FUNÇÃO DIGITAÇÃO (EFEITO CHATGPT)
========================================= */

function digitarHTML(elemento, html, velocidade = 5) {
    elemento.classList.add("typing");
    elemento.innerHTML = "";

    let i = 0;

    function escrever() {
        if (i < html.length) {
            elemento.innerHTML = html.substring(0, i + 1);
            i++;
            elemento.scrollIntoView({ behavior: "smooth", block: "end" });
            setTimeout(escrever, velocidade);
        } else {
            elemento.classList.remove("typing");
        }
    }

    escrever();
}

/* =========================================
   LOGOUT
========================================= */

const btnSair = document.getElementById("btnSair");
const modalLogout = document.getElementById("modalLogout");
const cancelarLogout = document.getElementById("cancelarLogout");
const confirmarLogout = document.getElementById("confirmarLogout");

if (btnSair) {
    btnSair.onclick = () => modalLogout.style.display = "flex";
}

if (cancelarLogout) {
    cancelarLogout.onclick = () => fecharModalLogout();
}

if (confirmarLogout) {
    confirmarLogout.onclick = () => {
        localStorage.removeItem("token");
        window.location.replace("index.html");
    };
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalLogout?.style.display === "flex") {
        fecharModalLogout();
    }
});

function fecharModalLogout() {
    modalLogout.style.display = "none";
}

/* =========================================
   FORMATADOR IA
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
   TAREFAS
========================================= */

async function criarTarefa() {
    const titulo = document.getElementById("novaTarefa").value.trim();
    const descricao = document.getElementById("descricaoTarefa").value.trim();
    const nota = document.getElementById("notaTarefa").value;

    if (!titulo) return alert("Digite uma tarefa!");

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

document.getElementById("btnCriarTarefa")?.addEventListener("click", criarTarefa);

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
                ${t.descricao ? `<div>${t.descricao}</div>` : ""}
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
   IA
========================================= */

const modalIA = document.getElementById("modalIA");
const btnIA = document.getElementById("btnIA");
const fecharIA = document.getElementById("fecharIA");
const enviarIA = document.getElementById("enviarIA");
const chatIA = document.getElementById("chatIA");

btnIA && (btnIA.onclick = () => modalIA.style.display = "flex");
fecharIA && (fecharIA.onclick = () => modalIA.style.display = "none");

enviarIA && (enviarIA.onclick = async () => {

    const materia = document.getElementById("materiaIA").value.trim();
    const nivel = document.getElementById("nivelIA").value;
    const horas = document.getElementById("horasIA").value;

    if (!materia || !nivel || !horas) {
        return alert("Preencha todos os campos!");
    }

    chatIA.innerHTML += `
        <div class="mensagem-user">
            📚 ${materia}<br>
            📊 ${nivel}<br>
            ⏳ ${horas}h por dia
        </div>
    `;

    const loading = document.createElement("div");
    loading.className = "mensagem-ia";
    loading.textContent = "IA pensando...";
    chatIA.appendChild(loading);
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
        loading.remove();

        const novaMsg = document.createElement("div");
        novaMsg.className = "mensagem-ia";
        chatIA.appendChild(novaMsg);

        const planoFormatado = formatarPlanoIA(data.plano);

        setTimeout(() => {
            digitarHTML(novaMsg, planoFormatado, 5);
        }, 600);

        chatIA.scrollTop = chatIA.scrollHeight;

        document.getElementById("materiaIA").value = "";
        document.getElementById("nivelIA").value = "";
        document.getElementById("horasIA").value = "";

    } catch (erro) {
        loading.remove();
        chatIA.innerHTML += `<div class="mensagem-ia">❌ Erro ao gerar plano.</div>`;
        console.error(erro);
    }
});

/* =========================================
   INICIALIZAÇÃO
========================================= */

carregarTarefas();

});