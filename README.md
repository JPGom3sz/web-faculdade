# Clínica Raiz — Sistema de Agendamento

Projeto acadêmico (CEUB — ADS) de um sistema completo de agendamento de
consultas para uma clínica: frontend estático + API em Node/Express +
banco de dados PostgreSQL, tudo orquestrado via Docker.

## Stack

- **Frontend:** HTML, CSS e JavaScript puro (servido como arquivos estáticos pelo próprio backend)
- **Backend:** Node.js + Express
- **Banco de dados:** PostgreSQL
- **Infraestrutura:** Docker + Docker Compose

## Como executar (Docker — recomendado)

Pré-requisito: [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução.

Na raiz do projeto (onde está o arquivo `docker-compose.yml`), rode:

```bash
docker compose up --build
```

Isso vai:
1. Subir um container com o **PostgreSQL**, já criando o banco `clinica` e populando as tabelas e alguns dados de exemplo automaticamente (via `backend/DB/banco.sql`).
2. Subir um container com o **backend Node/Express**, servindo tanto a API quanto o frontend.

Depois de subir, acesse:

```
http://localhost:3000
```

Para encerrar:

```bash
docker compose down
```

Para encerrar e apagar também os dados do banco (recomeçar do zero):

```bash
docker compose down -v
```

## Como executar sem Docker (alternativa manual)

Pré-requisitos: Node.js e PostgreSQL instalados localmente.

1. Crie o banco `clinica` no PostgreSQL e rode o script `backend/DB/banco.sql` nele (cria as tabelas e insere os dados de exemplo).
2. Dentro da pasta `backend/`, crie um arquivo `.env` com:
   ```
   DB_USER=postgres
   DB_PASSWORD=sua_senha
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=clinica
   PORT=3000
   ```
3. Instale as dependências e suba o servidor:
   ```bash
   cd backend
   npm install
   node server.js
   ```
4. Acesse `http://localhost:3000`.

## Endpoints da API

| Método | Rota                          | Descrição                                  |
|--------|-------------------------------|---------------------------------------------|
| GET    | `/api/especialidades`         | Lista todas as especialidades               |
| GET    | `/api/profissionais`          | Lista profissionais (filtro `?especialidade_id=`) |
| GET    | `/api/disponibilidade`        | Lista horários livres (filtro `?profissional_id=`) |
| POST   | `/api/agendamentos`           | Cria um agendamento (cria o paciente se o CPF ainda não existir) |
| GET    | `/api/agendamentos`           | Lista agendamentos por CPF (`?cpf=`)        |
| DELETE | `/api/agendamentos/:id`       | Cancela um agendamento                      |

## Estrutura do projeto

```
├── backend/
│   ├── DB/banco.sql          # schema + dados de exemplo
│   ├── src/
│   │   ├── app.js            # configuração do Express
│   │   ├── config/db.js      # conexão com o PostgreSQL
│   │   ├── controllers/      # lógica de cada entidade
│   │   └── routes/           # definição das rotas
│   ├── server.js             # ponto de entrada (liga o servidor)
│   └── dockerfile
├── public/                   # frontend (HTML/CSS/JS)
├── docker-compose.yml
└── README.md
```
