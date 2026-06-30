const API = "http://localhost:3000";
const container = document.getElementById("listaProdutos");

// Carrega e exibe todos os produtos do cardápio geral
async function carregarProdutos() {
  const resposta = await fetch(`${API}/api/produtos`);
  const produtos = await resposta.json();

  container.innerHTML = "";

  produtos.forEach((produto) => {
    const div = document.createElement("div");
    div.classList.add("produto");

    div.innerHTML = `
            <img src="${produto.foto || ""}" width="100">
            <h3>${produto.nome}</h3>
            <p>${produto.descricao || ""}</p>
            <p>R$ ${Number(produto.preco).toFixed(2)}</p>
            <small>${produto.loja || ""}</small>
        `;

    // Clicar no produto leva para a página de detalhe
    div.addEventListener("click", () => {
      window.location.href = `produto.html?id=${produto.id_produto}`;
    });

    // O botão "Adicionar ao Carrinho" fica dentro do card, mas não deve
    // navegar para o detalhe ao ser clicado (por isso o stopPropagation)
    const botao = document.createElement("button");
    botao.classList.add("botoes");
    botao.textContent = "Adicionar ao carrinho";
    botao.addEventListener("click", (evento) => {
      evento.stopPropagation();
      adicionarAoCarrinho(produto.id_produto, produto.nome, botao);
    });

    div.appendChild(botao);
    container.appendChild(div);
  });
}

// Adiciona um produto ao carrinho real (banco de dados), vinculado ao
// usuário logado. O carrinho em si é visto na página carrinho.html.
async function adicionarAoCarrinho(id_produto, nomeProduto, botao) {
  const id_usuario = localStorage.getItem("usuarioId");

  if (!id_usuario) {
    alert("Você precisa estar logado para adicionar itens ao carrinho.");
    window.location.href = "login.html";
    return;
  }

  try {
    const resposta = await fetch(`${API}/api/carrinho/item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario,
        id_produto,
        quantidade: 1,
      }),
    });

    if (!resposta.ok) throw new Error("Erro ao adicionar ao carrinho");

    // Pequeno feedback visual no próprio botão, sem precisar de alert
    const textoOriginal = botao.textContent;
    botao.textContent = "Adicionado!";
    botao.disabled = true;
    setTimeout(() => {
      botao.textContent = textoOriginal;
      botao.disabled = false;
    }, 1200);
  } catch (erro) {
    console.log("Erro ao adicionar ao carrinho:", erro);
    alert(`Erro ao adicionar ${nomeProduto} ao carrinho.`);
  }
}

carregarProdutos();
