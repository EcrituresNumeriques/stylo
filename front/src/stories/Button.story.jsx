import React from 'react'
import { Check, Copy } from 'lucide-react'
import Button from '../components/Button.jsx'

export default function ButtonStory() {
  return (
    <>
      <h2>Buttons</h2>
      <h4>Primary</h4>
      <Button primary={true}>Create New Article</Button>
      <h4>Secondary</h4>
      <Button>Manage Tags</Button>
      <h4>With Icon</h4>
      <Button>
        <Check /> Save
      </Button>
      <h4>Icon Only</h4>
      <Button icon={true}>
        <Copy />
      </Button>
    </>
  )
}
