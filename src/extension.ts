import * as vscode from "vscode";
import ollama from "ollama";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "chat-deep-seek.start",
    () => {
      const panel = vscode.window.createWebviewPanel(
        "deepChat",
        "Deep Seek Chat",
        vscode.ViewColumn.One,
        { enableScripts: true }
      );
      panel.webview.html = getWebviewContent();

      let isStopped = false;
      panel.webview.onDidReceiveMessage(async (message: any) => {
        if (message.command === "chat") {
          const userPrompt = message.text;
          let responseText = "";

          try {
            const streamResponse = await ollama.chat({
              model: "deepseek-r1:14b", // set your model version here
              messages: [{ role: "user", content: userPrompt }],
              stream: true,
            });
            // goes through and processes the response
            for await (const part of streamResponse) {
              if ((isStopped == true)) {
                break;
              }
              responseText += part.message.content;
              panel.webview.postMessage({
                command: "chatResponse",
                text: responseText,
              });
            }
          } catch (err) {
            console.error(err);
            panel.webview.postMessage({
              command: "chatResponse",
              text: `Error: ${String(
                err
              )} occured while processing the request`,
            });
          }
        } else if (message.command === "stop") {
          isStopped = true;
          panel.webview.postMessage({ command: "stop" });
        }
      });
    }
  );
  context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
  return `
  <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Deep Seek Chat</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color:rgb(11, 10, 10);
            }
            .container {
                background: black;
                border-radius: 5px;
                padding: 20px;
                max-width: 400px;
                width: 100%;
            }
            textarea {
                width: 100%;
                padding: 10px;
                margin-bottom: 10px;
                resize: vertical;
                min-height: 50px;
            }
            button {
                background: #007bff;
                color: white;
                border: none;
                padding: 10px 20px;
                cursor: pointer;
                border-radius: 5px;
            }
            #stpTalking {
                background: #dc3545;
                color: white;
                border: none;
                padding: 10px 20px;
                cursor: pointer;
                border-radius: 5px;
            }
            #stpTalking:hover {
                background: #c82333;
            }
            button:hover {
                background: #0056b3;
            }
        </style>
    </head>
   <body>
    <div class="container">
        <h2>Deep Seek Chat</h2>
            <textarea id="prompt" placeholder="Type your message..."></textarea><br />
            <button id="askBtn">Ask</button>
            <button id="stpTalking">Stop</button>
        <div id="response"></div>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        document.getElementById('askBtn').addEventListener('click', () => {
            const text = document.getElementById('prompt').value;
            vscode.postMessage({
                command: 'chat',
                text
            });
        });
        document.getElementById('stpTalking').addEventListener('click', () => {
         const text = document.getElementById('prompt').value;
         vscode.postMessage({
            command: 'stop',
            text
         });
        });

        window.addEventListener('message', event => {
            const {command, text} = event.data;
            if(command === 'chatResponse') {
                document.getElementById('response').innerText = text;
            } else if(command === 'stop') {
              document.getElementById('response').innerText = 'Conversation stopped'
            }
        });

    </script>
    </body>
    </html>`;
}

export function deactivate() {}
