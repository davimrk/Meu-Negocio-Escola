const API = "http://localhost:3000";
const formProduto = document.getElementById("formProduto");

if (formProduto) {
  formProduto.addEventListener("submit", cadastrarProduto);
}

async function cadastrarProduto(event) {
  event.preventDefault();

  const nome = document.getElementById("nome").value;
  const tipo = document.getElementById("tipo").value;
  const preco = Number(document.getElementById("preco").value);
  const produto = { nome, tipo, preco };

  try {
    const resposta = await fetch(`${API}/produtos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(produto),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.erro);
      return;
    }
    alert("Produto cadastrado!");
    formProduto.reset();

    carregarProdutos();
  } catch (erro) {
    console.log(erro);
  }
}

async function carregarProdutos() {
  const lista = document.getElementById("listaProdutos");
  if (!lista) return;

  try {
    const resposta = await fetch(`${API}/produtos`);
    const produtos = await resposta.json();
    lista.innerHTML = "";

    for (let produto of produtos) {
      let imagemProduto = "coxaxinha.jpg";

      const nomeMinusculo = produto.nome.toLowerCase();

      if (
        nomeMinusculo.includes("coca") ||
        nomeMinusculo.includes("coquinha")
      ) {
        imagemProduto = "coquinha.jpg";
      } else if (
        nomeMinusculo.includes("bolo") ||
        nomeMinusculo.includes("bolinho")
      ) {
        imagemProduto = "bolinho.jpeg";
      }
      lista.innerHTML += `
                <div class="produto-card">
                    <div class="produto-titulo">
                        <img src="${imagemProduto}" class="produto-img-mini" alt="Foto">
                        <h3>${produto.nome}</h3>
                    </div>
                   
                    <p>Tipo: ${produto.tipo}</p>
                    <p>Preço: R$ ${Number(produto.preco).toFixed(2)}</p>
 
                    <button onclick="removerProduto(${produto.id})">
                        Remover
                    </button>
                </div>
            `;
    }
  } catch (erro) {
    console.log(erro);
  }
}

async function removerProduto(id) {
  try {
    await fetch(`${API}/produtos/${id}`, {
      method: "DELETE",
    });

    carregarProdutos();
  } catch (erro) {
    console.log(erro);
  }
}

carregarProdutos();
