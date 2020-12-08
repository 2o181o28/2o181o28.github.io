importScripts("/js/gomoku/gomoku.js");

let send=Module.cwrap("handler",null,["string"]);
self.addEventListener("message",e=>{
//	console.log("Calling C++ code");
	send(e.data);
//	console.log("Finish Call");
	self.postMessage("");
},false);
