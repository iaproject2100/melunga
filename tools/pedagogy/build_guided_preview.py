#!/usr/bin/env python3
"""Copy the reviewed mock-up to an isolated deploy-preview folder, not the app."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'docs/progression-complete'
PAIRS = ('fr-en', 'fr-es', 'fr-it', 'fr-zh', 'fr-ja', 'fr-ko', 'zh-fr')


def build(destination):
    files = ['maquette/index.html', 'maquette/style.css', 'maquette/app.js',
             'selection-guidee-enrichie.json', 'banque-phrases.json']
    files += [f'sequences/seq-{pair}.json' for pair in PAIRS]
    bridge_files = ['l1-bridges.json', 'banks/l1-bridges.json']
    files += [relative for relative in bridge_files if (SOURCE / relative).is_file()]
    for relative in bridge_files:
        target = destination / relative
        if relative not in files and target.is_file():
            target.unlink()
    bridge_scenes = []
    bridge_snapshot = None
    if all((SOURCE / relative).is_file() for relative in bridge_files):
        annex = json.loads((SOURCE / 'l1-bridges.json').read_text())
        bridge_scenes = annex['scenes']
        bridge_snapshot = annex.get('sourceSnapshot')
    bridge_units = sum(len(scene['bridgeUnits']) for scene in bridge_scenes)
    copied = []
    for relative in files:
        data = (SOURCE / relative).read_bytes()
        if relative == 'maquette/index.html':
            data = data.replace('Maquette locale pour relecture — aucun contenu publié.'.encode(),
                                'Proposition en aperçu — le site public reste inchangé.'.encode())
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        copied.append({'path': relative, 'sha256': hashlib.sha256(data).hexdigest()})
    manifest = {'scope': 'preview-only-not-a-production-integration',
                'pairs': list(PAIRS), 'levelsPerPair': 10, 'selectedUnits': 210,
                'bridgeUnits': bridge_units, 'bridgeScenes': len(bridge_scenes),
                'totalPreparedUnits': 210 + bridge_units,
                'bridgeSourceSnapshot': bridge_snapshot,
                'contentApprovedForProduction': False,
                'applicationFilesChanged': False,
                'sourceSnapshot': 'ea2619bc6f24e81c254ca00dc272dd76d35cc9a3',
                'files': copied}
    (destination / 'preview-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True,
                        help='Isolated preview destination, e.g. /tmp/melunga-guided-preview')
    args = parser.parse_args()
    manifest = build(args.output.resolve())
    print(json.dumps({'files': len(manifest['files']), 'pairs': 7, 'levels': 70,
                      'selectedUnits': 210, 'bridgeUnits': manifest['bridgeUnits'],
                      'bridgeScenes': manifest['bridgeScenes'],
                      'totalPreparedUnits': manifest['totalPreparedUnits'],
                      'productionIntegration': False}))


if __name__ == '__main__':
    main()
