import { expect, test } from 'claude-code/testing'
import { colorOf, lettersOn, parseColors } from './register'

const reply = (text: string, surface: 'terminal' | 'desktop') => ({
  plugin: 'topic-tags',
  component: 'AssistantMessage',
  requestId: 'msg-1',
  surface,
  props: { text, isFirstOfReply: true },
} as const)

test('a tag opening a block is drawn in its color, on both surfaces', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })
  const text = 'Intro line.\n\n**`#nodes`** The shake works.\n\n```\n**`#process`** inside a fence\n```\n\n**`#process`** Disks are fine.'
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount(reply(text, surface))
    const nodes = await ui.find({ type: 'Text', text: /#nodes/ })
    expect(nodes?.text).toBe(' #nodes ')
    const process = await ui.find({ type: 'Text', text: /#process/ })
    expect(process?.text).toBe(' #process ')
    expect(await ui.find({ type: 'Text', text: 'engine' })).toBeUndefined()
    await ui.unmount()
  }
})

test('a tag that opens a bold heading is drawn as a chip, the heading stays bold', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })
  const text = '**`#nodes`, card 17 P6:** DeepSeek hit its limit.\n\n**`#viewport`:** the Dome gets a switch.'
  const ui = await $.ui.mount(reply(text, 'desktop'))
  expect((await ui.find({ type: 'Text', text: /#nodes/ }))?.text).toBe(' #nodes ')
  expect((await ui.find({ type: 'Text', text: /#viewport/ }))?.text).toBe(' #viewport ')
  expect(await ui.find({ type: 'Text', text: 'engine' })).toBeUndefined()
  await ui.unmount()
})

test('a reply without tags is left to the engine', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })
  const ui = await $.ui.mount(reply('No tags here, `#nodes` inline only.', 'desktop'))
  expect((await ui.find({ type: 'Text' }))?.text).toBe('engine')
  await ui.unmount()
})

test('own colors win, other tags keep a steady color, letters read on the chip', async () => {
  const own = parseColors('nodes=#3B82F6, #viewport = #EAB308, broken=red')
  expect(own).toEqual({ nodes: '#3B82F6', viewport: '#EAB308' })
  expect(colorOf('Nodes', own)).toBe('#3B82F6')
  expect(colorOf('cooking', own)).toBe(colorOf('cooking', {}))
  expect(lettersOn('#EAB308')).toBe('#1F2937')
  expect(lettersOn('#3B82F6')).toBe('#FFFFFF')
})
