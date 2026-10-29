"""Export actual browser captures for review before merging into main."""
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
files = [
    'choix-fr-es-L2-390.png', 'lecon-fr-es-L2-390.png',
    'progression-premiere-etape-fr-es-L2-390.png',
    'choix-fr-es-L2-1600.png', 'lecon-fr-es-L2-1600.png',
    'progression-premiere-etape-fr-es-L2-1600.png',
]
pages = [Image.open(HERE / name).convert('RGB') for name in files]
pages[0].save(HERE / 'apercus-mobile-ordinateur.pdf', save_all=True,
              append_images=pages[1:], resolution=144, quality=95)
print('Exported six review pages: mobile and desktop choice, lesson and acquired progress.')
