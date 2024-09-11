import * as vscode from "vscode";

export const showProgress = <T>(start: string, fn: () => Promise<T>, success: string) => vscode.window.withProgress(
  {
    location: vscode.ProgressLocation.Notification,
    title: start,
    cancellable: false,
  },
  async () => {
    try {
      await fn();

      vscode.window.showInformationMessage(
        success
      );
    } catch (error) {
      if (error instanceof Error) {
        vscode.window.showErrorMessage(
          `Error: ${error.message}`
        );
      }
    }
  }
);