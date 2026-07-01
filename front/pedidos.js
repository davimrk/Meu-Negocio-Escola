const API = "http://localhost:3000";

let idLojaAtual = null;

const btnModo = document.getElementById("modoEscuro");

btnModo.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    btnModo.innerHTML = "☀️";
  } else {
    btnModo.innerHTML = "🌙";
  }
});

document.addEventListener("DOMContentLoaded", async function () {
  const idEmpreendedor = localStorage.getItem("idEmpreendedor");

  if (!idEmpreendedor) {
    alert("Você precisa ser um empreendedor logado para acessar esta página.");
    window.location.href = "login.html";
    return;
  }

  await descobrirLojaDoEmpreendedor(idEmpreendedor);
  await carregarPedidos();
});

async function descobrirLojaDoEmpreendedor(idEmpreendedor) {
  try {
    const resposta = await fetch(
      `${API}/api/lojas?id_empreendedor=${idEmpreendedor}`,
    );
    const lojas = await resposta.json();

    if (lojas.length === 0) {
      alert("Você precisa ter uma loja cadastrada para ver pedidos.");
      window.location.href = "criarLoja.html";
      return;
    }

    idLojaAtual = lojas[0].id_loja;
  } catch (erro) {
    console.log("Erro ao buscar loja do empreendedor:", erro);
  }
}

// Traduz o status salvo no banco para um texto e cor amigáveis na tela
const statusInfo = {
  pendente: { texto: "Pendente", classe: "status-pendente" },
  pronta: { texto: "Pronta para retirada", classe: "status-pronta" },
  retirada: { texto: "Retirada", classe: "status-retirada" },
};

async function carregarPedidos() {
  const lista = document.getElementById("listaPedidos");
  if (!lista || !idLojaAtual) return;

  try {
    const resposta = await fetch(`${API}/api/encomendas/loja/${idLojaAtual}`);
    const pedidos = await resposta.json();

    lista.innerHTML = "";

    if (pedidos.length === 0) {
      lista.innerHTML = "<p>Nenhum pedido recebido ainda.</p>";
      return;
    }

    pedidos.forEach((pedido) => {
      lista.appendChild(criarCardPedido(pedido));
    });
  } catch (erro) {
    console.log("Erro ao carregar pedidos:", erro);
    lista.innerHTML = "<p>Erro ao carregar pedidos.</p>";
  }
}

function criarCardPedido(pedido) {
  const card = document.createElement("div");
  card.classList.add("pedido-card");

  const info = statusInfo[pedido.status] || {
    texto: pedido.status,
    classe: "",
  };

  const itensHtml = pedido.itens
    .map(
      (item) =>
        `<li>${item.quantidade}x ${item.nome} — R$ ${Number(item.subtotal).toFixed(2)}</li>`,
    )
    .join("");

  card.innerHTML = `
    <div class="pedido-cabecalho">
      <span class="pedido-codigo">#${pedido.codigo_retirada || "—"}</span>
      <span class="pedido-status ${info.classe}">${info.texto}</span>
    </div>
    <p class="pedido-cliente">Cliente: ${pedido.nome_aluno || pedido.nome_retirada || "Não informado"}</p>
    <ul class="pedido-itens">${itensHtml}</ul>
    <p class="pedido-total">Total: R$ ${Number(pedido.valor_total).toFixed(2)}</p>
    <div class="pedido-acoes"></div>
  `;

  const acoes = card.querySelector(".pedido-acoes");

  if (pedido.status === "pendente") {
    const botaoPronta = document.createElement("button");
    botaoPronta.textContent = "Marcar como pronta";
    botaoPronta.addEventListener("click", () =>
      atualizarStatus(pedido.id_encomenda, "pronta"),
    );
    acoes.appendChild(botaoPronta);
  }

  if (pedido.status === "pronta") {
    const botaoRetirada = document.createElement("button");
    botaoRetirada.textContent = "Confirmar retirada";
    botaoRetirada.addEventListener("click", () =>
      atualizarStatus(pedido.id_encomenda, "retirada"),
    );
    acoes.appendChild(botaoRetirada);
  }

  return card;
}

async function atualizarStatus(id_encomenda, novoStatus) {
  try {
    const resposta = await fetch(
      `${API}/api/encomendas/${id_encomenda}/status`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      },
    );

    if (!resposta.ok) throw new Error("Erro ao atualizar status");

    await carregarPedidos();
  } catch (erro) {
    console.log("Erro ao atualizar status:", erro);
    alert("Erro ao atualizar status do pedido.");
  }
}
