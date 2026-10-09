# Capri Matemática ✳

Portal público de aulas do Prof. João Capri. Uma página por aula, com códigos estáveis A01–A48, B01–B48 e C01–C48.

## Estrutura
- **144 páginas** em \`aulas/A01/index.html\` até \`aulas/C48/index.html\`.
- **Currículo** em \`data/aulas.json\`, a partir da divisão do professor em Google Docs.
- **CSS e JavaScript** em \`assets/\`.
- **Materiais de cada aula** em \`conteudos/A01.json\`, \`conteudos/A02.json\` etc. O arquivo é opcional até haver conteúdo.
- **PDFs** em \`pdfs/\`, depois referenciados nos arquivos de conteúdo.

## Publicação no Cloudflare Pages
1. Vincule este repositório a Pages com produção na branch \`main\`.
2. Selecione nenhum framework (site estático), sem comando de build, diretório de saída \`.\`.
3. O site passará a ter atualização automática em cada commit.

## Como adicionar conteúdo a uma aula
Crie \`conteudos/A17.json\` com o formato:

\`\`\`json
{
  "teoria": [
    {
      "titulo": "O que são raízes?",
      "paragrafos": ["Uma raiz é um valor de x que zera a função."],
      "formulas": ["ax^2+bx+c=0"]
    }
  ],
  "exercicios": [
    {"enunciado": "Resolva x²−5x+6=0.", "resposta": "x=2 ou x=3."}
  ],
  "arquivos": [
    {"titulo": "Lista de exercícios — Aula A17", "tipo": "lista", "url": "/pdfs/lista-a17.pdf"},
    {"titulo": "Gabarito — Aula A17", "tipo": "gabarito", "url": "/pdfs/gabarito-a17.pdf"}
  ]
}
\`\`\`

Suba os arquivos PDF para a pasta \`pdfs/\` e adicione as referências acima. O site identifica o material pela URL da aula.

## Funcionalidades
- Busca instantânea por título, assunto, descrição, código, bloco e frente.
- Filtros pelas três frentes; favoritos.
- Marcação de aulas estudadas e favoritos: **armazenados apenas no navegador do aluno**, sem login, sem sincronização entre aparelhos.
- Roteiro, teoria, exercícios e PDFs em abas separadas.
- Próxima aula, aula anterior, navegação do bloco e links individuais.

## Importante
O currículo é a ementa, **não teoria final**. Algumas fórmulas matemáticas desapareceram na exportação textual do Google Docs. Revise essas partes antes de transformar o roteiro em explicação definitiva. O site não inventa listas, gabaritos ou materiais que não existam.

## Produção semi-automatizada de conteúdo
Consulte `PADRAO_EDITORIAL.md`. A aula A17 é um exemplo publicado, com teoria, sugestões de vídeos verificadas, quiz e uma lista A4 imprimível com gabarito separado.


## Área central de listas e PDFs
O destaque da home é a biblioteca, com pesquisa em tempo real e índice `data/materiais.json`. Atualize esse índice sempre que publicar ou retirar PDFs. `Listas e PDFs` é a primeira aba de todas as aulas e abre por padrão quando há arquivos. A antiga aba `Exercícios` foi retirada; atividades curtas existentes agora aparecem na área de materiais.
