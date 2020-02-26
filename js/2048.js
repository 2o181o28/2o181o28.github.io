var a=new Array(4),b=new Array(4),id=new Array(4),flg=new Array(4);
var w=new Array(30),h=new Array(30),sz=new Array(30);
var tot=0,fin=0;

const colors=["#cdc1b2","#eee4d8","#ece2c5","#f8b172","#ff8f5a","#ff6e57","#ff432a","#ead86a",
	"#ead659","#ebd244","#ebd02e","#ebcd04","#3e3e35"];
const bc="#bbad9e",fc24="#776e64",fcOther="#f9f6f1";

function rotate(){
	let b=new Array(4),nid=new Array(4),nf=new Array(4);
	for(let i=0;i<4;i++)
		b[i]=new Int8Array(4),nid[i]=new Int8Array(4),nf[i]=new Int8Array(4);
	for(let i=0;i<4;i++)
		for(let j=0;j<4;j++)
			b[j][3-i]=a[i][j],
			nid[j][3-i]=id[i][j],
			nf[j][3-i]=flg[i][j];
	a=b;id=nid;flg=nf;
}

function goUp(){
	let sc=0;
	for(let i=0;i<4;i++){
		let _=0;
		for(let j=0;j<4;j++)if(a[j][i]){
			if(_!=j)sc=1;
			a[_][i]=a[j][i];id[_++][i]=id[j][i];
		}
		for(let j=_;j<4;j++)a[j][i]=0,id[j][i]=-1;
		for(let j=0;j<3;j++)if(a[j][i]==a[j+1][i] && a[j][i]){
			flg[j][i]=1;a[j][i]++;sc=1;tot+=1<<a[j][i];id[j][i]=id[j+1][i];
			for(let k=j+1;k<3;k++)a[k][i]=a[k+1][i],id[k][i]=id[k+1][i];
			a[3][i]=0,id[3][i]=-1;
		}
	}
	return sc;
}

function move(k){
	// 0,1,2,3 = U/L/D/R
	for(let i=0;i<4;i++){
		id[i]=new Int8Array(4);flg[i]=new Int8Array(4);
		for(let j=0;j<4;j++)id[i][j]=i*4+j;
	}
	for(let i=0;i<k;i++)rotate();
	const res=goUp();
	for(let i=0;i<4-k;i++)rotate();
	return res;
}

function newBlk(){
	let cnt=0;
	for(let i=0;i<4;i++)
		for(let j=0;j<4;j++)if(!a[i][j])cnt++;
	let t=Math.floor(Math.random()*cnt);
	cnt=0;
	for(let i=0;i<4;i++)
		for(let j=0;j<4;j++)if(!a[i][j] && cnt++==t){
			if(Math.random()<0.1)a[i][j]=2;
			else a[i][j]=1;
			return;
		}
}

function chkOver(){
	for(let i=0;i<4;i++)b[i]=new Int8Array(a[i]);
	let old=tot,res=move(0)|move(1)|move(2)|move(3);
	tot=old;
	for(let i=0;i<4;i++)a[i]=new Int8Array(b[i]);
	if(!res){
		draw();
		let ch=$("#score");
		$("#scp").empty().append("Game over. Score: ").append(ch);
		fin=1;
		delete localStorage.arr;
		delete localStorage.scr;
	}
}

function save(){
	localStorage.arr=JSON.stringify(a);
	localStorage.scr=""+tot;
}

function load(){
	console.log("Calling...");
	let arr=JSON.parse(localStorage.arr);
	for(let i=0;i<4;i++){
		a[i]=new Int8Array(4);
		for(let j=0;j<4;j++)a[i][j]=arr[i][j];
	}
	tot=parseInt(localStorage.scr);fin=0;draw();
}

function Init(){
	document.onkeydown=async e=>{
		if(fin)return;
		let key=-1;
		if(e.which>=37 && e.which<=40)e.preventDefault();
		if(e.which==87 || e.which==38)key=0;
		if(e.which==65 || e.which==37)key=1;
		if(e.which==83 || e.which==40)key=2;
		if(e.which==68 || e.which==39)key=3;
		if(key<0)return;
		window.scrollTo(0,400);
		for(let i=0;i<4;i++)b[i]=new Int8Array(a[i]);		
		let mv=move(key);await animate();
		chkOver();if(fin)return;
		if(mv)newBlk();
		chkOver();if(fin)return;
		save();draw();
	};
	
	var canvas=$("canvas")[0];
	var ctx=canvas.getContext("2d");
	for(let i=1;i<30;i++){
		let vl=1<<i;
		for(let x=60;x>=20;x--){
			ctx.font="bold "+x+"px arial";
			w[i]=ctx.measureText(vl).width;
			h[i]=ctx.measureText(vl).actualBoundingBoxAscent;
			if(w[i]<=75){sz[i]=x;break;}
		}
	}
	
	window.scrollTo(0,400);
	if(("arr" in localStorage) && ("scr" in localStorage))
		load();
	else reset();
}

function reset(){
	for(let i=0;i<4;i++)a[i]=new Int8Array(4);
	newBlk();newBlk();tot=0;fin=0;
	draw();save();
}

function calc(x){return (x+1)*10+x*100;}

function sleep(time){
	return new Promise((x)=>setTimeout(x,time));
}

async function animate(){
	var canvas=$("canvas")[0];
	var ctx=canvas.getContext("2d");

	let vec=[];
	for(let i=0;i<4;i++)
		for(let j=0;j<4;j++)if(b[i][j]){
			for(let x=0;x<4;x++)
				for(let y=0;y<4;y++)if(id[x][y]==i*4+j)
					vec.push({sx:i,sy:j,ex:x,ey:y});
		}

	const Mx=5;
	for(let cnt=0;cnt<=Mx;cnt++){
		ctx.fillStyle=bc;
		ctx.fillRect(0,0,450,450);
		for(let i=0;i<4;i++)for(let j=0;j<4;j++){
			ctx.fillStyle=colors[0];
			ctx.fillRect(calc(j),calc(i),100,100);
		}
		for(let i=0;i<vec.length;i++){
			let v=b[vec[i].sx][vec[i].sy];
			ctx.fillStyle=colors[v];
			let Sx=calc(vec[i].sy),Ex=calc(vec[i].ey),
				Sy=calc(vec[i].sx),Ey=calc(vec[i].ex),
				x0=Sx*(Mx-cnt)/Mx+Ex*cnt/Mx,
				y0=Sy*(Mx-cnt)/Mx+Ey*cnt/Mx;
			ctx.fillRect(x0,y0,100,100);
			let vl=1<<v;
			ctx.fillStyle=vl==2||vl==4?fc24:fcOther;
			ctx.font="bold "+sz[v]+"px arial";
			ctx.fillText(vl,x0+50-w[v]/2,y0+50+h[v]/2);
		}
		await sleep(16);
	}
	for(let cnt=0;cnt<=Mx;cnt++){
		let p=2*Math.min(cnt+1,Mx-cnt);
		for(let i=0;i<4;i++)
			for(let j=0;j<4;j++)if(flg[i][j]){
				let x0=calc(j),y0=calc(i),v=b[i][j];
				ctx.fillStyle=colors[v];
				ctx.fillRect(x0-p,y0-p,100+2*p,100+2*p);
				let vl=1<<v;
				ctx.fillStyle=vl==2||vl==4?fc24:fcOther;
				ctx.font="bold "+sz[v]+"px arial";
				ctx.fillText(vl,x0+50-w[v]/2,y0+50+h[v]/2);
			}
		await sleep(16);
	}
}

function draw(){
	let ch=$("#score");
	$("#scp").empty().append("Score: ").append(ch);
	$("#score").html(tot);
	
	var canvas=$("canvas")[0];
	var ctx=canvas.getContext("2d");
	
	ctx.fillStyle=bc;
	ctx.fillRect(0,0,450,450);
	for(let i=0;i<4;i++)
		for(let j=0;j<4;j++){
			let x0=calc(j),y0=calc(i);
			ctx.fillStyle=colors[Math.min(a[i][j],colors.length-1)];
			ctx.fillRect(x0,y0,100,100);
			if(a[i][j]){
				let vl=1<<a[i][j];
				ctx.fillStyle=vl==2||vl==4?fc24:fcOther;
				ctx.font="bold "+sz[a[i][j]]+"px arial";
				ctx.fillText(vl,x0+50-w[a[i][j]]/2,y0+50+h[a[i][j]]/2);
			}
		}
}
