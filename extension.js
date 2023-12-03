/*
MIT License

Copyright (c) 2023 Mickaël Blet

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const vscode = require("vscode");

function updateConfiguration(context) {
    let newGcovBinary = process.argv[0] + ' ' + context.asAbsolutePath("gcov.js") + ' ' + vscode.workspace.getConfiguration("gcovViewerOlder").get("gcovBinary");
    if (vscode.workspace.getConfiguration("gcovViewer").get("gcovBinary").replace(/mblet.gcov-viewer-older-[0-9]+.[0-9]+.[0-9]+/, "") != newGcovBinary.replace(/mblet.gcov-viewer-older-[0-9]+.[0-9]+.[0-9]+/, "")) {
        vscode.workspace.getConfiguration().update("gcovViewer.gcovBinary", newGcovBinary, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('[gcovViewer.gcovBinary] has been replaced with gcov-viewer-older adapter');
    }
}

function activate(context) {
    updateConfiguration(context);
    // event configuration change
    vscode.workspace.onDidChangeConfiguration(event => {
        updateConfiguration(context);
    });
}

function desactivate() {
    vscode.workspace.getConfiguration().update("gcovViewer.gcovBinary", undefined, vscode.ConfigurationTarget.Global);
}

module.exports = { activate, desactivate }