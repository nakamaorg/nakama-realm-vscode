const fs = require('fs');
const path = require('path');
const LangKama = require('@nakamaorg/langkama/@nakamaorg/langkama.umd.cjs');

module.exports = {

  /**
   * @description
   * Execution time
   */
  startTime: process.hrtime(),

  /**
  * @description
  * Kick starts LangKama compilation for a file
  *
  * @param {vscode} vscode The VSCode instance
  * @param {string} filePath  The path to the LangKama source file
  */
  interpret: function (vscode, filePath) {
    try {
      const outputChannel = vscode.window.createOutputChannel("LangKama");
      outputChannel.show(true);

      this.startTime = process.hrtime();
      this.logInfo(outputChannel, `--- LangKama v${LangKama.version} Interpreter ---`, false);

      const fullPath = path.resolve(filePath);
      if (!fs.existsSync(fullPath)) {
        throw new UnknownFileError(fullPath);
      }

      const fileStats = fs.statSync(fullPath);
      const fileName = path.basename(fullPath);

      if (path.extname(fullPath) !== '.nkm' || fileStats.isDirectory()) {
        throw new InvalidFileError(fileName);
      }

      this.logInfo(outputChannel, `Loading "${fileName}" script...`);

      const bytes = fs.readFileSync(fullPath);
      const code = bytes.toString();
      const compiler = new LangKama.LangKama();

      compiler
        .on(LangKama.LangKamaEvent.Success, result => {
          this.alertInfo(vscode, 'LangKama script compiled!');
          this.logInfo(outputChannel, 'LangKama script compiled!\n');
          this.logInfo(outputChannel, JSON.stringify(result.value, null, 2));
        })
        .on(LangKama.LangKamaEvent.Error, error => {
          this.logError(outputChannel, error);
          this.alertError(vscode, 'LangKama script could not compile!');
        })
        .on(LangKama.LangKamaEvent.Stdout, stdout => this.logInfo(outputChannel, stdout))
        .on(LangKama.LangKamaEvent.Lexer, () => this.logInfo(outputChannel, `Tokenizing "${fileName}" script...`))
        .on(LangKama.LangKamaEvent.Parser, tokens => this.logInfo(outputChannel, `Parsing "${tokens.length}" tokens...`))
        .on(LangKama.LangKamaEvent.Interpreter, ast => this.logInfo(outputChannel, `Interpreting "${fileName}" script...`))
        .interpret(code);
    } catch (err) {
      this.logError(outputChannel, err);
    }
  },

  /**
   * @description
   * Logs text to the output channel stream
   *
   * @param {outputChannel} outputChannel The output channel
   * @param {string} text The text to log
   * @param {boolean} time Whether to include the execution time or not
   */
  logInfo: function (outputChannel, text, time = true) {
    if (time) {
      const elapsed = process.hrtime(this.startTime);
      const elapsedSeconds = elapsed[0] + elapsed[1] / 1e9;
      const elapsedSecondslabel = `[${elapsedSeconds.toFixed(5)}s]`;

      outputChannel.appendLine(`${elapsedSecondslabel} ${text}`);
    } else {
      outputChannel.appendLine(text);
    }
  },

  /**
   * @description
   * Logs error to the output channel stream
   *
   * @param {outputChannel} outputChannel The output channel
   * @param {LangKamaError} error The error to log
   */
  logError: function (outputChannel, error) {
    const elapsed = process.hrtime(this.startTime);
    const elapsedSeconds = elapsed[0] + elapsed[1] / 1e9;

    message = [
      `[${elapsedSeconds.toFixed(5)}s] LangKama Error \n`,
      `${error.toString()}\n`
    ];

    outputChannel.appendLine(message.join('\n'));
  },

  /**
   * @description
   * Alerts an info message
   *
   * @param {vscode} vscode The VSCode instance
   * @param {message} message The message to alert
   */
  alertInfo: function (vscode, message) {
    vscode.window.showInformationMessage(message);
  },

  /**
   * @description
   * Alerts an error message
   *
   * @param {vscode} vscode The VSCode instance
   * @param {message} message The message to alert
   */
  alertError: function (vscode, message) {
    vscode.window.showErrorMessage(message);
  }
};