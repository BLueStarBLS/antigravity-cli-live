import * as vscode from 'vscode';
import { CliViewProvider } from './cliViewProvider';

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "antigravity-cli-live" is now active.');

	const launchTerminal = (target: 'editor' | 'bottom') => {
		const config = vscode.workspace.getConfiguration('antigravity-cli-live');
		const command = config.get<string>('cliCommand', 'agy .');
		
		const folders = vscode.workspace.workspaceFolders;
		const cwd = folders && folders.length > 0 ? folders[0].uri.fsPath : undefined;

		if (!cwd) {
			vscode.window.showErrorMessage('No active project folder found. Please open a project folder first.');
			return;
		}

		const terminalName = 'Antigravity CLI';
		let terminal = vscode.window.terminals.find(t => t.name === terminalName);
		
		if (terminal) {
			terminal.dispose();
		}

		const location = target === 'editor' ? vscode.TerminalLocation.Editor : vscode.TerminalLocation.Panel;
		
		terminal = vscode.window.createTerminal({
			name: terminalName,
			cwd: cwd,
			location: location
		});
		
		terminal.show();
		terminal.sendText(command);
	};

	// Register Command: Editor Tab
	const launchCLIEditorCommand = vscode.commands.registerCommand('antigravity-cli-live.launchCLIEditor', () => {
		launchTerminal('editor');
	});
	context.subscriptions.push(launchCLIEditorCommand);

	// Register Command: Bottom Panel
	const launchCLIBottomCommand = vscode.commands.registerCommand('antigravity-cli-live.launchCLIBottom', () => {
		launchTerminal('bottom');
	});
	context.subscriptions.push(launchCLIBottomCommand);

	// Register Sidebar Webview View Provider
	const provider = new CliViewProvider(context.extensionUri, context);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(CliViewProvider.viewType, provider)
	);
}

export function deactivate() {}
