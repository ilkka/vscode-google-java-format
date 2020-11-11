// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as cp from "child_process";

const documentFilter: vscode.DocumentFilter = {
  language: "java",
  scheme: "file",
};

const outputChannel = vscode.window.createOutputChannel("google-java-format");

class GoogleJavaFormatProvider
  implements vscode.DocumentRangeFormattingEditProvider {
  provideDocumentRangeFormattingEdits(
    document: vscode.TextDocument,
    range: vscode.Range,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.TextEdit[]> {
    const executablePath = vscode.workspace
      .getConfiguration("google-java-format")
      .get<string>("executable-path");

    if (executablePath === undefined) {
      vscode.window.showErrorMessage(
        "google-java-format.executable-path not defined"
      );
      return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
      let stdout = "";
      let stderr = "";
      let child = cp.spawn(executablePath, [
        "--lines",
        `${range.start.line}:${range.end.line}`,
        document.fileName,
      ]);
      child.stdout.on("data", (chunk) => (stdout += chunk));
      child.stderr.on("data", (chunk) => (stderr += chunk));
      child.on("error", (err) => {
        vscode.window.showErrorMessage(
          `Could not run google-java-format: ${err}`
        );
        return reject(err);
      });
      child.on("close", (retcode) => {
        if (stderr.length > 0) {
          outputChannel.show();
          outputChannel.clear();
          outputChannel.appendLine(stderr);
          return reject("Failed to format file");
        }

        if (retcode !== 0) {
          return reject("Failed to format file");
        }

        return resolve([
          new vscode.TextEdit(
            new vscode.Range(0, 0, document.lineCount + 1, 0),
            stdout
          ),
        ]);
      });
    });
  }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerDocumentRangeFormattingEditProvider(
      documentFilter,
      new GoogleJavaFormatProvider()
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
