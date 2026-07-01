const API = "http://localhost:3000";

const params = new URLSearchParams(window.location.search);

const btnModo = document.getElementById("modoEscuro");

btnModo.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    btnModo.innerHTML = "☀️";
  } else {
    btnModo.innerHTML = "🌙";
  }
});

// O parâmetro "id" pode conter mais de um id_encomenda, separados por
// vírgula, quando a compra envolveu mais de uma loja de uma vez.
const idsEncomendas = (params.get("id") || "")
  .split(",")
  .map((id) => id.trim())
  .filter((id) => id !== "");

async function carregarEncomendas() {
  const lista = document.getElementById("listaEncomendas");
  const erroEl = document.getElementById("mensagemErroEncomenda");

  if (idsEncomendas.length === 0) {
    if (erroEl) erroEl.textContent = "Encomenda não identificada.";
    return;
  }

  for (const id of idsEncomendas) {
    try {
      const resposta = await fetch(`${API}/api/encomendas/${id}`);
      if (!resposta.ok) throw new Error("Erro ao buscar encomenda " + id);

      const encomenda = await resposta.json();
      lista.appendChild(criarBlocoEncomenda(encomenda));
    } catch (erro) {
      console.log("Erro ao carregar encomenda:", erro);
      if (erroEl) {
        erroEl.textContent += `Não foi possível carregar uma das encomendas. `;
      }
    }
  }
}

// Monta o bloco visual de uma encomenda: itens, valor total e código
function criarBlocoEncomenda(encomenda) {
  const bloco = document.createElement("div");
  bloco.classList.add("blocoEncomenda");

  const itensHtml = encomenda.itens
    .map(
      (item) => `
        <div class="produto">
          <h2>${item.nome}</h2>
          <p class="preco">R$ ${Number(item.preco_unitario).toFixed(2)}</p>
          <div class="qtd">
            <span>Quantidade:</span>
            <span>${item.quantidade}</span>
          </div>
        </div>
      `,
    )
    .join("");

  bloco.innerHTML = `
    <div class="conteudo">
      <div class="itens-encomenda">${itensHtml}</div>
      <p class="valorTotal">Total: R$ ${Number(encomenda.valor_total).toFixed(2)}</p>
    </div>
    <div class="codigo-area">
      <h2>SEU CÓDIGO:</h2>
      <div class="codigo">#${encomenda.codigo_retirada}</div>
    </div>
  `;

  return bloco;
}

window.onload = carregarEncomendas;
