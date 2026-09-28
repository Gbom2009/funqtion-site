# unlist/vault

The encrypted store. Everything here is public — and useless without the
password.

| file | what it is |
|---|---|
| `index.json` | the KDF salt (public by design) plus the **encrypted** page list |
| `<id>.enc` | one page, AES-GCM ciphertext |

The page list is encrypted too, so the titles of your unlisted pages are not
readable from here either. That list is also what makes `/unlist/` dynamic:
it renders whatever the manifest says exists.

Do not hand-edit these. Use `../add.html`, which decrypts, changes and
re-encrypts in your browser, then hands you the files to drop back in here.

Removing a page takes two steps: remove it in `add.html` (which rewrites
`index.json`), then delete its `.enc` here. The tool cannot delete files from
a repo it is only being served from.
