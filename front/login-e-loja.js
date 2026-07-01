const API = "http://localhost:3000";

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

// =======================
// BOTÃO PAUSAR LOJA
// =======================

const pausar = document.getElementById("pause");

if (pausar) {
  pausar.addEventListener("click", function () {
    if (pausar.innerText === "⏸ Pausar Loja") {
      pausar.innerText = "▶ Loja Pausada";

      alert("Você pausou a loja.");
    } else {
      pausar.innerText = "⏸ Pausar Loja";

      alert("Loja retomada.");
    }
  });
}

// =======================
// BOTÃO CONFIGURAR
// =======================

const config = document.getElementById("configurar");

if (config) {
  config.addEventListener(
    "click",

    () => {
      window.location.href = "configurar.html";
    },
  );
}

// =======================
// LOGIN
// =======================

const botao = document.getElementById("btnEntrar");

if (botao) {
  botao.addEventListener(
    "click",

    async () => {
      const email = document.getElementById("email").value;
      const senha = document.getElementById("senha").value;
      const erro = document.getElementById("erro");
      erro.innerText = "";

      if (!email || !senha) {
        erro.innerText = "Preencha todos os campos";

        return;
      }

      try {
        const resposta = await fetch(`${API}/login`, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            senha,
          }),
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          erro.innerText = dados.erro || "Login inválido";

          return;
        }

        // limpa dados antigos
        localStorage.removeItem("idEmpreendedor");

        localStorage.setItem("logado", "true");
        localStorage.setItem("usuarioId", dados.usuario.id);
        localStorage.setItem("usuarioNome", dados.usuario.nome);
        localStorage.setItem("usuarioTipo", dados.usuario.tipo);

        localStorage.setItem("usuario", JSON.stringify(dados.usuario));

        if (dados.usuario.id_empreendedor) {
          localStorage.setItem("idEmpreendedor", dados.usuario.id_empreendedor);
        }

        if (dados.usuario.tipo === "empreendedor") {
          window.location.href = "minhaLoja.html";
        } else {
          window.location.href = "index.html";
        }
        // redireciona
        if (dados.usuario.tipo === "empreendedor") {
          window.location.href = "minhaLoja.html";
        } else {
          window.location.href = "index.html";
        }
      } catch (erro) {
        console.error("Erro ao fazer login:", erro);
        erro.innerText = "Erro ao fazer login. Tente novamente.";
      }
    },
  );
}
