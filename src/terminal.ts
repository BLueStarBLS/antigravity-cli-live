import * as vscode from 'vscode';

export type TerminalTarget = 'editor' | 'bottom';

/**
 * Creates or recycles an "Antigravity CLI" terminal in the specified location,
 * sets its working directory to the first workspace folder, and runs the
 * configured CLI command.
 */
export function createAntigravityTerminal(target: TerminalTarget): void {
	const config = vscode.workspace.getConfiguration('antigravity-cli-live');
	const command = config.get<string>('cliCommand', 'agy .');

	const folders = vscode.workspace.workspaceFolders;
	const cwd = folders && folders.length > 0 ? folders[0].uri.fsPath : undefined;

	if (!cwd) {
		vscode.window.showErrorMessage(
			'No active project folder found. Please open a project folder first.'
		);
		return;
	}

	const terminalName = 'Antigravity CLI';
	const existing = vscode.window.terminals.find(t => t.name === terminalName);
	if (existing) {
		existing.dispose();
	}

	const location = target === 'editor'
		? vscode.TerminalLocation.Editor
		: vscode.TerminalLocation.Panel;

	const terminal = vscode.window.createTerminal({
		name: terminalName,
		cwd,
		location,
	});

	terminal.show();
	terminal.sendText(command);
}
