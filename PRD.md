# PRD - LERE Kids

## 1. Visao Geral

LERE Kids sera um site vitrine para uma loja socioeducacional de brinquedos. O objetivo e apresentar os produtos da loja de forma bonita, clara e confiavel, mostrando preco, categoria, faixa etaria, beneficios educativos e um caminho simples para compra via WhatsApp.

O projeto nao tera backend, banco de dados, login, painel administrativo ou pagamento online. Todas as informacoes dos produtos serao mantidas no proprio frontend, em arquivos estaticos ou estruturas locais do codigo.

Quando o usuario clicar em comprar, ele sera direcionado para o WhatsApp da loja com uma mensagem pronta contendo o produto desejado.

## 2. Objetivos

- Criar uma vitrine online clara e atrativa para a loja.
- Exibir todos os brinquedos com imagem, nome, preco e informacoes importantes.
- Destacar o valor socioeducacional dos produtos.
- Facilitar o contato e a compra pelo WhatsApp.
- Funcionar bem em celular, tablet e desktop.
- Ser simples de manter sem depender de backend.

## 3. Publico-Alvo

- Pais e responsaveis buscando brinquedos educativos.
- Professores e escolas.
- Psicopedagogos, terapeutas e profissionais da educacao infantil.
- Pessoas interessadas em presentes com valor educativo.

## 4. Escopo Do Produto

### Incluido

- Pagina inicial com vitrine de produtos.
- Lista completa de brinquedos.
- Busca por nome do produto.
- Filtros por categoria, idade e habilidade desenvolvida.
- Cards de produto com imagem, preco e resumo.
- Pagina ou modal de detalhe do produto.
- Botao de compra via WhatsApp.
- Mensagem automatica com nome do produto e preco.
- Secao institucional sobre a loja.
- Secao de beneficios socioeducacionais.
- Informacoes de contato.
- Layout responsivo.

### Fora Do Escopo

- Backend.
- Banco de dados.
- Login de usuario.
- Carrinho persistente.
- Checkout online.
- Pagamento por cartao, Pix ou boleto dentro do site.
- Controle automatico de estoque.
- Painel administrativo.
- Cadastro dinamico de produtos.

## 5. Funcionalidades

## 5.1 Home / Vitrine

A primeira tela deve ser uma vitrine funcional, nao uma landing page generica.

Deve conter:

- Logo/nome LERE Kids.
- Menu de navegacao.
- Busca de produtos.
- Acesso rapido ao WhatsApp.
- Chamada principal da loja.
- Categorias principais.
- Produtos em destaque.

Exemplo de categorias:

- Montessori
- STEM
- Coordenação motora
- Alfabetização
- Raciocinio logico
- Criatividade
- Habilidades sociais
- Sensorial

## 5.2 Lista De Produtos

Cada produto deve exibir:

- Imagem.
- Nome.
- Preco.
- Categoria.
- Faixa etaria.
- Habilidade desenvolvida.
- Pequena descricao.
- Botao "Comprar pelo WhatsApp".

Exemplo de card:

```text
Torre de Encaixe Sensorial
R$ 89,90
Idade: 2 a 5 anos
Desenvolve: coordenacao motora e percepcao visual
[Comprar pelo WhatsApp]
```

## 5.3 Detalhe Do Produto

O usuario deve conseguir ver mais informacoes antes de comprar.

Campos recomendados:

- Nome.
- Galeria ou imagem principal.
- Preco.
- Descricao completa.
- Beneficios educativos.
- Faixa etaria.
- Material.
- Dimensoes, se houver.
- Recomendado para casa, escola, terapia ou grupo.
- Botao de compra via WhatsApp.

## 5.4 Compra Via WhatsApp

Ao clicar em comprar, o site deve abrir o WhatsApp da loja.

Formato recomendado:

```text
Ola! Tenho interesse no produto: {nome_do_produto}, no valor de {preco}. Poderia me passar mais informacoes?
```

Link base:

```text
https://wa.me/55DDDNUMERO?text=MENSAGEM_CODIFICADA
```

Exemplo:

```text
https://wa.me/5585999999999?text=Ola%21%20Tenho%20interesse%20no%20produto%3A%20Torre%20de%20Encaixe%20Sensorial%2C%20no%20valor%20de%20R%24%2089%2C90.%20Poderia%20me%20passar%20mais%20informacoes%3F
```

O numero real da loja deve ser configurado no codigo.

## 5.5 Busca E Filtros

Como o site nao tera backend, a busca e os filtros devem funcionar no navegador.

Filtros recomendados:

- Categoria.
- Faixa etaria.
- Habilidade desenvolvida.
- Faixa de preco.

Comportamento:

- A busca deve atualizar a lista de produtos instantaneamente.
- Se nenhum produto for encontrado, mostrar uma mensagem amigavel.
- Deve existir opcao de limpar filtros.

## 6. Conteudo Dos Produtos

Os produtos podem ser cadastrados em uma estrutura local, por exemplo:

```js
{
  id: "torre-encaixe-sensorial",
  name: "Torre de Encaixe Sensorial",
  price: 89.9,
  formattedPrice: "R$ 89,90",
  category: "Sensorial",
  ageRange: "2 a 5 anos",
  skills: ["Coordenacao motora", "Percepcao visual"],
  description: "Brinquedo educativo para estimular encaixe, cores e concentracao.",
  image: "/images/produtos/torre-encaixe.jpg",
  material: "Madeira",
  recommendedFor: ["Casa", "Escola", "Terapia"]
}
```

## 7. Requisitos De Design

O design deve seguir o arquivo:

```text
DESIGN.md
```

Direcao visual:

- Alegre, mas nao infantilizado demais.
- Confiavel para adultos.
- Colorido com intencao.
- Inspirado em ambiente de aprendizagem.
- Cards limpos e faceis de comparar.
- Imagens reais ou geradas dos brinquedos.
- Primeira tela ja deve mostrar produtos ou categorias.

## 8. Requisitos Tecnicos

- Site estatico.
- Sem backend.
- Sem banco de dados.
- Produtos mantidos localmente no frontend.
- Deve funcionar em deploys simples como Vercel, Netlify ou GitHub Pages.
- Deve ser responsivo.
- Deve ter boa performance em celular.
- Links de WhatsApp devem usar mensagem codificada com `encodeURIComponent`.

## 9. SEO E Compartilhamento

O site deve conter:

- Titulo claro da pagina.
- Descricao da loja.
- Textos descritivos nos produtos.
- Alt text nas imagens.
- Open Graph basico para compartilhamento.

Exemplo de titulo:

```text
LERE Kids - Brinquedos socioeducacionais
```

Exemplo de descricao:

```text
Brinquedos educativos, sensoriais e criativos para criancas, familias, escolas e profissionais da educacao.
```

## 10. Metricas De Sucesso

- Usuario encontra um produto em poucos segundos.
- Usuario entende idade, preco e beneficio educativo do brinquedo.
- Usuario consegue iniciar uma conversa no WhatsApp sem precisar digitar o nome do produto.
- Site funciona bem em celular.
- Produtos sao faceis de atualizar no codigo.

## 11. Versao 1 Recomendada

Para a primeira versao, construir:

- Home com vitrine.
- Grid de produtos.
- Busca.
- Filtros simples.
- Detalhe de produto em modal ou pagina.
- Compra via WhatsApp.
- Secao "Sobre a LERE Kids".
- Secao de contato.

## 12. Prompt Para Desenvolvimento

```text
Crie um site vitrine para a LERE Kids, uma loja de brinquedos socioeducacionais. O site nao tera backend. Os produtos devem ficar em uma lista local no frontend. Cada produto deve ter imagem, nome, preco, categoria, faixa etaria, habilidade desenvolvida e botao de compra via WhatsApp. Ao clicar em comprar, abrir o WhatsApp da loja com uma mensagem pronta informando o produto e o preco. Siga o DESIGN.md do projeto para criar uma interface alegre, confiavel, responsiva e focada em vitrine de produtos.
```
