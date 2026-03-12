import { useWorkspaces } from '../../hooks/workspace.js'
import { Select } from '../atoms/index.js'
import { Alert, Loading } from './index.js'

export default function WorkspaceSelector({
  name = 'workspace',
  id = 'workspace',
  label,
  disabled = false,
}) {
  const { workspaces, error, isLoading } = useWorkspaces()
  if (isLoading) {
    return <Loading />
  }
  if (error) {
    return <Alert message={error.message} />
  }
  return (
    <Select name={name} id={id} label={label} disabled={disabled}>
      {workspaces.map((workspace) => (
        <option value={workspace._id} key={workspace._id}>
          {workspace.name}
        </option>
      ))}
    </Select>
  )
}
