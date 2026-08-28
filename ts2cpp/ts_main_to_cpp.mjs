#!/usr/bin/env node

/**
 * AtCoder-oriented TypeScript main() -> C++17 converter, AST edition v32.
 *
 * Design goal:
 *   - Parse TypeScript with the official TypeScript parser.
 *   - Convert the user's competitive-programming main() rather than doing line regex rewriting.
 *   - Prefer valid, idiomatic C++17 and emit explicit warnings for semantics that cannot be proven.
 *
 * Usage:
 *   node ts_main_to_cpp_v32.mjs input.ts > main.cpp
 *   node ts_main_to_cpp_v32.mjs input.ts -o main.cpp --warnings
 *   cat input.ts | node ts_main_to_cpp_v32.mjs > main.cpp
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import { execSync, spawnSync } from 'node:child_process';
import os from 'node:os';

const require = createRequire(import.meta.url);
let ts;
try {
  ts = require('typescript');
} catch {
  try {
    const root = execSync('npm root -g', {encoding:'utf8'}).trim();
    ts = require(path.join(root, 'typescript'));
  } catch {
    console.error('TypeScript package was not found. Install it with: npm i -D typescript');
    process.exit(2);
  }
}

const NUM = 'll';

function parseArgs(argv) {
  const r = { input:null, output:null, warnings:false, strict:false, check:false, deps:true, doubleNames:[], stats:false, cppTemplate:null, mode:'full' };
  for (let i=0;i<argv.length;i++) {
    const a=argv[i];
    if (a==='-o' || a==='--output') r.output=argv[++i];
    else if (a==='--warnings') r.warnings=true;
    else if (a==='--strict') r.strict=true;
    else if (a==='--check') r.check=true;
    else if (a==='--stats') r.stats=true;
    else if (a==='--cpp-template') r.cppTemplate=argv[++i];
    else if (a==='--deps') r.deps=true;
    else if (a==='--no-deps') r.deps=false;
    else if (a==='--version') { console.log('ts_main_to_cpp_v32 32.0.0'); process.exit(0); }
    else if (a==='--double') {
      const v=argv[++i]; if (!v) throw new Error('--double requires a variable name or comma-separated names');
      r.doubleNames.push(...v.split(',').map(x=>x.trim()).filter(Boolean));
    }
    else if (a==='--main-only') r.mode='main';
    else if (a==='--body-only') r.mode='body';
    else if (a==='-h' || a==='--help') {
      console.log('Usage: node ts_main_to_cpp_v32.mjs [input.ts] [-o output.cpp] [--deps|--no-deps] [--double p,q] [--warnings] [--strict] [--check] [--stats] [--cpp-template template.cpp] [--main-only|--body-only]');
      process.exit(0);
    } else if (!r.input) r.input=a;
    else throw new Error(`Unknown argument: ${a}`);
  }
  return r;
}

function indent(s, n=1) {
  const p='  '.repeat(n);
  return s.split('\n').map(x => x ? p+x : x).join('\n');
}

function cppStringLiteral(text) {
  return JSON.stringify(text).replace(/\\u2028|\\u2029/g, '');
}

class TypeInfo {
  constructor(kind, opt={}) { this.kind=kind; Object.assign(this,opt); }
  static unknown(){ return new TypeInfo('unknown'); }
  static number(){ return new TypeInfo('number'); }
  static u64(){ return new TypeInfo('u64'); }
  static real(){ return new TypeInfo('real'); }
  static char(){ return new TypeInfo('char'); }
  static tuple(elems=[]){ return new TypeInfo('tuple',{elems}); }
  static bool(){ return new TypeInfo('bool'); }
  static string(){ return new TypeInfo('string'); }
  static vector(elem=TypeInfo.unknown()){ return new TypeInfo('vector',{elem}); }
  static array(elem=TypeInfo.unknown(), size=null){ return new TypeInfo('array',{elem,size}); }
  static set(elem=TypeInfo.unknown()){ return new TypeInfo('set',{elem}); }
  static map(key=TypeInfo.unknown(), value=TypeInfo.unknown()){ return new TypeInfo('map',{key,value}); }
  static custom(name,opt={}){ return new TypeInfo('custom',{name,...opt}); }
}


function sameType(a,b) {
  if (!a || !b || a.kind!==b.kind) return false;
  if (['number','u64','real','char','bool','string','unknown'].includes(a.kind)) return true;
  if (a.kind==='custom') return a.name===b.name && (a.name!=='PriorityQueue' || sameType(a.elem,b.elem));
  if (a.kind==='vector' || a.kind==='set') return sameType(a.elem,b.elem);
  if (a.kind==='array') return a.size===b.size && sameType(a.elem,b.elem);
  if (a.kind==='map') return sameType(a.key,b.key)&&sameType(a.value,b.value);
  if (a.kind==='tuple') return a.elems.length===b.elems.length && a.elems.every((x,i)=>sameType(x,b.elems[i]));
  return false;
}

function mergeType(a,b) {
  if (!a || a.kind==='unknown') return b || TypeInfo.unknown();
  if (!b || b.kind==='unknown') return a;
  if (sameType(a,b)) return a;
  if ((a.kind==='number'&&b.kind==='real')||(a.kind==='real'&&b.kind==='number')) return TypeInfo.real();
  if ((a.kind==='number'&&b.kind==='u64')||(a.kind==='u64'&&b.kind==='number')) return TypeInfo.u64();
  if ((a.kind==='array'||a.kind==='vector') && (b.kind==='array'||b.kind==='vector')) {
    return TypeInfo.vector(mergeType(a.elem,b.elem));
  }
  return TypeInfo.unknown();
}

function typeToCpp(t) {
  if (!t) return 'auto';
  switch(t.kind) {
    case 'number': return NUM;
    case 'u64': return 'uint64_t';
    case 'real': return 'double';
    case 'char': return 'char';
    case 'tuple': return `tuple<${t.elems.map(typeToCpp).join(',')}>`;
    case 'bool': return 'bool';
    case 'string': return 'string';
    case 'vector': return `vector<${typeToCpp(t.elem)}>`;
    case 'array': return t.size==null ? `vector<${typeToCpp(t.elem)}>` : `array<${typeToCpp(t.elem)},${t.size}>`;
    case 'set': return `set<${typeToCpp(t.elem)}>`;
    case 'map': return `map<${typeToCpp(t.key)},${typeToCpp(t.value)}>`;
    case 'custom': return t.name;
    default: return 'auto';
  }
}

function promoteNumericToReal(t) {
  if (!t) return t;
  if (t.kind==='number') return TypeInfo.real();
  if (t.kind==='vector') return TypeInfo.vector(promoteNumericToReal(t.elem));
  if (t.kind==='array') return TypeInfo.array(promoteNumericToReal(t.elem),t.size);
  if (t.kind==='tuple') return TypeInfo.tuple(t.elems.map(promoteNumericToReal));
  if (t.kind==='set') return TypeInfo.set(promoteNumericToReal(t.elem));
  if (t.kind==='map') return TypeInfo.map(promoteNumericToReal(t.key),promoteNumericToReal(t.value));
  return t;
}

function promoteNumericToU64(t) {
  if (!t) return t;
  if (t.kind==='number') return TypeInfo.u64();
  if (t.kind==='vector') return TypeInfo.vector(promoteNumericToU64(t.elem));
  if (t.kind==='array') return TypeInfo.array(promoteNumericToU64(t.elem),t.size);
  if (t.kind==='tuple') return TypeInfo.tuple(t.elems.map(promoteNumericToU64));
  if (t.kind==='set') return TypeInfo.set(promoteNumericToU64(t.elem));
  if (t.kind==='map') return TypeInfo.map(promoteNumericToU64(t.key),promoteNumericToU64(t.value));
  return t;
}

class Converter {
  constructor(sourceText, fileName='input.ts', options={}) {
    this.sourceText=sourceText;
    this.options=options;
    this.templateCaps=options.templateCaps||{};
    this.doubleNames=new Set(options.doubleNames||[]);
    this.deps=!!options.deps;
    this.labelEnds=[];
    const parseSf=ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const compilerOptions={target:ts.ScriptTarget.Latest,noLib:true};
    const baseHost=ts.createCompilerHost(compilerOptions);
    const host={
      ...baseHost,
      getSourceFile:(f)=>f===fileName?parseSf:undefined,
      fileExists:(f)=>f===fileName,
      readFile:(f)=>f===fileName?sourceText:undefined,
      writeFile:()=>{}
    };
    this.program=ts.createProgram([fileName],compilerOptions,host);
    this.sf=this.program.getSourceFile(fileName)||parseSf;
    this.checker=this.program.getTypeChecker();
    this.env=new Map();
    this.warnings=[];
    this.tmpId=0;
    this.inMainBody=false;
    this.returnExpected=TypeInfo.unknown();
    this.needHelpers=new Set();
    this.tupleWidths=this.collectTupleWidths();
    this.topLevelDefs=this.collectTopLevelDefs();
    this.realVars=new Set(this.doubleNames);
    this.realSymbols=new Set();
    this.realSymbolKeys=new Set();
    this.u64Vars=new Set();
    this.u64Symbols=new Set();
    this.u64SymbolKeys=new Set();
    this.analyzeRealFlow();
    this.analyzeU64Flow();
  }

  rootIdentifierNode(node) {
    let n=node;
    while (ts.isElementAccessExpression(n) || ts.isPropertyAccessExpression(n) || ts.isParenthesizedExpression(n)) n=n.expression;
    return ts.isIdentifier(n)?n:null;
  }

  rootIdentifier(node) {
    const n=this.rootIdentifierNode(node);
    return n?n.text:null;
  }

  symbolOf(node) {
    const id=this.rootIdentifierNode(node);
    return id?this.checker.getSymbolAtLocation(id):null;
  }

  // TypeScript checker の Symbol オブジェクト同一性に依存しない安定キー。
  // ローカルの TypeScript バージョン差があっても、同じ宣言なら同じキーになる。
  symbolKey(sym) {
    if (!sym) return null;
    const ds=sym.declarations||[];
    if (ds.length) {
      const d=ds[0];
      const sf=d.getSourceFile?.();
      return `${sf?.fileName||''}:${d.pos}:${d.end}`;
    }
    return null;
  }

  isRealIdentifier(node) {
    const id=this.rootIdentifierNode(node);
    if (!id) return false;
    if (this.doubleNames.has(id.text)) return true;
    const sym=this.checker.getSymbolAtLocation(id);
    const key=this.symbolKey(sym);
    if (sym && this.realSymbols.has(sym)) return true;
    if (key && this.realSymbolKeys.has(key)) return true;
    return !sym && this.realVars.has(id.text);
  }

  markReal(node) {
    const id=this.rootIdentifierNode(node);
    if (!id) return false;
    const sym=this.checker.getSymbolAtLocation(id);
    const key=this.symbolKey(sym);
    if (sym) {
      let changed=false;
      if (!this.realSymbols.has(sym)) { this.realSymbols.add(sym); changed=true; }
      if (key && !this.realSymbolKeys.has(key)) { this.realSymbolKeys.add(key); changed=true; }
      return changed;
    }
    if (this.realVars.has(id.text)) return false;
    this.realVars.add(id.text);
    return true;
  }

  exprUsesReal(node) {
    if (!node) return false;
    if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isTypeAssertionExpression(node) || ts.isNonNullExpression(node)) return this.exprUsesReal(node.expression);
    if (ts.isNumericLiteral(node)) return /[.eE]/.test(node.getText(this.sf));
    if (ts.isIdentifier(node)) return this.isRealIdentifier(node);
    if (ts.isElementAccessExpression(node) || ts.isPropertyAccessExpression(node)) {
      if (this.isRealIdentifier(node)) return true;
      return this.exprUsesReal(node.expression);
    }
    if (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) return this.exprUsesReal(node.operand);
    if (ts.isConditionalExpression(node)) return this.exprUsesReal(node.whenTrue)||this.exprUsesReal(node.whenFalse);
    if (ts.isBinaryExpression(node)) {
      // TypeScript / is floating-point division. intDiv() is the explicit integer-division helper.
      if (node.operatorToken.kind===ts.SyntaxKind.SlashToken || node.operatorToken.kind===ts.SyntaxKind.SlashEqualsToken) return true;
      return this.exprUsesReal(node.left)||this.exprUsesReal(node.right);
    }
    if (ts.isCallExpression(node)) {
      if (ts.isPropertyAccessExpression(node.expression) && node.expression.expression.getText(this.sf)==='Math') {
        const name=node.expression.name.text;
        if (['floor','ceil','round','trunc','clz32','sign'].includes(name)) return false;
        if (name==='min'||name==='max') return node.arguments.some(a=>this.exprUsesReal(a));
        return true;
      }
      // A real argument does not imply a real return value.  In v21, calls such as
      // lnsMinimizeUntil(state,timer,1.85,...) incorrectly promoted the whole result
      // object, and then result.bestState could contaminate vector<ll> into vector<double>.
      return this.inferExpr(node).kind==='real';
    }
    if (ts.isArrayLiteralExpression(node)) return node.elements.some(e=>this.exprUsesReal(e));
    return false;
  }

  analyzeRealFlow() {
    const assignOps=new Set([
      ts.SyntaxKind.EqualsToken,ts.SyntaxKind.PlusEqualsToken,ts.SyntaxKind.MinusEqualsToken,
      ts.SyntaxKind.AsteriskEqualsToken,ts.SyntaxKind.SlashEqualsToken,ts.SyntaxKind.PercentEqualsToken
    ]);
    // Scope-aware fixed-point flow analysis. Symbols, rather than identifier text,
    // keep unrelated variables named pos/np/q from contaminating each other's types.
    for (let pass=0;pass<16;pass++) {
      let changed=false;
      const mark=(node)=>{ if(node && this.markReal(node)) changed=true; };
      const visit=(n)=>{
        if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer && this.exprUsesReal(n.initializer)) mark(n.name);
        if (ts.isBinaryExpression(n) && assignOps.has(n.operatorToken.kind)) {
          if (this.exprUsesReal(n.right) || n.operatorToken.kind===ts.SyntaxKind.SlashEqualsToken) mark(n.left);
          // Propagate container aliases both ways only for plain identifiers.
          // Do not infer x as double merely because doubleArray[i] = x.
          if (n.operatorToken.kind===ts.SyntaxKind.EqualsToken && ts.isIdentifier(n.left) && ts.isIdentifier(n.right) && this.exprUsesReal(n.left)) mark(n.right);
        }
        if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text==='push') {
          if (n.arguments.some(a=>this.exprUsesReal(a))) mark(n.expression.expression);
        }
        ts.forEachChild(n,visit);
      };
      const main=this.findMain();
      if (main?.body) visit(main.body);
      if (!changed) break;
    }
  }

  applyRealPromotion(name,t,node=null) {
    const real=node?this.isRealIdentifier(node):this.realVars.has(name);
    return real?promoteNumericToReal(t):t;
  }

  isU64Identifier(node) {
    const id=this.rootIdentifierNode(node);
    if (!id) return false;
    const sym=this.checker.getSymbolAtLocation(id);
    const key=this.symbolKey(sym);
    if (sym && this.u64Symbols.has(sym)) return true;
    if (key && this.u64SymbolKeys.has(key)) return true;
    return !sym && this.u64Vars.has(id.text);
  }

  markU64(node) {
    const id=this.rootIdentifierNode(node);
    if (!id) return false;
    const sym=this.checker.getSymbolAtLocation(id);
    const key=this.symbolKey(sym);
    if (sym) {
      let changed=false;
      if (!this.u64Symbols.has(sym)) { this.u64Symbols.add(sym); changed=true; }
      if (key && !this.u64SymbolKeys.has(key)) { this.u64SymbolKeys.add(key); changed=true; }
      return changed;
    }
    if (this.u64Vars.has(id.text)) return false;
    this.u64Vars.add(id.text);
    return true;
  }

  isZobristObject(node) {
    const id=this.rootIdentifierNode(node);
    if (!id) return false;
    const sym=this.checker.getSymbolAtLocation(id);
    if (!sym) return false;
    for (const d of sym.declarations||[]) {
      if (ts.isVariableDeclaration(d) && d.initializer && ts.isNewExpression(d.initializer) && d.initializer.expression.getText(this.sf)==='ZobristHash') return true;
    }
    return false;
  }

  exprUsesU64(node) {
    if (!node) return false;
    if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isTypeAssertionExpression(node) || ts.isNonNullExpression(node)) return this.exprUsesU64(node.expression);
    if (ts.isIdentifier(node) || ts.isElementAccessExpression(node) || ts.isPropertyAccessExpression(node)) {
      if (this.isU64Identifier(node)) return true;
      if (ts.isElementAccessExpression(node) || ts.isPropertyAccessExpression(node)) return this.exprUsesU64(node.expression);
      return false;
    }
    if (ts.isBinaryExpression(node)) return this.exprUsesU64(node.left)||this.exprUsesU64(node.right);
    if (ts.isConditionalExpression(node)) return this.exprUsesU64(node.whenTrue)||this.exprUsesU64(node.whenFalse);
    if (ts.isCallExpression(node)) {
      if (ts.isPropertyAccessExpression(node.expression)) {
        const name=node.expression.name.text;
        const obj=node.expression.expression;
        if (this.isZobristObject(obj) && ['value','changed','toggled'].includes(name)) return true;
      }
      return node.arguments.some(a=>this.exprUsesU64(a));
    }
    if (ts.isArrayLiteralExpression(node)) return node.elements.some(e=>this.exprUsesU64(e));
    return false;
  }

  analyzeU64Flow() {
    const assignOps=new Set([
      ts.SyntaxKind.EqualsToken,ts.SyntaxKind.CaretEqualsToken,ts.SyntaxKind.BarEqualsToken,ts.SyntaxKind.AmpersandEqualsToken
    ]);
    for (let pass=0;pass<16;pass++) {
      let changed=false;
      const mark=(node)=>{ if(node && this.markU64(node)) changed=true; };
      const visit=(n)=>{
        if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer && this.exprUsesU64(n.initializer)) mark(n.name);
        if (ts.isBinaryExpression(n) && assignOps.has(n.operatorToken.kind) && this.exprUsesU64(n.right)) mark(n.left);
        if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text==='push') {
          if (n.arguments.some(a=>this.exprUsesU64(a))) mark(n.expression.expression);
        }
        ts.forEachChild(n,visit);
      };
      const main=this.findMain();
      if (main?.body) visit(main.body);
      if (!changed) break;
    }
  }

  applyU64Promotion(name,t,node=null) {
    const isU64=node?this.isU64Identifier(node):this.u64Vars.has(name);
    return isU64?promoteNumericToU64(t):t;
  }

  collectTopLevelDefs() {
    const defs=new Map();
    for (const st of this.sf.statements) {
      if (ts.isVariableStatement(st)) {
        for (const d of st.declarationList.declarations) {
          if (ts.isIdentifier(d.name)) defs.set(d.name.text,{kind:'var',statement:st,decl:d});
        }
      } else if (ts.isFunctionDeclaration(st) && st.name && st.body) {
        defs.set(st.name.text,{kind:'function',statement:st});
      } else if (ts.isClassDeclaration(st) && st.name) {
        defs.set(st.name.text,{kind:'class',statement:st});
      } else if ((ts.isTypeAliasDeclaration(st)||ts.isInterfaceDeclaration(st)) && st.name) {
        defs.set(st.name.text,{kind:'type',statement:st});
      }
    }
    return defs;
  }

  identifiersIn(node) {
    const out=new Set();
    const visit=(n)=>{
      if (ts.isIdentifier(n)) out.add(n.text);
      ts.forEachChild(n,visit);
    };
    visit(node);
    return out;
  }

  dependencyDefs(main) {
    if (!this.deps || !main) return [];
    const builtin=new Set([
      'main','next','nextNum','nextNums','nextBigInt','nextBigInts','nexts','nextAwait',
      'print','println','flush','intDiv','lowerBound','upperBound','builtin_popcount',
      'Math','Number','BigInt','String','Array','Set','Map','console','Infinity',
      'true','false','undefined','less','greater',
      // AHC runtime is provided natively on the C++ side.
      'Timer','RNG','Annealing','MonteCarlo','BeamSearch','ZobristHash','seedFromClock'
    ]);
    const wanted=new Set();
    const q=[...this.identifiersIn(main.body)];
    while (q.length) {
      const name=q.pop();
      if (builtin.has(name) || wanted.has(name) || !this.topLevelDefs.has(name)) continue;
      wanted.add(name);
      const def=this.topLevelDefs.get(name);
      for (const id of this.identifiersIn(def.statement)) {
        if (!builtin.has(id) && !wanted.has(id) && this.topLevelDefs.has(id)) q.push(id);
      }
    }
    const result=[];
    const seen=new Set();
    for (const st of this.sf.statements) {
      let include=false;
      if (ts.isVariableStatement(st)) {
        include=st.declarationList.declarations.some(d=>ts.isIdentifier(d.name)&&wanted.has(d.name.text));
      } else if ((ts.isFunctionDeclaration(st)||ts.isClassDeclaration(st)||ts.isTypeAliasDeclaration(st)||ts.isInterfaceDeclaration(st)) && st.name) {
        include=wanted.has(st.name.text);
      }
      if (include && !seen.has(st)) { seen.add(st); result.push(st); }
    }
    return result;
  }

  collectTupleWidths() {
    const widths=new Map();
    const visit=(node)=>{
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text==='push' && ts.isIdentifier(node.expression.expression) && node.arguments.length===1 && ts.isArrayLiteralExpression(node.arguments[0])) {
        const name=node.expression.expression.text;
        const k=node.arguments[0].elements.length;
        if (!widths.has(name)) widths.set(name,new Set());
        widths.get(name).add(k);
      }
      ts.forEachChild(node,visit);
    };
    visit(this.sf);
    const out=new Map();
    for (const [k,ws] of widths) if (ws.size===1) out.set(k,[...ws][0]);
    return out;
  }

  warn(node,msg) {
    const pos=this.sf.getLineAndCharacterOfPosition(node.getStart(this.sf));
    this.warnings.push(`L${pos.line+1}:${pos.character+1} ${msg}`);
  }

  findMain() {
    for (const st of this.sf.statements) {
      if (ts.isFunctionDeclaration(st) && st.name?.text==='main' && st.body) return st;
    }
    return null;
  }

  typeFromTypeNode(node) {
    if (!node) return TypeInfo.unknown();
    switch(node.kind) {
      case ts.SyntaxKind.NumberKeyword:
      case ts.SyntaxKind.BigIntKeyword: return TypeInfo.number();
      case ts.SyntaxKind.BooleanKeyword: return TypeInfo.bool();
      case ts.SyntaxKind.StringKeyword: return TypeInfo.string();
    }
    if (ts.isArrayTypeNode(node)) return TypeInfo.vector(this.typeFromTypeNode(node.elementType));
    if (ts.isTupleTypeNode(node)) {
      const elems=node.elements.map(e=>this.typeFromTypeNode(e));
      let merged=TypeInfo.unknown();
      for (const e of elems) merged=mergeType(merged,e);
      return merged.kind==='unknown' ? TypeInfo.tuple(elems) : TypeInfo.array(merged,node.elements.length);
    }
    if (ts.isTypeReferenceNode(node)) {
      const name=node.typeName.getText(this.sf);
      const args=node.typeArguments||[];
      if (name==='Array' || name==='ReadonlyArray') return TypeInfo.vector(this.typeFromTypeNode(args[0]));
      if (name==='Float32Array' || name==='Float64Array') return TypeInfo.vector(TypeInfo.real());
      if (['Int8Array','Int16Array','Int32Array','Uint8Array','Uint8ClampedArray','Uint16Array','Uint32Array','BigInt64Array','BigUint64Array'].includes(name)) return TypeInfo.vector(TypeInfo.number());
      if (name==='Set') return TypeInfo.set(this.typeFromTypeNode(args[0]));
      if (name==='Map') return TypeInfo.map(this.typeFromTypeNode(args[0]),this.typeFromTypeNode(args[1]));
    }
    return TypeInfo.unknown();
  }

  inferExpr(node) {
    if (ts.isAwaitExpression(node)) return this.inferExpr(node.expression);
    if (!node) return TypeInfo.unknown();
    if (ts.isParenthesizedExpression(node)) return this.inferExpr(node.expression);
    if (ts.isNumericLiteral(node)) return /[.eE]/.test(node.getText(this.sf))?TypeInfo.real():TypeInfo.number();
    if (ts.isBigIntLiteral(node)) return TypeInfo.number();
    if (node.kind===ts.SyntaxKind.TrueKeyword || node.kind===ts.SyntaxKind.FalseKeyword) return TypeInfo.bool();
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)) return TypeInfo.string();
    if (ts.isIdentifier(node)) {
      const t=this.env.get(node.text) || TypeInfo.unknown();
      return this.isU64Identifier(node)?promoteNumericToU64(t):t;
    }
    if (ts.isArrayLiteralExpression(node)) {
      const es=node.elements.map(x=>this.inferExpr(x));
      let e=TypeInfo.unknown();
      for (const x of es) e=mergeType(e,x);
      // A heterogeneous TS array used as a fixed record/queue item maps naturally to std::tuple.
      if (es.length && e.kind==='unknown' && es.some(x=>x.kind!=='unknown')) return TypeInfo.tuple(es);
      return TypeInfo.array(e,node.elements.length);
    }
    if (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) return this.inferExpr(node.operand);
    if (ts.isBinaryExpression(node)) {
      const op=node.operatorToken.kind;
      if ([ts.SyntaxKind.EqualsEqualsToken,ts.SyntaxKind.EqualsEqualsEqualsToken,ts.SyntaxKind.ExclamationEqualsToken,ts.SyntaxKind.ExclamationEqualsEqualsToken,
           ts.SyntaxKind.LessThanToken,ts.SyntaxKind.LessThanEqualsToken,ts.SyntaxKind.GreaterThanToken,ts.SyntaxKind.GreaterThanEqualsToken,
           ts.SyntaxKind.AmpersandAmpersandToken,ts.SyntaxKind.BarBarToken].includes(op)) return TypeInfo.bool();
      const lt=this.inferExpr(node.left), rt=this.inferExpr(node.right);
      // In TypeScript, + becomes string concatenation as soon as either side is string-like.
      // Preserve that fact recursively so chains such as 1+" "+x+" " keep converting
      // every later numeric operand with to_string_any().
      if (op===ts.SyntaxKind.PlusToken && ['string','char'].includes(lt.kind) ||
          op===ts.SyntaxKind.PlusToken && ['string','char'].includes(rt.kind)) return TypeInfo.string();
      return mergeType(lt,rt);
    }
    if (ts.isConditionalExpression(node)) return mergeType(this.inferExpr(node.whenTrue),this.inferExpr(node.whenFalse));
    if (ts.isElementAccessExpression(node)) {
      const t=this.inferExpr(node.expression);
      if (t.kind==='vector'||t.kind==='array') return t.elem;
      if (t.kind==='map') return t.value;
      if (t.kind==='string') return TypeInfo.char();
      if (t.kind==='tuple' && ts.isNumericLiteral(node.argumentExpression)) {
        const i=Number(node.argumentExpression.text); return t.elems[i]||TypeInfo.unknown();
      }
      return TypeInfo.unknown();
    }
    if (ts.isPropertyAccessExpression(node)) {
      const base=this.inferExpr(node.expression);
      if (node.name.text==='length'||node.name.text==='size') return TypeInfo.number();
      return TypeInfo.unknown();
    }
    if (ts.isNewExpression(node)) {
      const name=node.expression.getText(this.sf);
      const args=node.typeArguments||[];
      if (name==='Set') return TypeInfo.set(args.length?this.typeFromTypeNode(args[0]):TypeInfo.unknown());
      if (name==='Map') return TypeInfo.map(args.length?this.typeFromTypeNode(args[0]):TypeInfo.unknown(),args.length>1?this.typeFromTypeNode(args[1]):TypeInfo.unknown());
      if (name==='Float32Array' || name==='Float64Array') return TypeInfo.vector(TypeInfo.real());
      if (['Int8Array','Int16Array','Int32Array','Uint8Array','Uint8ClampedArray','Uint16Array','Uint32Array','BigInt64Array','BigUint64Array'].includes(name)) return TypeInfo.vector(TypeInfo.number());
      if (name==='Array') return TypeInfo.vector(args.length?this.typeFromTypeNode(args[0]):TypeInfo.unknown());
      if (name==='Timer'||name==='RNG'||name==='Annealing'||name==='ZobristHash'||name==='UnionFind') return TypeInfo.custom(name);
      if (name==='PriorityQueue') {
        const elem=args.length?this.typeFromTypeNode(args[0]):TypeInfo.unknown();
        return TypeInfo.custom('PriorityQueue',{elem});
      }
    }
    if (ts.isCallExpression(node)) {
      const callee=node.expression;
      if (ts.isIdentifier(callee)) {
        if (['nextNum','nextBigInt'].includes(callee.text)) return TypeInfo.number();
        // JavaScript/TypeScript の Number(...) は常に IEEE-754 number。
        // 特に Number(S[i]) は1文字stringを数値としてパースするため、C++の char cast とは意味が異なる。
        if (callee.text==='Number') return TypeInfo.real();
        if (callee.text==='next'||callee.text==='nextAwait') return TypeInfo.string();
        if (['nextNums','nextBigInts'].includes(callee.text)) return TypeInfo.vector(TypeInfo.number());
        if (callee.text==='nexts') return TypeInfo.vector(TypeInfo.string());
        if (['lowerBound','upperBound','intDiv'].includes(callee.text)) return TypeInfo.number();
        if (callee.text==='seedFromClock') return TypeInfo.number();
      }
      if (ts.isPropertyAccessExpression(callee)) {
        const name=callee.name.text;
        const base=this.inferExpr(callee.expression);
        if (base.kind==='custom') {
          if (base.name==='Timer') {
            if (name==='over') return TypeInfo.bool();
            if (name==='elapsed'||name==='elapsedMs'||name==='progress') return TypeInfo.real();
          }
          if (base.name==='RNG') {
            if (name==='nextDouble') return TypeInfo.real();
            if (name==='nextBool') return TypeInfo.bool();
            if (name==='nextInt'||name==='nextLL'||name==='nextU64') return TypeInfo.number();
          }
          if (base.name==='Annealing') {
            if (name==='temperature') return TypeInfo.real();
            if (name==='acceptMax'||name==='acceptMin') return TypeInfo.bool();
          }
          if (base.name==='ZobristHash') {
            if (name==='value'||name==='changed'||name==='toggled') return TypeInfo.u64();
          }
          if (base.name==='UnionFind') {
            if (name==='connect'||name==='same') return TypeInfo.bool();
            if (name==='root'||name==='size') return TypeInfo.number();
          }
          if (base.name==='PriorityQueue') {
            if (name==='pop'||name==='top'||name==='peek') return base.elem||TypeInfo.unknown();
            if (name==='isEmpty'||name==='empty') return TypeInfo.bool();
            if (name==='size') return TypeInfo.number();
          }
        }
        if (name==='map') {
          const fn=node.arguments[0];
          if ((ts.isArrowFunction(fn)||ts.isFunctionExpression(fn)) && ts.isExpression(fn.body)) {
            const saved=new Map(this.env);
            if (fn.parameters[0]?.name && ts.isIdentifier(fn.parameters[0].name)) {
              const elem=(base.kind==='vector'||base.kind==='array')?base.elem:TypeInfo.unknown();
              this.env.set(fn.parameters[0].name.text,elem);
            }
            if (fn.parameters[1]?.name && ts.isIdentifier(fn.parameters[1].name)) {
              this.env.set(fn.parameters[1].name.text,TypeInfo.number());
            }
            const r=this.inferExpr(fn.body);
            this.env=saved;
            return TypeInfo.vector(r);
          }
          return TypeInfo.vector(TypeInfo.unknown());
        }
        if (name==='filter'||name==='slice'||name==='reverse'||name==='sort'||name==='fill'||name==='concat') return base.kind==='array'?TypeInfo.vector(base.elem):base;
        if (name==='pop'||name==='at') return (base.kind==='vector'||base.kind==='array')?base.elem:TypeInfo.unknown();
        if (name==='get' && base.kind==='map') return base.value;
        if (['has','includes'].includes(name)) return TypeInfo.bool();
        if (name==='charCodeAt'||name==='indexOf'||name==='findIndex') return TypeInfo.number();
        if (name==='substring'||name==='substr'||(name==='slice'&&base.kind==='string')) return TypeInfo.string();
      }
      if (ts.isPropertyAccessExpression(callee) && callee.expression.getText(this.sf)==='Array' && callee.name.text==='from') {
        const a=node.arguments[0], fn=node.arguments[1];
        if (a && ts.isObjectLiteralExpression(a) && fn && (ts.isArrowFunction(fn)||ts.isFunctionExpression(fn)) && ts.isExpression(fn.body)) {
          const saved=new Map(this.env);
          if (fn.parameters[0]?.name && ts.isIdentifier(fn.parameters[0].name)) this.env.set(fn.parameters[0].name.text,TypeInfo.unknown());
          if (fn.parameters[1]?.name && ts.isIdentifier(fn.parameters[1].name)) this.env.set(fn.parameters[1].name.text,TypeInfo.number());
          const r=this.inferExpr(fn.body);
          this.env=saved;
          return TypeInfo.vector(r.kind==='unknown'?TypeInfo.number():r);
        }
        const at=this.inferExpr(a);
        if (at.kind==='set') return TypeInfo.vector(at.elem);
        return at.kind==='vector'||at.kind==='array'?TypeInfo.vector(at.elem):TypeInfo.vector(TypeInfo.unknown());
      }
      if (ts.isPropertyAccessExpression(callee) && callee.expression.getText(this.sf)==='Math') {
        const name=callee.name.text;
        if (['floor','ceil','round','trunc','clz32','sign'].includes(name)) return TypeInfo.number();
        // In this converter, TypeScript `number` is represented as ll unless the
        // expression is known to be floating-point. Math.abs/min/max preserve an
        // integral argument/result, so do not promote them to double gratuitously.
        if (name==='abs') {
          const t=node.arguments.length ? this.inferExpr(node.arguments[0]) : TypeInfo.unknown();
          return t.kind==='unknown'?TypeInfo.number():t;
        }
        if (name==='min'||name==='max') {
          let t=TypeInfo.unknown();
          for (const a of node.arguments) t=mergeType(t,this.inferExpr(a));
          return t.kind==='unknown'?TypeInfo.number():t;
        }
        return TypeInfo.real();
      }
    }
    return TypeInfo.unknown();
  }

  isCall(node,name) {
    return ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text===name;
  }

  tryInputVectorChain(node, varName, declaredType) {
    // nextNums(N).map(v => expression) and nextBigInts counterpart.
    if (!ts.isCallExpression(node) || !ts.isPropertyAccessExpression(node.expression) || node.expression.name.text!=='map') return null;
    const base=node.expression.expression;
    if (!(this.isCall(base,'nextNums') || this.isCall(base,'nextBigInts'))) return null;
    const fn=node.arguments[0];
    if (!fn || !ts.isArrowFunction(fn) || !ts.isExpression(fn.body) || fn.parameters.length<1 || !ts.isIdentifier(fn.parameters[0].name)) return null;
    const n=base.arguments[0] ? this.emitExpr(base.arguments[0]) : '0';
    const p=fn.parameters[0].name.text;
    const old=this.env.get(p);
    this.env.set(p,TypeInfo.number());
    const body=this.emitExpr(fn.body);
    if (old) this.env.set(p,old); else this.env.delete(p);
    const typ=declaredType.kind==='unknown'?TypeInfo.vector(TypeInfo.number()):declaredType;
    this.env.set(varName,typ);
    return `${typeToCpp(typ)} ${varName}(${n}); for(auto &${p}:${varName}){ cin>>${p}; ${p}=${body}; }`;
  }

  emitArrayFactory(node, expected=TypeInfo.unknown()) {
    // Handles Array(N).fill(v), new Array(N).fill(v), Array.from({length:N}, ()=>...)
    if (!ts.isCallExpression(node)) return null;

    if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.text==='fill') {
      const arr=node.expression.expression;
      let sizeNode=null;
      if (ts.isCallExpression(arr) && ts.isIdentifier(arr.expression) && arr.expression.text==='Array') sizeNode=arr.arguments[0];
      if (ts.isNewExpression(arr) && ts.isIdentifier(arr.expression) && arr.expression.text==='Array') sizeNode=arr.arguments?.[0];
      if (sizeNode) {
        const val=node.arguments[0];
        const elem=expected.kind==='vector'?expected.elem:this.inferExpr(val);
        const t=TypeInfo.vector(elem.kind==='unknown'?TypeInfo.number():elem);
        return { code:`${typeToCpp(t)}(${this.emitExpr(sizeNode)},${this.emitExpr(val)})`, type:t };
      }
    }

    if (ts.isPropertyAccessExpression(node.expression) && node.expression.expression.getText(this.sf)==='Array' && node.expression.name.text==='from') {
      const a0=node.arguments[0], a1=node.arguments[1];
      if (a0 && ts.isObjectLiteralExpression(a0) && a1 && (ts.isArrowFunction(a1)||ts.isFunctionExpression(a1))) {
        let len=null;
        for (const p of a0.properties) {
          if (ts.isPropertyAssignment(p) && p.name.getText(this.sf)==='length') len=p.initializer;
        }
        if (len && ts.isExpression(a1.body)) {
          const innerExpected=expected.kind==='vector'?expected.elem:TypeInfo.unknown();
          let bodyExpr=a1.body;
          while (ts.isAsExpression(bodyExpr) || ts.isTypeAssertionExpression(bodyExpr) || ts.isParenthesizedExpression(bodyExpr)) bodyExpr=bodyExpr.expression;
          const annotatedInner=(ts.isAsExpression(a1.body)||ts.isTypeAssertionExpression(a1.body)) ? this.typeFromTypeNode(a1.body.type) : TypeInfo.unknown();

          const saved=new Map(this.env);
          const valueName=a1.parameters[0]?.name && ts.isIdentifier(a1.parameters[0].name) ? a1.parameters[0].name.text : null;
          const indexName=a1.parameters[1]?.name && ts.isIdentifier(a1.parameters[1].name) ? a1.parameters[1].name.text : null;
          if (valueName) this.env.set(valueName,TypeInfo.unknown());
          if (indexName) this.env.set(indexName,TypeInfo.number());

          const inferredInner=this.inferExpr(bodyExpr);
          const innerType=annotatedInner.kind!=='unknown' ? annotatedInner : (innerExpected.kind!=='unknown' ? innerExpected : (inferredInner.kind==='unknown'?TypeInfo.number():inferredInner));
          const outer=TypeInfo.vector(innerType);
          const bodyCode=this.emitExpr(bodyExpr,innerType);
          this.env=saved;

          // Array.from({length:n}, callback) calls callback once per element.
          // A vector fill constructor is not equivalent when callback reads input,
          // uses randomness, or depends on the index. Emit the actual loop.
          const id=this.tmpId++;
          const loopIndex=indexName || `__ts2cpp_from_i${id}`;
          const resultName=`__ts2cpp_from_r${id}`;
          const valueDecl=(valueName && valueName!=='_') ? ` ll ${valueName}=0;` : '';
          const code=`([&](){ ${typeToCpp(outer)} ${resultName}; ${resultName}.reserve(${this.emitExpr(len)}); for(ll ${loopIndex}=0; ${loopIndex}<${this.emitExpr(len)}; ++${loopIndex}){${valueDecl} ${resultName}.push_back(${bodyCode}); } return ${resultName}; }())`;
          return {code,type:outer};
        }
      }
      // Array.from(new Set(A)) -> helper preserving JS Set insertion order.
      if (a0 && ts.isNewExpression(a0) && ts.isIdentifier(a0.expression) && a0.expression.text==='Set' && a0.arguments?.length===1) {
        this.needHelpers.add('unique_preserve');
        const arg=a0.arguments[0];
        const bt=this.inferExpr(arg);
        const et=(bt.kind==='vector'||bt.kind==='array')?bt.elem:TypeInfo.unknown();
        return { code:`unique_preserve(${this.emitExpr(arg)})`, type:TypeInfo.vector(et) };
      }
    }
    return null;
  }

  emitExpr(node, expected=TypeInfo.unknown()) {
    if (!node) return '';
    if (ts.isParenthesizedExpression(node)) return `(${this.emitExpr(node.expression,expected)})`;
    if (ts.isAwaitExpression(node)) return this.emitExpr(node.expression,expected);
    if (ts.isIdentifier(node)) {
      if (node.text==='Infinity') return 'LINF';
      if (node.text==='undefined') return 'nullptr';
      return node.text;
    }
    if (ts.isNumericLiteral(node)) {
      const raw=node.getText(this.sf);
      if (/[.eE]/.test(raw)) return raw.replace(/_/g,'');
      return node.text;
    }
    if (ts.isBigIntLiteral(node)) return node.text.replace(/n$/,'LL');
    if (node.kind===ts.SyntaxKind.TrueKeyword) return 'true';
    if (node.kind===ts.SyntaxKind.FalseKeyword) return 'false';
    if (node.kind===ts.SyntaxKind.NullKeyword) return 'nullptr';
    if (ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node)) {
      if (expected.kind==='char' && node.text.length===1) {
        const c=node.text.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
        return `'${c}'`;
      }
      return cppStringLiteral(node.text);
    }
    if (ts.isTemplateExpression(node)) {
      this.needHelpers.add('to_string_any');
      let parts=[cppStringLiteral(node.head.text)];
      for (const sp of node.templateSpans) {
        parts.push(`to_string_any(${this.emitExpr(sp.expression)})`);
        parts.push(cppStringLiteral(sp.literal.text));
      }
      return parts.join('+');
    }
    if (ts.isArrayLiteralExpression(node)) {
      const t=this.inferExpr(node);
      const size=node.elements.length;
      // A TS array literal passed where vector<T> is expected must remain a growable vector.
      // In particular [], used in push([]) for number[][], must not become array<auto,0>.
      if (expected.kind==='vector') {
        const elem=expected.elem||TypeInfo.unknown();
        const e=node.elements.map(x=>this.emitExpr(x,elem)).join(',');
        return `vector<${typeToCpp(elem)}>{${e}}`;
      }
      if (expected.kind==='tuple' || t.kind==='tuple') {
        const tt=expected.kind==='tuple'?expected:t;
        const e=node.elements.map((x,i)=>this.emitExpr(x,tt.elems[i]||TypeInfo.unknown())).join(',');
        return `tuple<${tt.elems.map(typeToCpp).join(',')}>{${e}}`;
      }
      const elem=(t.elem?.kind==='unknown' && expected.kind==='array') ? expected.elem : (t.elem||TypeInfo.unknown());
      const e=node.elements.map(x=>this.emitExpr(x,elem)).join(',');
      if (expected.kind==='array' || t.kind==='array') return `array<${typeToCpp(elem)},${size}>{${e}}`;
      return `{${e}}`;
    }
    if (ts.isElementAccessExpression(node)) return `${this.emitExpr(node.expression)}[${this.emitExpr(node.argumentExpression)}]`;
    if (ts.isPropertyAccessExpression(node)) {
      const base=this.emitExpr(node.expression);
      const name=node.name.text;
      if (name==='length'||name==='size') return `(ll)${base}.size()`;
      return `${base}.${name}`;
    }
    if (ts.isPrefixUnaryExpression(node)) {
      const op=ts.tokenToString(node.operator) || '';
      return `${op}${this.emitExpr(node.operand)}`;
    }
    if (ts.isPostfixUnaryExpression(node)) {
      const op=ts.tokenToString(node.operator) || '';
      return `${this.emitExpr(node.operand)}${op}`;
    }
    if (ts.isConditionalExpression(node)) return `(${this.emitExpr(node.condition)}?${this.emitExpr(node.whenTrue)}:${this.emitExpr(node.whenFalse)})`;
    if (ts.isBinaryExpression(node)) {
      const opk=node.operatorToken.kind;
      const opMap=new Map([
        [ts.SyntaxKind.EqualsEqualsEqualsToken,'=='],[ts.SyntaxKind.EqualsEqualsToken,'=='],
        [ts.SyntaxKind.ExclamationEqualsEqualsToken,'!='],[ts.SyntaxKind.ExclamationEqualsToken,'!='],
        [ts.SyntaxKind.AsteriskAsteriskToken,'**'],
      ]);
      if (opk===ts.SyntaxKind.AsteriskAsteriskToken) {
        // Keep safe constant integer powers integral (e.g. 10**9 -> 1000000000)
        // instead of routing them through std::pow(double,double).
        if (ts.isNumericLiteral(node.left) && ts.isNumericLiteral(node.right)) {
          const a=Number(node.left.text), b=Number(node.right.text);
          if (Number.isSafeInteger(a) && Number.isSafeInteger(b) && b>=0) {
            const value=a**b;
            if (Number.isSafeInteger(value)) return String(value);
          }
        }
        return `pow(${this.emitExpr(node.left)},${this.emitExpr(node.right)})`;
      }
      const op=opMap.get(opk) || ts.tokenToString(opk) || node.operatorToken.getText(this.sf);
      const lt=this.inferExpr(node.left), rt=this.inferExpr(node.right);
      // TS string indexing returns a one-character string; in C++ it is char.
      if (['==','!=','<','<=','>','>='].includes(op)) {
        if (lt.kind==='char') return `${this.emitExpr(node.left,lt)}${op}${this.emitExpr(node.right,lt)}`;
        if (rt.kind==='char') return `${this.emitExpr(node.left,rt)}${op}${this.emitExpr(node.right,rt)}`;
      }
      // TypeScriptでは文字列との + / += は相手を自動的に文字列化する。
      // C++ の string += int は文字コードを追加してしまうため明示的に変換する。
      // TypeScript number division is floating-point. Integer division in the user's template is explicit via intDiv().
      if (op==='/') {
        return `((double)(${this.emitExpr(node.left,lt)})/(double)(${this.emitExpr(node.right,rt)}))`;
      }
      if (op==='+' || op==='+=') {
        const lstr=lt.kind==='string' || lt.kind==='char';
        const rstr=rt.kind==='string' || rt.kind==='char';
        if (lstr || rstr) {
          this.needHelpers.add('to_string_any');
          const asString=(expr,t) => {
            const e=this.emitExpr(expr,t);
            if (t.kind==='string') return e;
            if (t.kind==='char') return `string(1,${e})`;
            return `to_string_any(${e})`;
          };
          if (op==='+=') {
            return `${this.emitExpr(node.left,lt)}+=${asString(node.right,rt)}`;
          }
          return `${asString(node.left,lt)}+${asString(node.right,rt)}`;
        }
      }
      return `${this.emitExpr(node.left,lt)}${op}${this.emitExpr(node.right,rt)}`;
    }
    if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node) || ts.isNonNullExpression(node)) return this.emitExpr(node.expression,expected);
    if (ts.isArrowFunction(node)||ts.isFunctionExpression(node)) return this.emitLambda(node);
    if (ts.isNewExpression(node)) {
      const name=node.expression.getText(this.sf);
      const args=node.arguments||[];
      if (name==='Timer') this.needHelpers.add('ahc_timer');
      if (name==='RNG') this.needHelpers.add('ahc_rng');
      if (name==='Annealing') { this.needHelpers.add('ahc_annealing'); this.needHelpers.add('ahc_rng'); }
      if (name==='UnionFind') {
        if (this.templateCaps.dsu) return `DSU(${args.map(x=>this.emitExpr(x)).join(',')})`;
        this.needHelpers.add('union_find');
        return `UnionFind(${args.map(x=>this.emitExpr(x)).join(',')})`;
      }
      if (name==='PriorityQueue') {
        this.needHelpers.add('priority_queue');
        const elem=node.typeArguments?.length?this.typeFromTypeNode(node.typeArguments[0]):TypeInfo.unknown();
        const cmp=args[0]?this.emitLambda(args[0]):`[&](const auto& a,const auto& b){ return a-b; }`;
        return `TsPriorityQueue<${typeToCpp(elem)}>(${cmp})`;
      }
      if (name==='Set') {
        const t=this.inferExpr(node); const ct=typeToCpp(t);
        if (args.length===0) return `${ct}()`;
        const a=this.emitExpr(args[0]);
        return `${ct}(${a}.begin(),${a}.end())`;
      }
      if (name==='Map') return `${typeToCpp(this.inferExpr(node))}()`;
      if (name==='Array') {
        const elem=expected.kind==='vector'?expected.elem:TypeInfo.number();
        return `vector<${typeToCpp(elem)}>(${args[0]?this.emitExpr(args[0]):'0'})`;
      }
      if (name==='Float32Array' || name==='Float64Array' || ['Int8Array','Int16Array','Int32Array','Uint8Array','Uint8ClampedArray','Uint16Array','Uint32Array','BigInt64Array','BigUint64Array'].includes(name)) {
        const t=this.inferExpr(node), ct=typeToCpp(t);
        if (args.length===0) return `${ct}()`;
        const at=this.inferExpr(args[0]);
        const a=this.emitExpr(args[0]);
        if (at.kind==='vector'||at.kind==='array') return `${ct}(${a}.begin(),${a}.end())`;
        return `${ct}(${a})`;
      }
      return `${name}(${args.map(x=>this.emitExpr(x)).join(',')})`;
    }
    if (ts.isCallExpression(node)) return this.emitCall(node,expected);

    this.warn(node,`Unsupported expression: ${node.getText(this.sf).slice(0,120)}`);
    return node.getText(this.sf);
  }

  declaredLocalType(body,name) {
    let found=TypeInfo.unknown();
    const visit=(n)=>{
      if (found.kind!=='unknown') return;
      // Do not inspect nested function scopes.
      if (n!==body && (ts.isArrowFunction(n)||ts.isFunctionExpression(n)||ts.isFunctionDeclaration(n))) return;
      if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text===name) {
        if (n.type) found=this.typeFromTypeNode(n.type);
        else if (n.initializer) found=this.inferExpr(n.initializer);
        return;
      }
      ts.forEachChild(n,visit);
    };
    visit(body);
    return found;
  }

  inferLambdaReturnType(node) {
    if (node.type) return this.typeFromTypeNode(node.type);
    if (!ts.isBlock(node.body)) return this.inferExpr(node.body);

    let merged=TypeInfo.unknown();
    const body=node.body;
    const visit=(n)=>{
      // Returns inside nested lambdas/functions belong to another scope.
      if (n!==body && (ts.isArrowFunction(n)||ts.isFunctionExpression(n)||ts.isFunctionDeclaration(n))) return;
      if (ts.isReturnStatement(n) && n.expression) {
        const e=n.expression;
        // Empty [] has no element type by itself. Infer it from another return.
        if (ts.isArrayLiteralExpression(e) && e.elements.length===0) return;
        let t=TypeInfo.unknown();
        if (ts.isIdentifier(e)) {
          t=this.declaredLocalType(body,e.text);
          // The declaration may start from an integer literal (e.g. `let score = 0`)
          // and later become real through `+= prob*(1-p)`.  emitVariableDeclaration()
          // already promotes such locals to double via real-flow analysis, so the
          // lambda return type must apply the same promotion.  Otherwise C++ gets
          // `-> ll` and silently truncates the probabilistic score on return.
          if (this.isRealIdentifier(e)) t=promoteNumericToReal(t);
        }
        if (t.kind==='unknown') t=this.inferExpr(e);
        merged=mergeType(merged,t);
        return;
      }
      ts.forEachChild(n,visit);
    };
    visit(body);
    return merged;
  }

  emitLambda(node) {
    const saved=new Map(this.env);
    const savedMain=this.inMainBody;
    const savedReturnExpected=this.returnExpected;
    this.inMainBody=false;
    this.returnExpected=this.inferLambdaReturnType(node);
    const ps=[];
    for (const p of node.parameters) {
      if (!ts.isIdentifier(p.name)) {
        ps.push(`auto ${p.name.getText(this.sf)}`);
        continue;
      }
      const pt=this.typeFromTypeNode(p.type);
      this.env.set(p.name.text,pt);
      ps.push(`${pt.kind==='unknown'?'auto&&':typeToCpp(pt)} ${p.name.text}`);
    }
    let body;
    if (ts.isBlock(node.body)) body=this.emitBlock(node.body,0,true);
    else body=`{ return ${this.emitExpr(node.body,this.returnExpected)}; }`;
    // C++ lambda return-type deduction requires every return expression to have
    // exactly the same type. TypeScript permits implicit numeric conversions, so
    // emit a trailing return type whenever we can infer one. This also makes
    // explicit TS annotations such as `(x): number => ...` authoritative.
    const ret=this.returnExpected.kind==='unknown' ? '' : ` -> ${typeToCpp(this.returnExpected)}`;
    this.env=saved;
    this.inMainBody=savedMain;
    this.returnExpected=savedReturnExpected;
    return `[&](${ps.join(',')})${ret} ${body}`;
  }

  emitComparator(fn) {
    // The user's TS template defines less/greater as three-way comparators (-1/0/1).
    // std::sort requires a boolean strict-weak-order comparator, so map them explicitly.
    if (ts.isIdentifier(fn) && fn.text==='less') return null; // ascending default
    if (ts.isIdentifier(fn) && fn.text==='greater') return `[](const auto& a,const auto& b){ return a>b; }`;
    if (!(ts.isArrowFunction(fn)||ts.isFunctionExpression(fn))) return this.emitExpr(fn);
    const params=fn.parameters.map(p=>p.name.getText(this.sf));
    if (params.length<2) return this.emitLambda(fn);
    const [a,b]=params;
    if (ts.isExpression(fn.body)) {
      // a-b / b-a
      const text=fn.body.getText(this.sf).replace(/\s+/g,'');
      if (text===`${a}-${b}`) return null; // ascending default
      if (text===`${b}-${a}`) return `[&](const auto& ${a},const auto& ${b}){ return ${a}>${b}; }`;

      // a[0]-b[0] || a[1]-b[1] ... => lexicographic comparator.
      const pieces=[];
      function collectOr(n) {
        if (ts.isBinaryExpression(n) && n.operatorToken.kind===ts.SyntaxKind.BarBarToken) { collectOr(n.left); collectOr(n.right); }
        else pieces.push(n);
      }
      collectOr(fn.body);
      let ok=pieces.length>1;
      const comps=[];
      for (const p of pieces) {
        if (!ts.isBinaryExpression(p) || p.operatorToken.kind!==ts.SyntaxKind.MinusToken) { ok=false; break; }
        comps.push([p.left,p.right]);
      }
      if (ok) {
        const lines=[];
        for (let i=0;i<comps.length;i++) {
          const l=this.emitExpr(comps[i][0]), r=this.emitExpr(comps[i][1]);
          lines.push(`if(${l}!=${r}) return ${l}<${r};`);
        }
        lines.push('return false;');
        return `[&](const auto& ${a},const auto& ${b}){ ${lines.join(' ')} }`;
      }

      const saved=new Map(this.env);
      this.env.set(a,TypeInfo.unknown()); this.env.set(b,TypeInfo.unknown());
      const e=this.emitExpr(fn.body);
      this.env=saved;
      return `[&](const auto& ${a},const auto& ${b}){ return (${e})<0; }`;
    }
    // A JavaScript/TypeScript Array.sort comparator conventionally returns a
    // negative/zero/positive NUMBER.  A C++ std::sort comparator must return
    // bool.  Expression-bodied callbacks are handled above; for a block body,
    // evaluate the original comparator and compare its result with zero.
    // This preserves local variables and early returns inside the callback.
    if (ts.isBlock(fn.body)) {
      // Array.sort's callback is a three-way comparator in JS/TS.  Even when
      // local declarations make static return-type inference difficult, keep
      // that JS contract by evaluating the callback and testing `< 0`.
      const inner=this.emitLambda(fn);
      return `[&](const auto& ${a},const auto& ${b}){ return (${inner})(${a},${b})<0; }`;
    }
    return this.emitLambda(fn);
  }

  emitCall(node,expected=TypeInfo.unknown()) {
    const fac=this.emitArrayFactory(node,expected);
    if (fac) return fac.code;

    const callee=node.expression;
    const args=node.arguments;
    if (ts.isIdentifier(callee)) {
      if (callee.text==='seedFromClock') { this.needHelpers.add('ahc_seed_clock'); return 'seedFromClock()'; }
      const name=callee.text;
      // Input helpers may appear inside expressions/callbacks such as
      // Array.from({length:N},()=>nextNums(4)). Lower them to small IIFEs.
      if (name==='nextNum'||name==='nextBigInt') {
        const id=this.tmpId++;
        return `([&](){ ll __ts2cpp_in${id}; cin>>__ts2cpp_in${id}; return __ts2cpp_in${id}; }())`;
      }
      if (name==='nextNums'||name==='nextBigInts') {
        const id=this.tmpId++;
        const n=args[0]?this.emitExpr(args[0]):'0';
        return `([&](){ vector<ll> __ts2cpp_in${id}(${n}); for(auto &__ts2cpp_v:${'__ts2cpp_in'+id}) cin>>__ts2cpp_v; return __ts2cpp_in${id}; }())`;
      }
      if (name==='nexts') {
        const id=this.tmpId++;
        const n=args[0]?this.emitExpr(args[0]):'0';
        return `([&](){ vector<string> __ts2cpp_in${id}(${n}); for(auto &__ts2cpp_v:${'__ts2cpp_in'+id}) cin>>__ts2cpp_v; return __ts2cpp_in${id}; }())`;
      }
      if (name==='next'||name==='nextAwait') {
        const id=this.tmpId++;
        return `([&](){ string __ts2cpp_in${id}; cin>>__ts2cpp_in${id}; return __ts2cpp_in${id}; }())`;
      }
      if (name==='BigInt') return `(ll)(${args[0]?this.emitExpr(args[0]):'0'})`;
      if (name==='Number') {
        if (!args[0]) return '0.0';
        const at=this.inferExpr(args[0]);
        // 数値に対する Number(x) は単なる数値変換でよい。
        if (at.kind==='number'||at.kind==='real'||at.kind==='bool') return `(double)(${this.emitExpr(args[0])})`;
        // string / char は C++ のキャストでは ASCII コードになるため、JS と同様に数値としてパースする。
        this.needHelpers.add('number_any');
        return `ts_number_any(${this.emitExpr(args[0],at)})`;
      }
      if (name==='String') return `to_string(${this.emitExpr(args[0])})`;
      if (name==='intDiv') return `((${this.emitExpr(args[0])})/(${this.emitExpr(args[1])}))`;
      if (name==='lowerBound') {
        const a=this.emitExpr(args[0]), x=this.emitExpr(args[1]);
        return `(lower_bound(${a}.begin(),${a}.end(),${x})-${a}.begin())`;
      }
      if (name==='upperBound') {
        const a=this.emitExpr(args[0]), x=this.emitExpr(args[1]);
        return `(upper_bound(${a}.begin(),${a}.end(),${x})-${a}.begin())`;
      }
      if (name==='builtin_popcount') return `__builtin_popcountll(${this.emitExpr(args[0])})`;
      if (name==='String.fromCharCode') return `char(${this.emitExpr(args[0])})`;
      return `${name}(${args.map(x=>this.emitExpr(x)).join(',')})`;
    }

    if (ts.isPropertyAccessExpression(callee)) {
      const name=callee.name.text;
      const objNode=callee.expression;
      const obj=this.emitExpr(objNode);
      const bt=this.inferExpr(objNode);

      if (bt.kind==='custom' && bt.name==='RNG' && name==='shuffle' && args.length===1) {
        const a=this.emitExpr(args[0]);
        return `${obj}.shuffle(${a}.begin(),${a}.end())`;
      }

      if (objNode.getText(this.sf)==='Date' && name==='now') {
        this.needHelpers.add('date_now');
        return `ts2cpp_date_now()`;
      }
      if (objNode.getText(this.sf)==='Math') {
        if ((name==='min'||name==='max') && args.length===2 && args.some(x=>this.exprUsesReal(x)||this.inferExpr(x).kind==='real')) {
          return `${name}<double>(${args.map(x=>this.emitExpr(x)).join(',')})`;
        }
        if (name==='round' && args.length===1) {
          // JS Math.round(x) is floor(x+0.5) (ignoring the irrelevant -0 distinction).
          return `(ll)floor((${this.emitExpr(args[0])})+0.5)`;
        }
        const mp={min:'min',max:'max',abs:'abs',floor:'floor',ceil:'ceil',sqrt:'sqrt',pow:'pow',trunc:'trunc',exp:'exp'};
        return `${mp[name]||name}(${args.map(x=>this.emitExpr(x)).join(',')})`;
      }
      if (objNode.getText(this.sf)==='String' && name==='fromCharCode') return `char(${this.emitExpr(args[0])})`;

      // TypeScript の static class method は C++ では :: で呼ぶ。
      // AHC 共通ライブラリの MonteCarlo は TS/C++ で同名 API を持つ。
      if (objNode.getText(this.sf)==='MonteCarlo' && ['chooseMax','chooseMin','chooseMaxUntil','chooseMinUntil'].includes(name)) {
        return `MonteCarlo::${name}(${args.map(x=>this.emitExpr(x)).join(',')})`;
      }

      // Generic Beam Search is implemented natively by the C++ AHC template.
      if (objNode.getText(this.sf)==='BeamSearch' && ['max','min','maxUntil','minUntil'].includes(name)) {
        return `BeamSearch::${name}(${args.map(x=>this.emitExpr(x)).join(',')})`;
      }

      if (bt.kind==='custom' && bt.name==='UnionFind') {
        const method=(bt.nativeDSU||this.templateCaps.dsu)
          ? ({connect:'merge',root:'leader',same:'same',size:'size'}[name]||name)
          : name;
        return `${obj}.${method}(${args.map(x=>this.emitExpr(x)).join(',')})`;
      }

      if (bt.kind==='custom' && bt.name==='PriorityQueue') {
        if (name==='push') return `${obj}.push(${args.map(x=>this.emitExpr(x,bt.elem||TypeInfo.unknown())).join(',')})`;
        if (name==='pop') {
          if (bt.nativePQ) {
            const id=this.tmpId++;
            return `([&](){ auto __ts2cpp_pqv${id}=${obj}.top(); ${obj}.pop(); return __ts2cpp_pqv${id}; }())`;
          }
          return `${obj}.pop()`;
        }
        if (name==='top'||name==='peek') return `${obj}.top()`;
        if (name==='size') return `(ll)${obj}.size()`;
        if (name==='isEmpty'||name==='empty') return `${obj}.empty()`;
      }

      if (name==='concat') {
        const et=(bt.kind==='vector'||bt.kind==='array')?bt.elem:TypeInfo.number();
        const id=this.tmpId++;
        const r=`__ts2cpp_concat${id}`;
        const lines=bt.kind==='array'
          ? [`auto __ts2cpp_concat_base${id}=${obj};`,`vector<${typeToCpp(et)}> ${r}(__ts2cpp_concat_base${id}.begin(),__ts2cpp_concat_base${id}.end());`]
          : [`auto ${r}=${obj};`];
        for (const a of args) {
          const at=this.inferExpr(a);
          const ac=this.emitExpr(a,et);
          if (at.kind==='vector'||at.kind==='array') lines.push(`${r}.insert(${r}.end(),${ac}.begin(),${ac}.end());`);
          else lines.push(`${r}.push_back(${ac});`);
        }
        lines.push(`return ${r};`);
        return `([&](){ ${lines.join(' ')} }())`;
      }
      if (name==='push') { const et=(bt.kind==='vector'||bt.kind==='array')?bt.elem:TypeInfo.unknown(); return `${obj}.push_back(${args.map(x=>this.emitExpr(x,et)).join(',')})`; }
      if (name==='fill') { const et=(bt.kind==='vector'||bt.kind==='array')?bt.elem:TypeInfo.unknown(); const v=args[0]?this.emitExpr(args[0],et):'0'; return `(fill(${obj}.begin(),${obj}.end(),${v}),${obj})`; }
      if (name==='pop') return `${obj}.back()`; // statement emitter adds pop_back when value unused
      if (name==='at' && args.length===1 && ts.isPrefixUnaryExpression(args[0]) && args[0].operator===ts.SyntaxKind.MinusToken && ts.isNumericLiteral(args[0].operand) && args[0].operand.text==='1') return `${obj}.back()`;
      if (name==='has') return `${obj}.count(${this.emitExpr(args[0])})`;
      if (name==='get') return `${obj}.at(${this.emitExpr(args[0])})`;
      if (name==='add') return `${obj}.insert(${this.emitExpr(args[0])})`;
      if (name==='delete') return `${obj}.erase(${this.emitExpr(args[0])})`;
      if (name==='set') return `(${obj}[${this.emitExpr(args[0])}]=${this.emitExpr(args[1])})`;
      if (name==='charCodeAt') return `((int)${obj}[${this.emitExpr(args[0])}])`;
      if (name==='includes') {
        if (bt.kind==='string') return `(${obj}.find(${this.emitExpr(args[0])})!=string::npos)`;
        return `(find(${obj}.begin(),${obj}.end(),${this.emitExpr(args[0])})!=${obj}.end())`;
      }
      if (name==='indexOf') {
        if (bt.kind==='string') return `(ll)${obj}.find(${this.emitExpr(args[0])})`;
        return `(find(${obj}.begin(),${obj}.end(),${this.emitExpr(args[0])})-${obj}.begin())`;
      }
      if (name==='findIndex') {
        const fn=args[0];
        if (!fn || !(ts.isArrowFunction(fn)||ts.isFunctionExpression(fn)) || fn.parameters.length<1 || !ts.isIdentifier(fn.parameters[0].name) || !ts.isExpression(fn.body)) {
          this.warn(node,'Only findIndex((value[,index]) => expression) is converted automatically.');
          return node.getText(this.sf);
        }
        const et=(bt.kind==='vector'||bt.kind==='array')?bt.elem:TypeInfo.unknown();
        const valueName=fn.parameters[0].name.text;
        const indexName=fn.parameters[1] && ts.isIdentifier(fn.parameters[1].name) ? fn.parameters[1].name.text : null;
        const saved=new Map(this.env);
        this.env.set(valueName,et);
        if (indexName) this.env.set(indexName,TypeInfo.number());
        const cond=this.emitExpr(fn.body);
        this.env=saved;
        const id=this.tmpId++;
        const idx=`__ts2cpp_find_i${id}`;
        const idxAlias=indexName?` ll ${indexName}=${idx};`:'';
        return `([&](){ ll ${idx}=0; for(const auto& ${valueName}:${obj}){${idxAlias} if(${cond}) return ${idx}; ++${idx}; } return -1LL; }())`;
      }
      if ((name==='substring'||name==='substr') && bt.kind==='string') {
        const l=this.emitExpr(args[0]), r=args[1]?this.emitExpr(args[1]):null;
        if (name==='substring') return r?`${obj}.substr(${l},${r}-${l})`:`${obj}.substr(${l})`;
        return r?`${obj}.substr(${l},${r})`:`${obj}.substr(${l})`;
      }
      if (name==='slice') {
        if (bt.kind==='string') {
          const l=args[0]?this.emitExpr(args[0]):'0';
          const r=args[1]?this.emitExpr(args[1]):null;
          return r?`${obj}.substr(${l},${r}-${l})`:`${obj}.substr(${l})`;
        }
        // Array.slice() with no arguments is a value copy.  C++ vector assignment/
        // return-by-value already has exactly that semantics, so no helper is needed.
        if (args.length===0) return obj;
        this.needHelpers.add('vec_slice');
        return `vec_slice(${obj},${args[0]?this.emitExpr(args[0]):'0'},${args[1]?this.emitExpr(args[1]):`${obj}.size()`})`;
      }
      if (name==='reverse') {
        return `([&](){ reverse(${obj}.begin(),${obj}.end()); return ${obj}; }())`;
      }
      if (name==='map') return this.emitMapCall(node,objNode);
      if (name==='filter') return this.emitFilterCall(node,objNode);
      if (name==='reduce') return this.emitReduceCall(node,objNode);
      if (name==='join') {
        this.needHelpers.add('join_vec');
        return `join_vec(${obj},${args[0]?this.emitExpr(args[0]):'","'})`;
      }
      return `${obj}.${name}(${args.map(x=>this.emitExpr(x)).join(',')})`;
    }

    return `${this.emitExpr(callee)}(${args.map(x=>this.emitExpr(x)).join(',')})`;
  }

  emitMapCall(node,objNode) {
    const fn=node.arguments[0];
    if (!fn || !(ts.isArrowFunction(fn)||ts.isFunctionExpression(fn)) || fn.parameters.length<1 || !ts.isIdentifier(fn.parameters[0].name)) {
      this.warn(node,'Complex .map() could not be converted safely.');
      return node.getText(this.sf);
    }
    const obj=this.emitExpr(objNode);
    const baseT=this.inferExpr(objNode);
    const elem=(baseT.kind==='vector'||baseT.kind==='array')?baseT.elem:TypeInfo.unknown();
    const p=fn.parameters[0].name.text;
    const indexName=fn.parameters[1] && ts.isIdentifier(fn.parameters[1].name) ? fn.parameters[1].name.text : null;
    const saved=new Map(this.env); this.env.set(p,elem); if(indexName) this.env.set(indexName,TypeInfo.number());
    let ret=TypeInfo.unknown(), bodyExpr=null;
    if (ts.isExpression(fn.body)) { ret=this.inferExpr(fn.body); bodyExpr=this.emitExpr(fn.body); }
    this.env=saved;
    if (!bodyExpr) {
      this.warn(node,'.map() with block-body lambda is not yet expression-lowered; use an expression lambda or a loop.');
      return node.getText(this.sf);
    }
    const rt=ret.kind==='unknown'?TypeInfo.number():ret;
    if(indexName) return `([&](){ vector<${typeToCpp(rt)}> _r; _r.reserve(${obj}.size()); ll ${indexName}=0; for(auto ${p}:${obj}){ _r.push_back(${bodyExpr}); ++${indexName}; } return _r; }())`;
    return `([&](){ vector<${typeToCpp(rt)}> _r; _r.reserve(${obj}.size()); for(auto ${p}:${obj}) _r.push_back(${bodyExpr}); return _r; }())`;
  }

  emitFilterCall(node,objNode) {
    const fn=node.arguments[0];
    if (!fn || !(ts.isArrowFunction(fn)||ts.isFunctionExpression(fn)) || fn.parameters.length<1 || !ts.isIdentifier(fn.parameters[0].name) || !ts.isExpression(fn.body)) {
      this.warn(node,'Complex .filter() could not be converted safely.');
      return node.getText(this.sf);
    }
    const obj=this.emitExpr(objNode), p=fn.parameters[0].name.text;
    const bt=this.inferExpr(objNode); const et=(bt.kind==='vector'||bt.kind==='array')?bt.elem:TypeInfo.unknown();
    const saved=new Map(this.env); this.env.set(p,et); const cond=this.emitExpr(fn.body); this.env=saved;
    return `([&](){ vector<${typeToCpp(et)}> _r; for(auto ${p}:${obj}) if(${cond}) _r.push_back(${p}); return _r; }())`;
  }

  emitReduceCall(node,objNode) {
    const fn=node.arguments[0], init=node.arguments[1];
    if (!fn || !(ts.isArrowFunction(fn)||ts.isFunctionExpression(fn)) || fn.parameters.length<2 || !ts.isIdentifier(fn.parameters[0].name)||!ts.isIdentifier(fn.parameters[1].name)||!ts.isExpression(fn.body)||!init) {
      this.warn(node,'Only reduce((acc,x)=>expr, initial) is converted automatically.');
      return node.getText(this.sf);
    }
    const obj=this.emitExpr(objNode), a=fn.parameters[0].name.text, x=fn.parameters[1].name.text;
    const initCode=this.emitExpr(init), initT=this.inferExpr(init), bt=this.inferExpr(objNode), et=(bt.kind==='vector'||bt.kind==='array')?bt.elem:TypeInfo.unknown();
    const saved=new Map(this.env); this.env.set(a,initT); this.env.set(x,et); const expr=this.emitExpr(fn.body); this.env=saved;
    return `([&](){ auto ${a}=${initCode}; for(auto ${x}:${obj}) ${a}=${expr}; return ${a}; }())`;
  }

  normalizeQueueRecordType(t) {
    if (!t) return t;
    if (t.kind==='array' && t.size===0 && (!t.elem || t.elem.kind==='unknown')) {
      // In competitive-programming queues, an empty [] inside a heterogeneous
      // record is overwhelmingly used as a growable numeric path/list.  Treat it
      // as vector<ll> rather than the invalid array<auto,0>.  Later operations
      // such as ans.concat(to) then keep the same vector type.
      return TypeInfo.vector(TypeInfo.number());
    }
    if (t.kind==='tuple') return TypeInfo.tuple(t.elems.map(x=>this.normalizeQueueRecordType(x)));
    if (t.kind==='array') return TypeInfo.array(this.normalizeQueueRecordType(t.elem),t.size);
    if (t.kind==='vector') return TypeInfo.vector(this.normalizeQueueRecordType(t.elem));
    return t;
  }

  inferQueueLiteralType(init, annotated) {
    if (!ts.isArrayLiteralExpression(init) || init.elements.length===0) return null;
    const first=init.elements[0];
    if (!ts.isArrayLiteralExpression(first)) return null;
    let record=this.normalizeQueueRecordType(this.inferExpr(first));
    if (record.kind!=='tuple' && record.kind!=='array') return null;
    // `let q:any[]=[[...]]` intentionally asks TS not to type the record.  Recover
    // the fixed record shape from the literal so C++ can use vector<tuple<...>>.
    if (annotated.kind==='vector' && annotated.elem?.kind==='unknown') return TypeInfo.vector(record);
    if (annotated.kind==='unknown') return TypeInfo.vector(record);
    return null;
  }

  emitVarDecl(decl, isConst=false) {
    if (!ts.isIdentifier(decl.name)) {
      if (ts.isArrayBindingPattern(decl.name)) return this.emitBindingDecl(decl);
      this.warn(decl,'Unsupported binding pattern.');
      return `/* TODO(ts2cpp): ${decl.getText(this.sf)} */`;
    }
    const name=decl.name.text;
    const annotated=this.typeFromTypeNode(decl.type);
    const init=decl.initializer;
    if (!init) {
      const t=annotated.kind==='unknown'?TypeInfo.number():annotated;
      this.env.set(name,t);
      return `${typeToCpp(t)} ${name};`;
    }

    // Interactive input shortcuts.
    // Number(await nextAwait()) -> cin >> x
    if (ts.isCallExpression(init) && ts.isIdentifier(init.expression) && init.expression.text==='Number' && init.arguments.length===1) {
      let a=init.arguments[0];
      if (ts.isAwaitExpression(a)) a=a.expression;
      if (this.isCall(a,'nextAwait')) {
        const t=this.isRealIdentifier(decl.name)?TypeInfo.real():TypeInfo.number();
        this.env.set(name,t); return `${typeToCpp(t)} ${name}; cin>>${name};`;
      }
    }
    // (await nextAwait()).split(" ").map(Number)
    if (ts.isCallExpression(init) && ts.isPropertyAccessExpression(init.expression) && init.expression.name.text==='map' && init.arguments.length===1 && ts.isIdentifier(init.arguments[0]) && init.arguments[0].text==='Number') {
      const splitCall=init.expression.expression;
      if (ts.isCallExpression(splitCall) && ts.isPropertyAccessExpression(splitCall.expression) && splitCall.expression.name.text==='split') {
        let base=splitCall.expression.expression;
        if (ts.isParenthesizedExpression(base)) base=base.expression;
        if (ts.isAwaitExpression(base)) base=base.expression;
        if (this.isCall(base,'nextAwait')) {
          const t=TypeInfo.vector(TypeInfo.number());
          this.env.set(name,t);
          return `vector<ll> ${name}; { string _line; getline(cin>>ws,_line); stringstream _ss(_line); ll _x; while(_ss>>_x) ${name}.push_back(_x); }`;
        }
      }
    }

    // Input shortcuts.
    if (this.isCall(init,'nextNum')||this.isCall(init,'nextBigInt')) {
      const t=this.isRealIdentifier(decl.name)?TypeInfo.real():TypeInfo.number();
      this.env.set(name,t); return `${typeToCpp(t)} ${name}; cin>>${name};`;
    }
    if (this.isCall(init,'next')) {
      this.env.set(name,TypeInfo.string()); return `string ${name}; cin>>${name};`;
    }
    if (this.isCall(init,'nextNums')||this.isCall(init,'nextBigInts')||this.isCall(init,'nexts')) {
      const st=this.isCall(init,'nexts')?TypeInfo.string():TypeInfo.number();
      let t=annotated.kind==='unknown'?TypeInfo.vector(st):annotated;
      t=this.applyRealPromotion(name,t,decl.name);
      t=this.applyU64Promotion(name,t,decl.name);
      this.env.set(name,t);
      const n=init.arguments[0]?this.emitExpr(init.arguments[0]):'0';
      return `${typeToCpp(t)} ${name}(${n}); for(auto &x:${name}) cin>>x;`;
    }
    const chain=this.tryInputVectorChain(init,name,annotated);
    if (chain) return chain;

    // Empty array + annotation.
    if (ts.isArrayLiteralExpression(init) && init.elements.length===0) {
      let t=annotated.kind==='unknown'?TypeInfo.vector(TypeInfo.number()):annotated;
      t=this.applyRealPromotion(name,t,decl.name);
      t=this.applyU64Promotion(name,t,decl.name);
      const w=this.tupleWidths.get(name);
      if (w && t.kind==='vector' && t.elem?.kind==='vector') t=TypeInfo.vector(TypeInfo.array(t.elem.elem,w));
      this.env.set(name,t); return `${typeToCpp(t)} ${name};`;
    }

    // Array constructors.
    const fac=this.emitArrayFactory(init,annotated);
    if (fac) {
      let t=annotated.kind==='unknown'?fac.type:annotated;
      t=this.applyRealPromotion(name,t,decl.name);
      t=this.applyU64Promotion(name,t,decl.name);
      this.env.set(name,t);
      // Re-emit the factory with the promoted expected type so fill(0) becomes vector<double>, etc.
      const promotedFac=this.emitArrayFactory(init,t) || fac;
      const cppType=typeToCpp(t);
      // Prefer direct initialization for factory expressions of the same type.
      // Besides being shorter, `vector<set<string>> set(K);` avoids the C++ name
      // lookup trap in `vector<set<string>> set=vector<set<string>>(K);`.
      if (promotedFac.code.startsWith(cppType+'(') && promotedFac.code.endsWith(')')) {
        return `${cppType} ${name}${promotedFac.code.slice(cppType.length)};`;
      }
      return `${cppType} ${name}=${promotedFac.code};`;
    }

    // User-template queue idiom: [[number,number,string]] with later push([..])
    // is treated as a growable vector of fixed records.
    if (ts.isArrayLiteralExpression(init) && annotated.kind==='array' && annotated.size===1 && annotated.elem?.kind==='tuple') {
      const t=TypeInfo.vector(annotated.elem);
      this.env.set(name,t);
      const body=init.elements.map(e=>this.emitExpr(e,annotated.elem)).join(',');
      return `${typeToCpp(t)} ${name}={${body}};`;
    }

    // Array literal: prefer std::array for fixed tuples nested in a vector-style literal.
    if (ts.isArrayLiteralExpression(init)) {
      const inferred=this.inferExpr(init);
      const queueType=this.inferQueueLiteralType(init,annotated);
      let t=queueType || (annotated.kind==='unknown'?inferred:annotated);
      // Top-level [1,2,3] is usually a mutable TS array => vector; nested tuples remain array.
      if (!queueType && annotated.kind==='unknown') t=TypeInfo.vector(inferred.elem);
      t=this.applyRealPromotion(name,t,decl.name);
      t=this.applyU64Promotion(name,t,decl.name);
      this.env.set(name,t);
      const body=init.elements.map(e => {
        if (ts.isArrayLiteralExpression(e)) {
          // If the outer container already has a fixed record type, use it as the
          // contextual type.  This is essential for fields such as [] in
          // `let que:any[]=[[pos,par,"",[],0]]`.
          if (t.kind==='vector' && (t.elem?.kind==='tuple'||t.elem?.kind==='array'||t.elem?.kind==='vector')) return this.emitExpr(e,t.elem);
          const et=this.normalizeQueueRecordType(this.inferExpr(e));
          if (et.kind==='tuple') return this.emitExpr(e,et);
          return `array<${typeToCpp(et.elem)},${e.elements.length}>{${e.elements.map(x=>this.emitExpr(x,et.elem)).join(',')}}`;
        }
        return this.emitExpr(e,t.elem);
      }).join(',');
      return `${typeToCpp(t)} ${name}={${body}};`;
    }

    // Common template classes used by AtCoder/AHC solutions.
    if (ts.isNewExpression(init) && init.expression.getText(this.sf)==='UnionFind') {
      const args=init.arguments||[];
      this.env.set(name,TypeInfo.custom('UnionFind',{nativeDSU:!!this.templateCaps.dsu}));
      if (this.templateCaps.dsu) {
        return `DSU ${name}(${args.map(x=>this.emitExpr(x)).join(',')});`;
      }
      this.needHelpers.add('union_find');
      return `UnionFind ${name}(${args.map(x=>this.emitExpr(x)).join(',')});`;
    }
    if (ts.isNewExpression(init) && init.expression.getText(this.sf)==='PriorityQueue') {
      // The C++ template has minpq/maxpq, but TypeScript PriorityQueue accepts an
      // arbitrary numeric comparator and pop() returns the removed value. Keep the
      // small compatibility adapter so conversion preserves those semantics exactly.
      this.needHelpers.add('priority_queue');
      const elem=init.typeArguments?.length?this.typeFromTypeNode(init.typeArguments[0]):TypeInfo.unknown();
      const qt=TypeInfo.custom('PriorityQueue',{elem,nativePQ:false});
      this.env.set(name,qt);
      const args=init.arguments||[];
      const cmp=args[0]?this.emitLambda(args[0]):`[&](const auto& a,const auto& b){ return a-b; }`;
      return `TsPriorityQueue<${typeToCpp(elem)}> ${name}(${cmp});`;
    }

    // new Set / new Map.
    if (ts.isNewExpression(init)) {
      let t=annotated.kind==='unknown'?this.inferExpr(init):annotated;
      t=this.applyRealPromotion(name,t,decl.name);
      t=this.applyU64Promotion(name,t,decl.name);
      this.env.set(name,t);
      return `${typeToCpp(t)} ${name}=${this.emitExpr(init,t)};`;
    }

    // Arrow/function variable.
    if (ts.isArrowFunction(init)||ts.isFunctionExpression(init)) {
      this.env.set(name,TypeInfo.unknown());
      return `auto ${name}=${this.emitLambda(init)};`;
    }

    let t=annotated.kind==='unknown'?this.inferExpr(init):annotated;
    t=this.applyRealPromotion(name,t,decl.name);
      t=this.applyU64Promotion(name,t,decl.name);
    if (t.kind==='unknown') {
      // auto is valid for most non-empty expressions and much safer than guessing ll.
      this.env.set(name,t);
      return `auto ${name}=${this.emitExpr(init)};`;
    }
    this.env.set(name,t);
    return `${typeToCpp(t)} ${name}=${this.emitExpr(init,t)};`;
  }

  emitBindingDecl(decl) {
    const pat=decl.name;
    const names=pat.elements.map(e=>ts.isOmittedExpression(e)?null:(e.name?.getText(this.sf) || e.getText(this.sf)));
    const init=decl.initializer;
    if (!init) return `/* TODO binding */`;

    // let [a,b] = (await nextAwait()).split(" ").map(Number)
    // Interactive AHC input is token based here, so lower directly to cin.
    let isAwaitNumberLine=false;
    if (ts.isCallExpression(init) && ts.isPropertyAccessExpression(init.expression) && init.expression.name.text==='map' && init.arguments.length===1 && ts.isIdentifier(init.arguments[0]) && init.arguments[0].text==='Number') {
      const splitCall=init.expression.expression;
      if (ts.isCallExpression(splitCall) && ts.isPropertyAccessExpression(splitCall.expression) && splitCall.expression.name.text==='split') {
        let base=splitCall.expression.expression;
        if (ts.isParenthesizedExpression(base)) base=base.expression;
        if (ts.isAwaitExpression(base)) base=base.expression;
        if (this.isCall(base,'nextAwait')) isAwaitNumberLine=true;
      }
    }
    if (isAwaitNumberLine) {
      const decls=[], reads=[];
      for (let i=0;i<names.length;i++) {
        const n=names[i];
        if (n==null) { const tmp=`__ts2cpp_skip${this.tmpId++}`; decls.push(`ll ${tmp};`); reads.push(tmp); continue; }
        const be=pat.elements[i];
        const id=be && !ts.isOmittedExpression(be) && ts.isIdentifier(be.name)?be.name:null;
        const t=id&&this.isRealIdentifier(id)?TypeInfo.real():TypeInfo.number();
        this.env.set(n,t); decls.push(`${typeToCpp(t)} ${n};`); reads.push(n);
      }
      return `${decls.join(' ')} cin>>${reads.join('>>')};`;
    }

    if (this.isCall(init,'nextNums')||this.isCall(init,'nextBigInts')) {
      const decls=[], reads=[];
      for (let i=0;i<names.length;i++) {
        const n=names[i];
        if (n==null) { const tmp=`__ts2cpp_skip${this.tmpId++}`; decls.push(`ll ${tmp};`); reads.push(tmp); continue; }
        const be=pat.elements[i];
        const id=be && !ts.isOmittedExpression(be) && ts.isIdentifier(be.name)?be.name:null;
        const t=id&&this.isRealIdentifier(id)?TypeInfo.real():TypeInfo.number();
        this.env.set(n,t);
        decls.push(`${typeToCpp(t)} ${n};`); reads.push(n);
      }
      return `${decls.join(' ')} cin>>${reads.join('>>')};`;
    }
    const initType=this.inferExpr(init);
    if (initType.kind==='tuple') names.forEach((n,i)=>{ if(n!=null) this.env.set(n,initType.elems[i]||TypeInfo.unknown()); });
    else if (initType.kind==='array'||initType.kind==='vector') names.forEach(n=>{ if(n!=null) this.env.set(n,initType.elem); });
    else names.forEach(n=>{ if(n!=null) this.env.set(n,TypeInfo.unknown()); });

    // Omitted elements such as `let [,i] = ...` are not legal C++ structured bindings.
    // Materialize the source once and copy only the requested indices.
    if (names.some(n=>n==null)) {
      const id=this.tmpId++;
      const tmp=`__ts2cpp_bind${id}`;
      const lines=[`auto&& ${tmp}=${this.emitExpr(init)};`];
      for (let i=0;i<names.length;i++) {
        const n=names[i]; if(n==null) continue;
        let et=TypeInfo.unknown();
        if (initType.kind==='tuple') et=initType.elems[i]||TypeInfo.unknown();
        else if (initType.kind==='array'||initType.kind==='vector') et=initType.elem;
        lines.push(`${et.kind==='unknown'?'auto':typeToCpp(et)} ${n}=${tmp}[${i}];`);
      }
      return lines.join(' ');
    }

    if (ts.isArrayLiteralExpression(init) && init.elements.length===names.length) {
      return `auto [${names.join(',')}]=array{${init.elements.map(x=>this.emitExpr(x)).join(',')}};`;
    }
    // std::vector is not tuple-like, so C++ structured binding cannot destructure it.
    // TypeScript array destructuring copies each selected element. Emit that explicitly.
    if (initType.kind==='vector') {
      const id=this.tmpId++;
      const tmp=`__ts2cpp_bind${id}`;
      const et=initType.elem.kind==='unknown'?TypeInfo.number():initType.elem;
      const lines=[`auto&& ${tmp}=${this.emitExpr(init)};`];
      for (let i=0;i<names.length;i++) lines.push(`${typeToCpp(et)} ${names[i]}=${tmp}[${i}];`);
      return lines.join(' ');
    }
    return `auto [${names.join(',')}]=${this.emitExpr(init)};`;
  }

  emitVariableStatement(st) {
    return st.declarationList.declarations.map(d=>this.emitVarDecl(d,(st.declarationList.flags&ts.NodeFlags.Const)!==0)).join('\n');
  }

  containsLabeledContinue(node,label) {
    let found=false;
    const visit=(n)=>{
      if (found) return;
      if (ts.isContinueStatement(n) && n.label?.text===label) { found=true; return; }
      ts.forEachChild(n,visit);
    };
    visit(node);
    return found;
  }

  emitStatement(st, level=0) {
    if (ts.isBlock(st)) return this.emitBlock(st,level);
    if (ts.isVariableStatement(st)) return this.emitVariableStatement(st);
    if (ts.isExpressionStatement(st)) return this.emitExpressionStatement(st.expression);
    if (ts.isIfStatement(st)) {
      let s=`if(${this.emitExpr(st.expression)}) ${this.statementAsBlock(st.thenStatement,level)}`;
      if (st.elseStatement) s+=` else ${ts.isIfStatement(st.elseStatement)?this.emitStatement(st.elseStatement,level):this.statementAsBlock(st.elseStatement,level)}`;
      return s;
    }
    if (ts.isForStatement(st)) {
      let init='';
      if (st.initializer) {
        if (ts.isVariableDeclarationList(st.initializer)) {
          const ds=[];
          for (const d of st.initializer.declarations) {
            if (ts.isIdentifier(d.name)) {
              const name=d.name.text; this.env.set(name,TypeInfo.number());
              ds.push(`${name}${d.initializer?'='+this.emitExpr(d.initializer):''}`);
            }
          }
          init=ds.length?`${NUM} ${ds.join(',')}`:'';
        } else init=this.emitExpr(st.initializer);
      }
      return `for(${init};${st.condition?this.emitExpr(st.condition):''};${st.incrementor?this.emitExpr(st.incrementor):''}) ${this.statementAsBlock(st.statement,level)}`;
    }
    if (ts.isForOfStatement(st)) {
      const iterT=this.inferExpr(st.expression);
      const iterCode=this.emitExpr(st.expression);
      if (ts.isVariableDeclarationList(st.initializer)) {
        const d=st.initializer.declarations[0];
        // In JS/TS, iterating a string yields one-character strings; C++ yields char. Preserve TS semantics.
        if (iterT.kind==='string' && ts.isIdentifier(d.name)) {
          const name=d.name.text, id=this.tmpId++, ch=`__ts2cpp_ch${id}`;
          const saved=new Map(this.env); this.env.set(name,TypeInfo.string());
          let inner;
          if (ts.isBlock(st.statement)) {
            const lines=st.statement.statements.map(x=>this.emitStatement(x,level+1));
            inner=`{\n${indent(`string ${name}(1,${ch});`+(lines.length?'\n'+lines.join('\n'):''))}\n}`;
          } else {
            inner=`{\n${indent(`string ${name}(1,${ch});\n${this.emitStatement(st.statement,level+1)}`)}\n}`;
          }
          this.env=saved;
          return `for(char ${ch}:${iterCode}) ${inner}`;
        }
        let lhs='auto x';
        const elemT=(iterT.kind==='vector'||iterT.kind==='array')?iterT.elem:TypeInfo.unknown();
        if (ts.isIdentifier(d.name)) { lhs=`auto ${d.name.text}`; this.env.set(d.name.text,elemT); }
        else if (ts.isArrayBindingPattern(d.name)) {
          const ns=d.name.elements.map(e=>e.name.getText(this.sf));
          lhs=`auto [${ns.join(',')}]`;
          ns.forEach((n,i)=>this.env.set(n,elemT.kind==='tuple'?(elemT.elems[i]||TypeInfo.unknown()):(elemT.kind==='array'?elemT.elem:TypeInfo.unknown())));
        }
        return `for(${lhs}:${iterCode}) ${this.statementAsBlock(st.statement,level)}`;
      }
      return `for(${this.emitExpr(st.initializer)}:${iterCode}) ${this.statementAsBlock(st.statement,level)}`;
    }
    if (ts.isWhileStatement(st)) return `while(${this.emitExpr(st.expression)}) ${this.statementAsBlock(st.statement,level)}`;
    if (ts.isDoStatement(st)) return `do ${this.statementAsBlock(st.statement,level)} while(${this.emitExpr(st.expression)});`;
    if (ts.isReturnStatement(st)) return st.expression?`return ${this.emitExpr(st.expression,this.returnExpected)};`:(this.inMainBody?'return 0;':'return;');
    if (ts.isLabeledStatement(st)) {
      const rawLabel=st.label.text;
      const label=rawLabel.replace(/[^A-Za-z0-9_]/g,'_');
      const inner=this.emitStatement(st.statement,level);
      const cont=this.containsLabeledContinue(st.statement,rawLabel) ? `__ts2cpp_continue_${label}: ` : '';
      return `${cont}${inner}\n__ts2cpp_break_${label}: ;`;
    }
    if (ts.isBreakStatement(st)) return st.label?`goto __ts2cpp_break_${st.label.text};`:'break;';
    if (ts.isContinueStatement(st)) return st.label?`goto __ts2cpp_continue_${st.label.text};`:'continue;';
    if (ts.isEmptyStatement(st)) return ';';
    if (ts.isFunctionDeclaration(st) && st.name && st.body) {
      // Local named function. Generic lambda supports non-recursive helpers; recursive helpers get warning.
      this.warn(st,`Local function '${st.name.text}' is emitted as a lambda; recursive calls may require manual self-parameter conversion.`);
      const fake={...st, parameters:st.parameters, body:st.body};
      return `auto ${st.name.text}=${this.emitLambda(fake)};`;
    }
    if (ts.isSwitchStatement(st)) {
      const clauses=[];
      for (const c of st.caseBlock.clauses) {
        let h=ts.isCaseClause(c)?`case ${this.emitExpr(c.expression)}:`:'default:';
        const body=c.statements.map(x=>this.emitStatement(x,level+1)).join('\n');
        clauses.push(`${h}\n${indent(body)}`);
      }
      return `switch(${this.emitExpr(st.expression)}){\n${indent(clauses.join('\n'))}\n}`;
    }
    this.warn(st,`Unsupported statement: ${st.getText(this.sf).slice(0,120)}`);
    return `/* TODO(ts2cpp): ${st.getText(this.sf).replace(/\*\//g,'* /')} */`;
  }

  statementAsBlock(st,level=0) {
    if (ts.isBlock(st)) return this.emitBlock(st,level);
    return `{\n${indent(this.emitStatement(st,level+1))}\n}`;
  }

  emitBlock(block, level=0, lambda=false) {
    const oldEnv=new Map(this.env);
    const lines=[];
    for (const st of block.statements) lines.push(this.emitStatement(st,level+1));
    this.env=oldEnv;
    return `{\n${indent(lines.join('\n'))}\n}`;
  }

  emitExpressionStatement(e) {
    // Array.length assignment used as a mutating statement.
    // `a.length = 0` -> clear(), otherwise resize().
    if (
      ts.isBinaryExpression(e)
      && e.operatorToken.kind===ts.SyntaxKind.EqualsToken
      && ts.isPropertyAccessExpression(e.left)
      && e.left.name.text==='length'
    ) {
      const obj=this.emitExpr(e.left.expression);
      if (ts.isNumericLiteral(e.right) && Number(e.right.text)===0) return `${obj}.clear();`;
      return `${obj}.resize(${this.emitExpr(e.right)});`;
    }

    // console.log / println / print
    if (ts.isCallExpression(e)) {
      if (ts.isIdentifier(e.expression) && ['println','print'].includes(e.expression.text)) return this.emitOutput(e.expression.text,e.arguments);
      // Standalone input consumption, e.g. `nextNums(2);` when fields are intentionally ignored.
      if (ts.isIdentifier(e.expression) && ['nextNums','nextBigInts'].includes(e.expression.text)) {
        const n=e.arguments[0]?this.emitExpr(e.arguments[0]):'1';
        const id=this.tmpId++;
        return `for(ll __ts2cpp_i${id}=0;__ts2cpp_i${id}<${n};__ts2cpp_i${id}++){ ll __ts2cpp_dummy${id}; cin>>__ts2cpp_dummy${id}; }`;
      }
      if (ts.isPropertyAccessExpression(e.expression) && e.expression.expression.getText(this.sf)==='console' && e.expression.name.text==='log') { const out=this.emitOutput('println',e.arguments); return out.replace(/<<'\\n';$/, '<<endl;'); }

      // sort mutates in-place.
      if (ts.isPropertyAccessExpression(e.expression) && e.expression.name.text==='sort') {
        const obj=this.emitExpr(e.expression.expression);
        if (e.arguments.length===0) return `sort(${obj}.begin(),${obj}.end());`;
        const cmp=this.emitComparator(e.arguments[0]);
        return cmp?`sort(${obj}.begin(),${obj}.end(),${cmp});`:`sort(${obj}.begin(),${obj}.end());`;
      }
      if (ts.isPropertyAccessExpression(e.expression) && e.expression.name.text==='reverse') {
        const obj=this.emitExpr(e.expression.expression); return `reverse(${obj}.begin(),${obj}.end());`;
      }
      if (ts.isPropertyAccessExpression(e.expression) && e.expression.name.text==='pop') {
        const bt=this.inferExpr(e.expression.expression);
        const obj=this.emitExpr(e.expression.expression);
        if (bt.kind==='custom' && bt.name==='PriorityQueue') return `${obj}.pop();`;
        return `${obj}.pop_back();`;
      }
      if (ts.isPropertyAccessExpression(e.expression) && e.expression.name.text==='set') {
        const obj=this.emitExpr(e.expression.expression); return `${obj}[${this.emitExpr(e.arguments[0])}]=${this.emitExpr(e.arguments[1])};`;
      }
    }

    // Destructuring assignment from input, e.g. [X[i],Y[i]] = nextNums(2).
    if (ts.isBinaryExpression(e) && e.operatorToken.kind===ts.SyntaxKind.EqualsToken && ts.isArrayLiteralExpression(e.left) && ts.isCallExpression(e.right) && ts.isIdentifier(e.right.expression) && ['nextNums','nextBigInts'].includes(e.right.expression.text)) {
      const L=e.left.elements;
      return `cin>>${L.map(x=>this.emitExpr(x)).join('>>')};`;
    }

    // Destructuring assignment / swap.
    if (ts.isBinaryExpression(e) && e.operatorToken.kind===ts.SyntaxKind.EqualsToken && ts.isArrayLiteralExpression(e.left) && ts.isArrayLiteralExpression(e.right)) {
      const L=e.left.elements, R=e.right.elements;
      if (L.length===2&&R.length===2 && L[0].getText(this.sf)===R[1].getText(this.sf) && L[1].getText(this.sf)===R[0].getText(this.sf)) {
        return `swap(${this.emitExpr(L[0])},${this.emitExpr(L[1])});`;
      }
      return `tie(${L.map(x=>this.emitExpr(x)).join(',')})=make_tuple(${R.map(x=>this.emitExpr(x)).join(',')});`;
    }
    return `${this.emitExpr(e)};`;
  }

  emitOutput(kind,args) {
    // User template overload: println(array, separator) / print(array, separator).
    if (args.length===2 && ts.isStringLiteral(args[1])) {
      const sep=JSON.stringify(args[1].text);
      if (ts.isArrayLiteralExpression(args[0])) {
        const es=args[0].elements.map(x=>this.emitExpr(x));
        let out='cout';
        for (let i=0;i<es.length;i++) {
          if (i) out+=`<<${sep}`;
          out+=`<<${es[i]}`;
        }
        if (kind==='println') out+=`<<'\\n'`;
        return out+';';
      }
      const obj=this.emitExpr(args[0]);
      return `for(int i=0;i<(int)${obj}.size();i++){ if(i) cout<<${sep}; cout<<${obj}[i]; }${kind==='println'?" cout<<'\\n';":''}`;
    }
    if (args.length===1 && ts.isCallExpression(args[0]) && ts.isPropertyAccessExpression(args[0].expression) && args[0].expression.name.text==='join') {
      const call=args[0], obj=this.emitExpr(call.expression.expression), sep=call.arguments[0]&&ts.isStringLiteral(call.arguments[0])?call.arguments[0].text:' ';
      if (sep===' ') return `for(int i=0;i<(int)${obj}.size();i++){ if(i) cout<<' '; cout<<${obj}[i]; }${kind==='println'?" cout<<'\\n';":''}`;
    }
    if (args.length===0) return kind==='println'?`cout<<'\\n';`:';';
    let s='cout';
    args.forEach((a,i)=>{ if(i)s+=`<<' '`; s+=`<<${this.emitExpr(a)}`; });
    if (kind==='println') s+=`<<'\\n'`;
    return s+';';
  }

  emitTopLevelFunction(st) {
    if (!ts.isFunctionDeclaration(st) || !st.name || !st.body) return '';
    const saved=new Map(this.env);
    const params=[];
    for (const p of st.parameters) {
      if (!ts.isIdentifier(p.name)) {
        this.warn(p,'Unsupported top-level function parameter pattern.');
        params.push(`auto ${p.name.getText(this.sf)}`);
        continue;
      }
      const pt=this.typeFromTypeNode(p.type);
      this.env.set(p.name.text,pt);
      const def=p.initializer?`=${this.emitExpr(p.initializer,pt)}`:'';
      params.push(`${pt.kind==='unknown'?'auto':typeToCpp(pt)} ${p.name.text}${def}`);
    }
    const rt=this.typeFromTypeNode(st.type);
    const ret=rt.kind==='unknown'?'auto':typeToCpp(rt);
    const body=this.emitBlock(st.body);
    this.env=saved;
    const tps=st.typeParameters?.length?`template<${st.typeParameters.map(tp=>`class ${tp.name.text}`).join(',')}>\n`:'';
    return `${tps}${ret} ${st.name.text}(${params.join(',')}) ${body}`;
  }

  emitDependencyStatement(st) {
    if (ts.isVariableStatement(st)) return this.emitVariableStatement(st);
    if (ts.isFunctionDeclaration(st)) return this.emitTopLevelFunction(st);
    if (ts.isClassDeclaration(st)) {
      this.warn(st,`Dependency class '${st.name?.text||''}' is not yet class-lowered.`);
      return `/* TODO(ts2cpp class): ${st.name?.text||''} */`;
    }
    return '';
  }

  render(mode='full') {
    const main=this.findMain();
    const depTexts=[];
    if (this.deps && main) {
      for (const st of this.dependencyDefs(main)) {
        const text=this.emitDependencyStatement(st);
        if (text) depTexts.push(text);
      }
      // Standard template constants can be synthesized when the user supplies only main().
      const ids=this.identifiersIn(main.body);
      if (ids.has('dxy4') && !this.topLevelDefs.has('dxy4')) depTexts.unshift('vector<array<ll,2>> dxy4={{-1,0},{0,1},{1,0},{0,-1}};');
      if (ids.has('dxy8') && !this.topLevelDefs.has('dxy8')) depTexts.unshift('vector<array<ll,2>> dxy8={{-1,0},{-1,1},{0,1},{1,1},{1,0},{1,-1},{0,-1},{-1,-1}};');
      if (ids.has('dir4') && !this.topLevelDefs.has('dir4')) depTexts.unshift('vector<string> dir4={"U","R","D","L"};');
    }
    const body=main?.body || {statements:this.sf.statements};
    const lines=[];
    const savedMain=this.inMainBody;
    this.inMainBody=!!main;
    for (const st of body.statements) lines.push(this.emitStatement(st));
    this.inMainBody=savedMain;
    const bodyText=lines.join('\n');
    if (mode==='body') return bodyText+'\n';
    const mainText=`int main(){\n  ios::sync_with_stdio(false);\n  cin.tie(nullptr);\n\n${indent(bodyText)}\n\n  return 0;\n}`;
    const depsText=depTexts.length?depTexts.join('\n\n')+'\n\n':'';
    // --main-only is intended to be pasted into the user's C++ template.
    // Include any generic helper functions required by the converted main/dependencies.
    // AHC runtime types (Timer/RNG/Annealing) remain owned by the user's C++ template.
    if (mode==='main') {
      const helperText=templateExtraHelpers(this.needHelpers);
      return (helperText?helperText+'\n\n':'')+depsText+mainText+'\n';
    }
    // Internal mode for --cpp-template: applyCppTemplate() injects helpers itself,
    // so keep this block bare to avoid duplicate definitions.
    if (mode==='main-bare') return depsText+mainText+'\n';
    return this.header()+depsText+mainText+'\n';
  }

  header() {
    const hs=[
      '// Generated by ts_main_to_cpp_v32',
      '#include <bits/stdc++.h>',
      'using namespace std;',
      '',
      'using ll=long long;',
      'constexpr ll LINF=(1LL<<62);',
      'constexpr ll MOD998244353=998244353;',
      'constexpr ll MOD1000000007=1000000007;',
      'const string yes="Yes",no="No";',
    ];
    if (this.needHelpers.has('unique_preserve')) hs.push('',`template<class T> vector<T> unique_preserve(const vector<T>& a){ set<T> seen; vector<T> r; for(const auto& x:a) if(seen.insert(x).second) r.push_back(x); return r; }`);
    if (this.needHelpers.has('vec_slice')) hs.push('',`template<class T> vector<T> vec_slice(const vector<T>& a,ll l,ll r){ l=max<ll>(0,l); r=min<ll>(a.size(),r); if(l>r)l=r; return vector<T>(a.begin()+l,a.begin()+r); }`);
    if (this.needHelpers.has('join_vec')) hs.push('',`template<class T> string join_vec(const vector<T>& a,const string& sep){ ostringstream os; for(size_t i=0;i<a.size();i++){ if(i)os<<sep; os<<a[i]; } return os.str(); }`);
    if (this.needHelpers.has('to_string_any')) hs.push('',`inline string to_string_any(const string& x){ return x; } inline string to_string_any(const char* x){ return string(x); } inline string to_string_any(char x){ return string(1,x); } inline string to_string_any(bool x){ return x?"true":"false"; } template<class T> string to_string_any(const T& x){ ostringstream os; os<<x; return os.str(); }`);
    if (this.needHelpers.has('number_any')) hs.push('',`inline double ts_number_any(const string& s){ if(s.empty()) return 0.0; char* e=nullptr; double v=strtod(s.c_str(),&e); if(e==s.c_str()) return numeric_limits<double>::quiet_NaN(); while(*e && isspace((unsigned char)*e)) ++e; if(*e) return numeric_limits<double>::quiet_NaN(); return v; } inline double ts_number_any(char c){ char s[2]={c,0}; return ts_number_any(string(s)); } inline double ts_number_any(bool x){ return x?1.0:0.0; } template<class T,enable_if_t<is_arithmetic_v<T>,int> =0> double ts_number_any(T x){ return (double)x; }`);
    if (this.needHelpers.has('union_find')) hs.push('',`struct UnionFind{
  vector<int> p,s;
  explicit UnionFind(int n):p(n),s(n,1){ iota(p.begin(),p.end(),0); }
  int root(int x){ return p[x]==x?x:p[x]=root(p[x]); }
  bool connect(int a,int b){ a=root(a); b=root(b); if(a==b) return false; if(s[a]<s[b]) swap(a,b); p[b]=a; s[a]+=s[b]; return true; }
  bool same(int a,int b){ return root(a)==root(b); }
  int size(int x){ return s[root(x)]; }
};`);
    if (this.needHelpers.has('priority_queue')) hs.push('',`template<class T> struct TsPriorityQueue{
  function<double(const T&,const T&)> cmp;
  vector<T> h;
  template<class F> explicit TsPriorityQueue(F f):cmp(f){}
  bool better(const T& a,const T& b) const{ return cmp(a,b)<0; }
  void push(T x){ h.push_back(move(x)); int i=(int)h.size()-1; while(i){ int p=(i-1)/2; if(!better(h[i],h[p])) break; swap(h[i],h[p]); i=p; } }
  T pop(){ T r=move(h[0]); if(h.size()==1){ h.pop_back(); return r; } h[0]=move(h.back()); h.pop_back(); int i=0; while(true){ int l=i*2+1,rn=l+1,b=i; if(l<(int)h.size()&&better(h[l],h[b])) b=l; if(rn<(int)h.size()&&better(h[rn],h[b])) b=rn; if(b==i) break; swap(h[i],h[b]); i=b; } return r; }
  const T& top() const{ return h[0]; }
  bool empty() const{ return h.empty(); }
  size_t size() const{ return h.size(); }
};`);
    if (this.needHelpers.has('ahc_timer')) hs.push('',`struct Timer{
  using Clock=chrono::steady_clock;
  Clock::time_point startTime;
  Timer(){ reset(); }
  void reset(){ startTime=Clock::now(); }
  double elapsed() const{ return chrono::duration<double>(Clock::now()-startTime).count(); }
  double elapsedMs() const{ return elapsed()*1000.0; }
  bool over(double limit) const{ return elapsed()>=limit; }
  double progress(double limit) const{ if(limit<=0) return 1.0; return min(1.0,elapsed()/limit); }
};`);
    if (this.needHelpers.has('ahc_rng')) hs.push('',`struct RNG{
  using result_type=uint64_t;
  uint64_t x;
  explicit RNG(uint64_t seed=0x3141592653589793ULL){ x=seed; if(x==0) x=0x9e3779b97f4a7c15ULL; }
  static constexpr result_type min(){ return numeric_limits<result_type>::min(); }
  static constexpr result_type max(){ return numeric_limits<result_type>::max(); }
  uint64_t operator()(){ x^=x>>12; x^=x<<25; x^=x>>27; return x*2685821657736338717ULL; }
  uint64_t nextU64(){ return operator()(); }
  int nextInt(int n){ assert(n>0); uint64_t v=operator()(); return (int)(((__uint128_t)v*(uint64_t)n)>>64); }
  int nextInt(int l,int r){ assert(l<r); return l+nextInt(r-l); }
  ll nextLL(ll l,ll r){ assert(l<r); uint64_t range=(uint64_t)(r-l); uint64_t v=operator()(); uint64_t d=(uint64_t)(((__uint128_t)v*range)>>64); return l+(ll)d; }
  double nextDouble(){ return (operator()()>>11)*0x1.0p-53; }
  double nextDouble(double l,double r){ return l+(r-l)*nextDouble(); }
  bool nextBool(){ return operator()()>>63; }
  bool nextBool(double p){ return nextDouble()<p; }
  template<class It> void shuffle(It first,It last){ std::shuffle(first,last,*this); }
};`);
    if (this.needHelpers.has('ahc_seed_clock')) hs.push('',`uint64_t seedFromClock(){ uint64_t x=chrono::high_resolution_clock::now().time_since_epoch().count(); x+=0x9e3779b97f4a7c15ULL; x=(x^(x>>30))*0xbf58476d1ce4e5b9ULL; x=(x^(x>>27))*0x94d049bb133111ebULL; return x^(x>>31); }`);
    if (this.needHelpers.has('ahc_annealing')) hs.push('',`struct Annealing{
  double startTemp,endTemp; bool geometric;
  Annealing(double startTemp,double endTemp,bool geometric=false):startTemp(startTemp),endTemp(endTemp),geometric(geometric){}
  double temperature(double progress) const{ progress=clamp(progress,0.0,1.0); if(geometric&&startTemp>0&&endTemp>0) return startTemp*pow(endTemp/startTemp,progress); return startTemp+(endTemp-startTemp)*progress; }
  bool acceptMax(double delta,double temp,RNG& rng) const{ if(delta>=0) return true; if(temp<=0) return false; return rng.nextDouble()<exp(delta/temp); }
  bool acceptMin(double delta,double temp,RNG& rng) const{ return acceptMax(-delta,temp,rng); }
};`);
    if (this.needHelpers.has('date_now')) hs.push('',`inline long long ts2cpp_date_now(){ using namespace chrono; return duration_cast<milliseconds>(steady_clock::now().time_since_epoch()).count(); }`);
    return hs.join('\n')+'\n\n';
  }
}


function findCppMainRange(src) {
  const m=/\bint\s+main\s*\([^)]*\)\s*\{/.exec(src);
  if (!m) throw new Error('C++ template does not contain int main(...){...}');
  const open=src.indexOf('{',m.index);
  let depth=0, state='code';
  for (let i=open;i<src.length;i++) {
    const c=src[i], n=src[i+1]||'';
    if (state==='line') { if (c==='\n') state='code'; continue; }
    if (state==='block') { if (c==='*'&&n==='/') { state='code'; i++; } continue; }
    if (state==='string') { if (c==='\\') { i++; continue; } if (c==='"') state='code'; continue; }
    if (state==='char') { if (c==='\\') { i++; continue; } if (c==="'") state='code'; continue; }
    if (c==='/'&&n==='/') { state='line'; i++; continue; }
    if (c==='/'&&n==='*') { state='block'; i++; continue; }
    if (c==='"') { state='string'; continue; }
    if (c==="'") { state='char'; continue; }
    if (c==='{') depth++;
    else if (c==='}') {
      depth--;
      if (depth===0) return [m.index,i+1];
    }
  }
  throw new Error('Could not find the closing brace of C++ main().');
}

function templateExtraHelpers(needHelpers) {
  const hs=[];
  if (needHelpers.has('unique_preserve')) hs.push(`template<class T> vector<T> unique_preserve(const vector<T>& a){ set<T> seen; vector<T> r; for(const auto& x:a) if(seen.insert(x).second) r.push_back(x); return r; }`);
  if (needHelpers.has('vec_slice')) hs.push(`template<class T> vector<T> vec_slice(const vector<T>& a,ll l,ll r){ l=max<ll>(0,l); r=min<ll>(a.size(),r); if(l>r)l=r; return vector<T>(a.begin()+l,a.begin()+r); }`);
  if (needHelpers.has('join_vec')) hs.push(`template<class T> string join_vec(const vector<T>& a,const string& sep){ ostringstream os; for(size_t i=0;i<a.size();i++){ if(i)os<<sep; os<<a[i]; } return os.str(); }`);
  if (needHelpers.has('to_string_any')) hs.push(`inline string to_string_any(const string& x){ return x; } inline string to_string_any(const char* x){ return string(x); } inline string to_string_any(char x){ return string(1,x); } inline string to_string_any(bool x){ return x?"true":"false"; } template<class T> string to_string_any(const T& x){ ostringstream os; os<<x; return os.str(); }`);
  if (needHelpers.has('number_any')) hs.push(`inline double ts_number_any(const string& s){ if(s.empty()) return 0.0; char* e=nullptr; double v=strtod(s.c_str(),&e); if(e==s.c_str()) return numeric_limits<double>::quiet_NaN(); while(*e && isspace((unsigned char)*e)) ++e; if(*e) return numeric_limits<double>::quiet_NaN(); return v; } inline double ts_number_any(char c){ char s[2]={c,0}; return ts_number_any(string(s)); } inline double ts_number_any(bool x){ return x?1.0:0.0; } template<class T,enable_if_t<is_arithmetic_v<T>,int> =0> double ts_number_any(T x){ return (double)x; }`);
  if (needHelpers.has('union_find')) hs.push(`struct UnionFind{ vector<int> p,s; explicit UnionFind(int n):p(n),s(n,1){ iota(p.begin(),p.end(),0); } int root(int x){ return p[x]==x?x:p[x]=root(p[x]); } bool connect(int a,int b){ a=root(a); b=root(b); if(a==b)return false; if(s[a]<s[b])swap(a,b); p[b]=a; s[a]+=s[b]; return true; } bool same(int a,int b){ return root(a)==root(b); } int size(int x){ return s[root(x)]; } };`);
  if (needHelpers.has('priority_queue')) hs.push(`template<class T> struct TsPriorityQueue{ function<double(const T&,const T&)> cmp; vector<T> h; template<class F> explicit TsPriorityQueue(F f):cmp(f){} bool better(const T&a,const T&b)const{return cmp(a,b)<0;} void push(T x){h.push_back(move(x));int i=(int)h.size()-1;while(i){int p=(i-1)/2;if(!better(h[i],h[p]))break;swap(h[i],h[p]);i=p;}} T pop(){T r=move(h[0]);if(h.size()==1){h.pop_back();return r;}h[0]=move(h.back());h.pop_back();int i=0;while(true){int l=i*2+1,rn=l+1,b=i;if(l<(int)h.size()&&better(h[l],h[b]))b=l;if(rn<(int)h.size()&&better(h[rn],h[b]))b=rn;if(b==i)break;swap(h[i],h[b]);i=b;}return r;} const T& top()const{return h[0];} bool empty()const{return h.empty();} size_t size()const{return h.size();} };`);
  if (needHelpers.has('date_now')) hs.push(`inline long long ts2cpp_date_now(){ using namespace chrono; return duration_cast<milliseconds>(steady_clock::now().time_since_epoch()).count(); }`);
  // Timer/RNG/Annealing/seedFromClock are intentionally omitted: the AHC C++ template owns them.
  return hs.join('\n\n');
}

function detectCppTemplateCapabilities(templateText) {
  return {
    dsu:/\bstruct\s+DSU\b/.test(templateText),
    minpq:/template\s*<\s*class\s+T\s*>\s*using\s+minpq\b/.test(templateText),
    maxpq:/template\s*<\s*class\s+T\s*>\s*using\s+maxpq\b/.test(templateText),
    timer:/\bstruct\s+Timer\b/.test(templateText),
    rng:/\bstruct\s+RNG\b/.test(templateText),
    annealing:/\bstruct\s+Annealing\b/.test(templateText),
    monteCarlo:/\bstruct\s+MonteCarlo\b/.test(templateText)
  };
}

function applyCppTemplate(templateText, convertedMainBlock, needHelpers) {
  const [l,r]=findCppMainRange(templateText);
  // A template may already contain helpers injected by an earlier conversion.
  // Do not emit duplicate definitions when such a template is reused.
  const filtered=new Set(needHelpers);
  if (templateText.includes('unique_preserve(const vector<T>&')) filtered.delete('unique_preserve');
  if (templateText.includes('vec_slice(const vector<T>&')) filtered.delete('vec_slice');
  if (templateText.includes('join_vec(const vector<T>&')) filtered.delete('join_vec');
  if (templateText.includes('to_string_any(const string&')) filtered.delete('to_string_any');
  if (templateText.includes('ts_number_any(const string&')) filtered.delete('number_any');
  if (templateText.includes('ts2cpp_date_now()')) filtered.delete('date_now');
  if (/\bstruct\s+DSU\b/.test(templateText)) filtered.delete('union_find');
  const extra=templateExtraHelpers(filtered);
  const block=(extra?extra+'\n\n':'')+convertedMainBlock.trimEnd();
  return templateText.slice(0,l)+block+templateText.slice(r);
}

const args=parseArgs(process.argv.slice(2));
const src=args.input ? fs.readFileSync(args.input,'utf8') : fs.readFileSync(0,'utf8');
const cppBase=args.cppTemplate ? fs.readFileSync(args.cppTemplate,'utf8') : null;
const templateCaps=cppBase ? detectCppTemplateCapabilities(cppBase) : {};
const conv=new Converter(src,args.input||'stdin.ts',{...args,templateCaps});
let out;
if (args.cppTemplate) {
  if (args.mode!=='full') throw new Error('--cpp-template cannot be combined with --main-only/--body-only');
  // Render once to populate helper requirements, then place only dependencies+main into the user's AHC template.
  conv.render('full');
  const mainBlock=conv.render('main-bare');
  out=applyCppTemplate(cppBase,mainBlock,conv.needHelpers);
} else {
  out=conv.render(args.mode);
}
if (args.output) fs.writeFileSync(args.output,out);
else process.stdout.write(out);
const uniqWarnings=[...new Set(conv.warnings)];
if ((args.warnings || args.strict) && uniqWarnings.length) {
  console.error('\n[ts2cpp warnings]');
  for (const w of uniqWarnings) console.error('- '+w);
}
if (args.check) {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ts2cpp-'));
  const cpp=path.join(dir,'check.cpp');
  const checkOut=(args.cppTemplate || args.mode==='full') ? out : new Converter(src,args.input||'stdin.ts',{...args,mode:'full'}).render('full');
  fs.writeFileSync(cpp,checkOut);
  const r=spawnSync('g++',['-std=c++17','-Wall','-Wextra','-Wpedantic','-fsyntax-only',cpp],{encoding:'utf8'});
  try { fs.rmSync(dir,{recursive:true,force:true}); } catch {}
  if (r.status!==0) {
    console.error('\n[ts2cpp compile check failed]');
    if (r.stdout) console.error(r.stdout.trim());
    if (r.stderr) console.error(r.stderr.trim());
    process.exit(r.status||3);
  }
}
if (args.stats) {
  const lines=out.split('\n').length-1;
  console.error(`[ts2cpp stats] bytes=${Buffer.byteLength(out,'utf8')} lines=${lines} deps=${args.deps?'on':'off'} warnings=${uniqWarnings.length}`);
}
if (args.strict && uniqWarnings.length) process.exit(4);
