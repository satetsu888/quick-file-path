import * as vscode from 'vscode';
import * as path from 'path';

function isMultiRootWorkspace(): boolean {
  return (vscode.workspace.workspaceFolders?.length ?? 0) > 1;
}

function getWorkspaceRootPath(): string | undefined {
  if (vscode.workspace.workspaceFile && vscode.workspace.workspaceFile.scheme === 'file') {
    return path.dirname(vscode.workspace.workspaceFile.fsPath);
  }
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

function getRelativePath(uri: vscode.Uri): string {
  if (isMultiRootWorkspace()) {
    const rootPath = getWorkspaceRootPath();
    if (rootPath) {
      return path.relative(rootPath, uri.fsPath);
    }
  }
  return vscode.workspace.asRelativePath(uri, false);
}

function formatPath(filePath: string): string {
  const config = vscode.workspace.getConfiguration('quickFilePath');
  const addSpaces = config.get<boolean>('addSurroundingSpaces', true);
  const addAt = config.get<boolean>('addAtPrefix', false);

  let result = filePath;
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

      const relativePath = getRelativePath(editor.document.uri);
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

      // 組み込みコマンドでクリップボードに絶対パスをコピー
      // copyRelativeFilePath だとマルチルートワークスペースで曖昧さが生じるため絶対パスを使う
      await vscode.commands.executeCommand('copyFilePath');

      // クリップボードからパスを取得
      const absolutePath = await vscode.env.clipboard.readText();

      if (!absolutePath) {
        vscode.window.showWarningMessage('Failed to get file path');
        return;
      }

      const rootPath = getWorkspaceRootPath();
      const relativePath = rootPath ? path.relative(rootPath, absolutePath) : absolutePath;

      terminal.sendText(formatPath(relativePath), false);
      terminal.show();
    }
  );

  const sendSelectedText = vscode.commands.registerCommand(
    'quickFilePath.sendSelectedText',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      const selection = editor.selection;
      if (selection.isEmpty) {
        vscode.window.showWarningMessage('No text selected');
        return;
      }

      const terminal = vscode.window.activeTerminal;
      if (!terminal) {
        vscode.window.showWarningMessage('No active terminal');
        return;
      }

      const relativePath = getRelativePath(editor.document.uri);
      const startLine = selection.start.line + 1; // 1-based line number
      const endLine = selection.end.line + 1;
      const lineInfo = startLine === endLine ? `L${startLine}` : `L${startLine}-L${endLine}`;

      const selectedText = editor.document.getText(selection);
      const textToSend = `${relativePath}:${lineInfo}\n${selectedText}`;
      terminal.sendText(textToSend, false);
      terminal.show();
    }
  );

  context.subscriptions.push(sendActiveFilePath, sendSelectedFilePath, sendSelectedText);
}

export function deactivate() {}
