import { config } from '~/src/config/index.js'
import { sendSnsMessage } from '~/src/helpers/sns/send-sns-message.js'

function generateSlackMessage({
  slackChannel,
  workflowName,
  repo,
  workflowUrl,
  runNumber,
  commitMessage,
  author
}) {
  return {
    channel: slackChannel,
    attachments: [
      {
        color: '#f03f36',
        blocks: [
          {
            type: 'context',
            elements: [
              {
                type: 'image',
                image_url:
                  'https://www.iconfinder.com/icons/298822/download/png/512',
                alt_text: 'GitHub'
              },
              {
                type: 'mrkdwn',
                text: '*Failed GitHub Action*'
              }
            ]
          },
          {
            type: 'rich_text',
            elements: [
              {
                type: 'rich_text_section',
                elements: [
                  {
                    type: 'text',
                    text: `${repo} - '${workflowName}' failed`,
                    style: {
                      bold: true
                    }
                  }
                ]
              }
            ]
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `*Failed Workflow:* <${workflowUrl}|${runNumber}>`
              }
            ]
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `*Commit Message:* '${commitMessage}'\n*Author:* ${author}`
              }
            ]
          }
        ]
      }
    ]
  }
}

const failedConclusions = new Set([
  'action_required',
  'failure',
  'stale',
  'timed_out',
  'startup_failure'
])

function shouldSendAlert(event) {
  const action = event.action
  const {
    head_branch: headBranch,
    conclusion,
    name: workflowName
  } = event.workflow_run
  const repoName = event.repository?.name
  const cdpTfSvcInfra = config.get('github.repos.cdpTfSvcInfra')

  const infraDevTfSvcInfraRun =
    repoName === cdpTfSvcInfra &&
    workflowName.toLocaleLowerCase().includes('infra-dev')

  return (
    headBranch === 'main' &&
    action === 'completed' &&
    failedConclusions.has(conclusion) &&
    !infraDevTfSvcInfraRun
  )
}

async function workflowRunNotificationHandler(server, event) {
  const { name: repo, html_url: repoUrl } = event.repository
  const {
    name: workflowName,
    html_url: workflowUrl,
    run_number: runNumber,
    head_commit: headCommit,
    conclusion
  } = event.workflow_run

  const commitMessage = headCommit.message
  const author = headCommit.author.name

  const slackChannel = config.get('platformAlertSlackChannel')
  const sendFailedActionNotification = config.get(
    'sendFailedActionNotification'
  )

  const ActionFailed = shouldSendAlert(event)

  if (ActionFailed) {
    server.logger.info(
      `Notification handler: '${workflowName}' in ${repo} failed: ${workflowUrl} with status '${conclusion}'`
    )
    if (sendFailedActionNotification) {
      server.logger.info(
        `Notification handler: Sending notification to ${slackChannel}`
      )

      const message = generateSlackMessage({
        slackChannel,
        workflowName,
        repo,
        repoUrl,
        workflowUrl,
        runNumber,
        commitMessage,
        author
      })

      const topic = config.get('snsCdpNotificationArn')
      const environment = config.get('environment')
      await sendSnsMessage({
        snsClient: server.snsClient,
        topic,
        message: {
          team: 'platform',
          slack_channel: slackChannel,
          message
        },
        logger: server.logger,
        environment
      })
    } else {
      server.logger.info(`Notification handler: Not sending sns message`)
    }
  }
}

export { workflowRunNotificationHandler }
