import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('"fireship-ext" is now active!');

  const disposable = vscode.commands.registerCommand(
    "fireship-ext.hellonearth",
    () => {
      vscode.window.showInformationMessage("Welcome to Hell on Earth!");
      vscode.window.showErrorMessage("Welcome to Hell on Earth!");
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
