// remotestore.js by dandavis [CCBY4], 2016. allows accessing the same storage from any domain. server code. 
  
window.addEventListener("message", function msg(e) {

	var temp, key="_STORE_" + e.data.key;
	
	function send(data, type){
		e.source.postMessage({res: data, domain: location.href.split("/")[2], type: type, _IS_REMOTE_STORE: 1, serial: e.data.serial }, "*");	
	}

	switch(e.data.cmd) {

	case "set":
		temp= (localStorage[key]||"").length - ( 
			localStorage[key] =  (typeof e.data.value==="string" && e.data.value.slice(0,1)!="ƒ") ? 
				e.data.value : 
				("ƒ"+JSON.stringify(e.data.value)) 
		).length ;
		send(temp, "set");
		break;
		
	case "get":
		if(!Object.hasOwnProperty.call(localStorage, key)) return send("Error, key '"+e.data.key+"' not set", "error");
		temp=localStorage[key];
		send( temp.slice(0,1)==="ƒ" ? JSON.parse(temp.slice(1)) : temp, "get");
		break;
		
	case "del":
		temp= (localStorage[key]||"").length;
		delete localStorage[key];
		send(temp, "del");
		break;
			
	case "used":
		send( Object.keys(localStorage)
			.map(function(a){return a.length  + localStorage[a].length || 0; })
			.reduce(function(a,b){return a+b;},0), "used"	);
		break;
		
	case "dir":
		send(
			Object.keys(localStorage, "dir")
			.filter(/./.test, /^_STORE_/)
			.map(function(a){return a.slice(7);})
		);
		break;
		
	default:
		send("Error, command not set with 'cmd' property", "error");
	}
}); //end msg()
