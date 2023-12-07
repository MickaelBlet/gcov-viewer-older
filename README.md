# Gcov Viewer Older

Show code coverage data generated with older version of gcov for C or C++ langages in VS Code.

## Background
- Compatiable for plugin [Gcov Viewer](https://github.com/JacquesLucke/gcov-viewer) in VSCode.
- Call `gcov` command with `--branch-probabilities --long-file-names` options and tranform the gcov files to gcov-9 json format.
- Update the `gcovViewer.gcovBinary` configuration with the extension command.