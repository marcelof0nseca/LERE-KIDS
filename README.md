# LERE Kids

LERE Kids is a socioeducational toy store project focused on playful learning, inclusive development, and trustworthy shopping for families, educators, and caregivers.

## Design Reference

The `awesome-design-md` repository was cloned into:

```text
design-reference/awesome-design-md
```

That folder is ignored by git because it is only a local reference library.

For this project, the main design direction is defined in:

```text
DESIGN.md
```

It is inspired mainly by the Miro design file from `awesome-design-md`, because that style is colorful, collaborative, educational, and cleaner than a loud toy-store look.

## Suggested Process

1. Keep `design-reference/awesome-design-md` as inspiration only.
2. Use this project's `DESIGN.md` as the source of truth.
3. Build the first version as a real storefront, not a landing page.
4. Start with the core screens:
   - home/storefront
   - product listing
   - product detail
   - cart
   - checkout
5. Give every toy clear educational metadata:
   - age range
   - skill developed
   - material/safety note
   - recommended setting

## Build Prompt

Use this when asking an AI agent to build the interface:

```text
Build LERE Kids as a socioeducational toy store using DESIGN.md. Make the first screen a usable storefront, with search, categories, featured products, cart access, and visible educational value for each toy. The design should feel bright, trustworthy, inclusive, and family-friendly, inspired by Miro's colorful collaborative style but adapted for e-commerce.
```

## Como Rodar

```bash
npm install
npm run dev
```

Para gerar a versao de producao:

```bash
npm run build
```

## Como Atualizar O Catalogo

Os produtos de exemplo ficam em:

```text
src/data/products.js
```

Troque os dados, precos e imagens pelos produtos reais da loja. O numero do WhatsApp tambem fica nesse arquivo, na constante `WHATSAPP_NUMBER`.
