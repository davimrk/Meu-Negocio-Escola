const API = "http://localhost:3000";
const formProduto = document.getElementById("formProduto");

if (formProduto) {
  formProduto.addEventListener("submit", cadastrarProduto);
}

async function cadastrarProduto(event) {
  event.preventDefault();

  const id_loja = localStorage.getItem("id_loja");
  const nome = document.getElementById("nome").value;
  const descricao = document.getElementById("descricao")?.value || "";
  const preco = Number(document.getElementById("preco").value);

  if (!id_loja) {
    alert("Loja não encontrada. Faça login novamente.");
    return;
  }

  const produto = {
    id_loja,
    id_categoria: 1,
    nome,
    descricao,
    preco,
    foto: "",
  };

  const resposta = await fetch("http://localhost:3000/api/produtos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(produto),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    alert(dados.erro);
    return;
  }

  alert("Produto criado!");
  carregarProdutos();
}

async function carregarProdutos() {
  const lista = document.getElementById("listaProdutos");
  if (!lista) return;

  const id_loja = localStorage.getItem("id_loja");

  if (!id_loja) {
    lista.innerHTML = "Nenhuma loja encontrada";
    return;
  }

  const resposta = await fetch(
    `http://localhost:3000/api/produtos/loja/${id_loja}`,
  );

  const produtos = await resposta.json();

  lista.innerHTML = "";

  for (let produto of produtos) {
    lista.innerHTML += `
      <div class="produto-card">
        <h3>${produto.nome}</h3>
        <p>${produto.descricao || ""}</p>
        <p>R$ ${Number(produto.preco).toFixed(2)}</p>
        <small>${produto.categoria || ""}</small>
      </div>
    `;
  }
}

async function removerProduto(id) {
  try {
    await fetch(`${API}/api/produtos/${id}`, {
      method: "DELETE",
    });

    carregarProdutos();
  } catch (erro) {
    console.log(erro);
  }
}

carregarProdutos();
