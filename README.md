# logseq-plugin-template-js

> Logseq plugins are mostly written in Typescript. It's not easy for beginners to learn, so I think it's better to learn **Javascript** in the beginning. Customize Logseq using `@logseq/libs`.

[![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-template-js)](https://github.com/YU000jp/logseq-plugin-template-js/releases)
[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-template-js?color=blue)](https://github.com/YU000jp/logseq-plugin-template-js/blob/main/LICENSE)

## Required environment

1. GitHub desktop client <https://desktop.github.com/>
1. Visual Studio Code <https://azure.microsoft.com/ja-jp/products/visual-studio-code/>
1. node.js <https://pnpm.io/ja/cli/env>

## How to use

1. Select [Use this template] → [Create a new repository]
1. Clone the repository on GitHub desktop client

## Step

1. Edit PLUGIN-AUTHOR and few items `LICENSE.md` and `package.json` on Visual Studio Code
1. Launch a terminal by contextmenu from the same folder as the repository.
1. Run `npm install -g pnpm`
1. Run `pnpm install`
1. Modules is installed and the development environment is ready.
1. Edit the main script `src/index.js`
1. Build the plugin. Run `pnpm build`
1. switch to Electron Developer Tools on Logseq (⌨️: Windows`Ctrl+Shift+I` or Mac`Cmd+Alt+I`)
1. Have Logseq load the plugin in developer mode.
1. repeat 6-9

![Animation6w12](https://user-images.githubusercontent.com/111847207/204119897-c237eabf-c538-4d24-ac72-c6735364119a.gif)

## How to publish

> Once the plugin is complete, publish it to Logseq marketplace. Logseq marketplace has 5 checks requirement.

- [ ] a legal package.json file.
- [ ] a valid CI workflow build action for Github releases. (Optional for theme plugin only).
- [ ] a release which includes a release zip pkg from a successful build.
- [ ] a clear README file, ideally with an image or gif showcase. (For more friendly to users, it is recommended to have English version description).
- [ ] a license in the LICENSE file.

>　Prepared by this template

- [x]  a valid CI workflow build action for Github releases.

> Requires personal settings. Sure to check files.

- [ ] package.json
- [ ] LICENCE (MIT LICENCE)

### Make a release in the repository on Github

- [ ]  a release which includes a release zip pkg from a successful build.

1. Open the release page from repository

![image](https://user-images.githubusercontent.com/111847207/206027638-99da2713-f674-4813-9644-a094a134479f.png)

1. On the release page, create the tag `v1.0.0`.
1. Title should also be `v1.0.0`.

![image](https://user-images.githubusercontent.com/111847207/206028567-02e0d6b0-f2ff-4a53-b471-97d534732d19.png)

1. Github Actions are executed when you release.
1. Compiled files are ready for release. It takes about a minute for Github CI to finish working. Then two are added to the asset.
1. In order, the plug-in was ready.
1. Fork logseq/marketplace repository <https://github.com/logseq/marketplace>
1. In your forked repository, pull  2 files to `package` directory.
   - `manifest.json` sample: <https://github.com/logseq/marketplace/blob/master/packages/logseq-dev-theme/manifest.json>
      - manifest.json: "effect" property to true (`"effect": true`) for unblock by CORS policy
   - `icon.png` or other `icon.svg`
1. Make a pull request. After posting, wait a few days for a response. They are checked and merged.
1. it will be published to the marketplace later.

## Link

- [Logseq Plugin Setup Guide](https://gist.github.com/xyhp915/bb9f67f5b430ac0da2629d586a3e4d69)
- [Logseq Plugin API docs](https://plugins-doc.logseq.com/)
- [Discord Logseq #plugin-developers](https://discord.gg/rak7X2dXx9)
- [An Intro to Making Logseq Plugins ft. Sawhney(YouTube)](https://www.youtube.com/watch?v=57h7te3NvJg)
- [logseq-plugins-in-action(Chinese document)](https://correctroad.gitbook.io/logseq-plugins-in-action/)

## Imported SDK

- [@logseq/libs](https://logseq.github.io/plugins/)
- [logseq-dateutils](https://github.com/hkgnp/logseq-dateutils)

## Credit

- <https://github.com/hkgnp/logseqplugin-basic-template>
- <https://github.com/YU000jp/logseq-plugin-templete-js>
