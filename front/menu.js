const container = document.getElementById("listaProdutos");

async function carregarProdutos() {

    const resposta = await fetch("http://localhost:3000/api/produtos");
    const produtos = await resposta.json();

    container.innerHTML = "";

    produtos.forEach(produto => {

        const div = document.createElement("div");

        div.innerHTML = `
            <img src="${produto.foto}" width="100">
            <h3>${produto.nome}</h3>
            <p>${produto.descricao}</p>
            <p>R$ ${produto.preco}</p>
            <small>${produto.loja}</small>
        `;

        div.onclick = () => {
            window.location.href = `produto.html?id=${produto.id_produto}`;
        };

        container.appendChild(div);

    });

}

carregarProdutos();