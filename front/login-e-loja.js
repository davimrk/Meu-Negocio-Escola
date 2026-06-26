const API = "http://localhost:3000";

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

        // salva sessão
        localStorage.setItem("logado", "true");

        localStorage.setItem("usuarioId", dados.usuario.id);

        localStorage.setItem("usuarioNome", dados.usuario.nome);

        localStorage.setItem("usuarioTipo", dados.usuario.tipo);

        if (dados.usuario.id_empreendedor) {
          localStorage.setItem("idEmpreendedor", dados.usuario.id_empreendedor);

          try {
            const resLoja = await fetch(
              `${API}/api/lojas?id_empreendedor=${dados.usuario.id_empreendedor}`,
            );

            const lojas = await resLoja.json();

            if (lojas.length > 0) {
              localStorage.setItem("id_loja", lojas[0].id_loja);
            } else {
              alert(
                "Você ainda não tem uma loja. Crie uma antes de continuar.",
              );
              window.location.href = "create.html";
              return;
            }
          } catch (err) {
            console.log("Erro ao buscar loja:", err);
          }
        }

        // redireciona
        if (dados.usuario.tipo === "empreendedor") {
          window.location.href = "minhaloja.html";
        } else {
          window.location.href = "index.html";
        }
      } catch (err) {
        console.log(err);

        erro.innerText = "Erro no servidor.";
      }
    },
  );
}
