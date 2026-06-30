// ============================================
// CONFIGURAÇÃO DO CLOUDINARY
// ============================================
// Troque os dois valores abaixo pelos seus, encontrados em:
// - CLOUD_NAME: no topo do seu Dashboard no Cloudinary
// - UPLOAD_PRESET: o nome do preset "Unsigned" que você criou em
//   Settings > Upload > Upload presets
const CLOUDINARY_CLOUD_NAME = "dd9a66aex";
const CLOUDINARY_UPLOAD_PRESET = "meu_negocio_escola";

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Envia um arquivo de imagem direto para o Cloudinary (sem passar pelo
// nosso backend) e retorna a URL pública da imagem hospedada.
// Uso: const url = await enviarImagemParaCloudinary(arquivo);
async function enviarImagemParaCloudinary(arquivo) {
  const formData = new FormData();
  formData.append("file", arquivo);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const resposta = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!resposta.ok) {
    throw new Error("Erro ao enviar imagem para o Cloudinary");
  }

  const dados = await resposta.json();

  // secure_url é a URL pública (https) da imagem já hospedada
  return dados.secure_url;
}

// Alias para compatibilidade — ambos os nomes funcionam:
// enviarImg(arquivo) e enviarImagemParaCloudinary(arquivo)
const enviarImg = enviarImagemParaCloudinary;
  