# Estruturas padrões

**Evento**:
```JSON
event = {
  id,
  name,
  description,
  location,
  date_begin,
  date_end,
  status,
  project_id,
}

event_short = {
  id,
  name,
  location,
  status,
}
```
**staff**:
```json
staff = {
  id,
  name,
  cpf, (apenas números)
  company_id,
}
```
**users**:
```json
user = {
  id,
  name,
  email,
  company_id,
  role,
}
```
**company**:
```json
company = {
  id,
  name,
  cnpj,
}
```
**projects**:
```json
project = {
  id,
  name,
  description,
  date_begin,
  date_end,
  status,
}

project_short = {
  id,
  name,
  date_begin,
  date_end,
  qnt_events, (quantidade de eventos naquele projeto)
}
```

# Lista de endpoints

Dados do usuário que está requisitando as informações serão extraídas do JWT de acesso. Infomações contidas no JWT (não apenas):
- user_id
- company_id
- role
___
## Staffs
- `/staffs [GET]` : retorna todos os usuários cadastrados pela empresa.
  - {[staff]}
- `/staffs [POST]` : cria um staff.
  - {staff}
- `/staffs/:id [GET]` : retorna os detalhes de um staff específico, incluso os eventos para qual participou.
  - {staff:staff, events:event_short}
- `/staffs/:id [PUT]` : edita um staff.
  - {staff}
- `/staffs/:id [DELETE]` : deleta um staff.
___
## Users
- `/users [GET]` : retorna todos os usuários e convites não utilizados.
  - {user}
- `/users [POST]` : cria um usuário.
  - {user}
- `/users/:id [GET]` : retorna os detalhes de um usuário específico, incluso os eventos do quais participou.
  - {user:user events:event_short}
- `/users/:id [PUT]` : edita um usuário.
  - {user}
- `/users/:id [DELETE]` : deleta um usuário.
___
## Empresas
- `/companies [GET]` : retorna todas as empresas.
  - {comapany}
- `/companies [POST]` : cria uma empresa.
  - {company}
- `/companies/:id [GET]` : retorna os detalhes de uma empresa específica, incluindo os eventos dos quais participou.
  - {company:company, events:event_short}
- `/companies/:id [PUT]` : edita uma empresa.
  - {company}
- `/companies/:id [DELETE]` : deleta uma empresa.
___
## Eventos
- `/events [GET]` : retorna todos os eventos que não estão atribuídos a um projeto.
  - {event_short}
- `/events [POST]` : cria um evento.
  - {event}
### Eventos por id
- `/events/:id [PUT]` : atualiza um evento.
  - {event}
- `/events/:id [DELETE]` : deleta um evento.
- `/events/:id [GET]` : retorna o overview do evento.
```json
{
  event:event,
  overview:{
    qnt_companies,
    qnt_staffs,
    all:{
      qnt_registration,
      qnt_checkin,
      qnt_checkout,
    }
    companies:{[
      id,
      name,
      qnt_staffs,
      qnt_registration,
      qnt_checkin,
      qnt_checkout
    ]}
  }
}
```
- `/events/:id/staffs [GET]` : rotorna os staffs do evento. Condicionado ao role da empresa dentro do evento.
  - **service:** vê apenas os seus staffs no evento.
  - **production:** vê todos os staffs no evento.
  - {staff}
- `/events/:id/staffs/:staff_id [DELETE]` : remove um staff de um evento.
- `/events/:id/staffs/:staff_id [POST]` : atribui um staff ao evento
- `/events/:id/staffs/bulk [POST]` : atribui staffs já existentes em massa.
  - {[staff_id]}
- `/events/:id/staffs/bulk/csv [POST]` : atribui staffs em massa a partir de um csv.
  - {[staff]}
- `/events/:id/companies [GET]` : retorna as empresas participantes do evento.
- `/events/:id/companies/:company_id [DELETE]` : remove uma empresa de um evento.
- `/events/:id/companies/:company_id [POST]` : atribui uma empresa a um evento.
- `/events/:id/companies/bulk [POST]` : atribui várias empresas a um evento.
  - {[company_id]}
## Projetos
- `/projects [GET]` : retorna todos os projetos.
  - {project_short}
- `/projects [POST]` : cria um projeto.
  - {project}
### Projetos por id
- `/projects/:id [PUT]` : atualiza um projeto.
  - {project}
- `/projects/:id [DELETE]` : deleta um projeto.
- `/projects/:id [GET]` : retorna o overview do projeto.
```json
{
  project:project,
  overview:{
    qnt_events,
    qnt_companies,
    qnt_staffs,
    events_conclusion,
    events:{[
      id,
      name,
      qnt_staffs,
    ]}
  }
}
```
- `/projects/:id/events [GET]` : rotorna os eventos do projeto. Condicionado ao role da empresa dentro do evento.
  - **service:** vê apenas os eventos da qual faz parte.
  - **production:** vê todos os eventos no projeto.
  - {project_short}
- `/projects/:id/events/:event_id [DELETE]` : remove um evento de um projeto.
- `/projects/:id/events/:event_id [POST]` : cria um evento e o atribui ao projeto.
  - {project}
- `/projects/:id/companies/bulk [POST]` : atribui empresas existentes em massa.
  - {[company_id]}
- `/projects/:id/companies [GET]` : retorna as empresas participantes do evento.
  - {company}

## Convites de usuários
- `/invite [POST]` :  cria um novo convite.
- `/invite [DELETE]` : deleta um convite

## Dashboard
- `/dashboard/metrics [GET]` : retorna as métricas para o dashboard.
```json
{
  open_events,
  qnt_projects,
  qnt_companies,
  qnt_users,
}
```

!!! Lembrar de fazer query dos eventos em que participa (staff, empresas, users)
