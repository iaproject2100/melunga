"""Export the five rendered desktop proposals as five landscape PDF pages."""
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
files = sorted(HERE.glob('[1-5]-*.png'))
assert len(files) == 5
pages = [Image.open(file).convert('RGB') for file in files]
pages[0].save(HERE / '5-maquettes-ordinateur.pdf', save_all=True,
              append_images=pages[1:], resolution=144, quality=95)
print('Exported five landscape PDF pages.')
