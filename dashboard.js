document.addEventListener("DOMContentLoaded", () => {
    const API = "https://organizador-backend-dqxr.onrender.com";
    const token = localStorage.getItem("token");
    let graficoColuna;

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    const btnSair = document.getElementById("btnSair");
    const modalLogout = document.getElementById("modalLogout");
    const cancelarLogout = document.getElementById("cancelarLogout");
    const confirmarLogout = document.getElementById("confirmarLogout");

    const btnCriar = document.getElementById("btnCriarTarefa");
    const listaTarefas = document.getElementById("listaTarefas");
    const listaRanking = document.getElementById("listaRanking");

    const statTotal = document.getElementById("statTotal");
    const statConcluidas = document.getElementById("statConcluidas");
    const statMedia = document.getElementById("statMedia");
    const anoAtual = document.getElementById("anoAtual");
    const avatarInput = document.getElementById("avatarInput");
    const avatarPreview = document.getElementById("avatarPreview");
    const profileName = document.getElementById("profileName");

    const modalIA = document.getElementById("modalIA");
    const modalHistoricoIA = document.getElementById("modalHistoricoIA");
    const btnIA = document.getElementById("btnIA");
    const btnHistoricoIA = document.getElementById("btnHistoricoIA");
    const fecharIA = document.getElementById("fecharIA");
    const fecharHistoricoIA = document.getElementById("fecharHistoricoIA");
    const enviarIA = document.getElementById("enviarIA");
    const chatIA = document.getElementById("chatIA");
    const historicoIA = document.getElementById("historicoIA");

    if (anoAtual) {
        anoAtual.textContent = new Date().getFullYear();
    }

    if (btnSair) {
        btnSair.addEventListener("click", () => {
            modalLogout.style.display = "flex";
        });
    }

    if (cancelarLogout) {
        cancelarLogout.addEventListener("click", fecharModalLogout);
    }

    if (confirmarLogout) {
        confirmarLogout.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.replace("index.html");
        });
    }

    if (modalLogout) {
        modalLogout.addEventListener("click", (event) => {
            if (event.target === modalLogout) {
                fecharModalLogout();
            }
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modalLogout.style.display === "flex") {
            fecharModalLogout();
        }

        if (event.key === "Escape") {
            if (modalIA) modalIA.classList.remove("active");
            if (modalHistoricoIA) modalHistoricoIA.classList.remove("active");
        }
    });

    function fecharModalLogout() {
        modalLogout.style.display = "none";
    }

    function obterIniciais(nome) {
        return (nome || "U")
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((parte) => parte[0]?.toUpperCase() || "")
            .join("") || "U";
    }

    function atualizarAvatar(usuario) {
        if (profileName) {
            profileName.textContent = usuario.username || "Seu perfil";
        }

        if (!avatarPreview) return;

        const iniciais = obterIniciais(usuario.username);

        if (usuario.avatar_url) {
            avatarPreview.classList.remove("avatar-fallback");
            avatarPreview.innerHTML = `<img src="${usuario.avatar_url}" alt="Foto de perfil" class="avatar-image">`;
            return;
        }

        avatarPreview.classList.add("avatar-fallback");
        avatarPreview.textContent = iniciais;
    }

    async function carregarPerfil() {
        const response = await fetch(`${API}/perfil`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error("Não foi possível carregar o perfil");
        }

        const usuario = await response.json();
        atualizarAvatar(usuario);
    }

    async function salvarAvatar(dataUrl) {
        const response = await fetch(`${API}/perfil`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ avatar_url: dataUrl })
        });

        if (!response.ok) {
            throw new Error("Não foi possível salvar a foto de perfil");
        }
    }

    async function criarTarefa() {
        const titulo = document.getElementById("novaTarefa").value.trim();
        const descricao = document.getElementById("descricaoTarefa").value.trim();
        const nota = document.getElementById("notaTarefa").value;

        if (!titulo) {
            alert("Digite uma tarefa antes de adicionar.");
            return;
        }

        await fetch(`${API}/tarefas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
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

    if (btnCriar) {
        btnCriar.addEventListener("click", criarTarefa);
    }

    if (avatarInput) {
        avatarInput.addEventListener("change", async (event) => {
            const arquivo = event.target.files?.[0];

            if (!arquivo) return;

            if (!arquivo.type.startsWith("image/")) {
                alert("Escolha um arquivo de imagem válido.");
                avatarInput.value = "";
                return;
            }

            if (arquivo.size > 1_500_000) {
                alert("A imagem deve ter no máximo 1,5 MB.");
                avatarInput.value = "";
                return;
            }

            const leitor = new FileReader();

            leitor.onload = async () => {
                try {
                    const dataUrl = leitor.result;
                    await salvarAvatar(dataUrl);
                    await carregarPerfil();
                } catch (erro) {
                    console.error(erro);
                    alert("Não foi possível atualizar sua foto de perfil.");
                } finally {
                    avatarInput.value = "";
                }
            };

            leitor.readAsDataURL(arquivo);
        });
    }

    function renderEmptyState(elemento, mensagem) {
        elemento.innerHTML = `<li class="empty-state">${mensagem}</li>`;
    }

    function atualizarResumo(tarefas) {
        const total = tarefas.length;
        const concluidas = tarefas.filter((tarefa) => tarefa.concluida).length;
        const tarefasComNota = tarefas.filter((tarefa) => tarefa.nota !== null);
        const somaNotas = tarefasComNota.reduce((acc, tarefa) => acc + Number(tarefa.nota), 0);
        const media = tarefasComNota.length ? somaNotas / tarefasComNota.length : 0;

        statTotal.textContent = total;
        statConcluidas.textContent = concluidas;
        statMedia.textContent = media.toFixed(1);
    }

    async function carregarTarefas() {
        if (!listaTarefas) return;

        const response = await fetch(`${API}/tarefas`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const tarefas = await response.json();
        listaTarefas.innerHTML = "";

        atualizarResumo(tarefas);
        atualizarGraficoColuna(tarefas);

        if (!tarefas.length) {
            renderEmptyState(listaTarefas, "Nenhuma tarefa ainda. Comece criando sua primeira meta de estudo.");
            return;
        }

        tarefas.forEach((tarefa) => {
            const li = document.createElement("li");
            li.className = `task-item${tarefa.concluida ? " concluida" : ""}`;

            const nota = tarefa.nota !== null ? Number(tarefa.nota).toFixed(1) : null;

            li.innerHTML = `
                <div class="task-main">
                    <strong>${tarefa.titulo}</strong>
                    ${tarefa.descricao ? `<div class="descricao">${tarefa.descricao}</div>` : ""}
                    <div class="task-meta">
                        ${nota ? `<span class="badge">Nota ${nota}</span>` : ""}
                        <span class="badge">${tarefa.concluida ? "Concluída" : "Em andamento"}</span>
                    </div>
                </div>
            `;

            const actions = document.createElement("div");
            actions.className = "task-actions";

            if (!tarefa.concluida) {
                const btnConcluir = document.createElement("button");
                btnConcluir.className = "task-action complete";
                btnConcluir.textContent = "OK";
                btnConcluir.title = "Concluir tarefa";
                btnConcluir.onclick = () => concluir(tarefa.id);
                actions.appendChild(btnConcluir);
            }

            const btnExcluir = document.createElement("button");
            btnExcluir.className = "task-action delete";
            btnExcluir.textContent = "X";
            btnExcluir.title = "Excluir tarefa";
            btnExcluir.onclick = () => excluir(tarefa.id);
            actions.appendChild(btnExcluir);

            li.appendChild(actions);
            listaTarefas.appendChild(li);
        });
    }

    async function concluir(id) {
        await fetch(`${API}/tarefas/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ concluida: true })
        });

        carregarTarefas();
    }

    async function excluir(id) {
        await fetch(`${API}/tarefas/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        carregarTarefas();
    }

    async function carregarRanking() {
        if (!listaRanking) return;

        const response = await fetch(`${API}/ranking`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const ranking = await response.json();
        listaRanking.innerHTML = "";

        if (!ranking.length) {
            renderEmptyState(listaRanking, "O ranking vai aparecer aqui quando houver dados suficientes.");
            return;
        }

        ranking.forEach((user, index) => {
            const li = document.createElement("li");
            li.className = "ranking-item";
            li.innerHTML = `
                <div class="ranking-user">
                    <span class="ranking-position">${index + 1}</span>
                    <div>
                        <strong>${user.username}</strong>
                        <span>Média geral: ${user.media}</span>
                    </div>
                </div>
            `;
            listaRanking.appendChild(li);
        });
    }

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

    if (modalIA) {
        modalIA.addEventListener("click", (event) => {
            if (event.target === modalIA) {
                modalIA.classList.remove("active");
            }
        });
    }

    if (modalHistoricoIA) {
        modalHistoricoIA.addEventListener("click", (event) => {
            if (event.target === modalHistoricoIA) {
                modalHistoricoIA.classList.remove("active");
            }
        });
    }

    if (enviarIA && chatIA) {
        enviarIA.addEventListener("click", async () => {
            const materiaInput = document.getElementById("materiaIA");
            const nivelInput = document.getElementById("nivelIA");
            const horasInput = document.getElementById("horasIA");

            const materia = materiaInput.value.trim();
            const nivel = nivelInput.value;
            const horas = horasInput.value;

            if (!materia || !nivel || !horas) {
                alert("Preencha todos os campos para gerar o plano.");
                return;
            }

            chatIA.innerHTML += `
                <div class="mensagem-user">Matéria: ${materia}\nNível: ${nivel}\nHoras por dia: ${horas}</div>
            `;

            const loadingDiv = document.createElement("div");
            loadingDiv.className = "mensagem-ia";
            loadingDiv.textContent = "Gerando um plano personalizado...";
            chatIA.appendChild(loadingDiv);
            chatIA.scrollTop = chatIA.scrollHeight;

            try {
                const res = await fetch(`${API}/gerar-plano`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ materia, nivel, horas })
                });

                const data = await res.json();
                loadingDiv.remove();

                const mensagemDiv = document.createElement("div");
                mensagemDiv.className = "mensagem-ia plano-ia";
                chatIA.appendChild(mensagemDiv);

                const texto = (data.plano || "").trim();
                let i = 0;

                function digitar() {
                    if (i < texto.length) {
                        mensagemDiv.textContent += texto.charAt(i);
                        i += 1;
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
                chatIA.innerHTML += `<div class="mensagem-ia">Erro ao gerar o plano de estudos.</div>`;
                console.error(erro);
            }
        });
    }

    async function carregarHistorico() {
        if (!historicoIA) return;

        historicoIA.innerHTML = "<div class='mensagem-ia'>Carregando histórico...</div>";

        try {
            const res = await fetch(`${API}/historico-ia`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                throw new Error("Falha ao buscar histórico");
            }

            const dados = await res.json();
            historicoIA.innerHTML = "";

            if (!Array.isArray(dados) || !dados.length) {
                historicoIA.innerHTML = "<div class='mensagem-ia'>Nenhuma conversa salva ainda.</div>";
                return;
            }

            dados.forEach((item) => {
                const card = document.createElement("article");
                card.className = "history-entry";

                const pergunta = document.createElement("div");
                pergunta.className = "history-block history-question";

                const perguntaLabel = document.createElement("span");
                perguntaLabel.className = "history-label";
                perguntaLabel.textContent = "Pedido";

                const perguntaTexto = document.createElement("p");
                perguntaTexto.textContent = item.pergunta || "Pergunta indisponível.";

                pergunta.appendChild(perguntaLabel);
                pergunta.appendChild(perguntaTexto);

                const resposta = document.createElement("div");
                resposta.className = "history-block history-answer";

                const respostaLabel = document.createElement("span");
                respostaLabel.className = "history-label";
                respostaLabel.textContent = "Resposta da IA";

                const respostaTexto = document.createElement("p");
                respostaTexto.textContent = item.resposta || "Resposta indisponível.";

                resposta.appendChild(respostaLabel);
                resposta.appendChild(respostaTexto);

                card.appendChild(pergunta);
                card.appendChild(resposta);
                historicoIA.appendChild(card);
            });
        } catch (erro) {
            historicoIA.innerHTML = "<div class='mensagem-ia'>Erro ao carregar o histórico.</div>";
            console.error(erro);
        }
    }

    function atualizarGraficoColuna(tarefas) {
        const canvas = document.getElementById("graficoTarefas");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (graficoColuna) {
            graficoColuna.destroy();
        }

        const tarefasComNota = tarefas.filter((tarefa) => tarefa.nota !== null);
        const labels = tarefasComNota.map((tarefa, index) => tarefa.titulo || `Tarefa ${index + 1}`);
        const valores = tarefasComNota.map((tarefa) => Number(tarefa.nota));

        if (!labels.length) {
            labels.push("Sem notas");
            valores.push(0);
        }

        graficoColuna = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Notas registradas",
                    data: valores,
                    borderColor: "#c96f4a",
                    backgroundColor: "rgba(201, 111, 74, 0.16)",
                    pointBackgroundColor: "#1f3c34",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 2,
                    tension: 0.35,
                    borderWidth: 3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: "#5f6d68",
                            font: {
                                family: "Outfit"
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: "#5f6d68"
                        },
                        grid: {
                            color: "rgba(41, 71, 62, 0.08)"
                        }
                    },
                    y: {
                        beginAtZero: true,
                        suggestedMax: valores.length ? Math.max(...valores) + 1 : 10,
                        ticks: {
                            color: "#5f6d68",
                            stepSize: 1
                        },
                        grid: {
                            color: "rgba(41, 71, 62, 0.08)"
                        }
                    }
                }
            }
        });
    }

    carregarPerfil().catch((erro) => console.error(erro));
    carregarTarefas();
    carregarRanking();
});
