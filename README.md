# MAT MAT MAT ✳

Portal gratuito de matemática MAT MAT MAT, por Prof. João Capri. Uma página por aula, com códigos estáveis A01–A48, B01–B48 e C01–C48.

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


## Descoberta de aulas por assuntos
Abaixo da área **Listas e PDFs**, o catálogo foi reorganizado em 9 áreas com ícones e navegação progressiva: área → assunto → aula. As 144 aulas permanecem em suas URLs originais. Busca geral (com sugestões), favoritos, lista completa sob demanda e URLs compartilháveis com `?area=...&assunto=...` continuam disponíveis. Os dados curriculares originais não foram alterados; o agrupamento amigável do aluno fica em `assets/site.js`, em `SUBJECT_AREAS`.


### Assuntos refinados
As nove áreas agora se dividem em 38 assuntos específicos, incluindo Estatística (leitura de dados ou dispersão), Trigonometria (ciclo, identidades ou equações), Geometria espacial (prismas, pirâmides, corpos redondos etc.) e Combinatória (contagem, combinações ou probabilidade). A classificação é definida em `SUBJECT_TOPICS` e validada para garantir que cada aula esteja em exatamente um assunto.


## Home unificada — navegação v3
A página inicial possui **um único campo de busca** (`#hero-search`) que encontra aulas, assuntos e PDFs. A busca filtra instantaneamente os três tipos e permite focar somente em cada um sem uma nova caixa de texto. Sem busca, mostra materiais de fato publicados e explora 9 áreas → 38 assuntos → 144 aulas. O índice dos PDFs continua em `data/materiais.json`. Não invente arquivos: o painel de downloads lista apenas os existentes. Os links das aulas e URLs de filtros foram preservados.


## Materiais gerais e ponte Exatoo
Veja `GUIA_MATERIAIS_EXATOO.md` para cadastrar PDFs por aula, assunto ou área e para entender a integração contextual com Exatoo.


## Identidade e abas (2026)
O nome público do portal agora é **MAT MAT MAT**, com logotipo tipográfico empilhado em `assets/site.js` e favicon em `assets/favicon.svg`. Há **quatro abas por aula**: Listas e PDFs, Teoria, Quiz e Vídeos. A antiga Visão geral foi removida; links antigos `?tab=resumo` levam à Teoria. Na abertura padrão, a página seleciona **Listas e PDFs somente quando há materiais publicados ou lista gerada**, caso contrário seleciona **Teoria**. A home usa um único campo de busca, sem os textos de apoio e botões de exemplos anteriores.
