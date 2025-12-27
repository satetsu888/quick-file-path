import * as vscode from 'vscode';

function formatPath(path: string): string {
  const config = vscode.workspace.getConfiguration('quickFilePath');
  const addSpaces = config.get<boolean>('addSurroundingSpaces', true);
  const addAt = config.get<boolean>('addAtPrefix', false);

  let result = path;
  if (addAt) {
    result = '@' + result;
  }
  if (addSpaces) {
    result = ' ' + result + ' ';
  }
  return result;
}

export function activate(context: vscode.ExtensionContext) {
  const sendActiveFilePath = vscode.commands.registerCommand(
    'quickFilePath.sendActiveFilePath',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      const terminal = vscode.window.activeTerminal;
      if (!terminal) {
        vscode.window.showWarningMessage('No active terminal');
        return;
      }

      const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
      terminal.sendText(formatPath(relativePath), false);
      terminal.show();
    }
  );

  const sendSelectedFilePath = vscode.commands.registerCommand(
    'quickFilePath.sendSelectedFilePath',
    async () => {
      const terminal = vscode.window.activeTerminal;
      if (!terminal) {
        vscode.window.showWarningMessage('No active terminal');
        return;
      }

      // 組み込みコマンドでクリップボードに相対パスをコピー
      await vscode.commands.executeCommand('copyRelativeFilePath');

      // クリップボードからパスを取得
      const relativePath = await vscode.env.clipboard.readText();

      if (!relativePath) {
        vscode.window.showWarningMessage('Failed to get file path');
        return;
      }

      terminal.sendText(formatPath(relativePath), false);
      terminal.show();
    }
  );

  context.subscriptions.push(sendActiveFilePath, sendSelectedFilePath);
}

export function deactivate() {}
