const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();
const port = 3000;

// Permite receber JSON no corpo das requisições
app.use(express.json());

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Conectar ao banco SQLite
const db = new sqlite3.Database("database.sqlite");

// Criar tabela se não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tarefas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      concluida BOOLEAN DEFAULT 0,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Inserir dados de exemplo (apenas se a tabela estiver vazia)
  db.get("SELECT COUNT(*) as count FROM tarefas", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO tarefas (titulo, concluida) VALUES (?, ?)");
      stmt.run("Estudar Node.js", 0);
      stmt.run("Criar API de ToDo", 0);
      stmt.finalize();
      console.log("📊 Dados de exemplo inseridos no banco");
    }
  });
});

// Rota para servir o frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota GET - listar todas as tarefas
app.get("/tarefas", (req, res) => {
  db.all("SELECT * FROM tarefas ORDER BY id DESC", (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao buscar tarefas", detalhes: err.message });
    }
    
    // Converter 0/1 para false/true
    const tarefas = rows.map(row => ({
      ...row,
      concluida: Boolean(row.concluida)
    }));
    
    res.json(tarefas);
  });
});

// Rota GET - buscar tarefa específica
app.get("/tarefas/:id", (req, res) => {
  const { id } = req.params;
  
  db.get("SELECT * FROM tarefas WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao buscar tarefa", detalhes: err.message });
    }
    if (!row) {
      return res.status(404).json({ erro: "Tarefa não encontrada" });
    }
    
    // Converter 0/1 para false/true
    const tarefa = {
      ...row,
      concluida: Boolean(row.concluida)
    };
    
    res.json(tarefa);
  });
});

// Rota POST - adicionar nova tarefa
app.post("/tarefas", (req, res) => {
  const { titulo } = req.body;
  
  // Validação básica
  if (!titulo || titulo.trim() === "") {
    return res.status(400).json({ erro: "O título da tarefa é obrigatório" });
  }
  
  if (titulo.length > 200) {
    return res.status(400).json({ erro: "O título deve ter no máximo 200 caracteres" });
  }
  
  const stmt = db.prepare("INSERT INTO tarefas (titulo, concluida) VALUES (?, ?)");
  stmt.run(titulo.trim(), 0, function(err) {
    if (err) {
      return res.status(500).json({ erro: "Erro ao criar tarefa", detalhes: err.message });
    }
    
    // Buscar a tarefa recém-criada
    db.get("SELECT * FROM tarefas WHERE id = ?", [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ erro: "Erro ao buscar tarefa criada" });
      }
      
      const novaTarefa = {
        ...row,
        concluida: Boolean(row.concluida)
      };
      
      res.status(201).json(novaTarefa);
    });
  });
  stmt.finalize();
});

// Rota PUT - atualizar tarefa
app.put("/tarefas/:id", (req, res) => {
  const { id } = req.params;
  const { titulo, concluida } = req.body;
  
  // Validação básica
  if (titulo !== undefined && (titulo.trim() === "" || titulo.length > 200)) {
    return res.status(400).json({ erro: "Título inválido (deve ter entre 1 e 200 caracteres)" });
  }
  
  // Primeiro, verificar se a tarefa existe
  db.get("SELECT * FROM tarefas WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao buscar tarefa" });
    }
    if (!row) {
      return res.status(404).json({ erro: "Tarefa não encontrada" });
    }
    
    // Preparar valores para atualização
    const novoTitulo = titulo !== undefined ? titulo.trim() : row.titulo;
    const novaConcluida = concluida !== undefined ? (concluida ? 1 : 0) : row.concluida;
    
    // Atualizar tarefa
    const stmt = db.prepare("UPDATE tarefas SET titulo = ?, concluida = ? WHERE id = ?");
    stmt.run(novoTitulo, novaConcluida, id, function(err) {
      if (err) {
        return res.status(500).json({ erro: "Erro ao atualizar tarefa", detalhes: err.message });
      }
      
      // Buscar tarefa atualizada
      db.get("SELECT * FROM tarefas WHERE id = ?", [id], (err, updatedRow) => {
        if (err) {
          return res.status(500).json({ erro: "Erro ao buscar tarefa atualizada" });
        }
        
        const tarefaAtualizada = {
          ...updatedRow,
          concluida: Boolean(updatedRow.concluida)
        };
        
        res.json(tarefaAtualizada);
      });
    });
    stmt.finalize();
  });
});

// Rota DELETE - remover tarefa
app.delete("/tarefas/:id", (req, res) => {
  const { id } = req.params;
  
  // Primeiro, verificar se a tarefa existe
  db.get("SELECT * FROM tarefas WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao buscar tarefa" });
    }
    if (!row) {
      return res.status(404).json({ erro: "Tarefa não encontrada" });
    }
    
    // Deletar tarefa
    const stmt = db.prepare("DELETE FROM tarefas WHERE id = ?");
    stmt.run(id, function(err) {
      if (err) {
        return res.status(500).json({ erro: "Erro ao deletar tarefa", detalhes: err.message });
      }
      
      res.json({ 
        mensagem: "Tarefa removida com sucesso",
        tarefaRemovida: {
          ...row,
          concluida: Boolean(row.concluida)
        }
      });
    });
    stmt.finalize();
  });
});

// Rota para estatísticas (bonus)
app.get("/estatisticas", (req, res) => {
  db.all(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN concluida = 1 THEN 1 ELSE 0 END) as concluidas,
      SUM(CASE WHEN concluida = 0 THEN 1 ELSE 0 END) as pendentes
    FROM tarefas
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao buscar estatísticas" });
    }
    
    const stats = rows[0];
    res.json({
      total: stats.total,
      concluidas: stats.concluidas,
      pendentes: stats.pendentes,
      percentualConclusao: stats.total > 0 ? Math.round((stats.concluidas / stats.total) * 100) : 0
    });
  });
});

// Middleware para capturar rotas não encontradas
app.use("*", (req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

// Fechar conexão com o banco ao encerrar a aplicação
process.on('SIGINT', () => {
  console.log('\n🔴 Encerrando servidor...');
  db.close((err) => {
    if (err) {
      console.error('❌ Erro ao fechar banco:', err.message);
    } else {
      console.log('✅ Conexão com banco encerrada');
    }
    process.exit(0);
  });
});

// Inicia servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  console.log(`🌐 Interface web: http://localhost:${port}`);
  console.log(`📊 Banco SQLite: database.sqlite`);
  console.log(`📝 Rotas da API:`);
  console.log(`   GET    /tarefas - Listar todas as tarefas`);
  console.log(`   GET    /tarefas/:id - Buscar tarefa específica`);
  console.log(`   POST   /tarefas - Criar nova tarefa`);
  console.log(`   PUT    /tarefas/:id - Atualizar tarefa`);
  console.log(`   DELETE /tarefas/:id - Deletar tarefa`);
  console.log(`   GET    /estatisticas - Ver estatísticas`);
});