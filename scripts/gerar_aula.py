#!/usr/bin/env python3
"""Gera o caderno de gravação de uma aula (PDF 16:9 para abrir no GoodNotes).

Fonte: materiais-fonte/aulas/XNN.yaml (roteiro da aula, matemática em LaTeX).
Saída: gravacao/XNN.pdf (fora do site: a pasta não é publicada).

Uso:  python3 scripts/gerar_aula.py A17 [B05 ...]
Requer XeLaTeX (TeX Live), as fontes Inter e PyYAML.

Formato do roteiro
------------------
aula: A17
abertura: {titulo, texto, pergunta}          # gancho da aula, com quadro para rascunho
blocos:                                       # uma página por bloco, na ordem da gravação
  - {tipo: teoria, titulo, texto, formulas: [...], dica?, atencao?}
  - {tipo: exemplo, titulo?, enunciado, resposta}
  - {tipo: exercicios, titulo?, itens: [{enunciado, resposta}, ...]}   # 1 a 3 itens
  - {tipo: retorno, titulo, texto, resposta}  # volta à pergunta da abertura
resumo: [frases com lacunas]
Lacunas: escreva {{resposta}} no texto ou numa fórmula. No PDF aparece um traço para
preencher ao vivo; a resposta vai para o gabarito do professor, nas últimas páginas.
"""
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
FONTE = ROOT / "materiais-fonte" / "aulas"
DEST = ROOT / "gravacao"

PREAMBULO = r"""
\documentclass[12pt]{article}
\usepackage[paperwidth=254mm,paperheight=142.875mm,margin=0mm]{geometry}
\usepackage{fontspec}
\usepackage{amsmath,amssymb,mathtools}
\usepackage{unicode-math}
\setmainfont{Inter}
\setmathfont{Latin Modern Math}[Scale=MatchLowercase]
\setmathfont[range={up/num},Scale=MatchLowercase]{Inter}
\newfontfamily\logofont{Inter Display Black}
\newfontfamily\displayfont{Inter Display}[UprightFont=* ExtraBold, BoldFont=* Black]
\newfontfamily\symfont{DejaVu Sans}
\usepackage{ragged2e}
\hyphenpenalty=10000\exhyphenpenalty=10000
\usepackage{xcolor}
\definecolor{ink}{HTML}{211946}
\definecolor{roxo}{HTML}{4A27B7}
\definecolor{lima}{HTML}{D3FC61}
\definecolor{limatxt}{HTML}{D6FA74}
\definecolor{laranja}{HTML}{FF7956}
\definecolor{exclam}{HTML}{FF936E}
\definecolor{suave}{HTML}{F1EDFC}
\definecolor{papel}{HTML}{FAF9F4}
\definecolor{mudo}{HTML}{746B83}
\definecolor{ponto}{HTML}{CFC8DD}
\definecolor{alerta}{HTML}{FFF0E8}
\definecolor{alertatxt}{HTML}{B5481F}
\definecolor{dica}{HTML}{EFFBC7}
\color{ink}
\usepackage{tikz}
\usetikzlibrary{calc}
\setlength{\parindent}{0pt}
\linespread{1.18}
\frenchspacing
\pagestyle{empty}
\AtBeginDocument{\thickmuskip=5mu\medmuskip=4mu}

% ---------- marca (troque só aqui quando a logo nova estiver pronta) ----------
\newcommand{\marca}[1][\footnotesize]{{\logofont#1 MAT MAT MAT\textcolor{exclam}{!}}}

% ---------- lacuna: traço para preencher ao vivo ----------
\newlength{\lacw}
\newcommand{\lacuna}[1]{\settowidth{\lacw}{#1}\addtolength{\lacw}{10mm}\textcolor{roxo!55}{\rule[-0.6ex]{\lacw}{0.8pt}}}
\newcommand{\lacunam}[1]{\settowidth{\lacw}{$\displaystyle #1$}\addtolength{\lacw}{12mm}\mathord{\textcolor{roxo!55}{\rule[-0.6ex]{\lacw}{0.8pt}}}}

% ---------- peças de página ----------
\newcommand{\fundo}{\fill[papel] (current page.south west) rectangle (current page.north east);}
\newcommand{\topo}[2]{% rótulo, título
  \node[anchor=north west,fill=ink,text=white,rounded corners=3pt,inner xsep=6pt,inner ysep=3.5pt,font=\scriptsize\bfseries]
     (rot) at ($(current page.north west)+(10mm,-8mm)$) {#1};
  \node[anchor=west,font=\displayfont\fontsize{20}{23}\selectfont,text=ink,inner sep=0]
     (tit) at ($(rot.east)+(4mm,0)$) {#2};}
\newcommand{\rodape}[1]{%
  \node[anchor=south west,inner sep=0,text=mudo] at ($(current page.south west)+(10mm,4.5mm)$) {\marca[\scriptsize]};
  \node[anchor=south east,inner sep=0,font=\scriptsize,text=mudo] at ($(current page.south east)+(-10mm,4.5mm)$) {#1};}
% quadro pontilhado para escrever: canto inferior esquerdo (x1,y1), superior direito (x2,y2), em mm
\newcommand{\quadro}[4]{%
  \begin{scope}
    \path[fill=white,draw=roxo!14,line width=.6pt,rounded corners=8pt] ($(current page.south west)+(#1mm,#2mm)$) rectangle ($(current page.south west)+(#3mm,#4mm)$);
    \clip[rounded corners=8pt] ($(current page.south west)+(#1mm,#2mm)$) rectangle ($(current page.south west)+(#3mm,#4mm)$);
    \foreach \x in {0,6,...,240} { \foreach \y in {0,6,...,130} {
      \pgfmathsetmacro{\px}{#1+3+\x}\pgfmathsetmacro{\py}{#2+3+\y}
      \fill[ponto] ($(current page.south west)+(\px mm,\py mm)$) circle (.28mm);
    } }
  \end{scope}}
"""

PAGINA = r"""
\begin{tikzpicture}[remember picture,overlay]
\fundo
<<CORPO>>
\end{tikzpicture}
\null\newpage
"""


def lacunas(s, gab, math=False):
    """{{x}} vira traço; a resposta vai para a lista do gabarito. Respeita chaves dentro de x."""
    s, out, i = str(s), [], 0
    while True:
        j = s.find("{{", i)
        if j < 0:
            out.append(s[i:]); break
        out.append(s[i:j])
        k, prof = j + 2, 0
        while k < len(s):
            if s[k] == "{": prof += 1
            elif s[k] == "}":
                if prof == 0 and s[k:k + 2] == "}}": break
                prof -= 1
            k += 1
        conteudo = s[j + 2:k]
        em_math = math or len(re.findall(r"(?<!\\)\$", s[:j])) % 2 == 1
        gab.append("$%s$" % conteudo if em_math else conteudo)
        out.append((r"\lacunam{%s}" if em_math else r"\lacuna{%s}") % conteudo)
        i = k + 2
    return "".join(out)


def par(texto):
    linhas = [l.strip() for l in str(texto).strip().splitlines() if l.strip()]
    return r"\par\vspace{2.2mm}".join(linhas)


def esc_label(s):
    return s.replace("&", r"\&")


def documento(aula, fonte):
    paginas, gabarito = [], []   # gabarito: (rótulo, texto)
    total = []                    # para numerar "n de N"

    def pag(corpo):
        paginas.append(corpo)

    area = aula["area"]
    # ---------- capa ----------
    objetivos = "".join(r"\item %s" % o for o in fonte.get("objetivos", []))
    pag(r"""
\fill[ink] (current page.south west) rectangle (current page.north east);
\fill[lima] ($(current page.south west)+(0,0)$) rectangle ($(current page.south east)+(0,3mm)$);
\node[anchor=north west,inner sep=0,text=white] at ($(current page.north west)+(14mm,-12mm)$) {\marca[\large]};
\node[anchor=north east,fill=lima,text=ink,rounded corners=8pt,inner xsep=8pt,inner ysep=4pt,font=\small\bfseries]
   at ($(current page.north east)+(-14mm,-11mm)$) {AULA %(id)s};
\node[anchor=north west,text=limatxt,font=\small\bfseries,inner sep=0] at ($(current page.north west)+(14mm,-36mm)$) {%(area)s \,·\, %(topico)s};
\node[anchor=north west,text=white,font=\displayfont\fontsize{38}{42}\selectfont,text width=150mm,align=left,inner sep=0]
   (t) at ($(current page.north west)+(14mm,-44mm)$) {%(titulo)s};
\node[anchor=north east,text=white,text width=74mm,align=left,inner sep=0,font=\small]
   at ($(current page.north east)+(-14mm,-36mm)$) {{\color{limatxt}\bfseries NESTA AULA}\par\vspace{2mm}
   \begin{itemize}\setlength{\itemsep}{2pt}\setlength{\leftmargin}{4mm}%(obj)s\end{itemize}};
\node[anchor=south west,text=white!70!ink,font=\footnotesize,inner sep=0] at ($(current page.south west)+(14mm,10mm)$) {Prof. João Capri \,·\, Matemática sem enrolação};
""" % dict(id=aula["id"], area=area, topico=aula["topico"], titulo=aula["title"], obj=objetivos))

    # ---------- abertura ----------
    ab = fonte.get("abertura")
    if ab:
        g = []
        txt = lacunas(par(ab["texto"]), g)
        perg = lacunas(ab["pergunta"], g)
        gabarito += [("Pra começar", x) for x in g]
        pag(r"""
\topo{PRA COMEÇAR}{%s}
\node[anchor=north west,text width=92mm,align=left,inner sep=0,font=\large] (txt) at ($(current page.north west)+(10mm,-24mm)$) {\RaggedRight %s
  \par\vspace{5mm}\colorbox{suave}{\parbox{88mm}{\vspace{2mm}\hspace{2mm}\parbox{84mm}{\RaggedRight\bfseries\color{roxo} %s}\vspace{2mm}}}};
\quadro{110}{12}{244}{124}
\rodape{<<PAG>>}
""" % (ab["titulo"], txt, perg))

    # ---------- blocos ----------
    n_ex = 0
    for b in fonte["blocos"]:
        t = b["tipo"]
        if t == "teoria":
            g = []
            txt = lacunas(par(b["texto"]), g)
            forms = "".join(r"\par\vspace{1.5mm}$\displaystyle %s$" % lacunas(f, g, math=True) for f in b.get("formulas", []))
            caixa = ""
            if forms:
                caixa = (r"\par\vspace{4mm}\noindent\fcolorbox{roxo!30}{white}{\parbox{90mm}{\vspace{1mm}\hspace{2mm}"
                         r"{\scriptsize\bfseries\color{roxo}FÓRMULA}\par\centering%s\par\vspace{2.5mm}}}" % forms)
            extra = ""
            if b.get("dica"):
                extra += r"\par\vspace{3mm}\colorbox{dica}{\parbox{90mm}{\vspace{1.5mm}{\scriptsize\bfseries MACETE}\par\normalsize %s\vspace{1.5mm}}}" % lacunas(b["dica"], g)
            if b.get("atencao"):
                extra += r"\par\vspace{3mm}\colorbox{alerta}{\parbox{90mm}{\vspace{1.5mm}{\scriptsize\bfseries\color{alertatxt} ARMADILHA DE PROVA}\par\normalsize %s\vspace{1.5mm}}}" % lacunas(b["atencao"], g)
            gabarito += [(b["titulo"], x) for x in g]
            pag(r"""
\topo{TEORIA}{%s}
\node[anchor=north west,text width=94mm,align=left,inner sep=0,font=\large] at ($(current page.north west)+(10mm,-24mm)$) {\RaggedRight %s%s%s};
\quadro{112}{12}{244}{124}
\rodape{<<PAG>>}
""" % (b["titulo"], txt, caixa, extra))
        elif t in ("exemplo", "retorno"):
            g = []
            if t == "exemplo":
                n_ex += 1
                rot, tit = "EXEMPLO %d" % n_ex, b.get("titulo", "Vamos resolver juntos")
            else:
                rot, tit = "DE VOLTA AO COMEÇO", b.get("titulo", "Agora dá para responder")
            enun = lacunas(par(b.get("enunciado") or b.get("texto")), g)
            gabarito.append((rot.capitalize() if t == "exemplo" else "De volta ao começo", b["resposta"]))
            gabarito += [(rot.capitalize(), x) for x in g]
            pag(r"""
\topo{%s}{%s}
\node[anchor=north west,fill=suave,rounded corners=8pt,text width=226mm,align=left,inner xsep=4mm,inner ysep=3.5mm,font=\large]
   (en) at ($(current page.north west)+(10mm,-22mm)$) {\RaggedRight %s};
\path let \p1=(en.south), \p2=(current page.south west) in \pgfextra{\pgfmathsetmacro{\topo}{(\y1-\y2)/2.845274-4}\xdef\qtopo{\topo}};
\quadro{10}{12}{244}{\qtopo}
\rodape{<<PAG>>}
""" % (rot, tit, enun))
        elif t == "exercicios":
            itens = b["itens"]
            k = len(itens)
            larg = (234 - (k - 1) * 6) / k
            corpo = r"\topo{SUA VEZ}{%s}" % b.get("titulo", "Tente antes de ver a resolução") + "\n"
            for i, it in enumerate(itens):
                g = []
                x0 = 10 + i * (larg + 6)
                enun = lacunas(par(it["enunciado"]), g)
                n_ex_item = len([1 for r, _ in gabarito if r.startswith("Sua vez")]) + 1
                gabarito.append(("Sua vez %d" % n_ex_item, it["resposta"]))
                corpo += r"""
\node[anchor=north west,fill=suave,rounded corners=8pt,text width=%(w)smm,align=left,inner xsep=3.5mm,inner ysep=3mm,font=\normalsize,minimum height=24mm]
   (e%(i)d) at ($(current page.north west)+(%(x)smm,-22mm)$) {{\bfseries\color{roxo}%(n)d.}\enspace\RaggedRight %(t)s};
""" % dict(w=larg - 7, i=i, x=x0, n=n_ex_item, t=enun)
            # quadros: começam abaixo do enunciado mais alto
            corpo += r"\path let " + ", ".join(r"\p%d=(e%d.south)" % (i + 1, i) for i in range(k)) + \
                     r" in \pgfextra{\pgfmathsetmacro{\m}{min(%s)}\xdef\qmin{\m}};" % ",".join(r"\y%d" % (i + 1) for i in range(k)) + "\n"
            corpo += r"\path let \p9=(current page.south west) in \pgfextra{\pgfmathsetmacro{\t}{(\qmin-\y9)/2.845274-4}\xdef\qtopo{\t}};" + "\n"
            for i in range(k):
                x0 = 10 + i * (larg + 6)
                corpo += r"\quadro{%s}{12}{%s}{\qtopo}" % (x0, x0 + larg) + "\n"
            corpo += r"\rodape{<<PAG>>}"
            pag(corpo)

    # ---------- resumo ----------
    if fonte.get("resumo"):
        g = []
        itens = "".join(r"\item %s" % lacunas(r, g) for r in fonte["resumo"])
        gabarito += [("Para não esquecer", x) for x in g]
        pag(r"""
\topo{RESUMO}{Para não esquecer}
\node[anchor=north west,text width=150mm,align=left,inner sep=0,font=\large] at ($(current page.north west)+(10mm,-26mm)$)
  {\begin{itemize}\setlength{\itemsep}{5mm}\RaggedRight %s\end{itemize}};
\quadro{170}{12}{244}{124}
\rodape{<<PAG>>}
""" % itens)

    # ---------- encerramento ----------
    pag(r"""
\fill[ink] (current page.south west) rectangle (current page.north east);
\fill[lima] (current page.south west) rectangle ($(current page.south east)+(0,3mm)$);
\node[anchor=west,text=white,font=\displayfont\fontsize{34}{38}\selectfont,text width=200mm,align=left,inner sep=0]
   at ($(current page.west)+(14mm,14mm)$) {Agora é com você};
\node[anchor=north west,text=white!85!ink,text width=200mm,align=left,inner sep=0,font=\large]
   at ($(current page.west)+(14mm,0mm)$) {No site, na aula %(id)s, tem a \textcolor{limatxt}{\bfseries lista de fixação} (20 questões) e a \textcolor{limatxt}{\bfseries lista de vestibular} (20 questões), as duas com gabarito resolvido.};
\node[anchor=south west,inner sep=0,text=white] at ($(current page.south west)+(14mm,12mm)$) {\marca[\large]};
""" % dict(id=aula["id"]))

    # ---------- gabarito do professor ----------
    linhas = []
    for rot, x in gabarito:
        linhas.append(r"\textbf{\color{roxo}%s:}\enspace %s" % (esc_label(rot), par(x)))
    por_pag = 14
    for i in range(0, max(len(linhas), 1), por_pag):
        bloco_l = linhas[i:i + por_pag]
        meio = (len(bloco_l) + 1) // 2
        col = lambda ls: r"\par\vspace{2.2mm}".join(ls)
        pag(r"""
\topo{SÓ PARA O PROFESSOR}{Gabarito da gravação}
\node[anchor=north west,text width=113mm,align=left,inner sep=0,font=\small] at ($(current page.north west)+(10mm,-24mm)$) {\RaggedRight %s};
\node[anchor=north west,text width=113mm,align=left,inner sep=0,font=\small] at ($(current page.north west)+(131mm,-24mm)$) {\RaggedRight %s};
\rodape{<<PAG>>}
""" % (col(bloco_l[:meio]), col(bloco_l[meio:])))

    n = len(paginas)
    corpo = "".join(PAGINA.replace("<<CORPO>>", p.replace("<<PAG>>", "Aula %s \\,·\\, %d de %d" % (aula["id"], i + 1, n)))
                    for i, p in enumerate(paginas))
    return PREAMBULO + "\\begin{document}\n" + corpo + "\\end{document}\n"


def info_aula(codigo):
    dados = json.loads((ROOT / "data" / "aulas.json").read_text(encoding="utf-8"))
    aula = next(a for a in dados["lessons"] if a["id"] == codigo)
    mod = next(b for b in dados["blocks"] if b["id"] == aula["block"])
    vol = next(f for f in dados["fronts"] if f["id"] == aula["front"])
    return dict(aula, topico=f"Módulo {mod['numero'].upper()} \\,·\\, {mod['title']}", area=f"Volume {vol['id']} \\,·\\, {vol['name']}")


def gerar(codigo):
    aula = info_aula(codigo)
    fonte = yaml.safe_load((FONTE / f"{codigo}.yaml").read_text(encoding="utf-8"))
    tex = documento(aula, fonte)
    DEST.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        arq = Path(tmp) / "aula.tex"
        arq.write_text(tex, encoding="utf-8")
        for _ in range(2):
            r = subprocess.run(["xelatex", "-interaction=nonstopmode", "-halt-on-error", arq.name], cwd=tmp, capture_output=True, text=True)
            if r.returncode:
                debug = Path(tempfile.gettempdir()) / f"erro-aula-{codigo}.tex"
                debug.write_text(tex, encoding="utf-8")
                sys.exit(f"Erro no XeLaTeX ({codigo}); fonte em {debug}:\n" + r.stdout[-2500:])
        destino = DEST / f"{codigo}.pdf"
        shutil.copy(Path(tmp) / "aula.pdf", destino)
    return destino


if __name__ == "__main__":
    for c in [a for a in sys.argv[1:] if not a.startswith("--")] or ["2.3.2"]:
        print("gerado:", gerar(c).relative_to(ROOT))
