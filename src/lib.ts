import { AppUserConfigs, BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { getDateForPage } from 'logseq-dateutils'
import '@logseq/libs' //https://plugins-doc.logseq.com/

export const convertSalesDateRakuten = (salesDate: string): string => {


  // 上旬/中旬/下旬や頃、以降などの表現をYYYY/MM/DDに変換するための対応表を作成します。
  const approximateDates: { [key: string]: string } = {
    "上旬": "1日",
    "中旬": "15日",
    "下旬": "21日",
    "頃": "1日",
    "以降": "1日"
  }
  //salesDateの中にapproximateDatesのキーと一致する文字列があれば、置換する
  for (const key in approximateDates)
    salesDate = salesDate.replace(key, approximateDates[key])

  // 正規表現で発売日から年月日を抜き出します。
  const match = salesDate.match(/(\d{4})年(\d{1,2})月(\d{1,2})日?/) || salesDate.match(/(\d{4})年(\d{1,2})月/)

  // DDが得られない場合は、毎月1日として扱います。
  let year = ""
  let month = ""
  let day = ""
  if (match) {
    year = match[1]
    month = match[2]
    day = match[3] || "01"
  } else {
    year = ""
    month = ""
    day = "01"
  }

  return !match ?
    "" // 発売日が未確定の場合は、空の値にします。
    : `${year}/${month.padStart(2, "0")}/${day.padStart(2, "0")}` // YYYY/MM/DD形式に変換します。
}

export function closeModal() {
  const appDialog = document.getElementById('appDialog') as HTMLDialogElement
  if (appDialog) {
    appDialog.close()
  }
}

export function openModal() {
  const appDialog = document.getElementById('appDialog') as HTMLDialogElement
  if (appDialog) {
    appDialog.showModal()
  }
}

export function setCloseButton() {
  const closeBtn = document.getElementById('closeBtn') as HTMLButtonElement
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeModal()
      logseq.hideMainUI()
    })
  }
}

export function setMainUIapp(appHtml: string) {
  const MainUIapp = document.getElementById("app") as HTMLDivElement
  if (MainUIapp) {
    MainUIapp.innerHTML = appHtml
    openModal()
    logseq.showMainUI()
  }
}

export const RecodeDateToPage = async (
  userDateFormat: AppUserConfigs["preferredDateFormat"],
  ToPageName: string,
  pushPageLink: string
) => {
  const blocks = await logseq.Editor.getPageBlocksTree(ToPageName) as BlockEntity[]
  if (blocks)
    //ページ先頭行の下に追記
    await logseq.Editor.insertBlock(blocks[0].uuid,
      (getDateForPage(new Date(), userDateFormat) + pushPageLink),
      { sibling: false })
}
