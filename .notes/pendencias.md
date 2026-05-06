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
- [x] Card de empresas no projeto
- [x] Credenciamento máximo por empresa
- [x] Filtro credenciado
- [x] Permitir import csv por vírgula e ponto e vírgula
- [x] Contagem checkin sem contar duplicado
- [x] Contagem de checkout em checkin
  - Caso a pessoa entre novamente após fazer o checkout essa contagem de checkout some. Checkout como contagem de "pessoas fora".
- [x] Melhorar usabilidade UI para check por cpf no celular
- [x] Pop-up de aviso de erro de cor diferente do de check-out
- [x] Melhorar sistema novo staff caso ele seja um staff já existente
- [ ] Retirar avisos QZTray

## Features

- [ ] Bloquear staffs.
  - Apresentar para Admin caso pessoa esteja bloqueada por qualquer compny.
- [ ] Foto vinda do google acount para users.
- [ ] Possibilitar empresa sem staff_limit
  - Empresa sem staff_limit o limit é considerado a quantidade que foi subida no sistema
- [x] UI para alterar staff_limit das empresas.
- [ ] Company owner poder add eventos e empresas.
- [ ] Implementar card de Equipe no projeto.
- [x] Relatório final gerado automático
  - [ ] Identificação da exportação
  - [ ] ? Exportar somente quem se registrou ?
- [ ] Avisa no próximo credenciamento caso staff não tenha feito checkout no evento anterior (check em aberto).
- [ ] Sistema para duplicar evento.
  - Levar companies e staffs junto.
- [-] Pedido de checkout pela company
  - Pensado para caso de checkout válidos que não puderam ser efetuados no credenciamento. Ex: saídadas médicas.
  - **REFUTADO:** abre brecha para company poder gerar dados "indevidos" de checkout.
  - **ALTERNATIVA:** sistema móvel de checkout. Sensor com plataforma móvel.
- [ ] Botão de voltar na UI
- [ ] Permtir que uma emoresa tenha mais de um setor (ex: Force - segurança e limpeza)
