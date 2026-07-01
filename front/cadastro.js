const API = "http://localhost:3000";

const email = document.getElementById("email");
const senha = document.getElementById("senha");
const nome = document.getElementById("nome");
const nascimento = document.getElementById("nascimento");
const botao = document.querySelector(".button");

const resultado = document.createElement("p");
document.getElementById("fundo").appendChild(resultado);

const btnModo = document.getElementById("modoEscuro");

btnModo.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    btnModo.innerHTML = "☀️";
  } else {
    btnModo.innerHTML = "🌙";
  }
});

[email, senha, nome, nascimento].forEach((input) => {
  input.addEventListener("focus", () => {
    input.style.border = "2px solid blue";
  });

  input.addEventListener("blur", () => {
    input.style.border = "1px solid #ccc";
  });
});

botao.addEventListener("click", async (e) => {
  e.preventDefault();

  if (!email.value || !senha.value || !nome.value || !nascimento.value) {
    resultado.textContent = "Preencha todos os campos!";
    resultado.style.color = "red";
    return;
  }

  resultado.textContent = "Cadastrando...";
  resultado.style.color = "green";

  await cadastrarAluno();
});

async function cadastrarAluno() {
  try {
    const resposta = await fetch(`${API}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome: nome.value,
        nascimento: nascimento.value,
        email: email.value,
        senha: senha.value,
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.erro);
      return;
    }

    // Loga automaticamente: salva a sessão com os dados que já temos,
    // sem precisar pedir email/senha de novo numa tela de login separada.
    localStorage.setItem("logado", "true");
    localStorage.setItem("usuarioId", dados.id);
    localStorage.setItem("usuarioNome", nome.value);
    localStorage.setItem("usuarioTipo", "aluno");

    alert("Cadastro realizado com sucesso!");
    window.location.href = "index.html";
  } catch (erro) {
    console.log(erro);
    alert("Erro ao cadastrar.");
  }
}
