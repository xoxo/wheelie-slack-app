const Team = require('../../models/team')
const Group = require('../../models/group')
const slack = require('slack')
const bluebird = require('bluebird')
const chat = bluebird.promisifyAll(slack.chat)

module.exports.handler = (data) => {
  return Team.get(data.team.id).then(team => {
    const token = team.bot.bot_access_token
    return Group.get(team).then(chans => {
      const channelId = data.actions[0].value
      if (!channelId) {
        return {
          text: 'A channel is required. Use `/list-private` to see a list of available private channels.'
        }
      }
      const channel = chans.find(g => g.id === channelId)
      if (!channel) {
        return {
          text: 'Bad channel id'
        }
      }
      return chat.postMessageAsync({
        token,
        channel: channel.id,
        text: `Invite request from <@${data.user.id}>! Run the following command to accept - anyone here can do this:\n\`/invite <@${data.user.id}>\``
      }).then(() => ({
        replace_original: true,
        text: `Invite request sent to #${channel.name}. Please wait while the request is processed.\n\nRemember that locked, private identity channels have a strong expectation of privacy - what is said in there stays there. Also, please check the topic and pinned items once you’re in!\n\nThe XOXO Code of Conduct still fully applies in these spaces, so if you need any assistance, feel free to contact a moderator.`
      }))
    })
  })
}
