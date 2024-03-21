const vscode = require('vscode');
const Compiler = require('./compiler.js');

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

    Compiler.interpret(vscode, filePath);
  });

  context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
  activate,
  deactivate
}
