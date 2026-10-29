"""Revise proposal 1: keep the left themes and place actions beneath the lesson."""
from pathlib import Path

HERE = Path(__file__).resolve().parent
source = (HERE.parent / 'desktop-five-lesson-layouts/maquettes.html').read_text()
before = "1:context()+'<main class=\"workspace\">'+themePanel()+lesson(false)+commands()+'</main>'+legal()"
after = "1:context()+'<main class=\"workspace\">'+themePanel()+lesson(true)+'</main>'+legal()"
assert source.count(before) == 1
source = source.replace(before, after)
source = source.replace("const variant=chosen>=1&&chosen<=5?chosen:1;", "const variant=1;")
source = source.replace("'Thèmes à gauche · commandes à droite'", "'Thèmes à gauche · commandes sous la leçon'")
source = source.replace('href="comparaison.html">5 propositions · ordinateur',
                        'href="../desktop-five-lesson-layouts/comparaison.html">Variante de la maquette 1 · ordinateur')
overrides = '''
/* Keep the chosen lesson compact after moving its actions back underneath. */
.variant-1 .workspace{max-width:1080px;grid-template-columns:250px minmax(0,1fr);gap:24px}
.variant-1 .context{max-width:1080px}
.variant-1 .lesson{min-height:454px;padding:24px 28px 28px}
.variant-1 .actions{margin-top:12px}
.variant-1 .actions .next{flex-direction:row-reverse}
@media(max-height:800px){.variant-1 .lesson{min-height:428px;padding:20px 24px 24px}}
'''
assert source.count('</style>') == 1
(HERE / 'maquette-boutons-en-bas.html').write_text(source.replace('</style>', overrides + '</style>'))
print('Built proposal 1 with left themes and bottom actions.')
