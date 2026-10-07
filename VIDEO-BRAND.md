# Team Funqtion — video & merkrichtlijn

Eén bestand, bedoeld om door Claude Code gelezen te worden vóór het bouwen van
een Remotion-video. Alles hieronder is gelezen uit de echte assets in deze
repo, niet uit het hoofd. Afgeleide getallen staan als afgeleid gemarkeerd.

**Bronnen:** `css/tokens.css` (kleur, type, motion), `img/logo.svg`,
`../FUNQTION/funqtion-assets/` (originelen), `../FUNQTION/funqtion/CONTENT.md`
(vaste copy), `REFINEMENT-LOG.md` (waarom de motion is zoals hij is).

---

## 1. Wat het merk is

Team Funqtion is een Nederlands DJ-duo — Gijs van Doren en Coen Peels — uit
Aarle-Rixtel. Dorpsfeesten, gala's, carnaval, tuinfeesten. Hardstyle en
hardcore naast alle genres.

De site is gebouwd als een **datasheet**: machinegrijs, hairlines, mono-type,
labels in kapitalen, één oranje accent. Geen glans, geen gradients, geen
afgeronde hoeken. Dat register is het merk — de video moet eruitzien als
apparatuur die aanstaat, niet als een reclamespot.

De toon van de copy is daarentegen *informeel en ongepolijst*: uitroeptekens,
emoji, zelfs bewaarde typo's. Die spanning — strakke vorm, losse stem — is
het hele idee. Houd die.

---

## 2. Copy die vastligt

Letterlijk overnemen. Niet vertalen, niet corrigeren, niet "professionaliseren".

| | |
|---|---|
| Naam | `Team Funqtion` |
| Descriptor | `Allround Dj's` |
| Tagline | `FEEL THE MUSIQ` |
| Copyright | `© 2025 FEEL THE MUSIQ - Team Funqtion. Alle rechten voorbehouden.` |
| Taal | Nederlands (`nl`) |
| Instagram | `@funqtion1` |

Alles wat verder in beeld komt en uit `CONTENT.md` komt — feestnamen,
quotes — gaat er **karakter voor karakter** in. In die bron staan twee typo's
en een spelfout bewust bewaard (`OWij`, `vollwassenen`, `s'nachts`). Als een
shot zulke tekst gebruikt, blijft die staan.

---

## 3. Logo

**Asset:** `img/logo.svg` — `viewBox="0 0 375 375"`, vierkant.
Ook beschikbaar als `../FUNQTION/funqtion-assets/logo.png`, **1250×1250 px**.

Voor Remotion: gebruik de **SVG** als het logo beweegt of schaalt (geen
resampling), de PNG alleen als iets de SVG niet aankan.

**Het logo heeft exact twee kleuren**, gecontroleerd in de bron:

| | |
|---|---|
| `#f68712` | het oranje — identiek aan `--fq-accent` |
| `#ffffff` | wit, 5 paden |

> Let op bij grepen door `logo.svg`: er staan tientallen hex-achtige strings
> in die géén kleuren zijn — dat zijn `clipPath`-id's zoals `190397a6a8`.
> Alleen `fill="#…"` telt.

**Gebruik**

- Altijd vierkant, nooit uitgerekt. Het mark is niet symmetrisch.
- Vrije ruimte rondom: minstens **25% van de logobreedte** aan alle kanten.
- Op `--fq-page` (#040404) staat het zoals het is. Nooit op oranje.
- Nooit herkleuren, geen schaduw, geen outline, geen gradient.
- Op foto: alleen als er een egale donkere plek is. Geen halo, geen plaat
  eronder — kies een ander kader.

**Minimale maat in beeld:** onder 64px op een 1080-canvas valt het binnenwerk
van het mark dicht. Wil je het kleiner, gebruik dan geen logo.

---

## 4. Kleur

De echte ramp uit `css/tokens.css`, met de contrastwaarden die daar
gedocumenteerd staan (gemeten tegen `#040404`):

| token | hex | contrast | waarvoor |
|---|---|---:|---|
| `--fq-page` | `#040404` | — | de achtergrond. Dit is de merkkleur |
| `--fq-dusk` | `#141414` | — | ingezette vlakken |
| `--fq-hairline` | `#363636` | — | de lijnkleur |
| `--fq-machine-grey` | `#6c6c6c` | 3.90:1 | **alleen** lijnen en decoratie, nooit tekst |
| `--fq-quiet-grey` | `#7a7a7a` | 4.78:1 | de donkerste toegestane tekstkleur |
| `--fq-flat-grey` | `#8d8d8d` | 6.18:1 | metadata, onderschriften |
| `--fq-off-white` | `#d9d9d9` | 14.52:1 | broodtekst |
| `--fq-bashed-white` | `#e4e4e4` | 16.11:1 | |
| `--fq-power-white` | `#f0f0f0` | 17.98:1 | koppen |
| `--fq-accent` | `#f68712` | 8.2:1 | **één ding per shot** |

### De accentregel

Oranje is geen decoratie, het is nadruk. **Eén accentelement per shot.** Zodra
er twee zijn, markeert het niets meer. Dat is op de site drie keer herzien en
elke keer teruggebracht naar één — zie `REFINEMENT-LOG.md`.

### Drie dingen die alleen bij video spelen

1. **`#040404`, niet `#000000`.** Zwart op zwart telt niet — de pagina heeft
   een kleur en het mark heeft wit. Houd `#040404` aan, ook omdat echt zwart
   in sterke compressie gaat blokken.
2. **Oranje overleeft compressie slecht.** `#f68712` is sterk verzadigd rood-
   geel; dat is precies het kanaal waar h.264 chroma subsamplet (4:2:0). Zet
   geen dunne oranje lijnen of kleine oranje tekst neer — die gaan rafelen.
   Oranje werkt op vlakken en op type vanaf ongeveer 40px.
3. **Geen helderheidsfilters op bijna-zwart.** Een les die op de site geld
   kostte: `filter: brightness()` op `#040404` doet niets, want elk veelvoud
   van bijna-zwart is bijna-zwart. Wil je een CRT-uitdoofje, animeer dan
   `opacity` of een echte overlay.

---

## 5. Type

**Twee fonts, geen derde.**

| rol | font | gewicht |
|---|---|---|
| Display: koppen, titels, het wordmark | **Archivo Black** | 400 (het heeft maar één gewicht) |
| Alles anders: broodtekst, labels, cijfers | **JetBrains Mono** | 300 en 400 |

Display altijd **kapitaal**, met tracking `-0.03em` (`--fq-track-display`).
Mono laat je met rust: geen tracking, behalve labels in kapitaal op `+0.03em`.

### De maatladder hangt aan waar het bekeken wordt, niet aan het canvas

Dit is het getal waar alles om draait. Een 1920 breed frame in een
telefoonfeed wordt op ongeveer **390px** weergegeven — alles op het canvas
wordt dus met 0,203 vermenigvuldigd vóórdat iemand het leest.

| compositie | weergave | schaal | canvas-px nodig voor 14px leesbaar |
|---|---:|---:|---:|
| 1920×1080 | 390px (feed) | 0.203 | **69px** |
| 1920×1080 | 1280px (browser) | 0.667 | 21px |
| 1920×1080 | 1920px (volledig) | 1.000 | 14px |
| 1080×1920 | 390px (feed) | 0.361 | **39px** |
| 1080×1920 | 1080px (volledig) | 1.000 | 14px |

**Gevolg:** in een liggende video die voor een feed bedoeld is, is álles onder
ongeveer 70px onleesbaar. Het 24px-labelregister van de site kan daar dus
niet mee. Dat is exact de fout die eerder in dit project gemaakt is met een
presentatie die op een telefoon op 6,5px uitkwam — niet klein, onleesbaar.

**Dus: kies verticaal als het voor Instagram of TikTok is.** 1080×1920 geeft
bijna twee keer zoveel effectieve maat voor hetzelfde ontwerp.

### Ladder voor 1080×1920 (de primaire compositie)

Afgeleid van de siteverhoudingen en daarna opgetrokken tot de 39px-vloer.

| rol | px | % van breedte |
|---|---:|---:|
| Hero / eindtitel | 168 | 15.6% |
| Sectietitel | 104 | 9.6% |
| Shotkop | 72 | 6.7% |
| Sub | 48 | 4.4% |
| Broodtekst | 40 | 3.7% |
| Label / data (kapitaal mono) | 28 | 2.6% |

Die 28px zit onder de 39px-vloer. Dat mag, mits het label **decoratie** is —
een registermarkering die je niet hoeft te lezen. Moet het gelezen worden, dan
40px.

### Ladder voor 1920×1080 (liggend, alleen voor groot beeld)

| rol | px |
|---|---:|
| Hero / eindtitel | 176 |
| Sectietitel | 112 |
| Shotkop | 80 |
| Sub | 56 |
| Broodtekst | 44 |
| Label / data | 32 |

Gebruik deze compositie **niet** voor een feed, tenzij er geen tekst onder
70px in staat.

### Regels

- Maximaal **twee** typegroottes per shot. Drie is een pagina, niet een shot.
- Regellengte maximaal ongeveer 30 tekens in display, 45 in mono.
- Leading: display `0.92`–`1.0`, mono `1.6` voor prose, `1` voor labels.
- Nooit cursief. Geen van beide fonts heeft een echte cursief.

---

## 6. Kader en raster

- **Compositie:** 1080×1920 (primair) of 1920×1080. 30 fps.
- **Marge:** 7,5% van de breedte aan alle kanten en nooit minder.
  Verticaal: **81px**. Liggend: **144px**.
- **Kolommen:** 12 kolommen, net als de site, met de marge als goot. Houd je
  eraan — het is wat de site zijn ritme geeft.
- **Hairlines:** 1px op de site. Op een 1080-canvas wordt dat **2px**, anders
  verdwijnt hij in de compressie. Kleur `--fq-hairline` (#363636).

### Ruimte voor de interface van het platform

Reels, Shorts en TikTok leggen hun eigen knoppen en onderschriften over het
beeld. Conservatief, op een 1920 hoog frame:

- bovenaan de eerste **200px** vrijhouden
- onderaan de laatste **420px** vrijhouden

Alles wat gelezen moet worden hoort in de middelste band. Deze getallen zijn
bewust ruim genomen; ze zijn niet van de platforms zelf afgelezen, dus ga er
niet van uit dat ze exact zijn.

---

## 7. Bewegingstaal

De site heeft al een hand. Erf die, maar reken hem om.

### De easing is het merk

```
cubic-bezier(0.14, 0.86, 0.37, 0.96)
```

In Remotion:

```tsx
import {Easing, interpolate} from 'remotion';

interpolate(frame, [0, 15], [0, 1], {
  easing: Easing.bezier(0.14, 0.86, 0.37, 0.96),
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
```

Die curve is vrijwel meteen op snelheid en komt lang uit. Het is een
schakelaar die overgaat, niet iets dat zweeft. Gebruik hem voor vrijwel alles.

### Duren: de site is te snel voor video

De webtijden zijn afgestemd op *reactie* — 200ms op een hover voelt
onmiddellijk. In video reageert er niets op de kijker, en dan is diezelfde
200ms een flikkering. Houd de easing, **verdubbel de duur**.

| | site | frames @30 | video | frames @30 |
|---|---:|---:|---:|---:|
| snap (`--fq-dur-snap`) | 200ms | 6 | 400ms | **12** |
| reveal (`--fq-dur-reveal`) | 250ms | 8 | 500ms | **15** |
| stagger (`--fq-stagger`) | 50ms | 2 | 100ms | **3** |
| logo-draai | 460ms | 14 | 920ms | **28** |

**Niets korter dan 6 frames.** Onder die grens is het geen beweging meer maar
een sprong, en op 30fps zie je de tussenstanden niet.

### Vier motieven, met de echte waarden

**1. CRT-opstart** — de opener. Van `js/boot.js`.

**Let op:** de getallen in `T` zijn géén fase-duren, het zijn
**startvertragingen** van vijf *overlappende* animaties. Dat staat ook in de
code (`delay: T.open`, `duration: T.settle - T.heater`) en je ziet het aan
`readout: 120`, die vóór `strike: 190` begint. Wie ze achter elkaar plakt
bouwt een andere animatie.

Hieronder site-waarden en ×2 voor video, met vertraging én duur:

| laag | start → duur (site) | start → duur (video) | frames @30 |
|---|---|---|---|
| raster + scanlijn | 60 → 720ms | 120 → 1440ms | start 4, duur 43 |
| hairline (punt rekt uit) | 190 → 590ms | 380 → 1180ms | start 11, duur 35 |
| open (shutters, met overshoot) | 230 → 240ms | 460 → 480ms | start 14, duur 14 |
| readout (zelftest op zwart) | 120 → 350ms | 240 → 700ms | start 7, duur 21 |
| rolbalk 1 | 400 → 260ms | 800 → 520ms | start 24, duur 16 |
| rolbalk 2 (zwakker, sneller) | 600 → 200ms | 1200 → 400ms | start 36, duur 12 |
| overlay weg | 860ms | 1720ms | **52** |

Rolbalk 1 loopt op volle sterkte; rolbalk 2 gaat van `opacity` 0.55 naar 0.18
met een eigen easing (`cubic-bezier(.35,0,.4,1)`), zodat het beeld "vastloopt"
in plaats van nog een keer te rollen.

De balk is **14% van de hoogte** en loopt van `translateY(-100%)` naar
`translateY(714%)`. Die 714 is geen willekeur: een percentage in `translateY`
is relatief aan de **eigen** hoogte van het element, dus om één volle
containerhoogte te zakken moet een balk van 14% zich 100/14 ≈ 7,14 eigen
hoogtes verplaatsen. Dat is op de site een echte bug geweest — met een
plausibel lijkende waarde bewoog de balk maar een fractie van het beeld.

In Remotion heb je dat probleem niet en moet je het ook niet nabouwen: lees
`height` uit `useVideoConfig()` en interpoleer in **pixels**, van `-barHeight`
naar `height`.

**2. De logo-draai** — de overgang tussen delen.

```
0%   rotate(0deg)   scale(1)
50%  rotate(185deg) scale(1.25)
100% rotate(360deg) scale(1)
```

Een **volle** draai, geen halve: het mark is niet symmetrisch, dus alles
anders eindigt scheef. De 185° op de helft geeft de draai gewicht. De swell
was eerst 1.7 en dat was te veel — het mark viel naar je toe. 1.25.

Eronder wijkt het beeld een beetje: `scaleY` van 1 naar 0.97, uit op 200ms
(12 frames), in op 260ms (16 frames) met 170ms (10 frames) vertraging. Een
beetje. Het is een nette overgang, geen trucje.

**3. De oscilloscoop** — de achtergrond die de site leeft houdt. Uit
`js/scope.js`, echte constanten:

```
TAIL_MS  = 2800     fosforleven, en één nominale ronde
RATIO    = 1.5      de 3:2-basisverhouding
DETUNE_A = 0.055    periode 9400ms   -- de verhouding dwaalt
DETUNE_B = 0.022    periode 3700ms
BREATH_X = 0.075    periode 6100ms   -- de amplitude ademt
BREATH_Y = 0.055    periode 4300ms
SEGMENTS = 260      samples per ronde
BANDS    = 12       leeftijdsbanden in de kern
CORE_MIN = 0.22     alpha aan de staart -- een vloer, geen uitdoving
GLOW_A   = 0.1
```

Twee licht ontstemde oscillatoren, waardoor de Lissajous-figuur langzaam
precesseert en nooit precies herhaalt. In Remotion is dit deterministisch te
maken: voed `useCurrentFrame() / fps * 1000` in als `t` en je krijgt dezelfde
figuur bij elke render.

Op de site staat hij in `mix-blend-mode: difference` over de titel, zodat de
lijn omslaat waar hij letters raakt. Dat was pas zichtbaar toen de lijn breed
genoeg werd: bij 3px raakte hij **1,14%** van de letterpixels — technisch
correct en visueel niets. Op 3,5–9px werd het **3,54%**.

Die drempel is een **verhouding**, niet een aantal pixels: lijn en type
schalen samen mee. Op de site is de kern maximaal 9px tegen een titel van
ongeveer 316px — ruwweg **3% van de letterhoogte**, met de glow op 2,2× de
kern. Houd die verhouding aan, wat je canvas ook is, en controleer het door
één frame te renderen en te kijken of de lijn de letters echt dóórsnijdt.
Doe je dat niet, dan doe je dezelfde moeite voor niets.

**4. De hairline-wipe** — hoe een regel of blok binnenkomt. Een 2px oranje
lijn die van links naar rechts op `scaleX` opent, 220ms op de site, dus
**440ms (13 frames)** in video, en daarna komt de inhoud 10px mee naar
rechts.

---

## 8. Hoe een video in elkaar zit

### Vorm

Het is een datasheet die zich afspeelt. Elk shot is een **leesbaar frame**,
niet een beweging waar je naar kijkt. Beweging dient de overgang tussen
frames, niet het frame zelf.

Concreet: zet neer, laat staan, wissel. Een shot dat iets te lezen heeft
staat **minimaal 2 seconden** stil nadat hij is opgebouwd. Een shot met
alleen een logo of een getal mag korter, minimaal 1 seconde.

### Een werkbare opbouw

Voor een korte promo van ongeveer 20 seconden op 30fps (600 frames):

| frames | duur | wat |
|---|---|---|
| 0–52 | 1,7s | CRT-opstart op zwart |
| 52–150 | 3,3s | logo centraal, `Allround Dj's` in mono eronder |
| 150–180 | 1,0s | logo-draai naar het volgende deel |
| 180–330 | 5,0s | beeldmateriaal van feesten, hairline-labels met plaats en jaar |
| 330–360 | 1,0s | draai |
| 360–480 | 4,0s | één quote uit `CONTENT.md`, letterlijk, display-type |
| 480–510 | 1,0s | draai |
| 510–600 | 3,0s | eindkaart: `FEEL THE MUSIQ`, `@funqtion1`, oscilloscoop erachter |

Dat is een startpunt, geen voorschrift. Wat er niet in mag veranderen: de
opener is de CRT, de overgang is het mark, de eindkaart draagt de tagline.

### Beeldmateriaal

Wat er is: `img/feesten/` — `dorpsfeest.jpg`, `gala.jpg`, `karnaval.jpg`,
`tuinfeest.jpg`, plus portretten `gijs.jpg` en `coen.jpg`. De originelen in
`../FUNQTION/funqtion-assets/` zijn groter en zijn wat je voor video wilt.

Deze foto's zijn **snapshots, geen productiefoto's**. Behandel ze zo: hard
gekaderd, geen filters die ze mooier proberen te maken, en als de kwaliteit
tegenvalt, maak ze kleiner in beeld in plaats van ze op te blazen. Een kleine
scherpe foto met een hairline eromheen past bij het merk; een
beeldvullende korrelige niet.

Geen Ken Burns-zoom. Dat is een ander merk.

---

## 9. Remotion: de regels die er echt toe doen

### Beweging is een functie van het frame, nooit van de tijd

Dit is de fout die Claude Code standaard maakt. CSS `transition`, `animation`
en `@keyframes` **werken niet** — Remotion maakt per frame een screenshot en
er is geen doorlopende klok om die timing vooruit te zetten. De documentatie
waarschuwt er expliciet voor. Het resultaat is geen foutmelding maar een
bevroren of flikkerend beeld.

```tsx
// FOUT -- rendert als een stilstaand frame
<div style={{transition: 'opacity 400ms'}} />

// GOED
const frame = useCurrentFrame();
const {fps} = useVideoConfig();
const opacity = interpolate(frame, [0, 12], [0, 1], {
  easing: Easing.bezier(0.14, 0.86, 0.37, 0.96),
  extrapolateRight: 'clamp',
});
```

Hetzelfde geldt voor `Date.now()`, `performance.now()`, `setInterval` en
niet-geseede `Math.random()`. Gebruik `random('seed')` uit `remotion` als je
ruis of spreiding nodig hebt — anders verschilt elk frame van het vorige en
flikkert het hele beeld.

### Fonts laden

Vanaf Remotion v5 zijn `weights` en `subsets` **verplichte, niet-lege
arrays**. Het blokkeren van de render gaat automatisch; `delayRender` is
hiervoor niet nodig.

```tsx
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {loadFont as loadDisplay} from '@remotion/google-fonts/ArchivoBlack';

const mono = loadMono('normal', {weights: ['300', '400'], subsets: ['latin']});
const display = loadDisplay('normal', {weights: ['400'], subsets: ['latin']});

// gebruik mono.fontFamily / display.fontFamily, niet de naam als string
```

Beperk de gewichten tot wat je gebruikt — de site gebruikt alleen 300 en 400
mono en 400 display. Breder laden kost rendertijd en kan de render laten
aflopen op een timeout.

### Assets

Zet de logo's en foto's in `public/` en verwijs met `staticFile()`. Nooit een
relatief pad of een import voor media.

```tsx
import {staticFile, Img} from 'remotion';
<Img src={staticFile('logo.svg')} />
```

### Verder

- **Sequence** voor timing, niet `if (frame > x)`. Binnen een `<Sequence>`
  begint `useCurrentFrame()` weer op 0, wat shots los van elkaar houdt.
- **AbsoluteFill** voor lagen. Het canvas heeft een vaste maat, dus gebruik
  overal **px** — geen `vw`, `vh` of `svh`, en geen `clamp()`. Die zijn er
  voor een viewport die verandert, en die is er niet.
- **OffthreadVideo** in plaats van `<Video>` voor ingebed beeld bij het
  renderen.
- Zet de compositie één keer vast in `Root.tsx` en lees maten uit
  `useVideoConfig()`, niet uit constanten die kunnen gaan afwijken.

### Tegen-regel: `prefers-reduced-motion` geldt hier niet

Op de site is de harde regel dat alle beweging stopt onder
`prefers-reduced-motion`. In een gerenderde video is dat zinloos — er is geen
voorkeur om te lezen en het bestand is al plat. Neem die check **niet** over;
het levert alleen een shot op dat bij het renderen stilstaat.

Wat wél blijft gelden: geen flikkering sneller dan 3 keer per seconde met
grote helderheidssprongen. Op 30fps betekent dat: geen patroon dat vaker dan
elke 10 frames tussen donker en licht wisselt. De CRT-opstart zit daar ruim
onder — dat is nagemeten op de site en moet nagemeten blijven.

---

## 10. Geluid

Er is **geen vastgelegde track**. Dat is een keuze die nog gemaakt moet
worden, en voor een DJ-duo de belangrijkste van de video.

Wat wel vastligt:

- Muziek moet van het duo zelf zijn of rechtenvrij. Een commerciële track
  onder een promo is op elk platform een claim en vaak een mute.
- De CRT-opstart vraagt om een klik en een oplopende toon, geen muziek —
  laat de track pas invallen als het raster open is, rond frame 52.
- Als er tekst gelezen moet worden, zet de muziek daar onder. Geen drop
  tegelijk met een quote in beeld.

Gebruik `<Audio src={staticFile('…')} />` en knip met `startFrom` en
`endAt`, niet met een fade in de bron.

---

## 11. Wat niet mag

- Een tweede accentkleur. Er is één oranje.
- Een derde font.
- Gradients, schaduwen, glow, afgeronde hoeken, glas.
- Het logo herkleuren, spiegelen, uitrekken of op oranje zetten.
- Tekst onder de vloer uit sectie 5 voor de compositie die je kiest.
- Nederlandse copy uit `CONTENT.md` aanpassen, inclusief de bewaarde typo's.
- CSS-transitions en `@keyframes` in Remotion.
- Een shot korter dan 6 frames.
- Ken Burns.

---

## 12. Voordat je rendert

Meten, niet aannemen. Dat is de enige werkwijze die in dit project iets heeft
opgelost.

1. Render één still per shot en bekijk die **op 390px breed**. Is het
   leesbaar? Zo niet, dan is het type te klein — ongeacht wat het op het
   canvas doet.
2. Controleer dat geen tekst buiten de marge uit sectie 6 valt, en dat niets
   dat gelezen moet worden in de onderste 420px staat.
3. Tel de accentelementen per shot. Precies één.
4. Render de hele video en kijk of er geen frame bevroren of flikkerend is —
   dat is het teken dat er ergens een CSS-transition of een `Date.now()` in
   zit.
5. Kijk hem één keer op een telefoon, met geluid, in een feed. Niet op een
   monitor.
