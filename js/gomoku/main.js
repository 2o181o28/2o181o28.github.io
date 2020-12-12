let worker,is_busy,need_done=false;
let len=15,skin_path="/img/gomoku/HGarden.png",timeout=10000,nowX=-1,nowY=-1,game_type=1;
let skin=new Image(),board=new Array(len);

function current_player(){
	let cntw=0,cntb=0;
	for(let i=0;i<len;i++)
		for(let j=0;j<len;j++)if(board[i][j]){
			if(board[i][j]===2)cntw++;else cntb++;
		}
	return cntw===cntb?1:2;
}

function check_win(){
	//TODO
}

async function load_skin(path){
	return new Promise(res=>{
		skin.onload=res;
		skin.src=path;
	});
}

async function init_worker(){
	if(worker && typeof worker.terminate==="function")worker.terminate();
	worker=new Worker("/js/gomoku/worker.js");
	is_busy=true;
	let p=new Promise(res=>{
		worker.onmessage=e=>{is_busy=false;res();};
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
		if(game_type!=2){
			if(is_busy)await init_worker();
			worker.postMessage(`START ${len}`);
			worker.postMessage(`INFO timeout_turn ${timeout}`);
			worker.postMessage("BOARD");
			for(let i=0;i<len;i++)
				for(let j=0;j<len;j++)if(board[i][j]){
					worker.postMessage(`${i},${j},${board[i][j]===game_type+1?1:2}`);
				}
			if(current_player()===game_type+1){
				is_busy=true;
				worker.postMessage("DONE");
			}else need_done=true;
		}
	}
	let inp_timeout=parseFloat($("#timeout").val());
	let new_timeout=Math.floor(inp_timeout*1000);
	if(new_timeout!==timeout){
		if(new_timeout<1000 || isNaN(new_timeout)){
			alert(`Invalid time limit: ${inp_timeout}ms`);
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
	nowX=nowY=-1;board=new Array(len);
	for(let i=0;i<len;i++)board[i]=new Int8Array(len);
	localStorage.board=JSON.stringify(board);
	localStorage.nowX=nowX;
	localStorage.nowY=nowY;
	localStorage.game_type=game_type;
	await draw();if(is_busy)await init_worker();
	worker.postMessage(`START ${len}`);
	worker.postMessage(`INFO timeout_turn ${timeout}`);
	if(game_type===0){
		is_busy=true;
		worker.postMessage("BEGIN");
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
	board=new Array(len);
	let arr=JSON.parse(localStorage.board);
	for(let i=0;i<len;i++){
		board[i]=new Int8Array(len);
		for(let j=0;j<len;j++)board[i][j]=arr[i][j];
	}
	$("#skin_select").find("option:selected").attr("selected",false);
	$("#skin_select").find(`option[value='${skin_path}']`).attr("selected",true);
	$("input[name='game_type']").eq(game_type).attr("checked",true);
	$("#len").val(len);
	$("#timeout").val(timeout/1000);
	$("#cvs").on("click",async e=>{
		if(is_busy){
			alert("Sorry, the AI is still thinking. Please wait");
			return;
		}
		let {width,height}=$("#cvs")[0].getBoundingClientRect();
		let x=Math.floor(e.offsetX/width*len),y=Math.floor(e.offsetY/height*len);
		localStorage.nowX=nowX=x;localStorage.nowY=nowY=y;
		board[x][y]=current_player();
		localStorage.board=JSON.stringify(board);
		await draw();
		if(game_type!==2){
			is_busy=true;
			if(need_done){
				worker.postMessage(`${x},${y},2`);
				worker.postMessage("DONE");
				need_done=false;
			}else{
				worker.postMessage(`TURN ${x},${y}`);
			}
		}
	});
	if(game_type!==2){
		await init_worker();
		worker.postMessage(`START ${len}`);
		worker.postMessage(`INFO timeout_turn ${timeout}`);
	}
	await draw();
}

document.body.onload=Init;
