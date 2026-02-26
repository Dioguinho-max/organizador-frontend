document.addEventListener("DOMContentLoaded", () => {

const API = "https://organizador-backend-dqxr.onrender.com";
const token = localStorage.getItem("token");

/* =========================================
   GRÁFICOS DE DESEMPENHO (ADICIONADO)
========================================= */

let graficoTarefas;
let graficoNotas;

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

if (btnSair) {
    btnSair.addEventListener("click", () => {
        modalLogout.style.display = "flex";
    });
}

if (cancelarLogout) {
    cancelarLogout.addEventListener("click", () => {
        fecharModalLogout();
    });
}

if (confirmarLogout) {
    confirmarLogout.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.replace("index.html");
    });
}

if (modalLogout) {
    modalLogout.addEventListener("click", (e) => {
        if (e.target === modalLogout) {
            fecharModalLogout();
        }
    });
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalLogout && modalLogout.style.display === "flex") {
        fecharModalLogout();
    }
});

function fecharModalLogout() {
    if (modalLogout) modalLogout.style.display = "none";
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
            btnConcluir.onclick = () => concluir(t.id);
            li.appendChild(btnConcluir);
        }

        const btnExcluir = document.createElement("button");
        btnExcluir.textContent = "🗑";
        btnExcluir.onclick = () => excluir(t.id);
        li.appendChild(btnExcluir);

        lista.appendChild(li);
    });

    /* =============================
       ATUALIZA GRÁFICOS (ADICIONADO)
    ============================== */
    atualizarGraficos(tarefas);
}

/* =========================================
   GRÁFICOS (ADICIONADO)
========================================= */

function atualizarGraficos(tarefas) {

    const tarefasPorDia = {};
    let somaNotas = 0;
    let totalNotas = 0;

    tarefas.forEach(t => {

        const data = t.createdAt
            ? new Date(t.createdAt).toLocaleDateString()
            : "Sem data";

        tarefasPorDia[data] = (tarefasPorDia[data] || 0) + 1;

        if (t.nota !== null && t.nota !== undefined) {
            somaNotas += t.nota;
            totalNotas++;
        }
    });

    const labels = Object.keys(tarefasPorDia);
    const valores = Object.values(tarefasPorDia);
    const media = totalNotas > 0 ? (somaNotas / totalNotas).toFixed(2) : 0;

    const ctx1 = document.getElementById("graficoTarefas");
    if (ctx1) {

        if (graficoTarefas) graficoTarefas.destroy();

        graficoTarefas = new Chart(ctx1, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Tarefas por dia",
                    data: valores
                }]
            }
        });
    }

    const ctx2 = document.getElementById("graficoNotas");
    if (ctx2) {

        if (graficoNotas) graficoNotas.destroy();

        graficoNotas = new Chart(ctx2, {
            type: "doughnut",
            data: {
                labels: ["Média", "Restante até 10"],
                datasets: [{
                    data: [media, 10 - media]
                }]
            }
        });
    }
}

/* =========================================
   INICIALIZAÇÃO
========================================= */

carregarTarefas();

});
