# Gleam Development

Notes for getting started with Gleam development. Assumes you've already cloned the Gleam git repository.


## Install Node.js

Download and install [Node.js](https://nodejs.org/en/download/), which includes a package manager called NPM.

During installation, leave the `Automatically install necessary tools` checkbox unchecked, unless you have a reason to check it. The "necessary tools" that get installed aren't actually necessary, and some of them are difficult to uninstall.


## Build, then serve examples

Install deps, build all of Gleam's modules, then serve Gleam's examples:
```
cd C:\PATH_TO_GLEAM\
npm ci
npm run build
npm run serve-examples
```
Open http://localhost:8080/ in a web browser to see the examples.


## Code style

Use the following guidelines when writing code for Gleam:
 - Spaces, not tabs
 - 4-space indents, except 2-space in JSON
 - [Stroustrup indent style](https://en.wikipedia.org/wiki/Indentation_style#Variant:_Stroustrup), with [mandatory braces](https://en.wikipedia.org/wiki/Indentation_style#Variant:_mandatory_braces) except around short arrow fns
 - Single-quoted string literals
 - Trim trailing whitespace, including on blank lines
 - Use `FIXME` comments for items to be addressed near-term, and `TODO` comments for items to be addressed farther in the future

The goal is to make it easy for developers to understand the code. In cases where violating the guidelines improves readability *for most developers*, please do so. Such cases are expected to be infrequent.


## **(Recommended)** Install VSCode

Download and install [VSCode](https://code.visualstudio.com/download). (The full name is "Visual Studio Code," but it is a separate product from Visual Studio.)

Launch VSCode, go to `File -> Open Folder...` in the menubar, and select the Gleam folder.


## **(Recommended)** Install GLSL support in VSCode

Install the [Shader Languages Support](https://marketplace.visualstudio.com/items?itemName=slevesque.shader) and [GLSL Lint](https://marketplace.visualstudio.com/items?itemName=CADENAS.vscode-glsllint) extensions in VSCode.

Download the latest release of [glslangValidator](https://github.com/KhronosGroup/glslang/releases), and extract it somewhere. (NOTE: Use the latest release for which binaries are available for your dev platform.)

In the VSCode User Settings, set the GLSL Validator Path to `C:\PATH_TO_EXTRACTED\bin\glslangValidator.exe`.


## **(Recommended)** Install a TODO highlighter in VSCode

Install the [TODO Highlight](https://marketplace.visualstudio.com/items?itemName=wayou.vscode-todo-highlight) extension in VSCode.

In the VSCode User Settings, set the TODO Highlight keywords pattern to `FIXME|TODO`.

You can edit this extension's text styles in the user-settings JSON file. For example:
```
"todohighlight.keywords": [ {
    "text": "FIXME",
    "color": "#FF8BFF",
    "backgroundColor": "",
    "overviewRulerColor": "#FF8BFF",
    "fontWeight": "bold"
}, {
    "text": "TODO",
    "color": "#77BBFF",
    "backgroundColor": "",
    "overviewRulerColor": "#4488CC",
    "fontWeight": "bold"
} ]
```


## **(FYI)** Full-reload in the browser

After you make a code change and recompile, use `CTRL+F5` to do a full-reload in the web browser.

The regular reload (e.g. `CTRL+R`) doesn't always update the browser cache, which can leave the browser running old code. This can be confusing and frustrating if you don't realize what's happening, so make a habit of using `CTRL+F5` instead.


## **(FYI)** Reloading the VSCode window

To do a full reload of the VSCode window, press `CTRL+SHIFT+p`, then type `Reload Window` in the command field and press `Enter`.

VSCode is mostly good about noticing automatically when file contents change, but it needs a reload occasionally. A reload should only take a few seconds.


## **(FYI)** Restarting the TypeScript language server

To do restart VSCode's TypeScript language server, press `CTRL+SHIFT+p`, then type `Restart TS server` in the command field and press `Enter`.

VSCode is mostly good about updating type-check results, but occasionally gets confused when source files or build output get modified by an external process. Restarting the language server should only take a few seconds.
