# API REST To-Do List

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.19-000000?style=flat-square&logo=express)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite)

Aplicação full-stack para gerenciamento de tarefas com API REST e interface web responsiva.

## Funcionalidades

- Operações CRUD completas para tarefas
- Banco de dados SQLite com armazenamento persistente
- Dashboard de estatísticas em tempo real
- Interface web responsiva
- Validação de dados e tratamento de erros
- Arquitetura RESTful

## Stack Tecnológica

- **Backend:** Node.js, Express.js
- **Banco de Dados:** SQLite3
- **Frontend:** HTML5, CSS3, JavaScript Vanilla
- **Desenvolvimento:** Nodemon para hot-reload

## Início Rápido

```bash
# Clonar e instalar
git clone https://github.com/seuusuario/todo-api.git
cd todo-api
npm install

# Executar servidor de desenvolvimento
npm run dev

# Acessar aplicação
# Web: http://localhost:3000
# API: http://localhost:3000/tarefas
```

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/tarefas` | Listar todas as tarefas |
| GET | `/tarefas/:id` | Obter tarefa específica |
| POST | `/tarefas` | Criar nova tarefa |
| PUT | `/tarefas/:id` | Atualizar tarefa |
| DELETE | `/tarefas/:id` | Deletar tarefa |
| GET | `/estatisticas` | Obter estatísticas das tarefas |

## Exemplo de Uso

```bash
# Criar tarefa
curl -X POST http://localhost:3000/tarefas \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Aprender Node.js"}'

# Listar tarefas
curl http://localhost:3000/tarefas
```

## Estrutura do Projeto

```
├── public/
│   └── index.html      # Interface web
├── server.js           # Servidor da API
├── package.json        # Dependências
└── database.sqlite     # Banco SQLite
```

## Principais Aprendizados

- Desenvolvimento de APIs RESTful
- Design de banco de dados e operações SQL
- Desenvolvimento JavaScript full-stack
- Tratamento de erros e validação de dados
- Design web responsivo

## Licença

Licença MIT - sinta-se livre para usar este projeto para fins de aprendizado.

---

**Contato:** [Alexsander Vinicius] | [LinkedIn](https://linkedin.com/in/alexsandervvieira/) | [Email](vvieirasilva77@gmail.com)