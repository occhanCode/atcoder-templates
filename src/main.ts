// start

import * as fs from "node:fs";

function main() {
  // ここに処理を記述します

  

  // 処理終了
}

const less = <T>(a: T, b: T) => (a == b ? 0 : a < b ? -1 : 1)
const greater = <T>(a: T, b: T) => (a == b ? 0 : a < b ? 1 : -1)
const bigIntMax = (...args: bigint[]) => args.reduce((m, e) => (e > m ? e : m))
const bigIntMin = (...args: bigint[]) => args.reduce((m, e) => (e < m ? e : m))
const bigIntAbs = (arg: bigint) => (arg < 0 ? -arg : arg)
/**
 * 説明: 非負 bigint n の床平方根 floor(sqrt(n)) を正確に返す。
 * 使い方: let x = bigIntSqrt(n)
 * 計算量: O(log bit長)
 */
const bigIntSqrt = (n: bigint): bigint => {
  if (n < 0n) {
    throw new RangeError("square root of negative bigint");
  }
  if (n < 2n) return n;
  let bitLength = n.toString(2).length;
  let x = 1n<<BigInt((bitLength+1)>>1);
  while (true) {
    let next = (x+n/x)>>1n;
    if (next >= x) return x;
    x = next;
  }
}

let inputs = "";
let inputArray: string[];
let currentIndex = 0;

let outputBuffer = "";

let yes = "Yes";
let no = "No";
let MOD998244353 = 998244353;
let small_a_code = 97;
let big_A_code = 65;

let dxy4 = [[-1,0],[0,1],[1,0],[0,-1]];
let dxy8 = [[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];
let dir4 = ["U","R","D","L"];

// // インタラクティブ用
// // お決まりのインプットはコメントアウト、main関数にasyncを忘れない
// // 詳しくは典型ABC305-Fをチェック
// const readline = require("readline");
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });
// const it = rl[Symbol.asyncIterator]();
// const nextAwait = async () => {
//   const { value } = await it.next();
//   return value.trim();
// };

function next() {
  return inputArray[currentIndex++];
}
function nextNum() {
  return +next();
}
function nextBigInt() {
  return BigInt(next());
}
function nexts(length: number) {
  const arr: string[] = [];
  for(let i = 0; i < length; ++i) arr[i] = next();
  return arr;
}
function nextNums(length: number) {
  const arr: number[] = [];
  for(let i = 0; i < length; ++i) arr[i] = nextNum();
  return arr;
}
function nextBigInts(length: number) {
  const arr: bigint[] = [];
  for(let i = 0; i < length; ++i) arr[i] = nextBigInt();
  return arr;
}

function print(out: string | number | bigint): void;
function print<T>(out: Array<T>, separator: string): void;
function print<T>(out: string | number | bigint | Array<T>, separator?: string) {
  if (Array.isArray(out)) {
    outputBuffer += out.join(separator);
  } else {
    outputBuffer += out;
  }
}

function println(out: string | number | bigint): void;
function println<T>(out: Array<T>, separator: string): void;
function println<T>(out: string | number | bigint | Array<T>, separator?: string) {
  if (Array.isArray(out)) {
    print(out, separator || "");
  } else {
    print(out);
  }
  print("\n");
}

function flush() {
  if (outputBuffer.length == 0) return;
  console.log(
    outputBuffer.endsWith("\n")
      ? outputBuffer.slice(0,-1)
      : outputBuffer
  );
}

function intDiv(a: number, b: number): number {
  return Math.trunc(a / b);
}

function lowerBound<T, U>(list: T[], value: U,
  less: (l: T, r: U) => boolean = (l: T, r: U) => l as any < r
): number {
  let count = list.length;
  let first = 0;
  while (0 < count) {
    const count2 = count / 2 | 0;
    const mid = first + count2;
    if (less(list[mid], value)) {
      first = mid + 1;
      count -= count2 + 1;
    } else {
      count = count2;
    }
  }
  return first;
}

function upperBound<T, U>(list: T[], value: U,
  less: (l: U, r: T) => boolean = (l: U, r: T) => l as any < r
): number {
  return lowerBound(list,value,(l,r)=>!less(r,l));
}

function nextPermutation(arr: any) {
  const len = arr.length;
  let left = len - 2;
  while (left >= 0 && arr[left] >= arr[left+1]){
    left--;
  }
  if (left < 0){
    return false;
  }
  let right = len - 1;
  while (arr[left] >= arr[right]){
    right--;
  }
  const t = arr[left];
  arr[left] = arr[right];
  arr[right] = t;
  left++;
  right = len - 1;
  while (left < right) {
    const t = arr[left];
    arr[left] = arr[right];
    arr[right] = t;
    left++;
    right--;
  }
  return true;
}

function gcd(a: number, b: number): number;
function gcd(a: bigint, b: bigint): bigint;
function gcd(a: number | bigint, b: number | bigint): number | bigint {
  if (b == 0 || b ==BigInt(0)) {
    return a;
  }
  if (typeof a === 'number' && typeof b === 'number') {
    const r = a % b;
    return gcd(b, r);
  } else if (typeof a === 'bigint' && typeof b === 'bigint') {
    const r = a % b;
    return gcd(b, r);
  }
  return 0;
}


function lcm(a: bigint, b: bigint): bigint {
  if (a == 0n || b == 0n) return 0n
  return a/gcd(a,b)*b;
}

/**
 * ax+by=gcd(|a|,|b|)
 * を満たす [g,x,y] を返す
 */
function extGcdBigInt(
  a: bigint,
  b: bigint
): [bigint,bigint,bigint] {
  let signA = a < 0n ? -1n : 1n;
  let signB = b < 0n ? -1n : 1n;
  a = bigIntAbs(a);
  b = bigIntAbs(b);
  let oldR = a;
  let r = b;
  let oldX = 1n;
  let x = 0n;
  let oldY = 0n;
  let y = 1n;
  while (r != 0n) {
    let q = oldR/r;
    [oldR,r] = [
      r,
      oldR-q*r
    ];
    [oldX,x] = [
      x,
      oldX-q*x
    ];
    [oldY,y] = [
      y,
      oldY-q*y
    ];
  }
  return [
    oldR,
    oldX*signA,
    oldY*signB
  ];
}

function eratosthenesPrime(N = 10**6) {
  if (N < 2) return [];
  let b = Array<boolean>(N+1).fill(true);
  b[0]=false;
  b[1]=false;
  let prime = [2];
  for (let i = 4; i <= N; i+=2) {
    b[i] = false;
  }
  for (let i = 3; i <= N; i+=2) {
    if (b[i]) {
      prime.push(i);
      for (let j = i*i; j <= N; j+=i*2) {
        b[j] = false;
      }
    }
  }
  return prime;
}

// ソートなし約数列挙
function enumDiv(n: any) {
  const res: number[] = []
  for (let i = 1; i*i <= n; i++) {
    if (n%i == 0) {
      res.push(i);
      if (i*i != n) res.push(intDiv(n,i));
    }
  }
  return res;
}

// https://atcoder.jp/users/nanana1o
declare global {
  interface Number {
    add(a: number): number
    sub(a: number): number
    mul(a: number): number
    pow(n: number | bigint): number
    div(a: number): number
  }
}

function useModint(M: number) {
  Number.prototype.add = function (a: number) {
    const t = (+this + a) % M
    return t < 0 ? t + M : t
  }
  Number.prototype.sub = function (a: number) {
    const t = (+this - a) % M
    return t < 0 ? t + M : t
  }
  Number.prototype.mul = function (a: number) {
    const s = +this
    const t = s * a
    return t <= Number.MAX_SAFE_INTEGER
      ? t % M
      : ((((s >> 16) * a) % M) * 65536 + (s & 65535) * a) % M
  }
  Number.prototype.pow = function (n: number | bigint) {
    let x = +this
    let r = 1
    if (typeof n == "number") {
      if (!Number.isSafeInteger(n) || n < 0) {
        throw new RangeError(
          "exponent must be a non-negative safe integer"
        );
      }
      for (
        ;
        n > 0;
        x = x.mul(x), n = Math.floor(n/2)
      ) {
        if (n%2 == 1) r = r.mul(x)
      }
    } else {
      if (n < 0n) {
        throw new RangeError("exponent must be non-negative");
      }
      for (; n; x = x.mul(x), n >>= 1n) {
        if (n&1n) r = r.mul(x)
      }
    }
    return r
  }
  Number.prototype.div = function (a: number) {
    return this.mul(a.pow(M - 2))
  }
}

/**
 * 説明:
 *   Number.MAX_SAFE_INTEGER を超える可能性がある積を
 *   正確に MOD で割った余りにする。
 *   0 <= a < 2^31 を前提とする。
 *
 * 使い方:
 *   let x = modMul(a,b,MOD);
 *
 * 計算量:
 *   O(1)
 */
function modMul(
  a: number,
  b: number,
  MOD: number
): number {
  let t = a*b;
  if (t <= Number.MAX_SAFE_INTEGER) {
    return t%MOD;
  }
  return ((((a>>16)*b)%MOD)*65536+(a&65535)*b)%MOD;
}

function bigint_mod_pow(x: bigint, n: bigint, p: bigint) {
  if (n < 0n) {
    throw new RangeError("exponent must be non-negative");
  }
  if (p <= 0n) {
    throw new RangeError("modulus must be positive");
  }
  x %= p;
  if (x < 0n) x += p;
  let r = 1n%p;
  for (; n; x = x*x%p, n >>= 1n) {
    if (n&1n) r = r*x%p;
  }
  return r;
}

/**
 * 説明: 階乗と逆階乗を前計算し、nCr/nPr/nHr を高速に計算する。useModint(MOD) 後に使う。
 * 使い方: let comb = new CombMod(MAX); comb.nCr(n,r)
 * 計算量: 前計算 O(MAX)、各クエリ O(1)
 */
class CombMod {
  fac: Float64Array;
  finv: Float64Array;
  /**
   * @param max_n 求める最大の N を指定
   */
  /**
   * 説明: 階乗・逆階乗を max_n まで前計算する
   * 使い方: new CombMod(max_n)
   * 計算量: O(max_n)
   */
  constructor(max_n: number) {
    // max_n が 0 や 1 の場合でもエラーにならないよう、最低サイズ2を確保
    let size = Math.max(2, max_n + 1);
    this.fac = new Float64Array(size);
    this.finv = new Float64Array(size);
    this.fac[0] = 1;
    this.fac[1] = 1;
    this.finv[0] = 1;
    this.finv[1] = 1;
    // 階乗の計算
    for (let i = 2; i <= max_n; i++) {
      this.fac[i] = this.fac[i-1].mul(i);
    }
    // 逆元の計算 (一番大きいところだけ .div() を使い、あとは掛け算で降下する最速手法)
    if (max_n >= 2) {
      this.finv[max_n] = (1).div(this.fac[max_n]);
      for (let i = max_n-1; i >= 2; i--) {
        this.finv[i] = this.finv[i+1].mul(i+1);
      }
    }
  }
  /**
   * 説明: 組み合わせ nCr を返す
   * 使い方: comb.nCr(n,r)
   * 計算量: O(1)
   */
  nCr(n: number, r: number): number {
    if (n < r || n < 0 || r < 0) return 0;
    return this.fac[n].mul(this.finv[r]).mul(this.finv[n-r]);
  }
  /**
   * 説明: 順列 nPr を返す
   * 使い方: comb.nPr(n,r)
   * 計算量: O(1)
   */
  nPr(n: number, r: number): number {
    if (n < r || n < 0 || r < 0) return 0;
    return this.fac[n].mul(this.finv[n-r]);
  }
  /**
   * 説明: 重複組合せ nHr を返す
   * 使い方: comb.nHr(n,r)
   * 計算量: O(1)
   */
  nHr(n: number, r: number): number {
    if (n < 0 || r < 0) return 0;
    if (n == 0 && r == 0) return 1;
    return this.nCr(n+r-1, r);
  }
}

/**
 * 説明: 最長増加部分列の長さを返す。狭義増加
 * 使い方: let len = LIS(A)
 * 計算量: O(N log N)
 */
function LIS(arr: number[]) {
  let dp: number[] = [];
  for (let num of arr) {
    let lb = lowerBound(dp,num);
    if (lb == dp.length) {
      dp.push(num);
    } else {
      dp[lb] = num;
    }
  }
  return dp.length;
}

/**
 * 説明: 配列から k 個選ぶ全組合せを列挙する
 * 使い方: let cs = combinations(A,k)
 * 計算量: O(C(N,k) * k)
 */
function combinations<T>(arr: T[], k: number): T[][] {
  const result: T[][] = [];
  const combo: T[] = [];

  function dfs(start: number) {
    if (combo.length === k) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      dfs(i + 1);
      combo.pop();
    }
  }

  dfs(0);
  return result;
}

/**
 * 説明: number/bigint の立っているビット数を数える
 * 使い方: builtin_popcount(mask)
 * 計算量: O(bit数)
 */
function builtin_popcount(n: number | bigint): number {
  let count = 0;
  if (typeof n == "number") {
    if (!Number.isSafeInteger(n) || n < 0) {
      throw new RangeError(
        "n must be a non-negative safe integer"
      );
    }
    while (n > 0) {
      count += n%2;
      n = Math.floor(n/2);
    }
    return count;
  }
  if (n < 0n) {
    throw new RangeError(
      "n must be a non-negative bigint"
    );
  }
  while (n > 0n) {
    count += Number(n&1n);
    n >>= 1n;
  }
  return count;
}

/**
 * 説明: NTT で多項式畳み込みをする。primitive root=3 の素数MODを前提とする。
 *   関数内で useModint(MOD) を呼び出す。
 * 使い方: let c = convolution(a,b,MOD998244353)
 * 計算量: O((N+M) log(N+M))
 */
function convolution(a: Array<number>, b: Array<number>, MOD: number): Array<number> {
  useModint(MOD);
  const n = a.length;
  const m = b.length;
  if (n === 0 || m === 0) return [];
  // 配列サイズが小さい場合は愚直な O(N^2) 畳み込み（本家ACLの最適化）
  if (n + m - 1 <= 60) {
    const res = Array(n + m - 1).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        res[i + j] = res[i + j].add(a[i].mul(b[j]));
      }
    }
    return res;
  }
  const z = 1 << (32 - Math.clz32(n + m - 2));
  const a_pad = Array(z).fill(0);
  const b_pad = Array(z).fill(0);
  for (let i = 0; i < n; i++) a_pad[i] = a[i];
  for (let i = 0; i < m; i++) b_pad[i] = b[i];
  const sum_e = Array(30);
  const sum_ie = Array(30);
  let nttInitialized = false;
  let initNTT = () => {
    if (nttInitialized) return;
    nttInitialized = true;
    const root = Array(30);
    const iroot = Array(30);
    let rank2 = 0;
    let x = MOD-1;
    while (x%2 == 0) {
      rank2++;
      x /= 2;
    }
    if (z > 2**rank2) {
      throw new RangeError("NTT size is not supported by this MOD");
    }
    root[rank2] = (3).pow((MOD-1)/2**rank2);
    iroot[rank2] = root[rank2].pow(MOD-2);
    for (let i = rank2 - 1; i >= 0; i--) {
      root[i] = root[i + 1].mul(root[i + 1]);
      iroot[i] = iroot[i + 1].mul(iroot[i + 1]);
    }
    let prod = 1;
    let iprod = 1;
    for (let i = 0; i <= rank2 - 2; i++) {
      sum_e[i] = root[i + 2].mul(prod);
      prod = prod.mul(iroot[i + 2]);
      sum_ie[i] = iroot[i + 2].mul(iprod);
      iprod = iprod.mul(root[i + 2]);
    }
  }
  let butterfly = (arr: any) => {
    initNTT();
    const nn = arr.length;
    const h = 31 - Math.clz32(nn);    
    for (let ph = 1; ph <= h; ph++) {
      let w = 1 << (ph - 1), p = 1 << (h - ph);
      let now = 1;
      for (let s = 0; s < w; s++) {
        let offset = s << (h - ph + 1);
        for (let i = 0; i < p; i++) {
          let l = arr[i + offset];
          let r = arr[i + offset + p].mul(now);
          arr[i + offset] = l.add(r);
          arr[i + offset + p] = l.sub(r);
        }
        const not_s = ~s >>> 0;
        const zeros = 31 - Math.clz32((not_s & -not_s) >>> 0);
        now = now.mul(sum_e[zeros]);
      }
    }
  }
  let butterfly_inv = (arr: any) => {
    initNTT();
    const nn = arr.length;
    const h = 31 - Math.clz32(nn);
    for (let ph = h; ph >= 1; ph--) {
      let w = 1 << (ph - 1), p = 1 << (h - ph);
      let inow = 1;
      for (let s = 0; s < w; s++) {
        let offset = s << (h - ph + 1);
        for (let i = 0; i < p; i++) {
          let l = arr[i + offset];
          let r = arr[i + offset + p];
          arr[i + offset] = l.add(r);
          arr[i + offset + p] = l.sub(r).mul(inow);
        }
        const not_s = ~s >>> 0;
        const zeros = 31 - Math.clz32((not_s & -not_s) >>> 0);
        inow = inow.mul(sum_ie[zeros]);
      }
    }
  }
  butterfly(a_pad);
  butterfly(b_pad);
  for (let i = 0; i < z; i++) {
    a_pad[i] = a_pad[i].mul(b_pad[i]);
  }
  butterfly_inv(a_pad);
  const iz = z.pow(MOD-2);
  const res = Array(n + m - 1);
  for (let i = 0; i < n + m - 1; i++) {
    res[i] = a_pad[i].mul(iz);
  }
  return res;
}

/**
 * 部分集合ゼータ変換
 *
 * 変換前:
 *   A[mask] = mask ちょうどの値
 *
 * 変換後:
 *   A[mask] = Σ F[sub]
 *             sub ⊆ mask
 *
 * 配列 A は破壊的に変更される。
 *
 * @param A 長さ 2^K の配列
 * @param K bit数
 *
 * 使い方:
 *   subsetZetaTransform(A,K);
 *
 * 計算量:
 *   O(K * 2^K)
 */
function subsetZetaTransform(
  A: number[],
  K: number
): void {
  let size = 1<<K;
  for (let bit = 0; bit < K; bit++) {
    let b = 1<<bit;
    for (let mask = 0; mask < size; mask++) {
      if (mask&b) {
        A[mask] += A[mask^b];
      }
    }
  }
}

/**
 * 部分集合メビウス変換
 * 部分集合ゼータ変換の逆変換。
 *
 * 変換前:
 *   A[mask] = Σ F[sub]
 *             sub ⊆ mask
 *
 * 変換後:
 *   A[mask] = F[mask]
 *
 * 配列 A は破壊的に変更される。
 *
 * @param A 長さ 2^K の配列
 * @param K bit数
 *
 * 使い方:
 *   subsetMobiusTransform(A,K);
 *
 * 計算量:
 *   O(K * 2^K)
 */
function subsetMobiusTransform(
  A: number[],
  K: number
): void {
  let size = 1<<K;
  for (let bit = 0; bit < K; bit++) {
    let b = 1<<bit;
    for (let mask = 0; mask < size; mask++) {
      if (mask&b) {
        A[mask] -= A[mask^b];
      }
    }
  }
}

/**
 * 上位集合ゼータ変換
 *
 * 変換前:
 *   A[mask] = mask ちょうどの値
 *
 * 変換後:
 *   A[mask] = Σ F[sup]
 *             mask ⊆ sup
 *
 * つまり、mask を含むすべての上位集合の値を集める。
 * 配列 A は破壊的に変更される。
 *
 * @param A 長さ 2^K の配列
 * @param K bit数
 *
 * 使い方:
 *   supersetZetaTransform(A,K);
 *
 * 計算量:
 *   O(K * 2^K)
 */
function supersetZetaTransform(
  A: number[],
  K: number
): void {
  let size = 1<<K;
  for (let bit = 0; bit < K; bit++) {
    let b = 1<<bit;
    for (let mask = 0; mask < size; mask++) {
      if ((mask&b) == 0) {
        A[mask] += A[mask|b];
      }
    }
  }
}

/**
 * 上位集合メビウス変換
 * 上位集合ゼータ変換の逆変換。
 *
 * 変換前:
 *   A[mask] = Σ F[sup]
 *             mask ⊆ sup
 *
 * 変換後:
 *   A[mask] = F[mask]
 *
 * 配列 A は破壊的に変更される。
 *
 * @param A 長さ 2^K の配列
 * @param K bit数
 *
 * 使い方:
 *   supersetMobiusTransform(A,K);
 *
 * 計算量:
 *   O(K * 2^K)
 */
function supersetMobiusTransform(
  A: number[],
  K: number
): void {
  let size = 1<<K;
  for (let bit = 0; bit < K; bit++) {
    let b = 1<<bit;
    for (let mask = 0; mask < size; mask++) {
      if ((mask&b) == 0) {
        A[mask] -= A[mask|b];
      }
    }
  }
}

/**
 * 部分集合ゼータ変換 MOD版
 *
 * 変換後:
 *   A[mask] = Σ F[sub] mod MOD
 *             sub ⊆ mask
 *
 * 注意:
 *   変換前の各要素は 0 <= A[i] < MOD とする。
 *
 * 使い方:
 *   subsetZetaTransformMod(A,K,MOD998244353);
 *
 * 計算量:
 *   O(K * 2^K)
 */
function subsetZetaTransformMod(
  A: number[],
  K: number,
  MOD: number
): void {
  let size = 1<<K;
  for (let bit = 0; bit < K; bit++) {
    let b = 1<<bit;
    for (let mask = 0; mask < size; mask++) {
      if (mask&b) {
        let x = A[mask]+A[mask^b];
        if (x >= MOD) {
          x -= MOD;
        }
        A[mask] = x;
      }
    }
  }
}

/**
 * 部分集合メビウス変換 MOD版
 *
 * 部分集合ゼータ変換 MOD版の逆変換。
 *
 * 注意:
 *   変換前の各要素は 0 <= A[i] < MOD とする。
 *
 * 使い方:
 *   subsetMobiusTransformMod(A,K,MOD998244353);
 *
 * 計算量:
 *   O(K * 2^K)
 */
function subsetMobiusTransformMod(
  A: number[],
  K: number,
  MOD: number
): void {
  let size = 1<<K;
  for (let bit = 0; bit < K; bit++) {
    let b = 1<<bit;
    for (let mask = 0; mask < size; mask++) {
      if (mask&b) {
        let x = A[mask]-A[mask^b];

        if (x < 0) {
          x += MOD;
        }

        A[mask] = x;
      }
    }
  }
}

/**
 * 上位集合ゼータ変換 MOD版
 *
 * 変換後:
 *   A[mask] = Σ F[sup] mod MOD
 *             mask ⊆ sup
 *
 * 注意:
 *   変換前の各要素は 0 <= A[i] < MOD とする。
 *
 * 使い方:
 *   supersetZetaTransformMod(A,K,MOD998244353);
 *
 * 計算量:
 *   O(K * 2^K)
 */
function supersetZetaTransformMod(
  A: number[],
  K: number,
  MOD: number
): void {
  let size = 1<<K;
  for (let bit = 0; bit < K; bit++) {
    let b = 1<<bit;
    for (let mask = 0; mask < size; mask++) {
      if ((mask&b) == 0) {
        let x = A[mask]+A[mask|b];
        if (x >= MOD) {
          x -= MOD;
        }
        A[mask] = x;
      }
    }
  }
}

/**
 * 上位集合メビウス変換 MOD版
 *
 * 上位集合ゼータ変換 MOD版の逆変換。
 *
 * 注意:
 *   変換前の各要素は 0 <= A[i] < MOD とする。
 *
 * 使い方:
 *   supersetMobiusTransformMod(A,K,MOD998244353);
 *
 * 計算量:
 *   O(K * 2^K)
 */
function supersetMobiusTransformMod(
  A: number[],
  K: number,
  MOD: number
): void {
  let size = 1<<K;
  for (let bit = 0; bit < K; bit++) {
    let b = 1<<bit;
    for (let mask = 0; mask < size; mask++) {
      if ((mask&b) == 0) {
        let x = A[mask]-A[mask|b];
        if (x < 0) {
          x += MOD;
        }
        A[mask] = x;
      }
    }
  }
}

/**
 * 部分集合ゼータ変換 演算指定版
 *
 * 加算以外の演算を使って、
 * 部分集合から上位集合へ情報を伝播する。
 *
 * 例:
 *   最大値:
 *   subsetZetaTransformBy(
 *     A,
 *     K,
 *     (a,b) => Math.max(a,b)
 *   );
 *
 *   bigintの加算:
 *   subsetZetaTransformBy(
 *     A,
 *     K,
 *     (a,b) => a+b
 *   );
 *
 * 注意:
 *   コールバック呼び出しがあるため、
 *   通常の数値和では subsetZetaTransform の方が速い。
 *
 * 計算量:
 *   O(K * 2^K)
 */
function subsetZetaTransformBy<T>(
  A: T[],
  K: number,
  merge: (a: T, b: T) => T
): void {
  let size = 1<<K;
  for (let bit = 0; bit < K; bit++) {
    let b = 1<<bit;
    for (let mask = 0; mask < size; mask++) {
      if (mask&b) {
        A[mask] = merge(
          A[mask],
          A[mask^b]
        );
      }
    }
  }
}

/**
 * 部分集合メビウス変換 演算指定版
 *
 * 部分集合ゼータ変換で使った演算の逆演算を指定する。
 *
 * 例:
 *   bigint:
 *   subsetMobiusTransformBy(
 *     A,
 *     K,
 *     (a,b) => a-b
 *   );
 *
 * 注意:
 *   max/min のように逆演算が存在しない演算には使えない。
 *
 * 計算量:
 *   O(K * 2^K)
 */
function subsetMobiusTransformBy<T>(
  A: T[],
  K: number,
  subtract: (a: T, b: T) => T
): void {
  let size = 1<<K;
  for (let bit = 0; bit < K; bit++) {
    let b = 1<<bit;
    for (let mask = 0; mask < size; mask++) {
      if (mask&b) {
        A[mask] = subtract(
          A[mask],
          A[mask^b]
        );
      }
    }
  }
}

/**
 * 上位集合ゼータ変換 演算指定版
 *
 * 加算以外の演算を使って、
 * 上位集合から部分集合へ情報を伝播する。
 *
 * 例:
 *   supersetZetaTransformBy(
 *     A,
 *     K,
 *     (a,b) => Math.max(a,b)
 *   );
 *
 * 計算量:
 *   O(K * 2^K)
 */
function supersetZetaTransformBy<T>(
  A: T[],
  K: number,
  merge: (a: T, b: T) => T
): void {
  let size = 1<<K;
  for (let bit = 0; bit < K; bit++) {
    let b = 1<<bit;
    for (let mask = 0; mask < size; mask++) {
      if ((mask&b) == 0) {
        A[mask] = merge(
          A[mask],
          A[mask|b]
        );
      }
    }
  }
}

/**
 * 上位集合メビウス変換 演算指定版
 *
 * 上位集合ゼータ変換で使った演算の逆演算を指定する。
 *
 * 例:
 *   supersetMobiusTransformBy(
 *     A,
 *     K,
 *     (a,b) => a-b
 *   );
 *
 * 注意:
 *   max/min のように逆演算が存在しない演算には使えない。
 *
 * 計算量:
 *   O(K * 2^K)
 */
function supersetMobiusTransformBy<T>(
  A: T[],
  K: number,
  subtract: (a: T, b: T) => T
): void {
  let size = 1<<K;
  for (let bit = 0; bit < K; bit++) {
    let b = 1<<bit;
    for (let mask = 0; mask < size; mask++) {
      if ((mask&b) == 0) {
        A[mask] = subtract(A[mask], A[mask|b]);
      }
    }
  }
}

/**
 * 説明: 重みなしグラフで、始点から各頂点への最短距離を求める
 * 使い方: let dist = bfsDistance(G,start)
 * 計算量: O(V+E)
 */
function bfsDistance(G: number[][], start: number) {
  let dist = Array(G.length).fill(-1);
  let que = [start];
  let idx = 0;
  dist[start] = 0;
  while (idx < que.length) {
    let pos = que[idx++];
    for (let to of G[pos]) {
      if (dist[to] != -1) continue;
      dist[to] = dist[pos]+1;
      que.push(to);
    }
  }
  return dist;
}

/**
 * 説明:
 *   壁のあるグリッド上で、始点から各マスまでの最短距離を求める。
 *   返り値は2次元配列で、dist[i][j] として参照する。
 *
 * 使い方:
 *   let dist = gridBfsDistance(A,si,sj);
 *   let d = dist[ti][tj];
 *
 * 計算量:
 *   O(HW)
 */
function gridBfsDistance(
  A: string[],
  si: number,
  sj: number,
  wall: string = "#"
) {
  let H = A.length;
  let W = A[0].length;
  let dist = Array.from({length: H},() => Array(W).fill(-1));
  let que = [[si,sj]];
  let idx = 0;
  dist[si][sj] = 0;
  while (idx < que.length) {
    let [i,j] = que[idx++];
    for (let [di,dj] of dxy4) {
      let ni = i+di;
      let nj = j+dj;
      if (ni < 0 || H <= ni) continue;
      if (nj < 0 || W <= nj) continue;
      if (A[ni][nj] == wall) continue;
      if (dist[ni][nj] != -1) continue;
      dist[ni][nj] = dist[i][j]+1;
      que.push([ni,nj]);
    }
  }
  return dist;
}

/**
 * 説明:
 *   辺の重みが0または1のグラフで、
 *   始点から各頂点への最短距離を求める。
 *
 *   到達できない頂点の距離は Infinity。
 *
 *   2つの配列を使って両端キューを表現する。
 *   cost=0 の遷移は先頭側、
 *   cost=1 の遷移は末尾側へ追加する。
 *
 * 注意:
 *   すべての辺について
 *   cost が0または1である必要がある。
 *
 * 使い方:
 *   let dist = zeroOneBfsDistance(
 *     G,
 *     start
 *   );
 *
 * 計算量:
 *   O(V+E)
 */
function zeroOneBfsDistance(
  G: WeightedEdge[][],
  start: number
): number[] {
  let dist = Array(G.length).fill(Infinity);
  let front: [number,number][] = [
    [0,start]
  ];
  let back: [number,number][] = [];
  dist[start] = 0;
  while (front.length || back.length) {
    if (front.length == 0) {
      front = back.reverse();
      back = [];
    }
    let [d,pos] = front.pop()!;
    if (dist[pos] != d) continue;
    for (let {to,cost} of G[pos]) {
      let nd = d+cost;
      if (dist[to] <= nd) continue;
      dist[to] = nd;
      if (cost == 0) {
        front.push([nd,to]);
      } else {
        back.push([nd,to]);
      }
    }
  }
  return dist;
}

/**
 * 説明:
 *   重み付きグラフの辺。
 *   cost は非負である必要がある。
 */
type WeightedEdge = {
  to: number;
  cost: number;
};

/**
 * Dijkstra 内部処理。
 *
 * starts の各頂点を距離0として最短距離を求める。
 * parent が渡された場合は最短路木の親も記録する。
 */
function dijkstraCore(
  G: WeightedEdge[][],
  starts: number[],
  parent?: number[]
): number[] {
  let dist = Array(G.length).fill(Infinity);
  let pq = new PriorityQueue<[number,number]>(
    (a,b) => a[0]-b[0]
  );
  if (parent) {
    parent.fill(-1);
  }
  for (let start of starts) {
    if (dist[start] == 0) continue;
    dist[start] = 0;
    pq.push([0,start]);
  }
  while (pq.size()) {
    let [d,pos] = pq.pop();
    if (dist[pos] != d) continue;
    for (let {to,cost} of G[pos]) {
      let nd = d+cost;
      if (dist[to] <= nd) continue;
      dist[to] = nd;
      if (parent) {
        parent[to] = pos;
      }
      pq.push([nd,to]);
    }
  }

  return dist;
}

/**
 * 説明:
 *   非負重み付きグラフで、
 *   始点から各頂点への最短距離を求める。
 *
 *   到達できない頂点の距離は Infinity。
 *
 * 使い方:
 *   let dist = dijkstraDistance(G,start);
 *
 * 計算量:
 *   O((V+E) log V)
 */
function dijkstraDistance(
  G: WeightedEdge[][],
  start: number
): number[] {
  return dijkstraCore(G,[start]);
}

/**
 * 説明:
 *   非負重み付きグラフで最短距離を求め、
 *   start から goal への最短経路を復元する。
 *
 * 返り値:
 *   dist[v]:
 *     start から v への最短距離。
 *
 *   parent[v]:
 *     最短路上での v の直前の頂点。
 *     start および未到達頂点は -1。
 *
 *   path:
 *     start から goal までの頂点列。
 *     goal に到達できない場合は空配列。
 *
 * 使い方:
 *   let {dist,parent,path}
 *     = dijkstraRestore(G,start,goal);
 *
 * 計算量:
 *   O((V+E) log V)
 */
function dijkstraRestore(
  G: WeightedEdge[][],
  start: number,
  goal: number
): {
  dist: number[];
  parent: number[];
  path: number[];
} {
  let parent = Array(G.length).fill(-1);
  let dist = dijkstraCore(G, [start], parent);
  let path: number[] = [];
  if (dist[goal] != Infinity) {
    for (let pos = goal; pos != -1; pos = parent[pos]) {
      path.push(pos);
    }
    path.reverse();
  }
  return {
    dist,
    parent,
    path
  };
}

/**
 * 説明:
 *   複数の始点から各頂点への最短距離を求める。
 *
 *   starts に含まれるすべての頂点の距離を0とする。
 *   各頂点について、最も近い始点からの距離が返る。
 *
 *   到達できない頂点の距離は Infinity。
 *
 * 使い方:
 *   let dist = multiSourceDijkstra(
 *     G,
 *     starts
 *   );
 *
 * 計算量:
 *   O((V+E) log V)
 */
function multiSourceDijkstra(
  G: WeightedEdge[][],
  starts: number[]
): number[] {
  return dijkstraCore(G,starts);
}

/**
 * 説明:
 *   辺番号を持つ重み付きグラフの辺。
 *   cost は非負である必要がある。
 */
type WeightedEdgeWithId = {
  to: number;
  cost: number;
  id: number;
};

/**
 * 説明:
 *   非負重み付きグラフで始点からの最短距離を求め、
 *   各頂点に到達するために使った辺番号を記録する。
 *
 * 返り値:
 *   dist[v]:
 *     start から v への最短距離。
 *     到達できない場合は Infinity。
 *
 *   parent[v]:
 *     最短路木における v の親頂点。
 *     start および未到達頂点は -1。
 *
 *   parentEdge[v]:
 *     parent[v] から v へ移動するときに使った辺番号。
 *     start および未到達頂点は -1。
 *
 * 注意:
 *   最短経路が複数存在する場合は、
 *   そのうち探索中に最初に確定したものを採用する。
 *
 * 使い方:
 *   let {
 *     dist,
 *     parent,
 *     parentEdge
 *   } = dijkstraRestoreEdge(G,start);
 *
 * 計算量:
 *   O((V+E) log V)
 */
function dijkstraRestoreEdge(
  G: WeightedEdgeWithId[][],
  start: number
): {
  dist: number[];
  parent: number[];
  parentEdge: number[];
} {
  let dist = Array(G.length).fill(Infinity);
  let parent = Array(G.length).fill(-1);
  let parentEdge = Array(G.length).fill(-1);
  let pq = new PriorityQueue<[number,number]>(
    (a,b) => a[0]-b[0]
  );
  dist[start] = 0;
  pq.push([0,start]);
  while (pq.size()) {
    let [d,pos] = pq.pop();
    if (dist[pos] != d) continue;
    for (let {to,cost,id} of G[pos]) {
      let nd = d+cost;
      if (dist[to] <= nd) continue;
      dist[to] = nd;
      parent[to] = pos;
      parentEdge[to] = id;
      pq.push([nd,to]);
    }
  }
  return {
    dist,
    parent,
    parentEdge
  };
}

/**
 * 説明:
 *   距離行列にFloyd-Warshall法を適用し、
 *   全頂点間の最短距離を求める。
 *
 *   dist[i][j] は、初期状態では辺 i→j の重みとし、
 *   辺がない場合は Infinity にする。
 *   dist[i][i] は0にする。
 *
 *   有向・無向グラフのどちらにも利用できる。
 *   配列 dist は破壊的に更新される。
 *
 * 使い方:
 *   let dist = Array.from(
 *     {length: N},
 *     () => Array(N).fill(Infinity)
 *   );
 *   for (let i = 0; i < N; i++) dist[i][i] = 0;
 *
 *   dist[u][v] = Math.min(dist[u][v],cost);
 *   dist[v][u] = Math.min(dist[v][u],cost);
 *
 *   floydWarshall(dist);
 *
 * 計算量:
 *   O(N^3)
 *
 * メモリ:
 *   O(N^2)
 * 
 * 用例: ABC369-E
 */
function floydWarshall(
  dist: number[][]
): number[][] {
  let N = dist.length;
  for (let k = 0; k < N; k++) {
    let distK = dist[k];
    for (let i = 0; i < N; i++) {
      let distI = dist[i];
      let dik = distI[k];
      if (dik == Infinity) continue;
      for (let j = 0; j < N; j++) {
        let nd = dik+distK[j];
        if (nd < distI[j]) distI[j] = nd;
      }
    }
  }
  return dist;
}

/**
 * 説明:
 *   b > 0 のとき、数学的な床除算 floor(a/b) を返す。
 *   負の a にも対応する。
 *
 * 使い方:
 *   let q = bigIntFloorDiv(a,b);
 *
 * 計算量:
 *   O(1)
 */
function bigIntFloorDiv(
  a: bigint,
  b: bigint
): bigint {
  if (b <= 0n) {
    throw new RangeError(
      "divisor must be positive"
    );
  }
  let q = a/b;
  if (a%b < 0n) {
    q--;
  }
  return q;
}

/**
 * 説明:
 *   次の値を正確に返す。
 *
 *   Σ floor((a*i+b)/m)
 *   0 <= i < n
 *
 *   a,b は負でもよい。
 *
 * 制約:
 *   n >= 0
 *   m > 0
 *
 * 使い方:
 *   let sum = floorSum(n,m,a,b);
 *
 * 計算量:
 *   O(log m)
 */
function floorSum(
  n: bigint,
  m: bigint,
  a: bigint,
  b: bigint
): bigint {
  if (n < 0n) {
    throw new RangeError(
      "n must be non-negative"
    );
  }
  if (m <= 0n) {
    throw new RangeError(
      "m must be positive"
    );
  }
  // a,b を 0 <= a,b < m に正規化する。
  // 負の係数から出る整数部分は先に答えへ加える。
  let qa = bigIntFloorDiv(a,m);
  let qb = bigIntFloorDiv(b,m);
  let ans =
    qa*n*(n-1n)/2n
    +qb*n;
  a -= qa*m;
  b -= qb*m;
  while (true) {
    if (a >= m) {
      ans +=
        n*(n-1n)/2n
        *(a/m);
      a %= m;
    }
    if (b >= m) {
      ans += n*(b/m);
      b %= m;
    }
    let y = a*n+b;
    if (y < m) {
      return ans;
    }
    n = y/m;
    b = y%m;
    [m,a] = [a,m];
  }
}

/**
 * 説明:
 *   a^n <= limit かを、巨大な積を作らずに判定する。
 *
 * 制約:
 *   a >= 0
 *   n >= 0
 *   limit >= 0
 *
 * 計算量:
 *   O(log n)
 */
function bigIntPowLeq(
  a: bigint,
  n: number,
  limit: bigint
): boolean {
  let result = 1n;
  while (n > 0) {
    if (n%2 == 1) {
      if (a != 0n && result > limit/a) {
        return false;
      }
      result *= a;
    }
    n = Math.floor(n/2);
    if (n == 0) break;
    if (a != 0n && a > limit/a) {
      a = limit+1n;
    } else {
      a *= a;
    }
  }
  return result <= limit;
}

/**
 * 説明:
 *   非負 bigint n の
 *   floor(n^(1/k)) を正確に返す。
 *
 * 使い方:
 *   let x = bigIntKthRoot(n,k);
 *
 * 制約:
 *   n >= 0
 *   k >= 1
 *
 * 計算量:
 *   O(log n * log k)
 */
function bigIntKthRoot(
  n: bigint,
  k: number
): bigint {
  if (n < 0n) {
    throw new RangeError(
      "n must be non-negative"
    );
  }
  if (
    !Number.isSafeInteger(k)
    || k <= 0
  ) {
    throw new RangeError(
      "k must be a positive safe integer"
    );
  }
  if (n < 2n || k == 1) return n;
  let bitLength = n.toString(2).length;
  if (k >= bitLength) return 1n;
  let low = 1n;
  let high =
    1n<<BigInt(Math.ceil(bitLength/k));
  while (high-low > 1n) {
    let mid = (low+high)>>1n;
    if (bigIntPowLeq(mid,k,n)) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return low;
}

type Matrix = number[][];

/**
 * 行列ライブラリ内部用。
 * 行列が長方形であることを確認し、
 * [行数,列数] を返す。
 */
function matrixShape(
  A: Matrix
): [number,number] {
  if (
    A.length == 0
    || A[0].length == 0
  ) {
    throw new RangeError(
      "matrix must not be empty"
    );
  }
  let W = A[0].length;
  for (let i = 1; i < A.length; i++) {
    if (A[i].length != W) {
      throw new RangeError(
        "matrix must be rectangular"
      );
    }
  }
  return [A.length,W];
}

/**
 * 行列ライブラリ内部用。
 * 全要素を 0 <= x < MOD に正規化する。
 */
function matrixNormalizeMod(
  A: Matrix,
  MOD: number
): Matrix {
  return A.map(row => row.map(x => {
    if (!Number.isSafeInteger(x)) {
      throw new RangeError(
        "matrix elements must be safe integers"
      );
    }
    x %= MOD;
    return x < 0
      ? x+MOD
      : x;
  }));
}

/**
 * 行列ライブラリ内部用。
 *
 * A,B の要素はすでに
 * 0 <= x < MOD に正規化されているものとする。
 */
function matrixMultiplyModCore(
  A: Matrix,
  B: Matrix,
  MOD: number
): Matrix {
  let H = A.length;
  let K = B.length;
  let W = B[0].length;
  let C = Array.from(
    {length: H},
    () => Array(W).fill(0)
  );
  for (let i = 0; i < H; i++) {
    let Ci = C[i];
    for (let k = 0; k < K; k++) {
      let a = A[i][k];
      if (a == 0) continue;
      let Bk = B[k];
      for (let j = 0; j < W; j++) {
        let x =
          Ci[j]
          +modMul(a,Bk[j],MOD);
        Ci[j] = x >= MOD
          ? x-MOD
          : x;
      }
    }
  }
  return C;
}

/**
 * 説明:
 *   MOD上で行列積 A*B を求める。
 *   A は H×K、B は K×W とする。
 *
 *   入力要素は負でもよく、
 *   内部で 0 <= x < MOD に正規化する。
 *
 * 制約:
 *   1 <= MOD < 2^31
 *   各要素は安全整数
 *
 * 使い方:
 *   let C = matrixMultiplyMod(
 *     A,
 *     B,
 *     MOD998244353
 *   );
 *
 * 計算量:
 *   O(H*K*W)
 */
function matrixMultiplyMod(
  A: Matrix,
  B: Matrix,
  MOD: number
): Matrix {
  if (
    !Number.isSafeInteger(MOD)
    || MOD <= 0
    || 2**31 <= MOD
  ) {
    throw new RangeError(
      "MOD must satisfy 1 <= MOD < 2^31"
    );
  }
  let [,K] = matrixShape(A);
  let [K2] = matrixShape(B);
  if (K != K2) {
    throw new RangeError(
      "matrix dimensions do not match"
    );
  }
  return matrixMultiplyModCore(
    matrixNormalizeMod(A,MOD),
    matrixNormalizeMod(B,MOD),
    MOD
  );
}

/**
 * 説明:
 *   MOD上で正方行列 A の n 乗を求める。
 *   n=0 のとき単位行列を返す。
 *
 *   入力要素は負でもよく、
 *   内部で 0 <= x < MOD に正規化する。
 *
 * 制約:
 *   A は正方行列
 *   n >= 0
 *   1 <= MOD < 2^31
 *   各要素は安全整数
 *
 * 使い方:
 *   let B = matrixPowMod(
 *     A,
 *     N,
 *     MOD998244353
 *   );
 *
 * 計算量:
 *   行列サイズをDとして
 *   O(D^3 log n)
 */
function matrixPowMod(
  A: Matrix,
  n: number | bigint,
  MOD: number
): Matrix {
  if (
    !Number.isSafeInteger(MOD)
    || MOD <= 0
    || 2**31 <= MOD
  ) {
    throw new RangeError(
      "MOD must satisfy 1 <= MOD < 2^31"
    );
  }
  let [H,W] = matrixShape(A);
  if (H != W) {
    throw new RangeError(
      "matrix must be square"
    );
  }
  let exponent: bigint;
  if (typeof n == "number") {
    if (
      !Number.isSafeInteger(n)
      || n < 0
    ) {
      throw new RangeError(
        "exponent must be a non-negative safe integer"
      );
    }
    exponent = BigInt(n);
  } else {
    if (n < 0n) {
      throw new RangeError(
        "exponent must be non-negative"
      );
    }
    exponent = n;
  }
  let base = matrixNormalizeMod(A,MOD);
  let result = Array.from(
    {length: H},
    (_,i) => Array.from(
      {length: H},
      (_,j) => i == j
        ? 1%MOD
        : 0
    )
  );
  while (exponent > 0n) {
    if (exponent&1n) {
      result = matrixMultiplyModCore(
        result,
        base,
        MOD
      );
    }
    exponent >>= 1n;
    if (exponent > 0n) {
      base = matrixMultiplyModCore(
        base,
        base,
        MOD
      );
    }
  }
  return result;
}

/**
 * 最小重み二部マッチングをハンガリアン法で求める。
 *
 * cost[i][j]:
 *   左側iと右側jを対応させるコスト。
 *
 * 戻り値:
 *   cost: 最小コスト
 *   match[i]: 左側iに対応する右側頂点
 *
 * 右側頂点数は左側頂点数以上とする。
 *
 * 計算量:
 *   O(N^2M)
 *   正方行列ではO(N^3)
 */
function hungarian(
  cost: number[][]
): {
  cost: number;
  match: number[];
} {
  let N = cost.length;
  if (N == 0) return {cost: 0,match: []};
  let M = cost[0].length;
  if (N > M) {
    throw new RangeError("The right side must have at least N vertices");
  }
  let u = new Float64Array(N+1);
  let v = new Float64Array(M+1);
  let p = new Int32Array(M+1);
  let way = new Int32Array(M+1);
  for (let i = 1; i <= N; i++) {
    p[0] = i;
    let min = new Float64Array(M+1);
    min.fill(Infinity);
    let used = new Uint8Array(M+1);
    let j0 = 0;
    do {
      used[j0] = 1;
      let i0 = p[j0];
      let delta = Infinity;
      let j1 = 0;
      for (let j = 1; j <= M; j++) {
        if (used[j]) continue;
        let cur = cost[i0-1][j-1]-u[i0]-v[j];
        if (cur < min[j]) {
          min[j] = cur;
          way[j] = j0;
        }
        if (min[j] < delta) {
          delta = min[j];
          j1 = j;
        }
      }
      for (let j = 0; j <= M; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          min[j] -= delta;
        }
      }
      j0 = j1;
    } while (p[j0] != 0);
    do {
      let j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 != 0);
  }
  let match = Array(N).fill(-1);
  for (let j = 1; j <= M; j++) {
    if (p[j] != 0) match[p[j]-1] = j-1;
  }
  return {
    cost: -v[0],
    match
  };
}

/**
 * 説明:
 *   値を昇順の0-indexed順位へ座標圧縮する。
 *
 * 使い方:
 *   let cc = new CoordinateCompression(A);
 *   cc.index(x);
 *   cc.value(i);
 *
 * 計算量:
 *   構築 O(N log N)
 *   index O(log N)
 */
class CoordinateCompression {
  values: number[];

  constructor(A: number[]) {
    this.values = Array.from(
      new Set(A)
    ).sort(less);
  }

  index(x: number): number {
    return lowerBound(this.values,x);
  }

  value(index: number): number {
    return this.values[index];
  }

  size(): number {
    return this.values.length;
  }
}

/**
 * 説明: 素集合データ構造。連結判定や集合サイズ取得
 * 使い方: let uf = new UnionFind(N); uf.connect(a,b); uf.same(a,b)
 * 計算量: ならし O(α(N))
 */
class UnionFind {
  Parent: number[];
  /**
   * 説明: N 個の互いに素な集合を作る。
   * 使い方: new UnionFind(N)
   * 計算量: O(N)
   */
  constructor(edge: number) {
    this.Parent = Array<number>(edge).fill(-1);
  }
  /**
   * 説明: 代表元を返す。経路圧縮
   * 使い方: uf.root(v)
   * 計算量: ならし O(α(N))
   */
  root(node: number): number {
    if (this.Parent[node] < 0) return node;
    return this.Parent[node] = this.root(this.Parent[node]);
  }
  /**
   * 説明: 頂点が属する集合サイズを返す。
   * 使い方: uf.size(v)
   * 計算量: ならし O(α(N))
   */
  size(node: number): number {
    return -this.Parent[this.root(node)];
  }
  /**
   * 説明: 2頂点が同じ集合か判定する
   * 使い方: uf.same(a,b)
   * 計算量: ならし O(α(N))
   */
  same(A: number, B: number): boolean {
    A = this.root(A);
    B = this.root(B);
    return A == B;
  }
  /**
   * 説明: 2集合を併合する。既に同集合なら false
   * 使い方: uf.connect(a,b)
   * 計算量: ならし O(α(N))
   */
  connect(A: number, B: number): boolean {
    A = this.root(A);
    B = this.root(B);
    if (A == B) {
      return false;
    }
    if (this.size(A) < this.size(B)) {
      let tmp = A;
      A = B;
      B = tmp;
    }
    this.Parent[A] += this.Parent[B];
    this.Parent[B] = A;
    return true;
  }
}

/**
 * 説明: ポテンシャル差を持つ UnionFind。Weight[B]-Weight[A]=X の制約を管理する
 * 使い方: let uf = new WeightUnionFind(N); uf.connect(a,b,x)
 * 計算量: ならし O(α(N))
 */
class WeightUnionFind {
  Parent: number[];
  Weight: bigint[];
  /**
   * 説明: 重み付き UnionFind を初期化する
   * 使い方: new WeightUnionFind(N)
   * 計算量: O(N)
   */
  constructor(edge: number) {
    this.Parent = Array<number>(edge).fill(-1);
    this.Weight = Array<bigint>(edge).fill(0n);
  }
  /**
   * 説明: 代表元を返し、根からの重みも圧縮更新する
   * 使い方: uf.root(v)
   * 計算量: ならし O(α(N))
   */
  root(node: number): number {
    if (this.Parent[node] < 0) return node;
    let parent = this.Parent[node];
    let r = this.root(parent);
    this.Weight[node] += this.Weight[parent];
    return this.Parent[node] = r;
  }
  /**
   * 説明: 頂点が属する集合サイズを返す
   * 使い方: uf.size(v)
   * 計算量: ならし O(α(N))
   */
  size(node: number): number {
    return -this.Parent[this.root(node)];
  }
  /**
   * 説明: 2頂点が同じ集合か判定する
   * 使い方: uf.same(a,b)
   * 計算量: ならし O(α(N))
   */
  same(A: number, B: number): boolean {
    return this.root(A) == this.root(B);
  }
  /**
   * 説明: Weight[B]-Weight[A] を返す。非連結なら null
   * 使い方: let d = uf.diff(A,B)
   * 計算量: ならし O(α(N))
   */
  diff(A: number, B: number): bigint | null {
    if (!this.same(A,B)) return null;
    return this.Weight[B]-this.Weight[A];
  }
  /**
   * 説明: Weight[B]-Weight[A]=X となるように併合する。矛盾時 false
   * 使い方: uf.connect(A,B,X)
   * 計算量: ならし O(α(N))
   */
  connect(A: number, B: number, X: bigint): boolean {
    let root_A = this.root(A);
    let root_B = this.root(B);
    let w = this.Weight[B]-this.Weight[A]-X;
    if (root_A == root_B) return w == 0n;

    if (this.Parent[root_A] > this.Parent[root_B]) {
      this.Parent[root_B] += this.Parent[root_A];
      this.Parent[root_A] = root_B;
      this.Weight[root_A] = w;
    } else {
      this.Parent[root_A] += this.Parent[root_B];
      this.Parent[root_B] = root_A;
      this.Weight[root_B] = -w;
    }
    return true;
  }
}

// aの優先度が高ければtrue
type Compare<T> = (a: T, b: T) => number;
/**
 * 説明: 二分ヒープによる優先度付きキュー
 * 使い方: let pq = new PriorityQueue<number>((a,b)=>a-b)
 * 計算量: push/pop O(log N)、top O(1)
 */
class PriorityQueue<T> {
  private list = new Array<T>();
  constructor(private compare: Compare<T>) {}
  /**
   * 説明: 要素追加
   * 使い方: pq.push(x)
   * 計算量: O(log N)
   */
  public push(v: T) {
    this.list.push(v);
    const back = this.list.length - 1;
    this.against(back);
  }
  private against(child: number) {
    if (child === 0) return;
    const parent = Math.ceil(child / 2) - 1;
    const childValue = this.list[child];
    const parentValue = this.list[parent];
    if (this.compare(childValue, parentValue) < 0) {
      this.swap(child, parent);
      this.against(parent);
    }
  }
  private swap(a: number, b: number) {
    const tmp = this.list[a];
    this.list[a] = this.list[b];
    this.list[b] = tmp;
  }
  /**
   * 説明: 最優先要素を取り出さずに見る
   * 使い方: pq.top()
   * 計算量: O(1)
   */
  public top(): T {
    if (this.list.length === 0) throw new Error("empty");
    return this.list[0];
  }
  /**
   * 説明: 最優先要素を削除して返す
   * 使い方: pq.pop()
   * 計算量: O(log N)
   */
  public pop(): T {
    if (this.list.length === 0) throw new Error("empty");
    if (this.list.length === 1) {
      const ans = this.top();
      this.list.pop();
      return ans;
    }
    const ans = this.top();
    this.list[0] = this.list.pop()!;
    this.flow(0);
    return ans;
  }
  private flow(parent: number) {
    const parentValue = this.list[parent];
    const left = parent * 2 + 1;
    const right = parent * 2 + 2;
    if (!this.inRange(left)) {
      return;
    }
    if (!this.inRange(right)) {
      // 左子はいるが右子はいない
      const leftValue = this.list[left];
      if (this.compare(leftValue, parentValue) < 0) {
        this.swap(parent, left);
      }
      return;
    }
    const leftValue = this.list[left];
    const rightValue = this.list[right];
    const target = this.compare(leftValue, rightValue) < 0 ? left : right;
    const targetValue = this.list[target];
    if (this.compare(targetValue, parentValue) < 0) {
      this.swap(parent, target);
      this.flow(target);
    }
  }
  private inRange(index: number): boolean {
    return index < this.list.length;
  }
  /**
   * 説明: 現在の要素数を返す
   * 使い方: pq.size()
   * 計算量: O(1)
   */
  public size() {
    return this.list.length;
  }
  /**
   * 説明: ヒープを含む状態を複製
   */
  clone(): PriorityQueue<T> {
    let pq = new PriorityQueue<T>(this.compare);
    pq.list = this.list.slice();
    return pq;
  }
}

/**
 * 説明:
 *   Min-Max Heap による両端優先度付きキュー。
 *   最小値・最大値の取得と削除ができる。重複可。
 *
 * 使い方:
 *   let pq = new DoubleEndedPriorityQueue<number>((a,b)=>a-b);
 *   pq.push(x);
 *   pq.min();
 *   pq.max();
 *   pq.popMin();
 *   pq.popMax();
 *
 * 計算量:
 *   push/popMin/popMax O(log N)
 *   min/max/size O(1)
 */
class DoubleEndedPriorityQueue<T> {
  private list: T[] = [];

  constructor(private compare: Compare<T>) {}

  /**
   * 説明: 要素を追加する
   * 計算量: O(log N)
   */
  push(value: T): this {
    this.list.push(value);
    let i = this.list.length-1;
    if (i == 0) {
      return this;
    }
    let p = (i-1)>>1;
    if (this._isMinLevel(i)) {
      // min level にいるのに親(max level)より大きい
      if (this.compare(this.list[p],this.list[i]) < 0) {
        this._swap(i,p);
        this._bubbleUpMax(p);
      } else {
        this._bubbleUpMin(i);
      }
    } else {
      // max level にいるのに親(min level)より小さい
      if (this.compare(this.list[i],this.list[p]) < 0) {
        this._swap(i,p);
        this._bubbleUpMin(p);
      } else {
        this._bubbleUpMax(i);
      }
    }
    return this;
  }

  /**
   * 説明: 最小値を返す
   * 計算量: O(1)
   */
  min(): T {
    if (this.list.length == 0) {
      throw new Error("empty");
    }
    return this.list[0];
  }

  /**
   * 説明: 最大値を返す
   * 計算量: O(1)
   */
  max(): T {
    let n = this.list.length;
    if (n == 0) {
      throw new Error("empty");
    }
    if (n == 1) {
      return this.list[0];
    }
    if (n == 2) {
      return this.list[1];
    }
    return this.compare(this.list[1],this.list[2]) < 0
      ? this.list[2]
      : this.list[1];
  }

  /**
   * 説明: 最小値を削除して返す
   * 計算量: O(log N)
   */
  popMin(): T {
    if (this.list.length == 0) {
      throw new Error("empty");
    }
    let ans = this.list[0];
    let last = this.list.pop()!;
    if (this.list.length > 0) {
      this.list[0] = last;
      this._trickleDownMin(0);
    }
    return ans;
  }

  /**
   * 説明: 最大値を削除して返す
   * 計算量: O(log N)
   */
  popMax(): T {
    let n = this.list.length;
    if (n == 0) {
      throw new Error("empty");
    }
    if (n == 1) {
      return this.list.pop()!;
    }
    let idx: number;
    if (n == 2 || this.compare(this.list[1],this.list[2]) >= 0) {
      idx = 1;
    } else {
      idx = 2;
    }
    let ans = this.list[idx];
    let last = this.list.pop()!;
    if (idx < this.list.length) {
      this.list[idx] = last;
      this._trickleDownMax(idx);
    }

    return ans;
  }

  /**
   * 説明: 現在の要素数を返す
   * 計算量: O(1)
   */
  size(): number {
    return this.list.length;
  }

  /**
   * 説明: 空かどうか
   * 計算量: O(1)
   */
  isEmpty(): boolean {
    return this.list.length == 0;
  }

  /** private */
  /**
   * 深さ偶数なら min level
   * 深さ奇数なら max level
   */
  private _isMinLevel(i: number): boolean {
    let depth = 31-Math.clz32(i+1);
    return (depth&1) == 0;
  }

  private _swap(i: number, j: number): void {
    let tmp = this.list[i];
    this.list[i] = this.list[j];
    this.list[j] = tmp;
  }

  /**
   * min level 内で祖父方向へ上げる
   */
  private _bubbleUpMin(i: number): void {
    while (i >= 3) {
      let p = (i-1)>>1;
      let g = (p-1)>>1;
      if (this.compare(this.list[i],this.list[g]) < 0) {
        this._swap(i,g);
        i = g;
      } else {
        break;
      }
    }
  }

  /**
   * max level 内で祖父方向へ上げる
   */
  private _bubbleUpMax(i: number): void {
    while (i >= 3) {
      let p = (i-1)>>1;
      let g = (p-1)>>1;
      if (this.compare(this.list[g],this.list[i]) < 0) {
        this._swap(i,g);
        i = g;
      } else {
        break;
      }
    }
  }

  /**
   * 子・孫のうち最小のindexを返す
   */
  private _minDescendant(i: number): number {
    let n = this.list.length;
    let best = -1;
    let l = 2*i+1;
    let r = Math.min(n-1,2*i+2);
    for (let j = l; j <= r; j++) {
      if (
        best == -1
        || this.compare(this.list[j],this.list[best]) < 0
      ) {
        best = j;
      }
    }
    l = 4*i+3;
    r = Math.min(n-1,4*i+6);
    for (let j = l; j <= r; j++) {
      if (
        best == -1
        || this.compare(this.list[j],this.list[best]) < 0
      ) {
        best = j;
      }
    }
    return best;
  }

  /**
   * 子・孫のうち最大のindexを返す
   */
  private _maxDescendant(i: number): number {
    let n = this.list.length;
    let best = -1;
    let l = 2*i+1;
    let r = Math.min(n-1,2*i+2);
    for (let j = l; j <= r; j++) {
      if (
        best == -1
        || this.compare(this.list[best],this.list[j]) < 0
      ) {
        best = j;
      }
    }
    l = 4*i+3;
    r = Math.min(n-1,4*i+6);
    for (let j = l; j <= r; j++) {
      if (
        best == -1
        || this.compare(this.list[best],this.list[j]) < 0
      ) {
        best = j;
      }
    }
    return best;
  }

  /**
   * min level を下げる
   */
  private _trickleDownMin(i: number): void {
    while (true) {
      let m = this._minDescendant(i);
      if (m == -1) {
        return;
      }
      let firstGrandChild = 4*i+3;
      if (firstGrandChild <= m) {
        if (this.compare(this.list[m],this.list[i]) < 0) {
          this._swap(m,i);
          let p = (m-1)>>1;
          if (this.compare(this.list[p],this.list[m]) < 0) {
            this._swap(m,p);
          }
          i = m;
        } else {
          return;
        }
      } else {
        if (this.compare(this.list[m],this.list[i]) < 0) {
          this._swap(m,i);
        }
        return;
      }
    }
  }

  /**
   * max level を下げる
   */
  private _trickleDownMax(i: number): void {
    while (true) {
      let m = this._maxDescendant(i);
      if (m == -1) {
        return;
      }
      let firstGrandChild = 4*i+3;
      if (firstGrandChild <= m) {
        if (this.compare(this.list[i],this.list[m]) < 0) {
          this._swap(m,i);
          let p = (m-1)>>1;
          if (this.compare(this.list[m],this.list[p]) < 0) {
            this._swap(m,p);
          }
          i = m;
        } else {
          return;
        }
      } else {
        if (this.compare(this.list[i],this.list[m]) < 0) {
          this._swap(m,i);
        }
        return;
      }
    }
  }
}

/**
 * 説明: 固定配列で両端 push/pop を行う Deque。01-bfsのときは無理にdequeを使わず、2つの配列を使う方が速い（ABC431-E）
 * 使い方: let dq = new Deque<number>(); dq.push(x); dq.shift()
 * 計算量: 各操作 O(1)
 */
class Deque<T> {
  private data: (T | undefined)[];
  private head: number;
  private tail: number;
  private capacity: number;
  /**
   * 説明: 固定容量の Deque を作ります。容量不足に注意
   * 使い方: new Deque<T>(capacity)
   * 計算量: O(capacity)
   */
  constructor(capacity: number = 1 << 20) {
    this.capacity = capacity;
    this.data = new Array(capacity);
    this.head = capacity >> 1;
    this.tail = capacity >> 1;
  }
  /**
   * 説明: 末尾へ追加
   * 使い方: dq.push(x)
   * 計算量: O(1)
   */
  push(value: T): void {
    this.data[this.tail++] = value;
  }
  /**
   * 説明: 先頭へ追加
   * 使い方: dq.unshift(x)
   * 計算量: O(1)
   */
  unshift(value: T): void {
    this.data[--this.head] = value;
  }
  /**
   * 説明: 先頭から取り出す
   * 使い方: dq.shift()
   * 計算量: O(1)
   */
  shift(): T | undefined {
    return this.head < this.tail ? this.data[this.head++] : undefined;
  }
  /**
   * 説明: 末尾から取り出す
   * 使い方: dq.pop()
   * 計算量: O(1)
   */
  pop(): T | undefined {
    return this.head < this.tail ? this.data[--this.tail] : undefined;
  }
  /**
   * 説明: 先頭要素を参照する
   * 使い方: dq.peekHead()
   * 計算量: O(1)
   */
  peekHead(): T | undefined {
    return this.head < this.tail ? this.data[this.head] : undefined;
  }
  /**
   * 説明: 先頭から idx 番目を参照する
   * 使い方: dq.peekHeadIdx(idx)
   * 計算量: O(1)
   */
  peekHeadIdx(idx: number): T | undefined {
    return this.head+idx < this.tail ? this.data[this.head+idx] : undefined;
  }
  /**
   * 説明: 末尾要素を参照する
   * 使い方: dq.peekTail()
   * 計算量: O(1)
   */
  peekTail(): T | undefined {
    return this.head < this.tail ? this.data[this.tail - 1] : undefined;
  }
  /**
   * 説明: 末尾から idx 番目を参照する
   * 使い方: dq.peekTailIdx(idx)
   * 計算量: O(1)
   */
  peekTailIdx(idx: number): T | undefined {
    return this.head < this.tail-idx ? this.data[this.tail-idx - 1] : undefined;
  }
  /**
   * 説明: 現在の要素数を返す
   * 使い方: dq.getLength()
   * 計算量: O(1)
   */
  getLength(): number {
    return this.tail - this.head;
  }
}

/**
 * 説明:
 *   更新のない配列について、
 *   半開区間 [left,right) の集約値を O(1) で求める。
 *
 *   merge は次の性質を持つ必要がある。
 *
 *   ・結合則
 *   ・交換則
 *   ・冪等性 merge(x,x)=x
 *
 *   使用可能な演算:
 *     min
 *     max
 *     gcd
 *     bitwise AND
 *     bitwise OR
 *
 *   使用できない演算:
 *     sum
 *     product
 *     XOR
 *
 *   空区間の単位元を自然に定義できないため、
 *   query(left,right) は left < right を必要とする。
 *
 * 使い方:
 *   let st = new SparseTable(
 *     A,
 *     (a,b) => Math.min(a,b)
 *   );
 *
 *   let x = st.query(l,r);
 *
 * 計算量:
 *   構築 O(N log N)
 *   query O(1)
 *   空間 O(N log N)
 */
class SparseTable<S> {
  private n: number;
  private table: S[][];

  constructor(
    A: ArrayLike<S>,
    private merge: OperatorType<S>
  ) {
    this.n = A.length;
    this.table = [];
    if (this.n == 0) return;
    this.table.push(Array.from(A));
    for (
      let k = 1;
      (1<<k) <= this.n;
      k++
    ) {
      let len = 1<<k;
      let half = len>>1;
      let prev = this.table[k-1];
      let cur = Array<S>(
        this.n-len+1
      );
      for (
        let left = 0;
        left+len <= this.n;
        left++
      ) {
        cur[left] = this.merge(
          prev[left],
          prev[left+half]
        );
      }
      this.table.push(cur);
    }
  }

  /**
   * 説明:
   *   半開区間 [left,right) の集約値を返す。
   *
   *   区間を、長さが同じ2つの2冪区間で覆う。
   *   2区間は重なる場合があるが、
   *   mergeが冪等なので答えは変化しない。
   *
   * 使い方:
   *   st.query(left,right)
   *
   * 計算量:
   *   O(1)
   */
  query(
    left: number,
    right: number
  ): S {
    if (!(
      0 <= left
      && left < right
      && right <= this.n
    )) {
      throw new RangeError(
        `Not 0 <= left < right <= ${this.n}`
      );
    }
    let k = 31-Math.clz32(right-left);
    let len = 1<<k;
    return this.merge(
      this.table[k][left],
      this.table[k][right-len]
    );
  }
}

/**
 * 説明: n 以上の最小の2冪を返す。セグ木のサイズ計算用
 * 使い方: let size = bit_ceil(n)
 * 計算量: O(1)
 */
function bit_ceil(n: number): number {
  if (n <= 1) return 1;
  return 1 << (32 - Math.clz32(n - 1));
}

/**
 * 説明: number の下位0ビット数を返す。セグ木の計算用
 * 使い方: countr_zero(x)
 * 計算量: O(1)
 */
function countr_zero(n: number): number {
  if (n === 0) return 0;
  return 31 - Math.clz32(n & -n);
}

type OperatorType<S> = (a: S, b: S) => S;
type ElementType<S> = () => S;
type SearchFunction<S> = (x: S) => boolean;
type MappingType<S, F> = (f: F, x: S) => S;
type CompositionType<F> = (f: F, g: F) => F;
type IdType<F> = () => F;
type typevi =
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint8Array
  | Uint8ClampedArray
  | Uint16Array
  | Uint32Array;
type typevll = BigInt64Array | BigUint64Array;
interface SegTreeParams<S> {
  op: OperatorType<S>
  e: ElementType<S>
}

/**
 * 説明: ACL 風の通常セグメント木。点更新、区間取得、max_right/min_left ができる
 * 使い方: new Segtree(A,{op:(a,b)=>a+b,e:()=>0})
 * 計算量: 構築 O(N)、更新/区間取得 O(log N)
 */
class Segtree<S> {
  private merge: OperatorType<S>;            // 2つの要素を統合する操作 (op)
  private identityElement: ElementType<S>;   // 単位元 (e)

  private leafCount: number;                 // 元の配列の長さ (_n)
  private treeCapacity: number;              // 木の葉の数（2のべき乗） (size)
  private treeHeight: number;                // 木の高さ (log)
  private data: Array<S>;                    // データを保持する配列 (d)

  private updateNode(k: number): void {
    this.data[k] = this.merge(this.data[2 * k], this.data[2 * k + 1]);
  }

  private validateIndex(index: number, isBoundary = false): void {
    const limit = this.leafCount + (isBoundary ? 1 : 0);
    if (index < 0 || index >= limit) {
      throw new RangeError("Index out of range");
    }
  }

  constructor(
    initialValues:
      | number
      | S[]
      | (S extends number ? typevi : never)
      | (S extends bigint ? typevll : never) = 0,
    params: SegTreeParams<S>
  ) {
    const { op, e } = params;
    this.merge = op;
    this.identityElement = e;

    const values = typeof initialValues === "number"
      ? new Array<S>(initialValues).fill(null as S).map(this.identityElement)
      : initialValues;

    this.leafCount = values.length;
    this.treeCapacity = bit_ceil(this.leafCount);
    this.treeHeight = countr_zero(this.treeCapacity);
    this.data = new Array(2 * this.treeCapacity);
    
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = this.identityElement();
    }

    for (let i = 0; i < this.leafCount; i++) {
      this.data[this.treeCapacity + i] = values[i] as S;
    }

    for (let i = this.treeCapacity - 1; i >= 1; i--) {
      this.updateNode(i);
    }
  }

  /**
   * 説明: 1点更新
   * 使い方: seg.set(i,x)
   * 計算量: O(log N)
   */
  set(index: number, value: S): void {
    this.validateIndex(index);

    index += this.treeCapacity;
    this.data[index] = value;
    // 親に向かって値を更新
    for (let i = 1; i <= this.treeHeight; i++) {
      this.updateNode(index >> i);
    }
  }

  /**
   * 説明: 1点の値を取得
   * 使い方: seg.get(i)
   * 計算量: O(1)
   */
  get(index: number): S {
    this.validateIndex(index);
    return this.data[index + this.treeCapacity];
  }

  /**
   * 説明: 半開区間 [left,right) の集約値を取得する
   * 使い方: seg.query(l,r)
   * 計算量: O(log N)
   */
  query(left: number, right: number): S {
    if (!(0 <= left && left <= right && right <= this.leafCount)) {
      throw new RangeError(`Not 0 <= left <= right <= ${this.leafCount}`);
    }

    let leftResult = this.identityElement();
    let rightResult = this.identityElement();

    left += this.treeCapacity;
    right += this.treeCapacity;

    while (left < right) {
      if (left & 1) leftResult = this.merge(leftResult, this.data[left++]);
      if (right & 1) rightResult = this.merge(this.data[--right], rightResult);
      left >>= 1;
      right >>= 1;
    }

    return this.merge(leftResult, rightResult);
  }

  /**
   * 説明: 全区間の集約値を取得する
   * 使い方: seg.allResult()
   * 計算量: O(1)
   */
  allResult(): S {
    return this.data[1];
  }

  /**
   * 説明: left から右へ、条件を満たす最大右端を二分探索する
   * 使い方: seg.max_right(l,check)
   * 計算量: O(log N)
   */
  max_right(left: number, check: SearchFunction<S>): number {
    if (!(0 <= left && left <= this.leafCount)) {
      throw new RangeError(`Not 0 <= left <= ${this.leafCount}`);
    }
    if (!check(this.identityElement())) {
      throw new Error("check(identityElement) must be true.");
    }
    if (left === this.leafCount) return this.leafCount;
    left += this.treeCapacity;
    let currentSum = this.identityElement();

    do {
      while (left % 2 === 0) left >>= 1;
      if (!check(this.merge(currentSum, this.data[left]))) {
        while (left < this.treeCapacity) {
          left *= 2;
          if (check(this.merge(currentSum, this.data[left]))) {
            currentSum = this.merge(currentSum, this.data[left]);
            left++;
          }
        }
        return left - this.treeCapacity;
      }
      currentSum = this.merge(currentSum, this.data[left]);
      left++;
    } while ((left & -left) !== left);

    return this.leafCount;
  }

  /**
   * 説明: right から左へ、条件を満たす最小左端を二分探索する
   * 使い方: seg.min_left(r,check)
   * 計算量: O(log N)
   */
  min_left(right: number, check: SearchFunction<S>): number {
    if (!(0 <= right && right <= this.leafCount)) {
      throw new RangeError(`Not 0 <= right <= ${this.leafCount}`);
    }
    if (!check(this.identityElement())) {
      throw new Error("check(identityElement) must be true.");
    }
    if (right === 0) return 0;
    right += this.treeCapacity;
    let currentSum = this.identityElement();
    do {
      right--;
      while (right > 1 && (right % 2)) right >>= 1;
      if (!check(this.merge(this.data[right], currentSum))) {
        while (right < this.treeCapacity) {
          right = 2 * right + 1;
          if (check(this.merge(this.data[right], currentSum))) {
            currentSum = this.merge(this.data[right], currentSum);
            right--;
          }
        }
        return right + 1 - this.treeCapacity;
      }
      currentSum = this.merge(this.data[right], currentSum);
    } while ((right & -right) !== right);

    return 0;
  }
}

/**
 * ABC322 F
 */
interface LazySegTreeParams<S,F> {
  op?: OperatorType<S>
  e: ElementType<S>
  map?: MappingType<S, F>
  cmp: CompositionType<F>
  id: IdType<F>

  // object型Sを新しく生成せず、outへ直接書き込む高速版
  opInto?: (out: S, a: S, b: S) => void

  // object型Sを新しく生成せず、outへ直接書き込む高速版
  // out === x になる場合がある
  mapInto?: (out: S, f: F, x: S) => void
}

/**
 * 説明: ACL 風の遅延セグメント木。区間更新と区間取得を扱う
 * 使い方: new LazySegtree(A,{op,e,map,cmp,id})
 * 計算量: 構築 O(N)、更新/取得 O(log N)
 */
class LazySegtree<S = number, F = number> {
  private merge?: OperatorType<S>;                     // 2つの要素を統合する操作 (op)
  private mergeInto?: (out: S, a: S, b: S) => void;   // object型用高速版
  private identityElement: ElementType<S>;             // 単位元 (e)
  private applyMapping?: MappingType<S, F>;            // 要素に操作を適用する (mapping)
  private applyMappingInto?: (out: S, f: F, x: S) => void; // object型用高速版
  private mergeLazy: CompositionType<F>;               // 遅延操作を統合する (composition)

  private leafCount: number;                 // 元の配列の長さ (_n)
  private treeCapacity: number;              // 木の葉の数（2のべき乗） (size)
  private treeHeight: number;                // 木の高さ (log)
  private data: S[];                         // データを保持する配列 (d)
  private lazyData: F[];                     // 遅延させている操作を保持する配列 (lz)
  private hasLazy: Uint8Array;               // 遅延作用を持っているか

  private updateNode(k: number): void {
    if (this.mergeInto) {
      this.mergeInto(
        this.data[k],
        this.data[2*k],
        this.data[2*k+1]
      );
    } else {
      this.data[k] = this.merge!(
        this.data[2*k],
        this.data[2*k+1]
      );
    }
  }

  private applyAt(k: number, f: F): void {
    if (this.applyMappingInto) {
      this.applyMappingInto(this.data[k],f,this.data[k]);
    } else {
      this.data[k] = this.applyMapping!(f,this.data[k]);
    }
    // 葉でない場合は遅延配列に操作を蓄積
    if (k < this.treeCapacity) {
      if (this.hasLazy[k]) {
        this.lazyData[k] = this.mergeLazy(f,this.lazyData[k]);
      } else {
        this.lazyData[k] = f;
        this.hasLazy[k] = 1;
      }
    }
  }

  private pushDown(k: number): void {
    if (!this.hasLazy[k]) return;

    let f = this.lazyData[k];

    this.applyAt(2*k,f);
    this.applyAt(2*k+1,f);

    this.hasLazy[k] = 0;
  }

  /**
   * 説明: 遅延セグメント木を構築する
   * 使い方: new LazySegtree(A,{op,e,map,cmp,id})
   * 計算量: O(N)
   */
  constructor(
    initialValues: number | S[] = 0,
    params: LazySegTreeParams<S, F>
  ) {
    const { op, e, map, cmp, opInto, mapInto} = params;
    if (!op && !opInto) {
      throw new Error("op or opInto is required");
    }
    if (!map && !mapInto) {
      throw new Error("map or mapInto is required");
    }

    this.merge = op;
    this.mergeInto = opInto;
    this.identityElement = e;
    this.applyMapping = map;
    this.applyMappingInto = mapInto;
    this.mergeLazy = cmp;

    const values =
      typeof initialValues === "number"
        ? new Array<S>(initialValues)
            .fill(null as S)
            .map(() => this.identityElement())
        : initialValues;
    this.leafCount = values.length;
    this.treeCapacity = bit_ceil(this.leafCount);
    this.treeHeight = countr_zero(this.treeCapacity);
    this.data =
      new Array<S>(2*this.treeCapacity)
        .fill(null as S)
        .map(() => this.identityElement());
    // hasLazy=false の場所は lazyData を参照しないため
    // identityLazy で初期化する必要がない
    this.lazyData = new Array<F>(this.treeCapacity);
    this.hasLazy = new Uint8Array(this.treeCapacity);
    for (let i = 0; i < this.leafCount; i++) {
      this.data[this.treeCapacity+i] = values[i] as S;
    }
    for (let i = this.treeCapacity-1; i >= 1; i--) {
      this.updateNode(i);
    }
  }

  /**
   * 説明: 1点更新
   * 使い方: seg.set(i,x)
   * 計算量: O(log N)
   */
  set(index: number, value: S): void {
    this.validateIndex(index);
    index += this.treeCapacity;
    for (let i = this.treeHeight; i >= 1; i--) {
      this.pushDown(index>>i);
    }
    this.data[index] = value;
    for (let i = 1; i <= this.treeHeight; i++) {
      this.updateNode(index>>i);
    }
  }

  /**
   * 説明: 1点の値を取得する
   * 使い方: seg.get(i)
   * 計算量: O(log N)
   */
  get(index: number): S {
    this.validateIndex(index);
    index += this.treeCapacity;
    for (let i = this.treeHeight; i >= 1; i--) {
      this.pushDown(index>>i);
    }
    return this.data[index];
  }

  /**
   * 説明: 半開区間 [left,right) の集約値を取得する
   * 使い方: seg.query(l,r)
   * 計算量: O(log N)
   */
  query(left: number, right: number): S {
    if (
      !(
        0 <= left
        && left <= right
        && right <= this.leafCount
      )
    ) {
      throw new Error("Out of range");
    }
    if (left === right) {
      return this.identityElement();
    }
    left += this.treeCapacity;
    right += this.treeCapacity;
    for (let i = this.treeHeight; i >= 1; i--) {
      if (((left>>i)<<i) !== left) {
        this.pushDown(left>>i);
      }
      if (((right>>i)<<i) !== right) {
        this.pushDown((right-1)>>i);
      }
    }
    // object型用高速版
    if (this.mergeInto) {
      let leftResult = this.identityElement();
      let rightResult = this.identityElement();
      let leftTmp = this.identityElement();
      let rightTmp = this.identityElement();
      while (left < right) {
        if (left&1) {
          this.mergeInto(
            leftTmp,
            leftResult,
            this.data[left++]
          );
          let t = leftResult;
          leftResult = leftTmp;
          leftTmp = t;
        }
        if (right&1) {
          this.mergeInto(
            rightTmp,
            this.data[--right],
            rightResult
          );
          let t = rightResult;
          rightResult = rightTmp;
          rightTmp = t;
        }
        left >>= 1;
        right >>= 1;
      }
      let result = this.identityElement();
      this.mergeInto(
        result,
        leftResult,
        rightResult
      );
      return result;
    }
    let leftResult = this.identityElement();
    let rightResult = this.identityElement();
    while (left < right) {
      if (left&1) {
        leftResult = this.merge!(
          leftResult,
          this.data[left++]
        );
      }
      if (right&1) {
        rightResult = this.merge!(
          this.data[--right],
          rightResult
        );
      }
      left >>= 1;
      right >>= 1;
    }
    return this.merge!(leftResult,rightResult);
  }

  /**
   * 説明: 全区間の集約値を取得する
   * 使い方: seg.all_query()
   * 計算量: O(1)
   */
  all_query(): S {
    return this.data[1];
  }

  /**
   * 説明: 1点または半開区間に遅延作用を適用する
   * 使い方: seg.apply(i,f) / seg.apply(l,r,f)
   * 計算量: O(log N)
   */
  apply(index: number, func: F): void;
  apply(left: number, right: number, func: F): void;
  apply(arg1: number, arg2: number | F, arg3?: F): void {
    if (arg3 === undefined) {
      // 単一要素への適用: apply(index, func)
      let index = arg1;
      const func = arg2 as F;
      this.validateIndex(index);
      index += this.treeCapacity;
      // 上から下へ遅延を解消
      for (let i = this.treeHeight; i >= 1; i--) {
        this.pushDown(index>>i);
      }
      // 値を書き換え
      this.applyAt(index,func);
      // 下から上へ値を再計算
      for (let i = 1; i <= this.treeHeight; i++) {
        this.updateNode(index>>i);
      }
    } else {
      // 範囲への適用: apply(left, right, func)
      let left = arg1;
      let right = arg2 as number;
      const func = arg3 as F;
      if (
        !(
          0 <= left
          && left <= right
          && right <= this.leafCount
        )
      ) {
        throw new Error("Out of range");
      }
      if (left === right) return;
      left += this.treeCapacity;
      right += this.treeCapacity;
      // 1. 影響を受ける範囲の遅延を上から下に伝搬
      for (let i = this.treeHeight; i >= 1; i--) {
        if (((left>>i)<<i) !== left) {
          this.pushDown(left>>i);
        }
        if (((right>>i)<<i) !== right) {
          this.pushDown(
            (right-1)>>i
          );
        }
      }
      // 2. 対象となる区間に操作を適用
      {
        const initialLeft = left;
        const initialRight = right;
        while (left < right) {
          if (left&1) {
            this.applyAt(left++,func);
          }
          if (right&1) {
            this.applyAt(--right,func);
          }
          left >>= 1;
          right >>= 1;
        }
        left = initialLeft;
        right = initialRight;
      }
      // 3. 変更されたノードから親に向かって値を更新
      for (let i = 1; i <= this.treeHeight; i++) {
        if (((left>>i)<<i) !== left) {
          this.updateNode(left>>i);
        }
        if (((right>>i)<<i) !== right) {
          this.updateNode((right-1)>>i);
        }
      }
    }
  }

  private validateIndexInclusive(index: number): void {
    if (!(0 <= index && index <= this.leafCount)) {
      throw new Error("Index out of range (inclusive)");
    }
  }

  /**
   * 左端 left を固定し、条件 check(merge(data[left...right-1])) が true となる最大の right を返す
   * O(log n)
   */
  max_right(left: number, check: (value: S) => boolean): number {
    this.validateIndexInclusive(left); // true は boundary check (nまでOK)
    if (!check(this.identityElement())) {
      throw new Error("check(identityElement) must be true.");
    }
    if (left === this.leafCount) {
      return this.leafCount;
    }
    left += this.treeCapacity;
    // 探索開始位置までの遅延を解消
    for (let i = this.treeHeight; i >= 1; i--) {
      this.pushDown(left>>i);
    }
    // object型用高速版
    if (this.mergeInto) {
      let currentSum = this.identityElement();
      let tmp = this.identityElement();
      do {
        // 2のべき乗の区間を利用して右へ進む
        while (left%2 === 0) {
          left >>= 1;
        }
        this.mergeInto(
          tmp,
          currentSum,
          this.data[left]
        );
        // もしこのノードを足しても条件を満たすなら、次のノードへ
        if (!check(tmp)) {
          // 条件を満たさなくなるノードを見つけたら、その子ノードへ潜って境界を探す
          while (left < this.treeCapacity) {
            this.pushDown(left);
            left = 2*left; // 左の子へ
            this.mergeInto(
              tmp,
              currentSum,
              this.data[left]
            );
            if (check(tmp)) {
              let t = currentSum;
              currentSum = tmp;
              tmp = t;
              left++; // 右の子へ移動
            }
          }
          return left-this.treeCapacity;
        }
        let t = currentSum;
        currentSum = tmp;
        tmp = t;
        left++;
      } while ((left&-left) !== left); // 木の右端に到達するまで
      return this.leafCount;
    }
    let currentSum = this.identityElement();
    do {
      // 2のべき乗の区間を利用して右へ進む
      while (left%2 === 0) {
        left >>= 1;
      }
      // もしこのノードを足しても条件を満たすなら、次のノードへ
      if (
        !check(
          this.merge!(
            currentSum,
            this.data[left]
          )
        )
      ) {
        // 条件を満たさなくなるノードを見つけたら、その子ノードへ潜って境界を探す
        while (left < this.treeCapacity) {
          this.pushDown(left);
          left = 2*left; // 左の子へ
          if (
            check(
              this.merge!(
                currentSum,
                this.data[left]
              )
            )
          ) {
            currentSum = this.merge!(currentSum,this.data[left]);
            left++; // 右の子へ移動
          }
        }
        return left-this.treeCapacity;
      }
      currentSum = this.merge!(currentSum,this.data[left]);
      left++;
    } while ((left&-left) !== left); // 木の右端に到達するまで
    return this.leafCount;
  }

  /**
   * 右端 right を固定し、条件 check(merge(data[left...right-1])) が true となる最小の left を返す
   * O(log n)
   */
  min_left(right: number, check: (value: S) => boolean): number {
    this.validateIndexInclusive(right);
    if (!check(this.identityElement())) {
      throw new Error("check(identityElement) must be true.");
    }
    if (right === 0) return 0;
    right += this.treeCapacity;
    // 探索終了位置までの遅延を解消
    for (let i = this.treeHeight; i >= 1; i--) {
      this.pushDown((right-1)>>i);
    }
    // object型用高速版
    if (this.mergeInto) {
      let currentSum = this.identityElement();
      let tmp = this.identityElement();
      do {
        right--;
        while (right > 1 && (right%2)) {
          right >>= 1;
        }
        this.mergeInto(
          tmp,
          this.data[right],
          currentSum
        );
        if (!check(tmp)) {
          while (right < this.treeCapacity) {
            this.pushDown(right);
            right = 2*right+1; // 右の子へ
            this.mergeInto(
              tmp,
              this.data[right],
              currentSum
            );
            if (check(tmp)) {
              let t = currentSum;
              currentSum = tmp;
              tmp = t;
              right--; // 左の子へ移動
            }
          }
          return right+1-this.treeCapacity;
        }
        let t = currentSum;
        currentSum = tmp;
        tmp = t;
      } while ((right&-right) !== right);
      return 0;
    }
    let currentSum = this.identityElement();
    do {
      right--;
      while (right > 1 && (right%2)) {
        right >>= 1;
      }
      if (!check(this.merge!(this.data[right],currentSum))) {
        while (right < this.treeCapacity) {
          this.pushDown(right);
          right = 2*right+1; // 右の子へ
          if (check(this.merge!(this.data[right],currentSum))) {
            currentSum = this.merge!(this.data[right],currentSum);
            right--; // 左の子へ移動
          }
        }
        return right+1-this.treeCapacity;
      }
      currentSum = this.merge!(this.data[right],currentSum);
    } while ((right&-right) !== right);
    return 0;
  }

  private validateIndex(index: number): void {
    if (!(0 <= index && index < this.leafCount)) {
      throw new Error("Index out of range");
    }
  }
}

/**
 * 説明: Rerooting 内部で使う無向辺情報
 * 使い方: Rerooting が内部利用
 * 計算量: 型定義
 */
type RerootingEdge = {
  to: number;
  rev: number;
  id: number;
};

/**
 * 説明: 全方位木DP（rerooting）。各頂点を根にした答えをまとめて計算する
 * 使い方: new Rerooting(n,e,merge,lift).addEdge(...).build(0)
 * 計算量: O(N * merge/lift の計算量)
 */
class Rerooting<T> {
  public G: RerootingEdge[][];
  private edgeId = 0;

  constructor(
    private n: number,
    private e: () => T,
    private merge: (a: T, b: T) => T,
    private lift: (x: T, from: number, to: number, id: number) => T,
  ) {
    this.G = Array.from({length: n},() => []);
  }

  /**
   * 説明: 木の無向辺を追加します。id を省略すると自動採番する
   * 使い方: rerooting.addEdge(u,v)
   * 計算量: O(1)
   */
  addEdge(u: number, v: number, id: number = -1): void {
    if (id < 0) id = this.edgeId++;

    let ui = this.G[u].length;
    let vi = this.G[v].length;

    this.G[u].push({to: v, rev: vi, id});
    this.G[v].push({to: u, rev: ui, id});
  }

  /**
   * 説明: 全頂点を根としたDP結果を返す
   * 使い方: rerooting.build(root)
   * 計算量: O(N)
   */
  build(root: number = 0): T[] {
    let parent = new Int32Array(this.n);
    parent.fill(-2);

    let parentEdge = new Int32Array(this.n);
    parentEdge.fill(-1);

    let order = new Int32Array(this.n);
    let stack = new Int32Array(this.n);

    let ord = 0;
    let top = 0;

    stack[top++] = root;
    parent[root] = -1;

    while (top > 0) {
      let v = stack[--top];
      order[ord++] = v;

      for (let i = 0; i < this.G[v].length; i++) {
        let edge = this.G[v][i];
        let to = edge.to;

        if (parent[to] != -2) continue;

        parent[to] = v;
        parentEdge[to] = edge.rev;
        stack[top++] = to;
      }
    }

    // dp[v][i] = G[v][i].to 側から v へ来る寄与
    let dp: T[][] = Array.from(
      {length: this.n},
      (_,i) => Array.from({length: this.G[i].length},() => this.e())
    );

    // 子 -> 親
    for (let oi = ord-1; oi >= 0; oi--) {
      let v = order[oi];
      let acc = this.e();

      for (let i = 0; i < this.G[v].length; i++) {
        let to = this.G[v][i].to;

        // 子から来る寄与だけをまとめる
        if (parent[to] == v) {
          acc = this.merge(acc,dp[v][i]);
        }
      }

      if (parent[v] != -1) {
        let pe = parentEdge[v];
        let edge = this.G[v][pe];

        // v 側の情報を parent[v] 側へ渡す
        dp[edge.to][edge.rev] = this.lift(acc,v,edge.to,edge.id);
      }
    }

    let ans: T[] = Array.from({length: this.n},() => this.e());

    // 親 -> 子
    for (let oi = 0; oi < ord; oi++) {
      let v = order[oi];
      let deg = this.G[v].length;

      let pref: T[] = Array(deg+1);
      let suff: T[] = Array(deg+1);

      pref[0] = this.e();
      for (let i = 0; i < deg; i++) {
        pref[i+1] = this.merge(pref[i],dp[v][i]);
      }

      suff[deg] = this.e();
      for (let i = deg-1; i >= 0; i--) {
        suff[i] = this.merge(dp[v][i],suff[i+1]);
      }

      ans[v] = pref[deg];

      for (let i = 0; i < deg; i++) {
        let edge = this.G[v][i];
        let to = edge.to;

        if (parent[to] == v) {
          let val = this.merge(pref[i],suff[i+1]);
          dp[to][edge.rev] = this.lift(val,v,to,edge.id);
        }
      }
    }

    return ans;
  }
}

/**
 * 説明: 木をHL分解し、パスや部分木をセグ木区間に分解する
 * 使い方: hld.addEdge(u,v); hld.build(); hld.pathSegments(u,v)
 * 計算量: 構築 O(N)、LCA/パス分解 O(log N)
 * 用例: ABC294-G
 */
class HeavyLightDecomposition {
  public readonly n: number;
  public readonly g: number[][];
  public readonly parent: Int32Array;
  public readonly depth: Int32Array;
  public readonly sz: Int32Array;
  public readonly head: Int32Array;
  public readonly in: Int32Array;
  public readonly out: Int32Array;
  public readonly rev: Int32Array;

  /**
   * 説明: N 頂点の HLD を初期化する
   * 使い方: new HeavyLightDecomposition(N)
   * 計算量: O(N)
   */
  constructor(n: number) {
    this.n = n;
    this.g = Array.from({ length: n }, () => []);
    this.parent = new Int32Array(n).fill(-1);
    this.depth = new Int32Array(n);
    this.sz = new Int32Array(n);
    this.head = new Int32Array(n);
    this.in = new Int32Array(n);
    this.out = new Int32Array(n);
    this.rev = new Int32Array(n);
  }

  /**
   * 説明: 木の無向辺を追加する
   * 使い方: hld.addEdge(u,v)
   * 計算量: O(1)
   */
  addEdge(u: number, v: number): void {
    this.g[u].push(v);
    this.g[v].push(u);
  }

  /**
   * 説明: 親・深さ・部分木サイズ・Euler順・heavy path を構築する
   * 使い方: hld.build(root)
   * 計算量: O(N)
   */
  build(root: number = 0): void {
    const order = new Int32Array(this.n);
    let head_queue = 0, tail_queue = 0;
    
    order[tail_queue++] = root;
    this.parent[root] = -1;
    this.depth[root] = 0;

    // 1. BFSで深さと親を記録し、隣接リストから親を削除（木を有向化）
    while (head_queue < tail_queue) {
      const u = order[head_queue++];
      for (let i = 0; i < this.g[u].length; i++) {
        if (this.g[u][i] === this.parent[u]) {
          this.g[u][i] = this.g[u][this.g[u].length - 1];
          this.g[u].pop();
          break;
        }
      }
      for (let i = 0; i < this.g[u].length; i++) {
        const v = this.g[u][i];
        this.parent[v] = u;
        this.depth[v] = this.depth[u] + 1;
        order[tail_queue++] = v;
      }
    }

    // 2. ボトムアップ（葉から根）で部分木サイズを計算し、Heavy Childを先頭にスワップ
    for (let i = this.n - 1; i >= 0; i--) {
      const u = order[i];
      this.sz[u] = 1;
      let max_sub = 0;
      let heavy_idx = -1;

      for (let j = 0; j < this.g[u].length; j++) {
        const v = this.g[u][j];
        this.sz[u] += this.sz[v];
        if (this.sz[v] > max_sub) {
          max_sub = this.sz[v];
          heavy_idx = j;
        }
      }

      if (heavy_idx !== -1) {
        const temp = this.g[u][0];
        this.g[u][0] = this.g[u][heavy_idx];
        this.g[u][heavy_idx] = temp;
      }
    }

    // 3. スタックを用いたDFSでEuler Tourを行い、in/out/headを記録
    let timer = 0;
    const stack = new Int32Array(this.n);
    const edge_ptr = new Int32Array(this.n);
    let ptr = 0;
    
    stack[ptr++] = root;
    this.head[root] = root;

    while (ptr > 0) {
      const u = stack[ptr - 1];

      if (edge_ptr[u] === 0) {
        this.in[u] = timer++;
        this.rev[this.in[u]] = u;
      }

      if (edge_ptr[u] < this.g[u].length) {
        const v = this.g[u][edge_ptr[u]++];
        this.head[v] = (v === this.g[u][0]) ? this.head[u] : v;
        stack[ptr++] = v;
      } else {
        this.out[u] = timer;
        ptr--;
      }
    }
  }

  /**
   * 説明: 2頂点の LCA（最小共通祖先） を返す
   * 使い方: hld.lca(u,v)
   * 計算量: O(log N)
   */
  lca(u: number, v: number): number {
    while (this.head[u] !== this.head[v]) {
      if (this.depth[this.head[u]] > this.depth[this.head[v]]) {
        u = this.parent[this.head[u]];
      } else {
        v = this.parent[this.head[v]];
      }
    }
    return this.depth[u] < this.depth[v] ? u : v;
  }

  /**
   * 説明: 2頂点間の辺数距離を返す
   * 使い方: hld.distance(u,v)
   * 計算量: O(log N)
   */
  distance(u: number, v: number): number {
    return this.depth[u] + this.depth[v] - 2 * this.depth[this.lca(u, v)];
  }

  /**
   * 説明: パス u-v を Euler 順の区間列に分解します。edgeMode なら LCA を除外します。
   * 使い方: let [up,down]=hld.pathSegments(u,v,true)
   * 戻り値: [uからLCAへ昇る区間配列, LCAからvへ降りる区間配列]
   * 計算量: O(log N)
   */
  pathSegments(u: number, v: number, edgeMode = false): [[number, number][], [number, number][]] {
    const up: [number, number][] = [];
    const down: [number, number][] = [];

    while (this.head[u] !== this.head[v]) {
      if (this.depth[this.head[u]] > this.depth[this.head[v]]) {
        up.push([this.in[this.head[u]], this.in[u] + 1]);
        u = this.parent[this.head[u]];
      } else {
        down.push([this.in[this.head[v]], this.in[v] + 1]);
        v = this.parent[this.head[v]];
      }
    }

    if (this.depth[u] < this.depth[v]) {
      down.push([this.in[u] + (edgeMode ? 1 : 0), this.in[v] + 1]);
    } else if (this.depth[u] > this.depth[v]) {
      up.push([this.in[v] + (edgeMode ? 1 : 0), this.in[u] + 1]);
    } else if (!edgeMode) {
      up.push([this.in[u], this.in[u] + 1]);
    }

    down.reverse(); // LCAからvへの順序（上から下）に直す
    return [up, down];
  }

  /**
   * 説明: 頂点 u の部分木に対応する半開区間を返します。
   * 使い方: hld.subtreeSegment(u)
   * 計算量: O(1)
   */
  subtreeSegment(u: number, edgeMode = false): [number, number] {
    return [this.in[u] + (edgeMode ? 1 : 0), this.out[u]];
  }

  /**
   * 元の頂点番号のインデックスを持つ配列を、セグメント木に乗せるための行きがけ順(in)の配列に変換する
   */
  buildArray<T>(values: T[]): T[] {
    const res = new Array<T>(this.n);
    for (let i = 0; i < this.n; i++) {
      res[this.in[i]] = values[i];
    }
    return res;
  }
}

type LowLinkEdge = {
  to: number;
  id: number;
};

/**
 * 無向グラフの橋・関節点・分離数をLowLinkで求める。
 * 非連結グラフ・多重辺にも対応する。
 *
 * 橋:
 *   その辺を削除すると連結成分数が増える辺。
 *
 * 関節点:
 *   その頂点を削除すると連結成分数が増える頂点。
 *
 * 分離数 separate[v]:
 *   頂点vが属する連結成分からvを削除したとき、
 *   残りが何個の連結成分に分かれるか。
 *   separate[v] >= 2 ならvは関節点。
 *
 * 主な結果:
 *   isBridge[id]       辺ID idが橋か
 *   bridge             橋の辺ID一覧
 *   isArticulation[v]  頂点vが関節点か
 *   articulation       関節点一覧
 *   separate[v]        頂点vの分離数
 *
 * 使い方:
 *   let ll = new LowLink(N);
 *   let id = ll.addEdge(u,v);
 *   ll.build();
 *   ll.isBridge[id];
 *   ll.isArticulation[v];
 *   ll.separate[v];
 *
 * 計算量:
 *   build O(N+M)
 * 
 * 用例: ABC375-G
 */
class LowLink {
  G: LowLinkEdge[][];
  U: number[] = [];
  V: number[] = [];

  ord: Int32Array;
  low: Int32Array;
  parent: Int32Array;
  parentEdge: Int32Array;
  childCount: Int32Array;

  isBridge: boolean[] = [];
  bridge: number[] = [];

  isArticulation: boolean[] = [];
  articulation: number[] = [];

  /**
   * separate[v]:
   *   頂点vを削除したとき、vが属していた連結成分の残りが
   *   何個に分かれるか。
   *
   *   孤立点は0、通常の非関節点は1、関節点は2以上。
   */
  separate: Int32Array;

  componentCount = 0;

  /**
   * 説明: N 頂点の無向グラフ用 LowLink を初期化する
   * 使い方: new LowLink(N)
   * 計算量: O(N)
   */
  constructor(private n: number) {
    this.G = Array.from({length: n},() => []);
    this.ord = new Int32Array(n);
    this.low = new Int32Array(n);
    this.parent = new Int32Array(n);
    this.parentEdge = new Int32Array(n);
    this.childCount = new Int32Array(n);
    this.separate = new Int32Array(n);
  }

  /**
   * 説明: 無向辺を追加し、辺IDを返す
   * 使い方: ll.addEdge(u,v)
   * 計算量: O(1)
   */
  addEdge(u: number, v: number): number {
    let id = this.U.length;
    this.U.push(u);
    this.V.push(v);

    this.G[u].push({to: v, id});
    this.G[v].push({to: u, id});

    return id;
  }

  /**
   * 説明: 橋・関節点・分離数を計算する
   * 使い方: ll.build()
   * 計算量: O(N+M)
   */
  build(start: number = 0, end: number = this.n): void {
    this.ord.fill(-1);
    this.low.fill(0);
    this.parent.fill(-1);
    this.parentEdge.fill(-1);
    this.childCount.fill(0);
    this.separate.fill(0);

    this.bridge = [];
    this.isBridge = Array(this.U.length).fill(false);
    this.articulation = [];
    this.isArticulation = Array(this.n).fill(false);
    this.componentCount = 0;

    let timer = 0;
    let it = new Int32Array(this.n);
    let stack = new Int32Array(this.n);

    for (let root = start; root < end; root++) {
      if (this.ord[root] != -1) continue;

      this.componentCount++;

      let top = 0;
      stack[top++] = root;
      this.ord[root] = timer;
      this.low[root] = timer;
      timer++;
      this.separate[root] = 1;

      while (top > 0) {
        let v = stack[top-1];

        if (it[v] < this.G[v].length) {
          let e = this.G[v][it[v]++];
          let to = e.to;

          if (e.id == this.parentEdge[v]) continue;

          if (this.ord[to] == -1) {
            this.parent[to] = v;
            this.parentEdge[to] = e.id;
            this.childCount[v]++;

            this.ord[to] = timer;
            this.low[to] = timer;
            timer++;
            this.separate[to] = 1;

            stack[top++] = to;
          } else {
            this.low[v] = Math.min(this.low[v],this.ord[to]);
          }
        } else {
          top--;

          let p = this.parent[v];

          if (p != -1) {
            this.low[p] = Math.min(this.low[p],this.low[v]);

            if (this.ord[p] < this.low[v]) {
              this.isBridge[this.parentEdge[v]] = true;
              this.bridge.push(this.parentEdge[v]);
            }

            if (this.parent[p] != -1 && this.ord[p] <= this.low[v]) {
              this.separate[p]++;
            }
          }
        }
      }

      // rootだけは特別
      this.separate[root] = this.childCount[root];
    }

    for (let i = start; i < end; i++) {
      if (this.separate[i] >= 2) {
        this.isArticulation[i] = true;
        this.articulation.push(i);
      }
    }
  }
}

interface TopologicalSortResult {
  order: number[];
  isDAG: boolean;
  isUnique: boolean;
}

/**
 * 説明:
 *   有向グラフをトポロジカルソートする。
 *
 *   compare を省略した場合:
 *     入次数0の頂点を通常のキューで処理する。
 *
 *   compare を指定した場合:
 *     入次数0の頂点をPriorityQueueで管理し、
 *     比較関数に従うトポロジカル順序を返す。
 *
 * 返り値:
 *   order:
 *     トポロジカル順序。
 *     閉路がある場合は、処理できた頂点だけが入る。
 *
 *   isDAG:
 *     グラフ全体がDAGならtrue。
 *
 *   isUnique:
 *     トポロジカル順序が一意ならtrue。
 *     閉路がある場合はfalse。
 *
 * 使い方:
 *   let result = topologicalSort(G);
 *
 *   辞書順最小:
 *   let result = topologicalSort(G,less);
 *
 *   辞書順最大:
 *   let result = topologicalSort(G,greater);
 *
 * 計算量:
 *   compare省略時 O(V+E)
 *   compare指定時 O((V+E) log V)
 */
function topologicalSort(
  G: number[][],
  compare?: Compare<number>
): TopologicalSortResult {
  let N = G.length;
  let indegree = Array(N).fill(0);
  for (let v = 0; v < N; v++) {
    for (let to of G[v]) {
      indegree[to]++;
    }
  }
  let order: number[] = [];
  let isUnique = true;
  if (compare) {
    let pq = new PriorityQueue<number>(compare);
    for (let v = 0; v < N; v++) {
      if (indegree[v] == 0) {
        pq.push(v);
      }
    }
    while (pq.size()) {
      if (pq.size() != 1) {
        isUnique = false;
      }
      let pos = pq.pop();
      order.push(pos);
      for (let to of G[pos]) {
        indegree[to]--;
        if (indegree[to] == 0) {
          pq.push(to);
        }
      }
    }
  } else {
    let que: number[] = [];
    let idx = 0;
    for (let v = 0; v < N; v++) {
      if (indegree[v] == 0) {
        que.push(v);
      }
    }
    while (idx < que.length) {
      if (que.length-idx != 1) {
        isUnique = false;
      }
      let pos = que[idx++];
      order.push(pos);
      for (let to of G[pos]) {
        indegree[to]--;
        if (indegree[to] == 0) {
          que.push(to);
        }
      }
    }
  }
  let isDAG = order.length == N;
  if (!isDAG) {
    isUnique = false;
  }
  return {
    order,
    isDAG,
    isUnique
  };
}

/**
 * 説明: 有向グラフの強連結成分分解。縮約 DAG も作る
 * 使い方: scc.addEdge(u,v); let groups=scc.build()
 * 計算量: O(N+M)
 */
class SCC {
  G: number[][];
  rG: number[][];

  U: number[] = [];
  V: number[] = [];

  id: Int32Array;
  groups: number[][] = [];
  dag: number[][] = [];

  /**
   * 説明: N 頂点の有向グラフ用 SCC を初期化する
   * 使い方: new SCC(N)
   * 計算量: O(N)
   */
  constructor(private n: number) {
    this.G = Array.from({length: n},() => []);
    this.rG = Array.from({length: n},() => []);
    this.id = new Int32Array(n);
    this.id.fill(-1);
  }

  /**
   * 説明: 有向辺 from -> to を追加する
   * 使い方: scc.addEdge(from,to)
   * 計算量: O(1)
   */
  addEdge(from: number, to: number): void {
    this.G[from].push(to);
    this.rG[to].push(from);

    this.U.push(from);
    this.V.push(to);
  }

  /**
   * 説明: 強連結成分と縮約DAGを構築する
   * 使い方: let groups=scc.build()
   * 計算量: O(N+M)
   */
  build(start: number = 0, end: number = this.n): number[][] {
    let used = new Uint8Array(this.n);
    let it = new Int32Array(this.n);
    let order: number[] = [];

    // 1回目DFS：帰りがけ順を作る
    for (let s = start; s < end; s++) {
      if (used[s]) continue;

      let stack = [s];
      used[s] = 1;

      while (stack.length) {
        let v = stack[stack.length-1];

        if (it[v] < this.G[v].length) {
          let to = this.G[v][it[v]++];

          if (to < start || end <= to) continue;
          if (used[to]) continue;

          used[to] = 1;
          stack.push(to);
        } else {
          order.push(v);
          stack.pop();
        }
      }
    }

    this.id.fill(-1);
    this.groups = [];

    // 2回目DFS：逆グラフでSCCを作る
    for (let oi = order.length-1; oi >= 0; oi--) {
      let s = order[oi];
      if (this.id[s] != -1) continue;

      let gid = this.groups.length;
      let group: number[] = [];

      let stack = [s];
      this.id[s] = gid;

      while (stack.length) {
        let v = stack.pop()!;
        group.push(v);

        for (let to of this.rG[v]) {
          if (to < start || end <= to) continue;
          if (this.id[to] != -1) continue;

          this.id[to] = gid;
          stack.push(to);
        }
      }

      this.groups.push(group);
    }

    // SCCを縮約したDAGを作る
    this.dag = Array.from({length: this.groups.length},() => []);
    let set = new Set<number>();
    let K = this.groups.length;

    for (let i = 0; i < this.U.length; i++) {
      let a = this.id[this.U[i]];
      let b = this.id[this.V[i]];

      if (a == -1 || b == -1) continue;
      if (a == b) continue;

      let key = a*K+b;
      if (set.has(key)) continue;

      set.add(key);
      this.dag[a].push(b);
    }

    return this.groups;
  }
}

/**
 * 説明:
 *   N個の真偽値変数に対する2-SATを解く。
 *
 *   変数iについて、
 *     falseの頂点: 2*i
 *     true の頂点: 2*i+1
 *   として含意グラフを構築する。
 *
 * 使い方:
 *   let ts = new TwoSAT(N);
 *   ts.addClause(i,true,j,false);
 *
 *   if (ts.satisfiable()) {
 *     let ans = ts.answer;
 *   }
 *
 * 計算量:
 *   制約追加 O(1)
 *   satisfiable O(N+M)
 */
class TwoSAT {
  private scc: SCC;

  /**
   * 最後に satisfiable() を実行したときの充足割当。
   * 充足不可能な場合は空配列。
   */
  answer: boolean[] = [];

  /**
   * 説明:
   *   N変数、制約0個の2-SATを作る。
   *
   * 使い方:
   *   let ts = new TwoSAT(N);
   *
   * 計算量:
   *   O(N)
   */
  constructor(private n: number) {
    this.scc = new SCC(2*n);
  }

  /**
   * 変数iがvalueであることを表す頂点番号。
   */
  private node(
    i: number,
    value: boolean
  ): number {
    return 2*i+(value ? 1 : 0);
  }

  /**
   * 説明:
   *   次のOR制約を追加する。
   *
   *   (x_i == f) OR (x_j == g)
   *
   * 使い方:
   *   ts.addClause(i,true,j,false);
   *
   * 計算量:
   *   O(1)
   */
  addClause(
    i: number,
    f: boolean,
    j: number,
    g: boolean
  ): void {
    let a = this.node(i,f);
    let b = this.node(j,g);
    // not a -> b
    this.scc.addEdge(a^1,b);
    // not b -> a
    this.scc.addEdge(b^1,a);
  }

  /**
   * 説明:
   *   次の含意制約を追加する。
   *
   *   (x_i == f) -> (x_j == g)
   *
   * 使い方:
   *   ts.addImplication(i,true,j,false);
   *
   * 計算量:
   *   O(1)
   */
  addImplication(
    i: number,
    f: boolean,
    j: number,
    g: boolean
  ): void {
    this.addClause(i,!f,j,g);
  }

  /**
   * 説明:
   *   x_iをvalueに固定する。
   *
   * 使い方:
   *   ts.setValue(i,true);
   *
   * 計算量:
   *   O(1)
   */
  setValue(
    i: number,
    value: boolean
  ): void {
    this.addClause(
      i,
      value,
      i,
      value
    );
  }

  /**
   * 説明:
   *   次の組み合わせを禁止する。
   *
   *   not(
   *     (x_i == f)
   *     AND
   *     (x_j == g)
   *   )
   *
   * 使い方:
   *   ts.addForbidden(i,true,j,false);
   *
   * 計算量:
   *   O(1)
   */
  addForbidden(
    i: number,
    f: boolean,
    j: number,
    g: boolean
  ): void {
    this.addClause(i,!f,j,!g);
  }

  /**
   * 説明:
   *   x_iとx_jが等しいという制約を追加する。
   *
   *   x_i == x_j
   *
   * 使い方:
   *   ts.addEqual(i,j);
   *
   * 計算量:
   *   O(1)
   */
  addEqual(
    i: number,
    j: number
  ): void {
    this.addClause(i,false,j,true);
    this.addClause(i,true,j,false);
  }

  /**
   * 説明:
   *   x_iとx_jが異なるという制約を追加する。
   *
   *   x_i != x_j
   *
   * 使い方:
   *   ts.addXor(i,j);
   *
   * 計算量:
   *   O(1)
   */
  addXor(
    i: number,
    j: number
  ): void {
    this.addClause(i,true,j,true);
    this.addClause(i,false,j,false);
  }

  /**
   * 説明:
   *   すべての制約を満たす割当が存在するか判定する。
   *
   *   存在する場合、answer[i]にx_iの値を格納する。
   *   存在しない場合、answerを空配列にする。
   *
   * 使い方:
   *   if (ts.satisfiable()) {
   *     let ans = ts.answer;
   *   }
   *
   * 計算量:
   *   O(N+M)
   */
  satisfiable(): boolean {
    this.scc.build();
    for (let i = 0; i < this.n; i++) {
      if (this.scc.id[2*i] == this.scc.id[2*i+1]) {
        this.answer = [];
        return false;
      }
    }
    this.answer = Array(this.n);
    for (let i = 0; i < this.n; i++) {
      this.answer[i] =
        this.scc.id[2*i]
        <
        this.scc.id[2*i+1];
    }
    return true;
  }

  /**
   * 説明:
   *   充足可能なら割当を返し、
   *   不可能ならnullを返す。
   *
   * 使い方:
   *   let ans = ts.solve();
   *
   * 計算量:
   *   O(N+M)
   */
  solve(): boolean[] | null {
    if (!this.satisfiable()) {
      return null;
    }
    return this.answer.slice();
  }
}

/**
 * 説明: 各頂点の出次数が1の functional graph を解析する。サイクル、距離、doubling を持つ
 * 使い方: let fg = new FunctionalGraph(to); fg.isCycle[v]; fg.jump(v,k)
 * 計算量: 構築 O(N)、doubling 構築 O(N log K)、jump O(log K)
 */
class FunctionalGraph {
  to: number[];
  n: number;
  rev: number[][];
  indeg: number[];

  isCycle: boolean[];
  cycleId: number[];
  cyclePos: number[];
  cycleSize: number[];
  dist: number[];
  enter: number[];
  cycles: number[][];

  up: number[][];

  /**
   * 説明: to[i] へ進む functional graph を構築・解析する
   * 使い方: new FunctionalGraph(to)
   * 計算量: O(N)
   */
  constructor(to: any) {
    this.to = to;
    this.n = to.length;

    this.rev = Array.from({length: this.n},() => []);
    this.indeg = Array(this.n).fill(0);

    for (let i = 0; i < this.n; i++) {
      this.rev[this.to[i]].push(i);
      this.indeg[this.to[i]]++;
    }

    this.isCycle = Array(this.n).fill(false);
    this.cycleId = Array(this.n).fill(-1);
    this.cyclePos = Array(this.n).fill(-1);
    this.cycleSize = Array(this.n).fill(0);
    this.dist = Array(this.n).fill(-1);
    this.enter = Array(this.n).fill(-1);
    this.cycles = [];

    this.up = [];

    this.build();
  }

  /**
   * 説明: サイクル情報とサイクルまでの距離を計算する。通常は constructor から呼ばれる
   * 使い方: fg.build()
   * 計算量: O(N)
   */
  build() {
    let que: number[] = [];
    let head = 0;
    let removed = Array(this.n).fill(false);
    let deg = this.indeg.slice();

    for (let i = 0; i < this.n; i++) {
      if (deg[i] == 0) que.push(i);
    }

    while (head < que.length) {
      let v = que[head++];
      removed[v] = true;

      let to = this.to[v];
      deg[to]--;

      if (deg[to] == 0) {
        que.push(to);
      }
    }

    let seen = Array(this.n).fill(false);

    for (let i = 0; i < this.n; i++) {
      if (removed[i]) continue;
      if (seen[i]) continue;

      let cyc: number[] = [];
      let v = i;

      while (!seen[v]) {
        seen[v] = true;
        cyc.push(v);
        v = this.to[v];
      }

      let id = this.cycles.length;
      this.cycles.push(cyc);

      for (let j = 0; j < cyc.length; j++) {
        let v = cyc[j];

        this.isCycle[v] = true;
        this.cycleId[v] = id;
        this.cyclePos[v] = j;
        this.cycleSize[v] = cyc.length;
        this.dist[v] = 0;
        this.enter[v] = v;
      }
    }

    let q: number[] = [];
    head = 0;

    for (let i = 0; i < this.n; i++) {
      if (this.isCycle[i]) q.push(i);
    }

    while (head < q.length) {
      let v = q[head++];

      for (let from of this.rev[v]) {
        if (this.dist[from] != -1) continue;

        this.dist[from] = this.dist[v]+1;
        this.cycleId[from] = this.cycleId[v];
        this.cycleSize[from] = this.cycleSize[v];
        this.enter[from] = this.enter[v];

        q.push(from);
      }
    }
  }

  /**
   * 説明: サイクル上にある頂点数を返する
   * 使い方: fg.cycleVertexCount()
   * 計算量: O(N)
   * 用例: ABC296-E
   */
  cycleVertexCount() {
    let res = 0;

    for (let i = 0; i < this.n; i++) {
      if (this.isCycle[i]) res++;
    }

    return res;
  }

  /**
   * 説明: kステップ遷移用の doubling(ダブリング) テーブルを作る
   * 使い方: fg.buildDoubling(maxLog)
   * 計算量: O(N maxLog)
   * 用例: ABC367-E, ABC258-E
   */
  buildDoubling(maxLog = 61) {
    this.up = Array.from({length: maxLog},() => Array(this.n).fill(0));

    for (let i = 0; i < this.n; i++) {
      this.up[0][i] = this.to[i];
    }

    for (let k = 1; k < maxLog; k++) {
      for (let i = 0; i < this.n; i++) {
        this.up[k][i] = this.up[k-1][this.up[k-1][i]];
      }
    }
  }

  /**
   * 説明: 頂点 v から k 回進んだ頂点を返す
   * 使い方: fg.jump(v,k)
   * 計算量: O(log k)
   * 用例: ABC367-E, ABC258-E
   */
  jump(v: any, k: any) {
    if (this.up.length == 0) {
      this.buildDoubling();
    }

    if (typeof k == "bigint") {
      let cur = v;
      let bit = 0;
      let kk = k;

      while (kk > 0n) {
        if (kk & 1n) cur = this.up[bit][cur];
        kk >>= 1n;
        bit++;
      }

      return cur;
    } else {
      let cur = v;
      let bit = 0;
      let kk = k;

      while (kk > 0) {
        if (kk%2 == 1) cur = this.up[bit][cur];
        kk = Math.floor(kk/2);
        bit++;
      }

      return cur;
    }
  }
}

type TreeDiameterEdge = {
  to: number;
  cost: number;
};

type TreeDiameterSearchResult = {
  far: number;
  dist: number[];
  par: number[];
};

/**
 * 説明:
 *   木の直径、直径パス、中心、半径、各頂点の離心率などを求める。
 *   addEdge の cost を省略すると重み1の通常の木として扱う。
 *   build(start) は start が属する連結成分を対象にするため、
 *   new TreeDiameter(N+1), build(1) の1-indexed形式にも対応する。
 *
 * 使い方:
 *   let td = new TreeDiameter(N);
 *   td.addEdge(u,v);
 *   td.build();
 *   td.diameter;
 *   td.endpoints;
 *   td.path;
 *
 * 計算量:
 *   addEdge O(1)
 *   getFarthest O(N)
 *   build O(N)
 */
class TreeDiameter {
  G: TreeDiameterEdge[][];
  // 直径の長さ
  diameter = 0;
  // 直径の端点 [A,B]
  endpoints: [number,number] = [0,0];
  // A から B までの直径パス
  path: number[] = [];
  // 木の半径と、離心率が半径になる頂点
  radius = 0;
  center: number[] = [];
  // 直径の端点 A,B から各頂点までの距離
  distA: number[] = [];
  distB: number[] = [];
  // eccentricity[v] = v から最も遠い頂点までの距離
  eccentricity: number[] = [];
  // 各頂点から直径パスまでの距離
  distToDiameter: number[] = [];
  // 直径パス上の頂点か
  onDiameter: boolean[] = [];
  // build(start) で対象になった連結成分の頂点数
  componentSize = 0;

  /**
   * 説明: N 頂点の木を初期化する
   * 使い方: new TreeDiameter(N)
   * 計算量: O(N)
   */
  constructor(private n: number) {
    this.G = Array.from({length: n},() => []);
  }

  /**
   * 説明: 無向辺を追加する。cost 省略時は重み1
   * 使い方: td.addEdge(u,v) / td.addEdge(u,v,cost)
   * 計算量: O(1)
   */
  addEdge(u: number, v: number, cost: number = 1): void {
    this.G[u].push({to: v,cost});
    this.G[v].push({to: u,cost});
  }

  /**
   * 説明:
   *   start から各頂点までの距離と、最も遠い頂点を求める。
   *   木なので重み付きでも優先度付きキューは不要。
   *
   * 使い方: let {far,dist,par} = td.getFarthest(start)
   * 計算量: O(N)
   */
  getFarthest(start: number): TreeDiameterSearchResult {
    let dist = Array(this.n).fill(-1);
    let par = Array(this.n).fill(-1);
    let que = [start];
    let idx = 0;
    dist[start] = 0;
    par[start] = -2;
    let far = start;
    while (idx < que.length) {
      let pos = que[idx++];
      for (let edge of this.G[pos]) {
        let to = edge.to;
        if (par[to] != -1) continue;
        par[to] = pos;
        dist[to] = dist[pos]+edge.cost;
        que.push(to);
        if (dist[to] > dist[far]) {
          far = to;
        }
      }
    }
    return {far,dist,par};
  }

  /**
   * 説明:
   *   start が属する木について、直径に関する情報をすべて構築する。
   *   1-indexedで頂点0を使わない場合は build(1) とする。
   *
   * 使い方: td.build() / td.build(1)
   * 計算量: O(N)
   */
  build(start: number = 0): this {
    // 任意の頂点から最も遠い頂点Aを求める
    let first = this.getFarthest(start);
    let A = first.far;
    // Aから最も遠い頂点Bを求める
    let second = this.getFarthest(A);
    let B = second.far;
    // Bから各頂点までの距離を求める
    let third = this.getFarthest(B);
    this.diameter = second.dist[B];
    this.endpoints = [A,B];
    this.distA = second.dist;
    this.distB = third.dist;
    // 直径パスを復元
    this.path = [];
    let now = B;
    while (true) {
      this.path.push(now);
      if (now == A) break;
      now = second.par[now];
    }
    this.path.reverse();
    this.onDiameter = Array(this.n).fill(false);
    for (let v of this.path) {
      this.onDiameter[v] = true;
    }
    this.radius = Infinity;
    this.center = [];
    this.eccentricity = Array(this.n).fill(-1);
    this.distToDiameter = Array(this.n).fill(-1);
    this.componentSize = 0;
    for (let i = 0; i < this.n; i++) {
      if (this.distA[i] == -1) continue;
      this.componentSize++;
      // 直径の端点のどちらかが、iから最も遠い頂点になる
      this.eccentricity[i] = Math.max(
        this.distA[i],
        this.distB[i]
      );
      // d(i,A)+d(i,B)-d(A,B) は、
      // iから直径パスまでを2回通った距離
      this.distToDiameter[i] = (
        this.distA[i]
        +this.distB[i]
        -this.diameter
      )/2;
      this.radius = Math.min(
        this.radius,
        this.eccentricity[i]
      );
    }
    for (let i = 0; i < this.n; i++) {
      if (this.eccentricity[i] == this.radius) {
        this.center.push(i);
      }
    }
    return this;
  }

  /**
   * 説明: 頂点vが、今回求めた直径パス上にあるか判定する
   * 使い方: td.isOnDiameter(v)
   * 計算量: O(1)
   */
  isOnDiameter(v: number): boolean {
    return this.onDiameter[v];
  }
}

/**
 * 説明: Trie ノード用の簡易クラス。next に子、idx に通過/終端情報を持たせて使う
 * 使い方: let root = new Trie()
 * 計算量: 操作は実装する探索/挿入の文字数に比例
 */
class Trie {
  next: Map<number, Trie> = new Map();
  nextSet: TreeMultiSet<number> = new TreeMultiSet();
  idx: number[] = [];
}

/**
 * 説明: TreeMultiSet 内部の AVL 木ノード。部分木要素数も管理する
 * 使い方: TreeMultiSet から内部的に利用
 * 計算量: 内部処理
 */
class TreeSetNode<T> {
  value: T;
  left: TreeSetNode<T> | null;
  right: TreeSetNode<T> | null;
  height: number;
  count: number;
  size: number;

  constructor(n: T) {
    this.value = n;
    this.left = null;
    this.right = null;

    this.height = 1;
    this.count = 1;
    this.size = 1;
  }
}

/**
 * 説明:
 *   AVL 木ベースの多重集合。
 *   値の追加・削除・前後要素検索・k番目・順位取得ができる
 *
 * 使い方:
 *   let st = new TreeMultiSet<number>();
 *   st.add(x);
 *   st.kth(k);
 *   st.order_of_key(x);
 *
 * 計算量:
 *   各操作 O(log N)
 */
class TreeMultiSet<T> {
  root: TreeSetNode<T> | null;

  private _inserted = false;
  private _deleted = false;

  constructor() {
    this.root = null;
  }

  /**
   * 説明: 値を1個追加する。重複可能
   * 使い方: st.add(x)
   * 計算量: O(log N)
   */
  add(val: T): this {
    this.root = this._addHelper(this.root,val,false);
    return this;
  }

  /**
   * 説明:
   *   val が存在しないときだけ追加する。
   *   追加したら true、既に存在すれば false
   *
   * 使い方: st.addUnique(x)
   * 計算量: O(log N)
   */
  addUnique(val: T): boolean {
    this._inserted = false;
    this.root = this._addHelper(this.root,val,true);
    return this._inserted;
  }

  /**
   * 説明:
   *   値を1個削除する。
   *   削除できたら true、存在しなければ false
   *
   * 使い方: st.delete(x)
   * 計算量: O(log N)
   */
  delete(val: T): boolean {
    this._deleted = false;
    this.root = this._deleteHelper(this.root,val);
    return this._deleted;
  }

  /**
   * 説明: val が存在するか
   * 使い方: st.has(x)
   * 計算量: O(log N)
   */
  has(val: T): boolean {
    return this.count(val) > 0;
  }

  /**
   * 説明: val の個数を返す
   * 使い方: st.count(x)
   * 計算量: O(log N)
   */
  count(val: T): number {
    let node = this.root;
    while (node) {
      if (val < node.value) {
        node = node.left;
      } else if (node.value < val) {
        node = node.right;
      } else {
        return node.count;
      }
    }
    return 0;
  }

  /**
   * 説明: 全要素数を返す。重複も数える
   * 使い方: st.size()
   * 計算量: O(1)
   */
  size(): number {
    return this._getSize(this.root);
  }

  /**
   * 説明:
   *   0-indexed で k 番目に小さい値を返す。
   *   範囲外なら undefined
   *
   * 使い方: st.kth(0)
   * 計算量: O(log N)
   */
  kth(k: number): T | undefined {
    if (k < 0 || this.size() <= k) {
      return undefined;
    }
    let node = this.root;
    while (node) {
      let ls = this._getSize(node.left);
      if (k < ls) {
        node = node.left;
      } else if (k < ls+node.count) {
        return node.value;
      } else {
        k -= ls+node.count;
        node = node.right;
      }
    }
    return undefined;
  }

  /**
   * 説明:
   *   val より小さい要素数を返す。
   *   重複も数える
   *
   * 使い方: st.order_of_key(x)
   * 計算量: O(log N)
   */
  order_of_key(val: T): number {
    let node = this.root;
    let res = 0;
    while (node) {
      if (val <= node.value) {
        node = node.left;
      } else {
        res += this._getSize(node.left)+node.count;
        node = node.right;
      }
    }
    return res;
  }

  /**
   * 説明:
   *   val 以下の要素数を返す。
   *   重複も数える
   *
   * 使い方: st.order_of_key_upper(x)
   * 計算量: O(log N)
   */
  order_of_key_upper(val: T): number {
    let node = this.root;
    let res = 0;
    while (node) {
      if (val < node.value) {
        node = node.left;
      } else {
        res += this._getSize(node.left)+node.count;
        node = node.right;
      }
    }
    return res;
  }

  /**
   * 説明: 最小値を返す。空なら undefined
   * 計算量: O(log N)
   */
  min(): T | undefined {
    if (!this.root) return undefined;
    return this._findMin(this.root).value;
  }

  /**
   * 説明: 最大値を返す。空なら undefined
   * 計算量: O(log N)
   */
  max(): T | undefined {
    if (!this.root) return undefined;
    return this._findMax(this.root).value;
  }

  /**
   * 説明: val 以上の最小値
   * 計算量: O(log N)
   */
  lower_bound(val: T): T | undefined {
    let node = this.root;
    let res: T | undefined = undefined;
    while (node) {
      if (!(node.value < val)) {
        res = node.value;
        node = node.left;
      } else {
        node = node.right;
      }
    }
    return res;
  }

  /**
   * 説明: val より大きい最小値
   * 計算量: O(log N)
   */
  upper_bound(val: T): T | undefined {
    let node = this.root;
    let res: T | undefined = undefined;
    while (node) {
      if (val < node.value) {
        res = node.value;
        node = node.left;
      } else {
        node = node.right;
      }
    }
    return res;
  }

  /**
   * 説明: val より小さい最大値
   * 計算量: O(log N)
   */
  prev(val: T): T | undefined {
    let node = this.root;
    let res: T | undefined = undefined;
    while (node) {
      if (node.value < val) {
        res = node.value;
        node = node.right;
      } else {
        node = node.left;
      }
    }
    return res;
  }

  /**
   * 説明: val より大きい最小値
   * 計算量: O(log N)
   */
  next(val: T): T | undefined {
    return this.upper_bound(val);
  }

  /**
   * 説明: val 以下の最大値
   * 計算量: O(log N)
   */
  floor(val: T): T | undefined {
    let node = this.root;
    let res: T | undefined = undefined;
    while (node) {
      if (!(val < node.value)) {
        res = node.value;
        node = node.right;
      } else {
        node = node.left;
      }
    }
    return res;
  }

  /**
   * 説明: val 以上の最小値
   * 計算量: O(log N)
   */
  ceil(val: T): T | undefined {
    return this.lower_bound(val);
  }

  /** private */
  private _getHeight(node: TreeSetNode<T> | null): number {
    return node ? node.height : 0;
  }

  private _getSize(node: TreeSetNode<T> | null): number {
    return node ? node.size : 0;
  }

  /**
   * height と size をまとめて更新する
   */
  private _update(node: TreeSetNode<T>): void {
    node.height =
      Math.max(
        this._getHeight(node.left),
        this._getHeight(node.right)
      )+1;
    node.size =
      this._getSize(node.left)
      +this._getSize(node.right)
      +node.count;
  }

  private _getBalanceFactor(node: TreeSetNode<T>): number {
    return this._getHeight(node.right)-this._getHeight(node.left);
  }

  /**
   * 挿入・削除の両方に使える再平衡
   */
  private _balance(node: TreeSetNode<T>): TreeSetNode<T> {
    this._update(node);
    let factor = this._getBalanceFactor(node);
    if (factor < -1) {
      if (this._getBalanceFactor(node.left!) > 0) {
        node.left = this._leftRotate(node.left!);
      }
      return this._rightRotate(node);
    }
    if (1 < factor) {
      if (this._getBalanceFactor(node.right!) < 0) {
        node.right = this._rightRotate(node.right!);
      }
      return this._leftRotate(node);
    }
    return node;
  }

  private _leftRotate(node: TreeSetNode<T>): TreeSetNode<T> {
    let pivot = node.right!;
    node.right = pivot.left;
    pivot.left = node;
    this._update(node);
    this._update(pivot);
    return pivot;
  }

  private _rightRotate(node: TreeSetNode<T>): TreeSetNode<T> {
    let pivot = node.left!;
    node.left = pivot.right;
    pivot.right = node;
    this._update(node);
    this._update(pivot);
    return pivot;
  }

  private _addHelper(
    node: TreeSetNode<T> | null,
    val: T,
    unique: boolean
  ): TreeSetNode<T> {
    if (!node) {
      this._inserted = true;
      return new TreeSetNode(val);
    }
    if (val < node.value) {
      node.left = this._addHelper(node.left,val,unique);
    } else if (node.value < val) {
      node.right = this._addHelper(node.right,val,unique);
    } else {
      if (unique) {
        return node;
      }
      node.count++;
      node.size++;
      return node;
    }
    return this._balance(node);
  }

  private _deleteHelper(
    node: TreeSetNode<T> | null,
    val: T
  ): TreeSetNode<T> | null {
    if (!node) {
      return null;
    }
    if (val < node.value) {
      node.left = this._deleteHelper(node.left,val);
    } else if (node.value < val) {
      node.right = this._deleteHelper(node.right,val);
    } else {
      this._deleted = true;
      if (1 < node.count) {
        node.count--;
        return this._balance(node);
      }
      if (!node.left) {
        return node.right;
      }
      if (!node.right) {
        return node.left;
      }
      let min = this._findMin(node.right);
      node.value = min.value;
      node.count = min.count;
      node.right = this._deleteMin(node.right);
    }
    return this._balance(node);
  }

  /**
   * 部分木の最小ノードを丸ごと削除する
   */
  private _deleteMin(
    node: TreeSetNode<T>
  ): TreeSetNode<T> | null {
    if (!node.left) {
      return node.right;
    }
    node.left = this._deleteMin(node.left);
    return this._balance(node);
  }

  private _findMin(node: TreeSetNode<T>): TreeSetNode<T> {
    while (node.left) {
      node = node.left;
    }
    return node;
  }

  private _findMax(node: TreeSetNode<T>): TreeSetNode<T> {
    while (node.right) {
      node = node.right;
    }
    return node;
  }
}

/**
 * 説明:
 *   初期状態で 0,1,...,N-1 を持つ集合。
 *   要素を削除しながら、指定位置以上・以下で
 *   最も近い未削除位置をUnion-Findで求める。
 *
 *   削除した要素を再挿入することはできない。
 *
 * 使い方:
 *   let st = new AvailableIndexSet(N);
 *   st.erase(i);
 *   st.next(i);
 *   st.prev(i);
 *
 * 計算量:
 *   構築 O(N)
 *   erase/next/prev ならし O(α(N))
 */
class AvailableIndexSet {
  readonly n: number;
  private nextParent: number[];
  private prevParent: number[];
  private alive: boolean[];
  private count: number;
  constructor(n: number) {
    this.n = n;
    this.nextParent = Array.from(
      {length:n+1},
      (_,i) => i
    );
    this.prevParent = Array.from(
      {length:n+1},
      (_,i) => i
    );
    this.alive = Array(n).fill(true);
    this.count = n;
  }

  /**
   * 説明:
   *   Union-Findの代表元を返す。
   *   再帰を使わず経路圧縮する。
   *
   * 計算量:
   *   ならし O(α(N))
   */
  private root(
    parent: number[],
    index: number
  ): number {
    let r = index;
    while (parent[r] != r) {
      r = parent[r];
    }
    while (parent[index] != index) {
      let next = parent[index];
      parent[index] = r;
      index = next;
    }
    return r;
  }

  /**
   * 説明:
   *   indexを集合から削除する。
   *   削除できたらtrue、削除済みならfalse。
   *
   * 使い方:
   *   st.erase(index)
   *
   * 計算量:
   *   ならし O(α(N))
   */
  erase(index: number): boolean {
    if (!(0 <= index && index < this.n)) {
      throw new RangeError(
        `Not 0 <= index < ${this.n}`
      );
    }
    if (!this.alive[index]) {
      return false;
    }
    this.alive[index] = false;
    this.count--;
    // index以上の次の生存位置へつなぐ
    this.nextParent[index] = this.root(
      this.nextParent,
      index+1
    );
    // prevParentでは、位置iをi+1に対応させる
    this.prevParent[index+1] = this.root(
      this.prevParent,
      index
    );
    return true;
  }

  /**
   * 説明:
   *   index以上の最小の未削除位置を返す。
   *   存在しなければundefined。
   *
   * 使い方:
   *   st.next(index)
   *
   * 計算量:
   *   ならし O(α(N))
   */
  next(index: number): number | undefined {
    if (index < 0) index = 0;
    if (this.n <= index) return undefined;
    let res = this.root(
      this.nextParent,
      index
    );
    return res == this.n
      ? undefined
      : res;
  }

  /**
   * 説明:
   *   index以下の最大の未削除位置を返す。
   *   存在しなければundefined。
   *
   * 使い方:
   *   st.prev(index)
   *
   * 計算量:
   *   ならし O(α(N))
   */
  prev(index: number): number | undefined {
    if (index < 0) return undefined;
    if (this.n <= index) {
      index = this.n-1;
    }
    let res = this.root(
      this.prevParent,
      index+1
    );
    return res == 0
      ? undefined
      : res-1;
  }

  /**
   * 説明:
   *   indexがまだ削除されていないかを返す。
   *
   * 計算量:
   *   O(1)
   */
  has(index: number): boolean {
    return (
      0 <= index
      && index < this.n
      && this.alive[index]
    );
  }

  /**
   * 説明:
   *   未削除要素数を返す。
   *
   * 計算量:
   *   O(1)
   */
  size(): number {
    return this.count;
  }
}

/**
 * 説明:
 *   0-indexed の Fenwick Tree。
 *   点加算と半開区間和を扱う。
 *
 * 使い方:
 *   let fw = new FenwickTree(N);
 *   fw.add(i,x);
 *   fw.sum(r);       // [0,r)
 *   fw.sum(l,r);     // [l,r)
 *
 *   let fw2 = new FenwickTree(A); // O(N) 構築
 *
 * 計算量:
 *   構築 O(N)
 *   add/sum/get/set/lowerBound/upperBound O(log N)
 */
class FenwickTree {
  readonly n: number;
  private readonly data: Float64Array;

  /**
   * 説明:
   *   サイズ N または初期配列から構築する。
   *
   * 使い方:
   *   new FenwickTree(N)
   *   new FenwickTree(A)
   *
   * 計算量:
   *   サイズ指定 O(N)
   *   配列指定 O(N)
   */
  constructor(n: number);
  constructor(values: ArrayLike<number>);
  constructor(arg: number | ArrayLike<number>) {
    if (typeof arg == "number") {
      this.n = arg;
      this.data = new Float64Array(this.n+1);
      return;
    }
    this.n = arg.length;
    this.data = new Float64Array(this.n+1);
    for (let i = 0; i < this.n; i++) {
      let idx = i+1;
      this.data[idx] += arg[i];
      let next = idx+(idx&-idx);
      if (next <= this.n) {
        this.data[next] += this.data[idx];
      }
    }
  }

  /**
   * 説明:
   *   0-indexed の index に value を加算する。
   *
   * 使い方:
   *   fw.add(i,x)
   *
   * 計算量:
   *   O(log N)
   */
  add(index: number, value: number): this {
    if (!(0 <= index && index < this.n)) {
      throw new RangeError(`Not 0 <= index < ${this.n}`);
    }
    for (let i = index+1; i <= this.n; i += i&-i) {
      this.data[i] += value;
    }
    return this;
  }

  /**
   * 説明:
   *   [0,right) の和を返す。
   *
   * 使い方:
   *   fw.sum(r)
   *
   * 計算量:
   *   O(log N)
   */
  sum(right: number): number;
  /**
   * 説明:
   *   半開区間 [left,right) の和を返す。
   *
   * 使い方:
   *   fw.sum(l,r)
   *
   * 計算量:
   *   O(log N)
   */
  sum(left: number, right: number): number;
  sum(a: number, b?: number): number {
    if (b === undefined) {
      if (!(0 <= a && a <= this.n)) {
        throw new RangeError(`Not 0 <= right <= ${this.n}`);
      }
      return this._prefix(a);
    }
    if (!(0 <= a && a <= b && b <= this.n)) {
      throw new RangeError(`Not 0 <= left <= right <= ${this.n}`);
    }
    return this._prefix(b)-this._prefix(a);
  }

  /**
   * 説明:
   *   index の値を返す。
   *
   * 使い方:
   *   fw.get(i)
   *
   * 計算量:
   *   O(log N)
   */
  get(index: number): number {
    if (!(0 <= index && index < this.n)) {
      throw new RangeError(`Not 0 <= index < ${this.n}`);
    }
    return this._prefix(index+1)-this._prefix(index);
  }

  /**
   * 説明:
   *   index の値を value に変更する。
   *
   * 使い方:
   *   fw.set(i,x)
   *
   * 計算量:
   *   O(log N)
   */
  set(index: number, value: number): this {
    if (!(0 <= index && index < this.n)) {
      throw new RangeError(`Not 0 <= index < ${this.n}`);
    }
    return this.add(index,value-this.get(index));
  }

  /**
   * 説明:
   *   全要素の和を返す。
   *
   * 使い方:
   *   fw.total()
   *
   * 計算量:
   *   O(log N)
   */
  total(): number {
    return this._prefix(this.n);
  }

  /**
   * 説明:
   *   sum(0,i+1) >= x となる最小の 0-indexed i を返す。
   *   存在しなければ n を返す。
   *
   * 注意:
   *   各要素が非負である必要がある。
   *
   * 使い方:
   *   fw.lowerBound(x)
   *
   * 例:
   *   A=[2,0,3]
   *   lowerBound(1) = 0
   *   lowerBound(2) = 0
   *   lowerBound(3) = 2
   *   lowerBound(6) = 3
   *
   * 計算量:
   *   O(log N)
   */
  lowerBound(x: number): number {
    if (x <= 0) {
      return 0;
    }
    let idx = 0;
    let k = 1;
    while ((k<<1) <= this.n) {
      k <<= 1;
    }
    while (k > 0) {
      let next = idx+k;
      if (next <= this.n && this.data[next] < x) {
        x -= this.data[next];
        idx = next;
      }
      k >>= 1;
    }
    return idx;
  }

  /**
   * 説明:
   *   sum(0,i+1) > x となる最小の 0-indexed i を返す。
   *   存在しなければ n を返す。
   *
   * 注意:
   *   各要素が非負である必要がある。
   *
   * 使い方:
   *   fw.upperBound(x)
   *
   * 計算量:
   *   O(log N)
   */
  upperBound(x: number): number {
    if (x < 0) {
      return 0;
    }
    let idx = 0;
    let k = 1;
    while ((k<<1) <= this.n) {
      k <<= 1;
    }
    while (k > 0) {
      let next = idx+k;
      if (next <= this.n && this.data[next] <= x) {
        x -= this.data[next];
        idx = next;
      }
      k >>= 1;
    }
    return idx;
  }

  /**
   * private:
   * [0,right) の和
   */
  private _prefix(right: number): number {
    let res = 0;
    for (let i = right; i > 0; i -= i&-i) {
      res += this.data[i];
    }
    return res;
  }
}



/**
 * 説明:
 *   0-indexed の Fenwick Tree (MOD版)
 *   点加算と半開区間和を扱う。
 *   useModInt後に使用する
 */
class FenwickTreeMod {
  readonly n: number;
  private readonly data: Float64Array;

  /**
   * 説明:
   *   サイズ N または初期配列から構築する。
   *
   * 使い方:
   *   new FenwickTree(N)
   *   new FenwickTree(A)
   *
   * 計算量:
   *   サイズ指定 O(N)
   *   配列指定 O(N)
   */
  constructor(n: number);
  constructor(values: ArrayLike<number>);
  constructor(arg: number | ArrayLike<number>) {
    if (typeof arg == "number") {
      this.n = arg;
      this.data = new Float64Array(this.n+1);
      return;
    }
    this.n = arg.length;
    this.data = new Float64Array(this.n+1);
    for (let i = 0; i < this.n; i++) {
      let idx = i+1;
      this.data[idx] = this.data[idx].add(arg[i]);
      let next = idx+(idx&-idx);
      if (next <= this.n) {
        this.data[next] = this.data[next].add(this.data[idx]);
      }
    }
  }

  /**
   * 説明:
   *   0-indexed の index に value を加算する。
   *
   * 使い方:
   *   fw.add(i,x)
   *
   * 計算量:
   *   O(log N)
   */
  add(index: number, value: number): this {
    if (!(0 <= index && index < this.n)) {
      throw new RangeError(`Not 0 <= index < ${this.n}`);
    }
    for (let i = index+1; i <= this.n; i += i&-i) {
      this.data[i] = this.data[i].add(value);
    }
    return this;
  }

  /**
   * 説明:
   *   [0,right) の和を返す。
   *
   * 使い方:
   *   fw.sum(r)
   *
   * 計算量:
   *   O(log N)
   */
  sum(right: number): number;
  /**
   * 説明:
   *   半開区間 [left,right) の和を返す。
   *
   * 使い方:
   *   fw.sum(l,r)
   *
   * 計算量:
   *   O(log N)
   */
  sum(left: number, right: number): number;
  sum(a: number, b?: number): number {
    if (b === undefined) {
      if (!(0 <= a && a <= this.n)) {
        throw new RangeError(`Not 0 <= right <= ${this.n}`);
      }
      return this._prefix(a);
    }
    if (!(0 <= a && a <= b && b <= this.n)) {
      throw new RangeError(`Not 0 <= left <= right <= ${this.n}`);
    }
    return this._prefix(b).sub(this._prefix(a));
  }

  /**
   * 説明:
   *   index の値を返す。
   *
   * 使い方:
   *   fw.get(i)
   *
   * 計算量:
   *   O(log N)
   */
  get(index: number): number {
    if (!(0 <= index && index < this.n)) {
      throw new RangeError(`Not 0 <= index < ${this.n}`);
    }
    return this._prefix(index+1).sub(this._prefix(index));
  }

  /**
   * 説明:
   *   index の値を value に変更する。
   *
   * 使い方:
   *   fw.set(i,x)
   *
   * 計算量:
   *   O(log N)
   */
  set(index: number, value: number): this {
    if (!(0 <= index && index < this.n)) {
      throw new RangeError(`Not 0 <= index < ${this.n}`);
    }
    return this.add(index,value.sub(this.get(index)));
  }

  /**
   * 説明:
   *   全要素の和を返す。
   *
   * 使い方:
   *   fw.total()
   *
   * 計算量:
   *   O(log N)
   */
  total(): number {
    return this._prefix(this.n);
  }

  /**
   * private:
   * [0,right) の和
   */
  private _prefix(right: number): number {
    let res = 0;
    for (let i = right; i > 0; i -= i&-i) {
      res = res.add(this.data[i]);
    }
    return res;
  }
}

/** 多次元配列のインデックスを1次元用のインデックスに変換 */
// dp[i][j][k][l]なら
// let idxer = new NDArrayIndexer([i,j,k,l])
// dp = Array(idxer.flatIndex([i,j,k,l]))
// dp[idxer.flatIndex([i,j,k,l])]
export class NDArrayIndexer {
  private readonly dims: number[];
  private readonly strides: number[];
  constructor(dims: number[]) {
    this.dims = dims.slice();
    this.strides = this.computeStrides(dims);
  }
  private computeStrides(dims: number[]): number[] {
    const strides = new Array(dims.length);
    let acc = 1;
    for (let i = dims.length - 1; i >= 0; i--) {
      strides[i] = acc;
      acc *= dims[i];
    }
    return strides;
  }
  /** 多次元インデックス⇒1次元インデックス */
  flatIndex(indices: number[]): number {
    let idx = 0;
    for (let i = 0; i < indices.length; i++) {
      idx += indices[i] * this.strides[i];
    }
    return idx;
  }
  /** 1次元インデックス⇒多次元インデックス */
  unflatIndex(index: number): number[] {
    const result = new Array(this.dims.length);
    for (let i = 0; i < this.dims.length; i++) {
      result[i] = intDiv(index,this.strides[i]);
      index %= this.strides[i];
    }
    return result;
  }
}

// https://drken1215.hatenablog.com/entry/2023/09/24/231639
// Find out of Strongly Balanced Binary Tree (N <= 10^18)
// the vertex number is 1-indexed (root = 1)
/**
 * 説明:
 *   頂点番号1..Nを持つ完全二分木について、深さ・距離に関する個数を数える。
 *   Nおよび内部の個数は bigint で保持するため、N <= 10^18 に対応する。
 *
 * 使い方:
 *   let bt = new FindOutBinaryTree(N);
 *   let count = bt.get_num_of_the_distance(v,d);
 *
 * 計算量:
 *   構築 O((log N)^3)、各距離クエリ O(log N)
 */
class FindOutBinaryTree {
  N: bigint = 0n;
  depth_table: bigint[] = [];
  distance_table: bigint[] = [];
  perfect_depth_table: bigint[][] = [];
  perfect_distance_table: bigint[][] = [];

  constructor(n: number | bigint, build_dt: boolean = true) {
    if (build_dt) this.init(n);
    else this.set(n);
  }

  /**
   * 説明: 対象のNだけを変更する。集計テーブルは再構築しない。
   * 使い方: bt.set(n)
   * 計算量: O(1)
   */
  set(n: number | bigint): void {
    if (typeof n == "number") {
      if (!Number.isSafeInteger(n) || n < 0) {
        throw new RangeError("n must be a non-negative safe integer or bigint");
      }
      this.N = BigInt(n);
    } else {
      if (n < 0n) throw new RangeError("n must be non-negative");
      this.N = n;
    }
  }

  /**
   * 説明: 対象のNを変更し、深さ・距離テーブルを再構築する。
   * 使い方: bt.init(n)
   * 計算量: O((log N)^3)
   */
  init(n: number | bigint): void {
    this.set(n);
    let x = this.N;
    let D = 0;
    while (x > 0n) {
      D++;
      x >>= 1n;
    }
    this.findout_perfect_binary_tree(D);
    this.findout_binary_tree();
  }

  /**
   * 説明: 高さ0..Dの完全二分木の深さ・距離テーブルを前計算する。
   * 使い方: bt.findout_perfect_binary_tree(D)
   * 計算量: O(D^3)
   */
  findout_perfect_binary_tree(D: number): void {
    this.perfect_depth_table = Array.from({length: D+1},() => []);
    this.perfect_distance_table = Array.from({length: D+1},() => []);

    let pre = (d: number): bigint[] => {
      if (d == 0) {
        this.perfect_depth_table[0] = [1n];
        return this.perfect_distance_table[0] = [0n,1n];
      }

      let depth = Array<bigint>(d+1).fill(0n);
      let distance = Array<bigint>(d*2+2).fill(0n);
      for (let i = 0; i <= d; i++) {
        depth[i] = 1n<<BigInt(i);
        distance[i+1] += 1n<<BigInt(i);
      }
      for (let i = 1; i <= d; i++) {
        for (let j = 1; j <= d; j++) {
          distance[i+j+1] +=
            (1n<<BigInt(i-1))*(1n<<BigInt(j-1));
        }
      }
      let child = pre(d-1);
      for (let i = 0; i < child.length; i++) {
        distance[i] += child[i]*2n;
      }
      this.perfect_depth_table[d] = depth;
      return this.perfect_distance_table[d] = distance;
    };

    if (D > 0) pre(D-1);
  }

  /**
   * 説明:
   *   頂点vから左端・右端へ下れる最大深さを [leftDepth,rightDepth] で返す。
   * 使い方: let [ld,rd] = bt.get_depth(v)
   * 計算量: O(log N)
   */
  get_depth(v: bigint): [number,number] {
    let leftDepth = 0;
    let rightDepth = 0;
    let left = v;
    let right = v;
    while (left*2n <= this.N) {
      leftDepth++;
      left *= 2n;
    }
    while (right*2n+1n <= this.N) {
      rightDepth++;
      right = right*2n+1n;
    }
    return [leftDepth,rightDepth];
  }

  /**
   * 説明: 現在のNについて、深さごとの頂点数と距離ごとのパス数を構築する。
   * 使い方: bt.findout_binary_tree()
   * 計算量: O((log N)^3)
   */
  findout_binary_tree(): void {
    let rec = (v: bigint): [bigint[],bigint[]] => {
      if (v > this.N) return [[],[]];
      let [ld,rd] = this.get_depth(v);
      if (ld == rd) {
        return [
          this.perfect_depth_table[ld],
          this.perfect_distance_table[ld]
        ];
      }

      let [leftDepth,leftDistance] = rec(v*2n);
      let [rightDepth,rightDistance] = rec(v*2n+1n);
      let depth = Array<bigint>(
        Math.max(leftDepth.length,rightDepth.length)+1
      ).fill(0n);
      let distance = Array<bigint>(
        leftDepth.length+rightDepth.length+2
      ).fill(0n);

      depth[0] = 1n;
      distance[1] = 1n;
      for (let d = 0; d < leftDepth.length; d++) {
        depth[d+1] += leftDepth[d];
        distance[d+2] += leftDepth[d];
      }
      for (let d = 0; d < rightDepth.length; d++) {
        depth[d+1] += rightDepth[d];
        distance[d+2] += rightDepth[d];
      }
      for (let d1 = 0; d1 < leftDepth.length; d1++) {
        for (let d2 = 0; d2 < rightDepth.length; d2++) {
          distance[d1+d2+3] += leftDepth[d1]*rightDepth[d2];
        }
      }
      for (let len = 1; len < leftDistance.length; len++) {
        distance[len] += leftDistance[len];
      }
      for (let len = 1; len < rightDistance.length; len++) {
        distance[len] += rightDistance[len];
      }
      return [depth,distance];
    };

    [this.depth_table,this.distance_table] = rec(1n);
  }

  /**
   * 説明: 頂点vの部分木で下にd辺進んだ位置の頂点数を返す。
   * 使い方: let count = bt.get_num_of_the_depth(v,d)
   * 計算量: O(log N)
   */
  get_num_of_the_depth(v: bigint, d: bigint): bigint {
    if (v <= 0n || v > this.N || d < 0n) return 0n;
    let [leftDepth,rightDepth] = this.get_depth(v);
    if (d > BigInt(leftDepth)) return 0n;
    if (d <= BigInt(rightDepth)) return 1n<<d;
    return this.N-(v<<d)+1n;
  }

  /**
   * 説明: 頂点vから距離dにある頂点数を返す。
   * 使い方: let count = bt.get_num_of_the_distance(v,d)
   * 計算量: O(log N)
   */
  get_num_of_the_distance(v: bigint, d: bigint): bigint {
    if (v <= 0n || v > this.N || d < 0n) return 0n;
    let res = this.get_num_of_the_depth(v,d);
    for (let i = 1n; i <= d && v != 1n; i++) {
      if (i == d) {
        res++;
        break;
      }
      let parent = v/2n;
      if (v == parent*2n+1n) {
        res += this.get_num_of_the_depth(parent*2n,d-i-1n);
      } else {
        res += this.get_num_of_the_depth(parent*2n+1n,d-i-1n);
      }
      v = parent;
    }
    return res;
  }
}

// 最大フロー
export interface MFEdge {
  from: number;
  to: number;
  cap: number;
  flow: number;
}
interface InternalEdge {
  to: number;
  rev: number;
  cap: number;
}

/**
 * 説明: Dinic 法による最大流ライブラリ。ACL 準拠
 * 使い方: let mf = new MfGraph(N); mf.addEdge(s,t,c); mf.flow(S,T)
 * 計算量: O(V^2E) 程度、実用上高速
 */
export class MfGraph {
  private _n: number;
  private pos: { from: number; edgeIdx: number }[];
  private g: InternalEdge[][];
  /**
   * 説明: N 頂点の最大流グラフを作る
   * 使い方: new MfGraph(N)
   * 計算量: O(N)
   */
  constructor(n: number) {
    this._n = n;
    this.pos = [];
    this.g = Array.from({ length: n }, () => []);
  }
  /**
   * 頂点 from から to へ、最大容量 cap の辺を追加する
   * @returns 追加された辺のインデックス（0-indexed）
   * 使い方: mf.addEdge(from,to,cap)
   * 計算量: O(1)
   */
  addEdge(from: number, to: number, cap: number): number {
    if (from < 0 || from >= this._n || to < 0 || to >= this._n) {
      throw new RangeError("Vertex index out of bounds");
    }
    if (cap < 0) {
      throw new Error("Capacity cannot be negative");
    }
    const m = this.pos.length;
    this.pos.push({ from, edgeIdx: this.g[from].length });
    const fromId = this.g[from].length;
    let toId = this.g[to].length;
    if (from === to) toId++; // 自己ループの場合のインデックス調整
    this.g[from].push({ to, rev: toId, cap });
    this.g[to].push({ to: from, rev: fromId, cap: 0 });
    return m;
  }
  /**
   * 説明: 追加した辺IDの現在の容量・流量を返す
   * 使い方: mf.getEdge(i)
   * 計算量: O(1)
   */
  getEdge(i: number): MFEdge {
    const m = this.pos.length;
    if (i < 0 || i >= m) {
      throw new RangeError("Edge index out of bounds");
    }
    const _e = this.pos[i];
    const _re = this.g[_e.from][_e.edgeIdx];
    const _rev = this.g[_re.to][_re.rev];
    return {
      from: _e.from,
      to: _re.to,
      cap: _re.cap + _rev.cap,
      flow: _rev.cap,
    };
  }
  /**
   * 説明: 追加済み全辺の状態を返す
   * 使い方: mf.edges()
   * 計算量: O(E)
   */
  edges(): MFEdge[] {
    const m = this.pos.length;
    const res: MFEdge[] = [];
    for (let i = 0; i < m; i++) {
      res.push(this.getEdge(i));
    }
    return res;
  }
  /**
   * 説明: 辺IDの容量と流量を直接変更する
   * 使い方: mf.changeEdge(i,newCap,newFlow)
   * 計算量: O(1)
   */
  changeEdge(i: number, newCap: number, newFlow: number): void {
    const m = this.pos.length;
    if (i < 0 || i >= m) {
      throw new RangeError("Edge index out of bounds");
    }
    if (newFlow < 0 || newFlow > newCap) {
      throw new Error("Invalid flow or capacity");
    }

    const _e = this.pos[i];
    const _re = this.g[_e.from][_e.edgeIdx];
    const _rev = this.g[_re.to][_re.rev];

    _re.cap = newCap - newFlow;
    _rev.cap = newFlow;
  }
  /**
   * 説明: s から t へ最大流を流して流量を返す
   * 使い方: mf.flow(s,t)
   * 計算量: O(V^2E) 程度
   */
  flow(s: number, t: number, flowLimit: number = Infinity): number {
    if (s < 0 || s >= this._n || t < 0 || t >= this._n) {
      throw new RangeError("Vertex index out of bounds");
    }
    if (s === t) return 0;
    let flow = 0;
    const level = new Int32Array(this._n);
    const iter = new Int32Array(this._n);
    const que = new Int32Array(this._n);
    const bfs = (): void => {
      level.fill(-1);
      level[s] = 0;
      let head = 0, tail = 0;
      que[tail++] = s;
      while (head < tail) {
        const v = que[head++];
        for (const e of this.g[v]) {
          if (e.cap === 0 || level[e.to] >= 0) continue;
          level[e.to] = level[v] + 1;
          if (e.to === t) return; // tに到達したら打ち切り
          que[tail++] = e.to;
        }
      }
    };
    const dfs = (v: number, up: number): number => {
      if (v === s) return up;
      let res = 0;
      const level_v = level[v];
      for (let i = iter[v]; i < this.g[v].length; i++) {
        iter[v] = i;
        const e = this.g[v][i];
        const revEdge = this.g[e.to][e.rev];
        if (level_v <= level[e.to] || revEdge.cap === 0) continue;
        const d = dfs(e.to, Math.min(up - res, revEdge.cap));
        if (d <= 0) continue;
        this.g[v][i].cap += d;
        revEdge.cap -= d;
        res += d;
        if (res === up) return res;
      }
      level[v] = this._n; // 到達不可能になった頂点を枝刈り
      return res;
    };

    while (flow < flowLimit) {
      bfs();
      if (level[t] === -1) break; // tに到達できなければ終了
      iter.fill(0);
      let f = 0;
      // sからtへではなく、tからsへDFSする（ACL準拠の最適化）
      while ((f = dfs(t, flowLimit - flow)) > 0) {
        flow += f;
      }
    }
    return flow;
  }

  /**
   * 説明: 残余グラフで s から到達可能な頂点集合を返す（最小カットの復元に利用）
   * 使い方: mf.minCut(s)
   * 計算量: O(V+E)
   */
  minCut(s: number): boolean[] {
    const visited = new Array(this._n).fill(false);
    const que = new Int32Array(this._n);
    let head = 0, tail = 0;

    que[tail++] = s;
    visited[s] = true;

    while (head < tail) {
      const p = que[head++];
      for (const e of this.g[p]) {
        if (e.cap > 0 && !visited[e.to]) {
          visited[e.to] = true;
          que[tail++] = e.to;
        }
      }
    }
    return visited;
  }
}

type MinCostEdge = {
  to: number;
  rev: number;
  cap: number;
  cost: number;
};

/**
 * 説明: ポテンシャル付き Dijkstra による最小費用流。容量は number、費用総和は bigint で返す
 * 使い方: let mcf = new MinCostFlow(N); mcf.addEdge(u,v,cap,cost); mcf.flow(s,t,F)
 * 計算量: O(F * E log V)  ※流す回数に依存
 */
class MinCostFlow {
  G: MinCostEdge[][];

  /**
   * 説明: N 頂点の最小費用流グラフを作る
   * 使い方: new MinCostFlow(N)
   * 計算量: O(N)
   */
  constructor(private n: number) {
    this.G = Array.from({length: n},() => []);
  }

  /**
   * 説明: 容量 cap、費用 cost の有向辺を追加する
   * 使い方: mcf.addEdge(u,v,cap,cost)
   * 計算量: O(1)
   */
  addEdge(from: number, to: number, cap: number, cost: number): void {
    let f: MinCostEdge = {
      to,
      rev: this.G[to].length,
      cap,
      cost,
    };
    let r: MinCostEdge = {
      to: from,
      rev: this.G[from].length,
      cap: 0,
      cost: -cost,
    };
    this.G[from].push(f);
    this.G[to].push(r);
  }

  /**
   * 説明: s から t へ f 流す最小費用を bigint で返す。不可能なら -1n
   * 使い方: mcf.flow(s,t,f)
   * 計算量: O(反復回数 * E log V)
   */
  flow(s: number, t: number, f: number): bigint {
    let INF = Number.POSITIVE_INFINITY;
    let h = Array(this.n).fill(0);
    let dist = Array(this.n).fill(INF);
    let prevv = Array(this.n).fill(0);
    let preve = Array(this.n).fill(0);
    let res = 0n;
    while (f > 0) {
      dist.fill(INF);
      dist[s] = 0;
      let pq = new PriorityQueue<number[]>((a,b) => a[1]-b[1]);
      pq.push([s,0]);
      while (pq.size()) {
        let [v,d] = pq.pop();
        if (dist[v] < d) continue;
        for (let i = 0; i < this.G[v].length; i++) {
          let e = this.G[v][i];
          if (e.cap <= 0) continue;
          let nd = dist[v] + e.cost + h[v] - h[e.to];
          if (nd < dist[e.to]) {
            dist[e.to] = nd;
            prevv[e.to] = v;
            preve[e.to] = i;
            pq.push([e.to,nd]);
          }
        }
      }
      if (dist[t] == INF) {
        return -1n;
      }
      for (let v = 0; v < this.n; v++) {
        if (dist[v] < INF) {
          h[v] += dist[v];
        }
      }
      let d = f;
      for (let v = t; v != s; v = prevv[v]) {
        d = Math.min(d,this.G[prevv[v]][preve[v]].cap);
      }
      f -= d;
      res += BigInt(d) * BigInt(h[t]);
      for (let v = t; v != s; v = prevv[v]) {
        let e = this.G[prevv[v]][preve[v]];
        e.cap -= d;
        this.G[v][e.rev].cap += d;
      }
    }
    return res;
  }
}

/**
 * 説明: 文字列/数列の suffix array を構築する
 * アルゴリズム: SA-IS (O(N))
 * 使い方: let sa = suffix_array(S)
 * @returns {Int32Array} - 辞書順にソートされた接尾辞の開始インデックス配列
 * 計算量: O(N log N)
 */
function suffix_array(s: any) {
  let n = s.length;
  if (n === 0) return new Int32Array(0);
  if (n === 1) return new Int32Array([0]);

  // 文字列の場合は文字コード配列に変換
  let s_arr;
  if (typeof s === "string") {
    s_arr = new Int32Array(n);
    for (let i = 0; i < n; i++) s_arr[i] = s.charCodeAt(i);
  } else {
    s_arr = new Int32Array(s);
  }

  // SA-IS 用の座標圧縮 (値の範囲を 0 ~ upper に収める)
  let vals = new Int32Array(s_arr);
  vals.sort();
  let upper = 0;
  let map = new Map();
  map.set(vals[0], 0);
  for (let i = 1; i < n; i++) {
    if (vals[i] !== vals[i - 1]) upper++;
    map.set(vals[i], upper);
  }
  for (let i = 0; i < n; i++) {
    s_arr[i] = map.get(s_arr[i]);
  }

  // SA-IS 本体関数
  function sa_is(s: any, upper: any) {
    let n = s.length;
    let ls = new Uint8Array(n);
    for (let i = n - 2; i >= 0; i--) {
      ls[i] = s[i] === s[i + 1] ? ls[i + 1] : s[i] < s[i + 1] ? 1 : 0;
    }

    let sum_l = new Int32Array(upper + 1);
    let sum_s = new Int32Array(upper + 1);
    for (let i = 0; i < n; i++) {
      if (!ls[i]) sum_s[s[i]]++;
      else sum_l[s[i] + 1]++;
    }
    for (let i = 0; i <= upper; i++) {
      sum_s[i] += sum_l[i];
      if (i < upper) sum_l[i + 1] += sum_s[i];
    }

    let ind = (lms: any) => {
      let sa = new Int32Array(n).fill(-1);
      let buf = new Int32Array(upper + 1);
      buf.set(sum_s);
      for (let i = 0; i < lms.length; i++) {
        let d = lms[i];
        if (d === n) continue;
        sa[buf[s[d]]++] = d;
      }
      buf.set(sum_l);
      sa[buf[s[n - 1]]++] = n - 1;
      for (let i = 0; i < n; i++) {
        let v = sa[i];
        if (v >= 1 && !ls[v - 1]) sa[buf[s[v - 1]]++] = v - 1;
      }
      buf.set(sum_l);
      for (let i = n - 1; i >= 0; i--) {
        let v = sa[i];
        if (v >= 1 && ls[v - 1]) sa[--buf[s[v - 1] + 1]] = v - 1;
      }
      return sa;
    };

    let lms_map = new Int32Array(n + 1).fill(-1);
    let m = 0;
    for (let i = 1; i < n; i++) {
      if (!ls[i - 1] && ls[i]) lms_map[i] = m++;
    }
    let lms = new Int32Array(m);
    let p = 0;
    for (let i = 1; i < n; i++) {
      if (!ls[i - 1] && ls[i]) lms[p++] = i;
    }

    let sa = ind(lms);

    if (m > 0) {
      let sorted_lms = new Int32Array(m);
      p = 0;
      for (let i = 0; i < n; i++) {
        let v = sa[i];
        if (lms_map[v] !== -1) sorted_lms[p++] = v;
      }
      let rec_s = new Int32Array(m);
      let rec_upper = 0;
      rec_s[lms_map[sorted_lms[0]]] = 0;
      for (let i = 1; i < m; i++) {
        let l = sorted_lms[i - 1], r = sorted_lms[i];
        let end_l = lms_map[l] + 1 < m ? lms[lms_map[l] + 1] : n;
        let end_r = lms_map[r] + 1 < m ? lms[lms_map[r] + 1] : n;
        let same = true;
        if (end_l - l !== end_r - r) {
          same = false;
        } else {
          while (l < end_l) {
            if (s[l] !== s[r]) break;
            l++;
            r++;
          }
          if (l === n || s[l] !== s[r]) same = false;
        }
        if (!same) rec_upper++;
        rec_s[lms_map[sorted_lms[i]]] = rec_upper;
      }
      let rec_sa = sa_is(rec_s, rec_upper);
      for (let i = 0; i < m; i++) {
        sorted_lms[i] = lms[rec_sa[i]];
      }
      sa = ind(sorted_lms);
    }
    return sa;
  }

  return sa_is(s_arr, upper);
}

/**
 * 構築済みの Suffix Array を用いて LCP Array (最長共通接頭辞配列) を構築する
 * アルゴリズム: Kasai's algorithm (O(N))
 * 使い方: let lcp = lcp_array(S,sa)
 * @param {string | number[]} s - 元の文字列または配列
 * @param {Int32Array | number[]} sa - 構築済みの Suffix Array
 * @returns {Int32Array} - 長さ N-1 の LCP Array (lcp[i] は sa[i] と sa[i+1] の最長共通接頭辞長)
 * 計算量: O(N)
 */
function lcp_array(s: any, sa: any) {
  let n = s.length;
  if (n <= 1) return new Int32Array(0);

  let s_arr;
  if (typeof s === "string") {
    s_arr = new Int32Array(n);
    for (let i = 0; i < n; i++) s_arr[i] = s.charCodeAt(i);
  } else {
    s_arr = new Int32Array(s);
  }

  let rank = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    rank[sa[i]] = i;
  }

  let lcp = new Int32Array(n - 1);
  let h = 0;
  for (let i = 0; i < n; i++) {
    if (rank[i] === 0) continue;
    let j = sa[rank[i] - 1];
    while (i + h < n && j + h < n && s_arr[i + h] === s_arr[j + h]) {
      h++;
    }
    lcp[rank[i] - 1] = h;
    if (h > 0) h--;
  }
  return lcp;
}

/**
 * Z Algorithm
 * z[i] = s と s[i..] の最長共通接頭辞の長さ
 * O(N)
 *
 * 使い方:
 * zAlgorithm("ababa")
 * // [5,0,3,0,1]
 * 
 * 用例: ABC257-G
 */
function zAlgorithm(s: string): number[] {
  const n = s.length;
  if (n == 0) return [];

  const z = Array(n).fill(0);
  z[0] = n;

  let l = 0,r = 0;

  for (let i = 1; i < n; i++) {
    if (i < r) z[i] = Math.min(r-i,z[i-l]);

    while (i+z[i] < n && s[z[i]] == s[i+z[i]]) z[i]++;

    if (i+z[i] > r) {
      l = i;
      r = i+z[i];
    }
  }

  return z;
}

/**
 * 説明: 文字列/配列のローリングハッシュ。部分文字列比較や LCP に使う
 * 使い方: let rh = new RollingHash(S); rh.get(l,r)
 * 計算量: 構築 O(N)、get O(1)、lcp O(log N)
 */
class RollingHash {
  static readonly MOD: bigint = (1n << 61n) - 1n;
  static base: bigint = 0n;
  
  // 複数インスタンスで使い回すための累乗配列
  static power: BigUint64Array = new BigUint64Array(1).fill(1n);

  private hash: BigUint64Array;

  /**
   * ハッシュの衝突（Hack）を防ぐため、実行ごとにランダムな基数を生成します。
   */
  private static generateBase(): void {
    if (this.base === 0n) {
      const rand1 = BigInt(Math.floor(Math.random() * (2 ** 30)));
      const rand2 = BigInt(Math.floor(Math.random() * (2 ** 31)));
      this.base = (rand1 << 31n) | rand2;
      if (this.base < 2n) this.base = 2n;
      if (this.base >= this.MOD - 1n) this.base = this.MOD - 2n;
    }
  }

  /**
   * 必要な長さまで累乗配列をO(N)で動的に拡張します。
   */
  private static expandPower(size: number): void {
    if (this.power.length > size) return;
    let newLen = this.power.length;
    while (newLen <= size) newLen *= 2;
    
    const newPower = new BigUint64Array(newLen);
    newPower.set(this.power);
    
    for (let i = this.power.length; i < newLen; i++) {
      // (a * b) % (2^61 - 1) をビット演算で高速化
      const t = newPower[i - 1] * this.base;
      let res = (t >> 61n) + (t & this.MOD);
      if (res >= this.MOD) res -= this.MOD;
      newPower[i] = res;
    }
    this.power = newPower;
  }

  /**
   * 説明: 文字列/数列の prefix hash と power を作ります。
   * 使い方: new RollingHash(S)
   * 計算量: O(N)
   */
  constructor(s: string | ArrayLike<number>) {
    RollingHash.generateBase();
    const n = s.length;
    RollingHash.expandPower(n);

    this.hash = new BigUint64Array(n + 1);
    for (let i = 0; i < n; i++) {
      const c = typeof s === "string" ? BigInt(s.charCodeAt(i)) : BigInt(s[i]);
      const t = this.hash[i] * RollingHash.base + c;
      
      // (a * b + c) % (2^61 - 1) をビット演算で高速化
      let res = (t >> 61n) + (t & RollingHash.MOD);
      if (res >= RollingHash.MOD) res -= RollingHash.MOD;
      this.hash[i + 1] = res;
    }
  }

  /**
   * 説明: 半開区間 [l,r) のハッシュを返す。
   * 使い方: rh.get(l,r)
   * 計算量: O(1)
   */
  get(l: number, r: number): bigint {
    if (l < 0 || r > this.hash.length - 1 || l > r) {
      throw new RangeError("Index out of bounds");
    }
    const t = this.hash[l] * RollingHash.power[r - l];
    let sub = (t >> 61n) + (t & RollingHash.MOD);
    if (sub >= RollingHash.MOD) sub -= RollingHash.MOD;

    let res = this.hash[r] - sub;
    if (res < 0n) res += RollingHash.MOD;
    return res;
  }

  /**
   * ハッシュ値 h1 (長さ h1_len) と ハッシュ値 h2 (長さ h2_len) を結合したハッシュ値を返します。
   * 計算量: O(1)
   */
  static combine(h1: bigint, h2: bigint, h2_len: number): bigint {
    this.expandPower(h2_len);
    const t = h1 * this.power[h2_len];
    let res = (t >> 61n) + (t & this.MOD) + h2;
    // 2つの余りの和なので最大 2 * MOD になる可能性があるため while
    while (res >= this.MOD) res -= this.MOD;
    return res;
  }

  /**
   * このインスタンスの区間 [l1, r1) と、別のインスタンス other の区間 [l2, r2) の
   * 最長共通接頭辞 (LCP: Longest Common Prefix) の長さを二分探索で求める
   * 使い方: rh.lcp(rh2,l1,r1,l2,r2)
   * 計算量: O(log N)
   */
  lcp(other: RollingHash, l1: number, r1: number, l2: number, r2: number): number {
    let ok = 0;
    let ng = Math.min(r1 - l1, r2 - l2) + 1;
    while (ng - ok > 1) {
      const mid = (ok + ng) >> 1;
      if (this.get(l1, l1 + mid) === other.get(l2, l2 + mid)) {
        ok = mid;
      } else {
        ng = mid;
      }
    }
    return ok;
  }
}

/**
 * 説明: 静的配列の区間クエリを並び替えて高速化する Mo's algorithm
 * 使い方: mo.addQuery(l,r); mo.build(addL,addR,eraseL,eraseR,out)
 * 計算量: O((N+Q)√Q * 1操作) 目安
 */
class Mo {
  private lefts: number[] = [];
  private rights: number[] = [];
  private N: number;

  /**
   * 説明: 対象配列長を指定して Mo を初期化します。
   * 使い方: new Mo(N)
   * 計算量: O(1)
   */
  constructor(N: number) {
    this.N = Math.max(N, 1);
  }

  /**
   * 説明: 半開区間 [l,r) のクエリを追加します。
   * 使い方: mo.addQuery(l,r)
   * 計算量: O(1)
   */
  addQuery(l: number, r: number): void {
    this.lefts.push(l);
    this.rights.push(r);
  }

  /**
   * 登録されたクエリを最適な順序で並び替え、処理を実行します。
   * 
   * @param add_left    区間の左端を拡張する処理 ( l を l-1 にする )
   * @param add_right   区間の右端を拡張する処理 ( r を r+1 にする )
   * @param erase_left  区間の左端を縮小する処理 ( l を l+1 にする )
   * @param erase_right 区間の右端を縮小する処理 ( r を r-1 にする )
   * @param out         クエリの答えを記録する処理 (元のクエリIDを受け取る)
   */
  build(
    add_left: (idx: number) => void,
    add_right: (idx: number) => void,
    erase_left: (idx: number) => void,
    erase_right: (idx: number) => void,
    out: (query_id: number) => void
  ): void {
    const Q = this.lefts.length;
    if (Q === 0) return;

    // ブロックサイズ B = N / √Q
    const B = Math.max(1, Math.floor(this.N / Math.sqrt(Q)));
    
    // クエリの元のインデックスを保持する配列
    const order = new Int32Array(Q);
    for (let i = 0; i < Q; i++) order[i] = i;

    // Moのアルゴリズムの中核：クエリのソート
    order.sort((a, b) => {
      const block_a = Math.floor(this.lefts[a] / B);
      const block_b = Math.floor(this.lefts[b] / B);
      
      // 1. 左端が属するブロックが違うなら、ブロック順にソート
      if (block_a !== block_b) return block_a - block_b;
      
      // 2. 左端が同じブロックなら、右端でソート
      // 【最適化】ブロックが偶数番目なら昇順、奇数番目なら降順にすることで、
      // 次のブロックへ移る際の右端(R)の無駄な戻りをなくす
      return block_a % 2 === 0
        ? this.rights[a] - this.rights[b]
        : this.rights[b] - this.rights[a];
    });

    // 状態を管理する現在の区間 [l, r)
    let l = 0;
    let r = 0;

    // ソートされた順序に従ってクエリを処理
    for (let i = 0; i < Q; i++) {
      const idx = order[i];
      const target_l = this.lefts[idx];
      const target_r = this.rights[idx];

      // ※ 順番に注意！
      // 「拡張」を先に行い、「縮小」を後にすることで、区間が反転する(l > rになる)バグを防ぐ
      while (l > target_l) add_left(--l);
      while (r < target_r) add_right(r++);
      while (l < target_l) erase_left(l++);
      while (r > target_r) erase_right(--r);

      // クエリの結果を記録
      out(idx);
    }
  }
}

/**
 * 説明: N次元配列の累積和。各次元の半開区間の直積の和を高速に求める
 * 使い方:
 *   let ps = new NDPrefixSum([H,W]);
 *   ps.increase([i,j],x);
 *   ps.build();
 *   ps.query([l1,l2],[r1,r2]);
 * 計算量:
 *   build O(D * Π(size_i+1))
 *   query O(D + 2^D)
 */
class NDPrefixSum {
  private readonly n: number;
  private readonly dims: number[];
  private readonly pdims: number[];
  private readonly strides: number[];
  private readonly total: number;

  private readonly data: Float64Array;

  private readonly prevMask: Int32Array;
  private readonly bitPos: Int8Array;
  private readonly sign: Int8Array;
  private readonly idxs: Float64Array;

  private built = false;

  /**
   * 説明: 各次元のサイズを指定してN次元累積和を作る
   * 使い方: new NDPrefixSum([H,W,D])
   * 計算量: O(D)
   */
  constructor(dims: number[]) {
    if (dims.length == 0) {
      throw new Error("dims must not be empty");
    }

    if (dims.length >= 31) {
      throw new Error("dimension must be less than 31");
    }

    this.n = dims.length;
    this.dims = dims.slice();

    // 累積和用の0番目の余白を1つ持つ
    this.pdims = dims.map(x => x+1);

    this.strides = Array(this.n).fill(0);

    let total = 1;

    for (let i = this.n-1; i >= 0; i--) {
      this.strides[i] = total;
      total *= this.pdims[i];
    }

    this.total = total;
    this.data = new Float64Array(total);

    // query の包除用前計算
    let C = 1<<this.n;

    this.prevMask = new Int32Array(C);
    this.bitPos = new Int8Array(C);
    this.sign = new Int8Array(C);
    this.idxs = new Float64Array(C);

    this.sign[0] = 1;

    for (let mask = 1; mask < C; mask++) {
      let bit = mask & -mask;

      this.prevMask[mask] = mask^bit;
      this.bitPos[mask] = 31-Math.clz32(bit);
      this.sign[mask] = -this.sign[this.prevMask[mask]];
    }
  }

  /**
   * 説明: 元配列の座標 pos を内部配列のindexへ変換する
   * 計算量: O(D)
   */
  private pointIndex(pos: number[]): number {
    let idx = 0;

    for (let i = 0; i < this.n; i++) {
      idx += (pos[i]+1)*this.strides[i];
    }

    return idx;
  }

  /**
   * 説明: 座標 pos に value を加算する。build前のみ使用
   * 使い方: ps.increase([i,j,k],x)
   * 計算量: O(D)
   */
  increase(pos: number[], value: number): this {
    if (this.built) {
      throw new Error("increase must be called before build");
    }

    this.data[this.pointIndex(pos)] += value;

    return this;
  }

  /**
   * 説明: 座標 pos の値を value にする。build前のみ使用
   * 使い方: ps.set([i,j,k],x)
   * 計算量: O(D)
   */
  set(pos: number[], value: number): this {
    if (this.built) {
      throw new Error("set must be called before build");
    }

    this.data[this.pointIndex(pos)] = value;

    return this;
  }

  /**
   * 説明: N次元累積和を構築する
   * 使い方: ps.build()
   * 計算量: O(D * Π(size_i+1))
   */
  build(): this {
    if (this.built) return this;

    // 各軸方向に1回ずつ累積和
    for (let axis = 0; axis < this.n; axis++) {
      let stride = this.strides[axis];
      let width = this.pdims[axis];
      let block = stride*width;

      for (let base = 0; base < this.total; base += block) {
        for (let off = 0; off < stride; off++) {
          let idx = base+stride+off;

          for (let x = 1; x < width; x++, idx += stride) {
            this.data[idx] += this.data[idx-stride];
          }
        }
      }
    }

    this.built = true;

    return this;
  }

  /**
   * 説明:
   *   各次元について [0,right_i) の直積領域の和を返す
   * 使い方:
   *   ps.prefix([r1,r2,...])
   * 計算量: O(D)
   */
  prefix(right: number[]): number {
    if (!this.built) {
      throw new Error("build must be called before prefix");
    }

    let idx = 0;

    for (let i = 0; i < this.n; i++) {
      idx += right[i]*this.strides[i];
    }

    return this.data[idx];
  }

  /**
   * 説明:
   *   各次元について半開区間
   *   [left_i,right_i)
   *   の直積領域の和を返す
   *
   * 使い方:
   *   ps.query(
   *     [l1,l2,...],
   *     [r1,r2,...]
   *   )
   *
   * 計算量: O(D + 2^D)
   */
  query(left: number[], right: number[]): number {
    if (!this.built) {
      throw new Error("build must be called before query");
    }

    // 全て right を使う頂点
    let idx = 0;

    for (let i = 0; i < this.n; i++) {
      idx += right[i]*this.strides[i];
    }

    this.idxs[0] = idx;

    let res = this.data[idx];

    // mask の立っている次元だけ
    // right -> left に変更する
    for (let mask = 1; mask < this.idxs.length; mask++) {
      let prev = this.prevMask[mask];
      let b = this.bitPos[mask];

      let nidx =
        this.idxs[prev]
        +(left[b]-right[b])*this.strides[b];

      this.idxs[mask] = nidx;

      res += this.sign[mask]*this.data[nidx];
    }

    return res;
  }
}

/**
 * 説明:
 *   配列 A を無限に繰り返した周期列について、
 *   先頭和・半開区間和を O(1) で求める。
 *
 * 使い方:
 *   let ps = new PeriodicPrefixSum(A);
 *   ps.prefix(r);
 *   ps.query(l,r);
 *
 * 計算量:
 *   構築 O(N)
 *   prefix/query O(1)
 */
class PeriodicPrefixSum {
  private n: number;
  private sum: number[];

  constructor(A: ArrayLike<number>) {
    this.n = A.length;
    this.sum = Array(this.n+1).fill(0);

    for (let i = 0; i < this.n; i++) {
      this.sum[i+1] = this.sum[i]+A[i];
    }
  }

  /**
   * 周期列の先頭 r 要素の和
   */
  prefix(r: number): number {
    return (
      intDiv(r,this.n)*this.sum[this.n]
      +this.sum[r%this.n]
    );
  }

  /**
   * 周期列の半開区間 [l,r) の和
   */
  query(l: number, r: number): number {
    return this.prefix(r)-this.prefix(l);
  }
}

type DigitDPNext = (
  state: number,
  digit: number,
  pos: number
) => number;

type DigitDPRunOptions<T> = {
  // 状態数
  stateCount: number;

  // 初期状態
  initState: number;

  // 未到達値
  zero: () => T;

  // 初期値
  initial: () => T;

  // 同じ状態への遷移をまとめる
  merge: (a: T, b: T) => T;

  // 次状態
  // 遷移不可なら -1
  next: DigitDPNext;

  // 1桁追加したときの値変換
  move?: (
    value: T,
    state: number,
    digit: number,
    pos: number
  ) => T;

  // 未到達状態をスキップしたい場合
  isZero?: (value: T) => boolean;
};

/**
 * 説明:
 *   上限以下の整数に対する桁DP。
 *   smaller の管理を内部で行う。
 *
 *   dp[0] = 上限と一致
 *   dp[1] = すでに上限未満
 *
 * 使い方:
 *   let ddp = new DigitDP(N);
 *
 *   ddp.count(...)
 *   ddp.countBigInt(...)
 *   ddp.run<T>(...)
 *
 * 注意:
 *   next は次状態を返す。
 *   遷移不可なら -1 を返す。
 *
 *   先頭0、started、余りなどは
 *   必要に応じて state に含める。
 */
class DigitDP {
  readonly digits: number[];
  readonly base: number;

  /**
   * 説明:
   *   上限の桁列から構築する。
   *
   * 使い方:
   *   new DigitDP("12345")
   *   new DigitDP([1,0,1],2)
   */
  constructor(
    value: string | ArrayLike<number>,
    base = 10
  ) {
    this.base = base;

    if (typeof value == "string") {
      this.digits = Array.from(
        value,
        x => Number(x)
      );
    } else {
      this.digits = Array.from(value);
    }
  }

  /**
   * 説明:
   *   number で数え上げDPを行う。
   *
   *   mod > 0 なら mod を取る。
   *   mod == 0 なら通常加算。
   *
   * 返り値:
   *   dp[0][state] = 上限と一致
   *   dp[1][state] = 上限未満
   *
   * 使い方:
   *   let dp = ddp.count(
   *     D,
   *     0,
   *     (state,digit,pos) => ...
   *   );
   *
   * 計算量:
   *   O(桁数 × 状態数 × base)
   * 
   * 用例: ABC336-E
   */
  count(
    stateCount: number,
    initState: number,
    next: DigitDPNext,
    mod = 0
  ): number[][] {
    let dp = [
      new Float64Array(stateCount),
      new Float64Array(stateCount)
    ];
    dp[0][initState] = 1;
    for (let pos = 0; pos < this.digits.length; pos++) {
      let ndp = [
        new Float64Array(stateCount),
        new Float64Array(stateCount)
      ];
      let limit = this.digits[pos];
      for (let less = 0; less < 2; less++) {
        let maxDigit =
          less == 1
            ? this.base-1
            : limit;
        for (let state = 0; state < stateCount; state++) {
          let cur = dp[less][state];
          if (cur == 0) continue;
          for (let digit = 0; digit <= maxDigit; digit++) {
            let ns = next(state,digit,pos);
            if (ns < 0) continue;
            let nl =
              less == 1 || digit < limit
                ? 1
                : 0;
            if (mod == 0) {
              ndp[nl][ns] += cur;
            } else {
              let v = ndp[nl][ns]+cur;
              if (v >= mod) {
                v -= mod;
              }
              ndp[nl][ns] = v;
            }
          }
        }
      }
      dp = ndp;
    }
    return [
      Array.from(dp[0]),
      Array.from(dp[1])
    ];
  }

  /**
   * 説明:
   *   bigint で正確に数え上げDPを行う。
   *
   * 返り値:
   *   dp[0][state] = 上限と一致
   *   dp[1][state] = 上限未満
   *
   * 計算量:
   *   O(桁数 × 状態数 × base)
   */
  countBigInt(
    stateCount: number,
    initState: number,
    next: DigitDPNext
  ): bigint[][] {
    let dp = [
      Array<bigint>(stateCount).fill(0n),
      Array<bigint>(stateCount).fill(0n)
    ];
    dp[0][initState] = 1n;
    for (let pos = 0; pos < this.digits.length; pos++) {
      let ndp = [
        Array<bigint>(stateCount).fill(0n),
        Array<bigint>(stateCount).fill(0n)
      ];
      let limit = this.digits[pos];
      for (let less = 0; less < 2; less++) {
        let maxDigit =
          less == 1
            ? this.base-1
            : limit;
        for (let state = 0; state < stateCount; state++) {
          let cur = dp[less][state];
          if (cur == 0n) continue;
          for (let digit = 0; digit <= maxDigit; digit++) {
            let ns = next(state,digit,pos);
            if (ns < 0) continue;
            let nl =
              less == 1 || digit < limit
                ? 1
                : 0;
            ndp[nl][ns] += cur;
          }
        }
      }
      dp = ndp;
    }
    return dp;
  }

  /**
   * 説明:
   *   任意型 T を値として持つ汎用桁DP。
   *
   *   数え上げだけでなく、
   *   最大化、最小化、集計値DPなどに使える。
   *
   * 返り値:
   *   dp[0][state] = 上限と一致
   *   dp[1][state] = 上限未満
   *
   * 計算量:
   *   O(桁数 × 状態数 × base)
   */
  run<T>(
    opt: DigitDPRunOptions<T>
  ): T[][] {
    let dp = [
      Array.from(
        {length: opt.stateCount},
        opt.zero
      ),
      Array.from(
        {length: opt.stateCount},
        opt.zero
      )
    ];
    dp[0][opt.initState] = opt.initial();
    for (let pos = 0; pos < this.digits.length; pos++) {
      let ndp = [
        Array.from(
          {length: opt.stateCount},
          opt.zero
        ),
        Array.from(
          {length: opt.stateCount},
          opt.zero
        )
      ];
      let limit = this.digits[pos];
      for (let less = 0; less < 2; less++) {
        let maxDigit =
          less == 1
            ? this.base-1
            : limit;
        for (
          let state = 0;
          state < opt.stateCount;
          state++
        ) {
          let cur = dp[less][state];
          if (
            opt.isZero
            && opt.isZero(cur)
          ) {
            continue;
          }
          for (
            let digit = 0;
            digit <= maxDigit;
            digit++
          ) {
            let ns = opt.next(
              state,
              digit,
              pos
            );
            if (ns < 0) continue;
            let nl =
              less == 1 || digit < limit
                ? 1
                : 0;
            let value = opt.move
              ? opt.move(
                  cur,
                  state,
                  digit,
                  pos
                )
              : cur;
            ndp[nl][ns] = opt.merge(
              ndp[nl][ns],
              value
            );
          }
        }
      }
      dp = ndp;
    }
    return dp;
  }
}

/**
 * 説明:
 *   静的配列に対する Wavelet Matrix。
 *   座標圧縮を行うため、負数や大きな値も扱える。
 *
 *   new WaveletMatrix(A)
 *     順序統計・頻度クエリのみ
 *
 *   new WaveletMatrix(A,W)
 *     A をキー、W を重みとして
 *     範囲重み和クエリも使用可能
 *
 *   値そのものの和を取りたい場合:
 *     new WaveletMatrix(A,A)
 *
 * 主なAPI:
 *   kthSmallest(l,r,k)
 *   kthLargest(l,r,k)
 *   rangeFreq(l,r,upper)
 *   rangeFreq(l,r,lower,upper)
 *   count(l,r,x)
 *   freqLessEqual(l,r,x)
 *   prevValue(l,r,upper)
 *   nextValue(l,r,lower)
 *
 * 重み付き:
 *   rangeSum(l,r,upper)
 *   rangeSum(l,r,lower,upper)
 *   sumLessEqual(l,r,x)
 *   sumKSmallest(l,r,k)
 *   sumKLargest(l,r,k)
 *
 * 計算量:
 *   構築 O(N log N + N log σ)
 *   クエリ O(log σ)
 *
 *   σ = 異なる値の種類数
 *
 * 注意:
 *   静的データ構造。更新は不可。
 *   sum系は number を使うため、
 *   厳密整数計算では Number.MAX_SAFE_INTEGER を超えないこと。
 */
class WaveletMatrix {
  readonly n: number;
  readonly values: number[];
  readonly log: number;

  private mid: Int32Array;
  private pref: Int32Array[];

  // 重み付きクエリ用
  private zeroSum?: Float64Array[];
  private totalSum?: Float64Array;
  private leafSum?: Float64Array;

  constructor(
    A: number[],
    W?: number[]
  ) {
    this.n = A.length;

    if (
      W
      && W.length != A.length
    ) {
      throw new Error(
        "A and W must have the same length"
      );
    }

    for (let x of A) {
      if (!Number.isFinite(x)) {
        throw new Error(
          "WaveletMatrix supports only finite numbers"
        );
      }
    }

    if (W) {
      for (let x of W) {
        if (!Number.isFinite(x)) {
          throw new Error(
            "weights must be finite numbers"
          );
        }
      }
    }

    // 座標圧縮
    this.values = Array.from(
      new Set(A)
    ).sort((a,b)=>a-b);

    let m = this.values.length;

    this.log = Math.max(
      1,
      Math.ceil(
        Math.log2(Math.max(1,m))
      )
    );

    this.mid = new Int32Array(this.log);
    this.pref = Array(this.log);

    if (W) {
      this.zeroSum = Array(this.log);

      this.totalSum =
        new Float64Array(this.n+1);

      for (let i = 0; i < this.n; i++) {
        this.totalSum[i+1]
          = this.totalSum[i]+W[i];
      }
    }

    let rank = new Map<number,number>();

    for (let i = 0; i < m; i++) {
      rank.set(this.values[i],i);
    }

    let cur = new Int32Array(this.n);

    for (let i = 0; i < this.n; i++) {
      cur[i] = rank.get(A[i])!;
    }

    let curW = W
      ? Float64Array.from(W)
      : undefined;

    for (
      let level = 0;
      level < this.log;
      level++
    ) {
      let bit = this.log-1-level;

      let p =
        new Int32Array(this.n+1);

      let zs = W
        ? new Float64Array(this.n+1)
        : undefined;

      let zero = 0;

      for (let i = 0; i < this.n; i++) {
        let b = (cur[i]>>>bit)&1;

        p[i+1] = p[i]+b;

        if (b == 0) {
          zero++;
        }

        if (zs && curW) {
          zs[i+1]
            = zs[i]
            +(b == 0 ? curW[i] : 0);
        }
      }

      this.pref[level] = p;
      this.mid[level] = zero;

      if (this.zeroSum && zs) {
        this.zeroSum[level] = zs;
      }

      // 0側 → 1側へ安定分割
      let next =
        new Int32Array(this.n);

      let nextW = W
        ? new Float64Array(this.n)
        : undefined;

      let z = 0;
      let o = zero;

      for (let i = 0; i < this.n; i++) {
        let b = (cur[i]>>>bit)&1;
        let pos = b == 0 ? z++ : o++;

        next[pos] = cur[i];

        if (nextW && curW) {
          nextW[pos] = curW[i];
        }
      }

      cur = next;
      curW = nextW;
    }

    if (curW) {
      this.leafSum =
        new Float64Array(this.n+1);

      for (let i = 0; i < this.n; i++) {
        this.leafSum[i+1]
          = this.leafSum[i]
          +curW[i];
      }
    }
  }

  private lowerBound(x: number): number {
    let ok = this.values.length;
    let ng = -1;

    while (ok-ng > 1) {
      let mid = Math.floor((ok+ng)/2);

      if (this.values[mid] >= x) {
        ok = mid;
      } else {
        ng = mid;
      }
    }

    return ok;
  }

  private upperBound(x: number): number {
    let ok = this.values.length;
    let ng = -1;

    while (ok-ng > 1) {
      let mid = Math.floor((ok+ng)/2);

      if (this.values[mid] > x) {
        ok = mid;
      } else {
        ng = mid;
      }
    }

    return ok;
  }

  private checkRange(
    l: number,
    r: number
  ) {
    if (
      l < 0
      || l > r
      || r > this.n
    ) {
      throw new RangeError(
        `invalid range [${l}, ${r})`
      );
    }
  }

  /**
   * rank 未満の個数
   */
  private countLessThanRank(
    l: number,
    r: number,
    rank: number
  ): number {
    if (rank <= 0) return 0;

    if (rank >= this.values.length) {
      return r-l;
    }

    let ans = 0;

    for (
      let level = 0;
      level < this.log;
      level++
    ) {
      let bit = this.log-1-level;

      let p = this.pref[level];

      let onesL = p[l];
      let onesR = p[r];

      let zeros =
        (r-l)-(onesR-onesL);

      if ((rank>>>bit)&1) {
        ans += zeros;

        l = this.mid[level]+onesL;
        r = this.mid[level]+onesR;
      } else {
        l -= onesL;
        r -= onesR;
      }
    }

    return ans;
  }

  /**
   * rank 未満の重み和
   */
  private sumLessThanRank(
    l: number,
    r: number,
    rank: number
  ): number {
    if (
      !this.zeroSum
      || !this.totalSum
    ) {
      throw new Error(
        "sum queries require weights in the constructor"
      );
    }

    if (rank <= 0) return 0;

    if (rank >= this.values.length) {
      return this.totalSum[r]
        -this.totalSum[l];
    }

    let ans = 0;

    for (
      let level = 0;
      level < this.log;
      level++
    ) {
      let bit = this.log-1-level;

      let p = this.pref[level];

      let onesL = p[l];
      let onesR = p[r];

      if ((rank>>>bit)&1) {
        let zs = this.zeroSum[level];

        ans += zs[r]-zs[l];

        l = this.mid[level]+onesL;
        r = this.mid[level]+onesR;
      } else {
        l -= onesL;
        r -= onesR;
      }
    }

    return ans;
  }

  /**
   * [l,r) の k 番目に小さい値
   * k は 0-indexed
   */
  kthSmallest(
    l: number,
    r: number,
    k: number
  ): number {
    this.checkRange(l,r);

    if (
      k < 0
      || k >= r-l
    ) {
      throw new RangeError(
        `k must satisfy 0 <= k < ${r-l}`
      );
    }

    let rank = 0;

    for (
      let level = 0;
      level < this.log;
      level++
    ) {
      let bit = this.log-1-level;

      let p = this.pref[level];

      let onesL = p[l];
      let onesR = p[r];

      let zeros =
        (r-l)-(onesR-onesL);

      if (k < zeros) {
        l -= onesL;
        r -= onesR;
      } else {
        k -= zeros;

        rank += 2**bit;

        l = this.mid[level]+onesL;
        r = this.mid[level]+onesR;
      }
    }

    return this.values[rank];
  }

  /**
   * [l,r) の k 番目に大きい値
   * k は 0-indexed
   */
  kthLargest(
    l: number,
    r: number,
    k: number
  ): number {
    this.checkRange(l,r);

    if (
      k < 0
      || k >= r-l
    ) {
      throw new RangeError(
        `k must satisfy 0 <= k < ${r-l}`
      );
    }

    return this.kthSmallest(
      l,
      r,
      r-l-1-k
    );
  }

  /**
   * [l,r) で value < upper の個数
   */
  rangeFreq(
    l: number,
    r: number,
    upper: number
  ): number;

  /**
   * [l,r) で lower <= value < upper の個数
   */
  rangeFreq(
    l: number,
    r: number,
    lower: number,
    upper: number
  ): number;

  rangeFreq(
    l: number,
    r: number,
    a: number,
    b?: number
  ): number {
    this.checkRange(l,r);

    if (b === undefined) {
      return this.countLessThanRank(
        l,
        r,
        this.lowerBound(a)
      );
    }

    if (a >= b) return 0;

    return this.countLessThanRank(
      l,
      r,
      this.lowerBound(b)
    )
    -this.countLessThanRank(
      l,
      r,
      this.lowerBound(a)
    );
  }

  /**
   * [l,r) で value == x の個数
   */
  count(
    l: number,
    r: number,
    x: number
  ): number {
    this.checkRange(l,r);

    let rank = this.lowerBound(x);

    if (
      rank == this.values.length
      || this.values[rank] != x
    ) {
      return 0;
    }

    return this.countLessThanRank(
      l,
      r,
      rank+1
    )
    -this.countLessThanRank(
      l,
      r,
      rank
    );
  }

  /**
   * [l,r) で value <= x の個数
   */
  freqLessEqual(
    l: number,
    r: number,
    x: number
  ): number {
    this.checkRange(l,r);

    return this.countLessThanRank(
      l,
      r,
      this.upperBound(x)
    );
  }

  /**
   * [l,r) の upper 未満で最大の値
   */
  prevValue(
    l: number,
    r: number,
    upper: number
  ): number | undefined {
    let cnt = this.rangeFreq(
      l,
      r,
      upper
    );

    return cnt == 0
      ? undefined
      : this.kthSmallest(l,r,cnt-1);
  }

  /**
   * [l,r) の lower 以上で最小の値
   */
  nextValue(
    l: number,
    r: number,
    lower: number
  ): number | undefined {
    let cnt = this.rangeFreq(
      l,
      r,
      lower
    );

    return cnt == r-l
      ? undefined
      : this.kthSmallest(l,r,cnt);
  }

  /**
   * [l,r) で key < upper の重み和
   */
  rangeSum(
    l: number,
    r: number,
    upper: number
  ): number;

  /**
   * [l,r) で
   * lower <= key < upper
   * の重み和
   */
  rangeSum(
    l: number,
    r: number,
    lower: number,
    upper: number
  ): number;

  rangeSum(
    l: number,
    r: number,
    a: number,
    b?: number
  ): number {
    this.checkRange(l,r);

    if (b === undefined) {
      return this.sumLessThanRank(
        l,
        r,
        this.lowerBound(a)
      );
    }

    if (a >= b) return 0;

    return this.sumLessThanRank(
      l,
      r,
      this.lowerBound(b)
    )
    -this.sumLessThanRank(
      l,
      r,
      this.lowerBound(a)
    );
  }

  /**
   * [l,r) で key <= x の重み和
   */
  sumLessEqual(
    l: number,
    r: number,
    x: number
  ): number {
    this.checkRange(l,r);

    return this.sumLessThanRank(
      l,
      r,
      this.upperBound(x)
    );
  }

  /**
   * [l,r) の小さい方から
   * k 個の重み和
   *
   * k は個数なので 0 <= k <= r-l
   */
  sumKSmallest(
    l: number,
    r: number,
    k: number
  ): number {
    this.checkRange(l,r);

    if (
      !this.zeroSum
      || !this.leafSum
    ) {
      throw new Error(
        "sum queries require weights in the constructor"
      );
    }

    if (
      k < 0
      || k > r-l
    ) {
      throw new RangeError(
        `k must satisfy 0 <= k <= ${r-l}`
      );
    }

    let ans = 0;

    for (
      let level = 0;
      level < this.log;
      level++
    ) {
      let p = this.pref[level];

      let onesL = p[l];
      let onesR = p[r];

      let zeros =
        (r-l)-(onesR-onesL);

      if (k <= zeros) {
        l -= onesL;
        r -= onesR;
      } else {
        let zs = this.zeroSum[level];

        ans += zs[r]-zs[l];

        k -= zeros;

        l = this.mid[level]+onesL;
        r = this.mid[level]+onesR;
      }
    }

    if (k > 0) {
      ans += this.leafSum[l+k]
        -this.leafSum[l];
    }

    return ans;
  }

  /**
   * [l,r) の大きい方から
   * k 個の重み和
   */
  sumKLargest(
    l: number,
    r: number,
    k: number
  ): number {
    this.checkRange(l,r);

    if (!this.totalSum) {
      throw new Error(
        "sum queries require weights in the constructor"
      );
    }

    if (
      k < 0
      || k > r-l
    ) {
      throw new RangeError(
        `k must satisfy 0 <= k <= ${r-l}`
      );
    }

    return this.totalSum[r]
      -this.totalSum[l]
      -this.sumKSmallest(
        l,
        r,
        r-l-k
      );
  }
}

class AhoCorasick {
  readonly alphabet: string;
  readonly sigma: number;

  /**
   * fail[v]:
   *   vが表す文字列の、最長のproper suffixに対応する状態。
   */
  readonly fail: Int32Array;

  /**
   * order:
   *   根を先頭とするBFS順。
   *   最初の size() 要素だけを使用する。
   *
   * fail方向の情報伝播に使える。
   */
  readonly order: Int32Array;

  /**
   * outputCount[v]:
   *   vが表す文字列のsuffixとして一致する
   *   登録パターン数。重複パターンも別々に数える。
   */
  readonly outputCount: Int32Array;

  /**
   * vで一致する最短・最長パターン長。
   * 一致がなければ0。
   */
  readonly shortestOutputLength: Int32Array;
  readonly longestOutputLength: Int32Array;

  /**
   * patternNode[id]:
   *   patterns[id]そのものに対応するTrie状態。
   */
  readonly patternNode: Int32Array;
  private charIndex: Int16Array;
  private next: Int32Array;
  private outputLink: Int32Array;
  private terminalHead: Int32Array;
  private nextPattern: Int32Array;
  private nodeCountValue = 1;
  private patternCountValue: number;

  /**
   * 説明:
   *   複数パターンからAho-Corasickオートマトンを構築する。
   *
   *   alphabetは重複のないASCII文字列とする。
   *   パターンに空文字列を含めることはできない。
   *   同じパターンを複数登録することはできる。
   *
   * 使い方:
   *   let ac = new AhoCorasick(patterns);
   *   let acBinary = new AhoCorasick(patterns,"ab");
   *   let acHML = new AhoCorasick(patterns,"HML");
   *
   * 計算量:
   *   L=パターン総長、σ=alphabet.lengthとして
   *   構築 O(L*σ)
   *   メモリ O(L*σ)
   */
  constructor(
    patterns: string[],
    alphabet: string = "abcdefghijklmnopqrstuvwxyz"
  ) {
    if (alphabet.length == 0) {
      throw new RangeError(
        "alphabet must not be empty"
      );
    }
    this.alphabet = alphabet;
    this.sigma = alphabet.length;
    this.patternCountValue = patterns.length;
    this.charIndex = new Int16Array(128);
    this.charIndex.fill(-1);
    for (let i = 0; i < this.sigma; i++) {
      let code = alphabet.charCodeAt(i);
      if (code >= 128) {
        throw new RangeError(
          "alphabet must contain ASCII characters only"
        );
      }
      if (this.charIndex[code] != -1) {
        throw new RangeError(
          "alphabet characters must be distinct"
        );
      }
      this.charIndex[code] = i;
    }
    let maxNodes = 1;
    for (let s of patterns) {
      if (s.length == 0) {
        throw new RangeError(
          "patterns must not contain an empty string"
        );
      }
      maxNodes += s.length;
    }
    this.next = new Int32Array(
      maxNodes*this.sigma
    );
    this.next.fill(-1);
    this.fail = new Int32Array(maxNodes);
    this.order = new Int32Array(maxNodes);
    this.outputLink = new Int32Array(maxNodes);
    this.outputLink.fill(-1);
    this.outputCount = new Int32Array(maxNodes);
    this.shortestOutputLength =
      new Int32Array(maxNodes);
    this.longestOutputLength =
      new Int32Array(maxNodes);
    this.patternNode =
      new Int32Array(patterns.length);
    this.terminalHead =
      new Int32Array(maxNodes);
    this.terminalHead.fill(-1);
    this.nextPattern =
      new Int32Array(patterns.length);
    this.nextPattern.fill(-1);
    for (let id = 0; id < patterns.length; id++) {
      let s = patterns[id];
      let state = 0;
      for (let i = 0; i < s.length; i++) {
        let c = this.patternCharIndex(
          s.charCodeAt(i)
        );
        let pos = state*this.sigma+c;
        let to = this.next[pos];
        if (to == -1) {
          to = this.nodeCountValue++;
          this.next[pos] = to;
        }
        state = to;
      }
      this.patternNode[id] = state;
      this.nextPattern[id] =
        this.terminalHead[state];
      this.terminalHead[state] = id;
      this.outputCount[state]++;
      let len = s.length;
      if (
        this.shortestOutputLength[state] == 0
        || len < this.shortestOutputLength[state]
      ) {
        this.shortestOutputLength[state] = len;
      }
      if (
        this.longestOutputLength[state] < len
      ) {
        this.longestOutputLength[state] = len;
      }
    }
    this.build();
  }

  private patternCharIndex(
    code: number
  ): number {
    if (
      code >= 128
      || this.charIndex[code] == -1
    ) {
      throw new RangeError(
        "pattern contains a character outside alphabet"
      );
    }
    return this.charIndex[code];
  }

  private textCharIndex(
    code: number
  ): number {
    return code < 128
      ? this.charIndex[code]
      : -1;
  }

  private build(): void {
    let que =
      new Int32Array(this.nodeCountValue);
    let head = 0;
    let tail = 0;
    let orderSize = 1;
    this.order[0] = 0;
    // 根からの遷移
    for (let c = 0; c < this.sigma; c++) {
      let to = this.next[c];
      if (to == -1) {
        this.next[c] = 0;
      } else {
        this.fail[to] = 0;
        que[tail++] = to;
      }
    }
    while (head < tail) {
      let v = que[head++];
      this.order[orderSize++] = v;
      let f = this.fail[v];
      // failure先で一致するパターンも、
      // vのsuffixとして一致する
      this.outputCount[v] +=
        this.outputCount[f];
      let shortest =
        this.shortestOutputLength[f];
      if (
        shortest != 0
        && (
          this.shortestOutputLength[v] == 0
          || shortest
            < this.shortestOutputLength[v]
        )
      ) {
        this.shortestOutputLength[v] =
          shortest;
      }
      this.longestOutputLength[v] =
        Math.max(
          this.longestOutputLength[v],
          this.longestOutputLength[f]
        );
      this.outputLink[v] =
        this.terminalHead[f] != -1
          ? f
          : this.outputLink[f];
      for (let c = 0; c < this.sigma; c++) {
        let pos = v*this.sigma+c;
        let to = this.next[pos];
        if (to == -1) {
          this.next[pos] =
            this.next[f*this.sigma+c];
        } else {
          this.fail[to] =
            this.next[f*this.sigma+c];

          que[tail++] = to;
        }
      }
    }
  }

  /**
   * オートマトンの状態数を返す。
   */
  size(): number {
    return this.nodeCountValue;
  }

  /**
   * 登録したパターン数を返す。
   */
  patternSize(): number {
    return this.patternCountValue;
  }

  /**
   * stateから文字chを1文字読んだ遷移先を返す。
   *
   * alphabet外の文字なら根0へ戻る。
   *
   * 計算量:
   *   O(1)
   */
  nextState(
    state: number,
    ch: string
  ): number {
    if (
      !(0 <= state
      && state < this.nodeCountValue)
    ) {
      throw new RangeError(
        "state is out of range"
      );
    }
    if (ch.length != 1) {
      throw new RangeError(
        "ch must be one character"
      );
    }
    let c = this.textCharIndex(
      ch.charCodeAt(0)
    );
    return c == -1
      ? 0
      : this.next[state*this.sigma+c];
  }

  /**
   * stateからalphabet[index]を読んだ遷移先を返す。
   *
   * 全文字についてDP遷移を回す場合はこちらが高速。
   *
   * 計算量:
   *   O(1)
   */
  nextStateByIndex(
    state: number,
    index: number
  ): number {
    if (
      !(0 <= state
      && state < this.nodeCountValue)
    ) {
      throw new RangeError(
        "state is out of range"
      );
    }
    if (
      !(0 <= index
      && index < this.sigma)
    ) {
      throw new RangeError(
        "alphabet index is out of range"
      );
    }
    return this.next[
      state*this.sigma+index
    ];
  }

  /**
   * stateが表す文字列のsuffixに、
   * 登録パターンが1つ以上一致するか判定する。
   *
   * 計算量:
   *   O(1)
   */
  hasOutput(state: number): boolean {
    return this.outputCount[state] > 0;
  }

  /**
   * text中に各登録パターンが何回出現するか返す。
   *
   * 重なっている出現も数える。
   * 同じパターンを複数登録した場合、
   * それぞれのIDに同じ出現回数を返す。
   *
   * 使い方:
   *   let count = ac.countOccurrences(text);
   *   count[id]
   *
   * 計算量:
   *   O(|text| + 状態数 + パターン数)
   */
  countOccurrences(
    text: string
  ): number[] {
    let visits =
      new Float64Array(this.nodeCountValue);
    let state = 0;
    for (let i = 0; i < text.length; i++) {
      let c = this.textCharIndex(
        text.charCodeAt(i)
      );
      state = c == -1
        ? 0
        : this.next[state*this.sigma+c];
      visits[state]++;
    }
    // 深い状態からfailure先へ回数を集約
    for (
      let i = this.nodeCountValue-1;
      i >= 1;
      i--
    ) {
      let v = this.order[i];
      visits[this.fail[v]] += visits[v];
    }
    let result =
      Array<number>(this.patternCountValue);
    for (
      let id = 0;
      id < this.patternCountValue;
      id++
    ) {
      result[id] =
        visits[this.patternNode[id]];
    }
    return result;
  }

  /**
   * text中の全マッチを列挙する。
   *
   * callback(patternId,endIndex)
   *
   * endIndexは0-indexedの両端含む終端位置。
   *
   * 使い方:
   *   ac.forEachMatch(text,(id,end) => {
   *     let start =
   *       end-patterns[id].length+1;
   *   });
   *
   * 計算量:
   *   O(|text| + マッチ総数)
   */
  forEachMatch(
    text: string,
    callback: (
      patternId: number,
      endIndex: number
    ) => void
  ): void {
    let state = 0;
    for (
      let end = 0;
      end < text.length;
      end++
    ) {
      let c = this.textCharIndex(
        text.charCodeAt(end)
      );
      state = c == -1
        ? 0
        : this.next[state*this.sigma+c];
      let v = state;
      while (v != -1) {
        for (
          let id = this.terminalHead[v];
          id != -1;
          id = this.nextPattern[id]
        ) {
          callback(id,end);
        }
        v = this.outputLink[v];
      }
    }
  }
}

/**
 * 説明:
 *   1つの配列に対して構築された区間多重集合ハッシュ。
 *
 *   半開区間 [l,r) に含まれる値を、順序を無視した
 *   多重集合としてハッシュ化する。
 *
 *   同じ MultisetHasher インスタンスから構築された
 *   別の RangeMultisetHash と比較できる。
 *
 *   二重ハッシュを使用しているため衝突確率は非常に低いが、
 *   乱択ハッシュなので理論上は誤判定の可能性がある。
 *
 * 使い方:
 *   let hasher = new MultisetHasher();
 *   let hashA = hasher.build(A);
 *   let hashB = hasher.build(B);
 *
 *   let hash = hashA.get(l,r);
 *   let same = hashA.equals(
 *     hashB,
 *     l1,
 *     r1,
 *     l2,
 *     r2
 *   );
 *
 * 計算量:
 *   get O(1)
 *   equals O(1)
 *   メモリ O(N)
 * 
 * 用例: ABC367-F
 */
class RangeMultisetHash {
  private static readonly MOD1 = 1000000007;
  private static readonly MOD2 = 1000000009;

  constructor(
    private sum1: number[],
    private sum2: number[]
  ) {}

  /**
   * 説明:
   *   半開区間 [l,r) の多重集合ハッシュを返す。
   *
   * 返り値:
   *   2つの法によるハッシュ値 [hash1,hash2]
   *
   * 使い方:
   *   let hash = rangeHash.get(l,r);
   *
   * 計算量:
   *   O(1)
   */
  get(
    l: number,
    r: number
  ): [number,number] {
    let x1 = this.sum1[r]-this.sum1[l];
    let x2 = this.sum2[r]-this.sum2[l];
    if (x1 < 0) {
      x1 += RangeMultisetHash.MOD1;
    }
    if (x2 < 0) {
      x2 += RangeMultisetHash.MOD2;
    }
    return [x1,x2];
  }

  /**
   * 説明:
   *   この配列の半開区間 [l1,r1) と、
   *   other の半開区間 [l2,r2) が
   *   多重集合として等しいか判定する。
   *
   *   要素の順序は無視するが、
   *   各値の出現回数は区別する。
   *
   * 注意:
   *   this と other は同じ MultisetHasher
   *   インスタンスから構築する必要がある。
   *
   *   乱択ハッシュなので、極小確率で
   *   異なる多重集合を等しいと判定する可能性がある。
   *
   * 使い方:
   *   let same = hashA.equals(
   *     hashB,
   *     l1,
   *     r1,
   *     l2,
   *     r2
   *   );
   *
   * 計算量:
   *   O(1)
   */
  equals(
    other: RangeMultisetHash,
    l1: number,
    r1: number,
    l2: number,
    r2: number
  ): boolean {
    if (r1-l1 != r2-l2) {
      return false;
    }
    let [a1,a2] = this.get(l1,r1);
    let [b1,b2] = other.get(l2,r2);
    return a1 == b1 && a2 == b2;
  }
}

/**
 * 説明:
 *   各値にランダムな二重ハッシュを割り当て、
 *   配列の区間を多重集合として比較できる
 *   RangeMultisetHash を構築する。
 *
 *   同じ値には常に同じハッシュ値が割り当てられるため、
 *   同じ MultisetHasher インスタンスから構築した
 *   複数の配列同士を比較できる。
 *
 *   多重集合ハッシュは各要素のハッシュ値の和なので、
 *   要素の並び順には依存せず、
 *   同じ値の出現回数は結果に反映される。
 *
 * 使い方:
 *   let hasher = new MultisetHasher();
 *
 *   let hashA = hasher.build(A);
 *   let hashB = hasher.build(B);
 *
 *   if (
 *     hashA.equals(
 *       hashB,
 *       l1,
 *       r1,
 *       l2,
 *       r2
 *     )
 *   ) {
 *     // 多重集合として等しい
 *   }
 *
 * 注意:
 *   比較する配列は、必ず同じ MultisetHasher
 *   インスタンスから build する。
 *
 *   乱択ハッシュなので、極小確率で
 *   ハッシュ衝突による誤判定が発生する可能性がある。
 *
 * 計算量:
 *   build O(N)
 *   各区間比較 O(1)
 *   値の種類数をVとして内部メモリ O(V)
 * 
 * 用例: ABC367-F
 */
class MultisetHasher {
  private static readonly MOD1 = 1000000007;
  private static readonly MOD2 = 1000000009;
  private hash1 = new Map<number,number>();
  private hash2 = new Map<number,number>();

  /**
   * 説明:
   *   値 x に対応する二重ハッシュを返す。
   *   初めて現れた値ならランダムに生成して保存する。
   *
   * 計算量:
   *   平均 O(1)
   */
  private getHash(
    x: number
  ): [number,number] {
    let h1 = this.hash1.get(x);
    let h2 = this.hash2.get(x);
    if (h1 === undefined) {
      h1 = Math.floor(
        Math.random()*MultisetHasher.MOD1
      );
      h2 = Math.floor(
        Math.random()*MultisetHasher.MOD2
      );
      this.hash1.set(x,h1);
      this.hash2.set(x,h2);
    }
    return [h1,h2!];
  }

  /**
   * 説明:
   *   配列 A の区間多重集合ハッシュを構築する。
   *
   *   返された RangeMultisetHash では、
   *   半開区間 [l,r) のハッシュ取得や
   *   他の配列との多重集合比較ができる。
   *
   * 使い方:
   *   let hashA = hasher.build(A);
   *
   * 計算量:
   *   O(N)
   */
  build(
    A: ArrayLike<number>
  ): RangeMultisetHash {
    let sum1 = Array(A.length+1).fill(0);
    let sum2 = Array(A.length+1).fill(0);
    for (let i = 0; i < A.length; i++) {
      let [h1,h2] = this.getHash(A[i]);
      let x1 = sum1[i]+h1;
      let x2 = sum2[i]+h2;
      if (x1 >= MultisetHasher.MOD1) {
        x1 -= MultisetHasher.MOD1;
      }
      if (x2 >= MultisetHasher.MOD2) {
        x2 -= MultisetHasher.MOD2;
      }
      sum1[i+1] = x1;
      sum2[i+1] = x2;
    }
    return new RangeMultisetHash(
      sum1,
      sum2
    );
  }
}

/**
 * 説明:
 *   1 から maxN までの各整数について、
 *   最小素因数を前計算する。
 *
 *   素因数分解、素数判定、重複込み素因数個数を
 *   高速に求められる。
 *
 * 使い方:
 *   let spf = new SmallestPrimeFactor(maxN);
 *
 *   spf.isPrime(x);
 *   spf.factorize(x);
 *   spf.primeFactorCount(x);
 *
 * 計算量:
 *   構築 O(maxN log log maxN)
 *   isPrime O(1)
 *   primeFactorCount O(1)
 *   factorize O(log x)
 *
 * メモリ:
 *   O(maxN)
 * 
 * 用例: ABC368-F
 */
class SmallestPrimeFactor {
  private spf: number[];
  private omega: number[];

  constructor(maxN: number) {
    if (
      !Number.isSafeInteger(maxN)
      || maxN < 1
    ) {
      throw new RangeError(
        "maxN must be a positive safe integer"
      );
    }
    this.spf = Array(maxN+1).fill(0);
    this.omega = Array(maxN+1).fill(0);
    this.spf[1] = 1;
    for (let i = 2; i <= maxN; i++) {
      if (this.spf[i] != 0) continue;
      for (let j = i; j <= maxN; j += i) {
        if (this.spf[j] == 0) {
          this.spf[j] = i;
        }
      }
    }
    for (let i = 2; i <= maxN; i++) {
      this.omega[i] =
        this.omega[intDiv(i,this.spf[i])]+1;
    }
  }

  /**
   * 説明:
   *   n が素数か判定する。
   *
   * 計算量:
   *   O(1)
   */
  isPrime(n: number): boolean {
    return 2 <= n && this.spf[n] == n;
  }

  /**
   * 説明:
   *   n の重複を含めた素因数の個数 Ω(n) を返す。
   *
   * 例:
   *   12 = 2^2 * 3 なので3を返す。
   *
   * 計算量:
   *   O(1)
   * 
   * 用例: ABC368-F
   */
  primeFactorCount(n: number): number {
    return this.omega[n];
  }

  /**
   * 説明:
   *   n を素因数分解し、
   *   [素数,指数] の配列を返す。
   *
   * 例:
   *   factorize(12)
   *   => [[2,2],[3,1]]
   *
   * 計算量:
   *   O(log n)
   */
  factorize(
    n: number
  ): [number,number][] {
    let result: [number,number][] = [];
    while (n > 1) {
      let p = this.spf[n];
      let count = 0;
      while (n%p == 0) {
        n = intDiv(n,p);
        count++;
      }
      result.push([p,count]);
    }
    return result;
  }
}

/**
 * 2次元幾何ライブラリ
 *
 * 命名:
 *   ・すべての公開名に Geo / geo 接頭辞を付け、他ライブラリとの衝突を避ける。
 *   ・geoInt... は bigint による厳密計算、geo... は number による実数計算。
 *
 * 方針:
 *   ・整数座標の判定は bigint で厳密に行う。
 *   ・交点、射影、円の中心など実数が必要な処理は number と EPS を使う。
 *
 * 整数点:
 *   let P: GeoIntPoint = [1n,2n];
 *
 * 実数点:
 *   let P: GeoPoint = [1,2];
 */

type GeoIntPoint = [bigint,bigint];
type GeoPoint = [number,number];

type GeoPointLocation = "IN" | "ON" | "OUT";
type GeoSegmentIntersectionType = "NONE" | "TOUCH" | "CROSS" | "OVERLAP";
type GeoLineRelation = "INTERSECT" | "PARALLEL" | "COINCIDENT";

const GEOMETRY_EPS = 1e-10;

/**
 * 説明: EPS付きで実数xの符号を -1,0,1 で返す。
 * 使い方: let sign = geoSign(x)
 * 計算量: O(1)
 */
function geoSign(x: number, eps: number = GEOMETRY_EPS): -1 | 0 | 1 {
  return x < -eps ? -1 : x > eps ? 1 : 0;
}

/**
 * 説明: bigint xの符号を -1,0,1 で返す。
 * 使い方: let sign = geoBigIntSign(x)
 * 計算量: O(1)
 */
function geoBigIntSign(x: bigint): -1 | 0 | 1 {
  return x < 0n ? -1 : x > 0n ? 1 : 0;
}

/**
 * 説明: bigint xの絶対値を返す。
 * 使い方: let y = geoBigIntAbs(x)
 * 計算量: O(1)
 */
function geoBigIntAbs(x: bigint): bigint {
  return x < 0n ? -x : x;
}

/**
 * 説明: bigint a,bの非負の最大公約数を返す。
 * 使い方: let g = geoBigIntGcd(a,b)
 * 計算量: O(log min(|a|,|b|))
 */
function geoBigIntGcd(a: bigint, b: bigint): bigint {
  a = geoBigIntAbs(a);
  b = geoBigIntAbs(b);
  while (b != 0n) {
    [a,b] = [b,a%b];
  }
  return a;
}

/**
 * 整数ベクトルの加算。
 * 計算量: O(1)
 */
function geoIntPointAdd(a: GeoIntPoint, b: GeoIntPoint): GeoIntPoint {
  return [a[0]+b[0],a[1]+b[1]];
}

/**
 * 整数ベクトルの減算 a-b。
 * 計算量: O(1)
 */
function geoIntPointSub(a: GeoIntPoint, b: GeoIntPoint): GeoIntPoint {
  return [a[0]-b[0],a[1]-b[1]];
}

/**
 * 整数ベクトルの内積。
 * 0なら垂直。
 * 計算量: O(1)
 */
function geoIntDot(a: GeoIntPoint, b: GeoIntPoint): bigint {
  return a[0]*b[0]+a[1]*b[1];
}

/**
 * 整数ベクトルの外積。
 * 正なら b は a の反時計回り側、負なら時計回り側。
 * 計算量: O(1)
 */
function geoIntCross(a: GeoIntPoint, b: GeoIntPoint): bigint {
  return a[0]*b[1]-a[1]*b[0];
}

/**
 * 整数ベクトルの長さの2乗。
 * 計算量: O(1)
 */
function geoIntNorm2(a: GeoIntPoint): bigint {
  return geoIntDot(a,a);
}

/**
 * 整数2点間の距離の2乗。
 * 計算量: O(1)
 */
function geoIntDistance2(a: GeoIntPoint, b: GeoIntPoint): bigint {
  return geoIntNorm2(geoIntPointSub(a,b));
}

/**
 * ベクトルを反時計回りに90度回転する。
 * 計算量: O(1)
 */
function geoIntRotate90(a: GeoIntPoint): GeoIntPoint {
  return [-a[1],a[0]];
}

/**
 * 3点 a,b,c の向きを返す。
 * 正: 反時計回り、負: 時計回り、0: 一直線。
 * 計算量: O(1)
 */
function geoIntOrient(a: GeoIntPoint, b: GeoIntPoint, c: GeoIntPoint): bigint {
  return geoIntCross(geoIntPointSub(b,a),geoIntPointSub(c,a));
}

/**
 * geoIntOrient の符号だけを -1,0,1 で返す。
 * 計算量: O(1)
 */
function geoIntCcw(a: GeoIntPoint, b: GeoIntPoint, c: GeoIntPoint): -1 | 0 | 1 {
  return geoBigIntSign(geoIntOrient(a,b,c));
}

/**
 * 2ベクトルが平行か判定する。
 * 計算量: O(1)
 */
function geoIntAreParallel(a: GeoIntPoint, b: GeoIntPoint): boolean {
  return geoIntCross(a,b) == 0n;
}

/**
 * 2ベクトルが垂直か判定する。
 * 計算量: O(1)
 */
function geoIntArePerpendicular(a: GeoIntPoint, b: GeoIntPoint): boolean {
  return geoIntDot(a,b) == 0n;
}

/**
 * 点 p が a,b を通る直線上にあるか判定する。
 * 計算量: O(1)
 */
function geoIntIsOnLine(a: GeoIntPoint, b: GeoIntPoint, p: GeoIntPoint): boolean {
  return geoIntOrient(a,b,p) == 0n;
}

/**
 * 点 p が閉線分 ab 上にあるか判定する。
 * 計算量: O(1)
 */
function geoIntIsOnSegment(a: GeoIntPoint, b: GeoIntPoint, p: GeoIntPoint): boolean {
  if (!geoIntIsOnLine(a,b,p)) return false;
  return geoIntDot(geoIntPointSub(p,a),geoIntPointSub(p,b)) <= 0n;
}

/**
 * 2閉線分 ab,cd の交差の種類を返す。
 * NONE: 交わらない
 * TOUCH: 1点で接する
 * CROSS: 内部で交差する
 * OVERLAP: 同一直線上で長さを持って重なる
 * 計算量: O(1)
 */
function geoIntSegmentIntersectionType(
  a: GeoIntPoint,
  b: GeoIntPoint,
  c: GeoIntPoint,
  d: GeoIntPoint
): GeoSegmentIntersectionType {
  let o1 = geoIntOrient(a,b,c);
  let o2 = geoIntOrient(a,b,d);
  let o3 = geoIntOrient(c,d,a);
  let o4 = geoIntOrient(c,d,b);

  if (o1 == 0n && o2 == 0n && o3 == 0n && o4 == 0n) {
    let useX = a[0] != b[0] || c[0] != d[0];
    let a1 = useX ? a[0] : a[1];
    let b1 = useX ? b[0] : b[1];
    let c1 = useX ? c[0] : c[1];
    let d1 = useX ? d[0] : d[1];
    let left = (a1 < b1 ? a1 : b1) > (c1 < d1 ? c1 : d1)
      ? (a1 < b1 ? a1 : b1)
      : (c1 < d1 ? c1 : d1);
    let right = (a1 > b1 ? a1 : b1) < (c1 > d1 ? c1 : d1)
      ? (a1 > b1 ? a1 : b1)
      : (c1 > d1 ? c1 : d1);
    if (left > right) return "NONE";
    return left == right ? "TOUCH" : "OVERLAP";
  }

  if (
    (o1 == 0n && geoIntIsOnSegment(a,b,c))
    || (o2 == 0n && geoIntIsOnSegment(a,b,d))
    || (o3 == 0n && geoIntIsOnSegment(c,d,a))
    || (o4 == 0n && geoIntIsOnSegment(c,d,b))
  ) {
    return "TOUCH";
  }

  if (
    geoBigIntSign(o1)*geoBigIntSign(o2) < 0
    && geoBigIntSign(o3)*geoBigIntSign(o4) < 0
  ) {
    return "CROSS";
  }
  return "NONE";
}

/**
 * 2閉線分が1点以上を共有するか判定する。
 * 計算量: O(1)
 */
function geoIntSegmentsIntersect(
  a: GeoIntPoint,
  b: GeoIntPoint,
  c: GeoIntPoint,
  d: GeoIntPoint
): boolean {
  return geoIntSegmentIntersectionType(a,b,c,d) != "NONE";
}

/**
 * 整数係数直線 ax+by+c=0。
 */
type GeoIntLine = {
  a: bigint;
  b: bigint;
  c: bigint;
};

/**
 * 整数係数直線を gcd と符号で正規化する。
 * 同じ直線は同じ {a,b,c} になる。
 * 計算量: O(log max(|a|,|b|,|c|))
 */
function geoNormalizeIntLine(line: GeoIntLine): GeoIntLine {
  let {a,b,c} = line;
  if (a == 0n && b == 0n) {
    throw new Error("Invalid line");
  }
  let g = geoBigIntGcd(
    geoBigIntGcd(geoBigIntAbs(a),geoBigIntAbs(b)),
    geoBigIntAbs(c)
  );
  if (g != 0n) {
    a /= g;
    b /= g;
    c /= g;
  }
  if (a < 0n || (a == 0n && b < 0n)) {
    a = -a;
    b = -b;
    c = -c;
  }
  return {a,b,c};
}

/**
 * 異なる2点 p,q を通る整数係数直線を返す。
 * 計算量: O(log C)
 */
function geoIntLineThroughPoints(p: GeoIntPoint, q: GeoIntPoint): GeoIntLine {
  if (p[0] == q[0] && p[1] == q[1]) {
    throw new Error("Two distinct points are required");
  }
  return geoNormalizeIntLine({
    a: p[1]-q[1],
    b: q[0]-p[0],
    c: p[0]*q[1]-q[0]*p[1]
  });
}

/**
 * 点 p を直線へ代入した値 ax+by+c を返す。
 * 計算量: O(1)
 */
function geoIntLineEvaluate(line: GeoIntLine, p: GeoIntPoint): bigint {
  return line.a*p[0]+line.b*p[1]+line.c;
}

/**
 * 異なる2点 p,q の垂直二等分線を整数係数で返す。
 * 中点の除算を行わないため厳密。
 * 計算量: O(log C)
 */
function geoIntPerpendicularBisector(p: GeoIntPoint, q: GeoIntPoint): GeoIntLine {
  if (p[0] == q[0] && p[1] == q[1]) {
    throw new Error("Two distinct points are required");
  }
  return geoNormalizeIntLine({
    a: 2n*(q[0]-p[0]),
    b: 2n*(q[1]-p[1]),
    c: p[0]*p[0]+p[1]*p[1]-q[0]*q[0]-q[1]*q[1]
  });
}

/**
 * 2直線の関係を返す。
 * INTERSECT: 1点で交わる
 * PARALLEL: 異なる平行線
 * COINCIDENT: 同一直線
 * 計算量: O(1)
 */
function geoIntLineRelation(l1: GeoIntLine, l2: GeoIntLine): GeoLineRelation {
  let det = l1.a*l2.b-l2.a*l1.b;
  if (det != 0n) return "INTERSECT";
  if (
    l1.a*l2.c == l2.a*l1.c
    && l1.b*l2.c == l2.b*l1.c
  ) {
    return "COINCIDENT";
  }
  return "PARALLEL";
}

type GeoIntLineIntersection =
  | {type: "INTERSECT"; point: GeoPoint}
  | {type: "PARALLEL" | "COINCIDENT"};

/**
 * 整数係数2直線の交点を number 座標で返す。
 * 平行・一致の場合は種類だけを返す。
 * 計算量: O(1)
 */
function geoIntLineIntersection(
  l1: GeoIntLine,
  l2: GeoIntLine
): GeoIntLineIntersection {
  let relation = geoIntLineRelation(l1,l2);
  if (relation != "INTERSECT") return {type: relation};
  let det = l1.a*l2.b-l2.a*l1.b;
  let xNum = l1.b*l2.c-l1.c*l2.b;
  let yNum = l1.c*l2.a-l1.a*l2.c;
  return {
    type: "INTERSECT",
    point: [Number(xNum)/Number(det),Number(yNum)/Number(det)]
  };
}

/**
 * 説明: 実数ベクトルa+bを返す。
 * 使い方: let c = geoPointAdd(a,b)
 * 計算量: O(1)
 */
function geoPointAdd(a: GeoPoint, b: GeoPoint): GeoPoint {
  return [a[0]+b[0],a[1]+b[1]];
}

/**
 * 説明: 実数ベクトルa-bを返す。
 * 使い方: let c = geoPointSub(a,b)
 * 計算量: O(1)
 */
function geoPointSub(a: GeoPoint, b: GeoPoint): GeoPoint {
  return [a[0]-b[0],a[1]-b[1]];
}

/**
 * 説明: 実数ベクトルaをk倍したベクトルを返す。
 * 使い方: let b = geoPointScale(a,k)
 * 計算量: O(1)
 */
function geoPointScale(a: GeoPoint, k: number): GeoPoint {
  return [a[0]*k,a[1]*k];
}

/**
 * 説明: 実数ベクトルa,bの内積を返す。0なら垂直。
 * 使い方: let value = geoDot(a,b)
 * 計算量: O(1)
 */
function geoDot(a: GeoPoint, b: GeoPoint): number {
  return a[0]*b[0]+a[1]*b[1];
}

/**
 * 説明: 実数ベクトルa,bの外積を返す。正ならbはaの反時計回り側。
 * 使い方: let value = geoCross(a,b)
 * 計算量: O(1)
 */
function geoCross(a: GeoPoint, b: GeoPoint): number {
  return a[0]*b[1]-a[1]*b[0];
}

/**
 * 説明: 実数ベクトルaの長さの2乗を返す。
 * 使い方: let value = geoNorm2(a)
 * 計算量: O(1)
 */
function geoNorm2(a: GeoPoint): number {
  return geoDot(a,a);
}

/**
 * 説明: 実数点a,b間の距離の2乗を返す。
 * 使い方: let value = geoDistance2(a,b)
 * 計算量: O(1)
 */
function geoDistance2(a: GeoPoint, b: GeoPoint): number {
  return geoNorm2(geoPointSub(a,b));
}

/**
 * 説明: 実数点a,b間のユークリッド距離を返す。
 * 使い方: let value = geoDistance(a,b)
 * 計算量: O(1)
 */
function geoDistance(a: GeoPoint, b: GeoPoint): number {
  return Math.sqrt(geoDistance2(a,b));
}

/**
 * 説明: 実数ベクトルaを反時計回りに90度回転したベクトルを返す。
 * 使い方: let b = geoRotate90(a)
 * 計算量: O(1)
 */
function geoRotate90(a: GeoPoint): GeoPoint {
  return [-a[1],a[0]];
}

/**
 * 点 p を a,b を通る直線へ正射影した点を返す。
 * a,b は異なる必要がある。
 * 計算量: O(1)
 */
function geoProjection(a: GeoPoint, b: GeoPoint, p: GeoPoint): GeoPoint {
  let d = geoPointSub(b,a);
  let n = geoNorm2(d);
  if (n <= GEOMETRY_EPS*GEOMETRY_EPS) {
    throw new Error("Two distinct points are required");
  }
  let t = geoDot(geoPointSub(p,a),d)/n;
  return geoPointAdd(a,geoPointScale(d,t));
}

/**
 * 点 p を a,b を通る直線に関して鏡映した点を返す。
 * 計算量: O(1)
 */
function geoReflection(a: GeoPoint, b: GeoPoint, p: GeoPoint): GeoPoint {
  let h = geoProjection(a,b,p);
  return [2*h[0]-p[0],2*h[1]-p[1]];
}

/**
 * 点 p と a,b を通る直線の距離。
 * 計算量: O(1)
 */
function geoDistancePointLine(a: GeoPoint, b: GeoPoint, p: GeoPoint): number {
  let d = geoPointSub(b,a);
  let len = Math.sqrt(geoNorm2(d));
  if (len <= GEOMETRY_EPS) {
    throw new Error("Two distinct points are required");
  }
  return Math.abs(geoCross(d,geoPointSub(p,a)))/len;
}

/**
 * 点 p と閉線分 ab の距離。
 * 退化線分 a=b にも対応する。
 * 計算量: O(1)
 */
function geoDistancePointSegment(a: GeoPoint, b: GeoPoint, p: GeoPoint): number {
  let d = geoPointSub(b,a);
  let n = geoNorm2(d);
  if (n <= GEOMETRY_EPS*GEOMETRY_EPS) return geoDistance(a,p);
  let t = geoDot(geoPointSub(p,a),d)/n;
  if (t <= 0) return geoDistance(a,p);
  if (t >= 1) return geoDistance(b,p);
  let h = geoPointAdd(a,geoPointScale(d,t));
  return geoDistance(h,p);
}

/**
 * 実数点 p が閉線分 ab 上にあるか EPS 付きで判定する。
 * 計算量: O(1)
 */
function geoIsOnSegmentReal(a: GeoPoint, b: GeoPoint, p: GeoPoint): boolean {
  if (geoSign(geoCross(geoPointSub(b,a),geoPointSub(p,a))) != 0) return false;
  return geoDot(geoPointSub(p,a),geoPointSub(p,b)) <= GEOMETRY_EPS;
}

/**
 * 実数座標の2閉線分が交差するか EPS 付きで判定する。
 * 計算量: O(1)
 */
function geoSegmentsIntersectReal(
  a: GeoPoint,
  b: GeoPoint,
  c: GeoPoint,
  d: GeoPoint
): boolean {
  let o1 = geoSign(geoCross(geoPointSub(b,a),geoPointSub(c,a)));
  let o2 = geoSign(geoCross(geoPointSub(b,a),geoPointSub(d,a)));
  let o3 = geoSign(geoCross(geoPointSub(d,c),geoPointSub(a,c)));
  let o4 = geoSign(geoCross(geoPointSub(d,c),geoPointSub(b,c)));
  if (o1 == 0 && geoIsOnSegmentReal(a,b,c)) return true;
  if (o2 == 0 && geoIsOnSegmentReal(a,b,d)) return true;
  if (o3 == 0 && geoIsOnSegmentReal(c,d,a)) return true;
  if (o4 == 0 && geoIsOnSegmentReal(c,d,b)) return true;
  return o1*o2 < 0 && o3*o4 < 0;
}

/**
 * 2閉線分 ab,cd の距離。
 * 交差する場合は0。
 * 計算量: O(1)
 */
function geoDistanceSegmentSegment(
  a: GeoPoint,
  b: GeoPoint,
  c: GeoPoint,
  d: GeoPoint
): number {
  if (geoSegmentsIntersectReal(a,b,c,d)) return 0;
  return Math.min(
    geoDistancePointSegment(a,b,c),
    geoDistancePointSegment(a,b,d),
    geoDistancePointSegment(c,d,a),
    geoDistancePointSegment(c,d,b)
  );
}

/**
 * 角度を [0,2π) に正規化する。
 * 計算量: O(1)
 */
function geoNormalizeAngle(rad: number): number {
  let twoPi = 2*Math.PI;
  rad %= twoPi;
  if (rad < 0) rad += twoPi;
  return rad;
}

/**
 * 2角の小さい方の差を [0,π] で返す。
 * 計算量: O(1)
 */
function geoAngleDifference(a: number, b: number): number {
  let d = Math.abs(geoNormalizeAngle(a)-geoNormalizeAngle(b));
  return Math.min(d,2*Math.PI-d);
}

/**
 * ベクトルの偏角を atan2 で返す。範囲は [-π,π]。
 * 計算量: O(1)
 */
function geoAngleOf(v: GeoPoint): number {
  return Math.atan2(v[1],v[0]);
}

/**
 * 2非ゼロベクトルのなす角を [0,π] で返す。
 * 計算量: O(1)
 */
function geoAngleBetween(a: GeoPoint, b: GeoPoint): number {
  let na = Math.sqrt(geoNorm2(a));
  let nb = Math.sqrt(geoNorm2(b));
  if (na <= GEOMETRY_EPS || nb <= GEOMETRY_EPS) {
    throw new Error("Non-zero vectors are required");
  }
  let c = geoDot(a,b)/(na*nb);
  c = Math.max(-1,Math.min(1,c));
  return Math.acos(c);
}

/**
 * 説明: 偏角順ソート用に、整数ベクトルが上半平面側なら0、下半平面側なら1を返す。
 * 使い方: let half = geoIntPolarHalf(v)
 * 計算量: O(1)
 */
function geoIntPolarHalf(v: GeoIntPoint): number {
  return v[1] > 0n || (v[1] == 0n && v[0] >= 0n) ? 0 : 1;
}

/**
 * 整数ベクトルを偏角順 [0,2π) に並べる比較関数。
 * 同方向なら短いベクトルを先にする。
 * 使い方: V.sort(geoIntPolarCompare)
 * 計算量: O(1)
 */
function geoIntPolarCompare(a: GeoIntPoint, b: GeoIntPoint): number {
  let ha = geoIntPolarHalf(a);
  let hb = geoIntPolarHalf(b);
  if (ha != hb) return ha-hb;
  let cr = geoIntCross(a,b);
  if (cr != 0n) return cr > 0n ? -1 : 1;
  let na = geoIntNorm2(a);
  let nb = geoIntNorm2(b);
  return na == nb ? 0 : na < nb ? -1 : 1;
}

/**
 * 基準点 origin から見た偏角順比較関数を返す。
 * 使い方: P.sort(geoIntPolarCompareFrom(origin))
 */
function geoIntPolarCompareFrom(origin: GeoIntPoint) {
  return (a: GeoIntPoint, b: GeoIntPoint): number => {
    return geoIntPolarCompare(geoIntPointSub(a,origin),geoIntPointSub(b,origin));
  };
}

/**
 * 実数中心・半径による円。
 */
type GeoCircle = {
  center: GeoPoint;
  radius: number;
};

/**
 * 点と円の位置関係を返す。
 * IN: 内部、ON: 円周上、OUT: 外部。
 * 計算量: O(1)
 */
function geoPointCircleRelation(
  circle: GeoCircle,
  p: GeoPoint,
  eps: number = GEOMETRY_EPS
): GeoPointLocation {
  let d2 = geoDistance2(circle.center,p);
  let r2 = circle.radius*circle.radius;
  let tolerance = eps*Math.max(1,d2,r2);
  if (d2 < r2-tolerance) return "IN";
  if (d2 > r2+tolerance) return "OUT";
  return "ON";
}

/**
 * 点が円の内部または円周上にあるか判定する。
 * 計算量: O(1)
 */
function geoCircleContainsPoint(
  circle: GeoCircle,
  p: GeoPoint,
  eps: number = GEOMETRY_EPS
): boolean {
  return geoPointCircleRelation(circle,p,eps) != "OUT";
}

/**
 * 2点を直径の両端とする円を返す。
 * 計算量: O(1)
 */
function geoCircleFrom2Points(a: GeoPoint, b: GeoPoint): GeoCircle {
  let center: GeoPoint = [(a[0]+b[0])/2,(a[1]+b[1])/2];
  return {center,radius: geoDistance(a,b)/2};
}

/**
 * 3点 a,b,c の外心を返す。
 * 3点が一直線なら null。
 * 計算量: O(1)
 */
function geoCircumcenter(
  a: GeoPoint,
  b: GeoPoint,
  c: GeoPoint,
  eps: number = GEOMETRY_EPS
): GeoPoint | null {
  let u = geoPointSub(b,a);
  let v = geoPointSub(c,a);
  let d = 2*geoCross(u,v);
  if (Math.abs(d) <= eps) return null;
  let u2 = geoNorm2(u);
  let v2 = geoNorm2(v);
  let offset: GeoPoint = [
    (u2*v[1]-v2*u[1])/d,
    (u[0]*v2-v[0]*u2)/d
  ];
  return geoPointAdd(a,offset);
}

/**
 * 3点 a,b,c を通る円を返す。
 * 3点が一直線なら null。
 * 計算量: O(1)
 */
function geoCircumcircle(
  a: GeoPoint,
  b: GeoPoint,
  c: GeoPoint,
  eps: number = GEOMETRY_EPS
): GeoCircle | null {
  let center = geoCircumcenter(a,b,c,eps);
  if (center == null) return null;
  return {center,radius: geoDistance(center,a)};
}

/**
 * 説明: 3点をすべて含み、そのうち2点以上が境界にある最小の円を返す。
 *   3点が一直線なら最遠2点を直径とする円を返す。
 * 使い方: let circle = geoBoundaryCircle3(a,b,c)
 * 計算量: O(1)
 */
function geoBoundaryCircle3(a: GeoPoint, b: GeoPoint, c: GeoPoint): GeoCircle {
  let circle = geoCircumcircle(a,b,c);
  if (circle != null) return circle;
  let ab = geoDistance2(a,b);
  let ac = geoDistance2(a,c);
  let bc = geoDistance2(b,c);
  if (ab >= ac && ab >= bc) return geoCircleFrom2Points(a,b);
  if (ac >= ab && ac >= bc) return geoCircleFrom2Points(a,c);
  return geoCircleFrom2Points(b,c);
}

/**
 * 点集合を含む最小包含円を返す。
 * 空集合なら null。
 * 固定seedのランダム化増分法。
 * 計算量: 期待 O(N)、最悪 O(N^3)
 */
function geoMinimumEnclosingCircle(points: GeoPoint[]): GeoCircle | null {
  if (points.length == 0) return null;
  let P = points.map(p => [p[0],p[1]] as GeoPoint);
  let seed = 2463534242;
  let randomUint = () => {
    seed ^= seed<<13;
    seed ^= seed>>>17;
    seed ^= seed<<5;
    return seed>>>0;
  };
  for (let i = P.length-1; i > 0; i--) {
    let j = randomUint()%(i+1);
    [P[i],P[j]] = [P[j],P[i]];
  }

  let circle: GeoCircle = {center: [P[0][0],P[0][1]],radius: 0};
  for (let i = 0; i < P.length; i++) {
    if (geoCircleContainsPoint(circle,P[i])) continue;
    circle = {center: [P[i][0],P[i][1]],radius: 0};
    for (let j = 0; j < i; j++) {
      if (geoCircleContainsPoint(circle,P[j])) continue;
      circle = geoCircleFrom2Points(P[i],P[j]);
      for (let k = 0; k < j; k++) {
        if (geoCircleContainsPoint(circle,P[k])) continue;
        circle = geoBoundaryCircle3(P[i],P[j],P[k]);
      }
    }
  }
  return circle;
}

/**
 * 10進小数文字列を 10^digits 倍した bigint に厳密変換する。
 * 例: geoParseFixed("-1.23",4) == -12300n
 * 小数部が digits 桁を超える場合はエラー。
 * 計算量: O(|s|)
 */
function geoParseFixed(s: string, digits: number): bigint {
  if (digits < 0 || !Number.isInteger(digits)) {
    throw new RangeError("digits must be a non-negative integer");
  }
  s = s.trim();
  let sign = 1n;
  if (s.startsWith("-")) {
    sign = -1n;
    s = s.slice(1);
  } else if (s.startsWith("+")) {
    s = s.slice(1);
  }
  let parts = s.split(".");
  if (parts.length > 2) throw new Error("Invalid decimal string");
  let integerPart = parts[0] == "" ? "0" : parts[0];
  let fractionPart = parts.length == 2 ? parts[1] : "";
  if (!/^\d+$/.test(integerPart) || !/^\d*$/.test(fractionPart)) {
    throw new Error("Invalid decimal string");
  }
  if (fractionPart.length > digits) {
    throw new RangeError("Too many fractional digits");
  }
  fractionPart = fractionPart.padEnd(digits,"0");
  let scale = 10n**BigInt(digits);
  let value = BigInt(integerPart)*scale;
  if (fractionPart.length > 0) value += BigInt(fractionPart);
  return sign*value;
}

/**
 * 単純多角形の符号付き面積の2倍を返す。
 * 反時計回りなら正、時計回りなら負。
 * 計算量: O(N)
 */
function geoIntPolygonArea2(poly: GeoIntPoint[]): bigint {
  let n = poly.length;
  let area = 0n;
  for (let i = 0; i < n; i++) {
    area += geoIntCross(poly[i],poly[(i+1)%n]);
  }
  return area;
}

/**
 * 多角形の向きを -1,0,1 で返す。
 * 1: 反時計回り、-1: 時計回り、0: 面積0。
 * 計算量: O(N)
 */
function geoIntPolygonOrientation(poly: GeoIntPoint[]): -1 | 0 | 1 {
  return geoBigIntSign(geoIntPolygonArea2(poly));
}

/**
 * 頂点が周回順に与えられた単純多角形が凸か判定する。
 * strict=true では一直線の連続3点を許さない。
 * 計算量: O(N)
 */
function geoIntIsConvexPolygon(poly: GeoIntPoint[], strict: boolean = true): boolean {
  let n = poly.length;
  if (n < 3) return false;
  let direction = 0;
  for (let i = 0; i < n; i++) {
    let s = geoIntCcw(poly[i],poly[(i+1)%n],poly[(i+2)%n]);
    if (s == 0) {
      if (strict) return false;
      continue;
    }
    if (direction == 0) direction = s;
    else if (direction != s) return false;
  }
  return direction != 0;
}

/**
 * 一般の単純多角形と点 p の位置関係を返す。
 * 頂点は時計回り・反時計回りのどちらでもよい。
 * 計算量: O(N)
 */
function geoIntPointInPolygon(poly: GeoIntPoint[], p: GeoIntPoint): GeoPointLocation {
  let winding = 0;
  for (let i = 0; i < poly.length; i++) {
    let a = poly[i];
    let b = poly[(i+1)%poly.length];
    if (geoIntIsOnSegment(a,b,p)) return "ON";
    if (a[1] <= p[1]) {
      if (p[1] < b[1] && geoIntOrient(a,b,p) > 0n) winding++;
    } else {
      if (b[1] <= p[1] && geoIntOrient(a,b,p) < 0n) winding--;
    }
  }
  return winding == 0 ? "OUT" : "IN";
}

/**
 * 凸多角形と点 p の位置関係を O(log N) で返す。
 * 頂点は周回順で、時計回り・反時計回りのどちらでもよい。
 * 連続する3点が一直線でない凸多角形を想定する。
 * 計算量: O(log N)
 */
function geoIntPointInConvexPolygon(poly: GeoIntPoint[], p: GeoIntPoint): GeoPointLocation {
  let n = poly.length;
  if (n < 3) return geoIntPointInPolygon(poly,p);
  let dir = geoIntPolygonOrientation(poly);
  if (dir == 0) return geoIntPointInPolygon(poly,p);
  let s1 = geoIntCcw(poly[0],poly[1],p)*dir;
  let s2 = geoIntCcw(poly[0],poly[n-1],p)*dir;
  if (s1 < 0 || s2 > 0) return "OUT";
  if (s1 == 0) return geoIntIsOnSegment(poly[0],poly[1],p) ? "ON" : "OUT";
  if (s2 == 0) return geoIntIsOnSegment(poly[0],poly[n-1],p) ? "ON" : "OUT";

  let left = 1;
  let right = n-1;
  while (right-left > 1) {
    let mid = (left+right)>>1;
    if (geoIntCcw(poly[0],poly[mid],p)*dir >= 0) {
      left = mid;
    } else {
      right = mid;
    }
  }
  let side = geoIntCcw(poly[left],poly[(left+1)%n],p)*dir;
  if (side < 0) return "OUT";
  if (side == 0) return "ON";
  return "IN";
}

/**
 * 説明: 整数点をx座標、次にy座標の辞書順で比較する。
 * 使い方: points.sort(geoCompareIntPoint)
 * 計算量: O(1)
 */
function geoCompareIntPoint(a: GeoIntPoint, b: GeoIntPoint): number {
  if (a[0] != b[0]) return a[0] < b[0] ? -1 : 1;
  if (a[1] != b[1]) return a[1] < b[1] ? -1 : 1;
  return 0;
}

/**
 * 点集合の凸包を Andrew の monotone chain で返す。
 * 返り値は反時計回りで、先頭点を末尾に重複させない。
 * includeCollinear=true なら凸包の辺上の点を残す。
 * 計算量: O(N log N)
 */
function geoIntConvexHull(
  points: GeoIntPoint[],
  includeCollinear: boolean = false
): GeoIntPoint[] {
  if (points.length <= 1) return points.map(p => [p[0],p[1]]);
  let sorted = points
    .map(p => [p[0],p[1]] as GeoIntPoint)
    .sort(geoCompareIntPoint);
  let P: GeoIntPoint[] = [];
  for (let p of sorted) {
    if (
      P.length == 0
      || P[P.length-1][0] != p[0]
      || P[P.length-1][1] != p[1]
    ) {
      P.push(p);
    }
  }
  if (P.length <= 2) return P;

  let allCollinear = true;
  for (let i = 2; i < P.length; i++) {
    if (geoIntOrient(P[0],P[1],P[i]) != 0n) {
      allCollinear = false;
      break;
    }
  }
  if (allCollinear) {
    return includeCollinear ? P : [P[0],P[P.length-1]];
  }

  let lower: GeoIntPoint[] = [];
  for (let p of P) {
    while (lower.length >= 2) {
      let cr = geoIntOrient(lower[lower.length-2],lower[lower.length-1],p);
      if (includeCollinear ? cr < 0n : cr <= 0n) lower.pop();
      else break;
    }
    lower.push(p);
  }

  let upper: GeoIntPoint[] = [];
  for (let i = P.length-1; i >= 0; i--) {
    let p = P[i];
    while (upper.length >= 2) {
      let cr = geoIntOrient(upper[upper.length-2],upper[upper.length-1],p);
      if (includeCollinear ? cr < 0n : cr <= 0n) upper.pop();
      else break;
    }
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

/**
 * 整数2点を結ぶ線分の区間数 gcd(|dx|,|dy|) を返す。
 * 線分上の格子点数は geoIntLatticeSteps(a,b)+1。
 * 計算量: O(log C)
 */
function geoIntLatticeSteps(a: GeoIntPoint, b: GeoIntPoint): bigint {
  return geoBigIntGcd(a[0]-b[0],a[1]-b[1]);
}

/**
 * 格子多角形の境界上の格子点数を返す。
 * 計算量: O(N log C)
 */
function geoIntLatticeBoundaryPoints(poly: GeoIntPoint[]): bigint {
  let ans = 0n;
  for (let i = 0; i < poly.length; i++) {
    ans += geoIntLatticeSteps(poly[i],poly[(i+1)%poly.length]);
  }
  return ans;
}

/**
 * Pickの定理で格子多角形の内部格子点数を返す。
 * 単純格子多角形を想定する。
 * 計算量: O(N log C)
 */
function geoIntLatticeInteriorPoints(poly: GeoIntPoint[]): bigint {
  let area2 = geoBigIntAbs(geoIntPolygonArea2(poly));
  let boundary = geoIntLatticeBoundaryPoints(poly);
  return (area2-boundary+2n)/2n;
}

/**
 * 格子多角形の内部または境界上にある格子点数を返す。
 * 計算量: O(N log C)
 */
function geoIntLatticePointsInOrOnPolygon(poly: GeoIntPoint[]): bigint {
  return geoIntLatticeInteriorPoints(poly)+geoIntLatticeBoundaryPoints(poly);
}

type GeoFarthestPairResult = {
  pointA: GeoIntPoint;
  pointB: GeoIntPoint;
  distance2: bigint;
};

/**
 * 凸多角形上の最遠点対を回転キャリパーで求める。
 * 頂点は周回順で与える。時計回りにも対応する。
 * 空配列なら null。
 * 計算量: O(N)
 */
function geoIntFarthestPair(poly: GeoIntPoint[]): GeoFarthestPairResult | null {
  let n = poly.length;
  if (n == 0) return null;
  if (n == 1) {
    return {pointA: poly[0],pointB: poly[0],distance2: 0n};
  }
  if (n == 2) {
    return {pointA: poly[0],pointB: poly[1],distance2: geoIntDistance2(poly[0],poly[1])};
  }

  let area = geoIntPolygonArea2(poly);
  if (area == 0n) {
    let minPoint = poly[0];
    let maxPoint = poly[0];
    for (let p of poly) {
      if (geoCompareIntPoint(p,minPoint) < 0) minPoint = p;
      if (geoCompareIntPoint(p,maxPoint) > 0) maxPoint = p;
    }
    return {
      pointA: minPoint,
      pointB: maxPoint,
      distance2: geoIntDistance2(minPoint,maxPoint)
    };
  }

  let P = area > 0n ? poly : [...poly].reverse();
  let bestA = P[0];
  let bestB = P[1];
  let best = geoIntDistance2(bestA,bestB);
  let update = (a: GeoIntPoint, b: GeoIntPoint) => {
    let d = geoIntDistance2(a,b);
    if (d > best) {
      best = d;
      bestA = a;
      bestB = b;
    }
  };

  let j = 1;
  for (let i = 0; i < n; i++) {
    let ni = (i+1)%n;
    let edge = geoIntPointSub(P[ni],P[i]);
    let startJ = j;
    while (true) {
      update(P[i],P[j]);
      update(P[ni],P[j]);
      let nj = (j+1)%n;
      let current = geoIntCross(
        edge,
        geoIntPointSub(P[j],P[i])
      );
      let next = geoIntCross(
        edge,
        geoIntPointSub(P[nj],P[i])
      );
      if (next < current || nj == startJ) break;
      j = nj;
    }
  }
  return {pointA: bestA,pointB: bestB,distance2: best};
}

/**
 * 凸多角形の直径の2乗を返す。
 * 空配列では0。
 * 計算量: O(N)
 */
function geoIntConvexDiameter2(poly: GeoIntPoint[]): bigint {
  return geoIntFarthestPair(poly)?.distance2 ?? 0n;
}

/**
 * 説明:
 *   AHC用の経過時間タイマー。
 *   C++テンプレートの Timer と同じAPIで使える。
 *   elapsed()/over()/progress() は秒、elapsedMs() はミリ秒を扱う。
 *
 * 使い方:
 *   let timer = new Timer();
 *   timer.reset();
 *
 *   if (timer.over(1.9)) break;
 *   let sec = timer.elapsed();
 *   let rate = timer.progress(1.9); // 0.0 ～ 1.0
 *
 * 注意:
 *   探索ループで毎回時間を確認すると少し重いので、
 *   (iter&1023) == 0 のように数百～数千回ごとに確認するとよい。
 */
class Timer {
  private startTime = 0;

  constructor() {
    this.reset();
  }

  /**
   * 説明: 計測開始時刻を現在時刻に戻す。
   * 使い方: timer.reset()
   * 計算量: O(1)
   */
  reset(): void {
    this.startTime = Date.now();
  }

  /**
   * 説明: reset() からの経過時間を秒で返す。
   * 使い方: let sec = timer.elapsed()
   * 計算量: O(1)
   */
  elapsed(): number {
    return (Date.now()-this.startTime)/1000;
  }

  /**
   * 説明: reset() からの経過時間をミリ秒で返す。
   * 使い方: let ms = timer.elapsedMs()
   * 計算量: O(1)
   */
  elapsedMs(): number {
    return Date.now()-this.startTime;
  }

  /**
   * 説明: 経過時間が limit 秒以上なら true を返す。
   * 使い方: if (timer.over(1.9)) break
   * 計算量: O(1)
   */
  over(limit: number): boolean {
    return this.elapsed() >= limit;
  }

  /**
   * 説明: limit 秒に対する時間進捗を 0.0 ～ 1.0 で返す。
   * 使い方: let rate = timer.progress(1.9)
   * 計算量: O(1)
   */
  progress(limit: number): number {
    if (limit <= 0) return 1;
    return Math.min(1,this.elapsed()/limit);
  }
}

/**
 * 説明:
 *   AHC用の高速な疑似乱数生成器。
 *   C++テンプレートの RNG とほぼ同じAPIで使える。
 *   固定seedを指定すれば、TypeScript内では毎回同じ乱数列を再現できる。
 *
 * 使い方:
 *   let rng = new RNG(123456789);
 *
 *   let x = rng.nextInt(10);       // [0,10)
 *   let y = rng.nextInt(3,10);     // [3,10)
 *   let z = rng.nextDouble();      // [0,1)
 *   let w = rng.nextDouble(2,5);   // [2,5)
 *   let ok = rng.nextBool(0.3);    // 確率0.3でtrue
 *   rng.shuffle(A);                // 配列をシャッフル
 *
 * 注意:
 *   TypeScript版は速度重視の32bit xorshift、
 *   C++版はxorshift64*を使っている。
 *   そのため同じseedでもTypeScriptとC++で乱数列そのものは一致しない。
 *   通常の比較実験では固定seedを推奨する。
 */
class RNG {
  private x: number;

  constructor(seed: number = 123456789) {
    this.x = seed>>>0;
    if (this.x == 0) this.x = 0x9e3779b9;
  }

  /**
   * 説明: 内部用の32bit符号なし乱数を返す。
   * 計算量: O(1)
   */
  private nextU32(): number {
    let x = this.x;
    x ^= x<<13;
    x ^= x>>>17;
    x ^= x<<5;
    this.x = x>>>0;
    return this.x;
  }

  /**
   * 説明:
   *   nextInt(n) は [0,n) の整数を返す。
   *   nextInt(l,r) は [l,r) の整数を返す。
   *
   * 使い方:
   *   let x = rng.nextInt(N);
   *   let y = rng.nextInt(L,R);
   *
   * 計算量: O(1)
   */
  nextInt(n: number): number;
  nextInt(l: number, r: number): number;
  nextInt(a: number, b?: number): number {
    if (b === undefined) {
      if (!(0 < a)) throw new RangeError("n must be positive");
      return Math.floor(this.nextU32()*a/4294967296);
    }
    if (!(a < b)) throw new RangeError("l must be less than r");
    return a+this.nextInt(b-a);
  }

  /**
   * 説明: [l,r) の整数を返す。C++テンプレートの nextLL に対応する。
   * 使い方: let x = rng.nextLL(L,R)
   * 計算量: O(1)
   *
   * 注意:
   *   TypeScriptのnumberで正確に扱える整数範囲内で使用する。
   */
  nextLL(l: number, r: number): number {
    if (!(l < r)) throw new RangeError("l must be less than r");
    return l+Math.floor(this.nextDouble()*(r-l));
  }

  /**
   * 説明:
   *   nextDouble() は [0,1) の実数を返す。
   *   nextDouble(l,r) は [l,r) の実数を返す。
   *
   * 使い方:
   *   let x = rng.nextDouble();
   *   let y = rng.nextDouble(L,R);
   *
   * 計算量: O(1)
   */
  nextDouble(): number;
  nextDouble(l: number, r: number): number;
  nextDouble(l?: number, r?: number): number {
    // AHCの採用判定や近傍選択では32bit乱数で十分。
    let x = this.nextU32()/4294967296;
    if (l === undefined) return x;
    return l+(r!-l)*x;
  }

  /**
   * 説明:
   *   nextBool() は約1/2の確率でtrueを返す。
   *   nextBool(p) は確率pでtrueを返す。
   *
   * 使い方:
   *   if (rng.nextBool()) { ... }
   *   if (rng.nextBool(0.2)) { ... }
   *
   * 計算量: O(1)
   */
  nextBool(): boolean;
  nextBool(p: number): boolean;
  nextBool(p?: number): boolean {
    if (p === undefined) return (this.nextU32()&1) == 1;
    return this.nextDouble() < p;
  }

  /**
   * 説明: 配列をFisher-Yates法でランダムに並べ替える。
   * 使い方: rng.shuffle(A)
   * 計算量: O(N)
   */
  shuffle<T>(a: T[]): void {
    for (let i = a.length-1; 0 < i; i--) {
      let j = this.nextInt(i+1);
      [a[i],a[j]] = [a[j],a[i]];
    }
  }
}

/**
 * 説明:
 *   現在時刻から毎回異なるseedを作る。
 *   ローカルで複数回実行して探索結果を変えたいときに使う。
 *
 * 使い方:
 *   let rng = new RNG(seedFromClock());
 *
 * 注意:
 *   同じ条件での比較がしにくくなるため、
 *   通常のパラメータ調整や性能比較では固定seedを推奨する。
 *
 * 計算量: O(1)
 */
function seedFromClock(): number {
  let x = Date.now()>>>0;
  x ^= x<<13;
  x ^= x>>>17;
  x ^= x<<5;
  return x>>>0;
}

/**
 * 説明:
 *   焼きなまし用の温度計算と採用判定をまとめたクラス。
 *   C++テンプレートの Annealing と同じAPIで使える。
 *
 *   最大化問題では acceptMax(delta,temp,rng)、
 *   最小化問題では acceptMin(delta,temp,rng) を使う。
 *
 * 使い方:
 *   let timer = new Timer();
 *   let rng = new RNG(123456789);
 *   let sa = new Annealing(1000,1,true);
 *   let TIME_LIMIT = 1.9;
 *
 *   for (let iter = 0; ; iter++) {
 *     if ((iter&1023) == 0 && timer.over(TIME_LIMIT)) break;
 *
 *     let progress = timer.progress(TIME_LIMIT);
 *     let temp = sa.temperature(progress);
 *     let delta = newScore-score;
 *
 *     if (sa.acceptMax(delta,temp,rng)) {
 *       score = newScore;
 *     }
 *   }
 *
 * 注意:
 *   geometric=true のときは幾何温度、false のときは線形温度になる。
 *   幾何温度を使う場合は startTemp,endTemp をともに正にする。
 */
class Annealing {
  constructor(
    public startTemp: number,
    public endTemp: number,
    public geometric: boolean = false
  ) {}

  /**
   * 説明: 時間進捗 progress に対応する温度を返す。
   * 使い方: let temp = sa.temperature(timer.progress(TIME_LIMIT))
   * 計算量: O(1)
   */
  temperature(progress: number): number {
    progress = Math.max(0,Math.min(1,progress));
    if (this.geometric && 0 < this.startTemp && 0 < this.endTemp) {
      return this.startTemp*Math.pow(this.endTemp/this.startTemp,progress);
    }
    return this.startTemp+(this.endTemp-this.startTemp)*progress;
  }

  /**
   * 説明:
   *   最大化問題の採用判定。
   *   delta>=0 は必ず採用し、delta<0 は exp(delta/temp) の確率で採用する。
   *
   * 使い方:
   *   if (sa.acceptMax(newScore-score,temp,rng)) { ... }
   *
   * 計算量: O(1)
   */
  acceptMax(delta: number, temp: number, rng: RNG): boolean {
    if (0 <= delta) return true;
    if (temp <= 0) return false;
    return rng.nextDouble() < Math.exp(delta/temp);
  }

  /**
   * 説明:
   *   最小化問題の採用判定。
   *   delta = newScore-oldScore として渡す。
   *
   * 使い方:
   *   if (sa.acceptMin(newScore-score,temp,rng)) { ... }
   *
   * 計算量: O(1)
   */
  acceptMin(delta: number, temp: number, rng: RNG): boolean {
    return this.acceptMax(-delta,temp,rng);
  }
}

// end

function readInput() {
  const g = globalThis as any;

  // Deno
  if (typeof g.Deno !== "undefined") {
    const chunks: Uint8Array[] = [];
    const buf = new Uint8Array(1 << 16);

    while (true) {
      const n = g.Deno.stdin.readSync(buf) as number | null;
      if (n === null) break;
      if (n > 0) chunks.push(buf.slice(0, n));
    }

    const length = chunks.reduce((s, c) => s + c.length, 0);
    const bytes = new Uint8Array(length);

    let offset = 0;
    for (const c of chunks) {
      bytes.set(c, offset);
      offset += c.length;
    }

    return new TextDecoder().decode(bytes);
  }

  // Node.js / Bun
  return fs.readFileSync(0, "utf8");
}

inputs = readInput();
inputArray = inputs.trim().split(/\s+/);
main();
flush();

/**
 * https://github.com/occhanCode/atcoder-templates/blob/main/src/main.ts
 */
