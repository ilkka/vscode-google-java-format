/*
 * Copyright 2020 Ilkka Poutanen
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

    outputChannel.appendLine(
      `Formatting ${document.fileName} from ${range.start.line} to ${range.end.line}`
    );

    return new Promise((resolve, reject) => {
      let stdout = "";
      let stderr = "";
      let child = cp.spawn(executablePath, [
        "--lines",
        `${range.start.line}:${range.end.line}`,
        "-",
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
      child.stdin.write(document.getText(), (err) => {
        if (err) {
          outputChannel.appendLine(err.message);
        }
        child.stdin.end();
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
