const API = "http://localhost:3000";

const cardapio = document.getElementById("cardapio");
const lista = document.getElementById("listaCarrinho2");

async function carregarCardapio(){

    const idLoja = 1;

    const resposta = await fetch(
        `${API}/cardapio/${idLoja}`
    );

    const produtos = await resposta.json();

    cardapio.innerHTML="";

    produtos.forEach(produto=>{

        cardapio.innerHTML += `

        <div class="card">

            <img src="${produto.foto}">

            <h2>${produto.nome}</h2>

            <p>${produto.descricao}</p>

            <p>R$ ${produto.preco}</p>

            <button onclick="
                addCarrinho(
                    '${produto.nome}',
                    ${produto.preco}
                )
            ">
                Adicionar
            </button>

        </div>

        `;

    });

}

function addCarrinho(nome, preco){

    const item = document.createElement("li");

    item.textContent =
    `${nome} - R$ ${preco}`;

    lista.appendChild(item);

}

carregarCardapio();

const carrinho =
document.getElementById("carrinho2");

const btn =
document.getElementById("btnCarrinho2");

btn.addEventListener("click",()=>{

    carrinho.classList.toggle("ativar");

});