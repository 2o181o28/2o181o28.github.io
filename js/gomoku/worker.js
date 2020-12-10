importScripts("/js/gomoku/gomoku.js");

let send=Module.cwrap("handler",null,["string"]);
Module.onRuntimeInitialized=()=>{
	self.postMessage("");
};
self.addEventListener("message",e=>{
	send(e.data);
	self.postMessage("");
},false);
