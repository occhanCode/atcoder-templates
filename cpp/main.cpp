#include <bits/stdc++.h>
using namespace std;

using ll = long long;
using ull = unsigned long long;
using ld = long double;
using pii = pair<int,int>;
using pll = pair<ll,ll>;

template<class T> using minpq = priority_queue<T,vector<T>,greater<T>>;
template<class T> using maxpq = priority_queue<T>;

constexpr int INF = 1'000'000'000;
constexpr ll LINF = 4'000'000'000'000'000'000LL;

const int dr[4]={-1,0,1,0};
const int dc[4]={0,1,0,-1};
const char dir[4]={'U','R','D','L'};
const char rev[4]={'D','L','U','R'};

template<class T>
bool chmin(T& a,const T& b){
  if(b<a){
    a=b;
    return true;
  }
  return false;
}

template<class T>
bool chmax(T& a,const T& b){
  if(a<b){
    a=b;
    return true;
  }
  return false;
}

template<class T>
T sq(T x){
  return x*x;
}

inline string to_string_any(const string& x){ return x; }
inline string to_string_any(const char* x){ return string(x); }
inline string to_string_any(char x){ return string(1,x); }
inline string to_string_any(bool x){ return x?"true":"false"; }
template<class T> string to_string_any(const T& x){ ostringstream os; os<<x; return os.str(); }

inline double ts_number_any(const string& s){
  if(s.empty()) return 0.0;
  char* e=nullptr;
  double v=strtod(s.c_str(),&e);
  if(e==s.c_str()) return numeric_limits<double>::quiet_NaN();
  while(*e && isspace((unsigned char)*e)) ++e;
  if(*e) return numeric_limits<double>::quiet_NaN();
  return v;
}
inline double ts_number_any(char c){ char s[2]={c,0}; return ts_number_any(string(s)); }
inline double ts_number_any(bool x){ return x?1.0:0.0; }
template<class T,enable_if_t<is_arithmetic_v<T>,int> =0> double ts_number_any(T x){ return (double)x; }

// ================================================================
// Timer
// ================================================================
// AHC で最も頻繁に使う時間管理。
// elapsed()    : reset() からの経過秒
// elapsedMs()   : reset() からの経過ミリ秒
// over(limit)   : limit 秒を超えたか
// progress(limit) : 0.0 ～ 1.0 の時間進捗
//
// chrono::steady_clock を毎反復呼ぶのは無駄があるので、探索中は
//  if((iter&1023)==0 && timer.over(TIME_LIMIT)) break;
// のように数百～数千反復ごとに確認するのがおすすめ。
struct Timer{
  using Clock=chrono::steady_clock;
  Clock::time_point startTime;

  Timer(){
    reset();
  }

  void reset(){
    startTime=Clock::now();
  }

  double elapsed() const{
    return chrono::duration<double>(Clock::now()-startTime).count();
  }

  double elapsedMs() const{
    return elapsed()*1000.0;
  }

  bool over(double limit) const{
    return elapsed()>=limit;
  }

  double progress(double limit) const{
    if(limit<=0) return 1.0;
    return min(1.0,elapsed()/limit);
  }
};

// ================================================================
// Fast RNG : xorshift64*
// ================================================================
// std::mt19937 より軽量な乱数生成器。
// AHC では再現性のため、基本は固定 seed を推奨。
//  RNG rng(123456789ULL);
//
// nextInt(n)    : [0,n)
// nextInt(l,r)   : [l,r)
// nextLL(l,r)   : [l,r)
// nextDouble()   : [0,1)
// nextBool(p)   : 確率 p で true
// shuffle     : std::shuffle 互換
struct RNG{
  using result_type=uint64_t;

  uint64_t x;

  explicit RNG(uint64_t seed=0x3141592653589793ULL){
    x=seed;
    if(x==0) x=0x9e3779b97f4a7c15ULL;
  }

  static constexpr result_type min(){
    return numeric_limits<result_type>::min();
  }

  static constexpr result_type max(){
    return numeric_limits<result_type>::max();
  }

  uint64_t operator()(){
    x^=x>>12;
    x^=x<<25;
    x^=x>>27;
    return x*2685821657736338717ULL;
  }

  uint64_t nextU64(){
    return operator()();
  }

  int nextInt(int n){
    assert(n>0);
    uint64_t v=operator()();
    return (int)(((__uint128_t)v*(uint64_t)n)>>64);
  }

  int nextInt(int l,int r){
    assert(l<r);
    return l+nextInt(r-l);
  }

  ll nextLL(ll l,ll r){
    assert(l<r);
    uint64_t range=(uint64_t)(r-l);
    uint64_t v=operator()();
    uint64_t d=(uint64_t)(((__uint128_t)v*range)>>64);
    return l+(ll)d;
  }

  double nextDouble(){
    return (operator()()>>11)*0x1.0p-53;
  }

  double nextDouble(double l,double r){
    return l+(r-l)*nextDouble();
  }

  bool nextBool(){
    return operator()()>>63;
  }

  bool nextBool(double p){
    return nextDouble()<p;
  }

  template<class It>
  void shuffle(It first,It last){
    std::shuffle(first,last,*this);
  }
};

// 時計から非決定的 seed を作る。
// ローカルで多数 seed を回したいときだけ使い、通常の比較実験では固定 seed 推奨。
uint64_t seedFromClock(){
  uint64_t x=chrono::high_resolution_clock::now().time_since_epoch().count();
  x+=0x9e3779b97f4a7c15ULL;
  x=(x^(x>>30))*0xbf58476d1ce4e5b9ULL;
  x=(x^(x>>27))*0x94d049bb133111ebULL;
  return x^(x>>31);
}

// ================================================================
// Simulated Annealing
// ================================================================
// 焼きなまし用の温度計算と採用判定。
// maximize=true 系の問題なら acceptMax(delta,temp,rng) を使う。
// delta = newScore - oldScore
//  delta >= 0 : 必ず採用
//  delta < 0 : exp(delta/temp) の確率で採用
//
// 温度は linear / geometric の2種類。
// geometric=true は startTemp,endTemp が正のときのみ有効。
struct Annealing{
  double startTemp;
  double endTemp;
  bool geometric;

  Annealing(double startTemp,double endTemp,bool geometric=false)
    :startTemp(startTemp),endTemp(endTemp),geometric(geometric){}

  double temperature(double progress) const{
    progress=clamp(progress,0.0,1.0);

    if(geometric && startTemp>0 && endTemp>0){
      return startTemp*pow(endTemp/startTemp,progress);
    }

    return startTemp+(endTemp-startTemp)*progress;
  }

  bool acceptMax(double delta,double temp,RNG& rng) const{
    if(delta>=0) return true;
    if(temp<=0) return false;
    return rng.nextDouble()<exp(delta/temp);
  }

  bool acceptMin(double delta,double temp,RNG& rng) const{
    return acceptMax(-delta,temp,rng);
  }
};

// ================================================================
// Grid Utility
// ================================================================
struct Pos{
  int r=0,c=0;

  Pos()=default;
  Pos(int r,int c):r(r),c(c){}

  bool operator==(const Pos& p) const{
    return r==p.r && c==p.c;
  }

  bool operator!=(const Pos& p) const{
    return !(*this==p);
  }

  Pos operator+(const Pos& p) const{
    return {r+p.r,c+p.c};
  }

  Pos operator-(const Pos& p) const{
    return {r-p.r,c-p.c};
  }
};

constexpr int DR4[4]={-1,0,1,0};
constexpr int DC4[4]={0,1,0,-1};
constexpr int DR8[8]={-1,-1,-1,0,0,1,1,1};
constexpr int DC8[8]={-1,0,1,-1,1,-1,0,1};

bool inBoard(int r,int c,int H,int W){
  return 0<=r && r<H && 0<=c && c<W;
}

int manhattan(int r1,int c1,int r2,int c2){
  return abs(r1-r2)+abs(c1-c2);
}

int manhattan(Pos a,Pos b){
  return abs(a.r-b.r)+abs(a.c-b.c);
}

int gridId(int r,int c,int W){
  return r*W+c;
}

Pos gridPos(int id,int W){
  return {id/W,id%W};
}

// 4近傍 BFS。
// passable(r,c) が true のマスだけ通れる。
// 戻り値は 1 次元化した dist。未到達は -1。
// 計算量 O(HW)。
template<class Passable>
vector<int> gridBFS(int H,int W,int sr,int sc,Passable passable){
  vector<int> dist(H*W,-1);
  if(!inBoard(sr,sc,H,W) || !passable(sr,sc)) return dist;

  vector<int> que(H*W);
  int head=0,tail=0;

  int s=gridId(sr,sc,W);
  dist[s]=0;
  que[tail++]=s;

  while(head<tail){
    int v=que[head++];
    int r=v/W,c=v%W;

    for(int d=0;d<4;d++){
      int nr=r+DR4[d],nc=c+DC4[d];
      if(!inBoard(nr,nc,H,W) || !passable(nr,nc)) continue;

      int nv=gridId(nr,nc,W);
      if(dist[nv]!=-1) continue;

      dist[nv]=dist[v]+1;
      que[tail++]=nv;
    }
  }

  return dist;
}

// ================================================================
// DSU
// ================================================================
// 連結成分管理。merge/same/size はほぼ O(alpha(N))。
struct DSU{
  vector<int> parent,size_;

  DSU()=default;
  explicit DSU(int n){
    init(n);
  }

  void init(int n){
    parent.resize(n);
    size_.assign(n,1);
    iota(parent.begin(),parent.end(),0);
  }

  int leader(int x){
    while(parent[x]!=x){
      parent[x]=parent[parent[x]];
      x=parent[x];
    }
    return x;
  }

  bool same(int a,int b){
    return leader(a)==leader(b);
  }

  bool merge(int a,int b){
    a=leader(a);
    b=leader(b);
    if(a==b) return false;

    if(size_[a]<size_[b]) swap(a,b);
    parent[b]=a;
    size_[a]+=size_[b];
    return true;
  }

  int size(int x){
    return size_[leader(x)];
  }
};

// ================================================================
// IndexSet
// ================================================================
// 整数 [0,n) の集合を、
//  insert : O(1)
//  erase : O(1)
//  contains: O(1)
//  random : O(1)
// で扱う。
// 焼きなましで「現在動かせる要素からランダムに1つ選ぶ」用途に非常に便利。
struct IndexSet{
  vector<int> values;
  vector<int> pos;

  IndexSet()=default;
  explicit IndexSet(int n){
    init(n);
  }

  void init(int n){
    values.clear();
    pos.assign(n,-1);
  }

  bool contains(int x) const{
    return pos[x]!=-1;
  }

  int size() const{
    return (int)values.size();
  }

  bool empty() const{
    return values.empty();
  }

  bool insert(int x){
    if(pos[x]!=-1) return false;
    pos[x]=(int)values.size();
    values.push_back(x);
    return true;
  }

  bool erase(int x){
    int p=pos[x];
    if(p==-1) return false;

    int y=values.back();
    values[p]=y;
    pos[y]=p;

    values.pop_back();
    pos[x]=-1;
    return true;
  }

  int random(RNG& rng) const{
    assert(!values.empty());
    return values[rng.nextInt((int)values.size())];
  }

  void clear(){
    for(int x:values) pos[x]=-1;
    values.clear();
  }
};

// ================================================================
// Zobrist Hash
// ================================================================
// 状態を高速にハッシュ化し、1箇所の変更を O(1) で hash に反映できる。
// ビーム探索・探索済み判定・重複状態排除で非常に便利。
//
// 例: N マス、それぞれ K 種類の値を持つ盤面
//  ZobristHash zob(N,K,seed);
//  ull h=0;
//  for(int i=0;i<N;i++) h^=zob.value(i,a[i]);
//
// a[p] : oldValue -> newValue に変更するとき
//  zob.change(h,p,oldValue,newValue);
//
// 注意: ハッシュ衝突は理論上あり得る。AHCでは通常 64bit で十分。
struct ZobristHash{
  int n=0,kinds=0;
  vector<uint64_t> table;

  ZobristHash()=default;

  ZobristHash(int n,int kinds,uint64_t seed=0x6a09e667f3bcc909ULL){
    init(n,kinds,seed);
  }

  void init(int n_,int kinds_,uint64_t seed=0x6a09e667f3bcc909ULL){
    n=n_;
    kinds=kinds_;
    table.resize((size_t)n*kinds);
    RNG rng(seed);
    for(uint64_t& x:table) x=rng.nextU64();
  }

  uint64_t value(int index,int state) const{
    return table[(size_t)index*kinds+state];
  }

  void change(uint64_t& hash,int index,int oldState,int newState) const{
    if(oldState==newState) return;
    hash^=value(index,oldState);
    hash^=value(index,newState);
  }

  void toggle(uint64_t& hash,int index,int state) const{
    hash^=value(index,state);
  }
};

// 任意整数を SplitMix64 で散らす補助。
// unordered_map / unordered_set の hash attack 対策や、
// Zobrist table を持ちたくない巨大状態の疑似乱数値生成にも使える。
uint64_t splitmix64(uint64_t x){
  x+=0x9e3779b97f4a7c15ULL;
  x=(x^(x>>30))*0xbf58476d1ce4e5b9ULL;
  x=(x^(x>>27))*0x94d049bb133111ebULL;
  return x^(x>>31);
}

struct CustomHash{
  size_t operator()(uint64_t x) const{
    static const uint64_t FIXED_RANDOM=seedFromClock();
    return splitmix64(x+FIXED_RANDOM);
  }
};

// ================================================================
// Rollback / Differential Evaluation Utility
// ================================================================
// 差分評価の基本は
//  1. 変更によって影響する部分だけ score の差分 delta を計算
//  2. 採用なら変更を確定
//  3. 不採用なら元に戻す
//
// RollbackLog は複数の変数を一時変更し、snapshot() まで一括 rollback するための補助。
// T* を保存するので、rollback 前に vector の再確保等で参照先を動かさないこと。
//
// 例:
//  RollbackLog<int> log;
//  int snap=log.snapshot();
//  log.set(a[i],newValue);
//  log.set(a[j],otherValue);
//  if(!accept) log.rollback(snap);
//  else log.commit(snap); // 履歴だけ捨てる
//
// set 1回 O(1)、rollback は戻す変更数に比例。
template<class T>
struct RollbackLog{
  struct Change{
    T* ptr;
    T oldValue;
  };

  vector<Change> history;

  int snapshot() const{
    return (int)history.size();
  }

  void set(T& ref,const T& newValue){
    if(ref==newValue) return;
    history.push_back({&ref,ref});
    ref=newValue;
  }

  void rollback(int snap){
    while((int)history.size()>snap){
      auto ch=history.back();
      history.pop_back();
      *ch.ptr=ch.oldValue;
    }
  }

  void commit(int snap){
    // snap 以降の変更を確定するので、履歴だけ捨てる。
    history.resize(snap);
  }

  void clear(){
    history.clear();
  }
};

// 配列専用の安全な rollback。
// ポインタではなく index を保存するため、こちらの方が扱いやすい場合も多い。
template<class T>
struct RollbackArray{
  vector<T> a;
  vector<pair<int,T>> history;

  RollbackArray()=default;
  explicit RollbackArray(int n,const T& init=T()):a(n,init){}
  explicit RollbackArray(vector<T> a):a(move(a)){}

  int snapshot() const{
    return (int)history.size();
  }

  const T& operator[](int i) const{
    return a[i];
  }

  T& operator[](int i){
    return a[i];
  }

  void set(int i,const T& value){
    if(a[i]==value) return;
    history.push_back({i,a[i]});
    a[i]=value;
  }

  void rollback(int snap){
    while((int)history.size()>snap){
      auto [i,oldValue]=history.back();
      history.pop_back();
      a[i]=oldValue;
    }
  }

  void commit(int snap){
    history.resize(snap);
  }
};

// ================================================================
// Generic Beam Search
// ================================================================
// State がコピー可能な場合にそのまま使える汎用版。
// 大きな State を毎回コピーすると遅いので、その場合は問題専用の差分復元型ビームへ書き換える。
//
// expand(state, children)
//  state から次の状態を children に push_back する。
//
// evaluate(state)
//  大きいほど良い評価値を返す。
//
// hashState(state)
//  64bit ハッシュを返す。Zobrist Hash 推奨。
//
// deduplicate=true の場合、同一 hash の候補は評価値最大のものだけ残す。
// ハッシュ衝突は同一状態として扱われる点に注意。
template<class State,class Score>
struct BeamResult{
  State bestState;
  Score bestScore;
  int completedDepth=0;
  long long generated=0;
};

template<class State,class Score,class Expand,class Evaluate,class Hash>
BeamResult<State,Score> beamSearchMax(
  const State& initialState,
  int maxDepth,
  int beamWidth,
  Expand expand,
  Evaluate evaluate,
  Hash hashState,
  bool deduplicate=true,
  const Timer* timer=nullptr,
  double timeLimit=numeric_limits<double>::infinity()
){
  struct Candidate{
    Score score;
    uint64_t hash;
    State state;
  };

  vector<State> beam{initialState};
  BeamResult<State,Score> result{initialState,evaluate(initialState),0,0};

  vector<State> children;
  vector<Candidate> cand;

  for(int depth=0;depth<maxDepth;depth++){
    if(timer && timer->over(timeLimit)) break;

    cand.clear();
    unordered_map<uint64_t,int,CustomHash> pos;
    if(deduplicate) pos.reserve((size_t)beamWidth*8+16);

    for(int bi=0;bi<(int)beam.size();bi++){
      if(timer && (bi&63)==0 && timer->over(timeLimit)) break;

      children.clear();
      expand(beam[bi],children);

      for(State& child:children){
        Score sc=evaluate(child);
        uint64_t h=hashState(child);
        result.generated++;

        if(chmax(result.bestScore,sc)) result.bestState=child;

        if(!deduplicate){
          cand.push_back({sc,h,move(child)});
          continue;
        }

        auto it=pos.find(h);
        if(it==pos.end()){
          int id=(int)cand.size();
          pos.emplace(h,id);
          cand.push_back({sc,h,move(child)});
        }else{
          Candidate& old=cand[it->second];
          if(old.score<sc){
            old.score=sc;
            old.state=move(child);
          }
        }
      }
    }

    if(cand.empty()) break;

    auto better=[](const Candidate& a,const Candidate& b){
      return a.score>b.score;
    };

    if((int)cand.size()>beamWidth){
      nth_element(cand.begin(),cand.begin()+beamWidth,cand.end(),better);
      cand.resize(beamWidth);
    }
    sort(cand.begin(),cand.end(),better);

    beam.clear();
    beam.reserve(cand.size());
    for(auto& x:cand) beam.push_back(move(x.state));

    result.completedDepth=depth+1;
  }

  return result;
}

// 最小化版。
// evaluate(state) が小さいほど良い場合はこちらを使う。
template<class State,class Score,class Expand,class Evaluate,class Hash>
BeamResult<State,Score> beamSearchMin(
  const State& initialState,
  int maxDepth,
  int beamWidth,
  Expand expand,
  Evaluate evaluate,
  Hash hashState,
  bool deduplicate=true,
  const Timer* timer=nullptr,
  double timeLimit=numeric_limits<double>::infinity()
){
  auto negEvaluate=[&](const State& s){
    return -evaluate(s);
  };

  auto r=beamSearchMax<State,Score>(
    initialState,maxDepth,beamWidth,expand,negEvaluate,hashState,
    deduplicate,timer,timeLimit
  );

  r.bestScore=-r.bestScore;
  return r;
}

// ================================================================
// Multi Start
// ================================================================
// 複数の初期解から独立に探索するための汎用骨格。
// solver(startId, remainingTime) -> pair<State,Score>
// をユーザー側で実装する。
//
// 例:
//  auto result=multiStartMax<State,ll>(timer,TIME_LIMIT,100,[&](int id,double remain){
//    State s=makeInitial(id,rng);
//    hillClimb(s,remain);
//    return pair{s,s.score};
//  });
//
// maxStarts を非常に大きくして時間だけで止めてもよい。
template<class State,class Score>
struct MultiStartResult{
  State bestState;
  Score bestScore{};
  int starts=0;
  bool hasResult=false;
};

template<class State,class Score,class Solver>
MultiStartResult<State,Score> multiStartMax(
  Timer& timer,
  double timeLimit,
  int maxStarts,
  Solver solver
){
  MultiStartResult<State,Score> result;

  for(int startId=0;startId<maxStarts;startId++){
    if(timer.over(timeLimit)) break;

    double remaining=max(0.0,timeLimit-timer.elapsed());
    auto [state,score]=solver(startId,remaining);
    result.starts++;

    if(!result.hasResult || result.bestScore<score){
      result.hasResult=true;
      result.bestScore=score;
      result.bestState=move(state);
    }
  }

  return result;
}

template<class State,class Score,class Solver>
MultiStartResult<State,Score> multiStartMin(
  Timer& timer,
  double timeLimit,
  int maxStarts,
  Solver solver
){
  MultiStartResult<State,Score> result;

  for(int startId=0;startId<maxStarts;startId++){
    if(timer.over(timeLimit)) break;

    double remaining=max(0.0,timeLimit-timer.elapsed());
    auto [state,score]=solver(startId,remaining);
    result.starts++;

    if(!result.hasResult || score<result.bestScore){
      result.hasResult=true;
      result.bestScore=score;
      result.bestState=move(state);
    }
  }

  return result;
}

// ================================================================
// LOCAL Debug
// ================================================================
// ローカルでは
//  g++ -std=c++17 -O2 -DLOCAL main.cpp
// のように -DLOCAL を付ける。
// AtCoder提出時には DBG() は完全に消える。
#ifdef LOCAL

void debugOut(){
  cerr<<'\n';
}

template<class Head,class... Tail>
void debugOut(Head&& head,Tail&&... tail){
  cerr<<' '<<head;
  debugOut(forward<Tail>(tail)...);
}

#define DBG(...) do{ \
  cerr<<"["<<#__VA_ARGS__<<"]"; \
  debugOut(__VA_ARGS__); \
}while(0)

#else

#define DBG(...) ((void)0)

#endif

// ================================================================
// Typical Patterns
// ================================================================
/*

------------------------------------------------------------------
1. 焼きなましの典型形
------------------------------------------------------------------

constexpr double TIME_LIMIT=1.90;
Timer timer;
RNG rng(123456789ULL);
Annealing sa(1000.0,1.0,true);

State state=makeInitial();
State bestState=state;
ll score=calcScore(state);
ll bestScore=score;

double temp=sa.startTemp;

for(ll iter=0;;iter++){
  // chrono 呼び出しと温度更新は毎回やらない。
  if((iter&1023)==0){
    if(timer.over(TIME_LIMIT)) break;
    temp=sa.temperature(timer.progress(TIME_LIMIT));
  }

  Move mv=makeMove(state,rng);

  // 全 score を再計算せず、変更箇所だけから差分を求める。
  ll delta=calcDelta(state,mv);

  if(sa.acceptMax((double)delta,temp,rng)){
    applyMove(state,mv);
    score+=delta;

    if(score>bestScore){
      bestScore=score;
      bestState=state;
    }
  }
}

------------------------------------------------------------------
2. apply -> rollback 型の差分評価
------------------------------------------------------------------

RollbackLog<int> log;

int snap=log.snapshot();
ll oldLocal=localScore(state,affectedArea);

log.set(state.a[x],newX);
log.set(state.a[y],newY);

ll newLocal=localScore(state,affectedArea);
ll delta=newLocal-oldLocal;

if(sa.acceptMax(delta,temp,rng)){
  score+=delta;
  log.commit(snap);
}else{
  log.rollback(snap);
}

------------------------------------------------------------------
3. Zobrist Hash
------------------------------------------------------------------

// N個の場所が 0..K-1 の状態を持つ例。
ZobristHash zob(N,K,12345);
uint64_t hash=0;

for(int i=0;i<N;i++) hash^=zob.value(i,a[i]);

int p=5;
int oldValue=a[p];
int newValue=2;

zob.change(hash,p,oldValue,newValue);
a[p]=newValue;

------------------------------------------------------------------
4. ビーム探索
------------------------------------------------------------------

struct State{
  int turn;
  ll score;
  vector<int> a;
  uint64_t hash;
};

State init=...;

int BEAM_WIDTH=1000;
int MAX_DEPTH=100;

vector<Move> moves;

auto result=beamSearchMax<State,ll>(
  init,
  MAX_DEPTH,
  BEAM_WIDTH,

  [&](const State& s,vector<State>& children){
    children.clear();

    enumerateMoves(s,moves);
    children.reserve(moves.size());

    for(const Move& mv:moves){
      State ns=s;
      applyMove(ns,mv);
      children.push_back(move(ns));
    }
  },

  [&](const State& s)->ll{
    // 最終スコアだけでなく、途中状態の将来性を表す評価値でもよい。
    return s.score;
  },

  [&](const State& s)->uint64_t{
    return s.hash;
  },

  true,
  &timer,
  TIME_LIMIT
);

State answer=result.bestState;

------------------------------------------------------------------
5. 多点スタート
------------------------------------------------------------------

Timer timer;
RNG rng(123456789ULL);
constexpr double TIME_LIMIT=1.90;

// startId ごとに初期解を変えて独立探索する。
auto result=multiStartMax<State,ll>(
  timer,
  TIME_LIMIT,
  1000000,

  [&](int startId,double remaining)->pair<State,ll>{
    State s=makeRandomInitial(rng,startId);

    // 1スタートに全 remaining を使わないこと。
    // 例えば残り時間や想定スタート数から局所探索時間を決める。
    double localLimit=min(0.03,remaining);
    double endTime=timer.elapsed()+localLimit;

    ll score=calcScore(s);

    for(ll iter=0;;iter++){
      if((iter&1023)==0 && timer.elapsed()>=endTime) break;
      Move mv=makeMove(s,rng);
      ll delta=calcDelta(s,mv);
      if(delta>=0){
        applyMove(s,mv);
        score+=delta;
      }
    }

    return {move(s),score};
  }
);

State answer=result.bestState;

------------------------------------------------------------------
6. 山登り + 焼きなまし + 多点スタートの使い分け
------------------------------------------------------------------

・まず高速な貪欲で初期解を作る
・局所探索で明らかな改善を全部拾う
・局所最適から抜けたい場合に焼きなまし
・初期解依存が強い場合は多点スタート
・手数が明確な逐次決定問題ならビーム探索
・ビームの重複除去には Zobrist Hash
・score の再計算が重い場合は必ず差分評価

*/

int main(){
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  // ============================================================
  // 問題固有の入力
  // ============================================================
  // int N;
  // cin>>N;

  // 2秒制限なら 1.85～1.95 秒程度から調整する。
  constexpr double TIME_LIMIT=1.90;

  // 固定 seed にすると同じソース・同じ入力で探索結果を再現できる。
  RNG rng(123456789ULL);

  // 入力時間を探索時間に含めたくない場合は、入力後に Timer を作るか reset() する。
  Timer timer;
  timer.reset();

  // ============================================================
  // ここに問題固有の探索を書く
  // ============================================================

  vector<array<ll,2>> dxy4={array<ll,2>{-1,0},array<ll,2>{0,1},array<ll,2>{1,0},array<ll,2>{0,-1}};
  vector<ll> F; { string _line; getline(cin>>ws,_line); stringstream _ss(_line); ll _x; while(_ss>>_x) F.push_back(_x); }
  ll N=10;
  ll V=100;
  vector<ll> board=vector<ll>(V,0);
  vector<string> dirs={"F","B","L","R"};
  auto tilt=[&](auto&& A,auto&& d) {
    vector<ll> B=vector<ll>(V,0);
    if(d==0||d==1) {
      for(ll j=0;j<N;j++) {
        vector<ll> vals;
        for(ll i=0;i<N;i++) {
          auto x=A[i*N+j];
          if(x!=0) {
            vals.push_back(x);
          }
        }
        ll start=(d==0?0:N-(ll)vals.size());
        for(ll k=0;k<(ll)vals.size();k++) {
          B[(start+k)*N+j]=vals[k];
        }
      }
    } else {
      for(ll i=0;i<N;i++) {
        vector<ll> vals;
        for(ll j=0;j<N;j++) {
          auto x=A[i*N+j];
          if(x!=0) {
            vals.push_back(x);
          }
        }
        ll start=(d==2?0:N-(ll)vals.size());
        for(ll k=0;k<(ll)vals.size();k++) {
          B[i*N+start+k]=vals[k];
        }
      }
    }
    return B;
  };
  auto calcValue=[&](auto&& A) {
    vector<bool> used=vector<bool>(V,false);
    ll value=0;
    for(ll s=0;s<V;s++) {
      if(A[s]==0||used[s]) {
        continue;
      }
      vector<ll> que={s};
      ll idx=0;
      ll cnt=0;
      used[s]=true;
      while(idx<(ll)que.size()) {
        ll pos=que[idx++];
        cnt++;
        ll i=((pos)/(N));
        ll j=pos%N;
        for(auto [di,dj]:dxy4) {
          ll ni=i+di;
          ll nj=j+dj;
          if(ni<0||ni>=N||nj<0||nj>=N) {
            continue;
          }
          ll npos=ni*N+nj;
          if(used[npos]||A[npos]!=A[pos]) {
            continue;
          }
          used[npos]=true;
          que.push_back(npos);
        }
      }
      value+=cnt*cnt;
    }
    return value;
  };
  auto expectedNextValue=[&](auto&& A,auto&& nextFlavor) {
    vector<ll> empty;
    for(ll pos=0;pos<V;pos++) {
      if(A[pos]==0) {
        empty.push_back(pos);
      }
    }
    if((ll)empty.size()==0) {
      return 1.0*calcValue(A);
    }
    double sum=0.0;
    for(auto pos:empty) {
      A[pos]=nextFlavor;
      ll best=-1;
      for(ll d=0;d<4;d++) {
        auto B=tilt(A,d);
        best=max(best,calcValue(B));
      }
      sum+=best;
      A[pos]=0;
    }
    return sum/(ll)empty.size();
  };
  for(ll t=0;t<100;t++) {
    ll p; cin>>p;
    ll cnt=0;
    for(ll pos=0;pos<V;pos++) {
      if(board[pos]!=0) {
        continue;
      }
      cnt++;
      if(cnt==p) {
        board[pos]=F[t];
        break;
      }
    }
    ll bestDir=0;
    double bestValue=-1.0;
    vector<ll> bestBoard=board;
    for(ll d=0;d<4;d++) {
      auto nextBoard=tilt(board,d);
      ll value;
      if(t==99) {
        value=calcValue(nextBoard);
      } else {
        value=expectedNextValue(nextBoard,F[t+1]);
      }
      if(value>bestValue) {
        bestValue=value;
        bestDir=d;
        bestBoard=nextBoard;
      }
    }
    board=bestBoard;
    cout<<dirs[bestDir]<<endl;
  }

  (void)TIME_LIMIT;
  (void)rng;
  (void)timer;

  return 0;
}

// ============================================================
// テンプレートは↓をベースにしています
// https://atcoder.jp/contests/intro-heuristics/submissions/78572946
// ============================================================
