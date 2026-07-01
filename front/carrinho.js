const API = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", function () {
  carregarCarrinho();

  const btnEncomendar = document.getElementById("btnEncomendar");
  if (btnEncomendar) {
    btnEncomendar.addEventListener("click", finalizarEncomenda);
  }
});

const btnModo = document.getElementById("modoEscuro");
 
if (localStorage.getItem("tema") === "dark") {
    document.body.classList.add("dark");
    btnModo.innerHTML = "☀️";
}
 
btnModo.addEventListener("click", () => {
    document.body.classList.toggle("dark");
 
    if (document.body.classList.contains("dark")) {
        btnModo.innerHTML = "☀️";
        localStorage.setItem("tema", "dark");
    } else {
        btnModo.innerHTML = "🌙";
        localStorage.setItem("tema", "light");
    }
});

// Busca o carrinho real do usuário logado e desenha a lista de itens,
// com controles de quantidade (+/-) e botão de remover em cada um.
async function carregarCarrinho() {
  const lista = document.getElementById("listaCarrinho");
  const valorTotalEl = document.getElementById("valorTotalCarrinho");

  const id_usuario = localStorage.getItem("usuarioId");

  if (!id_usuario) {
    lista.innerHTML = "<p>Você precisa estar logado para ver seu carrinho.</p>";
    return;
  }

  try {
    const resposta = await fetch(`${API}/api/carrinho/${id_usuario}`);
    const dados = await resposta.json();

    lista.innerHTML = "";

    if (dados.itens.length === 0) {
      lista.innerHTML = "<p>Seu carrinho está vazio.</p>";
      if (valorTotalEl) valorTotalEl.textContent = "0,00";
      return;
    }

    let valorTotal = 0;

    dados.itens.forEach((item) => {
      valorTotal += Number(item.subtotal);
      lista.appendChild(criarLinhaItem(item));
    });

    if (valorTotalEl) valorTotalEl.textContent = valorTotal.toFixed(2);
  } catch (erro) {
    console.log("Erro ao carregar carrinho:", erro);
    lista.innerHTML = "<p>Erro ao carregar o carrinho. Tente novamente.</p>";
  }
}

// Monta a linha visual de um item do carrinho, com os controles de
// quantidade e o botão de remover já ligados às funções correspondentes.
function criarLinhaItem(item) {
  const linha = document.createElement("div");
  linha.classList.add("itemCarrinho");

  const urlFoto = item.foto
    ? item.foto.startsWith("http")
      ? item.foto
      : `${API}${item.foto}`
    : "icone.png";

  linha.innerHTML = `
    <img src="${urlFoto}" alt="${item.nome}" class="itemFoto">
    <div class="itemInfo">
      <h3>${item.nome}</h3>
      <p class="itemPrecoUnitario">R$ ${Number(item.preco).toFixed(2)} / unidade</p>
    </div>
    <div class="itemQuantidade">
      <button class="botaoQtd" data-acao="diminuir">-</button>
      <span class="quantidadeAtual">${item.quantidade}</span>
      <button class="botaoQtd" data-acao="aumentar">+</button>
    </div>
    <p class="itemSubtotal">R$ ${Number(item.subtotal).toFixed(2)}</p>
    <button class="botaoRemover">Remover</button>
  `;

  const botaoDiminuir = linha.querySelector('[data-acao="diminuir"]');
  const botaoAumentar = linha.querySelector('[data-acao="aumentar"]');
  const botaoRemover = linha.querySelector(".botaoRemover");

  botaoDiminuir.addEventListener("click", () => {
    if (item.quantidade <= 1) {
      removerItem(item.id_item_carrinho);
    } else {
      atualizarQuantidade(item.id_item_carrinho, item.quantidade - 1);
    }
  });

  botaoAumentar.addEventListener("click", () => {
    atualizarQuantidade(item.id_item_carrinho, item.quantidade + 1);
  });

  botaoRemover.addEventListener("click", () =>
    removerItem(item.id_item_carrinho),
  );

  return linha;
}

async function atualizarQuantidade(id_item_carrinho, novaQuantidade) {
  try {
    const resposta = await fetch(
      `${API}/api/carrinho/item/${id_item_carrinho}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade: novaQuantidade }),
      },
    );

    if (!resposta.ok) throw new Error("Erro ao atualizar quantidade");

    await carregarCarrinho();
  } catch (erro) {
    console.log("Erro ao atualizar quantidade:", erro);
    alert("Erro ao atualizar quantidade. Tente novamente.");
  }
}

async function removerItem(id_item_carrinho) {
  try {
    await fetch(`${API}/api/carrinho/item/${id_item_carrinho}`, {
      method: "DELETE",
    });

    await carregarCarrinho();
  } catch (erro) {
    console.log("Erro ao remover item:", erro);
  }
}

// Transforma o carrinho aberto em uma encomenda de verdade, e leva o
// aluno para a tela de confirmação com o(s) código(s) de retirada.
async function finalizarEncomenda() {
  const id_usuario = localStorage.getItem("usuarioId");

  if (!id_usuario) {
    alert("Você precisa estar logado para finalizar uma encomenda.");
    window.location.href = "login.html";
    return;
  }

  const nome = localStorage.getItem("usuarioNome") || "";

  try {
    const resposta = await fetch(`${API}/api/encomendas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario, nome }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.erro || "Erro ao finalizar encomenda.");
      return;
    }

    const ids = dados.encomendas.map((e) => e.id_encomenda).join(",");
    window.location.href = `compra.html?id=${ids}`;
  } catch (erro) {
    console.log("Erro ao finalizar encomenda:", erro);
    alert("Erro ao finalizar encomenda. Tente novamente.");
  }
}
