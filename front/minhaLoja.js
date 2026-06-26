const API = "http://localhost:3000/api/lojas";

document.addEventListener("DOMContentLoaded", async function () {
    // Mostra o nome do empreendedor logado
    const nomeEmpreendedor = localStorage.getItem("usuarioNome");
    const spanNome = document.getElementById("nomeEmpreendedor");
    if (spanNome) {
        spanNome.innerText = nomeEmpreendedor || "Empreendedor";
    }

    const idEmpreendedor = localStorage.getItem("idEmpreendedor");
    const nomeLoja = document.getElementById("nomeLoja");
    const descricaoTexto = document.getElementById("descricaoLojaTexto");
    const horarioTexto = document.getElementById("horarioLojaTexto");

    // Protege a página: só empreendedores logados podem ver esta tela
    if (!idEmpreendedor) {
        alert("Você precisa ser um empreendedor logado para acessar esta página.");
        window.location.href = "login.html";
        return;
    }

    try {
        // Busca a(s) loja(s) deste empreendedor
        const resposta = await fetch(`${API}?id_empreendedor=${idEmpreendedor}`);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar loja");
        }

        const lojas = await resposta.json();

        if (lojas.length === 0) {
            // Empreendedor ainda não criou nenhuma loja
            if (nomeLoja) nomeLoja.innerText = "Nenhuma loja cadastrada";
            if (descricaoTexto) {
                descricaoTexto.innerHTML =
                    '<a href="create.html">Clique aqui para criar sua loja</a>';
            }
            return;
        }

        // Usa a primeira loja encontrada (assumindo um empreendedor = uma loja por enquanto)
        const loja = lojas[0];

        if (nomeLoja) nomeLoja.innerText = loja.nome;
        if (descricaoTexto) descricaoTexto.innerText = loja.descricao || "";
        if (horarioTexto) {
            horarioTexto.innerText = loja.horario_funcionamento
                ? `Horário: ${loja.horario_funcionamento}`
                : "";
        }
    } catch (erro) {
        console.error("Erro ao carregar loja:", erro);
        if (nomeLoja) nomeLoja.innerText = "Erro ao carregar loja";
    }
});