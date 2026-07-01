document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerForm");
  const avisoLogin = document.getElementById("avisoLogin");
  const idUsuario = localStorage.getItem("usuarioId");

  const btnModo = document.getElementById("modoEscuro");

  btnModo.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
      btnModo.innerHTML = "☀️";
    } else {
      btnModo.innerHTML = "🌙";
    }
  });

  // Se a pessoa não estiver logada, bloqueia o formulário e avisa
  if (!idUsuario) {
    avisoLogin.style.color = "red";
    avisoLogin.innerText =
      "Você precisa estar logado para se cadastrar como empreendedor.";
    form.querySelector("button").disabled = true;
    return;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const cpf = document.getElementById("cpf").value.trim();

    const dados = {
      id_usuario: idUsuario,
      cpf,
    };

    try {
      const resposta = await fetch("http://localhost:3000/empreendedor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      });
      const resultado = await resposta.json();

      document.getElementById("registerResult").innerText = resultado.mensagem;

      if (resposta.ok) {
        // Já salva o id_empreendedor retornado, para uso imediato
        if (resultado.id_empreendedor) {
          localStorage.setItem("idEmpreendedor", resultado.id_empreendedor);
        }
        // Atualiza também o tipo salvo localmente
        localStorage.setItem("usuarioTipo", "empreendedor");

        setTimeout(() => {
          window.location.href = "criarLoja.html";
        }, 1500);
      }
    } catch (erro) {
      console.log(erro);
      document.getElementById("registerResult").innerText = "Erro ao cadastrar";
    }
  });
});
