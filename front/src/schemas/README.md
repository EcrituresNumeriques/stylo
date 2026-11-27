# Formulaires construits à partir de schémas JSON

Nous utilisons la bibliothèque [react-jsonschema-form] pour construire des formulaires dans l'interface de Stylo.

## Fonctionnement

La bibliothèque combine un **schéma de données** _et_ un **schéma d'interface**.
Elle produit des données JSON à chaque modification de champ de formulaire.

Si c'était une fonction, elle s'écrirait comme ceci :

```javascript
const form = reactForm({ JSONSchema, UISchema })

form.on('submit', (formData) => {
  // ...
})
```

## Modifier et tester

Un [simulateur en ligne] offre un résultat visuel en temps réel.

- collez le contenu d'un fichier `*-metadata.schema.json` (par exemple `article-metadata.schema.json`) dans le champ `JSONSchema`
- collez le contenu du fichier `*-ui-schema.json` correspondant (par exemple `article-ui-schema.json`) dans le champ `UISchema`

[react-jsonschema-form]: https://rjsf-team.github.io/react-jsonschema-form/docs/
[simulateur en ligne]: https://rjsf-team.github.io/react-jsonschema-form/
