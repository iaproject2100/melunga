#!/usr/bin/env python3
"""Export a single local HTML review; does not publish or change source content."""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DIRECTORY = ROOT / 'docs/progression-corrections'


def export(destination):
    data = json.loads((DIRECTORY / 'parcours-corriges.json').read_text(encoding='utf-8'))
    if data.get('publicationApproved') is not False:
        raise ValueError('Expected a non-published review proposal')
    page = (DIRECTORY / 'maquette/index.html').read_text(encoding='utf-8')
    css = (DIRECTORY / 'maquette/style.css').read_text(encoding='utf-8')
    script = (DIRECTORY / 'maquette/app.js').read_text(encoding='utf-8')
    page = page.replace('<link rel="stylesheet" href="style.css">', '<style>' + css + '</style>')
    page = page.replace('<script src="app.js" defer></script>', '')
    page = page.replace('href="../README.md"', 'href="#lesson"')
    encoded = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    script = script.replace('</script', '<\\/script')
    page = page.replace('</body>', '<script>window.MELUNGA_CORRECTIONS_REVIEW=' + encoded
                        + ';</script><script>' + script + '</script></body>')
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(page, encoding='utf-8')
    print(f'Local review exported: {destination} ({destination.stat().st_size} bytes)')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destination', type=Path)
    export(parser.parse_args().destination)
