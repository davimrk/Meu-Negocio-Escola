const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "MNE",
});

db.connect((erro) => {
  if (erro) {
    console.error("Erro ao conectar ao banco de dados:", erro);
  } else {
    console.log("Conectado ao banco de dados MySQL");
  }
});

const app = express();

app.use(cors());
app.use(express.json());

const TOKEN = "chave";

app.get("/", (req, res) => {
  res.json({
    mensagem: "API funcionando!",
  });
});

app.post("/ia", async (req, res) => {
  try {
    const mensagem = req.body.mensagem;

    const resposta = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "Você é uma IA de cantina escolar divertida. Recomende apenas itens vendidos numa escola.",
            },
            {
              role: "user",
              content: mensagem,
            },
          ],
        }),
      },
    );

    const dados = await resposta.json();
    res.json(dados);
  } catch (erro) {
    console.log("ERRO IA:", erro);
    res.status(500).json({
      erro: erro.message,
    });
  }
});

app.post("/usuarios", (req, res) => {
  const { nome, nascimento, email, senha } = req.body;

  if (!nome || !nascimento || !email || !senha) {
    return res.status(400).json({
      erro: "Preencha todos os campos.",
    });
  }

  const verificaSQL = "select * from Usuario where email = ?";

  db.query(verificaSQL, [email], (erro, resultado) => {
    if (erro) {
      return res.status(500).json(erro);
    }

    if (resultado.length > 0) {
      return res.status(400).json({
        erro: "Este email já está cadastrado.",
      });
    }

    const inserirSQL =
      "insert into Usuario (nome, nascimento, email, senha, tipo) values (?, ?, ?, ?, ?)";

    db.query(
      inserirSQL,
      [nome, nascimento, email, senha, "aluno"],
      (erro, resultado) => {
        if (erro) {
          return res.status(500).json(erro);
        }

        res.status(201).json({
          mensagem: "Usuário cadastrado com sucesso",
          id: resultado.insertId,
        });
      },
    );
  });
});

// LOGIN - agora também retorna id_empreendedor quando o usuário é um empreendedor
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  const sql = "SELECT * FROM Usuario WHERE email = ? AND senha = ?";

  db.query(sql, [email, senha], (erro, resultado) => {
    if (erro) {
      return res.status(500).json({ erro: "Erro no servidor" });
    }

    if (resultado.length === 0) {
      return res.status(401).json({ erro: "Login inválido" });
    }

    const usuario = resultado[0];

    // Se o usuário for do tipo empreendedor, busca o id_empreendedor vinculado
    if (usuario.tipo === "empreendedor") {
      const sqlEmpreendedor =
        "SELECT id_empreendedor FROM Empreendedor WHERE id_usuario = ?";

      db.query(sqlEmpreendedor, [usuario.id_usuario], (erro2, resultado2) => {
        if (erro2) {
          return res.status(500).json({ erro: "Erro no servidor" });
        }

        const id_empreendedor =
          resultado2.length > 0 ? resultado2[0].id_empreendedor : null;

        return res.json({
          mensagem: "Login realizado",
          usuario: {
            id: usuario.id_usuario,
            nome: usuario.nome,
            email: usuario.email,
            tipo: usuario.tipo,
            id_empreendedor,
          },
        });
      });
    } else {
      return res.json({
        mensagem: "Login realizado",
        usuario: {
          id: usuario.id_usuario,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo,
        },
      });
    }
  });
});

// Cadastro de empreendedor - exige que a pessoa já tenha um Usuario (esteja logada)
// A tabela Empreendedor só tem: id_empreendedor, id_usuario, cpf, tipo
app.post("/empreendedor", (req, res) => {
  const { id_usuario, cpf } = req.body;

  if (!id_usuario) {
    return res.status(400).json({
      mensagem:
        "É necessário estar logado para se cadastrar como empreendedor.",
    });
  }

  if (!cpf) {
    return res.status(400).json({
      mensagem: "O campo CPF é obrigatório.",
    });
  }

  // Confirma que o usuário existe antes de criar o vínculo
  const sqlBuscaUsuario = "SELECT id_usuario FROM Usuario WHERE id_usuario = ?";

  db.query(sqlBuscaUsuario, [id_usuario], (erro, resultadoUsuario) => {
    if (erro) {
      console.log(erro);
      return res.status(500).json({ mensagem: erro.message });
    }

    if (resultadoUsuario.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    const sqlInserir = `
      INSERT INTO Empreendedor
      (cpf, id_usuario, tipo)
      VALUES (?, ?, ?)
    `;

    db.query(
      sqlInserir,
      [cpf, id_usuario, "empreendedor"],
      (erro2, resultado) => {
        if (erro2) {
          console.log(erro2);
          return res.status(500).json({ mensagem: erro2.message });
        }

        const sqlAtualizaTipo =
          "UPDATE Usuario SET tipo = ? WHERE id_usuario = ?";

        db.query(sqlAtualizaTipo, ["empreendedor", id_usuario], (erro3) => {
          if (erro3) {
            console.log(erro3);
          }

          res.json({
            mensagem: "Empreendedor cadastrado!",
            id_empreendedor: resultado.insertId,
          });
        });
      },
    );
  });
});

// LOJAS

app.get("/api/lojas", (req, res) => {
  const { id_empreendedor } = req.query;

  let query = "SELECT * FROM Loja";
  const params = [];

  if (id_empreendedor) {
    query += " WHERE id_empreendedor = ?";
    params.push(id_empreendedor);
  }

  db.query(query, params, (erro, resultado) => {
    if (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao buscar lojas." });
    }
    res.json(resultado);
  });
});

app.get("/api/lojas/:id", (req, res) => {
  db.query(
    "SELECT * FROM Loja WHERE id_loja = ?",
    [req.params.id],
    (erro, resultado) => {
      if (erro) {
        console.error(erro);
        return res.status(500).json({ erro: "Erro ao buscar loja." });
      }

      if (resultado.length === 0) {
        return res.status(404).json({ erro: "Loja não encontrada." });
      }

      res.json(resultado[0]);
    },
  );
});

// POST - criar loja (sem foto por enquanto)
app.post("/api/lojas", (req, res) => {
  const { id_empreendedor, nome, descricao, horario_funcionamento, ativa } =
    req.body;

  if (!nome) {
    return res.status(400).json({ erro: "O campo 'nome' é obrigatório." });
  }

  const sql = `
    INSERT INTO Loja
      (id_empreendedor, nome, descricao, horario_funcionamento, ativa)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      id_empreendedor || null,
      nome,
      descricao || null,
      horario_funcionamento || null,
      ativa || "true",
    ],
    (erro, resultado) => {
      if (erro) {
        console.error(erro);
        return res.status(500).json({ erro: "Erro ao criar loja." });
      }

      res.status(201).json({
        id_loja: resultado.insertId,
      });
    },
  );
});

app.put("/api/lojas/:id", (req, res) => {
  const { nome, descricao, horario_funcionamento, ativa } = req.body;

  const sql = `
    UPDATE Loja SET
      nome = ?,
      descricao = ?,
      horario_funcionamento = ?,
      ativa = ?
    WHERE id_loja = ?
  `;

  db.query(
    sql,
    [nome, descricao, horario_funcionamento, ativa, req.params.id],
    (erro, resultado) => {
      if (erro) {
        console.error(erro);
        return res.status(500).json({ erro: "Erro ao atualizar loja." });
      }

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ erro: "Loja não encontrada." });
      }

      res.json({ mensagem: "Loja atualizada com sucesso." });
    },
  );
});

app.delete("/api/lojas/:id", (req, res) => {
  db.query(
    "DELETE FROM Loja WHERE id_loja = ?",
    [req.params.id],
    (erro, resultado) => {
      if (erro) {
        console.error(erro);
        return res.status(500).json({ erro: "Erro ao remover loja." });
      }

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ erro: "Loja não encontrada." });
      }

      res.json({ mensagem: "Loja removida com sucesso." });
    },
  );
});

app.get("/cardapio/:idLoja", (req, res) => {
  const { idLoja } = req.params;

  const sql = `
        SELECT 
            produto.id_produto,
            produto.nome,
            produto.descricao,
            produto.preco,
            produto.foto,
            categoria.nome AS categoria
        FROM Produto produto
        INNER JOIN Categoria categoria
        ON produto.id_categoria = categoria.id_categoria
        WHERE produto.id_loja = ?
        AND produto.disponivel = 'sim'
        ORDER BY categoria.nome
    `;

  db.query(sql, [idLoja], (erro, dados) => {
    if (erro) {
      console.log(erro);

      return res.status(500).json({
        erro: "Erro ao buscar cardápio",
      });
    }

    res.json(dados);
  });
});

app.get("/api/produtos/:id", (req, res) => {
  const { id } = req.params;

  const sql = `

SELECT
produto.id_produto,
produto.nome,
produto.descricao,
produto.preco,
produto.foto,
loja.nome AS loja

FROM produto

INNER JOIN loja
ON produto.id_loja =
loja.id_loja

WHERE produto.id_produto = ?

`;

  db.query(sql, [id], (erro, resultado) => {
    if (erro) {
      return res.status(500).json({
        erro: "Erro ao buscar produto",
      });
    }

    if (resultado.length === 0) {
      return res.status(404).json({
        erro: "Produto não encontrado",
      });
    }

    res.json({
      id: resultado[0].id_produto,
      nome: resultado[0].nome,
      descricao: resultado[0].descricao,
      preco: resultado[0].preco,
      loja: resultado[0].loja,
      imagem: resultado[0].foto,
    });
  });
});

app.post("/produtos", (req, res) => {
 
    const { nome, tipo, preco } = req.body;
 
    if (!nome || !tipo || !preco) {
        return res.status(400).json({
            erro: "Preencha todos os campos."
        });
    }
 
    const sql =
    "INSERT INTO produtos (nome, tipo, preco) VALUES (?, ?, ?)";
 
    db.query(
        sql,
        [nome, tipo, preco],
        (erro, resultado) => {
 
            if (erro) {
                return res.status(500).json(erro);
            }
 
            res.status(201).json({
                mensagem: "Produto cadastrado.",
                id: resultado.insertId
            });
        }
    );
});
 
app.get("/produtos", (req, res) => {
 
    db.query(
        "SELECT * FROM produtos",
        (erro, resultado) => {
 
            if (erro) {
                return res.status(500).json(erro);
            }
 
            res.json(resultado);
        }
    );
});
 
app.delete("/produtos/:id", (req, res) => {
 
    const id = req.params.id;
 
    db.query(
        "DELETE FROM produtos WHERE id = ?",
        [id],
        (erro, resultado) => {
 
            if (erro) {
                return res.status(500).json(erro);
            }
 
            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    erro: "Produto não encontrado."
                });
            }
 
            res.json({
                mensagem: "Produto removido."
            });
        }
    );
});

app.post("/api/produtos", (req, res) => {
  const {
    id_loja,
    id_categoria,
    nome,
    descricao,
    preco,
    foto
  } = req.body;

  if (!id_loja || !nome || !preco) {
    return res.status(400).json({
      erro: "Preencha os campos obrigatórios"
    });
  }

  const sql = `
    INSERT INTO produto
    (id_loja, id_categoria, nome, descricao, preco, foto, disponivel)
    VALUES (?, ?, ?, ?, ?, ?, 'sim')
  `;

  db.query(sql, [
    id_loja,
    id_categoria || null,
    nome,
    descricao || null,
    preco,
    foto || null
  ], (erro, resultado) => {
    if (erro) {
      return res.status(500).json({
        erro: "Erro ao criar produto"
      });
    }

    res.json({
      mensagem: "Produto criado",
      id_produto: resultado.insertId
    });
  });
});

app.get("/api/produtos", (req, res) => {

    const sql = `
        SELECT
            produto.id_produto,
            produto.nome,
            produto.descricao,
            produto.preco,
            produto.foto,
            loja.nome AS loja,
            categoria.nome AS categoria
        FROM produto
        LEFT JOIN loja ON produto.id_loja = loja.id_loja
        LEFT JOIN categoria ON produto.id_categoria = categoria.id_categoria
        WHERE produto.disponivel = 'sim'
    `;

    db.query(sql, (erro, resultado) => {

        if (erro) {
            console.log(erro);
            return res.status(500).json({
                erro: "Erro ao buscar produtos"
            });
        }

        res.json(resultado);

    });

});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
