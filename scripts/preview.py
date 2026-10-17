import sys, asyncio
from playwright.async_api import async_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8787/"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        pg = await b.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: m.type=="error" and errs.append(m.text))
        await pg.goto(URL, wait_until="networkidle"); await pg.wait_for_timeout(2500)
        await pg.screenshot(path="preview/home.png")
        await pg.locator("#map").scroll_into_view_if_needed(); await pg.hover(".region[data-id=mueum]"); await pg.wait_for_timeout(1200)
        await pg.locator("#map").screenshot(path="preview/map.png")
        await pg.locator("#characters").screenshot(path="preview/characters.png")
        await pg.locator("#chronicle").screenshot(path="preview/chronicle.png")
        m = await b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        await m.goto(URL, wait_until="networkidle"); await m.wait_for_timeout(2000)
        await m.screenshot(path="preview/mobile-home.png")
        await m.locator("#map").scroll_into_view_if_needed(); await m.wait_for_timeout(800)
        await m.screenshot(path="preview/mobile-map.png")
        print("errors:", errs)
        await b.close()
asyncio.run(main())
