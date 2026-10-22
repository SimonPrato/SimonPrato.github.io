# Project rules

## No em-dashes

Never use the em-dash (Unicode U+2014, HTML `&mdash;` or `&#8212;`) anywhere in this repository: page text, titles, READMEs, code comments, commit messages or generated content.

- Rephrase the sentence instead: split it into two sentences, or use a comma, colon, semicolon or parentheses.
- Page titles use a vertical bar: `<title>Project Name | Simon Prato</title>`.
- An empty value placeholder in the UI is a plain hyphen (`-`).

Check before committing; it must print nothing:

```bash
grep -rnP --exclude-dir=.git --exclude=CLAUDE.md '\x{2014}|&mdash;|&#8212;|\\u2014' .
```
