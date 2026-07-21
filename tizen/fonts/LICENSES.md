# Bundled font licenses

Night Gallery ships all fonts inside the `.wgt` — the app must run with the
TV's network unplugged, so nothing loads from Google Fonts or any other CDN
at runtime. Two of the four files below are variable-weight subsets built
from families distributed through Google Fonts' pipeline; that pipeline
itself repackages the upstream OFL-licensed sources, so the license terms
below are the upstream project's, not Google's.

| File | Family | License | Copyright |
|---|---|---|---|
| `cormorant-garamond.woff2` | Cormorant Garamond | [SIL Open Font License 1.1](https://openfontlicense.org/) | © The Cormorant Project |
| `ibm-plex-sans.woff2` | IBM Plex Sans | [SIL Open Font License 1.1](https://openfontlicense.org/) | © IBM |
| `vazirmatn-arabic.woff2` | Vazirmatn | [SIL Open Font License 1.1](https://openfontlicense.org/) | © Saber Rastikerdar |
| `chess-glyphs.woff2` | Subset of DejaVu Sans | [Bitstream Vera License](https://dejavu-fonts.github.io/License.html) + public-domain additions | Bitstream, Inc. and the DejaVu Fonts contributors |

## Notes

- **cormorant-garamond.woff2** — a subset, variable-weight (400–500) build of
  [Cormorant Garamond](https://github.com/CatharsisFonts/Cormorant), used as
  the display serif for card titles and body text. Source project and full
  license text: https://github.com/CatharsisFonts/Cormorant/blob/master/OFL.txt

- **ibm-plex-sans.woff2** — a subset, variable-weight (300–400) build of
  [IBM Plex Sans](https://github.com/IBM/plex), used for utility and UI text.
  Source project and full license text:
  https://github.com/IBM/plex/blob/master/LICENSE.txt

- **vazirmatn-arabic.woff2** — a subset of the Arabic-script range of
  [Vazirmatn](https://github.com/rastikerdar/vazirmatn), used to render the
  Farsi concept cards. Source project and full license text:
  https://github.com/rastikerdar/vazirmatn/blob/master/OFL.txt

- **chess-glyphs.woff2** — a small subset of [DejaVu Sans](https://dejavu-fonts.github.io/)
  covering only the Unicode chess piece glyphs used on puzzle cards, kept as
  a dedicated bundled font instead of relying on whatever chess glyph
  coverage (if any) the TV's system fonts happen to have. DejaVu Sans is
  itself derived from Bitstream Vera Sans; it is distributed under the
  [Bitstream Vera License](https://dejavu-fonts.github.io/License.html) with
  public-domain additions contributed by the DejaVu project, both of which
  permit embedding, modification, and redistribution, including as a subset.

All four licenses permit embedding a subset or modified build inside an
application, which is what this project does — none require the application
itself to be open source.
