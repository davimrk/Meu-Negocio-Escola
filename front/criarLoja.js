const API = "http://localhost:3000/api/lojas";

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
  const mensagem = document.getElementById("mensagemLoja");
  const statusUploadLoja = document.getElementById("statusUploadLoja");

  mensagem.innerText = "";

  const nome = document.getElementById("nomeLoja").value;
  const descricao = document.getElementById("descricaoLoja").value;
  const hor_func = document.getElementById("hor_func").value;

  if (!nome || !descricao || !hor_func) {
    alert("Preencha todos os campos.");
    return;
  }

  const id_empreendedor = localStorage.getItem("idEmpreendedor");

  if (!id_empreendedor) {
    alert("Faça login novamente.");
    window.location.href = "login.html";
    return;
  }

  let fotoLogoUrl = "";

  const arquivoFotoLoja = inputFotoLoja?.files[0];

  if (arquivoFotoLoja) {
    try {
      statusUploadLoja.textContent = "Enviando foto...";

      fotoLogoUrl = await enviarImagemParaCloudinary(
        arquivoFotoLoja
      );

      statusUploadLoja.textContent = "Foto enviada!";
    } catch (erro) {
      console.log("Erro Cloudinary:", erro);

      statusUploadLoja.textContent =
        "Erro ao enviar foto";
    }
  }

  try {
    const dados = {
      id_empreendedor: Number(id_empreendedor),
      nome,
      descricao,
      horario_funcionamento: hor_func,
      foto_logo: fotoLogoUrl,
      ativa: "true",
    };

    console.log("Enviando:", dados);

    const resposta = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(resultado.erro);
    }

    localStorage.setItem(
      "id_loja",
      resultado.id_loja
    );

    mensagem.style.color = "green";
    mensagem.innerText =
      "Loja criada com sucesso!";

    setTimeout(() => {
      window.location.href = "minhaLoja.html";
    }, 1200);

  } catch (erro) {
    console.log(erro);

    mensagem.style.color = "red";
    mensagem.innerText = erro.message;
  }
}
