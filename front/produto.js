const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let produtoAtual = null;

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

// Adiciona o produto carregado nesta página ao carrinho real (salvo no
// banco de dados, vinculado ao usuário logado).
async function adicionarAoCarrinho() {
  if (!produtoAtual) {
    alert("Produto ainda não carregado. Tente novamente.");
    return;
  }

  const id_usuario = localStorage.getItem("usuarioId");

  if (!id_usuario) {
    alert("Você precisa estar logado para adicionar itens ao carrinho.");
    window.location.href = "login.html";
    return;
  }

  try {
    const resposta = await fetch("http://localhost:3000/api/carrinho/item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario,
        id_produto: produtoAtual.id,
        quantidade: 1,
      }),
    });

    if (!resposta.ok) {
      throw new Error("Erro ao adicionar ao carrinho");
    }

    alert(`${produtoAtual.nome} adicionado ao carrinho!`);
  } catch (erro) {
    console.log("Erro ao adicionar ao carrinho:", erro);
    alert("Erro ao adicionar ao carrinho. Tente novamente.");
  }
}

document
  .getElementById("adicionarCarrinho")
  .addEventListener("click", adicionarAoCarrinho);

carregarProduto();
