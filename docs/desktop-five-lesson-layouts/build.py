"""Build a self-contained visual prototype, without changing any course asset."""
from pathlib import Path
import base64
import json

HERE = Path(__file__).resolve().parent
WEB = HERE.parents[1] / 'melunga_deploy'
def data(file, mime):
    return 'data:' + mime + ';base64,' + base64.b64encode((WEB / file).read_bytes()).decode()

course = json.loads((WEB / 'content/niveaux-progressifs/fr-es/L1.json').read_text())
themes = []
for index, theme in enumerate(course['themes'][:6]):
    themes.append({'id': theme['id'], 'title': theme['title'], 'number': f'{index+1:02}',
                   'photo': theme['photo'], 'count': len(set(p for s in theme['sequences'] for p in s['phraseIds']))})

template = (HERE / 'prototype.template.html').read_text()
html = template.replace('__LOGO__', data('melunga-logo.png', 'image/png'))
html = html.replace('__SCENES__', data('assets/theme-scenes.webp', 'image/webp'))
html = html.replace('__THEMES__', json.dumps(themes, ensure_ascii=False))
bank = json.loads((WEB / course['repertoirePath']).read_text())
models = {p['id']: p for p in bank['phrases'] + course['themes'][0]['phrases']}
samples = [[models[id][key] for key in ['study', 'phon', 'native']]
           for id in course['themes'][0]['sequences'][0]['phraseIds'][:3]]
html = html.replace('__SAMPLES__', json.dumps(samples, ensure_ascii=False))
(HERE / 'maquettes.html').write_text(html)
print('Built self-contained maquettes.html with the original logo and six source theme photos.')
