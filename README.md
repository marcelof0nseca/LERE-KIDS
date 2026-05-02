<p align="center">
  <img src="src/assets/logo-lere.png" alt="LERÊ Brinquedos Educativos" width="220" />
</p>

# LERÊ Kids

Site vitrine da LERÊ Kids, loja de brinquedos educacionais e socioeducacionais.

A proposta da LERÊ Kids é apresentar brinquedos que ajudam no desenvolvimento infantil por meio da brincadeira, estimulando aprendizagem, criatividade, coordenação motora, raciocínio, linguagem, musicalização, psicomotricidade e habilidades sociais.

O site permite visualizar o catálogo da loja, pesquisar produtos, filtrar por categoria, ver detalhes dos brinquedos, montar um carrinho e enviar o pedido pelo WhatsApp com os dados do cliente.

## Contato

- Instagram: https://www.instagram.com/lojalerekids
- WhatsApp: +55 81 99952-8790

## Como Rodar

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Funcionalidades

- Catálogo de brinquedos com busca e filtros
- Carrinho local
- Login e cadastro com Supabase Auth
- Cadastro do cliente salvo no Supabase
- Checkout simples com nome, telefone, e-mail, CPF, endereço, CEP, tipo de entrega e observações
- Preenchimento automático de endereço pelo CEP
- Cálculo de subtotal e total quando os produtos possuem preço cadastrado
- Suporte a produtos com valor `Consultar`, mantendo confirmação pelo atendimento
- Pedido finalizado pelo WhatsApp da loja
- Links para Instagram, contato, política de privacidade e política de troca

## Backend

O frontend continua na Vercel e a primeira camada de backend usa Supabase:

- Supabase Auth para login real com e-mail e senha
- Supabase Postgres para dados de cliente
- Schema inicial em `supabase/schema.sql`
- Variáveis de ambiente na Vercel para tokens secretos
- Vercel Functions em `/api` futuramente para pedidos, pagamentos e webhooks
- Mercado Pago Checkout Pro futuramente integrado somente pelo backend

Variáveis locais:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_publica
```

## Publicação

Hospedagem recomendada: Vercel.

Configuração:

- Build command: `npm run build`
- Output directory: `dist`
- Domínio planejado: `lerekids.com.br`
- SSL: gerado automaticamente pela Vercel após a configuração correta do DNS

Checklist:

1. Registrar `lerekids.com.br` no Registro.br.
2. Conectar o repositório do GitHub na Vercel.
3. Fazer o primeiro deploy e testar a URL `vercel.app`.
4. Adicionar `lerekids.com.br` e `www.lerekids.com.br` no projeto da Vercel.
5. Configurar os DNS no Registro.br conforme indicado pela Vercel.
6. Confirmar o cadeado HTTPS.
7. Criar ou atualizar o Perfil da Empresa no Google com site, telefone, endereço, fotos e descrição da loja.
