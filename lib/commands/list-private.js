const Group = require('../models/group')

module.exports.command = 'list-private [filter] [--all]'
module.exports.desc = 'Lists all available private channels.'
module.exports.handler = listPrivate

function listPrivate (argv) {
  const filter = argv.filter ? new RegExp(argv.filter) : null
  argv.respond(Group.get(argv.team_id, filter).then(chans => (
    argv.all
    ? chans
    : chans.filter(c => !c.members.find(m => m === argv.user_id))
  )).then(chans => (
    (chans && chans.length)
    ? displayGroupList(filter, argv.user_id, chans)
    : {
      text: filter
      ? `No channels matching \`${filter}\``
      : `No private channels available`
    }
  )))
}

function formatChannel (chan, user) {
  const omitCount = chan.purpose.value && chan.purpose.value.match(/\[no\-count\]/g)
  const purpose = chan.purpose.value.replace(/\[[^\]]*\]/g, '')
  const userInChannel = chan.members.find(m => m === user)
  return {
    title: `#${chan.name} [${omitCount ? '?' : chan.members.length - 1}]`,
    text: purpose + (userInChannel ? (purpose ? '\n' : '') + '(Already Joined)' : ''),
    mrkdwn: true,
    callback_id: 'join-private',
    actions: !userInChannel && [{
      name: 'join',
      text: 'Join',
      type: 'button',
      value: chan.id
    }]
  }
}

function displayGroupList (filter, user, groups) {
  return {
      text: `These channels are locked, private identity channels to give marginalized folx a safe space. We don't police identities. If you request to join an identity channel that applies to you, we're not going to ask you to prove it - we just invite you. \n\nAvailable private channels: `,
    attachments: groups.map(g => formatChannel(g, user))
  }
}
