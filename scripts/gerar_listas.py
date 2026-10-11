#!/usr/bin/env python3
"""Gera as listas em PDF (fixação e vestibular) de cada aula do MAT MAT MAT!.

Fonte: materiais-fonte/A17.yaml (uma por aula), com a matemática em LaTeX.
Saída: pdfs/fixacao-A17.pdf e pdfs/vestibular-A17.pdf

Uso:  python3 scripts/gerar_listas.py A17 [B05 ...]
Requer XeLaTeX (TeX Live), as fontes Inter e PyYAML.
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
FONTE = ROOT / "materiais-fonte"
DEST = ROOT / "pdfs"

PREAMBULO = r"""
\documentclass[10pt]{article}
\usepackage[a4paper,top=21mm,bottom=19mm,left=14mm,right=14mm,headsep=6mm,footskip=10mm]{geometry}
\usepackage{fontspec}
\usepackage{amsmath,amssymb,mathtools}
\usepackage{unicode-math}
\setmainfont{Inter}
\setmathfont{Latin Modern Math}[Scale=MatchLowercase]
\setmathfont[range={up/num},Scale=MatchLowercase]{Inter}
\AtBeginDocument{\thickmuskip=5mu\medmuskip=4mu\relpenalty=900\binoppenalty=10000\lineskiplimit=2pt\lineskip=3.5pt}
\newfontfamily\logofont{Inter Display Black}
\newfontfamily\displayfont{Inter Display}[UprightFont=* ExtraBold, BoldFont=* Black]
\newfontfamily\symfont{DejaVu Sans}
\usepackage{ragged2e}
\hyphenpenalty=10000\exhyphenpenalty=10000
\usepackage{xcolor}
\definecolor{ink}{HTML}{211946}
\definecolor{inkdeep}{HTML}{2D195A}
\definecolor{roxo}{HTML}{4A27B7}
\definecolor{lima}{HTML}{D3FC61}
\definecolor{limatxt}{HTML}{D6FA74}
\definecolor{laranja}{HTML}{FF7956}
\definecolor{exclam}{HTML}{FF936E}
\definecolor{suave}{HTML}{F1EDFC}
\definecolor{papel}{HTML}{FAF9F4}
\definecolor{mudo}{HTML}{746B83}
\color{ink}
\usepackage{tikz}
\usetikzlibrary{calc}
\usepackage{multicol}
\setlength{\columnsep}{8mm}
\setlength{\columnseprule}{0.4pt}
\renewcommand{\columnseprulecolor}{\color{roxo!18}}
\usepackage{enumitem}
\usepackage{fancyhdr}
\usepackage{lastpage}
\usepackage{needspace}
\usepackage{calc}
\setlength{\parindent}{0pt}
\AtBeginDocument{\RaggedRight\setlength{\RaggedRightParindent}{0pt}}
\linespread{1.12}
\frenchspacing
\raggedbottom

% ---------- marca ----------
\newcommand{\estrela}{{\symfont ✳}}
\newcommand{\matlogo}[1]{%
  \begin{tikzpicture}[baseline=0pt]
    \begin{scope}[every node/.style={inner sep=0,anchor=base west,font=\logofont\fontsize{#1}{#1}\selectfont}]
      \node[text=white] at (0,0) {MAT};
      \node[text=limatxt] at (0.16*#1 pt,-0.9*#1 pt) {MAT};
      \node[text=white] (ult) at (0,-1.8*#1 pt) {MAT};
      \node[text=exclam,rotate=8,anchor=base west] at ($(ult.base east)+(0.06*#1 pt,0)$) {!};
    \end{scope}
  \end{tikzpicture}}

% ---------- cabeçalho / rodapé ----------
\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0pt}
\fancyhead[L]{\begin{tikzpicture}[baseline=-0.6ex]
  \node[fill=ink,rounded corners=2pt,inner xsep=5pt,inner ysep=3pt,text=white,font=\logofont\scriptsize]{MAT MAT MAT\textcolor{exclam}{!}};
  \end{tikzpicture}\hspace{2mm}{\footnotesize\color{mudo}<<CABECALHO>>}}
\fancyhead[R]{\footnotesize\bfseries\color{roxo}<<TIPOCURTO>>}
\fancyfoot[L]{\footnotesize\color{mudo}MAT MAT MAT! \,·\, Matemática sem enrolação \,·\, Prof. João Capri}
\fancyfoot[R]{\begin{tikzpicture}[baseline=-0.6ex]
  \node[fill=roxo,text=white,rounded corners=6pt,inner xsep=6pt,inner ysep=2.5pt,font=\footnotesize\bfseries]{\thepage\,/\,\pageref*{LastPage}};
  \end{tikzpicture}}
\fancypagestyle{capa}{\fancyhead{}}

% ---------- questões ----------
\newlength{\espacoq}\setlength{\espacoq}{5.5mm}
\newlength{\badgew}\setlength{\badgew}{8.5mm}
\newcommand{\qbadge}[2][roxo]{\tikz[baseline=(n.base)]\node[fill=#1,text=white,rounded corners=3pt,inner xsep=0pt,inner ysep=2.6pt,minimum width=6.4mm,font=\small\bfseries](n){#2};}
\newcommand{\questao}[3][\espacoq]{%
  \par\noindent\makebox[\badgew][l]{\qbadge{#2}}%
  \parbox[t]{\linewidth-\badgew}{\RaggedRight\setlength{\parskip}{3pt}#3}\par\vspace{#1}}
\NewDocumentCommand{\letra}{m}{\tikz[baseline=(l.base)]\node[circle,draw=roxo,line width=.7pt,inner sep=0pt,minimum size=4.6mm,font=\scriptsize\bfseries,text=roxo](l){#1};}
\newlist{itens}{enumerate}{1}
\setlist[itens]{label={\color{roxo}\bfseries(\alph*)},leftmargin=7mm,labelsep=2mm,topsep=3pt,itemsep=2.5pt,parsep=0pt}

% alternativas: o LaTeX mede a maior e escolhe 5, 3, 2 ou 1 coluna
\newlength{\altw}\newlength{\altmax}\newlength{\altcel}
\newcommand{\medir}[1]{\settowidth{\altw}{#1}\ifdim\altw>\altmax\global\altmax=\altw\fi}
\newcommand{\cel}[2]{\makebox[\altcel][l]{\letra{#1}\hspace{1.8mm}#2}\hspace{0pt}}
\newcommand{\umacol}[2]{\par\noindent\hangindent=7mm\hangafter=1\makebox[7mm][l]{\letra{#1}}#2}
\newcommand{\alternativas}[5]{%
  \global\altmax=0pt\medir{#1}\medir{#2}\medir{#3}\medir{#4}\medir{#5}%
  \addtolength{\altmax}{8mm}%
  \par\vspace{4pt}\setlength{\parskip}{3.5pt}%
  \ifdim\dimexpr5\altmax\relax<\linewidth \setlength{\altcel}{\dimexpr\linewidth/5-0.2pt\relax}%
  \else\ifdim\dimexpr3\altmax\relax<\linewidth \setlength{\altcel}{\dimexpr\linewidth/3-0.2pt\relax}%
  \else\ifdim\dimexpr2\altmax\relax<\linewidth \setlength{\altcel}{\dimexpr\linewidth/2-0.2pt\relax}%
  \else\setlength{\altcel}{0pt}\fi\fi\fi
  \ifdim\altcel>0pt \noindent\cel{A}{#1}\cel{B}{#2}\cel{C}{#3}\cel{D}{#4}\cel{E}{#5}\par
  \else\umacol{A}{#1}\umacol{B}{#2}\umacol{C}{#3}\umacol{D}{#4}\umacol{E}{#5}\par\fi}
\newlist{alts}{itemize}{1}
\setlist[alts]{leftmargin=7mm,labelsep=2mm,topsep=4pt,itemsep=3pt,parsep=0pt}
\newcommand{\nivel}[2]{%
  \par\needspace{38mm}\vspace{1mm}\noindent
  \begin{tikzpicture}
    \node[fill=lima,text=ink,rounded corners=2pt,inner xsep=6pt,inner ysep=3.5pt,font=\scriptsize\bfseries,anchor=west](t) at (0,0){\MakeUppercase{#1}};
    \node[font=\scriptsize,text=mudo,anchor=west] at ($(t.east)+(4pt,0)$) {#2};
  \end{tikzpicture}\par\vspace{4mm}}

% ---------- gabarito ----------
\newcommand{\resolucao}[3]{%
  \par\noindent\makebox[\badgew][l]{\qbadge[ink]{#1}}%
  \parbox[t]{\linewidth-\badgew}{\small\RaggedRight\setlength{\parskip}{2.5pt}#2%
   \par\vspace{2pt}\tikz[baseline=(r.base)]\node[fill=suave,text=roxo,rounded corners=3pt,inner xsep=5pt,inner ysep=3pt,font=\small\bfseries,text width=\linewidth-10pt](r){\color{mudo}\scriptsize RESPOSTA\quad\color{roxo}\small #3};}\par\vspace{4.5mm}}
\newcommand{\resolucaovest}[3]{%
  \par\noindent\makebox[\badgew][l]{\qbadge[ink]{#1}}%
  \parbox[t]{\linewidth-\badgew}{\small\RaggedRight\setlength{\parskip}{2.5pt}%
   \tikz[baseline=(r.base)]\node[fill=lima,text=ink,rounded corners=3pt,inner xsep=6pt,inner ysep=2.5pt,font=\small\bfseries](r){#2};\par #3}\par\vspace{4.5mm}}
\newcommand{\faixagabarito}[1]{%
  \noindent\begin{tikzpicture}
    \fill[ink,rounded corners=4pt] (0,0) rectangle (\linewidth,13mm);
    \fill[lima] (0,0) rectangle (\linewidth,1.2mm);
    \node[anchor=west,text=white,font=\displayfont\Large] at (5mm,7.2mm) {Gabarito resolvido};
    \node[anchor=east,text=limatxt,font=\small\bfseries] at (\linewidth-5mm,7.2mm) {#1};
  \end{tikzpicture}\par\vspace{5mm}}
"""

CAPA = r"""
\thispagestyle{capa}
\begin{tikzpicture}[remember picture,overlay]
  \fill[ink] (current page.north west) rectangle ($(current page.north east)+(0,-46mm)$);
  \fill[lima] ($(current page.north west)+(0,-46mm)$) rectangle ($(current page.north east)+(0,-47.6mm)$);
  \fill[laranja] ($(current page.north west)+(0,-47.6mm)$) rectangle ($(current page.north west)+(60mm,-48.6mm)$);
  \node[anchor=north west,inner sep=0] at ($(current page.north west)+(14mm,-11mm)$) {\matlogo{22}};
  \draw[limatxt,line width=.8pt] ($(current page.north west)+(52mm,-12mm)$) -- ++(0,-22mm);
  \node[anchor=north west,text=white,font=\scriptsize\bfseries,align=left,inner sep=0] at ($(current page.north west)+(56mm,-13mm)$)
     {MATEMÁTICA\\SEM ENROLAÇÃO\,\textcolor{limatxt}{\estrela}};
  \node[anchor=north west,text=white!70!ink,font=\scriptsize,align=left,inner sep=0] at ($(current page.north west)+(56mm,-24.5mm)$)
     {Prof. João Capri};
  \node[anchor=north east,inner sep=0] at ($(current page.north east)+(-14mm,-10mm)$) {%
    \tikz\node[fill=lima,text=ink,rounded corners=7pt,inner xsep=7pt,inner ysep=3pt,font=\scriptsize\bfseries]{<<CHIP>>};};
  \node[anchor=north east,text=white,font=\displayfont\fontsize{19}{22}\selectfont,align=right,text width=115mm,inner sep=0]
     at ($(current page.north east)+(-14mm,-19mm)$) {<<TITULO>>};
  \node[anchor=north east,text=limatxt,font=\small\bfseries,align=right,inner sep=0]
     at ($(current page.north east)+(-14mm,-35mm)$) {<<SUBTITULO>>};
\end{tikzpicture}
\vspace*{21mm}

\noindent\begin{tikzpicture}
  \fill[papel,rounded corners=4pt] (0,0) rectangle (\linewidth,10mm);
  \draw[roxo!15,rounded corners=4pt] (0,0) rectangle (\linewidth,10mm);
  \begin{scope}[every node/.style={font=\scriptsize\bfseries,text=mudo,anchor=west}]
    \node at (4mm,5mm) {NOME};
    \draw[roxo!30] (15mm,3.2mm) -- (0.58\linewidth,3.2mm);
    \node at (0.61\linewidth,5mm) {TURMA};
    \draw[roxo!30] ($(0.61\linewidth,3.2mm)+(13mm,0)$) -- (0.79\linewidth,3.2mm);
    \node at (0.81\linewidth,5mm) {DATA};
    \draw[roxo!30] ($(0.81\linewidth,3.2mm)+(11mm,0)$) -- ($(\linewidth,3.2mm)-(4mm,0)$);
  \end{scope}
\end{tikzpicture}

\vspace{3mm}
{\small\color{mudo}\textcolor{roxo}{\estrela}\enspace <<INTRO>>}
\vspace{5mm}
"""

def letras_visiveis(s):
    """Aproxima o tamanho impresso de um trecho LaTeX."""
    s = re.sub(r"\\(tfrac|dfrac|frac)\{([^}]*)\}\{([^}]*)\}", r"\2\3", s)
    s = re.sub(r"\\[a-zA-Z]+", "x", s)
    s = re.sub(r"[{}$\\,^_]", "", s)
    return len(s)


def bloco(texto):
    """Quebras de linha da fonte viram parágrafos."""
    linhas = [l.strip() for l in str(texto).strip().splitlines() if l.strip()]
    return r"\par ".join(linhas)


def enunciado_tex(q):
    tex = bloco(q["enunciado"])
    if q.get("itens"):
        tex += r"\begin{itens}" + "".join(r"\item " + i for i in q["itens"]) + r"\end{itens}"
    if q.get("opcoes"):
        ops = q["opcoes"]
        tex += r"\alternativas" + "".join("{%s}" % o for o in ops)
    return tex


def documento(aula, tipo, dados):
    fixa = tipo == "fixacao"
    nome_tipo = "Lista de fixação" if fixa else "Lista de vestibular"
    total = (sum(len(s["questoes"]) for s in dados["secoes"]) if fixa else len(dados["questoes"]))
    tex = PREAMBULO
    tex = tex.replace("<<CABECALHO>>", f"Aula {aula['id']} \\,·\\, {aula['title']}")
    tex = tex.replace("<<TIPOCURTO>>", nome_tipo.upper())
    corpo = CAPA
    corpo = corpo.replace("<<CHIP>>", f"AULA {aula['id']} \\,·\\, FRENTE {aula['front']} \\,·\\, BLOCO {aula['block']}")
    corpo = corpo.replace("<<TITULO>>", aula["title"])
    corpo = corpo.replace("<<SUBTITULO>>", f"{nome_tipo} \\,·\\, {total} questões \\,·\\, gabarito resolvido")
    corpo = corpo.replace("<<INTRO>>", dados.get("intro", ""))

    questoes, n = [], 0
    corpo += r"\begin{multicols}{2}\raggedcolumns" + "\n"
    if fixa:
        for s in dados["secoes"]:
            ini = n + 1
            n += len(s["questoes"])
            corpo += r"\nivel{%s}{questões %d a %d}" % (s["nome"], ini, n) + "\n"
            for q in s["questoes"]:
                questoes.append(q)
                espaco = 16 + 7 * len(q.get("itens", []))  # mm para o aluno resolver
                corpo += r"\questao[%dmm]{%d}{%s}" % (espaco, len(questoes), enunciado_tex(q)) + "\n"
    else:
        for q in dados["questoes"]:
            questoes.append(q)
            corpo += r"\questao{%d}{%s}" % (len(questoes), enunciado_tex(q)) + "\n"
    corpo += r"\end{multicols}" + "\n\\clearpage\n"

    # Gabarito
    corpo += r"\faixagabarito{%s \,·\, Aula %s}" % (nome_tipo, aula["id"]) + "\n"
    if not fixa:
        cel = []
        for i, q in enumerate(questoes):
            x, y = i % 10, i // 10
            cel.append(r"\node[fill=suave,rounded corners=2pt,minimum width=15mm,minimum height=10mm,font=\scriptsize\color{mudo}] at (%.2f,%.2f) {};"
                       r"\node[font=\scriptsize\bfseries,text=mudo] at (%.2f,%.2f) {%d};"
                       r"\node[font=\bfseries,text=roxo] at (%.2f,%.2f) {%s};" % (
                           x * 1.78, -y * 1.2, x * 1.78, -y * 1.2 + 0.24, i + 1, x * 1.78, -y * 1.2 - 0.17, q["correta"]))
        corpo += (r"\noindent\resizebox{\linewidth}{!}{\begin{tikzpicture}" + "".join(cel) + r"\end{tikzpicture}}" +
                  "\n\\vspace{2mm}\n")
    corpo += r"\begin{multicols}{2}\raggedcolumns" + "\n"
    for i, q in enumerate(questoes, 1):
        if fixa:
            corpo += r"\resolucao{%d}{%s}{%s}" % (i, bloco(q["resolucao"]), q["resposta"]) + "\n"
        else:
            corpo += r"\resolucaovest{%d}{Alternativa %s}{%s}" % (i, q["correta"], bloco(q["resolucao"])) + "\n"
    corpo += r"\end{multicols}" + "\n"
    return tex + "\\begin{document}\n" + corpo + "\\end{document}\n"


def gerar(codigo):
    aulas = json.loads((ROOT / "data" / "aulas.json").read_text(encoding="utf-8"))["lessons"]
    aula = next(a for a in aulas if a["id"] == codigo)
    fonte = yaml.safe_load((FONTE / f"{codigo}.yaml").read_text(encoding="utf-8"))
    DEST.mkdir(exist_ok=True)
    saidas = []
    for tipo in ("fixacao", "vestibular"):
        if tipo not in fonte:
            continue
        tex = documento(aula, tipo, fonte[tipo])
        with tempfile.TemporaryDirectory() as tmp:
            arq = Path(tmp) / "lista.tex"
            arq.write_text(tex, encoding="utf-8")
            for _ in range(2):  # 2 passadas: capa (overlay) e número total de páginas
                r = subprocess.run(["xelatex", "-interaction=nonstopmode", "-halt-on-error", arq.name],
                                   cwd=tmp, capture_output=True, text=True)
                if r.returncode:
                    (DEST / f"_erro-{tipo}-{codigo}.tex").write_text(tex, encoding="utf-8")
                    sys.exit(f"Erro no XeLaTeX ({codigo} {tipo}):\n" + r.stdout[-2500:])
            destino = DEST / f"{tipo}-{codigo}.pdf"
            shutil.copy(Path(tmp) / "lista.pdf", destino)
            saidas.append(destino)
    return saidas


if __name__ == "__main__":
    for c in sys.argv[1:] or ["A17"]:
        for s in gerar(c.upper()):
            print("gerado:", s.relative_to(ROOT))
