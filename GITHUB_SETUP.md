# GitHub publikavimo gidas

## Kaip publikuoti projektą GitHub Pages

### 1. Sukurkite GitHub repository

1. Eikite į GitHub.com
2. Spustelėkite "New repository"
3. Įveskite repository pavadinimą (pvz., `praktiniai-promptu-rinkinys`)
4. Pasirinkite Public
5. Spustelėkite "Create repository"

### 2. Įkelkite failus

#### Per GitHub web interface

1. Eikite į sukurtą repository
2. Spustelėkite "uploading an existing file"
3. Įkelkite failus:
   - `index.html`
   - `index_en.html`
   - `README.md`
   - `LICENSE`
4. Įveskite commit žinutę ir spustelėkite "Commit changes"

#### Per Git komandinę eilutę

```bash
cd [your-project-folder]
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/[username]/[repository-name].git
git branch -M main
git push -u origin main
```

### 3. Įjunkite GitHub Pages

1. Repository → Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main`, Folder: `/ (root)`
4. Spustelėkite "Save"

### 4. Svetainė bus prieinama per

```
https://[username].github.io/[repository-name]
```

## Atnaujinimų publikavimas

### Per GitHub web interface
1. Redaguokite failą
2. Spustelėkite "Commit changes"
3. GitHub Pages automatiškai atnaujins svetainę (1-5 min)

### Per Git
```bash
git add .
git commit -m "Updated: [describe changes]"
git push
```

## Rekomenduojami failai publikavimui

```
.
├── index.html          # Pagrindinė svetainė (LT)
├── index_en.html       # English version
├── README.md           # Projekto aprašymas
├── LICENSE             # MIT licencija
└── .gitignore          # Git ignoravimo failas
```

## Failai, kurių NEREIKIA įkelti

Šie failai skirti tik kūrimui ir neturėtų būti įkelti į GitHub:

- `index_old.html` - sena versija
- `*.js` failai (build/migrate skriptai)
- `migrated-prompts.html`
- `*_IVERTINIMAS.md` failai
- `01_concept.txt`
