# 漢字書き順アニメーション

漢字の書き順をアニメーションで表示する Web アプリケーションです。

## 特徴

- 漢字一文字の書き順をアニメーションで表示
- 表示速度の調整が可能
- モバイル対応のレスポンシブデザイン
- シンプルで使いやすいインターフェース

## 使用方法

1. テキストボックスに漢字を 1 文字入力します
2. 「表示」ボタンをクリックするか、Enter キーを押します
3. スライダーで表示速度を調整できます
4. 「クリア」ボタンで入力をリセットできます

## 技術仕様

- HTML5
- CSS3
- JavaScript (ES6+)
- [SVG.js](https://svgjs.dev/docs/3.0/) - SVG アニメーション用ライブラリ
- [KanjiVG](http://kanjivg.tagaini.net/) - 漢字データ

## 必要環境

- モダンな Web ブラウザ（Chrome, Firefox, Safari, Edge 最新版）

## 開発者向け情報

### セットアップ

1. リポジトリをクローン

```bash
git clone https://github.com/yourusername/kanji-stroke-order.git
```

2. 必要な SVG ファイルを `bin` ディレクトリに配置
3. ローカルサーバーで実行

## ライセンス

このプロジェクトは以下のライセンスに基づいて提供されています：

- コードベース: [Creative Commons Attribution-ShareAlike 3.0 License](https://creativecommons.org/licenses/by-sa/3.0/)
- 漢字データ: KanjiVG (Copyright (C) 2009-2018 Ulrich Apel) [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)

## 謝辞

- KanjiVG データの作成者: Ulrich Apel 氏
