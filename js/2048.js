var a=new Array(4),tot=0,fin=0;

function rotate(){
	let b=new Array(4);
	for(let i=0;i<4;i++)b[i]=new Int32Array(4);
	for(let i=0;i<4;i++)
		for(let j=0;j<4;j++)
			b[j][3-i]=a[i][j];
	a=b;
}

function goUp(){
	let sc=0;
	for(let i=0;i<4;i++){
		let _=0;
		for(let j=0;j<4;j++)if(a[j][i]){
			if(_!=j)sc=1;
			a[_++][i]=a[j][i];
		}
		for(let j=_;j<4;j++)a[j][i]=0;
		for(let j=0;j<3;j++)if(a[j][i]==a[j+1][i] && a[j][i]){
			a[j][i]++;sc=1;tot+=1<<a[j][i];
			for(let k=j+1;k<3;k++)a[k][i]=a[k+1][i];
			a[3][i]=0;
		}
	}
	return sc;
}

function move(k){
	// 0,1,2,3 = U/L/D/R
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
			if(Math.random()<0.2)a[i][j]=2;
			else a[i][j]=1;
			return;
		}
}

function chkOver(){
	let b=new Array(4);
	for(let i=0;i<4;i++)b[i]=new Int32Array(a[i]);
	let old=tot,res=move(0)|move(1)|move(2)|move(3);
	tot=old;
	for(let i=0;i<4;i++)a[i]=new Int32Array(b[i]);
	if(!res){
		draw();
		let ch=$("#score");
		$("#scp").empty().append("Game over. Score: ").append(ch);
		fin=1;
	}
}

function Init(){
	document.onkeydown=e=>{
		if(fin)return;
		let key=-1;
		if(e.which==87/* || e.which==38*/)key=0;
		if(e.which==65/* || e.which==37*/)key=1;
		if(e.which==83/* || e.which==40*/)key=2;
		if(e.which==68/* || e.which==39*/)key=3;
		if(key<0)return;
		let mv=move(key);
		chkOver();if(fin)return;
		if(mv)newBlk();
		chkOver();if(fin)return;
		window.scrollTo(0,400);
		draw();
	};
	window.scrollTo(0,400);
	reset();
}

function reset(){
	for(let i=0;i<4;i++)a[i]=new Int32Array(4);
	newBlk();newBlk();tot=0;fin=0;
	draw();
}

function draw(){
	let ch=$("#score");
	$("#scp").empty().append("Score: ").append(ch);
	$("#score").html(tot);
	
	var canvas=$("canvas")[0];
	var ctx=canvas.getContext("2d");

	const colors=["#cdc1b2","#eee4d8","#ece2c5","#f8b172","#ff8f5a","#ff6e57","#ff432a","#ead86a",
		"#ead659","#ebd244","#ebd02e","#ebcd04","#3e3e35"];
	const bc="#bbad9e",fc24="#776e64",fcOther="#f9f6f1";
	
	ctx.fillStyle=bc;
	ctx.fillRect(0,0,450,450);
	for(let i=0;i<4;i++)
		for(let j=0;j<4;j++){
			let x0=(j+1)*10+j*100,y0=(i+1)*10+i*100;
			ctx.fillStyle=colors[Math.min(a[i][j],colors.length-1)];
			ctx.fillRect(x0,y0,100,100);
			if(a[i][j]){
				let vl=1<<a[i][j];
				ctx.fillStyle=vl==2||vl==4?fc24:fcOther;
				let w=0,h=0;
				for(let x=60;x>=20;x--){
					ctx.font="bold "+x+"px arial";
					w=ctx.measureText(vl).width;
					h=ctx.measureText(vl).actualBoundingBoxAscent;
					if(w<=75)break;
				}
				ctx.fillText(vl,x0+50-w/2,y0+50+h/2);
			}
		}
}
