# classroom-scheduling-front

Frontend de agendamento de salas. Este README documenta a API de backend necessaria para o sistema funcionar.

## Base da API

- `VITE_API_BASE_URL` (default no front: `http://localhost:8080`)
- Header para rotas protegidas: `Authorization: Bearer <token>`
- `Content-Type: application/json`

## Contrato sugerido (reconstrucao do zero)

Obs.: a esquerda esta o que o front atual chama; a direita uma rota sugerida mais REST.

### Auth

- `POST /auth/login` -> `POST /auth/sessions`
  - body: `{ "email": "string", "senha": "string" }`
  - response: `{ "token": "jwt", "usuario": Usuario }`
- `POST /auth/register` -> `POST /auth/users`
  - body: `{ "email": "string", "senha": "string" }`
  - response: `{ "token": "jwt", "usuario": Usuario }`
- `GET /auth/me` (mantem)
  - response: `Usuario`

### Saude

- `GET /health` (mantem)
  - response exemplo: `{ "status": "UP", "timestamp": "2026-05-05T00:00:00Z" }`

### Predios

- `GET /predios` -> `GET /buildings`
- `GET /predios/:id` -> `GET /buildings/:id`
- `POST /predios` -> `POST /buildings`
  - body: `{ "nome": "string", "codigo": "string", "localizacao": "string" }`
- `PUT /predios/:id` -> `PUT /buildings/:id`
  - body: `{ "nome": "string", "codigo": "string", "localizacao": "string" }`
- `GET /predios/buscar?codigo=XXX` -> `GET /buildings?code=XXX`
  - query GET: `codigo` (ou `code`)

### Espacos

- `GET /espacos` -> `GET /spaces`
- `GET /espacos/:id` -> `GET /spaces/:id`
- `POST /espacos` -> `POST /spaces`
  - body: `{ "nome": "string", "capacidade": 40, "tipo": "SALA|LAB|AUDITORIO|REUNIAO", "predioId": 1 }`
- `PUT /espacos/:id` -> `PUT /spaces/:id`
  - body: `{ "nome": "string", "capacidade": 40, "tipo": "SALA|LAB|AUDITORIO|REUNIAO", "predioId": 1 }`
- `PATCH /espacos/:id/indisponibilidade` -> `PATCH /spaces/:id/availability`
  - body: `{ "indisponivel": true, "motivo": "string|null" }`
- `GET /espacos/disponiveis` -> `GET /spaces?available=true`
- `GET /espacos/por-predio?predioId=1` -> `GET /spaces?buildingId=1`
  - query GET: `predioId` (ou `buildingId`)

### Reservas

- `GET /reservas` -> `GET /reservations`
- `GET /reservas/ativas` -> `GET /reservations?status=ACTIVE`
- `GET /reservas/:id` -> `GET /reservations/:id`
- `POST /reservas` -> `POST /reservations`
  - body:
    `{ "solicitanteId": 10, "espacoId": 7, "inicio": "2026-05-10T14:00:00", "fim": "2026-05-10T16:00:00", "motivo": "string" }`
- `PATCH /reservas/:id/cancelar` -> `PATCH /reservations/:id/cancel`
- `PATCH /reservas/:id/aprovar` -> `PATCH /reservations/:id/approve`
- `PATCH /reservas/:id/recusar` -> `PATCH /reservations/:id/reject`
- `POST /reservas/lote` -> `POST /reservations/bulk`
  - body:
    `{ "solicitanteId": 10, "espacoId": 7, "dataInicio": "2026-05-01", "dataFim": "2026-06-30", "diasSemana": [1,2,3,4,5], "horaInicio": "19:00", "horaFim": "21:00", "motivo": "string", "statusInicial": "APROVADA", "aprovacaoAutomatica": true }`
  - response exemplo:
    `{ "quantidadeCriada": 24, "quantidadeIgnorada": 2 }`
- `GET /reservas/por-solicitante?solicitanteId=10` -> `GET /reservations?requesterId=10`
  - query GET: `solicitanteId` (ou `requesterId`)
- `GET /reservas/por-espaco?espacoId=7&data=2026-05-10` -> `GET /reservations?spaceId=7&date=2026-05-10`
  - query GET: `espacoId`, `data`

### Notificacoes

- `GET /notificacoes` -> `GET /notifications`
- `GET /notificacoes/por-destinatario?destinatarioId=10` -> `GET /notifications?recipientId=10`
- `GET /notificacoes/nao-lidas?destinatarioId=10` -> `GET /notifications?recipientId=10&read=false`
- `PATCH /notificacoes/:id/lida` -> `PATCH /notifications/:id/read`
  - query GET: `destinatarioId` (ou `recipientId`)

### Usuarios / Solicitantes

- `GET /usuarios` -> `GET /users`
- `GET /usuarios/:id` -> `GET /users/:id`
- `GET /usuarios/buscar?email=x@y.com` -> `GET /users?email=x@y.com`
- `DELETE /usuarios/:id` -> `DELETE /users/:id`
- `GET /solicitantes` -> `GET /requesters`
- `GET /solicitantes/:id` -> `GET /requesters/:id`
- `GET /solicitantes/buscar?email=x@y.com` -> `GET /requesters?email=x@y.com`
- `POST /solicitantes` -> `POST /requesters`
  - body: `{ "nome": "string", "email": "string", "tipoSolicitante": "ALUNO|FUNCIONARIO" }`

## Modelos minimos de resposta

- `Usuario`: `{ "id": 1, "nome": "string", "email": "string", "papel": "ADMIN|USER", "tipoSolicitante": "ALUNO|FUNCIONARIO|null" }`
- `Predio`: `{ "id": 1, "nome": "string", "codigo": "B1", "localizacao": "string" }`
- `Espaco`: `{ "id": 7, "nome": "string", "capacidade": 40, "tipo": "SALA", "indisponivel": false, "motivoIndisponibilidade": null, "predio": Predio }`
- `Reserva`: `{ "id": 22, "cancelada": false, "motivo": "string", "criadaEm": "ISO", "horarios": { "inicio": "ISO", "fim": "ISO" }, "solicitante": { "id": 10, "nome": "string", "email": "string" }, "espaco": Espaco }`
- `Notificacao`: `{ "id": 3, "mensagem": "string", "lida": false, "enviadaEm": "ISO", "destinatario": { "id": 10 }, "reserva": { "id": 22 } }`

## Relacoes entre entidades

- `Predio 1:N Espaco`
  - um predio possui varios espacos
  - um espaco pertence a exatamente um predio
- `Espaco 1:N Reserva`
  - um espaco possui varias reservas ao longo do tempo
- `Solicitante 1:N Reserva`
  - um solicitante pode criar varias reservas
- `Reserva 1:N Notificacao` (opcional)
  - notificacoes podem referenciar uma reserva

## Fluxo de status da reserva (obrigatorio)

Status recomendado no backend:
- `PENDENTE`
- `APROVADA`
- `RECUSADA`
- `CANCELADA` (ou `cancelada=true` com status auxiliar)

Transicoes:
1. usuario cria reserva -> status inicial `PENDENTE`
2. admin aprova -> `APROVADA`
3. admin recusa -> `RECUSADA`
4. usuario/admin cancela:
   - `PENDENTE` -> `CANCELADA`
   - `APROVADA` -> `CANCELADA`

Excecao para agendamento em massa:
- quando criado por `ADMIN` via `POST /reservas/lote`, o backend deve criar com status `APROVADA` automaticamente (sem passar por `PENDENTE`).

Regras de exibicao no frontend:
- usuario comum:
  - aba Pendentes: `PENDENTE`
  - aba Aprovadas: `APROVADA`
  - aba Recusadas/Canceladas: `RECUSADA` ou `cancelada=true`
- admin:
  - tela `/admin/reservas` com acoes de `Aceitar` e `Recusar` para itens `PENDENTE`

## O que foi corrigido no frontend nesta entrega

- Botao `Editar` em `Gerenciar espacos`: agora abre modal e salva (`PUT /espacos/:id`).
- Botao `Novo espaco` em `Gerenciar espacos`: agora abre modal e cria (`POST /espacos`).
- Botao `Criar predio` em `Gerenciar predios`: agora abre modal e cria (`POST /predios`).
- Botao `Editar` em `Gerenciar predios`: agora abre modal e salva (`PUT /predios/:id`).
- Botao `Novo solicitante` em `Gerenciar usuarios`: agora abre modal e cria (`POST /solicitantes`).
- Em `Nova reserva`, horarios ocupados nao podem ser selecionados:
  - frontend consulta `GET /reservas/por-espaco?espacoId=:id&data=YYYY-MM-DD`
  - inicio e fim passam por filtro de conflito.
- Botao `Excluir espaco` em `Gerenciar espacos`: agora remove (`DELETE /espacos/:id`).
- Botao `Excluir` em `Gerenciar predios`: agora remove (`DELETE /predios/:id`).
- Botao `Ver detalhes` em `Gerenciar predios`: agora abre `/admin/predios/:buildingId` com as salas relacionadas.
- Nova tela admin de aprovacao em `/admin/reservas` com acoes:
  - aprovar (`PATCH /reservas/:id/aprovar`)
  - recusar (`PATCH /reservas/:id/recusar`)
- Nova tela admin em `/admin/agendamento-em-massa` para criar reservas recorrentes por período/dias/horário:
  - `POST /reservas/lote`
- Reservas do usuario separadas por status:
  - Pendentes
  - Aprovadas
  - Recusadas/Canceladas
- Dashboard do usuario considera apenas reservas `APROVADA` como "proxima reserva".

## Rotas que faltam para cobrir 100% do administrativo

- `PUT /users/:id` (editar usuario/perfil)
- `PATCH /users/:id/status` (ativar/desativar)
- `DELETE /requesters/:id` (remover solicitante)

## Rotas usadas pelas funcionalidades novas (frontend)

- Navegacao admin:
  - `GET /reservas` para listar solicitacoes em `/admin/reservas`
- Mudanca de status pelo admin (dropdown):
  - `PATCH /reservas/:id/aprovar` (pendente -> aprovado)
  - `PATCH /reservas/:id/recusar` (pendente -> recusado/cancelado)
- Exclusao administrativa:
  - `DELETE /espacos/:id`
  - `DELETE /predios/:id` (cascata)
- Detalhes do predio com salas relacionadas:
  - `GET /predios/:id`
  - `GET /espacos` (filtragem por `predio.id` no frontend)
- Reserva com bloqueio de horario:
  - `GET /reservas/por-espaco?espacoId=:id&data=YYYY-MM-DD` (principal)
  - fallback: `GET /reservas/ativas` e `GET /reservas`

## Regras de permissao esperadas no backend

- `USER`:
  - pode criar/cancelar suas reservas
  - pode consultar disponibilidade de horarios do espaco
  - nao pode aprovar/recusar reserva de terceiros
- `ADMIN`:
  - pode aprovar/recusar reservas pendentes
  - pode excluir espaco e predio
  - pode acessar `/admin/reservas`
- Registro publico:
  - `POST /auth/register` nunca cria `ADMIN`

## Prompt para backend (cole no Codex do backend)

```text
Implemente/ajuste as rotas abaixo no backend, mantendo autenticacao JWT e validacoes:

1) PUT /predios/{id}
Request JSON:
{
  "nome": "Predio X",
  "codigo": "PX",
  "localizacao": "Campus Y"
}
Response 200: predio atualizado
Response 404: predio nao encontrado
Response 400: payload invalido

2) PUT /espacos/{id}
Request JSON:
{
  "nome": "Sala 101",
  "capacidade": 40,
  "tipo": "SALA",
  "predioId": 1
}
Response 200: espaco atualizado (incluindo objeto predio)
Response 404: espaco ou predio nao encontrado
Response 400: payload invalido

3) GET /reservas/por-espaco?espacoId={id}&data=YYYY-MM-DD
Regras:
- retornar reservas NAO canceladas do espaco naquele dia
- ordenar por horario de inicio
- incluir no retorno ao menos:
  id, cancelada, motivo, horarios { inicio, fim }, solicitante { id, nome, email }, espaco { id, nome, predio { id, nome, codigo, localizacao } }
Response 200: lista de reservas (pode ser vazia)
Response 400: parametros ausentes/invalidos
Response 404: espaco nao encontrado (opcional; lista vazia tambem e aceitavel se esse for o padrao do projeto)

4) Garantir CORS e autorizacao compativeis com frontend em VITE_API_BASE_URL.

5) Adicionar testes de integracao para:
- edicao de predio com sucesso
- edicao de espaco com sucesso
- listagem de reservas por espaco/data filtrando canceladas

6) DELETE /predios/{id} (com cascata)
Regras:
- remover o predio e os espacos vinculados
- remover/invalidar reservas vinculadas a esses espacos (definir politica: cancelar ou apagar)
Response 204: removido com sucesso
Response 404: predio nao encontrado
Response 409: quando houver regra de negocio impedindo remocao

7) DELETE /espacos/{id}
Regras:
- remover espaco
- tratar reservas vinculadas (cancelar/apagar conforme politica)
Response 204: removido com sucesso
Response 404: espaco nao encontrado

8) PATCH /reservas/{id}/aprovar
Regras:
- transicionar status para APROVADA
- validar conflito de horario antes de aprovar
Response 200: reserva atualizada
Response 404: reserva nao encontrada
Response 409: conflito de horario

9) PATCH /reservas/{id}/recusar
Regras:
- transicionar status para RECUSADA (ou cancelada=true, conforme modelo)
Response 200: reserva atualizada
Response 404: reserva nao encontrada

10) POST /auth/register
Regra obrigatoria:
- nao permitir cadastro como ADMIN por este endpoint
- payload de cadastro publico sempre cria usuario com papel USER (solicitante)
- tentativa de enviar `papel=ADMIN` deve ser ignorada ou rejeitada com 403/400

11) POST /reservas/lote (criado por admin)
Regras:
- endpoint permitido para `ADMIN`
- criar reservas recorrentes dentro do periodo e dias da semana informados
- tratar conflito por ocorrencia (pular conflito e continuar, retornando contador de ignoradas)
- criar com status `APROVADA` automaticamente
- ignorar/validar campos `statusInicial` e `aprovacaoAutomatica` no backend por seguranca
Response 200 exemplo:
{
  "quantidadeCriada": 24,
  "quantidadeIgnorada": 2,
  "idsCriados": [101, 102, 103]
}
```

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`
