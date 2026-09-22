WILDLIFE FIELD JOURNAL V2
==========================

This is V2 of your Wildlife Field Journal website.

WHAT CHANGED
------------
- Naturalist / field-journal visual design
- Cream paper background, forest-green header, brown naturalist accents
- Cleaner species records with taxonomy and field-note sections
- Search across common name, scientific name, family, genus, group, and habitat
- Group browsing
- Random animal button
- Easy "Add Species" form — no coding a new HTML page for each animal
- Existing V1 localStorage key is preserved: wildlifeExplorerAnimals

IMPORTANT
---------
V2 still uses browser localStorage. That means species you add through the form are saved in the browser you're using, not in the GitHub repository.

This is intentional for this step. The next major upgrade should replace localStorage with a real database/backend so the collection can scale toward 70,000+ species and work across devices.

GITHUB PAGES UPDATE
-------------------
1. Unzip this folder.
2. Open your existing wildlife-explorer GitHub repository.
3. Choose Add file -> Upload files.
4. Drag the V2 files into the upload area.
5. Commit the changes.
6. GitHub Pages will rebuild the site.
7. Refresh your live site.

Replace the existing files with these V2 files:
- index.html
- animals.html
- animal.html
- add-animal.html
- styles.css
- app.js
- README.txt

Do NOT upload the ZIP itself as the website files.

DATA SAFETY
-----------
Because the same localStorage key is used as V1, species already added through the V1 Add Animal page should remain in the same browser when you update the website.

For the eventual 70,000+ species version, use a real database and bulk import rather than manually entering every species through this form.
