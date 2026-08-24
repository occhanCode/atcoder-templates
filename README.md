# AtCoder Templates

AtCoder で使用している個人用テンプレートと補助ツールです。

コンテスト中に利用する可能性がある汎用コードを、事前に公開しておく目的も兼ねています。問題固有の解答コードではなく、通常問題・AHC で共通して使うテンプレートや変換ツールを置いています。

## 構成

```text
.
├─ src/
│  └─ main.ts              TypeScript テンプレート
├─ cpp/
│  └─ main.cpp             C++17 / AHC 用テンプレート
├─ ts2cpp/
│  ├─ README.md            TypeScript → C++ 変換ツールの説明
│  └─ ts_main_to_cpp.mjs   TypeScript → C++17 変換ツール
└─ README.md
```

### `src/main.ts`

普段の AtCoder で使用している TypeScript テンプレートです。

入力・出力、各種データ構造・アルゴリズムに加え、AHC 用の `Timer` / `RNG` / `Annealing` も含んでいます。

基本的には `main()` の中だけを書き換えて使用します。

### `cpp/main.cpp`

主に AHC で使用する C++17 テンプレートです。

`Timer`、高速乱数 `RNG`、`Annealing`、Zobrist Hash、Rollback、Beam Search、Multi Start など、ヒューリスティックコンテストでよく使う部品を含んでいます。

C++ で直接実装するときの土台として使うほか、`ts2cpp` の `--cpp-template` に渡すテンプレートとしても使用します。

### `ts2cpp/`

TypeScript で書いた AtCoder 用 `main()` を C++17 に変換するための自作ツールです。

正規表現による単純置換ではなく、TypeScript 公式パーサーの AST を使って変換します。特に「TypeScript で方針を実装し、AHC の提出時には C++ に変換する」用途を想定しています。

詳しい使い方は [`ts2cpp/README.md`](./ts2cpp/README.md) を参照してください。

## 基本的な使い分け

通常のアルゴリズム問題では `src/main.ts` を使用します。

AHC では、C++ で直接書く場合は `cpp/main.cpp` を使用します。TypeScript で実装したものを C++ 化したい場合は `ts2cpp` を使い、`src/main.ts` の `main()` を `cpp/main.cpp` の `main()` へ変換・統合します。

## 注意

このリポジトリは個人用テンプレートとして継続的に更新しています。`ts2cpp` は一般的な TypeScript プログラムを完全に C++ へ変換することを目的としたトランスパイラではなく、このテンプレートと AtCoder のコードを主対象としています。
