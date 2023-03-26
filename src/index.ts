import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { getDateForPage } from 'logseq-dateutils';//https://github.com/hkgnp/logseq-dateutils
import { logseq as PL } from "../package.json";
const pluginId = PL.id; //set plugin id from package.json
import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";
import Swal from 'sweetalert2';//https://sweetalert2.github.io/


//楽天ブックス書籍検索API
//API詳細  https://webservice.rakuten.co.jp/documentation/books-book-search
//テストフォーム https://webservice.rakuten.co.jp/explorer/api/BooksTotal/Search

//参考リンク
//<dialog>: ダイアログ要素 https://developer.mozilla.org/ja/docs/Web/HTML/Element/dialog


/* main */
const main = () => {
  console.info(`#${pluginId}: MAIN`); //console

  /* user setting */
  // https://logseq.github.io/plugins/types/SettingSchemaDesc.html
  const settingsTemplate: SettingSchemaDesc[] = [

  ];
  logseq.useSettingsSchema(settingsTemplate);

  //open_toolbar
  logseq.App.registerUIItem("toolbar", {
    key: pluginId,
    template: `
    <div data-on-click="OpenToolbarRakuten" style="font-size:20px;color:#bf0000">R</div>
    `,
  });

  console.info(`#${pluginId}: loaded`);//console
};/* end_main */



/* on click open_toolbar */
const model = {
  async OpenToolbarRakuten() {
    console.info(`#${pluginId}: open_toolbar`);//console
    let appHtml: string = `
    <dialog id="appDialog">
      <h1>楽天ブックスAPI 書籍検索</h1>
      <main>
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
          <input type="text" pattern="\d{10}|\d{13}" maxlength="13" placeholder="10桁もしくは13桁" required/><input type="submit"/>
        </form>
      <output aria-live="polite" id="outputFromAPI"></output>
      </main>
      <menu>
        <button id="closeBtn">閉じる</button>
      </menu>
    </dialog>
    <style>
    table#createTable td.ItemTitle{
      width:580px;
    }
    table#createTable td.ItemImg{
      width:130px;
    }
    table#createTable tr:hover{
      background:lightyellow;
    }
    output#outputFromAPI{
      margin:1.5em;
    }
    dialog#appDialog{
      outline: 3px double #bf0000;
      outline-offset: 3px;
      border-radius: 10px;
    }
    dialog#appDialog h1{
      color: #bf0000;
    }
    div#app{
      background:unset;backdrop-filter:blur(40px);
    }
    </style>
    `;

    const MainUIapp = document.getElementById("app");
    if (MainUIapp) {
      MainUIapp.innerHTML = appHtml;
      openModal();
      logseq.showMainUI();
    }

    // 閉じるボタン
    const closeBtn = document.getElementById('closeBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeModal();
        logseq.hideMainUI();
      });
    }

    function closeModal() {
      const appDialog = document.getElementById('appDialog') as HTMLDialogElement;
      if (appDialog) {
        appDialog.close();
      }
    }

    function openModal() {
      const appDialog = document.getElementById('appDialog') as HTMLDialogElement;
      if (appDialog) {
        appDialog.showModal();
      }
    }

    function createTable(data) {
      let table = `<table id="createTable"><thead><tr><th style="background:orange">選択ボタン</th><th>書影カバー</th><th>タイトル</th><th>著者</th><th>出版社</th><th>出版日<small>(推定)</small></th></tr></thead><tbody>`;
      data.forEach((item) => {
        let imgTag: string = "";
        if (item.Item.mediumImageUrl) {
          imgTag = `<img src="${item.Item.mediumImageUrl}"/>`;
        }
        const truncatedTitle = item.Item.title.slice(0, 60);
        item.Item.salesDate = convertSalesDate(item.Item.salesDate);
        table += `<tr>
          <td><input type="radio" name="selected" value="${item.Item.title}"></td>
          <td class="ItemImg">${imgTag}</td>
          <td class="ItemTitle"><a href="${item.Item.affiliateUrl}" target="_blank">${truncatedTitle}</a></td>
          <td>${item.Item.author}</td>
          <td>${item.Item.publisherName}</td>
          <td>${item.Item.salesDate}</td>
        </tr>`;
      });
      table += "</tbody></table>";
      return "<h2>検索結果</h2>\n<p>左側の〇をクリックすると、Logseqにページが作成されます。<small>(タイトルをクリックすると、楽天ブックスの商品ページが開きます)</small></p>\n" + table;
    }

    // 検索フォーム送信時の処理
    const apiKey = "1032240167590752216";
    const affiliateId = "30c0276b.32e8a4ed.30c0276c.b21dc4e8";
    const searchForms = document.querySelectorAll('form');
    if (searchForms) {
      searchForms.forEach((form) => {
        form.addEventListener('submit', (event) => {
          event.preventDefault();
          const input = form.querySelector('input[type="text"]');
          if (input instanceof HTMLInputElement) {
            const inputValue = input.value.trim();
            if (inputValue.length === 0) {
              return;
            }
            const APIelements = "title,author,publisherName,mediumImageUrl,largeImageUrl,salesDate,itemCaption,affiliateUrl";
            let apiUrl;
            if (form.id === 'searchTitle') {
              apiUrl = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&title=${inputValue}&applicationId=${apiKey}&affiliateId=${affiliateId}&elements=${APIelements}`;
            } else if (form.id === 'searchTitle') {
              apiUrl = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&isbn=${inputValue}&applicationId=${apiKey}&affiliateId=${affiliateId}&elements=${APIelements}`;
            } else if (form.id === 'searchAuthor') {
              apiUrl = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&author=${inputValue}&applicationId=${apiKey}&affiliateId=${affiliateId}&elements=${APIelements}`;
            }
            if (apiUrl) {
              fetch(apiUrl)
                .then((response) => response.json())
                .then((data) => {
                  const output = document.getElementById('outputFromAPI');
                  if (output && data.Items) {
                    const Table = createTable(data.Items)
                    output.innerHTML = Table;
                    // ラジオボタンが選択された場合の処理
                    const radioButtons = document.querySelectorAll('input[name="selected"]');
                    if (radioButtons) {
                      radioButtons.forEach((radio) => {
                        radio.addEventListener('change', async (event) => {
                          event.preventDefault();
                          if (event.target instanceof HTMLInputElement) {
                            const selectedTitle = event.target.value;
                            closeModal();
                            const obj = await logseq.Editor.getPage("本/" + selectedTitle) || [];//ページチェック
                            if (Object.keys(obj).length !== 0) {//ページが存在していた場合
                              logseq.hideMainUI();
                              logseq.UI.showMsg("すでにページが存在しています", "warning");
                              openModal();
                              logseq.showMainUI();
                            } else {//ページが存在していない場合
                              Swal.fire({
                                title: "続行しますか？",
                                text: `新しいページを作成します。\n\n[[本/${selectedTitle}]]`,
                                icon: 'info',
                                showCancelButton: true,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                              }).then(async (result) => {
                                if (result.isConfirmed) {//true
                                  //"Reading"ページの作成
                                  const MainPageObj = await logseq.Editor.getPage("Reading") || [];//ページチェック
                                  if (Object.keys(MainPageObj).length === 0) {//ページが存在しない場合
                                    const createMainPage = await logseq.Editor.createPage("Reading", {}, { redirect: false, createFirstBlock: true });
                                    if (createMainPage) {
                                      await logseq.Editor.prependBlockInPage(createMainPage.uuid, "{{query (page-tags Reading)}}");
                                    }
                                  }
                                  //ページを追加する処理
                                  const selectedBook = data.Items.find((item) => item.Item.title === selectedTitle)?.Item;// 選択された書籍の情報を取得
                                  if (selectedBook) {
                                    const userConfigs = await logseq.App.getUserConfigs();
                                    const getDate = await getDateForPage(new Date(selectedBook.salesDate), userConfigs.preferredDateFormat);
                                    let itemProperties = {};
                                    if (selectedBook.author) {
                                      itemProperties["author"] = selectedBook.author;
                                    }
                                    if (selectedBook.publisherName) {
                                      itemProperties["publisher"] = selectedBook.publisherName;
                                    }
                                    if (selectedBook.largeImageUrl) {
                                      itemProperties["cover"] = selectedBook.largeImageUrl;
                                    }
                                    if (getDate) {
                                      itemProperties["sales"] = getDate;
                                    }
                                    itemProperties["tags"] = ["Reading"];
                                    const createPage = await logseq.Editor.createPage(
                                      `本/${selectedTitle}`,
                                      itemProperties,
                                      {
                                        redirect: true,
                                        createFirstBlock: true,
                                      });
                                    if (createPage) {
                                      try {
                                        let content;
                                        if (selectedBook.itemCaption) {
                                          content = `(内容紹介「BOOK」データベースより) | [楽天サイトへ](${selectedBook.affiliateUrl})\n#+BEGIN_QUOTE\n${selectedBook.itemCaption}\n#+END_QUOTE\n`;
                                        } else {
                                          content = `[楽天サイトへ](${selectedBook.affiliateUrl})\n`;
                                        }
                                        await logseq.Editor.prependBlockInPage(createPage.uuid, content);
                                        await Swal.fire(
                                          'ページが作成されました。',
                                          `[[本/${selectedTitle}]]`,
                                          'success'
                                        ).then(async (ok) => {
                                          if (ok) {
                                            //日付とリンクを先頭行にいれる
                                            RecodeDateToPage(userConfigs.preferredDateFormat, "Reading", ` [[本/${selectedTitle}]]`);
                                            logseq.hideMainUI();
                                          }
                                        });
                                      } finally {
                                        const blocks = await logseq.Editor.getPageBlocksTree(`本/${selectedTitle}`);
                                        if (blocks) {
                                          await logseq.Editor.editBlock(blocks[0].uuid);
                                          await setTimeout(function () {
                                            logseq.Editor.insertAtEditingCursor(",");//ページプロパティを配列として読み込ませる処理
                                          }, 200);
                                        }
                                      }
                                    }
                                  }

                                } else {//作成キャンセルボタン
                                  logseq.hideMainUI();
                                  await logseq.UI.showMsg("キャンセルしました", "warning");
                                  openModal();
                                  logseq.showMainUI();
                                }
                              });
                            }
                          }
                        });
                      });
                    }

                  }
                })
                .catch((error) => {
                  console.error(error);
                });
            }
          }
        });
      });
    }

    async function RecodeDateToPage(userDateFormat, ToPageName, pushPageLink) {
      const blocks = await logseq.Editor.getPageBlocksTree(ToPageName);
      if (blocks) {
        //ページ先頭行の下に追記
        const content = getDateForPage(new Date(), userDateFormat) + pushPageLink;
        await logseq.Editor.insertBlock(blocks[0].uuid, content, { sibling: false });
      }
    }


    function convertSalesDate(salesDate: string): string {
      // 日付の正規表現を定義します。
      const regex = /(\d{4})年(\d{1,2})月(\d{1,2})日?/;

      // 上旬/中旬/下旬や頃、以降などの表現をYYYY/MM/DDに変換するための対応表を作成します。
      const approximateDates: { [key: string]: string } = {
        "上旬": "01",
        "中旬": "15",
        "下旬": "21",
        "頃": "",
        "以降": ""
      };

      // 正規表現で発売日から年月日を抜き出します。
      const match = salesDate.match(regex);

      // DDが得られない場合は、毎月1日として扱います。
      let year = "";
      let month = "";
      let day = "";
      if (match) {
        year = match[1];
        month = match[2];
        day = match[3] || "01";
      } else {
        year = "";
        month = "";
        day = "01";
      }

      // 発売日が未確定の場合は、空の値にします。
      let result = "";
      if (!match) {
        result = "";
      } else {
        // YYYY/MM/DD形式に変換します。
        result = `${year}/${month.padStart(2, "0")}/${day.padStart(2, "0")}`;
      }

      return result;
    }

    console.log(`#${pluginId}: open_toolbar end`);//console
  }
};

logseq.ready(model, main).catch(console.error);