const API = "http://localhost:3000/api/lojas";

let idLojaAtual = null;
let statusAtivaAtual = "true";

// Carrega os dados atuais da loja para preencher o formulário
document.addEventListener("DOMContentLoaded", async function () {
  const idEmpreendedor = localStorage.getItem("idEmpreendedor");

  if (!idEmpreendedor) {
    alert("Você precisa ser um empreendedor logado para acessar esta página.");
    window.location.href = "login.html";
    return;
  }

  try {
    const resposta = await fetch(`${API}?id_empreendedor=${idEmpreendedor}`);
    const lojas = await resposta.json();

    if (lojas.length === 0) {
      alert("Você ainda não tem uma loja cadastrada.");
      window.location.href = "criarLoja.html";
      return;
    }

    const loja = lojas[0];
    idLojaAtual = loja.id_loja;
    statusAtivaAtual = loja.ativa || "true";

    document.getElementById("nomeLoja").value = loja.nome || "";
    document.getElementById("descricaoLoja").value = loja.descricao || "";
    document.getElementById("horarioLoja").value =
      loja.horario_funcionamento || "";
  } catch (erro) {
    console.error("Erro ao carregar dados da loja:", erro);
  }
});

// Salva as alterações feitas no formulário, usando PUT /api/lojas/:id
async function salvarAlteracoes(event) {
  event.preventDefault();

  const mensagem = document.getElementById("mensagemConfigurar");
  mensagem.textContent = "";

  if (!idLojaAtual) {
    alert("Não foi possível identificar sua loja. Recarregue a página.");
    return;
  }

  const nome = document.getElementById("nomeLoja").value;
  const descricao = document.getElementById("descricaoLoja").value;
  const horario_funcionamento = document.getElementById("horarioLoja").value;

  if (!nome) {
    alert("O nome da loja é obrigatório.");
    return;
  }

  try {
    const resposta = await fetch(`${API}/${idLojaAtual}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        descricao,
        horario_funcionamento,
        ativa: statusAtivaAtual,
      }),
    });

    if (!resposta.ok) {
      throw new Error("Erro ao salvar alterações");
    }

    mensagem.style.color = "green";
    mensagem.textContent = "Alterações salvas com sucesso!";
  } catch (erro) {
    console.error("Erro ao salvar alterações:", erro);
    mensagem.style.color = "red";
    mensagem.textContent = "Erro ao salvar alterações. Tente novamente.";
  }
}
