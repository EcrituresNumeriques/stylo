import '@fontsource-variable/atkinson-hyperlegible-next'
import '@fontsource-variable/jetbrains-mono'
import '@fontsource-variable/lexend'
// pas de version variable : une graisse par fichier
import '@fontsource/opendyslexic/400.css'
import '@fontsource/opendyslexic/400-italic.css'
import '@fontsource/opendyslexic/700.css'

/**
 * Polices proposées dans la palette de commandes de l'éditeur. Inter est
 * chargée par styles/general.scss ; le navigateur ne télécharge une police
 * que lorsqu'elle est utilisée.
 * @typedef {{ id: string, label: string, family: string }} EditorFont
 * @type {EditorFont[]}
 */
export const editorFonts = [
  { id: 'inter', label: 'Inter', family: 'Inter, sans-serif' },
  {
    id: 'atkinson',
    label: 'Atkinson Hyperlegible',
    family: "'Atkinson Hyperlegible Next Variable', sans-serif",
  },
  { id: 'lexend', label: 'Lexend', family: "'Lexend Variable', sans-serif" },
  {
    id: 'opendyslexic',
    label: 'OpenDyslexic',
    family: 'OpenDyslexic, sans-serif',
  },
  {
    id: 'jetbrains-mono',
    label: 'JetBrains Mono',
    family: "'JetBrains Mono Variable', monospace",
  },
]

/**
 * @param {string} [id]
 * @returns {EditorFont} la police demandée, Inter sinon
 */
export const findEditorFont = (id) =>
  editorFonts.find((font) => font.id === id) ?? editorFonts[0]
