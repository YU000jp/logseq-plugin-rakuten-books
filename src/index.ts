import '@logseq/libs' //https://plugins-doc.logseq.com/
import { getDateForPage } from 'logseq-dateutils' //https://github.com/hkgnp/logseq-dateutils
import { setup as l10nSetup, t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import Swal from 'sweetalert2' //https://sweetalert2.github.io/
import { logseq as PL } from "../package.json"
import { RecodeDateToPage } from './lib'
import en from "./translations/en.json"
import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { createReadingPage } from './lib'
import { checkAssets } from './toAssets'
import { userCancel } from './modal'
import { model } from './modal'
const pluginId = PL.id //set plugin id from package.json

//楽天ブックス書籍検索API https://webservice.rakuten.co.jp/documentation/books-book-search
//楽天Kobo電子書籍検索API https://webservice.rakuten.co.jp/documentation/kobo-ebook-search
//(テストフォーム) https://webservice.rakuten.co.jp/explorer/api/BooksTotal/Search

//参考リンク
//<dialog>: ダイアログ要素 https://developer.mozilla.org/ja/docs/Web/HTML/Element/dialog


/* main */
const main = async () => {
  // i18n
  await l10nSetup({
    defaultLocale: "ja",
    builtinTranslations: { en }
  })
  /* user setting */
  // https://logseq.github.io/plugins/types/SettingSchemaDesc.html
  const settingsTemplate: SettingSchemaDesc[] = [
    // 画像ファイルをアセットに保存するかどうか
    {
      key: "saveImage",
      title: t("有効にする: 画像ファイルをアセットに保存"),
      type: "boolean",
      default: true,
      description: t("APIから取得したカバー画像をアセットに保存します。"),
    },
  ]
  logseq.useSettingsSchema(settingsTemplate)

  //open_toolbar
  logseq.App.registerUIItem('toolbar', {
    key: pluginId,
    template: `<div><a class="button icon" data-on-click="OpenToolbarRakuten" style="font-size: 19px; color: #bf0000; background-color: #eba9a9; border-radius: 0.4em; ">R</a></div>`,
  })

}/* end_main */

export const createBookPage = (FullTitle: string, data: any, selectedTitle: string, openModal: () => void) => {
  Swal.fire({
    title: t("続行しますか？"),
    text: `${t("新しいページを作成します。")}\n\n[[${FullTitle}]]`,
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
  }).then(async (result) => {
    if (result.isConfirmed) {
      //"Reading"ページの作成
      await createReadingPage()
      //ページを追加する処理
      const selectedBook = data.Items.find((item) => item.Item.title.replaceAll("/", " ") === selectedTitle)?.Item // 選択された書籍の情報を取得
      if (selectedBook) {
        const { preferredDateFormat } = await logseq.App.getUserConfigs() as { preferredDateFormat: string }
        const getDate = getDateForPage(new Date(selectedBook.salesDate), preferredDateFormat)

        const itemProperties = {}
        if (selectedBook.author)
          itemProperties["author"] = selectedBook.author
        if (selectedBook.publisherName)
          itemProperties["publisher"] = selectedBook.publisherName
        if (selectedBook.largeImageUrl)
          if (logseq.settings!.saveImage === true)
            await checkAssets(selectedBook.largeImageUrl, itemProperties)//画像をアセットに保存する場合
          else
            itemProperties["cover"] = selectedBook.largeImageUrl //画像をアセットに保存しない場合

        if (getDate
          && getDate !== "[[NaN/aN/aN]]"
          && getDate !== "NaN/aN/aN")
          itemProperties["sales"] = getDate

        itemProperties["tags"] = ["Reading"]
        const createPage = await logseq.Editor.createPage(
          FullTitle,
          itemProperties,
          {
            redirect: true,
            createFirstBlock: true
          })
        if (createPage) {
          try {
            await logseq.Editor.prependBlockInPage(createPage.uuid,
              (selectedBook.itemCaption) ?
                `
(${t("内容紹介「BOOK」データベースより")}) | [${t("楽天サイトへ")}](${selectedBook.affiliateUrl})
#+BEGIN_QUOTE\n${selectedBook.itemCaption}
#+END_QUOTE
                    `
                : `
[${t("楽天サイトへ")}](${selectedBook.affiliateUrl})
`
            )
            await Swal.fire(t("ページが作成されました。"), `[[${FullTitle}]]`, 'success').then(async (ok) => {
              if (ok) {
                //日付とリンクを先頭行にいれる
                RecodeDateToPage(preferredDateFormat, "Reading", ` [[${FullTitle}]]`)
                logseq.hideMainUI()
              }
            })
          } finally {
            const blocks = await logseq.Editor.getPageBlocksTree(FullTitle)
            if (blocks) {
              await logseq.Editor.editBlock(blocks[0].uuid)
              setTimeout(function () {
                logseq.Editor.insertAtEditingCursor(",") //ページプロパティを配列として読み込ませる処理
              }, 200)
            }
          }
        }
      }
    } else
      await userCancel(openModal) //作成キャンセルボタン
  })
}

logseq.ready(model, main).catch(console.error)