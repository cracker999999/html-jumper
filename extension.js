// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "html-jumper" is now active!');

	let disposable = vscode.languages.registerDefinitionProvider(['html', 'xml'], {
        provideDefinition(document, position, token) {
            const line = document.lineAt(position);
            let clickMatch;

            if (document.languageId === 'xml') {
                clickMatch = line.text.match(/onclick="(\w+)(\(.*?\))?"/);
            }
            else
            {
                clickMatch = line.text.match(/@click="(\w+)(\(.*?\))?"/);
            }
                        
            if (clickMatch) {
                const functionName = clickMatch[1];
				// console.log(functionName);
                // const jsFiles = findJsFiles(path.dirname(document.fileName));
                const jsFiles = findFiles(path.dirname(document.fileName), '.js');
                
                for (const jsFile of jsFiles) {
					// console.log(jsFile);
                    const content = fs.readFileSync(jsFile, 'utf8');
                    // const functionMatch = content.match(new RegExp(`\\s+${functionName}\\s*\\([^)]*\\)\\s*{`));
					const functionMatch = findFunctionDefinition(content, functionName);
                    
                    if (functionMatch) {
						console.log("成功跳转 "+functionName);
                        const functionPosition = content.substr(0, functionMatch.index).split('\n').length;
						// console.log(functionPosition);
                        return new vscode.Location(vscode.Uri.file(jsFile), new vscode.Position(functionPosition, 0));
                    }
                }
            }
            else
            {
                console.log("没识别到属性");
            }
        }
    });

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	// const disposable = vscode.commands.registerCommand('html-jumper.helloWorld', function () {
	// 	// The code you place here will be executed every time your command is executed

	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World from HTML Jumper!');
	// });

	context.subscriptions.push(disposable);
}

/**
 * @param {string} content
 * @param {string} functionName
 */
function findFunctionDefinition(content, functionName) {
	// console.log(functionName);
    // 匹配多种函数声明方式，忽略参数名
    const patterns = [
        // new RegExp(`function\\s+${functionName}\\s*\\([^)]*\\)`),  // 函数声明：function showProductList(index) {}
        // new RegExp(`${functionName}\\s*:\\s*function\\s*\\([^)]*\\)`), //对象方法：{ showProductList: function(index) {} }
        // new RegExp(`${functionName}\\s*=\\s*function\\s*\\([^)]*\\)`),  //函数表达式：showProductList = function(index) {}
        // new RegExp(`${functionName}\\s*=\\s*\\([^)]*\\)\\s*=>`),  //箭头函数：showProductList = (index) => {}
        new RegExp(`\\s+${functionName}\\s*\\([^)]*\\)\\s*{`),  //方法简写：showProductList(index) {}
    ];

    for (const pattern of patterns) {
        const matches = content.match(pattern);
		if(matches) return matches;

		// const matches = content.matchAll(pattern);
        // for (const match of matches) {
        // //     // 检查这是否是一个完整的函数定义，而不是函数调用
        //     const afterMatch = content.slice(match.index + match[0].length).trim();
        //     if (afterMatch.startsWith('{') || afterMatch.startsWith('=>')) {
        //         return match;
        //     }
        // }
    }

    return null;
}

/**
 * @param {string} dir
 */
function findJsFiles(dir) {
    const results = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            results.push(...findJsFiles(filePath));
        } else if (path.extname(file) === '.js') {
            results.push(filePath);
        }
    }
    
    return results;
}

/**
 * @param {string} dir
 * @param {string} ext
 */
function findFiles(dir, ext) {
    const results = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            results.push(...findFiles(filePath, ext));
        } else if (path.extname(file) === ext) {
            results.push(filePath);
        }
    }
    
    return results;
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
