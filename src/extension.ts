import * as vscode from 'vscode';
import { CliViewProvider } from './cliViewProvider';
import { createAntigravityTerminal } from './terminal';

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "antigravity-cli-live" is now active.');

	// Register Command: Editor Tab
	const launchCLIEditorCommand = vscode.commands.registerCommand(
		'antigravity-cli-live.launchCLIEditor',
		() => createAntigravityTerminal('editor')
	);
	context.subscriptions.push(launchCLIEditorCommand);

	// Register Command: Bottom Panel
	const launchCLIBottomCommand = vscode.commands.registerCommand(
		'antigravity-cli-live.launchCLIBottom',
		() => createAntigravityTerminal('bottom')
	);
	context.subscriptions.push(launchCLIBottomCommand);

	// Register Sidebar Webview View Provider
	const provider = new CliViewProvider(context.extensionUri, context);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(CliViewProvider.viewType, provider)
	);
}

export function deactivate() {}
