importScripts("/js/gomoku/gomoku.js");

let send=Module.cwrap("handler","number",["string"]);
Module.onRuntimeInitialized=()=>{
	self.postMessage("");
};
self.addEventListener("message",e=>{
	self.postMessage(send(e.data));
},false);
