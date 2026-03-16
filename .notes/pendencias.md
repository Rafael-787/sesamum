# Pendências

## Erros

- [x] Pesquisa check pelo QRcode.
- [ ] Overview projeto restrito para companies service.
  - [x] Retornar parâmetro "owner" no endpoint projeto.
- [x] Check possível em um evento close
  - [ ] Visualização do erro "evento fechado" na hora do check
- [x] Data do evento quando edit
  - Erro de tipo de variable, date vs datetime
- [x] Apresentar número staff_limit
- [ ] Modificar staff_limit

## Features

- [ ] Bloquear staffs.
  - Apresentar para Admin caso pessoa esteja bloqueada por qualquer compny.
- [ ] Foto vinda do google acount para users.
- [ ] UI para alterar staff_limit das empresas.
- [ ] Company owner poder add eventos e empresas.
- [x] Relatório final gerado automático
  - [ ] Identificação da exportação
- [ ] Avisa no próximo credenciamento caso staff não tenha feito checkout no evento anterior (check em aberto).
- [ ] Sistema para duplicar evento.
  - Levar companies e staffs junto.
- [ ] Pedido de checkout pela company
  - Pensado para caso de checkout válidos que não puderam ser efetuados no credenciamento. Ex: saídadas médicas.
  - **REFUTADO:** abre brecha para company poder gerar dados "indevidos" de checkout.
  - **ALTERNATIVA:** sistema móvel de checkout. Sensor com plataforma móvel.
