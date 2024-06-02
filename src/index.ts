import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { getDateForPage } from 'logseq-dateutils'; //https://github.com/hkgnp/logseq-dateutils
import Swal from 'sweetalert2'; //https://sweetalert2.github.io/
import { logseq as PL } from "../package.json"
import { closeModal, convertSalesDateRakuten, openModal, RecodeDateToPage, setCloseButton, setMainUIapp } from './lib'
const pluginId = PL.id //set plugin id from package.json


//楽天ブックス書籍検索API https://webservice.rakuten.co.jp/documentation/books-book-search
//楽天Kobo電子書籍検索API https://webservice.rakuten.co.jp/documentation/kobo-ebook-search
//(テストフォーム) https://webservice.rakuten.co.jp/explorer/api/BooksTotal/Search

//参考リンク
//<dialog>: ダイアログ要素 https://developer.mozilla.org/ja/docs/Web/HTML/Element/dialog


/* main */
const main = () => {

  /* user setting */
  // https://logseq.github.io/plugins/types/SettingSchemaDesc.html
  // const settingsTemplate: SettingSchemaDesc[] = [

  // ];
  // logseq.useSettingsSchema(settingsTemplate);

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
      <h1>楽天ブックスAPI 書籍検索</h1>
      <main>
      <select id="selectKobo">
        <option value="Kobo">電子書籍 (楽天Kobo)</option>
        <option value="Books">本 (楽天ブックス)</option>
      </select>
        <form id="searchTitle">
          タイトルで検索
          <input type="text" placeholder="キーワードを入力" required/><input type="submit"/>
        </form>
        <form id="searchAuthor">
        著者名で検索
        <input type="text" placeholder="キーワードを入力" required/><input type="submit"/>
      </form>
        <form id="searchISBN">
          ISBNで検索
          <input type="text" maxlength="13" placeholder="10桁もしくは13桁" required/><input type="submit"/>
        </form>
      <output aria-live="polite" id="outputFromAPI"></output>
      </main>
      <menu>
        <button id="closeBtn">閉じる</button>
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
<h2>検索結果</h2>
<p>左側の〇をクリックすると、Logseqにページが作成されます。<small>(タイトルをクリックすると、楽天ブックスもしくは楽天Koboの商品ページが開きます)</small></p>
<table id="createTable">
<thead>
<tr><th style="background-color:orange">選択ボタン</th><th>書影カバー</th><th>タイトル</th><th>著者</th><th>出版社</th><th>出版日<small>(推定)</small></th></tr>
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
              choiceCreate(radio, selectKobo, closeModal, openModal, data)
        } else
          logseq.UI.showMsg("検索結果が見つかりませんでした", "warning")
      })
      .catch((error) => {
        console.error(error)
      })
  })
}

const choiceCreate = (radio: Element, selectKobo: HTMLSelectElement, closeModal: () => void, openModal: () => void, data: any) => {
  radio.addEventListener('change', async (event) => {
    event.preventDefault()
    if (!(event.target instanceof HTMLInputElement)) return
    const selectedTitle = event.target.value
    const FullTitle = (selectKobo
      && selectKobo.value === "Kobo") ?
      "電子書籍/" + selectedTitle
      : "本/" + selectedTitle

    closeModal()
    const obj = await logseq.Editor.getPage(FullTitle) || [] //ページチェック
    if (Object.keys(obj).length !== 0) {
      //ページが存在していた場合
      logseq.hideMainUI()
      logseq.UI.showMsg("すでにページが存在しています", "warning")
      openModal()
      logseq.showMainUI()
    } else {
      //ページが存在していない場合
      Swal.fire({
        title: "続行しますか？",
        text: `新しいページを作成します。\n\n[[${FullTitle}]]`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      }).then(async (result) => {
        if (result.isConfirmed) {
          //"Reading"ページの作成
          const MainPageObj = await logseq.Editor.getPage("Reading") || [] //ページチェック
          if (Object.keys(MainPageObj).length === 0) {
            //ページが存在しない場合
            const createMainPage = await logseq.Editor.createPage("Reading", {}, { redirect: false, createFirstBlock: true })
            if (createMainPage)
              await logseq.Editor.prependBlockInPage(createMainPage.uuid, "{{query (page-tags Reading)}}")
          }
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
            if (selectedBook.largeImageUrl)
              itemProperties["cover"] = selectedBook.largeImageUrl
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
(内容紹介「BOOK」データベースより) | [楽天サイトへ](${selectedBook.affiliateUrl})
#+BEGIN_QUOTE\n${selectedBook.itemCaption}
#+END_QUOTE
                    `
                    : `
[楽天サイトへ](${selectedBook.affiliateUrl})
`
                )
                await Swal.fire('ページが作成されました。', `[[${FullTitle}]]`, 'success').then(async (ok) => {
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
        } else {
          //作成キャンセルボタン
          logseq.hideMainUI()
          await logseq.UI.showMsg("キャンセルしました", "warning")
          openModal()
          logseq.showMainUI()
        }
      })
    }
  })
}

logseq.ready(model, main).catch(console.error)