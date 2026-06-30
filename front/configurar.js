const API = "http://localhost:3000/api/lojas";

let idLojaAtual = null;
let statusAtivaAtual = "true";
let imgCloudinary = null;

// =======================
// DOM READY
// =======================
document.addEventListener("DOMContentLoaded", async function () {
  const idEmpreendedor = localStorage.getItem("idEmpreendedor");

  const inputImagem = document.getElementById("imagemLoja");
  const previewImagem = document.getElementById("previewImagem");

  if (!idEmpreendedor) {
    alert("Você precisa estar logado.");
    window.location.href = "login.html";
    return;
  }

  try {
    const resposta = await fetch(`${API}?id_empreendedor=${idEmpreendedor}`);
    const lojas = await resposta.json();

    if (lojas.length === 0) {
      alert("Você não tem loja cadastrada.");
      window.location.href = "criarLoja.html";
      return;
    }

    const loja = lojas[0];

    idLojaAtual = loja.id_loja;
    statusAtivaAtual = loja.ativa || "true";
    imgCloudinary = loja.foto_logo || "";

    document.getElementById("nomeLoja").value = loja.nome || "";
    document.getElementById("descricaoLoja").value = loja.descricao || "";
    document.getElementById("horarioLoja").value =
      loja.horario_funcionamento || "";

    if (imgCloudinary) {
      previewImagem.src = imgCloudinary;
      previewImagem.style.display = "block";
    }

  } catch (erro) {
    console.error("Erro ao carregar loja:", erro);
  }

  inputImagem.addEventListener("change", async (event) => {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    // preview local imediato
    const urlTemp = URL.createObjectURL(arquivo);
    previewImagem.src = urlTemp;
    previewImagem.style.display = "block";

    try {
      // upload Cloudinary (vem do cloudinary.js)
      const urlCloud = await enviarImg(arquivo);

      previewImagem.src = urlCloud;
      imgCloudinary = urlCloud;

      console.log("Upload concluído:", urlCloud);

    } catch (err) {
      console.error(err);
      alert("Erro ao enviar imagem");
    }
  });
});

// =======================
// SALVAR ALTERAÇÕES
// =======================
async function salvarAlteracoes(event) {
  event.preventDefault();

  const mensagem = document.getElementById("mensagemConfigurar");
  mensagem.textContent = "";

  if (!idLojaAtual) {
    alert("Loja não encontrada.");
    return;
  }

  const nome = document.getElementById("nomeLoja").value;
  const descricao = document.getElementById("descricaoLoja").value;
  const horario_funcionamento =
    document.getElementById("horarioLoja").value;

  if (!nome) {
    alert("Nome da loja é obrigatório.");
    return;
  }

  try {
    const resposta = await fetch(`${API}/${idLojaAtual}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        descricao,
        horario_funcionamento,
        ativa: statusAtivaAtual,
        foto_logo: imgCloudinary,
      }),
    });

    if (!resposta.ok) {
      throw new Error("Erro ao salvar alterações");
    }

    mensagem.style.color = "green";
    mensagem.textContent = "Alterações salvas com sucesso!";
  } catch (erro) {
    console.error("Erro ao salvar:", erro);
    mensagem.style.color = "red";
    mensagem.textContent = "Erro ao salvar alterações.";
  }
}