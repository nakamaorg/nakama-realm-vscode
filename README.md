# nakama-realm

Visual Studio Code support for Nakama Real bs

## Features

* Snippets
* Custom icons
* Syntax highlighting
* Run file button (button right)
* Run file command (`> Run current LangKama script`)

## Installation

Once you clone the repository, be sure to update the LangKama submodule

```sh
git submodule init
git submodule update
```

Then install all dependencies

```sh
pnpm i
```

After that make sure to build LangKama as well.

```sh
cd langkama
pnpm prod
```