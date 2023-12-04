const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposable = vscode.commands.registerCommand(
		'teamSwitch.generateBlock',
		() => {
			vscode.window
				.showInputBox({ prompt: 'Enter a name/title for the folder' })
				.then((name) => {
					if (!name) {
						vscode.window.showErrorMessage(
							'Name/title is required.'
						);
						return;
					}

					vscode.window
						.showInputBox({
							prompt: 'Enter the target directory',
							value: 'partials/blocks',
						})
						.then((targetDir) => {
							if (!targetDir) {
								vscode.window.showErrorMessage(
									'Target directory is required.'
								);
								return;
							}

							// Get the current active workspace folder
							const workspaceFolder =
								vscode.workspace.workspaceFolders[0]; // Assuming you want the first workspace folder

							if (!workspaceFolder) {
								vscode.window.showErrorMessage(
									'No workspace folder found.'
								);
								return;
							}

							// Construct the target directory path inside the workspace folder
							targetDir = path.join(
								workspaceFolder.uri.fsPath,
								targetDir
							);

							// Create the target directory if it doesn't exist
							if (!fs.existsSync(targetDir)) {
								fs.mkdirSync(targetDir, { recursive: true });
							}

							// Create a folder with the provided name in the target directory
							const folderPath = path.join(targetDir, name);
							fs.mkdirSync(folderPath);

							// Create the three required files with their contents
							fs.writeFileSync(
								path.join(folderPath, `_${name}.scss`),
								`section.${name} {}
								`
							);
							fs.writeFileSync(
								path.join(folderPath, `${name}.php`),
								`<?php
	?>
	
	<section class="${name}">
		<div class="wrapper">
	
		</div>
	</section>`
							);
							fs.writeFileSync(
								path.join(folderPath, 'block.json'),
								`{
	"name": "switch/${name}",
	"title": "${name}",
	"description": "All ${name} block",
	"category": "switch-blocks",
	"icon": "",
	"apiVersion": 2,
	"keywords": [
		"${name}",
		"switch"
	],
	"acf": {
		"mode": "preview",
		"postTypes": [],
		"renderTemplate": "${name}.php"
	},
	"render_callback": "my_block_render_callback",
	"supports": {
		"align": false,
		"anchor": false,
		"alignContent": false
	},
	"example": {
	}
}`
							);

							vscode.window.showInformationMessage(
								`Files created in ${folderPath}`
							);

							// Define the path to the style.scss file
							const styleFilePath = path.join(
								workspaceFolder.uri.fsPath,
								'scss',
								'style.scss'
							);
							const importStatement = `@import '../partials/blocks/${name}/${name}';\n`;

							// Read the existing content of style.scss
							fs.readFile(styleFilePath, 'utf8', (err, data) => {
								if (err) {
									vscode.window.showErrorMessage(
										`Error reading style.scss: ${err.message}`
									);
									return;
								}

								// Check if the import statement already exists
								if (data.includes(importStatement)) {
									vscode.window.showInformationMessage(
										'Import statement already exists.'
									);
									return;
								}

								// Append the import statement to style.scss
								fs.appendFile(
									styleFilePath,
									importStatement,
									(err) => {
										if (err) {
											vscode.window.showErrorMessage(
												`Error appending to style.scss: ${err.message}`
											);
											return;
										}

										vscode.window.showInformationMessage(
											`Import statement added to style.scss.`
										);
									}
								);
							});
						});
				});
		}
	);

	context.subscriptions.push(disposable);
}

exports.activate = activate;
