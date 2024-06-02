# Logseq Plugin: Rakuten-Books

- Utilize Rakuten books API to import book data

> Rakuten books is a site from Japan.

- [楽天ブックス](https://books.rakuten.co.jp/book/?l-id=ebook-header-navi-book)あるいは[楽天Kobo](https://books.rakuten.co.jp/e-book/computer/?l-id=parts-genrenavi-e-book-computer)のデータベースを検索し、Logseqに書籍名ページを作成するプラグイン

> 手持ちの本で読書メモをとる際にすばやく活用できると思います。(利用にあたって楽天アカウントは一切不要です)

[![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-rakuten-books)](https://github.com/YU000jp/logseq-plugin-rakuten-books/releases)
[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-rakuten-books?color=blue)](https://github.com/YU000jp/logseq-plugin-rakuten-books/blob/main/LICENSE)

## Demo

![LogseqRakuten](https://user-images.githubusercontent.com/111847207/227758156-1c8e8526-230f-4934-bc97-96ed50066d88.gif)

## インストールと使い方

### マーケットプレースからインストール

- 右上ツールバーの[---]を押し、[プラグイン]を開く

- マーケットプレースを選択する

- 検索欄に`Rakuten`と入力し、検索結果から選び、インストールする

![image](https://user-images.githubusercontent.com/111847207/229358697-3c69ef94-901e-4233-a231-255f57319a47.png)

### 書籍のページをつくる

- 右上ツールバーにある`R`ボタンを押す

- 検索フォームに入力し、検索結果がでたら、左側の選択ボタンを押す

- プラグインによって、Rakuten APIからの情報をもとにページが作成される

### 読書メモをとる

- パターン1-> 日誌などの他のページからからリンクやタグ(`#[[本/タイトル]]`あるいは`#[[電子書籍/タイトル]]`)をつけて、入れ子にする

- パターン2-> 書籍のページに直接書く (この場合、日付リンクをつけると後からいつ書いたのかが分かるので便利です)

- パターン3-> 書籍のページのサブページを作成し、そのページに書く (サブページの例：`本/タイトル/感想`)

## 備考

### プラグインによって作成されるページ

- `Reading`というページに、ページリストがクエリーで表示されます

- 各書籍のページ (`本/タイトル`もしくは`電子書籍/タイトル`のような形式)

### データベースの情報について

- [楽天ブックス](https://books.rakuten.co.jp/book/?l-id=ebook-header-navi-book)および[楽天Kobo](https://books.rakuten.co.jp/e-book/computer/?l-id=parts-genrenavi-e-book-computer)が提供するAPIを利用し、そのデータベースから書籍情報を取得しています。発売日などの項目は確定情報とは異なる場合があります

## Credit

- [楽天ブックス書籍検索API (version:2017-04-04)](https://webservice.rakuten.co.jp/documentation/books-book-search)
- [楽天Kobo電子書籍検索API (version:2017-04-26)](https://webservice.rakuten.co.jp/documentation/kobo-ebook-search#aboutAffili)
- [icooon-mono.com](https://icooon-mono.com/11122-%e3%81%88%e3%82%93%e3%81%b4%e3%81%a4%e4%bb%98%e3%81%8d%e3%81%ae%e3%83%8e%e3%83%bc%e3%83%88%e3%82%a2%e3%82%a4%e3%82%b3%e3%83%b3/)
