# Aperçus des pages de fin

Les 13 documents de `pages/` sont des rendus HTML des parcours terminés avec
des réponses fictives. Ils utilisent les styles et images des activités mais
n’exécutent aucun script et ne contactent pas Firebase. La galerie propose
aussi un lien direct vers chaque document.

Pour régénérer les pages à partir des parcours actuels :

```powershell
node activites/groupe/tests/run.mjs --export-final-pages
```

Pour vérifier les 13 aperçus avec les scripts des cadres désactivés :

```powershell
node activites/groupe/tests/run.mjs --preview-only
```

Publier le dossier `pages/` avec la galerie ; ses liens relatifs nécessitent
également les dossiers des activités et les ressources du site.
