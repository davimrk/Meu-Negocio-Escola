const API = "http://localhost:3000/api/lojas";

// Protege a página: só empreendedores logados podem acessar create.html
document.addEventListener("DOMContentLoaded", function () {
  const idEmpreendedor = localStorage.getItem("idEmpreendedor");

  if (!idEmpreendedor) {
    alert("Você precisa ser um empreendedor logado para acessar esta página.");
    window.location.href = "login.html";
  }
});

async function criarLoja() {
  const nome = document.getElementById("nomeLoja").value;
  const descricao = document.getElementById("descricaoLoja").value;
  const hor_func = document.getElementById("hor_func").value;
  const mensagem = document.getElementById("mensagemLoja");

  mensagem.innerText = "";

  if (!nome || !descricao || !hor_func) {
    alert("Preencha todos os campos.");
    return;
  }

  // Recupera o id_empreendedor salvo no login
  const idEmpreendedor = localStorage.getItem("idEmpreendedor");

  if (!idEmpreendedor) {
    alert("Você precisa estar logado como empreendedor para criar uma loja.");
    return;
  }

  try {
    const resposta = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        descricao,
        horario_funcionamento: hor_func,
        id_empreendedor: idEmpreendedor,
        ativa: "true",
      }),
    });

    if (!resposta.ok) {
      throw new Error("Erro ao criar loja");
    }

    mensagem.style.color = "green";
    mensagem.innerText = "Loja criada com sucesso!";

    document.getElementById("nomeLoja").value = "";
    document.getElementById("descricaoLoja").value = "";
    document.getElementById("hor_func").value = "";
    document.getElementById("responsavel").value = "";
  } catch (erro) {
    console.error("Erro ao criar loja:", erro);
    mensagem.style.color = "red";
    mensagem.innerText = "Erro ao cadastrar loja. Tente novamente.";
  }
}
