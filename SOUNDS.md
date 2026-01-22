# Zvuky a hudba v DestiGuess

## Použité knihovny

- **use-sound** (https://github.com/joshwcomeau/use-sound) – React hook pro přehrávání zvuků, stavěný na Howler.js

## Zvuky

| Událost | Popis | Zdroj (Mixkit) |
|--------|-------|-----------------|
| **place** | Kliknutí při označení místa na mapě | SFX 2560 |
| **result** | Zobrazení výsledku kola / dokončení hry | SFX 2570 |
| **start** | Začátek hry / nové kolo | SFX 2562 |
| **music** | Pozadí během hraní (loop) | Music 493 – „Games Worldbeat“ |

Všechny zvuky jsou z [Mixkit](https://mixkit.co/free-sound-effects/) (royalty-free, bez nutnosti atribuce).

## Vlastní zvuky

Chcete-li použít vlastní soubory, upravte konstanty `SOUNDS` v `components/GameAudio.tsx` a nastavte cesty k souborům v `public/sounds/`, např.:

```ts
const SOUNDS = {
  place: '/sounds/place.mp3',
  result: '/sounds/result.mp3',
  start: '/sounds/start.mp3',
  music: '/sounds/music.mp3',
};
```

## Tlačítko Zvuk / Mute

V navbaru (ikona Volume2 / VolumeX) lze zapnout nebo vypnout zvuk. Volba se ukládá do `localStorage` pod klíčem `destiguess-muted`.
