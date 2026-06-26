const API = "http://localhost:3000";

const botao2 = document.getElementById("botao2");
const botao3 = document.getElementById("botao3");
const lista = document.getElementById("listaCarrinho");

function addcart(nome, preco) {
  const item = document.createElement("li");
  item.textContent = nome + " - R$" + preco;
  lista.appendChild(item);
}

botao2.addEventListener("click", function () {
  addcart("Coxinha", 5);
});
botao3.addEventListener("click", function () {
  addcart("Coca-Cola", 3.5);
});

//pagina inicial, carrinho (Davi)//

const carrinho = document.getElementById("carrinho");
const botao4 = document.getElementById("btnCarrinho");
botao4.addEventListener("click", function () {
  if (carrinho.style.display === "none") {
    carrinho.style.display = "block";
  } else {
    carrinho.style.display = "none";
  }
});

async function enviar() {
  const texto = document.getElementById("pedido").value;

  const resposta = await fetch("http://localhost:3000/ia", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mensagem: texto,
    }),
  });

  const dados = await resposta.json();

  console.log(dados);

  const resultado = document.getElementById("resultado");

  if (dados.choices) {
    resultado.innerText = dados.choices[0].message.content;
  } else {
    resultado.innerText = "Erro ao gerar resposta";
  }
}

const params = new URLSearchParams(window.location.search);

const id = params.get("id");

async function carregarProduto() {
  try {
    const resposta = await fetch(`http://localhost:3000/api/produtos/${id}`);

    const produto = await resposta.json();

    document.getElementById("nome").innerText = produto.nome;

    document.getElementById("descricao").innerText = produto.descricao;

    document.getElementById("preco").innerText = `R$ ${produto.preco}`;

    document.getElementById("loja").innerText = produto.loja;

    document.getElementById("imagem").src = produto.imagem;
  } catch (erro) {
    console.log(erro);
  }
}

carregarProduto();
