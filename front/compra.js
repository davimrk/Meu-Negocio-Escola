//código aleatorio, efetuação de compra (Morani)//

function gerarCodigo() {
  const num = Math.floor(1000 + Math.random() * 9000);
  const codigo = document.getElementById("codigo");
  if (codigo) {
    codigo.innerText = "MN-" + num;
  }
}

window.onload = gerarCodigo;
