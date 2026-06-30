const API = "http://localhost:3000/api/lojas";

// Protege a página: só empreendedores logados podem acessar criarLoja.html
document.addEventListener("DOMContentLoaded", function () {
  const idEmpreendedor = localStorage.getItem("idEmpreendedor");

  if (!idEmpreendedor) {
    alert("Você precisa ser um empreendedor logado para acessar esta página.");
    window.location.href = "login.html";
  }
});

// Mostra uma pré-visualização da foto da loja, antes de enviar
const inputFotoLoja = document.getElementById("fotoLoja");
const previewFotoLoja = document.getElementById("previewFotoLoja");

if (inputFotoLoja) {
  inputFotoLoja.addEventListener("change", function () {
    const arquivo = inputFotoLoja.files[0];

    if (arquivo) {
      previewFotoLoja.src = URL.createObjectURL(arquivo);
      previewFotoLoja.style.display = "block";
    } else {
      previewFotoLoja.style.display = "none";
    }
  });
}

async function criarLoja() {
  const nome = document.getElementById("nomeLoja").value;
  const descricao = document.getElementById("descricaoLoja").value;
  const hor_func = document.getElementById("hor_func").value;
  const mensagem = document.getElementById("mensagemLoja");

  mensagem.innerText = "";

  if (!nome || !descricao || !hor_func) {
    alert("Preencha todos os campos.");
    return;
  }


  const idEmpreendedor = localStorage.getItem("idEmpreendedor");

  if (!idEmpreendedor) {
    alert("Você precisa estar logado como empreendedor para criar uma loja.");
    return;
  }

  // Se uma foto foi escolhida, envia para o Cloudinary primeiro e usa
  // a URL pública retornada. O backend só recebe esse link como texto.
  const statusUploadLoja = document.getElementById("statusUploadLoja");
  let fotoLogoUrl = "";

  const arquivoFotoLoja = inputFotoLoja?.files[0];

  if (arquivoFotoLoja) {
    try {
      if (statusUploadLoja) statusUploadLoja.textContent = "Enviando foto...";
      fotoLogoUrl = await enviarImagemParaCloudinary(arquivoFotoLoja);
      if (statusUploadLoja) statusUploadLoja.textContent = "Foto enviada!";
    } catch (erro) {
      console.error("Erro ao enviar imagem da loja:", erro);
      if (statusUploadLoja) {
        statusUploadLoja.textContent =
          "Erro ao enviar a foto. A loja será criada sem imagem.";
      }
    }
  }

  const id_empreendedor = localStorage.getItem("idEmpreendedor");

if (!id_empreendedor) {
    alert("Faça login novamente.");
    window.location.href = "login.html";
    return;
}


  try {
    const dados = {
      id_empreendedor: Number(id_empreendedor),
      nome: document.getElementById("nomeLoja").value,
      descricao: document.getElementById("descricaoLoja").value,
      horario_funcionamento: document.getElementById("hor_func").value,
      ativa: 1
    };

    console.log("Enviando:", dados);

    const resposta = await fetch(
      "http://localhost:3000/api/lojas",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
      }
    );

    const resultado = await resposta.json();

    console.log("Resposta:", resultado);

    if (!resposta.ok) {
      throw new Error(resultado.erro);
    }

    alert("Loja criada!");
  } catch (erro) {
    console.error("Erro real:", erro);
    alert(erro.message);
  }
}


    mensagem.style.color = "green";
    mensagem.innerText = "Loja criada com sucesso! Redirecionando...";

    document.getElementById("nomeLoja").value = "";
    document.getElementById("descricaoLoja").value = "";
    document.getElementById("hor_func").value = "";
    document.getElementById("responsavel").value = "";
    if (previewFotoLoja) previewFotoLoja.style.display = "none";
    if (statusUploadLoja) statusUploadLoja.textContent = "";

    setTimeout(() => {
      window.location.href = "minhaLoja.html";
    }, 1200);
