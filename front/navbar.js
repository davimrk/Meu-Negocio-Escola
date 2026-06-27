document.addEventListener("DOMContentLoaded", function () {
  const logado = localStorage.getItem("logado") === "true";

  // aceita o nome novo e o antigo
  const tipo =
    localStorage.getItem("usuarioTipo") || localStorage.getItem("tipo");

  const idEmpreendedor = localStorage.getItem("idEmpreendedor");

  const ehEmpreendedor = tipo === "empreendedor" && idEmpreendedor;

  const navbar = document.querySelector(".navbar");

  if (!navbar) return;

  const linkLogin = navbar.querySelector('a[href="login.html"]');

  const linkCadastroAluno = navbar.querySelector(
    'a[href="cadastroaluno.html"]',
  );

  const linkCadastroEmpreendedor = navbar.querySelector(
    'a[href="cadastroempreendedor.html"]',
  );

  const btnMinhaLoja = document.getElementById("btnLoja");

  // esconde inicialmente
  if (btnMinhaLoja) {
    btnMinhaLoja.style.display = "none";
  }

  if (logado) {
    if (linkLogin) {
      linkLogin.style.display = "none";
    }

    if (linkCadastroAluno) {
      linkCadastroAluno.style.display = "none";
    }

    const saudacao = document.getElementById("saudacaoUsuario");

    if (saudacao) {
      const nome = localStorage.getItem("usuarioNome");

      saudacao.innerHTML = `Bem vindo, <b>${nome || "Visitante"}</b>`;
    }

    if (ehEmpreendedor) {
      if (linkCadastroEmpreendedor) {
        linkCadastroEmpreendedor.style.display = "none";
      }

      if (btnMinhaLoja) {
        btnMinhaLoja.style.display = "inline-block";
      }
    }

    if (!document.getElementById("linkSair")) {
      const linkSair = document.createElement("a");

      linkSair.href = "#";

      linkSair.id = "linkSair";

      linkSair.innerText = "Sair";

      linkSair.addEventListener(
        "click",

        function (e) {
          e.preventDefault();

          localStorage.clear();

          window.location.href = "index.html";
        },
      );

      navbar.appendChild(linkSair);
    }
  }
});
