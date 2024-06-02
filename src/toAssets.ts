import { IAsyncStorage } from "@logseq/libs/dist/modules/LSPlugin.Storage"
import '@logseq/libs' //https://plugins-doc.logseq.com/

export const checkAssets = async (imgUrl: string, itemProperties: {}) => {
  const storage = logseq.Assets.makeSandboxStorage() as IAsyncStorage
  const name = (imgUrl.split("/").pop())!.split("?")[0] //nameの?以降を削除
  if (name === ""
    || await storage.hasItem(name) as boolean) //チェック
    itemProperties["cover"] = imgUrl //アセットに保存済みの場合
  else
    await saveToAssets(imgUrl, storage, name, itemProperties)//画像をアセットに保存
}
const saveToAssets = async (imgUrl: string, storage: IAsyncStorage, name: string, itemProperties: {}) => {
  const response = await fetch(imgUrl)
  const blob = await response.blob()
  const fileReader = new FileReader()
  fileReader.onload = () =>
    storage.setItem(name, fileReader.result as string)
  fileReader.readAsArrayBuffer(blob)
  itemProperties["cover"] = `![${name}](../assets/storages/${logseq.baseInfo.id}/${name})`
}
