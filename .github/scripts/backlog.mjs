// Automatisations du projet GitHub « Backlog Stylo »
// https://github.com/orgs/EcrituresNumeriques/projects/7
//
// Cycle de vie d'une issue :
// En cours → (fusion de la PR) → À tester → (validation sur stylo-dev) → Validé → (mise en prod) → Fini·e
//
// Ces fonctions sont appelées par actions/github-script avec un jeton qui peut
// écrire dans le projet de l'organisation et dans les issues du dépôt.

const PROJECT_ID = 'PVT_kwDOAP6x084Ap1QC'
const STATUS_FIELD_ID = 'PVTSSF_lADOAP6x084Ap1QCzghLXjA'
const STATUS = {
  aTester: { id: '4a366894', name: 'À tester' },
  valide: { id: '047431e7', name: 'Validé' },
  fini: { id: '98236657', name: 'Fini·e' },
}

async function setStatus(github, itemId, status) {
  await github.graphql(
    `mutation ($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(input: {
        projectId: $projectId, itemId: $itemId, fieldId: $fieldId,
        value: { singleSelectOptionId: $optionId }
      }) { projectV2Item { id } }
    }`,
    {
      projectId: PROJECT_ID,
      itemId,
      fieldId: STATUS_FIELD_ID,
      optionId: status.id,
    }
  )
}

/**
 * À la fusion d'une PR, passe les issues qu'elle corrige (« Fixes #123 »)
 * en « À tester ». Les issues ne sont pas fermées.
 */
export async function markMergedIssuesToTest({ github, context, core }) {
  const pr = context.payload.pull_request
  if (!pr?.merged) {
    core.info(`La PR #${pr?.number} n'est pas fusionnée, rien à faire.`)
    return
  }

  const { repository } = await github.graphql(
    `query ($owner: String!, $repo: String!, $number: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $number) {
          closingIssuesReferences(first: 25) {
            nodes { id number state repository { nameWithOwner } }
          }
        }
      }
    }`,
    { owner: context.repo.owner, repo: context.repo.repo, number: pr.number }
  )

  const repoName = `${context.repo.owner}/${context.repo.repo}`
  const issues = repository.pullRequest.closingIssuesReferences.nodes.filter(
    (issue) => issue.repository.nameWithOwner === repoName
  )
  if (issues.length === 0) {
    core.info(`La PR #${pr.number} n'est liée à aucune issue.`)
    return
  }

  for (const issue of issues) {
    if (issue.state !== 'OPEN') {
      core.info(`#${issue.number} est fermée, on n'y touche pas.`)
      continue
    }
    // Renvoie l'élément existant si l'issue est déjà dans le projet.
    const { addProjectV2ItemById } = await github.graphql(
      `mutation ($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
          item { id }
        }
      }`,
      { projectId: PROJECT_ID, contentId: issue.id }
    )
    await setStatus(github, addProjectV2ItemById.item.id, STATUS.aTester)
    core.info(`#${issue.number} → ${STATUS.aTester.name}`)
  }
}

async function listProjectIssues(github) {
  const items = []
  let cursor = null
  do {
    const { node } = await github.graphql(
      `query ($projectId: ID!, $cursor: String) {
        node(id: $projectId) {
          ... on ProjectV2 {
            items(first: 100, after: $cursor) {
              pageInfo { hasNextPage endCursor }
              nodes {
                id
                status: fieldValueByName(name: "Status") {
                  ... on ProjectV2ItemFieldSingleSelectValue { optionId }
                }
                content {
                  ... on Issue {
                    number title url state
                    repository { nameWithOwner }
                    closedByPullRequestsReferences(first: 25) {
                      nodes { number merged mergeCommit { oid } }
                    }
                  }
                }
              }
            }
          }
        }
      }`,
      { projectId: PROJECT_ID, cursor }
    )
    items.push(...node.items.nodes)
    cursor = node.items.pageInfo.hasNextPage
      ? node.items.pageInfo.endCursor
      : null
  } while (cursor)
  return items.filter((item) => item.content?.number)
}

async function isIncludedIn(github, context, sha, ref) {
  try {
    const { data } = await github.rest.repos.compareCommitsWithBasehead({
      ...context.repo,
      basehead: `${sha}...${ref}`,
      per_page: 1,
    })
    return data.status === 'ahead' || data.status === 'identical'
  } catch (error) {
    if (error.status === 404) {
      return false
    }
    throw error
  }
}

async function closeIssue(github, context, issueNumber) {
  try {
    await github.rest.issues.update({
      ...context.repo,
      issue_number: issueNumber,
      state: 'closed',
      state_reason: 'completed',
    })
  } catch (error) {
    // « This issue was closed by another request » : déjà fermée, c'est ce qu'on veut.
    const alreadyClosed = error.response?.data?.errors?.some((e) =>
      e.message?.includes('closed by another request')
    )
    if (error.status !== 422 || !alreadyClosed) {
      throw error
    }
  }
}

function issueLink(issue) {
  return `[#${issue.number}](${issue.url}) ${issue.title}`
}

/**
 * Après une mise en production, passe en « Fini·e » et ferme les issues
 * « Validé » dont toutes les PR sont incluses dans la version déployée.
 * Signale aussi les issues encore « À tester » qui ont été déployées.
 */
export async function closeDeployedIssues({ github, context, core, version }) {
  const tag = `v${version}`
  const repoName = `${context.repo.owner}/${context.repo.repo}`
  const items = (await listProjectIssues(github)).filter(
    (item) => item.content.repository.nameWithOwner === repoName
  )

  const closed = []
  const withoutPullRequest = []
  const notYetDeployed = []
  const deployedWithoutValidation = []

  for (const item of items) {
    const issue = item.content
    const optionId = item.status?.optionId
    if (optionId !== STATUS.valide.id && optionId !== STATUS.aTester.id) {
      continue
    }

    const mergedPullRequests =
      issue.closedByPullRequestsReferences.nodes.filter(
        (pr) => pr.merged && pr.mergeCommit
      )
    const included = []
    for (const pr of mergedPullRequests) {
      included.push(
        await isIncludedIn(github, context, pr.mergeCommit.oid, tag)
      )
    }

    if (optionId === STATUS.aTester.id) {
      if (included.some(Boolean)) {
        deployedWithoutValidation.push(issue)
      }
      continue
    }

    if (mergedPullRequests.length === 0) {
      withoutPullRequest.push(issue)
      continue
    }
    if (!included.every(Boolean)) {
      notYetDeployed.push(issue)
      continue
    }

    if (issue.state === 'OPEN') {
      await github.rest.issues.createComment({
        ...context.repo,
        issue_number: issue.number,
        body: `Déployé en production avec la version [${version}](${context.serverUrl}/${repoName}/tree/${tag}).`,
      })
      await closeIssue(github, context, issue.number)
    }
    // Le projet ferme aussi les issues passées en « Fini·e » : on ferme
    // l'issue avant de changer le statut pour ne pas entrer en concurrence.
    await setStatus(github, item.id, STATUS.fini)
    closed.push(issue)
    core.info(`#${issue.number} → ${STATUS.fini.name}`)
  }

  const list = (issues) => issues.map((issue) => `- ${issueLink(issue)}`)
  const summary = core.summary.addHeading(
    `Backlog après la mise en production de ${tag}`,
    3
  )
  summary.addRaw(
    `\n**Passées en « ${STATUS.fini.name} » et fermées (${closed.length})**\n\n`
  )
  summary.addRaw(`${list(closed).join('\n') || '_Aucune_'}\n`)
  if (deployedWithoutValidation.length > 0) {
    core.warning(
      `${deployedWithoutValidation.length} issue(s) « ${STATUS.aTester.name} » déployée(s) en production sans validation.`
    )
    summary.addRaw(
      `\n**:warning: Déployées sans avoir été validées : encore « ${STATUS.aTester.name} » (${deployedWithoutValidation.length})**\n\n`
    )
    summary.addRaw(`${list(deployedWithoutValidation).join('\n')}\n`)
  }
  if (withoutPullRequest.length > 0) {
    summary.addRaw(
      `\n**« ${STATUS.valide.name} » sans PR fusionnée liée, à traiter à la main (${withoutPullRequest.length})**\n\n`
    )
    summary.addRaw(`${list(withoutPullRequest).join('\n')}\n`)
  }
  if (notYetDeployed.length > 0) {
    summary.addRaw(
      `\n**« ${STATUS.valide.name} » mais pas encore incluses dans ${tag} (${notYetDeployed.length})**\n\n`
    )
    summary.addRaw(`${list(notYetDeployed).join('\n')}\n`)
  }
  await summary.write()
}
