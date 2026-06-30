const API = "http://localhost:3000";
const formProduto = document.getElementById("formProduto");

if (formProduto) {
  formProduto.addEventListener("submit", cadastrarProduto);
}

document.addEventListener("DOMContentLoaded", function () {
  const idEmpreendedor = localStorage.getItem("idEmpreendedor");

  if (!idEmpreendedor) {
    alert("Você precisa ser um empreendedor logado para acessar esta página.");
    window.location.href = "login.html";
  }
});

async function carregarCategorias() {
  const select = document.getElementById("tipo");
  if (!select) return;

  try {
    const resposta = await fetch(`${API}/api/categorias`);
    const categorias = await resposta.json();

    categorias.forEach((categoria) => {
      const option = document.createElement("option");
      option.value = categoria.id_categoria;
      option.textContent = categoria.nome;
      select.appendChild(option);
    });
  } catch (erro) {
    console.log("Erro ao carregar categorias:", erro);
  }
}

// Mostra uma pré-visualização da imagem escolhida, antes de enviar
const inputFoto = document.getElementById("fotoProduto");
const previewFoto = document.getElementById("previewFoto");

if (inputFoto) {
  inputFoto.addEventListener("change", function () {
    const arquivo = inputFoto.files[0];

    if (arquivo) {
      previewFoto.src = URL.createObjectURL(arquivo);
      previewFoto.style.display = "block";
    } else {
      previewFoto.style.display = "none";
    }
  });
}

async function cadastrarProduto(event) {
  event.preventDefault();

  const mensagem = document.getElementById("mensagemProduto");
  if (mensagem) mensagem.textContent = "";

  const id_loja = localStorage.getItem("id_loja");
  const nome = document.getElementById("nome").value;
  const descricao = document.getElementById("descricao")?.value || "";
  const id_categoria = document.getElementById("tipo").value;
  const preco = Number(document.getElementById("preco").value);

  if (!id_loja) {
    alert("Loja não encontrada. Faça login novamente.");
    return;
  }

  if (!nome || !preco) {
    alert("Preencha ao menos o nome e o preço do produto.");
    return;
  }

  // Se uma foto foi escolhida, envia para o Cloudinary primeiro e
  // pega a URL pública que ele retorna. O backend nunca recebe o
  // arquivo em si, só essa URL como texto.
  const statusUpload = document.getElementById("statusUpload");
  let fotoUrl = "";

  const arquivoFoto = inputFoto?.files[0];

  if (arquivoFoto) {
    try {
      if (statusUpload) statusUpload.textContent = "Enviando foto...";
      fotoUrl = await enviarImagemParaCloudinary(arquivoFoto);
      if (statusUpload) statusUpload.textContent = "Foto enviada!";
    } catch (erro) {
      console.log("Erro ao enviar imagem:", erro);
      if (statusUpload) {
        statusUpload.textContent =
          "Erro ao enviar a foto. O produto será salvo sem imagem.";
      }
    }
  }

  const produto = {
    id_loja,
    id_categoria: id_categoria || null,
    nome,
    descricao,
    preco,
    foto: fotoUrl,
  };

  try {
    const resposta = await fetch(`${API}/api/produtos`, {
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

    if (mensagem) {
      mensagem.style.color = "green";
      mensagem.textContent = "Produto cadastrado com sucesso!";
    }

    formProduto.reset();
    if (previewFoto) previewFoto.style.display = "none";
    if (statusUpload) statusUpload.textContent = "";
    carregarProdutos();
  } catch (erro) {
    console.log("Erro ao cadastrar produto:", erro);
    if (mensagem) {
      mensagem.style.color = "red";
      mensagem.textContent = "Erro ao cadastrar produto. Tente novamente.";
    }
  }
}

async function carregarProdutos() {
  const lista = document.getElementById("listaProdutos");
  if (!lista) return;

  const id_loja = localStorage.getItem("id_loja");

  if (!id_loja) {
    lista.innerHTML = "Nenhuma loja encontrada";
    return;
  }

  try {
    const resposta = await fetch(`${API}/api/produtos/loja/${id_loja}`);
    const produtos = await resposta.json();

    lista.innerHTML = "";

    if (produtos.length === 0) {
      lista.innerHTML = "<p>Nenhum produto cadastrado ainda.</p>";
      return;
    }

    for (let produto of produtos) {
      const card = document.createElement("div");
      card.classList.add("produto-card");

      card.innerHTML = `
        ${produto.foto ? `<img src="${produto.foto}" alt="${produto.nome}" class="produto-foto">` : ""}
        <h3>${produto.nome}</h3>
        <p>${produto.descricao || ""}</p>
        <p>R$ ${Number(produto.preco).toFixed(2)}</p>
        <small>${produto.categoria || ""}</small>
      `;

      const botaoRemover = document.createElement("button");
      botaoRemover.textContent = "Remover";
      botaoRemover.addEventListener("click", () =>
        removerProduto(produto.id_produto),
      );

      card.appendChild(botaoRemover);
      lista.appendChild(card);
    }
  } catch (erro) {
    console.log("Erro ao carregar produtos:", erro);
    lista.innerHTML = "<p>Erro ao carregar produtos.</p>";
  }
}

async function removerProduto(id) {
  const confirmar = confirm("Tem certeza que deseja remover este produto?");
  if (!confirmar) return;

  try {
    await fetch(`${API}/api/produtos/${id}`, {
      method: "DELETE",
    });

    carregarProdutos();
  } catch (erro) {
    console.log(erro);
  }
}

carregarCategorias();
carregarProdutos();
