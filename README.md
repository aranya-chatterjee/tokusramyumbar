# Toku's Ramyum Bar

Landing page for Toku's Ramyum Bar & Desserts, Gwalior. Plain static HTML, CSS and JavaScript, no build step.

## Run it

Serve the folder over HTTP (fonts will not load from `file://`):

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## What's inside

- `index.html`: the page (hero, story, menu, gallery, note wall, visit)
- `css/style.css`: all styles
- `js/bowl.js`, `js/intro.js`: the served-bowl intro where smoke forms the name
- `js/umbrellas.js`: two large umbrellas turning behind the page as you scroll
- `js/main.js`: nav, menu tabs, note wall
- `img/`: photos cropped from the reference video (low resolution, replace with originals)
- `fonts/`: self-hosted Shojumaru, Big Shoulders Display, Outfit, Black Han Sans
- `screenshots/`: desktop and phone captures

## To replace before launch

- Menu items and descriptions are placeholders
- "Order Now" buttons open a Zomato search
- "Get Directions" opens a Google Maps search
- Add real opening hours, phone number and Instagram
