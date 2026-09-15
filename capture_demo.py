from pathlib import Path
import time
from PIL import ImageGrab

out = Path('artifacts')
frames = out / 'demo_frames'
frames.mkdir(parents=True, exist_ok=True)

fps = 5
duration = 22
deadline = time.time() + duration
index = 0
while time.time() < deadline:
    image = ImageGrab.grab()
    image.save(frames / f'frame_{index:04d}.png')
    index += 1
    time.sleep(1 / fps)

images = []
for path in sorted(frames.glob('frame_*.png')):
    from PIL import Image
    images.append(Image.open(path).convert('P', palette=Image.Palette.ADAPTIVE, colors=128))

if images:
    images[0].save(
        out / 'r-we-vibing-demo.gif',
        save_all=True,
        append_images=images[1:],
        duration=int(1000 / fps),
        loop=0,
        optimize=False,
    )

for path in frames.glob('frame_*.png'):
    path.unlink()
frames.rmdir()
print(f'captured {index} frames')
