# Quick File Path

ファイルの相対パスを素早くターミナルに送信するVSCode拡張機能

## コマンド

| コマンド | 説明 |
| -------- | ---- |
| `quickFilePath.sendActiveFilePath` | アクティブエディタのファイルパスをターミナルに送信 |
| `quickFilePath.sendSelectedFilePath` | エクスプローラ/ソースコントロールで選択中のファイルパスをターミナルに送信 |
| `quickFilePath.sendSelectedText` | エディタで選択中のテキストをファイルパス・行番号付きでターミナルに送信（例: `src/file.ts:L10-L20`） |

## 技術的な制約

- `sendSelectedFilePath` はVSCode組み込みの `copyRelativeFilePath` コマンドを経由するため、クリップボードが上書きされる
- エクスプローラからキーボードショートカットで呼び出した場合、選択ファイルのURIは直接取得できないためこの方式を採用

## ビルド

```bash
npm install
npm run compile
npx vsce package
```

## ローカルインストール

```bash
code --install-extension quick-file-path-x.x.x.vsix
```

## リリース

VS Code Marketplaceへリリースする（GitHub Releasesではない）

```bash
git tag vX.X.X
git push origin main --tags
npx vsce publish
```
