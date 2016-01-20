// remotestore.js by dandavis [CCBY4], 2016. allows accessing the same storage from any domain. server code. 
  
window.addEventListener("message", function msg(e) {

	var prefix="_STORE_", temp;
	function send(data, type){
		e.source.postMessage({res: data, domain: location.href.split("/")[2], type: type, _IS_REMOTE_STORE: 1, serial: e.data.serial }, "*");	
	}

	switch(e.data.cmd) {

	case "set":
		temp= (localStorage[prefix + e.data.key]||"").length;
		temp=temp - (localStorage[prefix + e.data.key] = JSON.stringify(e.data.value)).length;
		send(temp, "set");
		break;
		
	case "get":
		if(!Object.hasOwnProperty.call(localStorage, prefix + e.data.key)) return send("Error, key '"+e.data.key+"' not set", "error");
		send(JSON.parse(localStorage[prefix + e.data.key]), "get");
		break;
		
	case "del":
		temp= (localStorage[prefix + e.data.key]||"").length;
		delete localStorage[prefix + e.data.key];
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
