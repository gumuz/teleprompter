import * as vscode from 'vscode';


class Teleprompter {
	//TODO: this only works when using tabs for indentation
	skip = ['\t'];
	//TODO: make these configurable
	shortDelayMin = 10;
	shortDelayMax = 80;
	longDelayMin = 100;
	longDelayMax = 180;

	text: string;

	constructor(text: string) {
		this.text = text;
	}

	async delay(char: string) {
		let min, max;
		//TODO: we wanna pause slightly longer with non-alphanums to seem more human
		if (char.charCodeAt(0) < 47) {
			min = this.longDelayMin;
			max = this.longDelayMax;
		} else {
			min = this.shortDelayMin;
			max = this.shortDelayMax;
		}
		const delay = min + ((max - min) * Math.random());
		await new Promise((resolve) => setTimeout(resolve, delay));
	}

	run() {
		let index = 0;

		return async () => {
			while (this.skip.indexOf(this.text[index]) >= 0) index++;
			if (index === this.text.length) return;
			await this.delay(this.text[index]);
			return this.text[index++];
		};
	}
}


export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('teleprompter.start', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;
		const text = editor.document.getText(editor.selection);

		const next = new Teleprompter(text).run();

		let char;
		while (char = await next()) {
			// simulate key presses
			await vscode.commands.executeCommand('default:type', { text: char });
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
