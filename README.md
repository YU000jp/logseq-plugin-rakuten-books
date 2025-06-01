# Logseq Plugin: Rakuten-Books

- Utilize Rakuten books API to import book data
> Rakuten books is a site from Japan.

> [!NOTE]
> このプラグインは、Logseq ファイルベースのグラフで動作します。データベースのグラフでは動作しません。

<div align="right">

[![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-rakuten-books)](https://github.com/YU000jp/logseq-plugin-rakuten-books/releases)
[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-rakuten-books?color=blue)](https://github.com/YU000jp/logseq-plugin-rakuten-books/blob/main/LICENSE)
<a href="https://www.buymeacoffee.com/yu000japan"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=yu000japan&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>
</div>

### 概要

- [楽天ブックス](https://books.rakuten.co.jp/book/?l-id=ebook-header-navi-book)あるいは[楽天Kobo](https://books.rakuten.co.jp/e-book/computer/?l-id=parts-genrenavi-e-book-computer)のデータベースを検索し、Logseqに書籍のページを作成するプラグインです。
> 利用にあたって楽天アカウントは一切不要です

## Demo

![LogseqRakuten](https://user-images.githubusercontent.com/111847207/227758156-1c8e8526-230f-4934-bc97-96ed50066d88.gif)

## インストールと使い方

### マーケットプレースからインストール

1. 右上ツールバーの[---]を押し、[プラグイン]を開きます。
1. マーケットプレースを選択してください。
1. 検索欄に`Rakuten`と入力し、検索結果から選び、インストールしてください。

![image](https://user-images.githubusercontent.com/111847207/229358697-3c69ef94-901e-4233-a231-255f57319a47.png)

### 使い方

1. 右上ツールバーにある`G`ボタンを押して、キーワード入力画面を開いてください。

   ![image](https://github.com/YU000jp/logseq-plugin-rakuten-books/assets/111847207/c7bb87ff-058c-45c3-a740-2442ec36a480)

   ![image](https://github.com/YU000jp/logseq-plugin-rakuten-books/assets/111847207/92aa88bb-7dda-4237-8b3d-2f0200d38deb)
1. 検索結果がでたら、左側の選択ボタンを押すと、書籍ページの作成が開始されます。

   ![image](https://github.com/YU000jp/logseq-plugin-rakuten-books/assets/111847207/cbe32c20-9b6d-4ae3-861f-4aecbc0ea4f3)

1. プラグインがRakuten Books APIから書籍情報を取得し、ページを作成します。
   
   ![image](https://github.com/YU000jp/logseq-plugin-rakuten-books/assets/111847207/954ca104-8310-43ba-b37f-d30ef37e5285)

### 読書メモをとる方法

- パターン1-> ジャーナルなどのページから、リンクやタグ(`#[[本/タイトル]]`)をつけて、入れ子にする
- パターン2-> 書籍のページに直接書く (日付リンクをつければ、1ページ内で、後からいつ書いたのかが分かるので便利)
- パターン3-> 書籍のページにサブページを作成し、そのページに書く (サブページの例：`本/タイトル/感想`)

## 備考

### プラグインによって作成されるページ

1. `Reading`という、まとめページが作成されます。クエリーがデフォルトで設置されています。
1. 各書籍のページ (`本/タイトル`もしくは`電子書籍/タイトル`のような形式)

### 書影カバー画像について

1. プラグインによってその画像を取得し、`assets/storages/Rakuten-books/` フォルダに保存します。
   > プラグイン設定で、保存をオフにすることも可能です。

### データベースの情報について

- [楽天ブックス](https://books.rakuten.co.jp/book/?l-id=ebook-header-navi-book)および[楽天Kobo](https://books.rakuten.co.jp/e-book/computer/?l-id=parts-genrenavi-e-book-computer)が提供するAPIを利用し、そのデータベースから書籍情報を取得しています。発売日などの項目は確定情報とは異なる場合があります

## Credit

- [楽天ブックス書籍検索API (version:2017-04-04)](https://webservice.rakuten.co.jp/documentation/books-book-search)
- [楽天Kobo電子書籍検索API (version:2017-04-26)](https://webservice.rakuten.co.jp/documentation/kobo-ebook-search#aboutAffili)
- アイコン > [icooon-mono.com](https://icooon-mono.com/11122-%e3%81%88%e3%82%93%e3%81%b4%e3%81%a4%e4%bb%98%e3%81%8d%e3%81%ae%e3%83%8e%e3%83%bc%e3%83%88%e3%82%a2%e3%82%a4%e3%82%b3%e3%83%b3/)
- 製作者 > [@YU000jp](https://github.com/YU000jp)
