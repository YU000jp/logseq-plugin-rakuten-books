import { t } from "logseq-l10n"
import { setMainUIapp, setCloseButton, closeModal, openModal } from "./lib"
import { convertSalesDateRakuten } from "./rakuten"
import { createBookPage } from "."

export const createBookPageCancel = (openModal: () => void) => {
  logseq.hideMainUI()
  logseq.UI.showMsg(t("すでにページが存在しています"), "warning")
  openModal()
  logseq.showMainUI()
}
export const userCancel = async (openModal: () => void) => {
  logseq.hideMainUI()
  await logseq.UI.showMsg(t("キャンセルしました"), "warning")
  openModal()
  logseq.showMainUI()
}
/* on click open_toolbar */

export const model = {
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

export const createTable = (data) => {
  let tableInner: string = ""
  for (const item of data) {
    const imgTag: string = (item.Item.mediumImageUrl) ?
      `<img src="${item.Item.mediumImageUrl}"/>`
      : ""
    const truncatedTitle = item.Item.title.slice(0, 60)
    item.Item.salesDate = convertSalesDateRakuten(item.Item.salesDate)
    tableInner += `
    <li class="item">
    <div class="item-picture" title="${t("書影カバー")}">${imgTag}</div>
    <div class="item-body">
      <div class="item-title">
        <input type="radio" name="selected" value="${item.Item.title}" title="${t("選択ボタン")}" style="background-color:orange"/>
        <a href="${item.Item.affiliateUrl}" target="_blank" title="${t("タイトル")}">${truncatedTitle}</a>
      </div>
      <div class="item-text">
        ${item.Item.author ? `<span title="${t("著者")}">${item.Item.author}</span>` : ""}<br/>
        ${item.Item.publisherName ? `<span title="${t("出版社")}">${item.Item.publisherName}</span>` : ""}<br/>
        ${item.Item.salesDate ? `<span title="${t("出版日")} ${t("(推定)")}">${item.Item.salesDate}</span>` : ""}
      </div>
    </div>
  </li>
    `
  }
  return (`
<h2>${t("検索結果")}</h2>
<p>${t("左側の〇をクリックすると、Logseqにページが作成されます。<small>(タイトルをクリックすると、楽天ブックスもしくは楽天Koboの商品ページが開きます)</small>")}</p>
<ul id="createTable">
  ${tableInner}
</ul>
`)
}

export const choiceRadioButton = (radio: Element, selectKobo: HTMLSelectElement, closeModal: () => void, openModal: () => void, data: any) => {
  radio.addEventListener('change', async (event) => {
    event.preventDefault()
    if (!(event.target instanceof HTMLInputElement)) return
    const selectedTitle = event.target.value.replaceAll("/", " ")
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

export const formSubmitEvent = (form: HTMLFormElement) => {
  const apiKey = "1032240167590752216"
  const affiliateId = "30c0276b.32e8a4ed.30c0276c.b21dc4e8"
  const APIelements = "title,author,publisherName,mediumImageUrl,largeImageUrl,salesDate,itemCaption,affiliateUrl"
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
        }
        else
          logseq.UI.showMsg(t("検索結果が見つかりませんでした"), "warning")
      })
      .catch((error) => {
        console.error(error)
      })
  })
}

