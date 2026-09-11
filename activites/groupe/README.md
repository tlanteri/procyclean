# Les parcours solo en séance de groupe

Le catalogue crée maintenant des séances `solo-group-v1` pour les 13 activités.
Chaque appareil représente une personne ou une petite équipe. L’éducateur lance
les parcours, peut les suspendre, puis affiche les réponses et révèle les
éléments de correction pour animer la mise en commun. Les corrections
individuelles du parcours restent disponibles pendant l’exercice.

Les anciennes séances utilisent toujours leurs routes et leurs interfaces
initiales. Le champ `groupVersion` distingue les deux fonctionnements.

## Réutilisation des exercices

`participant.html` charge la page solo dans un cadre intégré. `bridge.js` est
inactif hors de ce contexte : le solo conserve son fonctionnement et ses
sauvegardes. En séance, chaque script expose un adaptateur `snapshot/restore`
et transmet des réponses lisibles avec `ProcycleanGroup.record`.

Les réponses et le point de reprise sont enregistrés sous
`sessions/{code}/participants/{uid}/groupReport`. La copie locale de secours
est séparée par code de séance et identifiant participant. Elle ne remplace
jamais les sauvegardes solo. Selon l’exercice, la reprise revient au dernier
écran ou à la prochaine étape après la réponse validée ; un choix non validé
peut devoir être ressaisi.

Les résultats collectifs sont regroupés par question et par réponse. Les
classements de valeurs et les règles proposées restent des supports de
discussion, sans bonne réponse imposée.

## Vérification

Sur Windows, avec Node.js et Microsoft Edge installés :

```powershell
node activites/groupe/tests/run.mjs
```

Le serveur de test remplace les imports Firebase par un transport local. Les
tests parcourent les 13 activités jusqu’à leur fin, vérifient les réponses et
la reprise, simulent une séance éducateur/participant et exécutent cinq tests
solo existants. Ils n’écrivent pas dans le projet Firebase.

La configuration des règles Firebase n’est pas présente dans ce dépôt. Une
vérification sur le projet déployé reste nécessaire pour confirmer que les
règles acceptent les trois nouveaux identifiants d’activité, `groupVersion`,
`groupReport` et les états `activity`, `paused`, `review` et `final`. Les droits
attendus restent ceux du site : un éducateur pilote sa séance et un participant
enregistre ses propres réponses. Aucune règle distante n’est modifiée ici.
