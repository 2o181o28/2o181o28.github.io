//. ~/git/emsdk/emsdk_env.sh --build=Release
//em++ gomoku.cpp -s ALLOW_MEMORY_GROWTH=1 -s "EXTRA_EXPORTED_RUNTIME_METHODS=['cwrap','ccall']" -s "EXPORTED_FUNCTIONS=['_handler']" -o gomoku.js -std=c++20 -O3
#include<chrono>
#include<cstring>
#include<algorithm>
#include<iostream>
#include<cassert>
#include<cmath>
#include<unordered_map>
#include<vector>
#define ll long long
#define lld long double
using namespace std;
using clk=chrono::steady_clock;

template<typename tn> void read(tn &a){
	tn x=0,f=1; char c=' ';
	for(;!isdigit(c);c=getchar()) if(c=='-') f=-1;
	for(;isdigit(c);c=getchar()) x=x*10+c-'0';
	a=x*f;
}

const ll mod=1e17l+3;
int LEN,mx_dep=9,nod_cnt,time_lim=1e4;
clk::time_point stt;
bool time_out,is_board;
unordered_map<ll,pair<int,int>> mp;
//uniform_real_distribution<double> U(-.1,.1);
//default_random_engine E(clock()+time(0));

struct game{
	int a[21][21],tag,s[21][21][4][2],mxx,mnx,mxy,mny;
	ll hsh(){
		ll r=0;
		for(int i=1;i<=LEN;i++)
			for(int j=1;j<=LEN;j++)
				r=(r*13+a[i][j])%mod;
		return r;
	}
	void clear(){
		memset(s,0,sizeof(s));
		memset(a,0,sizeof(a));tag=0;
		mnx=mny=1e9,mxx=mxy=-1;
	}
	game(){
		clear();
	}
	void set_impl(int x,int y,int tag){
		assert(a[x][y]==0);
		a[x][y]=tag+1;
		mxx=max(mxx,x);mnx=min(mnx,x);
		mxy=max(mxy,y);mny=min(mny,y);
		int tx=x,ty=y;
		for(int i=1;i<=5;i++){
			if(tx<1||ty<1) break;
			s[tx][ty][0][tag]++;
			tx--;
		}
		tx=x;ty=y;
		for(int i=1;i<=5;i++){
			if(tx<1||ty<1) break;
			s[tx][ty][1][tag]++;
			ty--;
		}
		tx=x;ty=y;
		for(int i=1;i<=5;i++){
			if(tx<1||ty<1) break;
			s[tx][ty][2][tag]++;
			tx--;ty--;
		}
		tx=x;ty=y;
		for(int i=1;i<=5;i++){
			if(tx<1||ty>LEN) break;
			s[tx][ty][3][tag]++;
			tx--;ty++;
		}
	}
	void set(int x,int y){set_impl(x,y,tag);tag^=1;}
	void reset(int x,int y){
		//not back up mn mx
		assert(a[x][y]==(tag^1)+1);
		a[x][y]=0;tag^=1;	
		int tx=x,ty=y;
		for(int i=1;i<=5;i++){
			if(tx<1||ty<1) break;
			s[tx][ty][0][tag]--;
			tx--;
		}
		tx=x;ty=y;
		for(int i=1;i<=5;i++){
			if(tx<1||ty<1) break;
			s[tx][ty][1][tag]--;
			ty--;
		}
		tx=x;ty=y;
		for(int i=1;i<=5;i++){
			if(tx<1||ty<1) break;
			s[tx][ty][2][tag]--;
			tx--;ty--;
		}
		tx=x;ty=y;
		for(int i=1;i<=5;i++){
			if(tx<1||ty>LEN) break;
			s[tx][ty][3][tag]--;
			tx--;ty++;
		}
	}
	int finish(){
		for(int i=1;i<=LEN;i++)
			for(int j=1;j<=LEN;j++)
				for(int k=0;k<4;k++){
					if(s[i][j][k][1]==5) return 2;
					if(s[i][j][k][0]==5) return 1;
				}
		return 0;
	}
};
class my_AI{
	int h[21][21];
	double p[21][21];
	public:
	double calc(game&G){
		++nod_cnt;//ll hs=G.hsh();
//		if(mp.count(hs))return mp[hs];
		double mP[6]={0,10,20000,50000,9e5,1e100};
		double oP[6]={0,-100,-49990,-2e6,-1e40,-1e100};
		double ans=0;
		int mC=0,oC=0,dx=0,dy=-1,tag=1;
		memset(h,0,sizeof(h));
		for(int i=1;i<=LEN;i++){
			for(int j=1;j<=LEN-4;j++){
				if(G.s[i][j][tag][0]&&G.s[i][j][tag][1]) continue;
				int mS=G.s[i][j][tag][G.tag^1],oS=G.s[i][j][tag][G.tag];
				if(mS) ans+=mP[mS];
				else ans+=oP[oS];
				if(i+dx>0&&j+dy>0&&j+dy<=LEN&&mS>=4&&G.s[i+dx][j+dy][tag][G.tag^1]>=4&&!G.s[i+dx][j+dy][tag][G.tag]) ans+=1e30;
				if(i+dx>0&&j+dy>0&&j+dy<=LEN&&oS>=4&&G.s[i+dx][j+dy][tag][G.tag]>=4&&!G.s[i+dx][j+dy][tag][G.tag^1]) ans-=1e50;
				if(i+dx>0&&j+dy>0&&j+dy<=LEN&&mS>=3&&G.s[i+dx][j+dy][tag][G.tag^1]>=3&&!G.s[i+dx][j+dy][tag][G.tag]&&!h[i+dx][j+dy]) mC++,h[i][j]=1;
				if(i+dx>0&&j+dy>0&&j+dy<=LEN&&oS>=3&&G.s[i+dx][j+dy][tag][G.tag]>=3&&!G.s[i+dx][j+dy][tag][G.tag^1]&&!h[i+dx][j+dy]) oC++,h[i][j]=1;
			}
		}
		memset(h,0,sizeof(h));
		dx=-1;dy=0;tag=0;
		for(int i=1;i<=LEN-4;i++){
			for(int j=1;j<=LEN;j++){
				if(G.s[i][j][tag][0]&&G.s[i][j][tag][1]) continue;
				int mS=G.s[i][j][tag][G.tag^1],oS=G.s[i][j][tag][G.tag];
				if(mS) ans+=mP[mS];
				else ans+=oP[oS];
				if(i+dx>0&&j+dy>0&&j+dy<=LEN&&mS>=4&&G.s[i+dx][j+dy][tag][G.tag^1]>=4&&!G.s[i+dx][j+dy][tag][G.tag]) ans+=1e30;
				if(i+dx>0&&j+dy>0&&j+dy<=LEN&&oS>=4&&G.s[i+dx][j+dy][tag][G.tag]>=4&&!G.s[i+dx][j+dy][tag][G.tag^1]) ans-=1e50;
				if(i+dx>0&&j+dy>0&&j+dy<=LEN&&mS>=3&&G.s[i+dx][j+dy][tag][G.tag^1]>=3&&!G.s[i+dx][j+dy][tag][G.tag]&&!h[i+dx][j+dy]) mC++,h[i][j]=1;
				if(i+dx>0&&j+dy>0&&j+dy<=LEN&&oS>=3&&G.s[i+dx][j+dy][tag][G.tag]>=3&&!G.s[i+dx][j+dy][tag][G.tag^1]&&!h[i+dx][j+dy]) oC++,h[i][j]=1;
			}
		}
		memset(h,0,sizeof(h));
		dx=-1;dy=-1;tag=2;
		for(int i=1;i<=LEN-4;i++){
			for(int j=1;j<=LEN-4;j++){
				if(G.s[i][j][tag][0]&&G.s[i][j][tag][1]) continue;
				int mS=G.s[i][j][tag][G.tag^1],oS=G.s[i][j][tag][G.tag];
				if(mS) ans+=mP[mS];
				else ans+=oP[oS];
				if(i+dx>0&&j+dy>0&&j+dy<=LEN&&mS>=4&&G.s[i+dx][j+dy][tag][G.tag^1]>=4&&!G.s[i+dx][j+dy][tag][G.tag]) ans+=1e30;
				if(i+dx>0&&j+dy>0&&j+dy<=LEN&&oS>=4&&G.s[i+dx][j+dy][tag][G.tag]>=4&&!G.s[i+dx][j+dy][tag][G.tag^1]) ans-=1e50;
				if(i+dx>0&&j+dy>0&&j+dy<=LEN&&mS>=3&&G.s[i+dx][j+dy][tag][G.tag^1]>=3&&!G.s[i+dx][j+dy][tag][G.tag]&&!h[i+dx][j+dy]) mC++,h[i][j]=1;
				if(i+dx>0&&j+dy>0&&j+dy<=LEN&&oS>=3&&G.s[i+dx][j+dy][tag][G.tag]>=3&&!G.s[i+dx][j+dy][tag][G.tag^1]&&!h[i+dx][j+dy]) oC++,h[i][j]=1;
			}
		}
		memset(h,0,sizeof(h));
		dx=-1;dy=1;tag=3;
		for(int i=1;i<=LEN-4;i++){
			for(int j=5;j<=LEN;j++){
				if(G.s[i][j][tag][0]&&G.s[i][j][tag][1]) continue;
				int mS=G.s[i][j][tag][G.tag^1],oS=G.s[i][j][tag][G.tag];
				if(mS) ans+=mP[mS];
				else ans+=oP[oS];
				if(i+dx>0&&j+dy>0&&j+dy<=LEN&&mS>=4&&G.s[i+dx][j+dy][tag][G.tag^1]>=4&&!G.s[i+dx][j+dy][tag][G.tag]) ans+=1e30;
				if(i+dx>0&&j+dy>0&&j+dy<=LEN&&oS>=4&&G.s[i+dx][j+dy][tag][G.tag]>=4&&!G.s[i+dx][j+dy][tag][G.tag^1]) ans-=1e50;
				if(i+dx>0&&j+dy>0&&j+dy<=LEN&&mS>=3&&G.s[i+dx][j+dy][tag][G.tag^1]>=3&&!G.s[i+dx][j+dy][tag][G.tag]&&!h[i+dx][j+dy]) mC++,h[i][j]=1;
				if(i+dx>0&&j+dy>0&&j+dy<=LEN&&oS>=3&&G.s[i+dx][j+dy][tag][G.tag]>=3&&!G.s[i+dx][j+dy][tag][G.tag^1]&&!h[i+dx][j+dy]) oC++,h[i][j]=1;
			}
		}
		if(oC>0) ans-=1e13;
		if(oC>1) ans-=1e25;
		if(mC>0) ans+=2e7;
		if(mC>1) ans+=1e10;
		return /*mp[hs]=*/ans;
	}
	vector<pair<int,int> > get_nxts(game G){
		memset(p,0,sizeof(p));
		vector<pair<int,int> > V;
		int lx=max(1,G.mnx-2),rx=min(G.mxx+2,LEN);
		int ly=max(1,G.mny-2),ry=min(G.mxy+2,LEN);
		for(int i=lx;i<=rx;i++)
			for(int j=ly;j<=ry;j++){
				if(G.a[i][j]) continue;
				G.set(i,j);
				p[i][j]=calc(G);
				V.emplace_back(i,j);
				G.reset(i,j);
			}
		sort(V.begin(),V.end(),[&](pair<int,int> a,pair<int,int> b){
			return p[a.first][a.second]>p[b.first][b.second];
		});
		return V;
	}
};
my_AI p;
game G;
const int limits[]={20,10,8,6,5,4,4,4,4,3,3,3,3,3,3,3,3,3};
double search(game G,int x,int y,int dep,double A,double B){
	if(clk::now()-stt>time_lim*1ms){time_out=true;return 0;}
	G.set(x,y);
	if(dep==mx_dep) return p.calc(G);
	ll hs=G.hsh();int lim=limits[dep],mlt=dep&1?1:-1;
	pair<int,int> kl;
	if(mp.count(hs))kl=mp[hs];else kl={-1,-1};
	if(G.finish()) return mlt*1e103/dep;
	auto v=p.get_nxts(G);
	for(auto it=v.begin();it!=v.end();++it)if(*it==kl){
		rotate(v.begin(),it,it+1);break;
	}
	int cnt=0;
	double mv=mlt*1e200;
	for(auto&pr:v){
		if(++cnt>lim) break;
		double nv=search(G,pr.first,pr.second,dep+1,A,B);
		if(dep&1)mv=min(mv,nv),B=min(B,mv);else mv=max(mv,nv),A=max(A,mv);
		if(time_out)return 0;
		if(B<=A) {mp[hs]=pr;break;}
	}
	return mv;
}
pair<int,int> Search_for_next(game G,double*ret=NULL){
	stt=clk::now();time_out=false;nod_cnt=0;mp.clear();
	auto v=p.get_nxts(G);
	if(v.empty()){
		if(ret)*ret=0;
		return {LEN+1>>1,LEN+1>>1};
	}
	int lim=limits[0];
	if(v.size()>lim)v.resize(lim);
	pair<int,int> onxt;double oval=-1e200;
	static double ev[21][21];
	for(mx_dep=3;mx_dep<=17;mx_dep+=2){
		double A=-1e200,B=1e200;
		pair<int,int> nxt;double val=-1e200;
		for(auto&pr:v){
			double vl=search(G,pr.first,pr.second,1,A,B);
			ev[pr.first][pr.second]=vl;
			if(time_out){
				if(ret)*ret=oval;
				return onxt;
			}
//			printf("%d %d %.1lf\n",pr.first,pr.second,vl);
			if(vl>val) val=vl,nxt=pr;
			A=max(A,vl);
		}
//		if(abs(val)>1e50){if(ret)*ret=val;return nxt;}
		onxt=nxt,oval=val;
		sort(v.begin(),v.end(),[&](pair<int,int> a,pair<int,int> b){
			return ev[a.first][a.second]>ev[b.first][b.second];
		});
		lim=ceil(lim*0.9);
		if(v.size()>lim)v.resize(lim);
	}
	if(ret)*ret=oval;return onxt;
}
extern"C" void handler(char *buf){
	char t[100];sscanf(buf," %s",t);string s=t;
	printf("Entered C++ Code cmd=%s\n",buf);

	if(is_board){
		if(s=="DONE"){
			is_board=false;G.tag=0;
			int nx,ny;double vl;tie(nx,ny)=Search_for_next(G,&vl);
			printf("%d,%d\n",nx-1,ny-1);
			printf("MESSAGE Depth=%d Node_cnt=%d Evaluation=%.lg\n",mx_dep-2,nod_cnt,vl);
			fflush(stdout);
			G.set(nx,ny);
		}else{
			int x,y,k;sscanf(buf,"%d,%d,%d",&x,&y,&k);
			G.set_impl(x+1,y+1,k-1);
		}
		return;
	}
	if(s=="TURN"){
		int x=-1,y=-1;sscanf(buf," %*s %d,%d",&x,&y);
		x++,y++;
		G.set(x,y);
		int nx,ny;double vl;tie(nx,ny)=Search_for_next(G,&vl);
		printf("%d,%d\n",nx-1,ny-1);
		printf("MESSAGE Depth=%d Node_cnt=%d Evaluation=%.lg\n",mx_dep-2,nod_cnt,vl);
		fflush(stdout);
		G.set(nx,ny);
	}else if(s=="BEGIN"){
		G=game();int x,y;tie(x,y)=Search_for_next(G);
		printf("%d,%d\n",x-1,y-1);fflush(stdout);
		G.set(x,y);
	}else if(s=="BOARD"){
		G=game();is_board=true;
	}else if(s=="START"){
		int r=-1;sscanf(buf," %*s %d",&r);
		LEN=r;
		G=game();puts("OK");fflush(stdout);
	}else if(s=="INFO"){
		sscanf(buf,"INFO timeout_turn %d",&time_lim);
	}else if(s=="ABOUT"){
		puts(R"(name="SNZAKIOI", version="1.0", author="snz")");
		fflush(stdout);
	}
}
