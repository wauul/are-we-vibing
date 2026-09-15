import asyncio
from pathlib import Path
from PIL import Image
from playwright.async_api import async_playwright

ROOT = Path(__file__).parent
OUT = ROOT / 'artifacts'
FRAMES = OUT / 'demo_frames'
FRAMES.mkdir(parents=True, exist_ok=True)
SESSION = '2c155367-df57-42ad-9d4a-85b294e92ee6'

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1280, 'height': 720}, device_scale_factor=1)
        frame_no = 0

        async def shot(url, seconds=1.5, scroll=0):
            nonlocal frame_no
            await page.goto(url, wait_until='networkidle')
            if scroll:
                await page.evaluate(f'window.scrollTo(0, {scroll})')
            await page.wait_for_timeout(400)
            image = await page.screenshot()
            stills = max(1, round(seconds * 5))
            for _ in range(stills):
                (FRAMES / f'frame_{frame_no:04d}.png').write_bytes(image)
                frame_no += 1

        await shot('http://localhost:3000/', 2.0)
        await page.goto('http://localhost:3000/session/new', wait_until='networkidle')
        await page.locator('#name').fill('Maya')
        await page.locator('#music').fill('Frank Ocean\nSZA\nDaft Punk')
        await page.locator('#music').press('Tab')
        await page.wait_for_timeout(400)
        image = await page.screenshot()
        for _ in range(10):
            (FRAMES / f'frame_{frame_no:04d}.png').write_bytes(image)
            frame_no += 1
        await shot(f'http://localhost:3000/session/{SESSION}', 2.0)
        await shot(f'http://localhost:3000/results/{SESSION}', 2.5, 0)
        await shot(f'http://localhost:3000/results/{SESSION}', 2.5, 850)
        await browser.close()

    images = [Image.open(path).convert('P', palette=Image.Palette.ADAPTIVE, colors=128)
              for path in sorted(FRAMES.glob('frame_*.png'))]
    if images:
        images[0].save(OUT / 'r-we-vibing-demo.gif', save_all=True,
                       append_images=images[1:], duration=200, loop=0, optimize=False)
    for path in FRAMES.glob('frame_*.png'):
        path.unlink()
    FRAMES.rmdir()
    print(f'captured {frame_no} page frames')

asyncio.run(main())
