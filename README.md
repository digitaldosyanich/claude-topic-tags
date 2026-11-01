# topic-tags

Colored topic chips for the Claude Code chat.

<img width="945" height="510" alt="image" src="https://github.com/user-attachments/assets/d6f366b5-02e7-4994-9a53-af41c69229e3" />


When several lines of work run in one chat, it helps if Claude opens each block of a reply with a topic tag, like **`#nodes`** or **`#viewport`**. The chat draws such tags as grey code text. This mod draws them as chips, each topic in its own color, so you can follow one topic through a long chat by eye.

- A tag counts when it opens a line, written as bold code: `` **`#nodes`** ``.
- The tag is drawn as a chip on its own line; the block's text follows beneath it as usual.
- A tag in the middle of a sentence or inside a code block is left alone, and so is a reply with no tags.
- Each tag keeps one color, picked from its name. You can set your own colors (below).

Works in the Claude Code terminal and in the Code tab of the Claude desktop app.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install topic-tags --marketplace digitaldosyanich/claude-topic-tags
```

Answer `y` to add the marketplace, then pick a scope (the user scope makes it work in every session).

From a shell:

```bash
claude plugin install topic-tags --marketplace digitaldosyanich/claude-topic-tags
```

In the desktop app: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `digitaldosyanich/claude-topic-tags`, then **Add plugin**.

## Getting Claude to write tags

The mod only draws the tags; Claude has to write them. Add a line like this to your `CLAUDE.md`:

```
Start each block of a reply that is about one topic with its tag in bold code, e.g. **`#nodes`**. One topic per block. Tags so far: #nodes, #viewport, #process.
```

## Your own colors

The plugin has one setting, **Tag colors**: a list of `tag=#hex` pairs separated by commas, for example

```
nodes=#3B82F6, viewport=#EAB308, process=#F97316
```

A tag not in the list gets a steady color picked from its name. Light chips get dark letters, dark chips white ones. Change it in `/config` in a terminal session, or under `pluginConfigs` in `~/.claude/settings.json`.

## License

MIT
