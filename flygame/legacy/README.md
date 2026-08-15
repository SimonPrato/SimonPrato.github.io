# The original

`index.html` here is Flygame v2.1 exactly as it was first written — one file,
1,477 lines, everything inside a single `<script>` tag. It is kept because it is
the point of the project, and it still runs:

```sh
python3 -m http.server 8000   # from the repository root
# then open http://localhost:8000/legacy/
```

The only change is asset paths, updated so this copy keeps working after the
files were reorganised (`./img/` → `../img/`, and the sound files moved into
`../audio/` with readable names). The game logic is untouched, wrapping timer
maths and all.

The current version is in [`../index.html`](../index.html) and [`../src/`](../src).
