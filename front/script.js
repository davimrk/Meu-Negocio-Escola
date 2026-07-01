const API = "http://localhost:3000";

const botao2 = document.getElementById("botao2");
const botao3 = document.getElementById("botao3");
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

const botao4 = document.getElementById("btnCarrinho");
botao4.addEventListener("click", function () {
  if (carrinho.style.display === "none") {
    carrinho.style.display = "block";
  } else {
    carrinho.style.display = "none";
  }
});

async function enviar() {
  const texto = document.getElementById("pedido").value;

  const resposta = await fetch("http://localhost:3000/ia", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mensagem: texto,
    }),
  });

  const dados = await resposta.json();

  console.log(dados);

  const resultado = document.getElementById("resultado");

  if (dados.choices) {
    resultado.innerText = dados.choices[0].message.content;
  } else {
    resultado.innerText = "Erro ao gerar resposta";
  }
}
