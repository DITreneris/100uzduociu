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
3. Įkelkite visą projekto turinį, įskaitant:
   - `index.html`
   - `assets/`
   - `scripts/`
   - `.github/workflows/deploy.yml`
   - `package.json`
   - `package-lock.json`
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
2. Source: GitHub Actions
3. Įsitikinkite, kad `.github/workflows/deploy.yml` yra repository
4. Kiekvienas push į `main` arba `master` paleis patikras ir publikavimą

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
├── assets/             # CSS, JS ir duomenų failai
├── scripts/            # Projekto patikros skriptai
├── .github/workflows/  # GitHub Pages publikavimo automatizacija
├── package.json        # Lokalaus paleidimo ir patikrų komandos
├── package-lock.json   # Užrakintos npm priklausomybės
├── README.md           # Projekto aprašymas
├── LICENSE             # MIT licencija
└── .gitignore          # Git ignoravimo failas
```

## Failai, kurių NEREIKIA įkelti

Šie failai nėra būtini publikavimui, jei norite įkelti tik švarią statinę svetainę:

- `index_old.html` - sena versija
- `index_02.html` - tarpinė versija
- `index-enhanced.html` - alternatyvi sugeneruota versija
- `migrated-prompts.html` - migracijos rezultatas
- `*_IVERTINIMAS.md` failai - vidiniai vertinimai
- `01_concept.txt` - koncepcijos pastabos

Nepamirškite įkelti `assets/`, nes ten yra pagrindiniai CSS ir JavaScript failai.
