export const convertSalesDate = (salesDate: string): string => {
  // 日付の正規表現を定義します。
  const regex = /(\d{4})年(\d{1,2})月(\d{1,2})日?/

  // 上旬/中旬/下旬や頃、以降などの表現をYYYY/MM/DDに変換するための対応表を作成します。
  const approximateDates: { [key: string]: string}  = {
    "上旬": "1日",
    "中旬": "15日",
    "下旬": "21日",
    "頃": "1日",
    "以降": "1日"
  }
  //salesDateの中にapproximateDatesのキーと一致する文字列があれば、置換する
  for (const key in approximateDates) {
    salesDate = salesDate.replace(key, approximateDates[key])
  }

  // 正規表現で発売日から年月日を抜き出します。
  const match = salesDate.match(regex)

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
