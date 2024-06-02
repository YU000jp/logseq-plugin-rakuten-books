import '@logseq/libs' //https://plugins-doc.logseq.com/
import { getDateForPage } from 'logseq-dateutils' //https://github.com/hkgnp/logseq-dateutils
import { setup as l10nSetup, t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import Swal from 'sweetalert2' //https://sweetalert2.github.io/
import { logseq as PL } from "../package.json"
import { closeModal, openModal, RecodeDateToPage, setCloseButton, setMainUIapp } from './lib'
import { convertSalesDateRakuten } from './rakuten'
import en from "./translations/en.json"
import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { createReadingPage } from './lib'
import { checkAssets } from './toAssets'
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


/* on click open_toolbar */
const model = {
  async OpenToolbarRakuten() {
    let appHtml: string = `
    <dialog id="appDialog">
      <h1>${t("楽天ブックスAPI 書籍検索")}</h1>
      <main>
      <select id="selectKobo">
        <option value="Kobo">${t("電子書籍 (楽天Kobo)")}</option>
        <option value="Books" selected="true">${t("本 (楽天ブックス)")}</option>
      </select>
        <form id="searchTitle">
          ${t("タイトルで検索")}
          <input type="text" placeholder="${t("キーワードを入力")}" required/><input type="submit"/>
        </form>
        <form id="searchAuthor">
        ${t("著者で検索")}
        <input type="text" placeholder="${t("キーワードを入力")}" required/><input type="submit"/>
      </form>
        <form id="searchISBN">
          ${t("ISBNで検索")}
          <input type="text" maxlength="13" placeholder="${t("10桁もしくは13桁")}" required/><input type="submit"/>
        </form>
      <output aria-live="polite" id="outputFromAPI"></output>
      </main>
      <menu>
        <button id="closeBtn">${t("閉じる")}</button>
      </menu>
    </dialog>
    `

    // モーダルウィンドウを表示
    setMainUIapp(appHtml)

    // 閉じるボタン
    setCloseButton()

    // 検索フォーム送信時の処理
    const searchForms = document.querySelectorAll('form')
    if (!searchForms) return
    for (const form of searchForms)
      formSubmitEvent(form as HTMLFormElement)
  }
}

const createTable = (data) => {
  let tableInner: string = ""
  for (const item of data) {
    const imgTag: string = (item.Item.mediumImageUrl) ?
      `<img src="${item.Item.mediumImageUrl}"/>`
      : ""
    const truncatedTitle = item.Item.title.slice(0, 60)
    item.Item.salesDate = convertSalesDateRakuten(item.Item.salesDate)
    tableInner += `<tr>
      <td><input type="radio" name="selected" value="${item.Item.title}"></td>
      <td class="ItemImg">${imgTag}</td>
      <td class="ItemTitle"><a href="${item.Item.affiliateUrl}" target="_blank">${truncatedTitle}</a></td>
      <td>${item.Item.author}</td>
      <td>${item.Item.publisherName}</td>
      <td>${item.Item.salesDate}</td>
    </tr>`
  }
  return (`
<h2>${t("検索結果")}</h2>
<p>${t("左側の〇をクリックすると、Logseqにページが作成されます。<small>(タイトルをクリックすると、楽天ブックスもしくは楽天Koboの商品ページが開きます)</small>")}</p>
<table id="createTable">
<thead>
<tr><th style="background-color:orange">${t("選択ボタン")}</th><th>${t("書影カバー")}</th><th>${t("タイトル")}</th><th>${t("著者")}</th><th>${t("出版社")}</th><th>${t("出版日")}<small>${t("(推定)")}</small></th></tr>
</thead>
<tbody>
`+ tableInner + "</tbody></table>\n")
}


const apiKey = "1032240167590752216"
const affiliateId = "30c0276b.32e8a4ed.30c0276c.b21dc4e8"
const APIelements = "title,author,publisherName,mediumImageUrl,largeImageUrl,salesDate,itemCaption,affiliateUrl"


const formSubmitEvent = (form: HTMLFormElement) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const input = form.querySelector('input[type="text"]')
    if (!(input instanceof HTMLInputElement)) return
    const inputValue = input.value.trim()
    if (inputValue.length === 0) return


    const selectKobo = document.getElementById("selectKobo") as HTMLSelectElement

    let apiUrl = ((selectKobo
      && selectKobo.value === "Kobo") ?
      "https://app.rakuten.co.jp/services/api/Kobo/EbookSearch/20170426?" //Kobo
      : "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?" //Books
    ) + `format=json&applicationId=${apiKey}&affiliateId=${affiliateId}&elements=${APIelements}`

    switch (form.id) {
      case 'searchTitle':
        apiUrl += `&title=${inputValue}`
        break
      case 'searchISBN':
        apiUrl += `&isbn=${inputValue}`
        break
      case 'searchAuthor':
        apiUrl += `&author=${inputValue}`
        break
      default:
        break
    }

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        const output = document.getElementById('outputFromAPI')
        if (output
          && data.Items) {
          const Table = createTable(data.Items)
          output.innerHTML = Table

          // ラジオボタンが選択された場合の処理
          const radioButtons = document.querySelectorAll('input[name="selected"]')
          if (radioButtons)
            for (const radio of radioButtons)
              choiceRadioButton(radio, selectKobo, closeModal, openModal, data)
        } else
          logseq.UI.showMsg(t("検索結果が見つかりませんでした"), "warning")
      })
      .catch((error) => {
        console.error(error)
      })
  })
}


const choiceRadioButton = (radio: Element, selectKobo: HTMLSelectElement, closeModal: () => void, openModal: () => void, data: any) => {
  radio.addEventListener('change', async (event) => {

    event.preventDefault()
    if (!(event.target instanceof HTMLInputElement)) return
    const selectedTitle = event.target.value
    const FullTitle = (selectKobo
      && selectKobo.value === "Kobo") ?
      t("電子書籍") + "/" + selectedTitle
      : t("本") + "/" + selectedTitle

    closeModal()

    if (Object.keys(await logseq.Editor.getPage(FullTitle) || []).length !== 0) //ページチェック
      createBookPageCancel(openModal) //ページが存在していた場合
    else
      createBookPage(FullTitle, data, selectedTitle, openModal) //ページが存在していない場合
  })
}


const createBookPage = (FullTitle: string, data: any, selectedTitle: string, openModal: () => void) => {
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
      const selectedBook = data.Items.find((item) => item.Item.title === selectedTitle)?.Item // 選択された書籍の情報を取得
      if (selectedBook) {
        const { preferredDateFormat } = await logseq.App.getUserConfigs() as { preferredDateFormat: string }
        const getDate = getDateForPage(new Date(selectedBook.salesDate), preferredDateFormat)

        let itemProperties = {}
        if (selectedBook.author)
          itemProperties["author"] = selectedBook.author
        if (selectedBook.publisherName)
          itemProperties["publisher"] = selectedBook.publisherName
        if (selectedBook.largeImageUrl) {
          if (logseq.settings!.saveImage === true)
            await checkAssets(selectedBook.largeImageUrl, itemProperties)//画像をアセットに保存する場合
          else
            itemProperties["cover"] = selectedBook.largeImageUrl //画像をアセットに保存しない場合
        }

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

const createBookPageCancel = (openModal: () => void) => {
  logseq.hideMainUI()
  logseq.UI.showMsg(t("すでにページが存在しています"), "warning")
  openModal()
  logseq.showMainUI()
}

const userCancel = async (openModal: () => void) => {
  logseq.hideMainUI()
  await logseq.UI.showMsg(t("キャンセルしました"), "warning")
  openModal()
  logseq.showMainUI()
}

logseq.ready(model, main).catch(console.error)