# ts2cpp

AtCoder 向けの **TypeScript `main()` → C++17** 変換ツールです。

TypeScript 公式パーサーで AST を解析し、主に `src/main.ts` の `main()` を C++17 に変換します。AHC で「TypeScript で実装・検証し、提出時は C++ に変換する」使い方を想定しています。

## 必要なもの

- Node.js
- TypeScript パッケージ
- `g++`（`--check` を使う場合）

バージョン確認:

```powershell
node .\ts2cpp\ts_main_to_cpp.mjs --version
```

## 推奨する使い方

リポジトリのルートで次を実行します。

```powershell
node .\ts2cpp\ts_main_to_cpp.mjs .\src\main.ts `
  --cpp-template .\cpp\main.cpp `
  --strict `
  --check `
  --stats `
  -o .\Main.cpp
```

このコマンドでは、`src/main.ts` の `main()` を変換し、`cpp/main.cpp` にある `int main()` と差し替えて `Main.cpp` を生成します。

AHC 用の `Timer` / `RNG` / `Annealing` は、`--cpp-template` 使用時には C++ テンプレート側の実装を利用します。

## `number` を実数として扱う場合

TypeScript の `number` だけからは、C++ 側で整数にすべきか `double` にすべきか完全には判定できません。

例えば入力変数 `p` を実数として扱いたい場合は、`--double` を指定します。

```powershell
node .\ts2cpp\ts_main_to_cpp.mjs .\src\main.ts `
  --cpp-template .\cpp\main.cpp `
  --double p `
  --strict `
  --check `
  -o .\Main.cpp
```

複数指定する場合:

```powershell
--double p,q,x
```

## C++ テンプレートを使わずに変換する

変換ツール自身が最小限の C++ ヘッダー等を生成することもできます。

```powershell
node .\ts2cpp\ts_main_to_cpp.mjs .\src\main.ts `
  --strict `
  --check `
  -o .\Main.cpp
```

## `main()` だけ出力する

既存の C++ ファイルへ手動で貼り付けたい場合:

```powershell
node .\ts2cpp\ts_main_to_cpp.mjs .\src\main.ts `
  --main-only `
  --strict `
  -o .\converted_main.cpp
```

`--main-only` では、変換した `int main()` と、その `main()` に必要な汎用補助関数を出力します。

`main()` の中身だけ欲しい場合は `--body-only` を使えます。

## 主なオプション

| オプション | 説明 |
|---|---|
| `-o`, `--output` | 出力ファイルを指定 |
| `--cpp-template FILE` | 指定した C++ テンプレートの `int main()` を変換結果で置換 |
| `--double p,q` | 指定変数を C++ 側で実数として扱う |
| `--deps` | `main()` から必要な依存定義を抽出して出力。デフォルト ON |
| `--no-deps` | 依存定義の自動出力を無効化 |
| `--warnings` | 変換時の警告を表示 |
| `--strict` | 警告が1つでもあれば終了コードを非0にする |
| `--check` | 生成C++を `g++ -std=c++17 -fsyntax-only` で構文チェック |
| `--stats` | 出力サイズ・行数・警告数などを表示 |
| `--main-only` | `int main()` と必要な補助関数だけを出力 |
| `--body-only` | `main()` の本体だけを出力 |
| `--version` | バージョン表示 |
| `--help` | 簡易ヘルプ表示 |

`--cpp-template` と `--main-only` / `--body-only` は同時には使用できません。

## インタラクティブ問題

AHC015 などのインタラクティブ形式向けに、テンプレートの次の書き方にも対応しています。

```ts
let p = Number(await nextAwait());
console.log("F");
```

C++ では入力を `cin` に変換し、`console.log(...)` は `endl` を使って出力するため、そのターンで flush されます。

## 変換時の注意

このツールは **汎用 TypeScript → C++ コンパイラではありません**。AtCoder で普段使用する書き方を優先して順次対応しています。

特に次の点に注意してください。

- TypeScript の `number` は、特に指定がなければ整数として推論される箇所があります。実数入力は `--double` を利用してください。
- TypeScript と C++ では文字列・数値・コンテナなどの細かな意味論が異なります。変換後の確認を推奨します。
- `BigInt` を C++ の任意精度整数へ完全変換するツールではありません。64bit を超える値を必要とするコードは特に注意してください。
- 任意の class / interface / 複雑なオブジェクト型を完全に C++ class/struct へ変換できるわけではありません。
- 新しい TypeScript の書き方を使った場合、未対応構文について警告が出ることがあります。

実戦では基本的に `--strict --check --stats` を付け、生成された `Main.cpp` を一度確認してから提出することを推奨します。

## 現在対応している主な AtCoder 向け要素

通常の配列・ループ・条件分岐・分割代入などに加え、これまで必要になった AtCoder/AHC 向けパターンを順次追加しています。

例:

```ts
let [N,M] = nextNums(2);
let A = nextNums(N).map(v => v-1);
[A,B] = [B,A];
```

TypedArray、文字列処理、`Number(...)`、`Math.min/max` の数値型調整、ラベル付きループ、`findIndex`、一部の `Array.from`、AHC 用 `Timer` / `RNG` / `Annealing`、インタラクティブ入力などにも対応しています。

未対応・不完全な構文は今後必要に応じて追加していきます。
