# MAT MAT MAT! — Área de turmas
**Gestão editorial pelo GitHub; URLs compartilháveis apenas com os alunos.**

Existe um índice não listado em `/turmas/`, para facilitar a navegação do professor. Nenhuma dessas páginas aparece na home pública.

Estas páginas são *não listadas* — não aparecem na home, no menu, nos resultados da busca nem em páginas públicas. Os endereços têm `noindex` e são desencorajados aos buscadores. **Isso não constitui autenticação ou privacidade real**: qualquer pessoa com a URL pode abrir a página, ver os arquivos e compartilhá-la. Não publicar notas individuais, listas de presença, dados pessoais, contatos de alunos, avaliações privadas ou conteúdo que exija controle de acesso. Para acesso privado real, será necessário login/autorização no servidor.

## Links das turmas (enviar o endereço direto aos alunos)
- **Maxi 1P1** — `/turmas/maxi/1p1/`
- **Maxi 1P2** — `/turmas/maxi/1p2/`
- **Maxi 2P1** — `/turmas/maxi/2p1/`
- **Maxi 2P2** — `/turmas/maxi/2p2/`
- **Maxi 3P1** — `/turmas/maxi/3p1/`
- **Maxi 3P2** — `/turmas/maxi/3p2/`
- **Maxi Fera** — `/turmas/maxi/fera/`
- **Maxi Med** — `/turmas/maxi/med/`
- **Integral 3A** — `/turmas/integral/3a/`
- **Integral 3B** — `/turmas/integral/3b/`
- **Integral 3C** — `/turmas/integral/3c/`
- **Integral Semi** — `/turmas/integral/semi/`

### Atualização
Confirmado: a segunda turma do 2º ano é **Maxi 2P2**. Os links `/turmas/maxi/2p1/` e `/turmas/maxi/2p2/` são separados.

## Como publicar um aviso, PDF, teoria ou roteiro
1. Abra o arquivo JSON específico em `data/turmas/` no GitHub (por exemplo, `data/turmas/maxi-1p1.json`).
2. Clique em **Edit** (ícone de lápis), mantenha a sintaxe JSON, adicione os itens nos arrays e salve o commit.
3. Para um PDF novo, primeiro faça upload pelo GitHub em uma pasta como `turmas/arquivos/maxi/1p1/`. Depois vincule sua URL no JSON, por exemplo `"/turmas/arquivos/maxi/1p1/lista-01.pdf"`.
4. As páginas atualizam quando os arquivos forem publicados no host; não é necessário editar HTML/CSS para cada atualização. Não há formulário de upload protegido no site nesta primeira versão.

### Exemplo de aviso
```json
{"id":"aviso-01","title":"Lista da próxima aula","text":"A lista estará disponível em PDF abaixo.","date":"2026-10-26","pinned":true}
```

### Exemplo de lista em PDF
```json
{"id":"lista-01","type":"lista","title":"Lista 01 — Função Quadrática","description":"Exercícios de fixação para a turma.","date":"2026-10-26","lesson":"A17","url":"/turmas/arquivos/maxi/1p1/lista-01.pdf","action":"Baixar PDF"}
```

### Exemplo de teoria curta *na própria página*
```json
{"id":"teoria-01","type":"teoria","title":"Resumo — Produto notável","description":"Retome as identidades e pratique.","date":"2026-10-26","body":["Primeiro parágrafo da explicação.","Segundo parágrafo da explicação."]}
```

### Exemplo de link para vídeo ou material externo
```json
{"id":"video-01","type":"video","title":"Resolução comentada","description":"Vídeo de apoio.","url":"https://example.com/video","action":"Assistir"}
```

### Exemplo de roteiro
```json
{"title":"Funções do 2º grau","description":"Acompanhe teoria e exercícios sobre raízes e gráfico.","url":"/aulas/A17/"}
```

### Exemplo de aula relacionada
```json
{"code":"A17","title":"Raízes, discriminante, soma e produto","url":"/aulas/A17/"}
```

Campos e categorias aceitas para `materials[].type`: `lista`, `teoria`, `resumo`, `revisao`, `video`, `link`. Os links são opcionais para notas de teoria com `body`; textos são apresentados com escape de HTML por segurança. O roteiro aceita `title`, `description`, `url` (opcional).

## Estrutura do projeto
- `turmas/maxi/1p1/index.html` ... `turmas/integral/semi/index.html`: 11 páginas diretas.
- `data/turmas/*.json`: 11 coleções independentes.
- `assets/turmas.js` e `assets/turmas.css`: layout e interações compartilhados.
- `_headers` e `robots.txt`: pedem aos buscadores para não indexarem as páginas, sem prometer sigilo.
- Nenhuma rota de turmas foi adicionada ao menu nem ao índice de busca.

**Nota para implantação:** links do tipo `/turmas/maxi/1p1/` funcionam em servidores estáticos que servem `index.html` por diretório. O Cloudflare Pages usa o arquivo `_headers` para retornar a diretiva X-Robots-Tag.
