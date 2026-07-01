const API = "http://localhost:3000/api/lojas";

const btnModo = document.getElementById("modoEscuro");

btnModo.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    btnModo.innerHTML = "☀️";
  } else {
    btnModo.innerHTML = "🌙";
  }
});

document.addEventListener("DOMContentLoaded", async function () {
  // Mostra o nome do empreendedor logado
  const nomeEmpreendedor = localStorage.getItem("usuarioNome");
  const spanNome = document.getElementById("nomeEmpreendedor");
  if (spanNome) {
    spanNome.innerText = nomeEmpreendedor || "Empreendedor";
  }

  const idEmpreendedor = localStorage.getItem("idEmpreendedor");
  const nomeLoja = document.getElementById("nomeLoja");
  const descricaoTexto = document.getElementById("descricaoLojaTexto");
  const horarioTexto = document.getElementById("horarioLojaTexto");
  const imagemLoja = document.getElementById("imagemC");

  // Protege a página: só empreendedores logados podem ver esta tela
  if (!idEmpreendedor) {
    alert("Você precisa ser um empreendedor logado para acessar esta página.");
    window.location.href = "login.html";
    return;
  }

  try {
    // Busca a(s) loja(s) deste empreendedor
    const resposta = await fetch(`${API}?id_empreendedor=${idEmpreendedor}`);

    if (!resposta.ok) {
      throw new Error("Erro ao buscar loja");
    }

    const lojas = await resposta.json();

    if (lojas.length === 0) {
      // Empreendedor ainda não criou nenhuma loja
      if (nomeLoja) nomeLoja.innerText = "Nenhuma loja cadastrada";
      if (descricaoTexto) {
        descricaoTexto.innerHTML =
          '<a href="criarLoja.html">Clique aqui para criar sua loja</a>';
      }
      return;
    }

    // Usa a primeira loja encontrada (assumindo um empreendedor = uma loja por enquanto)
    const loja = lojas[0];
    localStorage.setItem("id_loja", loja.id_loja);

    if (nomeLoja) nomeLoja.innerText = loja.nome;
    if (descricaoTexto) descricaoTexto.innerText = loja.descricao || "";
    if (horarioTexto) {
      horarioTexto.innerText = loja.horario_funcionamento
        ? `Horário: ${loja.horario_funcionamento}`
        : "";
    }
    // Se a loja tiver uma foto cadastrada, usa ela no lugar da imagem padrão
    if (imagemLoja && loja.foto_logo) {
      imagemLoja.src = loja.foto_logo;
    }
  } catch (erro) {
    console.error("Erro ao carregar loja:", erro);
    if (nomeLoja) nomeLoja.innerText = "Erro ao carregar loja";
  }
});

const botaoConfigurar = document.getElementById("configurar");
if (botaoConfigurar) {
  botaoConfigurar.addEventListener("click", function () {
    window.location.href = "configurar.html";
  });
}
