#!/usr/bin/env python3
"""Gera as listas em PDF (fixação e vestibular) de cada aula do MAT MAT MAT!.

Fonte: materiais-fonte/2.3.2.yaml (uma por aula, código do livro), com a matemática em LaTeX.
Saída: pdfs/fixacao-2.3.2.pdf e pdfs/vestibular-2.3.2.pdf

Uso:  python3 scripts/gerar_listas.py 2.3.2 [4.1.1 ...] [--publicar]
      --publicar registra os PDFs na biblioteca (data/materiais.json).
      python3 scripts/gerar_listas.py --proximo   mostra o próximo lote pendente.
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
\usepackage[a4paper,top=20mm,bottom=18mm,left=15mm,right=15mm,headsep=5mm,footskip=9mm]{geometry}
\usepackage{fontspec}
\usepackage{amsmath,amssymb,mathtools}
\usepackage{unicode-math}
\setmainfont{Inter}
\setmathfont{Latin Modern Math}[Scale=MatchLowercase]
\setmathfont[range={up/num},Scale=MatchLowercase]{Inter}
\AtBeginDocument{\thickmuskip=5mu\medmuskip=4mu\relpenalty=900\binoppenalty=10000\lineskiplimit=3pt\lineskip=5pt}
\newfontfamily\displayfont{Inter Display}[UprightFont=* ExtraBold, BoldFont=* Black]
\usepackage{ragged2e}
\hyphenpenalty=10000\exhyphenpenalty=10000
\usepackage{graphicx}
\usepackage{xcolor}
\definecolor{ink}{HTML}{211946}
\definecolor{roxo}{HTML}{4A27B7}
\definecolor{lilas}{HTML}{C9B6F7}
\definecolor{lima}{HTML}{D3FC61}
\definecolor{laranja}{HTML}{FF7956}
\definecolor{suave}{HTML}{F4F1FC}
\definecolor{mudo}{HTML}{6E6680}
\definecolor{nfacil}{HTML}{DDF99A}
\definecolor{nmedio}{HTML}{FFE08A}
\definecolor{ndificil}{HTML}{FFB49C}
\definecolor{ceu}{HTML}{B7E5FF}
\color{ink}
\usepackage{tikz}
\usetikzlibrary{calc}
\usepackage{pgfplots}
\pgfplotsset{compat=1.18,every axis/.append style={font=\scriptsize,axis lines=middle,axis line style={-latex,ink!70},tick style={ink!50},grid style={roxo!10}}}
\usepackage{colortbl}
\usepackage{array}
\usepackage{adjustbox}
\newcommand{\apoio}[1]{\leavevmode{\color{ink!88}#1}\par\vspace{2pt}}
\newenvironment{figurinha}{\par\vspace{3pt}\centering}{\par\vspace{3pt}}
\usepackage{multicol}
\setlength{\columnsep}{8mm}
\setlength{\columnseprule}{0.4pt}
\renewcommand{\columnseprulecolor}{\color{roxo!14}}
\usepackage{enumitem}
\usepackage{fancyhdr}
\setlength{\headheight}{16pt}
\usepackage{lastpage}
\usepackage{needspace}
\usepackage{calc}
\setlength{\parindent}{0pt}
\AtBeginDocument{\RaggedRight\setlength{\RaggedRightParindent}{0pt}}
\linespread{1.13}
\frenchspacing
\raggedbottom

% ---------- marca: a logo é um único arquivo (assets/logo-mat.png) ----------
\newcommand{\marca}[1]{\includegraphics[height=#1]{<<LOGO>>}}

% ---------- cabeçalho / rodapé ----------
\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0pt}
\fancyhead[L]{\raisebox{-1.6mm}{\marca{6.2mm}}\hspace{2.5mm}{\footnotesize\color{mudo}<<CABECALHO>>}}
\fancyhead[R]{\footnotesize\bfseries\color{roxo}<<TIPOCURTO>>}
\fancyfoot[L]{\footnotesize\color{mudo}Prof. João Capri \,·\, \textcolor{roxo}{<<SITE>>}}
\fancyfoot[R]{\footnotesize\color{mudo}página \textbf{\textcolor{ink}{\thepage}} de \pageref*{LastPage}}
\fancypagestyle{capa}{\fancyhead{}}
\usepackage[hidelinks]{hyperref}

% ---------- peças das questões ----------
\newlength{\badgew}\setlength{\badgew}{9mm}
\newcommand{\qnum}[1]{\tikz[baseline=(n.base)]\node[draw=roxo,line width=.8pt,text=roxo,rounded corners=3pt,inner xsep=0pt,inner ysep=2.4pt,minimum width=6.6mm,font=\small\bfseries](n){#1};}
\newcommand{\corsel}[1]{\ifcase#1\or nfacil\or nmedio\or ndificil\fi}
\newcommand{\selo}[2]{\tikz[baseline=(s.base)]\node[fill=\corsel{#1},text=ink,rounded corners=5pt,inner xsep=4.5pt,inner ysep=1.5pt,font=\fontsize{6.6}{7.5}\selectfont\bfseries](s){#2};}
\newcommand{\nivel}[3]{%
  \par\needspace{8\baselineskip}\penalty-300\vspace{2mm}\noindent
  \begin{tikzpicture}
    \node[fill=\corsel{#3},text=ink,rounded corners=6pt,inner xsep=7pt,inner ysep=3pt,font=\small\bfseries,anchor=west](t) at (0,0){#1};
    \node[font=\footnotesize,text=mudo,anchor=west](r) at ($(t.east)+(5pt,0)$) {#2};
    \draw[roxo!16,line width=.6pt] ($(r.east)+(5pt,0)$) -- (\linewidth-1pt,0);
  \end{tikzpicture}\par\nopagebreak\vspace{3.5mm}}
% espaço para resolver: moldura clara com pontos a cada 5 mm (some na xerox, ajuda a alinhar a conta)
\newcommand{\caixa}[1]{\par\vspace{2mm}\noindent\begin{tikzpicture}
  \draw[roxo!30,line width=.4pt,dash pattern=on 0pt off 5mm,line cap=round,line width=.9pt] (2.5mm,-2.5mm) grid[step=5mm] ($(\linewidth-2.5mm,-#1+2.5mm)$);
  \draw[roxo!22,line width=.5pt,rounded corners=3pt] (0,0) rectangle (\linewidth,-#1);
  \end{tikzpicture}\par}
\newcommand{\lacuna}[1]{\leavevmode\raisebox{-.5ex}{\textcolor{roxo!55}{\rule{#1}{.6pt}}}}
\newcommand{\lacunam}[1]{\mathord{\raisebox{-.25ex}{\textcolor{roxo!55}{\rule{#1}{.6pt}}}}}
\newcommand{\vfbox}{\tikz[baseline=-.6ex]\node[draw=roxo!70,line width=.6pt,rounded corners=2pt,minimum width=6.5mm,minimum height=4.4mm,inner sep=0]{};}
\newcommand{\vf}[1]{\par\vspace{2.6pt}\noindent\hangindent=10mm\hangafter=1\makebox[10mm][l]{\vfbox}#1}
\newcommand{\rotulo}[1]{{\color{roxo}\bfseries(#1)}\hspace{1.5mm}}
\newcommand{\codigo}[1]{\tikz[baseline=(c.base)]\node[draw=roxo,line width=.6pt,text=roxo,rounded corners=2pt,inner xsep=2.5pt,inner ysep=1.6pt,font=\scriptsize\bfseries](c){#1};}
\newcommand{\prop}[2]{\def\pendurado{#2}\pendura{8.5mm}{\codigo{#1}}}
\newcommand{\somacampo}{\par\vspace{4pt}\hfill{\footnotesize\bfseries\color{roxo}Soma:}\hspace{2mm}\tikz[baseline=-.7ex]\node[draw=roxo,line width=.7pt,rounded corners=3pt,minimum width=14mm,minimum height=6mm]{};\par}
\newcommand{\letra}[1]{\tikz[baseline=(l.base)]\node[circle,draw=roxo,line width=.7pt,inner sep=0pt,minimum size=4.6mm,font=\scriptsize\bfseries,text=roxo](l){#1};}
\newlist{itens}{enumerate}{1}
\setlist[itens]{label={\color{roxo}\bfseries(\alph*)},leftmargin=7mm,labelsep=2mm,topsep=3pt,itemsep=3.5pt,parsep=0pt}
\newcommand{\questao}[2]{% número, corpo (inquebrável: questão e espaço ficam juntos)
  \par\noindent\begin{minipage}[t]{\linewidth}\makebox[\badgew][l]{\qnum{#1}}%
  \parbox[t]{\linewidth-\badgew}{\RaggedRight\setlength{\parskip}{3pt}#2}\end{minipage}\par\vspace{5.5mm}}
\newcommand{\questaosel}[4]{% número, nível (1-3), nome do nível, texto
  \par\noindent\makebox[\badgew][l]{\qnum{#1}}%
  \parbox[t]{\linewidth-\badgew}{\RaggedRight\setlength{\parskip}{3pt}\selo{#2}{#3}\par\vspace{1.2mm}#4}\par\vspace{6mm}}

% alternativas: o LaTeX mede a maior e escolhe 5, 3, 2 ou 1 coluna
\newlength{\altw}\newlength{\altmax}\newlength{\altcel}
\newcommand{\medir}[1]{\settowidth{\altw}{#1}\ifdim\altw>\altmax\global\altmax=\altw\fi}
\newcommand{\cel}[2]{\makebox[\altcel][l]{\letra{#1}\hspace{1.8mm}#2}\hspace{0pt}}
\newcommand{\umacol}[2]{\par\noindent\hangindent=7mm\hangafter=1\makebox[7mm][l]{\letra{#1}}#2}
\newcommand{\alternativas}[5]{%
  \global\altmax=0pt\medir{#1}\medir{#2}\medir{#3}\medir{#4}\medir{#5}%
  \addtolength{\altmax}{8mm}%
  \par\vspace{4pt}\setlength{\parskip}{3.5pt}\lineskiplimit=4pt\lineskip=7pt%
  \ifdim\dimexpr5\altmax\relax<\linewidth \setlength{\altcel}{\dimexpr\linewidth/5-0.2pt\relax}%
  \else\ifdim\dimexpr3\altmax\relax<\linewidth \setlength{\altcel}{\dimexpr\linewidth/3-0.2pt\relax}%
  \else\ifdim\dimexpr2\altmax\relax<\linewidth \setlength{\altcel}{\dimexpr\linewidth/2-0.2pt\relax}%
  \else\setlength{\altcel}{0pt}\fi\fi\fi
  \ifdim\altcel>0pt \noindent\cel{A}{#1}\cel{B}{#2}\cel{C}{#3}\cel{D}{#4}\cel{E}{#5}\par
  \else\umacol{A}{#1}\umacol{B}{#2}\umacol{C}{#3}\umacol{D}{#4}\umacol{E}{#5}\par\fi}

% ---------- formatos de banca (padrão 4) ----------
% questão que pode continuar na outra coluna, como nas provas (o número fica pendurado à esquerda)
\newenvironment{questaob}[1]{\par\addpenalty{-200}\begin{list}{}{\setlength{\leftmargin}{\badgew}\setlength{\labelwidth}{\badgew}%
  \setlength{\labelsep}{0pt}\setlength{\itemindent}{0pt}\setlength{\topsep}{0pt}\setlength{\partopsep}{0pt}\setlength{\parsep}{3pt}\setlength{\listparindent}{0pt}}%
  \relpenalty=10000\interlinepenalty=10000\clubpenalty=10000\widowpenalty=10000\RaggedRight\setlength{\parskip}{3pt}\item[{\makebox[\badgew][l]{\qnum{#1}}}]}%
  {\end{list}\par\vspace{5.5mm}}
\newcommand{\pendura}[2]{\par\vspace{2.6pt}\noindent\makebox[#1][l]{#2}\parbox[t]{\linewidth-#1}{\RaggedRight\relpenalty=10000 \pendurado}\par}
\newcommand{\afirmativa}[2]{\def\pendurado{#2}\pendura{7mm}{\bfseries #1.}}
\newcommand{\parenteses}[1]{\def\pendurado{#1}\pendura{8mm}{(\hspace{3.6mm})}}
\newcommand{\altv}[2]{\def\pendurado{#2}\pendura{7.5mm}{\letra{#1}}\vspace{1.5pt}}
\newcommand{\textocomum}[2]{\par\vspace{1mm}\noindent\begin{minipage}{\linewidth}\begin{tikzpicture}\node[fill=suave,rounded corners=3pt,inner xsep=6pt,inner ysep=3pt,font=\footnotesize\bfseries,text=roxo]{#1};\end{tikzpicture}\par\vspace{1.5mm}{#2}\end{minipage}\par\vspace{4mm}}

% ---------- caderno digital: uma questão por página, o resto da folha é rascunho ----------
\newcommand{\questaocad}[4]{% número, total, nível, corpo
  \par\noindent{\fontsize{13}{15}\selectfont\tikz[baseline=(n.base)]\node[draw=roxo,line width=1pt,text=roxo,rounded corners=4pt,inner xsep=6pt,inner ysep=3pt,font=\bfseries](n){Questão #1};}%
  \hspace{2mm}{\small\color{mudo}de #2}\ifx&#3&\else\hspace{3mm}{\small\bfseries\color{roxo}#3}\fi\par\vspace{4mm}%
  {\fontsize{12}{16.2}\selectfont\RaggedRight\setlength{\parskip}{4pt}#4\par}%
  \vspace{4mm}\pdfsavepos\write-1{CADERNOY \thepage\space\the\pdflastypos}\par}
\newcommand{\marcaq}[1]{\write-1{CADERNOQ #1 \thepage}}

% ---------- gabarito ----------
\newcommand{\resolucao}[3]{%
  \par\noindent\makebox[\badgew][l]{\qnum{#1}}%
  \parbox[t]{\linewidth-\badgew}{\small\RaggedRight\setlength{\parskip}{2.5pt}#2%
   \par\vspace{2pt}\tikz[baseline=(r.base)]\node[fill=suave,text=ink,rounded corners=3pt,inner xsep=5pt,inner ysep=3pt,font=\small,text width=\linewidth-10pt](r){{\color{roxo}\scriptsize\bfseries Resposta}\quad\textbf{#3}};}\par\vspace{4.5mm}}
\newcommand{\resolucaovest}[3]{%
  \par\noindent\makebox[\badgew][l]{\qnum{#1}}%
  \parbox[t]{\linewidth-\badgew}{\small\RaggedRight\setlength{\parskip}{2.5pt}%
   \tikz[baseline=(r.base)]\node[fill=lima,text=ink,rounded corners=3pt,inner xsep=6pt,inner ysep=2.5pt,font=\small\bfseries](r){#2};\par #3}\par\vspace{4.5mm}}
\newcommand{\faixagabarito}[1]{%
  \noindent{\displayfont\fontsize{20}{23}\selectfont Gabarito resolvido}\par\vspace{1.5mm}
  \noindent\begin{tikzpicture}\fill[ink] (0,0) rectangle (\linewidth,.9pt);\fill[lima] (0,-.9pt) rectangle (34mm,-3.6pt);\end{tikzpicture}\par\vspace{5mm}}
"""

CAPA = r"""
\thispagestyle{capa}
\noindent\begin{minipage}[t]{40mm}\vspace{0pt}\marca{24mm}\end{minipage}%
\hfill\begin{minipage}[t]{\linewidth-48mm}\vspace{0pt}\raggedleft
  {\small\bfseries\color{roxo}<<KICKER>>}\par\vspace{2mm}
  {\displayfont\fontsize{22}{25}\selectfont <<TITULO>>\par}\vspace{3mm}
  \tikz[baseline=(t.base)]\node[fill=<<TIPOCOR>>,text=ink,rounded corners=5pt,inner xsep=7pt,inner ysep=3pt,font=\small\bfseries](t){<<TIPO>>};
\end{minipage}
\par\vspace{5mm}
\noindent\begin{tikzpicture}\fill[ink] (0,0) rectangle (\linewidth,.9pt);\fill[lima] (0,-.9pt) rectangle (34mm,-3.6pt);\end{tikzpicture}
\par\vspace{3mm}
<<LIVRO>>
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


PADRAO_ATUAL = 4  # 4: vestibular e aprofundamento no formato das provas reais (1.21.3 é o modelo)
NIVEIS = {"facil": (1, "Nível 1"), "medio": (2, "Nível 2"), "dificil": (3, "Nível 3")}  # nomes exibidos; as chaves seguem as antigas
LEGADO = {"aquecimento": "facil", "treino": "medio", "desafio": "dificil", "nivel 1": "facil", "nivel 2": "medio", "nivel 3": "dificil"}


def chave_nivel(nome):
    import unicodedata
    k = unicodedata.normalize("NFKD", str(nome)).encode("ascii", "ignore").decode().lower().strip()
    return LEGADO.get(k, k)


def nivel_vest(q, i):
    """Nível da questão de vestibular: o campo `nivel` ou, sem ele, pela posição (1–7, 8–14, 15–20)."""
    if q.get("nivel"):
        return chave_nivel(q["nivel"])
    return "facil" if i <= 7 else "medio" if i <= 14 else "dificil"


def tabela_tex(t):
    """Tabela de apoio: {cabecalho: [...], linhas: [[...], ...], legenda?}."""
    n = len(t["cabecalho"]) if t.get("cabecalho") else len(t["linhas"][0])
    cols = "|".join(["c"] * n)
    cab = " & ".join(r"\textbf{%s}" % c for c in t["cabecalho"]) if t.get("cabecalho") else ""
    linhas = r" \\ ".join(" & ".join(lacunas(c) for c in l) for l in t["linhas"])
    leg = r"\par\vspace{1pt}{\scriptsize\color{mudo}%s}" % t["legenda"] if t.get("legenda") else ""
    alto = "1.7" if any("{{" in str(c) for l in t["linhas"] for c in l) else "1.25"
    return (r"\begin{figurinha}\small\renewcommand{\arraystretch}{" + alto + r"}\arrayrulecolor{roxo!25}"
            r"\begin{adjustbox}{max width=\linewidth}\begin{tabular}{%s}%s%s\end{tabular}\end{adjustbox}%s\end{figurinha}" % (
                cols, (r"\rowcolor{suave}%s \\ \hline " % cab) if cab else r"\hline ", linhas + ("" if cab else r" \\ \hline"), leg))


def figura_tex(f):
    """Figura de apoio em TikZ/pgfplots: {tikz: '...', legenda?} ou o código direto."""
    cod = f["tikz"] if isinstance(f, dict) else f
    leg = r"\par\vspace{1pt}{\scriptsize\color{mudo}%s}" % f["legenda"] if isinstance(f, dict) and f.get("legenda") else ""
    return r"\begin{figurinha}\begin{adjustbox}{max width=\linewidth}\begin{tikzpicture}%s\end{tikzpicture}\end{adjustbox}%s\end{figurinha}" % (cod, leg)


def lacunas(s):
    """{{resposta}} vira um traço para o aluno completar, do tamanho da resposta (dentro ou fora de $...$)."""
    s = str(s)
    out, i = [], 0
    while True:
        k = s.find("{{", i)
        if k < 0:
            out.append(s[i:])
            break
        fim, prof, j = None, 0, k + 2
        while j < len(s):  # chaves balanceadas: {{\tfrac{1}{2}}}
            if s.startswith("}}", j) and prof == 0:
                fim = j
                break
            prof += {"{": 1, "}": -1}.get(s[j], 0)
            j += 1
        if fim is None:
            out.append(s[i:])
            break
        resp = s[k + 2:fim]
        largura = max(9, min(50, 2.2 * letras_visiveis(resp) + 5))
        em_math = (len(re.findall(r"(?<!\\)\$", s[:k])) % 2) == 1
        out.append(s[i:k] + (r"\lacunam{%dmm}" % largura if em_math else r"\lacuna{%dmm}" % largura))
        i = fim + 2
    return "".join(out)


def sem_lacunas(s):
    """Texto da questão para o gabarito/site: {{x}} vira a própria resposta."""
    return re.sub(r"\{\{(.*?)\}\}(?!\})", r"\1", str(s))


def tem_lacuna(q):
    celulas = [c for l in (q.get("tabela") or {}).get("linhas", []) for c in l]
    return any("{{" in str(v) for v in [q.get("enunciado", "")] + list(q.get("itens", [])) + list(q.get("afirmacoes", [])) + celulas)


def formato(q):
    """aberta (padrão), vf, associar, completar, somatoria ou objetiva."""
    if q.get("formato"):
        return q["formato"]
    if q.get("proposicoes"):
        return "somatoria"
    if q.get("opcoes"):
        return "objetiva"
    if q.get("afirmacoes"):
        return "vf"
    if q.get("esquerda"):
        return "associar"
    if tem_lacuna(q):
        return "completar"
    return "aberta"


def espaco_mm(q):
    """Altura do espaço para resolver (mm). O campo `espaco` manda; senão, depende do formato."""
    if "espaco" in q:
        return int(q["espaco"])
    f = formato(q)
    if f in ("vf",):
        return 22 if q.get("justificar") else 0
    if f in ("associar", "completar"):
        return 0
    if q.get("itens") and q.get("colunas"):
        return 0  # cada item ganha a própria caixa
    return 26 + 8 * len(q.get("itens", []))


SOMA = [1, 2, 4, 8, 16, 32, 64]


def romano(k):
    return ["I", "II", "III", "IV", "V", "VI"][k - 1]


def soma_correta(q):
    return sum(SOMA[i - 1] for i in q["corretas"])


def apoio_tex(q):
    """Texto, tabela e figura de apoio (também usado no texto comum a duas questões)."""
    tex = r"\apoio{%s}" % lacunas(bloco(q["texto"])) if q.get("texto") else ""
    if q.get("tabela"):
        tex += tabela_tex(q["tabela"])
    if q.get("figura"):
        tex += figura_tex(q["figura"])
    return tex


def alternativas_tex(ops, vertical):
    if not vertical:
        return r"\alternativas" + "".join("{%s}" % o for o in ops)
    # as alternativas nunca se separam (nem do fim do enunciado)
    return (r"\par\nopagebreak\vspace{2.5pt}\noindent\begin{minipage}{\linewidth}\lineskiplimit=3pt\lineskip=5pt" +
            "".join(r"\altv{%s}{%s}" % ("ABCDE"[k], o) for k, o in enumerate(ops)) + r"\end{minipage}\par")


def enunciado_tex(q, fixa=False, aprof=False, banca=False, caderno=False):
    tex = ""  # o campo `estilo` não é impresso: serve só para o validador conferir a variedade de bancas
    if q.get("texto"):
        tex += r"\apoio{%s}" % lacunas(bloco(q["texto"]))
    completar_tab = q.get("tabela") and any("{{" in str(c) for l in q["tabela"]["linhas"] for c in l)
    if q.get("tabela") and not completar_tab:
        tex += tabela_tex(q["tabela"])
    fig_depois = fixa and not q.get("texto")  # na fixação, sem texto de apoio, a pergunta vem antes da figura
    if q.get("figura") and not fig_depois:
        tex += figura_tex(q["figura"])
    tex += lacunas(bloco(q["enunciado"]))
    if q.get("figura") and fig_depois:
        tex += figura_tex(q["figura"])
    if completar_tab:
        tex += tabela_tex(q["tabela"])
    f = formato(q)
    if f == "vf":
        tex += r"\par\vspace{1mm}" + "".join(r"\vf{%s}" % lacunas(a) for a in q["afirmacoes"])
    if f == "objetiva" and q.get("afirmativas"):  # I, II, III... e alternativas do tipo "Apenas I e II"
        tex += r"\par\vspace{1mm}" + "".join(r"\afirmativa{%s}{%s}" % (romano(k), a) for k, a in enumerate(q["afirmativas"], 1))
    if f == "objetiva" and q.get("afirmacoes"):  # ( ) V ou F e alternativas com a sequência
        tex += r"\par\vspace{1mm}" + "".join(r"\parenteses{%s}" % a for a in q["afirmacoes"])
    if q.get("comando"):
        tex += r"\par\vspace{3pt}" + bloco(q["comando"])
    if f == "associar":
        esq = "".join(r"\par\vspace{2.5pt}\noindent\hangindent=7mm\hangafter=1\makebox[7mm][l]{\rotulo{%d}}%s" % (k, x)
                      for k, x in enumerate(q["esquerda"], 1))
        dir_ = "".join(r"\vf{%s}" % x for x in q["direita"])
        tex += r"\par\vspace{1mm}%s\par\vspace{2.5mm}{\footnotesize\color{mudo}Escreva o número no quadrinho:}%s" % (esq, dir_)
    if q.get("itens"):
        n = min(2, int(q.get("colunas") or 0))
        if n >= 2:
            alt = 0 if caderno else int(q.get("espaco_item", 20))
            cel = r"\dimexpr(\linewidth-%dmm)/%d\relax" % (5 * (n - 1), n)
            linhas_ = []
            for k0 in range(0, len(q["itens"]), n):
                grupo = q["itens"][k0:k0 + n]
                cels = [r"\begin{minipage}[t]{%s}\relpenalty=10000\binoppenalty=10000\rotulo{%s}%s%s\end{minipage}" % (
                    cel, "abcdefghij"[k0 + k], lacunas(it), r"\caixa{%dmm}" % alt if alt else "")
                    for k, it in enumerate(grupo)]
                linhas_.append(r"\par\vspace{2mm}\noindent" + r"\hfill".join(cels) + (r"\hfill" if len(cels) < n else ""))
            tex += "".join(linhas_)
        else:
            tex += r"\begin{itens}" + "".join(r"\item " + lacunas(i) for i in q["itens"]) + r"\end{itens}"
    if f == "objetiva":
        tex += alternativas_tex(q["opcoes"], vertical=banca or len(q["opcoes"]) != 5)
    if f == "somatoria":
        tex += r"\par\vspace{1mm}" + "".join(r"\prop{%02d}{%s}" % (SOMA[k], p) for k, p in enumerate(q["proposicoes"]))
        tex += r"\somacampo"
    if fixa and not caderno:
        e = espaco_mm(q) + (8 if aprof and "espaco" not in q and espaco_mm(q) else 0)
        if e:
            tex += r"\caixa{%dmm}" % e
    return tex


def assunto_da_aula(aula):
    dados = json.loads((ROOT / "data" / "aulas.json").read_text(encoding="utf-8"))
    for s in dados.get("assuntos", []):
        if aula["id"] in s.get("aulas", []) or (not s.get("aulas") and aula["block"] in s["modulos"]):
            ls = [l for l in dados["lessons"] if (l["id"] in s["aulas"] if s.get("aulas") else l["block"] in s["modulos"])]
            return s["nome"], [l["id"] for l in ls].index(aula["id"]) + 1, len(ls)
    return None, None, None


SITE = "matcomjoao.com"


def faixa_livro(vol, mod, aula_id):
    """Faixa centralizada da capa: onde o assunto está no material impresso e o convite para adquirir.
    Módulos extras (com "x") não estão no livro: a faixa vira "Conteúdo exclusivo do site", em outra cor."""
    extra = "x" in mod
    fundo, botao = ("ceu!35", "ink") if extra else ("lima!20", "roxo")
    if extra:
        icone = (r"\begin{scope}[shift={([xshift=11mm]f.west)},scale=.42]"  # estrela de quatro pontas: bônus
                 r"\fill[roxo] (0,1.25) .. controls (.18,.18) .. (1.25,0) .. controls (.18,-.18) .. (0,-1.25) .. controls (-.18,-.18) .. (-1.25,0) .. controls (-.18,.18) .. cycle;"
                 r"\fill[roxo] (1.15,.95) .. controls (1.2,.75) .. (1.4,.7) .. controls (1.2,.65) .. (1.15,.45) .. controls (1.1,.65) .. (.9,.7) .. controls (1.1,.75) .. cycle;"
                 r"\end{scope}")
        linha1 = r"Conteúdo \textcolor{roxo}{exclusivo do site}"
        linha2 = r"Aula extra, além dos 4 volumes do material impresso"
        botao_txt = r"Conheça o material\\[-.3mm]impresso em %s" % SITE
        link = "https://%s/livros/" % SITE
    else:
        icone = (r"\begin{scope}[shift={([xshift=11mm]f.west)},scale=.4,line join=round]"  # livro aberto
                 r"\fill[roxo] (0,-.75) .. controls (-.7,-.45) and (-1.3,-.5) .. (-1.75,-.62) -- (-1.75,.82) .. controls (-1.3,.95) and (-.7,.9) .. (0,.6) -- cycle;"
                 r"\fill[roxo] (0,-.75) .. controls (.7,-.45) and (1.3,-.5) .. (1.75,-.62) -- (1.75,.82) .. controls (1.3,.95) and (.7,.9) .. (0,.6) -- cycle;"
                 r"\draw[white,line width=.7pt] (0,-.62) -- (0,.55);"
                 r"\draw[white,line width=.45pt] (-1.35,.35) .. controls (-.9,.45) .. (-.35,.25) (-1.35,0) .. controls (-.9,.1) .. (-.35,-.1) (.35,.25) .. controls (.9,.45) .. (1.35,.35) (.35,-.1) .. controls (.9,.1) .. (1.35,0);"
                 r"\end{scope}")
        linha1 = r"Este assunto está no \textcolor{roxo}{Volume %s} do material impresso" % vol
        linha2 = r"Módulo %s \,·\, aula %s" % (mod, aula_id)
        botao_txt = r"Adquira já em\\[-.3mm]%s" % SITE
        link = "https://%s/livros/?volume=%s" % (SITE, vol)
    return (r"\begin{center}\href{" + link + r"}{\begin{tikzpicture}"
            r"\node[draw=ink,line width=.6pt,fill=" + fundo + r",rounded corners=7pt,minimum width=.9\linewidth,minimum height=14.5mm](f){};"
            + icone +
            r"\node[anchor=west,align=left,inner sep=0pt] at ([xshift=20.5mm]f.west)"
            r"{{\small\bfseries " + linha1 + r"}\\[1.2mm]{\scriptsize\color{mudo}" + linha2 + r"}};"
            r"\node[anchor=east,fill=" + botao + r",text=white,rounded corners=9pt,inner xsep=9pt,inner ysep=5pt,font=\scriptsize\bfseries,align=center]"
            r" at ([xshift=-4.5mm]f.east) {" + botao_txt + r"};"
            r"\end{tikzpicture}}\end{center}")


NOMES = {"fixacao": "Lista de fixação", "vestibular": "Lista de vestibular", "aprofundamento": "Lista de aprofundamento"}
CORES = {"fixacao": "lima", "vestibular": "ceu", "aprofundamento": "ndificil"}


def documento(aula, tipo, dados, n_listas=2, padrao=3, caderno=False):
    banca = padrao >= 4  # padrão 4: formato de prova real (rótulo de estilo, níveis em faixas, alternativas na vertical)
    fixa = tipo in ("fixacao", "aprofundamento")
    nome_tipo = NOMES[tipo]
    qs_all = [q for s in dados["secoes"] for q in s["questoes"]] if tipo == "fixacao" else dados["questoes"]
    total = len(qs_all)
    titulo = re.sub(r"\s+-\s+", " — ", aula["title"])
    assunto, k, n_aulas = assunto_da_aula(aula)
    tex = PREAMBULO.replace("<<SITE>>", SITE).replace("<<LOGO>>", str(ROOT / "assets" / "logo-mat-pdf.png"))  # versão leve da logo do site
    tex = tex.replace("<<CABECALHO>>", (assunto + r" \,·\, " if assunto else "") + titulo)
    tex = tex.replace("<<TIPOCURTO>>", nome_tipo)
    corpo = CAPA
    vol, mod = aula["block"].split(".")
    corpo = corpo.replace("<<KICKER>>", f"{assunto} \\,·\\, aula {k} de {n_aulas}" if assunto else "")
    corpo = corpo.replace("<<TITULO>>", titulo)
    corpo = corpo.replace("<<TIPO>>", nome_tipo).replace("<<TIPOCOR>>", CORES[tipo])
    corpo = corpo.replace("<<LIVRO>>", faixa_livro(vol, mod, aula["id"]))

    questoes, n = [], 0
    if caderno:
        corpo = ""  # sem capa: o caderno começa na questão 1
        tex = tex.replace("<<TIPOCURTO>>", nome_tipo)
        itens = []  # (questão, nível, texto comum antes)
        if tipo == "fixacao":
            for s_ in dados["secoes"]:
                for q in s_["questoes"]:
                    itens.append((q, NIVEIS[chave_nivel(s_["nome"])][1], ""))
        else:
            qs = dados["questoes"]
            comum = {}
            for i, q in enumerate(qs, 1):
                if q.get("texto_comum"):
                    tc = q["texto_comum"]; ult = i + int(tc.get("questoes", 2)) - 1
                    rot = "Texto para as questões %d e %d" % (i, ult) if ult == i + 1 else "Texto para as questões %d a %d" % (i, ult)
                    for j in range(i, ult + 1):
                        comum[j] = r"	extocomum{%s}{%s}" % (rot, apoio_tex(tc))
                nivel = "" if tipo == "aprofundamento" else NIVEIS[nivel_vest(q, i)][1]
                itens.append((q, nivel, comum.get(i, "")))
        total_ = len(itens)
        for i, (q, nivel, antes) in enumerate(itens, 1):
            questoes.append(q)
            corpo_q = antes + enunciado_tex(q, fixa=tipo != "vestibular", aprof=tipo == "aprofundamento", banca=banca, caderno=True)
            corpo += (r"\clearpage" if i > 1 else "") + r"\marcaq{%d}\questaocad{%d}{%d}{%s}{%s}" % (i, i, total_, nivel, corpo_q) + "\n"
        corpo += r"\clearpage\write-1{CADERNOG \thepage}" + "\n"
        fixa = tipo in ("fixacao", "aprofundamento")
    elif tipo == "aprofundamento":
        corpo += r"\begin{multicols}{2}\raggedcolumns" + "\n"
        for q in dados["questoes"]:
            questoes.append(q)
            corpo += r"\questao{%d}{%s}" % (len(questoes), enunciado_tex(q, fixa=True, aprof=True, banca=banca)) + "\n"
        corpo += r"\end{multicols}" + "\n"
    elif banca and tipo == "vestibular":
        corpo += r"\begin{multicols}{2}\raggedcolumns" + "\n"
        qs = dados["questoes"]
        for i, q in enumerate(qs, 1):
            chave = nivel_vest(q, i)
            if i == 1 or chave != nivel_vest(qs[i - 2], i - 1):
                fim = i
                while fim < len(qs) and nivel_vest(qs[fim], fim + 1) == chave:
                    fim += 1
                num, nome = NIVEIS[chave]
                corpo += r"\nivel{%s}{questões %d a %d}{%d}" % (nome, i, fim, num) + "\n"
            if q.get("texto_comum"):
                tc = q["texto_comum"]
                ult = i + int(tc.get("questoes", 2)) - 1
                rot = "Texto para as questões %d e %d" % (i, ult) if ult == i + 1 else "Texto para as questões %d a %d" % (i, ult)
                corpo += r"\textocomum{%s}{%s}" % (rot, apoio_tex(tc)) + "\n"
            questoes.append(q)
            corpo += r"\begin{questaob}{%d}%s\end{questaob}" % (i, enunciado_tex(q, banca=True)) + "\n"
        corpo += r"\end{multicols}" + "\n"
    elif fixa:
        corpo += r"\begin{multicols}{2}\raggedcolumns" + "\n"
        for s in dados["secoes"]:
            ini = n + 1
            n += len(s["questoes"])
            num, nome = NIVEIS[chave_nivel(s["nome"])]
            corpo += r"\nivel{%s}{questões %d a %d}{%d}" % (nome, ini, n, num) + "\n"
            for q in s["questoes"]:
                questoes.append(q)
                corpo += r"\questao{%d}{%s}" % (len(questoes), enunciado_tex(q, fixa=True)) + "\n"
        corpo += r"\end{multicols}" + "\n"
    else:
        corpo += r"\begin{multicols}{2}\raggedcolumns" + "\n"
        for q in dados["questoes"]:
            questoes.append(q)
            num, nome = NIVEIS[nivel_vest(q, len(questoes))]
            if formato(q) == "somatoria":
                nome += r" \,·\, somatória"
            corpo += r"\questaosel{%d}{%d}{%s}{%s}" % (len(questoes), num, nome, enunciado_tex(q)) + "\n"
        corpo += r"\end{multicols}" + "\n"
    if not caderno:
        corpo += "\\clearpage\n"

    # Gabarito
    corpo += r"\faixagabarito{%s}" % nome_tipo + "\n"
    if not fixa:
        cel = []
        for i, q in enumerate(questoes):
            x, y = i % 10, i // 10
            resp = str(soma_correta(q)) if formato(q) == "somatoria" else q["correta"]
            cel.append(r"\node[draw=roxo!25,rounded corners=2pt,minimum width=15mm,minimum height=10mm] at (%.2f,%.2f) {};"
                       r"\node[font=\scriptsize\bfseries,text=mudo] at (%.2f,%.2f) {%d};"
                       r"\node[font=\bfseries,text=roxo] at (%.2f,%.2f) {%s};" % (
                           x * 1.78, -y * 1.2, x * 1.78, -y * 1.2 + 0.24, i + 1, x * 1.78, -y * 1.2 - 0.17, resp))
        corpo += (r"\noindent\resizebox{\linewidth}{!}{\begin{tikzpicture}" + "".join(cel) + r"\end{tikzpicture}}" +
                  "\n\\vspace{5mm}\n")
    corpo += r"\begin{multicols}{2}\raggedcolumns" + "\n"
    for i, q in enumerate(questoes, 1):
        if fixa:
            corpo += r"\resolucao{%d}{%s}{%s}" % (i, bloco(q["resolucao"]), q["resposta"]) + "\n"
        elif formato(q) == "somatoria":
            partes = " + ".join("%02d" % SOMA[c - 1] for c in sorted(q["corretas"]))
            corpo += r"\resolucaovest{%d}{Soma %d \,(%s)}{%s}" % (i, soma_correta(q), partes, bloco(q["resolucao"])) + "\n"
        else:
            corpo += r"\resolucaovest{%d}{Alternativa %s}{%s}" % (i, q["correta"], bloco(q["resolucao"])) + "\n"
    corpo += r"\end{multicols}" + "\n"
    return tex + "\\begin{document}\n" + corpo + "\\end{document}\n"


def validar(codigo, fonte):
    """Checagens estruturais antes de diagramar."""
    erros = []
    padrao = fonte.get("padrao", 1)
    if padrao >= 4:
        return validar_banca(codigo, fonte)
    erros += validar_fixacao(fonte) if padrao >= 3 else []
    fix = fonte.get("fixacao", {})
    qf = [q for sec in fix.get("secoes", []) for q in sec["questoes"]]
    if padrao < 3:
        erros += validar_fixacao(fonte, variedade=False)
    qv = fonte.get("vestibular", {}).get("questoes", [])
    if len(qv) != 20:
        erros.append(f"vestibular tem {len(qv)} questões (esperado 20)")
    cont = {}
    for i, q in enumerate(qv, 1):
        if not q.get("resolucao"):
            erros.append(f"vestibular {i}: falta resolucao")
        if q.get("nivel") and chave_nivel(q["nivel"]) not in NIVEIS:
            erros.append(f"vestibular {i}: nível desconhecido '{q['nivel']}'")
        if formato(q) == "somatoria":
            ps, cs = q.get("proposicoes", []), q.get("corretas", [])
            if not 4 <= len(ps) <= 7:
                erros.append(f"vestibular {i}: somatória precisa de 4 a 7 proposições")
            if not cs or len(cs) == len(ps) or any(not 1 <= c <= len(ps) for c in cs) or len(set(cs)) != len(cs):
                erros.append(f"vestibular {i}: corretas da somatória inválidas (lista de posições, nem vazia nem todas)")
            continue
        ops = q.get("opcoes", [])
        if len(ops) != 5 or len(set(map(str, ops))) != 5:
            erros.append(f"vestibular {i}: precisa de 5 alternativas distintas")
        if q.get("correta") not in list("ABCDE"):
            erros.append(f"vestibular {i}: correta inválida")
        cont[q.get("correta")] = cont.get(q.get("correta"), 0) + 1
    objetivas = sum(cont.values())
    if padrao >= 3:
        if "{{{" in json.dumps(fonte, ensure_ascii=False):
            erros.append("lacuna colada em chave: escreva \\dfrac{ {{x}} }{ {{y}} }, com espaço")
        qa = fonte.get("aprofundamento", {}).get("questoes", [])
        if not 8 <= len(qa) <= 12:
            erros.append(f"aprofundamento tem {len(qa)} questões (esperado de 8 a 12, o padrão é 10)")
        for i, q in enumerate(qa, 1):
            for campo in ("enunciado", "resolucao", "resposta"):
                if not q.get(campo):
                    erros.append(f"aprofundamento {i}: falta {campo}")
        som = sum(1 for q in qv if formato(q) == "somatoria")
        if not 3 <= som <= 6:
            erros.append(f"vestibular tem {som} somatórias (esperado de 3 a 6)")
        ctx = [q for q in qv if q.get("tabela") or q.get("figura") or len(str(q.get("texto", ""))) >= 120]
        curtas = [q for q in qv if not (q.get("texto") or q.get("tabela") or q.get("figura")) and len(str(q["enunciado"])) <= 200]
        if len(ctx) < 8:
            erros.append(f"vestibular tem {len(ctx)} questões contextualizadas (mínimo 8: texto de apoio, tabela ou figura)")
        if sum(1 for q in qv if q.get("tabela") or q.get("figura")) < 3:
            erros.append("vestibular precisa de pelo menos 3 questões com tabela ou figura")
        if len(curtas) < 4:
            erros.append(f"vestibular tem {len(curtas)} questões curtas e diretas (mínimo 4)")
        if objetivas and any(not 2 <= cont.get(l, 0) <= 5 for l in "ABCDE"):
            erros.append(f"gabarito desequilibrado: {cont} (cada letra de 2 a 5 vezes)")
    elif padrao == 2:
        contexto = [q for q in qv if q.get("tabela") or q.get("figura") or len(str(q.get("texto", ""))) >= 120]
        if len(contexto) < 10:
            erros.append(f"vestibular tem {len(contexto)} questões com contexto (mínimo 10)")
        if sum(1 for q in qv if q.get("tabela") or q.get("figura")) < 3:
            erros.append("vestibular precisa de pelo menos 3 questões com tabela ou figura")
    if padrao < 3 and qv and any(not 3 <= cont.get(l, 0) <= 5 for l in "ABCDE"):
        erros.append(f"gabarito desequilibrado: {cont} (cada letra deve aparecer de 3 a 5 vezes)")
    if erros:
        sys.exit(f"{codigo}: fonte inválida\n  - " + "\n  - ".join(erros))


def validar_fixacao(fonte, variedade=True):
    erros = []
    fix = fonte.get("fixacao", {})
    qf = [q for sec in fix.get("secoes", []) for q in sec["questoes"]]
    if len(qf) != 20:
        erros.append(f"fixação tem {len(qf)} questões (esperado 20)")
    for i, q in enumerate(qf, 1):
        for campo in ("enunciado", "resolucao", "resposta"):
            if not q.get(campo):
                erros.append(f"fixação {i}: falta {campo}")
        f = formato(q)
        if f == "vf" and len(q.get("afirmacoes", [])) < 3:
            erros.append(f"fixação {i}: V ou F precisa de pelo menos 3 afirmações")
        if f == "associar" and (len(q.get("esquerda", [])) < 3 or len(q.get("direita", [])) < 3):
            erros.append(f"fixação {i}: associar precisa de pelo menos 3 itens em cada coluna")
    for sec in fix.get("secoes", []):
        if chave_nivel(sec.get("nome", "")) not in NIVEIS:
            erros.append(f"fixação: nível desconhecido '{sec.get('nome')}' (use Nível 1, Nível 2 ou Nível 3)")
    if variedade and qf:
        formatos = [formato(q) for q in qf]
        criativas = sum(1 for f, q in zip(formatos, qf) if f in ("vf", "associar", "completar") or q.get("colunas"))
        if len(set(formatos)) < 3 or criativas < 5:
            erros.append(f"fixação pouco variada: formatos {sorted(set(formatos))}, {criativas} questões em formato não aberto (mínimo 3 formatos e 5 questões)")
    return erros


BANCAS_4ALT = ("Unicamp",)


def validar_banca(codigo, fonte):
    """Padrão 4: fixação como no padrão 3; vestibular e aprofundamento no formato das provas reais."""
    erros = validar_fixacao(fonte) if "fixacao" in fonte else []
    if "{{{" in json.dumps(fonte, ensure_ascii=False):
        erros.append("lacuna colada em chave: escreva \\dfrac{ {{x}} }{ {{y}} }, com espaço")
    qv = fonte.get("vestibular", {}).get("questoes", [])
    qa = fonte.get("aprofundamento", {}).get("questoes", [])
    if "vestibular" in fonte and len(qv) != 20:
        erros.append(f"vestibular tem {len(qv)} questões (esperado 20)")
    if "aprofundamento" in fonte and not 8 <= len(qa) <= 12:
        erros.append(f"aprofundamento tem {len(qa)} questões (esperado de 8 a 12)")
    cont = {}
    for nome, lista in (("vestibular", qv), ("aprofundamento", qa)):
        for i, q in enumerate(lista, 1):
            tag = f"{nome} {i}"
            if not q.get("estilo"):
                erros.append(f"{tag}: falta o estilo da banca (ex.: estilo: Enem)")
            if not q.get("resolucao"):
                erros.append(f"{tag}: falta resolucao")
            if nome == "aprofundamento" and not q.get("resposta"):
                erros.append(f"{tag}: falta resposta")
            if q.get("nivel") and chave_nivel(q["nivel"]) not in NIVEIS:
                erros.append(f"{tag}: nível desconhecido '{q['nivel']}'")
            f = formato(q)
            if f == "somatoria":
                ps, cs = q.get("proposicoes", []), q.get("corretas", [])
                if not 4 <= len(ps) <= 7:
                    erros.append(f"{tag}: somatória precisa de 4 a 7 proposições")
                if not cs or len(cs) == len(ps) or any(not 1 <= c <= len(ps) for c in cs) or len(set(cs)) != len(cs):
                    erros.append(f"{tag}: corretas da somatória inválidas")
                if not str(q["enunciado"]).strip().endswith("Assinale o que for correto."):
                    erros.append(f"{tag}: somatória termina com 'Assinale o que for correto.'")
            elif f == "objetiva":
                ops = q["opcoes"]
                n_ok = (4, 5) if q["estilo"] in BANCAS_4ALT else (5,)
                if len(ops) not in n_ok or len(set(map(str, ops))) != len(ops):
                    erros.append(f"{tag}: {len(ops)} alternativas (estilo {q['estilo']} pede {' ou '.join(map(str, n_ok))}, distintas)")
                if q.get("correta") not in list("ABCDE"[:len(ops)]):
                    erros.append(f"{tag}: correta inválida")
                if (q.get("afirmativas") or q.get("afirmacoes")) and not q.get("comando"):
                    erros.append(f"{tag}: afirmativas pedem um comando depois delas (ex.: 'É correto o que se afirma em')")
                if nome == "vestibular":
                    cont[q["correta"]] = cont.get(q["correta"], 0) + 1
            elif nome == "vestibular":
                erros.append(f"{tag}: vestibular só tem objetivas e somatórias")
            elif len(q.get("itens", [])) < 2:
                erros.append(f"{tag}: discursiva de aprofundamento tem itens a), b)...")
    if qv:
        som = sum(1 for q in qv if formato(q) == "somatoria")
        afirm = sum(1 for q in qv if q.get("afirmativas") or (q.get("afirmacoes") and q.get("opcoes")))
        longas = sum(1 for q in qv if len(str(q.get("texto", ""))) >= 200 or q.get("texto_comum"))
        visuais = sum(1 for q in qv if q.get("tabela") or q.get("figura") or (q.get("texto_comum") or {}).get("tabela") or (q.get("texto_comum") or {}).get("figura"))
        curtas = sum(1 for q in qv if not (q.get("texto") or q.get("tabela") or q.get("figura") or q.get("texto_comum")))
        bancas = {q.get("estilo") for q in qv}
        for ok, msg in ((3 <= som <= 5, f"{som} somatórias (de 3 a 5)"),
                        (afirm >= 2, f"{afirm} questões de afirmativas I/II/III ou sequência V-F (mínimo 2)"),
                        (longas >= 5, f"{longas} questões com texto longo, de 200+ caracteres (mínimo 5)"),
                        (visuais >= 4, f"{visuais} questões com tabela, gráfico ou figura (mínimo 4)"),
                        (curtas >= 4, f"{curtas} questões curtas e diretas (mínimo 4)"),
                        (len(bancas) >= 5, f"{len(bancas)} estilos de banca (mínimo 5)"),
                        (all(2 <= cont.get(l, 0) <= 5 for l in "ABCDE"), f"gabarito desequilibrado: {cont}")):
            if not ok:
                erros.append("vestibular: " + msg)
    if qa:
        disc = sum(1 for q in qa if formato(q) not in ("objetiva", "somatoria"))
        if not 5 <= disc <= len(qa) - 2:
            erros.append(f"aprofundamento: {disc} discursivas (pelo menos 5, e pelo menos 2 objetivas ou somatórias)")
    if erros:
        sys.exit(f"{codigo}: fonte inválida\n  - " + "\n  - ".join(erros))


def padrao_fonte(codigo):
    """0 = sem fonte; 1 = lista antiga (aproveitar e revisar); 2 = padrão atual."""
    f = FONTE / f"{codigo}.yaml"
    if not f.exists():
        return 0
    fonte = yaml.safe_load(f.read_text(encoding="utf-8")) or {}
    p = fonte.get("padrao", 1)
    if p >= 4 and not all(t in fonte for t in NOMES):
        return 3  # fonte nova, mas ainda sem as três listas: continua no próximo lote
    return p


def proximo_lote(tamanho=6):
    """Próximas aulas sem lista no padrão atual (sem fonte, ou fonte antiga a revisar),
    na ordem do livro, sem atravessar a fronteira de um módulo."""
    aulas = json.loads((ROOT / "data" / "aulas.json").read_text(encoding="utf-8"))["lessons"]
    pendentes = [a for a in aulas if padrao_fonte(a["id"]) < PADRAO_ATUAL]
    if not pendentes:
        return []
    bloco = pendentes[0]["block"]
    return [a for a in pendentes if a["block"] == bloco][:tamanho]


def ajustar(x):
    """Ajustes tipográficos: intervalos como ]-3, 5[ ganham espaçamento de delimitador."""
    if isinstance(x, str):
        # colchete "]" que abre intervalo e "[" que fecha: espaçamento de delimitador
        x = re.sub(r"(?<!\\)\](?=-|\d|\\infty)",
                   lambda m: "]" if re.search(r"\\sqrt\[[^\]]*$", x[:m.start()]) else r"\mathopen{]}", x)
        x = re.sub(r"(?<!\\)(?<!\\left)(?<!\\right)\[(?=\$|\s|\\,|\\cup|\\cap|\\quad|\\ |\)|,|\.|;|$)", r"\\mathclose{[}", x)
        return x
    if isinstance(x, list):
        return [ajustar(i) for i in x]
    if isinstance(x, dict):
        return {k: (v if k == "figura" else ajustar(v)) for k, v in x.items()}
    return x


def gerar(codigo):
    aulas = json.loads((ROOT / "data" / "aulas.json").read_text(encoding="utf-8"))["lessons"]
    aula = next(a for a in aulas if a["id"] == codigo)
    fonte = yaml.safe_load((FONTE / f"{codigo}.yaml").read_text(encoding="utf-8"))
    validar(codigo, fonte)
    fonte = ajustar(fonte)
    DEST.mkdir(exist_ok=True)
    saidas = []
    n_listas = sum(1 for t in NOMES if t in fonte)
    for tipo in NOMES:
        if tipo not in fonte:
            continue
        tex = documento(aula, tipo, fonte[tipo], n_listas, fonte.get("padrao", 1))
        with tempfile.TemporaryDirectory() as tmp:
            arq = Path(tmp) / "lista.tex"
            arq.write_text(tex, encoding="utf-8")
            for _ in range(2):  # 2 passadas: capa (overlay) e número total de páginas
                r = subprocess.run(["xelatex", "-interaction=nonstopmode", "-halt-on-error", arq.name],
                                   cwd=tmp, capture_output=True, text=True)
                if r.returncode:
                    debug = Path(tempfile.gettempdir()) / f"erro-{tipo}-{codigo}.tex"
                    debug.write_text(tex, encoding="utf-8")
                    sys.exit(f"Erro no XeLaTeX ({codigo} {tipo}); fonte em {debug}:\n" + r.stdout[-2500:])
            destino = DEST / f"{tipo}-{codigo}.pdf"
            shutil.copy(Path(tmp) / "lista.pdf", destino)
            saidas.append(destino)
        gerar_caderno(aula, codigo, tipo, fonte)
    return saidas


def gerar_caderno(aula, codigo, tipo, fonte):
    """Versão do caderno digital: uma questão por página, com o rascunho no resto da folha.
    Gera pdfs/caderno-<tipo>-<aula>.pdf e um .json com o mapa de questões e a altura onde o rascunho começa."""
    tex = documento(aula, tipo, fonte[tipo], 3, fonte.get("padrao", 1), caderno=True)
    with tempfile.TemporaryDirectory() as tmp:
        arq = Path(tmp) / "lista.tex"
        arq.write_text(tex, encoding="utf-8")
        for _ in range(2):
            r = subprocess.run(["xelatex", "-interaction=nonstopmode", "-halt-on-error", arq.name], cwd=tmp, capture_output=True, text=True)
            if r.returncode:
                debug = Path(tempfile.gettempdir()) / f"erro-caderno-{tipo}-{codigo}.tex"
                debug.write_text(tex, encoding="utf-8")
                sys.exit(f"Erro no XeLaTeX (caderno {codigo} {tipo}); fonte em {debug}:\n" + r.stdout[-2500:])
        log = (Path(tmp) / "lista.log").read_text(encoding="utf-8", errors="replace")
        pdf_nome = f"caderno-{tipo}-{codigo}.pdf"
        shutil.copy(Path(tmp) / "lista.pdf", DEST / pdf_nome)
    paginas = int(subprocess.run(["pdfinfo", str(DEST / pdf_nome)], capture_output=True, text=True).stdout.split("Pages:")[1].split()[0])
    altura = 841.89  # A4 em pontos do PDF
    grade = {}
    for pg, sp in re.findall(r"CADERNOY (\d+) (-?\d+)", log):
        grade[pg] = round(altura - int(sp) / 65536 * 72 / 72.27, 1)  # de cima para baixo, em pontos do PDF
    inicio = {int(n): int(pg) for n, pg in re.findall(r"CADERNOQ (\d+) (\d+)", log)}
    gab = re.findall(r"CADERNOG (\d+)", log)
    gab = int(gab[-1]) if gab else paginas + 1
    if tipo == "fixacao":
        niveis = [NIVEIS[chave_nivel(s_["nome"])][1] for s_ in fonte[tipo]["secoes"] for _ in s_["questoes"]]
    elif tipo == "vestibular":
        niveis = [NIVEIS[nivel_vest(q, i)][1] for i, q in enumerate(fonte[tipo]["questoes"], 1)]
    else:
        niveis = [""] * len(fonte[tipo]["questoes"])
    qs = []
    for n in sorted(inicio):
        fim = (inicio.get(n + 1) or gab) - 1
        qs.append({"n": n, "paginas": list(range(inicio[n], max(inicio[n], fim) + 1)), "nivel": niveis[n - 1] if n <= len(niveis) else ""})
    mapa = {"pdf": f"/pdfs/{pdf_nome}", "paginas": paginas, "questoes": qs, "rascunho": grade,
            "rascunhoFim": round(altura - 20 / 25.4 * 72, 1), "gabarito": gab}
    (DEST / f"caderno-{tipo}-{codigo}.json").write_text(json.dumps(mapa, ensure_ascii=False), encoding="utf-8")
    return DEST / pdf_nome


TITULOS = {
    "fixacao": "Lista de fixação {id} — 20 questões com espaço para resolver + gabarito resolvido",
    "vestibular": "Lista de vestibular {id} — 20 questões + gabarito resolvido",
    "aprofundamento": "Lista de aprofundamento {id} — questões mais puxadas + gabarito resolvido",
}


def publicar(codigo, pdfs):
    """Registra os PDFs da aula em data/materiais.json (fonte de verdade da biblioteca)."""
    if padrao_fonte(codigo) >= 4 and len(pdfs) < 3:
        sys.exit(f"{codigo}: publique só com as três listas (fixação, vestibular e aprofundamento)")
    idx_path = ROOT / "data" / "materiais.json"
    idx = json.loads(idx_path.read_text(encoding="utf-8"))
    entrada = next((e for e in idx if e.get("tipo") == "aula" and e.get("aula") == codigo), None)
    if entrada is None:
        entrada = {"aula": codigo, "arquivos": [], "tipo": "aula"}
        idx.append(entrada)
        idx.sort(key=lambda e: (e.get("tipo") != "aula", e.get("aula") or e.get("assunto") or e.get("area") or ""))
    por_url = {a["url"]: a for a in entrada["arquivos"]}
    for pdf in pdfs:
        tipo = pdf.stem.split("-")[0]
        url = f"/pdfs/{pdf.name}"
        if url in por_url:
            por_url[url]["titulo"] = TITULOS[tipo].format(id=codigo)
        else:
            entrada["arquivos"].append({"titulo": TITULOS[tipo].format(id=codigo), "tipo": "lista", "url": url})
    idx_path.write_text(json.dumps(idx, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    if "--proximo" in sys.argv:
        lote = proximo_lote()
        ids = [a["id"] for a in json.loads((ROOT / "data" / "aulas.json").read_text(encoding="utf-8"))["lessons"]]
        nivel = {c: padrao_fonte(c) for c in ids}
        novas = sum(1 for v in nivel.values() if v >= PADRAO_ATUAL)
        antigas = sum(1 for v in nivel.values() if 0 < v < PADRAO_ATUAL)
        print(f"Aulas com listas no padrão atual: {novas}/{len(ids)} (mais {antigas} antigas a revisar)")
        print("Próximo lote:" if lote else "Todas as aulas têm listas no padrão atual.")
        for a in lote:
            marca = "  [revisar lista antiga]" if 0 < nivel[a["id"]] < PADRAO_ATUAL else ""
            print(f"  {a['id']} (módulo {a['block']}) {a['title']} — {a['summary']}{marca}")
        sys.exit(0)
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    for c in args or ["2.3.2"]:
        pdfs = gerar(c)
        for s in pdfs:
            print("gerado:", s.relative_to(ROOT))
        from exportar_listas import exportar  # questões interativas e capas para a página da aula
        print("exportado:", exportar(c).relative_to(ROOT))
        if "--publicar" in sys.argv:
            publicar(c, pdfs)
            print("publicado em data/materiais.json:", c)
