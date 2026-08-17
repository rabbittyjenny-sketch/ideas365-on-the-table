from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

src = Path('/home/ubuntu/food-costing-calculator/pizza_images')
files = sorted(src.glob('*.jpg'), key=lambda p: int(p.stem))
thumb_w, thumb_h = 180, 300
cols = 4
rows = (len(files) + cols - 1) // cols
canvas = Image.new('RGB', (cols * thumb_w, rows * (thumb_h + 28)), '#e9e4da')
draw = ImageDraw.Draw(canvas)
for i, path in enumerate(files):
    image = Image.open(path).convert('RGB')
    image.thumbnail((thumb_w - 12, thumb_h - 12))
    cell = Image.new('RGB', (thumb_w, thumb_h), '#fbfaf6')
    x = (thumb_w - image.width) // 2
    y = (thumb_h - image.height) // 2
    cell.paste(image, (x, y))
    cx = (i % cols) * thumb_w
    cy = (i // cols) * (thumb_h + 28)
    canvas.paste(cell, (cx, cy))
    draw.text((cx + 8, cy + thumb_h + 6), path.stem, fill='#1d3343')
canvas.save('/home/ubuntu/food-costing-calculator/pizza_contact_sheet.jpg', quality=90)
