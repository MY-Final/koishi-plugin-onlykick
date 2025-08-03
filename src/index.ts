import { Context, Schema } from 'koishi'

export const name = 'onlykick'

export interface Config {
  // 是否加入群黑名单
  // 如果开启，踢出用户后会将其加入群黑名单，防止其再次入群
  // 如果关闭，踢出用户后不会将其加入群黑名单，用户可以再次入群
  // 注意：如果开启，可能会导致用户无法再次入群
  // 注意：如果关闭，可能会导致用户再次入群
  reject: boolean
}

export const Config: Schema<Config> = Schema.object({
  reject: Schema.boolean().default(true).description('是否加入群黑名单')
})

export function apply(ctx: Context, config: Config) {
  // 注册踢人指令
  ctx.command('kick @某人/QQ号码', '踢出群成员并加入黑名单', { authority: 3 })
  .action(async ({ session }, target) => {
    const reject = config.reject
    if (!session?.guildId) {
      return '该指令只能在群聊中使用。'
    }

    if (!target) {
      return '请指定要踢出的用户，例如：/kick @用户 或 /kick QQ号码'
    }

    let userId: string | undefined

    // 处理 @用户 的情况
    const atMatch = target.match(/<at id="(\d+)"\s*\/?>/)
    if (atMatch) {
      userId = atMatch[1]
    } else {
      const trimmed = target.trim()
      if (/^\d+$/.test(trimmed)) {
        userId = trimmed
      }
    }

    if (!userId) {
      return '无法识别用户，请使用@或输入正确的QQ号码。'
    }

    if (userId === session.bot.selfId) {
      return
    }

    try {
      await session.bot.kickGuildMember(session.guildId, userId, reject)
      return `已将用户 ${userId} 踢出并加入黑名单喵！`
    } catch (error) {
      return `踢出失败喵：${error.message}`
    }
  })
}
