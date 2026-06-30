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

app.post("/api/lojas", (req, res) => {
  const {
    id_empreendedor,
    nome,
    descricao,
    horario_funcionamento,
    ativa,
    foto_logo,
  } = req.body;

  if (!id_empreendedor) {
    return res.status(400).json({
      erro: "Empreendedor obrigatório",
    });
  }

  if (!nome) {
    return res.status(400).json({
      erro: "Nome obrigatório",
    });
  }

  const verifica = `
  SELECT id_empreendedor
  FROM Empreendedor
  WHERE id_empreendedor = ?
  `;

  db.query(verifica, [id_empreendedor], (erro, resultado) => {
    if (erro) {
      console.log(erro);

      return res.status(500).json({
        erro: erro.message,
      });
    }

    if (resultado.length === 0) {
      return res.status(404).json({
        erro: "Empreendedor não encontrado",
      });
    }

    const sql = `

    INSERT INTO Loja
    (
      id_empreendedor,
      nome,
      descricao,
      horario_funcionamento,
      ativa,
      foto_logo
    )

    VALUES (?, ?, ?, ?, ?, ?)

    `;

    db.query(
      sql,
      [
        id_empreendedor,
        nome,
        descricao || null,
        horario_funcionamento || null,
        ativa ?? 1,
        foto_logo || null,
      ],
      (erro, resultado) => {
        if (erro) {
          console.log(erro);

          return res.status(500).json({
            erro: erro.message,
          });
        }

        res.status(201).json({
          mensagem: "Loja criada",
          id_loja: resultado.insertId,
        });
      },
    );
  });
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

app.get("/api/categorias", (req, res) => {
  db.query("SELECT * FROM Categoria ORDER BY nome", (erro, resultado) => {
    if (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao buscar categorias." });
    }
    res.json(resultado);
  });
});

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

function buscarOuCriarCarrinhoAberto(id_usuario, callback) {
  const sqlBusca =
    "SELECT id_carrinho FROM carrinho WHERE id_usuario = ? AND statusC = 'aberto'";

  db.query(sqlBusca, [id_usuario], (erro, resultado) => {
    if (erro) return callback(erro);

    if (resultado.length > 0) {
      return callback(null, resultado[0].id_carrinho);
    }

    const sqlCria =
      "INSERT INTO carrinho (id_usuario, data_criacao, statusC) VALUES (?, CURDATE(), 'aberto')";

    db.query(sqlCria, [id_usuario], (erro2, resultadoInsert) => {
      if (erro2) return callback(erro2);
      callback(null, resultadoInsert.insertId);
    });
  });
}

app.get("/api/carrinho/:id_usuario", (req, res) => {
  const { id_usuario } = req.params;

  const sqlCarrinho =
    "SELECT id_carrinho FROM carrinho WHERE id_usuario = ? AND statusC = 'aberto'";

  db.query(sqlCarrinho, [id_usuario], (erro, resultadoCarrinho) => {
    if (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao buscar carrinho." });
    }

    if (resultadoCarrinho.length === 0) {
      return res.json({ id_carrinho: null, itens: [] });
    }

    const id_carrinho = resultadoCarrinho[0].id_carrinho;

    const sqlItens = `
      SELECT
        itemcarrinho.id_item_carrinho,
        itemcarrinho.quantidade,
        produto.id_produto,
        produto.nome,
        produto.preco,
        produto.foto,
        (produto.preco * itemcarrinho.quantidade) AS subtotal
      FROM itemcarrinho
      JOIN produto ON produto.id_produto = itemcarrinho.id_produto
      WHERE itemcarrinho.id_carrinho = ?
    `;

    db.query(sqlItens, [id_carrinho], (erro2, itens) => {
      if (erro2) {
        console.error(erro2);
        return res
          .status(500)
          .json({ erro: "Erro ao buscar itens do carrinho." });
      }

      res.json({ id_carrinho, itens });
    });
  });
});

app.post("/api/carrinho/item", (req, res) => {
  const { id_usuario, id_produto, quantidade } = req.body;
  const qtd = Number(quantidade) || 1;

  if (!id_usuario || !id_produto) {
    return res
      .status(400)
      .json({ erro: "id_usuario e id_produto são obrigatórios." });
  }

  buscarOuCriarCarrinhoAberto(id_usuario, (erro, id_carrinho) => {
    if (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao abrir carrinho." });
    }

    const sqlVerifica =
      "SELECT id_item_carrinho, quantidade FROM itemcarrinho WHERE id_carrinho = ? AND id_produto = ?";

    db.query(sqlVerifica, [id_carrinho, id_produto], (erro2, resultado) => {
      if (erro2) {
        console.error(erro2);
        return res.status(500).json({ erro: "Erro ao verificar item." });
      }

      if (resultado.length > 0) {
        const novaQuantidade = resultado[0].quantidade + qtd;

        db.query(
          "UPDATE itemcarrinho SET quantidade = ? WHERE id_item_carrinho = ?",
          [novaQuantidade, resultado[0].id_item_carrinho],
          (erro3) => {
            if (erro3) {
              console.error(erro3);
              return res.status(500).json({ erro: "Erro ao atualizar item." });
            }

            res.json({ mensagem: "Quantidade atualizada.", id_carrinho });
          },
        );
      } else {
        db.query(
          "INSERT INTO itemcarrinho (id_carrinho, id_produto, quantidade) VALUES (?, ?, ?)",
          [id_carrinho, id_produto, qtd],
          (erro3) => {
            if (erro3) {
              console.error(erro3);
              return res.status(500).json({ erro: "Erro ao adicionar item." });
            }

            res.json({ mensagem: "Item adicionado ao carrinho.", id_carrinho });
          },
        );
      }
    });
  });
});

app.put("/api/carrinho/item/:id_item_carrinho", (req, res) => {
  const { quantidade } = req.body;

  if (!quantidade || quantidade < 1) {
    return res.status(400).json({ erro: "Quantidade inválida." });
  }

  db.query(
    "UPDATE itemcarrinho SET quantidade = ? WHERE id_item_carrinho = ?",
    [quantidade, req.params.id_item_carrinho],
    (erro, resultado) => {
      if (erro) {
        console.error(erro);
        return res.status(500).json({ erro: "Erro ao atualizar item." });
      }

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ erro: "Item não encontrado." });
      }

      res.json({ mensagem: "Quantidade atualizada." });
    },
  );
});

app.delete("/api/carrinho/item/:id_item_carrinho", (req, res) => {
  db.query(
    "DELETE FROM itemcarrinho WHERE id_item_carrinho = ?",
    [req.params.id_item_carrinho],
    (erro, resultado) => {
      if (erro) {
        console.error(erro);
        return res.status(500).json({ erro: "Erro ao remover item." });
      }

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ erro: "Item não encontrado." });
      }

      res.json({ mensagem: "Item removido." });
    },
  );
});

function gerarCodigoRetirada() {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "MN-";

  for (let i = 0; i < 4; i++) {
    codigo += caracteres[Math.floor(Math.random() * caracteres.length)];
  }

  return codigo;
}

app.post("/api/encomendas", (req, res) => {
  const { id_usuario, nome, observacao } = req.body;

  if (!id_usuario) {
    return res.status(400).json({ erro: "id_usuario é obrigatório." });
  }

  const sqlCarrinho =
    "SELECT id_carrinho FROM carrinho WHERE id_usuario = ? AND statusC = 'aberto'";

  db.query(sqlCarrinho, [id_usuario], (erro, resultadoCarrinho) => {
    if (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao buscar carrinho." });
    }

    if (resultadoCarrinho.length === 0) {
      return res.status(400).json({ erro: "Você não tem um carrinho aberto." });
    }

    const id_carrinho = resultadoCarrinho[0].id_carrinho;

    const sqlItens = `
      SELECT itemcarrinho.id_produto, itemcarrinho.quantidade,
             produto.preco, produto.id_loja
      FROM itemcarrinho
      JOIN produto ON produto.id_produto = itemcarrinho.id_produto
      WHERE itemcarrinho.id_carrinho = ?
    `;

    db.query(sqlItens, [id_carrinho], (erro2, itens) => {
      if (erro2) {
        console.error(erro2);
        return res
          .status(500)
          .json({ erro: "Erro ao buscar itens do carrinho." });
      }

      if (itens.length === 0) {
        return res.status(400).json({ erro: "Seu carrinho está vazio." });
      }

      const itensPorLoja = {};
      itens.forEach((item) => {
        if (!itensPorLoja[item.id_loja]) itensPorLoja[item.id_loja] = [];
        itensPorLoja[item.id_loja].push(item);
      });

      const idsLojas = Object.keys(itensPorLoja);
      const encomendasCriadas = [];
      let indiceLojaAtual = 0;

      function processarProximaLoja() {
        if (indiceLojaAtual >= idsLojas.length) {
          db.query(
            "UPDATE carrinho SET statusC = 'finalizado' WHERE id_carrinho = ?",
            [id_carrinho],
            (erroFinaliza) => {
              if (erroFinaliza) {
                console.error(erroFinaliza);
              }

              return res.status(201).json({
                mensagem: "Encomenda(s) criada(s) com sucesso!",
                encomendas: encomendasCriadas,
              });
            },
          );
          return;
        }

        const id_loja = idsLojas[indiceLojaAtual];
        const itensDaLoja = itensPorLoja[id_loja];

        const valor_total = itensDaLoja.reduce(
          (soma, item) => soma + item.preco * item.quantidade,
          0,
        );

        const sqlCriaEncomenda = `
          INSERT INTO encomenda (id_usuario, data, status, valor_total, observacao)
          VALUES (?, CURDATE(), 'pendente', ?, ?)
        `;

        db.query(
          sqlCriaEncomenda,
          [id_usuario, valor_total, observacao || null],
          (erro3, resultadoEncomenda) => {
            if (erro3) {
              console.error(erro3);
              return res.status(500).json({ erro: "Erro ao criar encomenda." });
            }

            const id_encomenda = resultadoEncomenda.insertId;

            const valoresItens = itensDaLoja.map((item) => [
              id_encomenda,
              item.id_produto,
              item.quantidade,
              item.preco,
              item.preco * item.quantidade,
            ]);

            const sqlInsereItens = `
              INSERT INTO itemencomenda
                (id_encomenda, id_produto, quantidade, preco_unitario, subtotal)
              VALUES ?
            `;

            db.query(sqlInsereItens, [valoresItens], (erro4) => {
              if (erro4) {
                console.error(erro4);
                return res
                  .status(500)
                  .json({ erro: "Erro ao salvar itens da encomenda." });
              }

              const codigo_retirada = gerarCodigoRetirada();

              const sqlRetirada = `
                INSERT INTO retirada (id_encomenda, codigo_retirada, nome, data_retirada)
                VALUES (?, ?, ?, NULL)
              `;

              db.query(
                sqlRetirada,
                [id_encomenda, codigo_retirada, nome || null],
                (erro5) => {
                  if (erro5) {
                    console.error(erro5);
                    return res
                      .status(500)
                      .json({ erro: "Erro ao gerar código de retirada." });
                  }

                  encomendasCriadas.push({
                    id_encomenda,
                    valor_total,
                    codigo_retirada,
                    id_loja,
                  });

                  indiceLojaAtual++;
                  processarProximaLoja();
                },
              );
            });
          },
        );
      }

      processarProximaLoja();
    });
  });
});

app.get("/api/encomendas/:id", (req, res) => {
  const { id } = req.params;

  const sqlEncomenda = `
    SELECT encomenda.*, retirada.codigo_retirada, retirada.nome AS nome_retirada
    FROM encomenda
    LEFT JOIN retirada ON retirada.id_encomenda = encomenda.id_encomenda
    WHERE encomenda.id_encomenda = ?
  `;

  db.query(sqlEncomenda, [id], (erro, resultadoEncomenda) => {
    if (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao buscar encomenda." });
    }

    if (resultadoEncomenda.length === 0) {
      return res.status(404).json({ erro: "Encomenda não encontrada." });
    }

    const sqlItens = `
      SELECT itemencomenda.quantidade, itemencomenda.preco_unitario,
             itemencomenda.subtotal, produto.nome
      FROM itemencomenda
      JOIN produto ON produto.id_produto = itemencomenda.id_produto
      WHERE itemencomenda.id_encomenda = ?
    `;

    db.query(sqlItens, [id], (erro2, itens) => {
      if (erro2) {
        console.error(erro2);
        return res
          .status(500)
          .json({ erro: "Erro ao buscar itens da encomenda." });
      }

      res.json({ ...resultadoEncomenda[0], itens });
    });
  });
});

app.get("/api/encomendas/loja/:id_loja", (req, res) => {
  const { id_loja } = req.params;

  const sqlEncomendas = `
    SELECT DISTINCT
      encomenda.id_encomenda, encomenda.data, encomenda.status,
      encomenda.valor_total, encomenda.observacao,
      retirada.codigo_retirada, retirada.nome AS nome_retirada,
      retirada.data_retirada,
      usuario.nome AS nome_aluno
    FROM encomenda
    JOIN itemencomenda ON itemencomenda.id_encomenda = encomenda.id_encomenda
    JOIN produto ON produto.id_produto = itemencomenda.id_produto
    LEFT JOIN retirada ON retirada.id_encomenda = encomenda.id_encomenda
    LEFT JOIN usuario ON usuario.id_usuario = encomenda.id_usuario
    WHERE produto.id_loja = ?
    ORDER BY encomenda.id_encomenda DESC
  `;

  db.query(sqlEncomendas, [id_loja], (erro, encomendas) => {
    if (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao buscar pedidos da loja." });
    }

    if (encomendas.length === 0) {
      return res.json([]);
    }

    const idsEncomendas = encomendas.map((e) => e.id_encomenda);

    const sqlItens = `
      SELECT itemencomenda.id_encomenda, itemencomenda.quantidade,
             itemencomenda.preco_unitario, itemencomenda.subtotal,
             produto.nome
      FROM itemencomenda
      JOIN produto ON produto.id_produto = itemencomenda.id_produto
      WHERE itemencomenda.id_encomenda IN (?)
    `;

    db.query(sqlItens, [idsEncomendas], (erro2, todosItens) => {
      if (erro2) {
        console.error(erro2);
        return res
          .status(500)
          .json({ erro: "Erro ao buscar itens dos pedidos." });
      }
      const resultado = encomendas.map((encomenda) => ({
        ...encomenda,
        itens: todosItens.filter(
          (item) => item.id_encomenda === encomenda.id_encomenda,
        ),
      }));

      res.json(resultado);
    });
  });
});

app.put("/api/encomendas/:id/status", (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const statusValidos = ["pendente", "pronta", "retirada"];

  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: "Status inválido." });
  }

  db.query(
    "UPDATE encomenda SET status = ? WHERE id_encomenda = ?",
    [status, id],
    (erro, resultado) => {
      if (erro) {
        console.error(erro);
        return res.status(500).json({ erro: "Erro ao atualizar status." });
      }

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ erro: "Encomenda não encontrada." });
      }

      if (status === "retirada") {
        db.query(
          "UPDATE retirada SET data_retirada = CURDATE() WHERE id_encomenda = ?",
          [id],
          (erro2) => {
            if (erro2) {
              console.error(erro2);
            }

            res.json({ mensagem: "Status atualizado para retirada." });
          },
        );
      } else {
        res.json({ mensagem: "Status atualizado." });
      }
    },
  );
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
