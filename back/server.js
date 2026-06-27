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

// ATENÇÃO: substitua "chave" pela sua chave real da API Groq.
// Sem isso, a rota /ia sempre vai falhar com erro de autenticação.
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
  const {
    id_empreendedor,
    nome,
    descricao,
    horario_funcionamento,
    ativa,
    foto_logo,
  } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: "O campo 'nome' é obrigatório." });
  }

  const sql = `
    INSERT INTO Loja
      (id_empreendedor, nome, descricao, horario_funcionamento, ativa, foto_logo)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      id_empreendedor || null,
      nome,
      descricao || null,
      horario_funcionamento || null,
      ativa || "true",
      foto_logo || null,
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
        LEFT JOIN Categoria categoria
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

// CATEGORIAS

app.get("/api/categorias", (req, res) => {
  db.query("SELECT * FROM Categoria ORDER BY nome", (erro, resultado) => {
    if (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao buscar categorias." });
    }
    res.json(resultado);
  });
});

// PRODUTOS

app.post("/api/produtos", (req, res) => {
  const { id_loja, id_categoria, nome, descricao, preco, foto } = req.body;

  if (!id_loja || !nome || !preco) {
    return res.status(400).json({
      erro: "Preencha os campos obrigatórios",
    });
  }

  const sql = `
    INSERT INTO produto
    (id_loja, id_categoria, nome, descricao, preco, foto, disponivel)
    VALUES (?, ?, ?, ?, ?, ?, 'sim')
  `;

  db.query(
    sql,
    [
      id_loja,
      id_categoria || null,
      nome,
      descricao || null,
      preco,
      foto || null,
    ],
    (erro, resultado) => {
      if (erro) {
        console.error(erro);
        return res.status(500).json({
          erro: "Erro ao criar produto",
        });
      }

      res.json({
        mensagem: "Produto criado",
        id_produto: resultado.insertId,
      });
    },
  );
});

// GET /api/produtos
// Filtros opcionais via query string:
//   ?busca=coxinha        -> filtra pelo nome do produto
//   ?id_categoria=2       -> filtra por categoria
//   ?id_loja=3            -> filtra por loja específica
// Sem filtro nenhum, a ordem vem embaralhada (cardápio com produtos de
// todas as lojas em destaque aleatório).
app.get("/api/produtos", (req, res) => {
  const { busca, id_categoria, id_loja } = req.query;

  let sql = `
        SELECT
            produto.id_produto,
            produto.id_loja,
            produto.id_categoria,
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
  const params = [];

  if (busca) {
    sql += " AND produto.nome LIKE ?";
    params.push(`%${busca}%`);
  }

  if (id_categoria) {
    sql += " AND produto.id_categoria = ?";
    params.push(id_categoria);
  }

  if (id_loja) {
    sql += " AND produto.id_loja = ?";
    params.push(id_loja);
  }

  if (!busca && !id_categoria && !id_loja) {
    sql += " ORDER BY RAND()";
  } else {
    sql += " ORDER BY produto.nome";
  }

  db.query(sql, params, (erro, resultado) => {
    if (erro) {
      console.log(erro);
      return res.status(500).json({
        erro: "Erro ao buscar produtos",
      });
    }

    res.json(resultado);
  });
});

// Produtos de uma loja específica (usado na tela "Adicionar Produto" da loja)
app.get("/api/produtos/loja/:id_loja", (req, res) => {
  const sql = `
        SELECT
            produto.id_produto,
            produto.nome,
            produto.descricao,
            produto.preco,
            produto.foto,
            categoria.nome AS categoria
        FROM produto
        LEFT JOIN categoria ON produto.id_categoria = categoria.id_categoria
        WHERE produto.id_loja = ?
        ORDER BY produto.nome
    `;

  db.query(sql, [req.params.id_loja], (erro, resultado) => {
    if (erro) {
      console.log(erro);
      return res.status(500).json({
        erro: "Erro ao buscar produtos da loja",
      });
    }

    res.json(resultado);
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

app.delete("/api/produtos/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    "DELETE FROM produto WHERE id_produto = ?",
    [id],
    (erro, resultado) => {
      if (erro) {
        console.error(erro);
        return res.status(500).json(erro);
      }

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          erro: "Produto não encontrado.",
        });
      }

      res.json({
        mensagem: "Produto removido.",
      });
    },
  );
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
