let worker,is_busy,need_done=false,is_fin=false,frozen=false;
let len=15,skin_path="/img/gomoku/HGarden.png",timeout=10000,nowX=-1,nowY=-1,game_type=1;
let skin=new Image(),board=new Array(len),line_rgba,his=new Array(),pos=-1;

function busy(vl){
	is_busy=vl;
	if(vl)$("#busy").show();else $("#busy").hide();
}

function current_player(){
	let cntw=0,cntb=0;
	for(let i=0;i<len;i++)
		for(let j=0;j<len;j++)if(board[i][j]){
			if(board[i][j]===2)cntw++;else cntb++;
		}
	return cntw===cntb?1:2;
}

function decode(str){
	board=new Array(len);
	let a=JSON.parse(str);
	for(let i=0;i<len;i++){
		board[i]=new Int8Array(len);
		for(let j=0;j<len;j++)board[i][j]=a[i][j];
	}
}

async function play(x,y){
	his=his.slice(0,pos+1);
	localStorage.nowX=nowX=x;localStorage.nowY=nowY=y;
	board[x][y]=current_player();
	let str=JSON.stringify(board);
	his.push({str,nowX,nowY});pos++;
	localStorage.board=str;
	await draw();
}

function check_win(){
	let chk=(a,b,c,d,e)=>a&&a===b&&a===c&&a===d&&a===e;
	let ctx=$("#cvs")[0].getContext("2d"),is_draw=true;
	ctx.strokeStyle=line_rgba;ctx.lineWidth=4;is_fin=false;
	let fin=(x1,y1,x2,y2)=>{
		x1=(x1+0.5)*480/len;x2=(x2+0.5)*480/len;
		y1=(y1+0.5)*480/len;y2=(y2+0.5)*480/len;
		ctx.beginPath();
		ctx.moveTo(x1,y1);
		ctx.lineTo(x2,y2);
		ctx.stroke();is_fin=true;
	};
	for(let i=0;i<len;i++)
		for(let j=0;j<len;j++){
			if(board[i][j]===0)is_draw=false;
			if(i<len-4){
				if(chk(board[i][j],board[i+1][j],board[i+2][j],board[i+3][j],board[i+4][j]))
					fin(i,j,i+4,j);
				if(j<len-4)
					if(chk(board[i][j],board[i+1][j+1],board[i+2][j+2],board[i+3][j+3],board[i+4][j+4]))
						fin(i,j,i+4,j+4);
				if(j>3)
					if(chk(board[i][j],board[i+1][j-1],board[i+2][j-2],board[i+3][j-3],board[i+4][j-4]))
						fin(i,j,i+4,j-4);
			}
			if(j<len-4)
				if(chk(board[i][j],board[i][j+1],board[i][j+2],board[i][j+3],board[i][j+4]))
					fin(i,j,i,j+4);
		}
	if(is_draw)is_fin=true;
}

async function load_skin(path){
	return new Promise(res=>{
		skin.onload=()=>{
			let tmp=document.createElement("canvas");
			let ctx=tmp.getContext("2d");
			ctx.drawImage(skin,0,0);
			let data=ctx.getImageData(skin.width-1,2,1,1).data;
			line_rgba=`rgba(${data[0]},${data[1]},${data[2]},${data[3]/255})`;
			res();
		};
		skin.src=path;
	});
}

async function init_worker(){
	if(worker && typeof worker.terminate==="function")worker.terminate();
	worker=new Worker("/js/gomoku/worker.js");
	busy(true);need_done=false;
	let p=new Promise(res=>{
		worker.onmessage=async e=>{
			if(typeof e.data==="number" && e.data>=0){
				busy(false);
				play(e.data&65535,e.data>>16);
				await draw();
			}
			if(typeof e.data==="string")busy(false);
			res();
		};
	});
	await p;
}

async function draw(){
	let ctx=$("#cvs")[0].getContext("2d");
	
	if(skin.src!==window.location.origin+skin_path)
		await load_skin(skin_path);
	let skin_width=skin.height,step=480/len;
	for(let i=0;i<len;i++)
		for(let j=0;j<len;j++){
			let id=board[i][j];
			if(i===nowX && j===nowY)id+=2;
			ctx.drawImage(skin,skin_width*id,0,skin_width,skin_width,i*step,j*step,step,step);
		}
	check_win();
}

async function reload(){
	if(is_busy)worker.terminate();
	({nowX,nowY}=his[pos]);
	decode(his[pos].str);
	localStorage.nowX=nowX;
	localStorage.nowY=nowY;
	localStorage.board=his[pos].str;
	await draw();frozen=true;
}

async function full_back(){
	pos=0;await reload();
}

async function back(){
	if(pos===0)return;
	pos--;await reload();
}

async function forward(){
	if(pos===his.length-1)return;
	pos++;await reload();
}

async function full_forward(){
	pos=his.length-1;await reload();
}

async function apply(){
	let path=$("#skin_select").find("option:selected").val();
	if(path!==skin_path){
		localStorage.skin_path=skin_path=path;
		await draw();
	}
	let inp_len=parseInt($("#len").val());
	if(inp_len!==len){
		if(inp_len<10 || inp_len>20){alert(`Invalid board size: ${inp_len}`);return;}
		localStorage.len=len=inp_len;
		await new_game();
	}
	let checked_elem=$("input[name='game_type']:checked")[0];
	let new_type=Array.prototype.indexOf.call(checked_elem.parentNode.children,checked_elem)/3;
	if(new_type!==game_type){
		localStorage.game_type=game_type=new_type;
		await draw();await restart_worker();
	}
	let inp_timeout=parseFloat($("#timeout").val());
	let new_timeout=Math.floor(inp_timeout*1000);
	if(new_timeout!==timeout){
		if(game_type===2){
			alert("Sorry, you can NOT modify the time limit because now it's a two-human game.");
			return;
		}
		if(new_timeout<1000 || isNaN(new_timeout)){
			alert(`Invalid time limit: ${inp_timeout}s`);
			return;
		}
		if(is_busy){
			alert("Sorry, you can only modify the time limit when the AI is not thinking. Please try again later");
			return;
		}
		localStorage.timeout=timeout=new_timeout;
		worker.postMessage(`INFO timeout_turn ${new_timeout}`);
	}
}

async function new_game(){
	nowX=nowY=-1;board=new Array(len);is_fin=false;
	for(let i=0;i<len;i++)board[i]=new Int8Array(len);
	localStorage.board=JSON.stringify(board);
	localStorage.nowX=nowX;
	localStorage.nowY=nowY;
	localStorage.game_type=game_type;
	his=new Array();pos=-1;
	await draw();
	if(game_type!==2){
		if(is_busy||need_done||!worker)await init_worker();
		worker.postMessage(`START ${len}`);
		worker.postMessage(`INFO timeout_turn ${timeout}`);
		if(game_type===0){
			busy(true);
			worker.postMessage("BEGIN");
		}
	}
}

async function restart_worker(){
	if(game_type!==2&&!is_fin){
		if(is_busy||need_done||!worker)await init_worker();
		worker.postMessage(`START ${len}`);
		worker.postMessage(`INFO timeout_turn ${timeout}`);
		worker.postMessage("BOARD");
		for(let i=0;i<len;i++)
			for(let j=0;j<len;j++)if(board[i][j]){
				worker.postMessage(`${i},${j},${board[i][j]===game_type+1?1:2}`);
			}
		if(current_player()===game_type+1){
			busy(true);
			worker.postMessage("DONE");
		}else need_done=true;
	}
}

async function Init(){
	if(!localStorage.len){
		localStorage.len=len;
		localStorage.skin_path=skin_path;
		for(let i=0;i<len;i++)board[i]=new Int8Array(len);
		localStorage.board=JSON.stringify(board);
		localStorage.timeout=timeout;
		localStorage.nowX=nowX;
		localStorage.nowY=nowY;
		localStorage.game_type=game_type;
	}
	skin_path=localStorage.skin_path;
	len=parseInt(localStorage.len);timeout=parseInt(localStorage.timeout);
	nowX=parseInt(localStorage.nowX);
	nowY=parseInt(localStorage.nowY);
	game_type=parseInt(localStorage.game_type);
	decode(localStorage.board);
	$("#skin_select").find("option:selected").attr("selected",false);
	$("#skin_select").find(`option[value='${skin_path}']`).attr("selected",true);
	$("input[name='game_type']").eq(game_type).attr("checked",true);
	$("#len").val(len);
	$("#timeout").val(timeout/1000);
	$("#cvs").on("click",async e=>{
		if(frozen){
			await restart_worker();
			frozen=false;
			if(!need_done&&game_type!==2)return;
		}
		if(is_busy){
			alert("Sorry, the AI is still thinking. Please wait");
			return;
		}
		if(is_fin){alert("The game is over");return;}
		let {width,height}=$("#cvs")[0].getBoundingClientRect();
		let x=Math.floor(e.offsetX/width*len),y=Math.floor(e.offsetY/height*len);
		if(board[x][y]){
			alert("Invalid move: There is a stone already here");
			return;
		}
		play(x,y);
		if(game_type!==2&&!is_fin){
			busy(true);
			if(need_done){
				worker.postMessage(`${x},${y},2`);
				worker.postMessage("DONE");
				need_done=false;
			}else{
				worker.postMessage(`TURN ${x},${y}`);
			}
		}
	});
	await draw();
	await restart_worker();
}

document.body.onload=Init;
