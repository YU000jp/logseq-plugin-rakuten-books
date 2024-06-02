// 上旬/中旬/下旬や頃、以降などの表現をYYYY/MM/DDに変換するための対応表を作成します。
const approximateDates: { [key: string]: string}  = {
  "上旬": "1日",
  "中旬": "15日",
  "下旬": "21日",
  "頃": "1日",
  "以降": "1日"
}

export const convertSalesDateRakuten = (salesDate: string): string => {

  // 正規表現で発売日から年月日を抜き出します。
  let match = salesDate.match(/(\d{4})年(\d{1,2})月(\d{1,2})日?/)

  if (!match) {
    match = salesDate.match(/(\d{4})年(\d{1,2})月/)
    if (match)
      match[3] = "1"
    else {
      //salesDateの中にapproximateDatesのキーと一致する文字列があれば、置換する
      for (const key in approximateDates)
        salesDate = salesDate.replace(key, approximateDates[key])
      match = salesDate.match(/(\d{4})年(\d{1,2})月(\d{1,2})日?/)
      if (!match)
        return "" // 発売日が未確定の場合は、空の値にします。
    }
  }


  // YYYY/MM/DD形式に変換します。
  const date = new Date(`${match[1]}/${match[2].padStart(2, "0")}/${match[3].padStart(2, "0")}`)
  if (isNaN(date.getTime())) return "" // 日付が不正な場合は、空の値にします。
  return date.toLocaleDateString()
}
