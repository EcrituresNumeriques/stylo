import { Check, Copy } from 'lucide-react'

import { Button } from '../components/atoms/index.js'

export default function ButtonStory() {
  return (
    <>
      <h2>Boutons</h2>
      <h4>Primaire</h4>
      <Button primary={true}>Crée un article</Button>
      <h4>Secondaire</h4>
      <Button>Modifier les étiquettes</Button>
      <h4>Avec icônes</h4>
      <Button>
        <Check /> Enregistrer
      </Button>
      <h4>Icônes uniquement</h4>
      <Button icon={true}>
        <Copy />
      </Button>
    </>
  )
}
