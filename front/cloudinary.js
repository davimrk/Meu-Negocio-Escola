const CLOUDINARY_CLOUD_NAME = "dd9a66aex";
const CLOUDINARY_UPLOAD_PRESET = "meu_negocio_escola";

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

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
  return dados.secure_url;
}
const enviarImg = enviarImagemParaCloudinary;
  