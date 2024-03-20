const path = require('path');
const vscode = require('vscode');
const { exec } = require('child_process');

function activate(context) {
  const runButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  runButton.text = "$(play) Run";
  runButton.command = "langkama.run";
  runButton.tooltip = "Run LangKama script";

  context.subscriptions.push(runButton);

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor && editor.document.languageId === 'nkm' && editor.document.fileName.endsWith('.nkm')) {
      runButton.show();
    } else {
      runButton.hide();
    }
  });

  let disposable = vscode.commands.registerCommand('langkama.run', function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const filePath = editor.document.fileName;

    if (!filePath.endsWith('.nkm')) {
      vscode.window.showErrorMessage("A valid LangKama script must be opened");
      return;
    }

    const interpreterPath = path.join(context.extensionPath, 'langkama', 'bin', 'langkama.js');
    const command = `node ${interpreterPath} ${filePath}`;

    vscode.window.showInformationMessage("Running LangKama script...");

    exec(command, (err, stdout, stderr) => {
      const outputChannel = vscode.window.createOutputChannel("LangKama");
      outputChannel.show(true);

      if (err) {
        outputChannel.appendLine(err);
        vscode.window.showErrorMessage("LangKama script could not compile!");
        return;
      }

      outputChannel.appendLine(stdout);
      vscode.window.showInformationMessage("LangKama script was compiled successfully");

      if (stderr) {
        outputChannel.appendLine(stderr);
        vscode.window.showErrorMessage("LangKama script could not compile!");
      }
    });
  });

  context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
  activate,
  deactivate
}
