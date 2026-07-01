const API_URL = "http://localhost:3000/api/lojas";

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

async function carregarLojas() {
  const lista = document.getElementById("lojasList");
  const empty = document.getElementById("emptyMessage");

  lista.innerHTML = "";
  empty.textContent = "";

  try {
    const resposta = await fetch(API_URL);

    if (!resposta.ok) {
      throw new Error("Erro na resposta do servidor");
    }

    const lojas = await resposta.json();

    if (lojas.length === 0) {
      empty.textContent = "Nenhuma loja cadastrada.";
      return;
    }

    lojas.forEach((loja) => {
      const card = document.createElement("div");
      card.classList.add("loja-card");

      const urlFoto = loja.foto_logo
        ? `http://localhost:3000${loja.foto_logo}`
        : null;

      card.innerHTML = `
                ${urlFoto ? `<img src="${urlFoto}" alt="${loja.nome}" style="max-width:100px;">` : ""}
                <h3>${loja.nome}</h3>
                <p>${loja.descricao ?? ""}</p>
                <p>${loja.horario_funcionamento ?? ""}</p>
            `;

      lista.appendChild(card);
    });
  } catch (erro) {
    console.error("Erro ao carregar lojas:", erro);
    empty.textContent = "Erro ao carregar lojas. Tente novamente.";
  }
}

carregarLojas();
