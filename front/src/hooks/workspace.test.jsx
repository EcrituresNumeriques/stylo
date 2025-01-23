import { fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, test } from 'vitest'
import { renderWithProviders } from '../../tests/setup.js'
import { useWorkspaceMembersActions } from './workspace.js'

describe('Workspace', () => {
  test('invite member', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () =>
        new Promise((resolve) =>
          resolve({
            data: {
              workspace: {
                members: [{ name: 'Guillaume' }],
              },
            },
          })
        ),
    })
    const Component = () => {
      const { isLoading, error, removeMember, members, inviteMember } =
        useWorkspaceMembersActions('123')

      if (isLoading || error) {
        return <></>
      }
      return (
        <div>
          <ul>
            {members?.map((m) => (
              <li key={m.name}>{m.name}</li>
            ))}
          </ul>
          <button
            data-testid="invite-member"
            onClick={() =>
              inviteMember({
                name: 'Thomas',
              })
            }
          ></button>
          <button
            data-testid="remove-member"
            onClick={() => removeMember({})}
          ></button>
        </div>
      )
    }
    renderWithProviders(<Component />, {})
    const inviteMemberButton = await screen.findByTestId('invite-member')
    fireEvent.click(inviteMemberButton)
    expect(fetch).toHaveBeenLastCalledWith(
      undefined,
      expect.objectContaining({
        body: expect.stringMatching(/"query":"mutation inviteMember\(/),
      })
    )
  })
})
