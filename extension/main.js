const vscode = require('vscode');
const { exec } = require('child_process');

function activate(context) {
  let disposable = vscode.commands.registerCommand('langkama.run', function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const filePath = editor.document.fileName;

    if (!filePath.endsWith('.nkm')) {
      vscode.window.showErrorMessage("A valid LangKama script must be opened");
      return;
    }

    const command = `my-custom-interpreter "${filePath}"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }

      const outputChannel = vscode.window.createOutputChannel("LangKama");

      outputChannel.show(true);
      outputChannel.appendLine(stdout);

      if (stderr) {
        outputChannel.appendLine(stderr);
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
