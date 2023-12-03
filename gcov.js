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

const child_process = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

function readGcovToJson(str) {
    let result = {
        "files": []
    };
    const lines = str.split('\n');
    let lastLineNumber = '0';
    let lastFuncLineNumber = '0';
    let func = '';
    let file_id = 0;
    for (let i = 0; i < lines.length; i++) {
        try {
            const lineParams = lines[i].split(':', 4);
            lastLineNumber = lineParams[1].trim();
            if (lineParams[0].trim() == '-' &&
                lineParams[1].trim() == '0' &&
                lineParams[2].trim() == 'Source') {
                result["files"].push({ "file": lineParams[3], "lines": [], "functions": [] })
                func = '';
                file_id = result["files"].length - 1;
            }
            else if (lineParams.length > 2 && lineParams[0].trim() != '-' &&
                     !isNaN(lineParams[1].trim())) {
                if (lastFuncLineNumber == lineParams[1].trim()) {
                    lastCount = result["files"][file_id]["lines"][result["files"][file_id]["lines"].length - 1]["count"];
                    currentCount = parseInt(lineParams[0].trim()) || 0;
                    if (lastCount < currentCount) {
                        result["files"][file_id]["lines"][result["files"][file_id]["lines"].length - 1]["count"] = currentCount;
                    }
                    result["files"][file_id]["lines"][result["files"][file_id]["lines"].length - 1]["function_name"] = func;
                }
                else {
                    lastFuncLineNumber = lineParams[1].trim();
                    ldata = {
                        "branches": [],
                        "count": parseInt(lineParams[0].trim()) || 0,
                        "line_number": parseInt(lineParams[1].trim()),
                        "unexecuted_block": false,
                        "function_name": func
                    };
                    result["files"][file_id]["lines"].push(ldata);
                    result["files"][file_id]["functions"][result["files"][file_id]["functions"].length  - 1]["end_line"] = ldata["line_number"];
                }
            }
        }
        catch {
            const lineParams = lines[i].split(' ', 2);
            if (lineParams[0].trim() == 'function') {
                func = lineParams[1].trim();
                fdata = {
                    "blocks": 0,
                    "end_column": 0,
                    "start_line": parseInt(lastLineNumber) + 1,
                    "name": func,
                    "blocks_executed": 0,
                    "execution_count": 0,
                    "demangled_name": func,
                    "start_column": 0,
                    "end_line": 0
                };
                result["files"][file_id]["functions"].push(fdata);
            }
        }
    }
    return JSON.stringify(result);
}

let gcovCommand = '';
// check arguments
for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] == "--help") {
        process.stdout.write("gcov.js: I'm not the real gcov but i print --stdout and --json-format too\n");
        process.exit();
    }
    else if (process.argv[i] == "--stdout" || process.argv[i] == "--json-format") {
        // nothing
    }
    else {
        gcovCommand += process.argv[i] + ' ';
    }
}

try {
    fs.mkdtemp(path.join(os.tmpdir(), 'gcov_viewer_older_'), (err, folder) => {
        if (err) {
            console.error(`mkdtemp error: ${err}`);
            return;
        }
        child_process.exec(
            `${gcovCommand} 1> /dev/null 2> /dev/null && cat *.gcov`,
            {
                cwd: folder,
                maxBuffer: 256 * 1024 * 1024
            },
            (err, stdout, stderr) => {
                if (err) {
                    console.error(`exec error: ${err}`);
                    return;
                }
                process.stdout.write(readGcovToJson(stdout.toString()) + '\n');
            }
        );
    });
}
catch {
    console.error("Cannot create a tmp directory");
}