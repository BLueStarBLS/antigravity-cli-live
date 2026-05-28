import * as vscode from 'vscode';

export class CliViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'antigravity-cli-live.sidebarView';
    private _view?: vscode.WebviewView;
    private _disposableConfiguration?: vscode.Disposable;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _context: vscode.ExtensionContext
    ) {
        // Listen for configuration changes
        this._disposableConfiguration = vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('antigravity-cli-live.cliCommand')) {
                this.updateWebview();
            }
        });
        _context.subscriptions.push(this._disposableConfiguration);
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Listen for messages from webview
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'runCommand': {
                    this._executeCommand(data.command, data.target);
                    break;
                }
                case 'sendToTerminal': {
                    this._sendToTerminal(data.command);
                    break;
                }
                case 'requestUpdate': {
                    this.updateWebview();
                    break;
                }
            }
        });

        this.updateWebview();
    }

    public updateWebview() {
        if (!this._view) {
            return;
        }
        const config = vscode.workspace.getConfiguration('antigravity-cli-live');
        const cliCommand = config.get<string>('cliCommand', 'agy .');

        this._view.webview.postMessage({
            type: 'update',
            cliCommand
        });
    }

    private _executeCommand(command: string, target: 'editor' | 'bottom') {
        const folders = vscode.workspace.workspaceFolders;
        const cwd = folders && folders.length > 0 ? folders[0].uri.fsPath : undefined;

        if (!cwd) {
            vscode.window.showErrorMessage('No active project folder found. Please open a project folder first.');
            return;
        }

        const terminalName = 'Antigravity CLI';
        
        // Find existing terminal or launch a new one
        let terminal = vscode.window.terminals.find(t => t.name === terminalName);
        
        // If terminal exists, we close it to launch a clean session in the selected layout location
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
    }

    private _sendToTerminal(command: string) {
        const terminalName = 'Antigravity CLI';
        const terminal = vscode.window.terminals.find(t => t.name === terminalName);
        if (terminal) {
            terminal.show();
            terminal.sendText(command);
        } else {
            vscode.window.showWarningMessage('Antigravity CLI is not running. Launch it first.');
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Antigravity CLI Live</title>
            <style>
                body {
                    padding: 16px;
                    color: var(--vscode-foreground);
                    font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
                    background-color: var(--vscode-sideBar-background);
                    margin: 0;
                    box-sizing: border-box;
                }
                
                /* Flat Container Block */
                .container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    border: 1px solid var(--vscode-panel-border, #e0e0e0);
                    border-radius: 4px;
                    padding: 16px;
                    background-color: var(--vscode-sideBar-background);
                }
                
                .logo-container {
                    margin-bottom: 12px;
                }
                
                h3 {
                    margin: 0 0 6px 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--vscode-foreground);
                }
                
                .subtitle {
                    font-size: 11px;
                    color: var(--vscode-descriptionForeground);
                    margin-bottom: 16px;
                    line-height: 1.4;
                }
                
                /* Action Button - Flat #007ACC style */
                .action-btn {
                    display: block;
                    width: 100%;
                    background-color: #007acc;
                    color: #ffffff;
                    border: none;
                    padding: 8px 12px;
                    font-size: 12px;
                    font-weight: 500;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-bottom: 8px;
                    text-align: center;
                    transition: background-color 0.15s ease;
                }
                
                .action-btn:hover {
                    background-color: #0062a3;
                }
                
                .action-btn:active {
                    background-color: #004d80;
                }
                
                .action-btn-secondary {
                    background-color: transparent;
                    color: #007acc;
                    border: 1px solid #007acc;
                }
                
                .action-btn-secondary:hover {
                    background-color: rgba(0, 122, 204, 0.1);
                }
                
                .action-btn-secondary:active {
                    background-color: rgba(0, 122, 204, 0.2);
                }

                /* Quick Commands */
                .shortcuts-title {
                    font-size: 11px;
                    color: var(--vscode-descriptionForeground);
                    margin-top: 16px;
                    margin-bottom: 8px;
                    text-align: left;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    width: 100%;
                }

                .quick-cmds {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    width: 100%;
                }

                .quick-cmds .action-btn {
                    margin-bottom: 0;
                    font-family: var(--vscode-editor-font-family, monospace);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo-container">
                    <!-- Inline SVG geometry from media/icon.svg -->
                    <svg width="40" height="40" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M7.26,6.75c.87,0,1.73-.03,2.59-.07-.88-2.94-1.4-6.13-3.66-6.13C2.76.56,3.35,7.93.59,10.61c-1,1,.08,1.26.75.75,2.6-1.76,2.43-4.86,4.86-4.86.41,0,.75.1,1.04.25,0,0,.01,0,.02,0Z" fill="#007acc"/>
                        <g>
                            <path d="M10.19,10.06h-1.67M6.85,8.63l1,.71-1,.71M5.52,10.29v-2.17c0-.32,0-.48.07-.6.06-.11.17-.19.29-.25.14-.06.33-.06.7-.06h3.87c.37,0,.56,0,.7.06.13.05.23.14.29.25.07.12.07.28.07.6v2.17c0,.32,0,.48-.07.6-.06.11-.17.2-.29.25-.14.06-.33.06-.7.06h-3.87c-.37,0-.56,0-.7-.06-.13-.05-.23-.14-.29-.25-.07-.12-.07-.28-.07-.6Z" stroke="#007acc" stroke-linecap="round" stroke-linejoin="round" stroke-width="0.5px" fill="none"/>
                        </g>
                    </svg>
                </div>
                <h3>Antigravity CLI</h3>
                <div class="subtitle">Quickly launch CLI in your project environment.</div>
                
                <button class="action-btn" id="btnEditor">Open Terminal in Editor Tab</button>
                <button class="action-btn action-btn-secondary" id="btnBottom">Open Terminal in Bottom Panel</button>
            </div>

            <div class="shortcuts-title">Quick Commands</div>
            <div class="quick-cmds">
                <button class="action-btn action-btn-secondary" data-send="/clear">/clear</button>
                <button class="action-btn action-btn-secondary" data-send="/config">/config</button>
                <button class="action-btn action-btn-secondary" data-send="/context">/context</button>
                <button class="action-btn action-btn-secondary" data-send="/model">/model</button>
                <button class="action-btn action-btn-secondary" data-send="/resume">/resume</button>
                <button class="action-btn action-btn-secondary" data-send="/usage">/usage</button>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                let currentCommand = 'agy .';

                // Ask for current config settings
                vscode.postMessage({ type: 'requestUpdate' });

                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.type === 'update') {
                        currentCommand = message.cliCommand || 'agy .';
                    }
                });

                document.getElementById('btnEditor').addEventListener('click', () => {
                    vscode.postMessage({ type: 'runCommand', command: currentCommand, target: 'editor' });
                });

                document.getElementById('btnBottom').addEventListener('click', () => {
                    vscode.postMessage({ type: 'runCommand', command: currentCommand, target: 'bottom' });
                });

                document.querySelectorAll('[data-send]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        vscode.postMessage({ type: 'sendToTerminal', command: btn.getAttribute('data-send') });
                    });
                });
            </script>
        </body>
        </html>`;
    }
}