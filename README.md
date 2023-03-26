```
 __          __     _                __        _  _      ______               _
 \ \        / /    | |              / _|      | || |    |  ____|             | |
  \ \  /\  / /__ _ | |_  ___  _ __ | |_  __ _ | || |    | |__   __  __ _ __  | |  ___   _ __  ___  _ __
   \ \/  \/ // _` || __|/ _ \| '__||  _|/ _` || || |    |  __|  \ \/ /| '_ \ | | / _ \ | '__|/ _ \| '__|
    \  /\  /| (_| || |_|  __/| |   | | | (_| || || |    | |____  >  < | |_) || || (_) || |  |  __/| |
     \/  \/  \__,_| \__|\___||_|   |_|  \__,_||_||_|    |______|/_/\_\| .__/ |_| \___/ |_|   \___||_|
                                                                      | |
                                                                      |_|
```

<h1 align="center">Waterfall Explorer: <i>hover to navigate</i></h1>

**Waterfall Explorer** is a tree-style file management system that is _designed_ to navigate all your large and deep folders systems.

Just hover your mouse over the folders, and you'll flow down the file tree with ease.

Once you found the file you want, click to open, right click for more options, or use hotkeys for extra functionalities.

<a href="https://imgur.com/FP0ROfk"><img src="https://i.imgur.com/FP0ROfk.gif" title="source: imgur.com" /></a>

<a href="https://imgur.com/n8pFq9v"><img src="https://i.imgur.com/n8pFq9v.gif" title="source: imgur.com" /></a>

<a href="https://imgur.com/sPE6YIE"><img src="https://i.imgur.com/sPE6YIE.gif" title="source: imgur.com" /></a>

<a href="https://imgur.com/sGXeYkN"><img src="https://i.imgur.com/sGXeYkN.gif" title="source: imgur.com" /></a>

# Quick start

## Installation

This app is designed with Electron. It currently supports `Windows` (tested on Windows 11) and `Linux` (tested on Ubuntu 20.04). I will add support for `Mac` when I can afford a Macbook :).

To get started on `Windows`, [download lastest installer here](https://github.com/SeanSun6814/WaterfallExplorer/releases/tag/release). Run the installer.

To get started on `Linux`, [download lastest app package here](https://github.com/SeanSun6814/WaterfallExplorer/releases/tag/release). Unzip the package, and run the executable in the terminal `cd linux-unpacked && ./waterfallexplorer`.

## Compile from source

- Windows: `npm i && npm run dist`
- Linux: `npm i && npm run dist_linux`

## Getting started

_The app is normally hidden in the background. Use the global hotkey [`Alt + E`] to bring it up!_

Add your commonly used folders to the leftmost shortcuts column! To do that, first copy the path of the folder to clipboard (using `Ctrl + C` in the app). Then hit `Ctrl + A` to add. Alternatively, use the context menu by right clicking on the folder. See below for more details.

For help, hit `Ctrl + H`. Alternatively, use the context menu by right clicking on empty space.

# Features

## Navigation

Use mouse to hover items to traverse file system. Alternatively, use arrow buttons to navigate.

## Opening options

- Default open [`Spacebar`]
  - Windows file explorer for folders
  - Default app for files
- Open in Chrome [`Enter`]
  - Opens folders or files with Chrome browser
- Open in VS Code [`Ctrl + Enter`]
  - Opens folders or files with Visual Studio Code

Aside from hotkeys, these features are present in the right click context menu.

## Sorting

Sort a directory by...

- Default [`Ctrl + 1`]
  - Files and folders sorted by name ascending
  - All folders are grouped before files
- Name [`Ctrl + 2`]
  - Files and folders sorted by name ascending
- Time [`Ctrl + 3`]
  - Files and folders sorted by last modified descending
- Type [`Ctrl + 4`]
  - Files sorted by extension type ascending
  - Folders are not sorted
- Size [`Ctrl + 5`]
  - Files sorted by file size descending
  - Folders are not sorted

Aside from hotkeys, these features are present in the right click context menu.

## Search

Type any ascii character when hovering on a directory to go to the next file starting with the character.

### Example

_User hovers on `apples.txt` and clicks `d`_

Waterfall Explorer will automatically scroll and focus on the file `document1.txt`

- dinner.txt
- apples.txt
- bananas.txt
- document1.txt `<--`
- pineapples.txt
- pancakes.txt
- water.txt

_User clicks `d` again_

Waterfall Explorer will focus on the file `dinner.txt`

- dinner.txt `<--`
- apples.txt
- bananas.txt
- document1.txt
- pineapples.txt
- pancakes.txt
- water.txt

## Copy item path

To copy the path of a file or folder, hover over it and hit `Ctrl + C`.

Alternatively, use the right click context menu.

## Root paths

The leftmost column is the `root paths column`. They are like shortcuts and are starting points for all navigation.

The root paths are saved automatically upon modification, and they can be found in the configuration file `config.json` (See settings section).

### Add folder to root paths

To add a folder to the root path, first copy the path to your clipboard (with `Ctrl + C`). Then hit `Ctrl + A`.

Alternatively, use the right click context menu.

### Remove folder from root paths

To remove a folder to the root path, first hover over that folder in the leftmost column. Then hit `Delete`.

Alternatively, use the right click context menu.

## Copy item

To copy a file or folder, first hover over it and hit `Ctrl + C`. Alternatively, use the right click context menu.

Navigate to the destination folder, hit `Ctrl + V` to paste. Alternatively, use the right click context menu.

## Move item

To move a file or folder, first hover over it and hit `Ctrl + C`. Alternatively, use the right click context menu.

Navigate to the destination folder, hit `Ctrl + M` to move. Alternatively, use the right click context menu.

## Rename item

To rename a file or folder, first hover over it and hit `Ctrl + R`. Alternatively, use the right click context menu. Follow popup to complete the renaming action.

## Delete item

To move a file or folder, first hover over it and hit `Ctrl + Delete`. Alternatively, use the right click context menu.

**Warning:** this permanently deletes the item. It does NOT go to the recycle bin.

## Create item

To create a file or folder, first hover over a directory or a file in that directory. Then hit `Ctrl + N`. Alternatively, use the right click context menu. Follow popup to complete the renaming action.

If the new item ends with a `/`, it will be created as a directory. Otherwise it will be created as a file. 

## Delayed launch

Files and folders will not be opened immediately in this mode.

1. Hit `Ctrl + D` to turn on delayed launch
2. Open a file or folder as usual (but it won't immediately open)
3. Open more files or folders as you wish
4. Hit `Ctrl + D` again. Now everything will launch at once.

## Quit

To completely exit the app, hit `Ctrl + Q`.

# Settings

All settings are stored in `<app_path>/resources/config.json` and are read every time the app starts up.

Writes to the config file happen every time settings is changed.

## Toggle light/dark theme

Hit `Ctrl + T`.

Alternatively, use the context menu by right clicking on empty space.

## Toggle autorun on system start up

Hit `Ctrl + L`.

Alternatively, use the context menu by right clicking on empty space.

## Change default sort method

Change the `defaultSortByIdx` integer variable in `config.json`.

## Open `config.json`

Hit `Ctrl + ,`.

Alternatively, use the context menu by right clicking on empty space.

# Compiling and building

## Windows

```
npm i electron-builder
npm run dist
```

## Linux

```
npm i electron-builder
npm run dist:linux
./dist/linux-unpacked/waterfallexplorer
```

# Support & Warranty

lmao

# Change log

## 1.1.0

- Added renaming feature
- Added support for linux
- Added custom launch configurations
- Opening app for the second time shows the first instance
- Fixed dialogue background alignment bug

## 1.2.0

- Added feature to create new files and folders
- Added feature to display file icons
- Added feature to navigate with arrow keys
- Fixed bug of not refreshing source column when moving _folders_
- TODO: Update the demo
