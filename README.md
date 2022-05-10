<h1 align="center">Waterfall Explorer: <i>hover to navigate</i></h1>

**Waterfall Explorer** is a tree-style file management system that is _designed_ to navigate all your large and deep folders systems.

Just hover your mouse over the folders, and you'll flow down the file tree with ease.

Once you found the file you want, click to open, right click for more options, or use hotkeys for extra functionalities.

<a href="https://imgur.com/FP0ROfk"><img src="https://i.imgur.com/FP0ROfk.gif" title="source: imgur.com" /></a>

<a href="https://imgur.com/n8pFq9v"><img src="https://i.imgur.com/n8pFq9v.gif" title="source: imgur.com" /></a>

<a href="https://imgur.com/sPE6YIE"><img src="https://i.imgur.com/sPE6YIE.gif" title="source: imgur.com" /></a>

<a href="https://imgur.com/sGXeYkN"><img src="https://i.imgur.com/sGXeYkN.gif" title="source: imgur.com" /></a>

# Quick start

This app is designed with Electron. It currently only supports `Windows`, but plans to add support for `Mac` and `Linux`.

To get started, [download lastest installer here](https://github.com/SeanSun6814/WaterfallExplorer/tree/main/builds). Run the installer. Enjoy!

The app is normally hidden in the background. Use the global hotkey [`Alt + E`] to bring it up!

For help, hit `Ctrl + H`. Alternatively, use the context menu by right clicking on empty space.

# Features

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

## Delete item

To move a file or folder, first hover over it and hit `Ctrl + Delete`. Alternatively, use the right click context menu.

**Warning:** this permanently deletes the item. It does NOT go to the recycle bin.

## Delayed launch

Files and folders will not be opened immediately in this mode.

1. Hit `Ctrl + D` to turn on delayed launch
2. Open a file or folder as usual (but it won't immediately open)
3. Open more files or folders as you wish
4. Hit `Ctrl + D`. Now everything will launch at once.

## Quit

To completely exit the app, hit `Ctrl + Q`.

# Settings

All settings are stored in `<app_path>/resources/config.json` and are read every time the app starts up.

Writes to the config file happen every time settings is changed.

## Toggle light/dark theme

Hit `Ctrl + T`.

Alternatively, use the context menu by right clicking on empty space.

## Toggle autorun on system start up

Hit `Ctrl + R`.

Alternatively, use the context menu by right clicking on empty space.

## Change default sort method

Change the `defaultSortByIdx` integer variable in `config.json`.

## Open `config.json`

Hit `Ctrl + S`.

Alternatively, use the context menu by right clicking on empty space.
