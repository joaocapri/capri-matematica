# Modo gravação — plano de construção

Objetivo: gravar as videoaulas do curso com o iPad (modo aula) + iPhone no tripé (rosto, 4K) e montar o vídeo
final no MacBook, numa página do site, com liberdade de layout (câmera no canto, lado a lado, tela cheia…).

Equipamento do professor: iPad + Apple Pencil, iPhone, MacBook. Microfone de lapela no iPhone (recomendado).

## A ideia central
Não gravar a tela do iPad como vídeo. O modo aula já sabe cada traço (posição, pressão, cor) e quando foi feito.
A gravação no iPad guarda **eventos com tempo**; o estúdio no Mac **redesenha** a escrita em qualquer resolução,
sempre nítida, e junta com o vídeo do iPhone (gravado no app Câmera, qualidade máxima, sem rede).

```
iPad /modo-aula/  ── botão Gravar ──▶ arquivo .gravacao (eventos com tempo) ──AirDrop──┐
iPhone (Câmera, 4K, lapela) ─────────▶ vídeo .mov/.mp4 ──────────────AirDrop / cabo──┤
                                                                                     ▼
Mac /estudio/  ── sincroniza pelo bipe ── layouts + cortes ── exporta MP4 (WebCodecs)
```

## Fase 1 — gravar no iPad (modo aula)
- Botão **Gravar** (menu ⋯ e/ou barra). Ao tocar: contagem 3-2-1, **bipe característico** (WebAudio, ex.: 3 tons
  curtos de 2 kHz) e **flash branco** na tela no instante zero. O iPhone já está gravando e capta o bipe.
- Indicador "● REC 12:34" na barra; Pausar/Retomar (pausa = trecho que o estúdio pula); Parar.
- Registro (`gravacao.eventos`, tempo em ms desde o zero):
  - `inicio`: retrato completo da aula (páginas, objs, traços, papel, página atual).
  - traço ao vivo: `ini` (cabeça do traço) + pontos com tempo `[x, y, p, t]` + `fim` (forma reconhecida incluída).
  - mudanças da página por **diferença**: depois de cada mudança (o `mudouPagina`/`registrar` já existe), compara
    os traços da página atual com o último estado gravado (por referência de objeto e `id`) e grava `add`/`del`/`troca`;
    `objs` (questões) gravados inteiros quando mudam (são poucos). Isso cobre apagar, mover, redimensionar,
    desfazer/refazer, duplicar, colar do aluno, sem mexer em cada ferramenta.
  - `pagina` (troca da página atual), `paginas` (ordem/inserção/remoção), `papel`, `vista` (zoom, com intervalo
    mínimo), `laser` (pontos com tempo).
- Salvo no IndexedDB do iPad (lista "Gravações" na tela inicial), com nome = aula do site (ex.: "2.15.1 — parte 1").
- **Exportar gravação**: arquivo `.gravacao.json` (comprimido com CompressionStream gzip) pela janela de
  compartilhar → AirDrop para o Mac.
- Teste da fase: gravar 2 min, abrir num reprodutor simples (canvas) e ver a escrita surgir no mesmo ritmo.

## Fase 2 — estúdio no Mac (/estudio/, noindex, endereço escondido)
- Abrir a gravação (.gravacao) e o vídeo do iPhone (File API, sem subir para servidor; arquivos de vários GB).
- **Sincronia automática**: lê o áudio dos primeiros ~2 min do vídeo (mp4box.js + AudioDecoder) e acha o bipe por
  correlação; ajuste fino manual (±frames) com prévia lado a lado.
- **Prévia**: `<video>` + canvas da escrita no mesmo relógio; barra de tempo com miniaturas.
- **Layouts** (canvas 16:9):
  - *Quadro + câmera ao lado* (padrão): página 1200×849 ocupa a altura toda (≈1527 px em 1080p) e a câmera fica
    numa coluna vertical à direita (≈393 px), recorte central do vídeo 4K.
  - *Quadro + câmera no canto*: janela arredondada, 4 cantos, 3 tamanhos.
  - *Câmera cheia* (abertura, conversa) e *Só quadro*.
  - Trocas de layout marcadas na linha do tempo, com transição suave (~400 ms).
  - Marca MAT com JOÃO!, "Prof. João Capri · @joa.capri", fundo nas cores do site.
- A página acompanha o zoom do iPad (opcional): quando ele dá zoom na página, o vídeo também aproxima.

## Fase 3 — exportar o MP4
- WebCodecs `VideoEncoder` (H.264, hardware do Mac) + `mp4-muxer` (vendor em `assets/vendor/`).
- Para cada quadro (30 fps): fundo → página no estado do tempo t → quadro do vídeo do iPhone (VideoDecoder via
  mp4box.js) no layout do momento.
- Áudio do iPhone copiado sem recodificar quando possível (AAC), senão AudioEncoder.
- 1080p (rápido) ou 4K. Barra de progresso; o resultado vai para Downloads.
- Reprodução eficiente: cursor que só anda para a frente na exportação; para buscar na prévia, retratos do
  estado a cada ~10 s.

## Fase 4 — extras
- Cortes (tirar trechos: escrita e vídeo andam juntos).
- Versão vertical 9:16 para Reels (escrita em cima, rosto embaixo) da mesma gravação.
- Prévia ao vivo no Mac durante a gravação (o estúdio entra na sala do modo aula como observador).
- Legendas automáticas (depois).

## Recomendações de gravação (para o professor)
- iPhone: Ajustes > Câmera > Gravar vídeo: 4K a 30 fps. Formato "Mais compatível" (H.264) se o estúdio tiver
  problema com HEVC no Chrome; o Safari do Mac lê HEVC.
- Microfone de lapela no iPhone; o bipe do iPad precisa ser audível (volume do iPad alto no início).
- Modo Não Perturbe no iPad e no iPhone; iPad na tomada.
- Uma gravação por aula do site, ou partes (parte 1, parte 2…) para aulas longas.

## Ordem de trabalho
1. Fase 1 inteira, com testes no navegador (Playwright) e um reprodutor simples.
2. Estúdio: abrir arquivos, prévia sincronizada, sincronia pelo bipe.
3. Layouts e linha do tempo.
4. Exportação MP4 (testar com um vídeo 4K curto de exemplo gerado no próprio teste).
5. Extras.
