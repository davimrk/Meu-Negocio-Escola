const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let produtoAtual = null;

async function carregarProduto() {
  try {
    const resposta = await fetch(`http://localhost:3000/api/produtos/${id}`);

    const produto = await resposta.json();
    produtoAtual = produto;

    document.getElementById("nome").innerText = produto.nome;
    document.getElementById("descricao").innerText = produto.descricao;
    document.getElementById("preco").innerText = `R$ ${produto.preco}`;
    document.getElementById("loja").innerText = produto.loja;
    document.getElementById("imagem").src = produto.imagem;
  } catch (erro) {
    console.log(erro);
  }
}

// Adiciona o produto carregado nesta página ao carrinho (armazenado em
// localStorage, já que o carrinho ainda não é salvo no banco de dados).
function adicionarAoCarrinho() {
  if (!produtoAtual) {
    alert("Produto ainda não carregado. Tente novamente.");
    return;
  }

  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  carrinho.push({
    nome: produtoAtual.nome,
    preco: produtoAtual.preco,
  });

  localStorage.setItem("carrinho", JSON.stringify(carrinho));

  alert(`${produtoAtual.nome} adicionado ao carrinho!`);
}

document
  .getElementById("adicionarCarrinho")
  .addEventListener("click", adicionarAoCarrinho);

carregarProduto();
