let worker,is_busy;
let len=15,skin_path="/img/gomoku/HGarden.png",timeout=5000;
let skin=new Image(),board=new Array(len);

async function load_skin(path){
	return new Promise(res=>{
		skin.onload=res;
		skin.src=path;
	});
}

async function init_worker(){
	worker=new Worker("/js/gomoku/worker.js");
	is_busy=true;
	let p=new Promise(res=>{
		worker.onmessage=e=>{is_busy=false;res();};
	});
	await p;
}

async function submit(){
	let s=$("#cmd").val();
	if(s==="END"){
		worker.terminate();
		await init_worker();
		$("#cmd").val("");
		return;
	}
	if(is_busy)return;
	is_busy=true;
	worker.postMessage(s);
	$("#cmd").val("");
}
$(()=>{$("#cmd")[0].onkeydown=e=>{
	if(e.which==13)submit();
}});

async function Init(){
	await init_worker();
	if(!localStorage.len){
		localStorage.len=len;
		localStorage.skin_path=skin_path;
		for(let i=0;i<len;i++)board[i]=new Int8Array(len);
		localStorage.board=JSON.stringify(board);
		localStorage.timeout=timeout;
	}
	skin_path=localStorage.skin_path;
	len=parseInt(localStorage.len);timeout=parseInt(localStorage.timeout);
	board=new Array(len);
	let arr=JSON.parse(localStorage.board);
	for(let i=0;i<len;i++){
		board[i]=new Int8Array(len);
		for(let j=0;j<len;j++)board[i][j]=arr[i][j];
	}
	$("#skin_select").find("option:selected").attr("selected",false);
	$("#skin_select").find(`option[value='${skin_path}']`).attr("selected",true);
	$("#len").val(len);
	$("#timeout").val(timeout/1000);
	let c_elem=$("#cvs");
	let ctx=c_elem[0].getContext("2d");
	let {width,height}=c_elem[0].getBoundingClientRect();
	
	await load_skin(skin_path);
	let skin_width=skin.height,step=480/len;
	for(let i=0;i<len;i++)
		for(let j=0;j<len;j++){
			ctx.drawImage(skin,skin_width*board[i][j],0,skin_width,skin_width,i*step,j*step,step,step);
		}
}
document.body.onload=Init;
