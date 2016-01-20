// remotestore.js by dandavis [CCBY4]. allows accessing the same storage from any domain. client code.
function RemoteStore(URL){

	var frm=document.createElement("iframe"), 
	 readyState= 0,
	 used= 0;
	 
	frm.height=frm.width=frm.style.opacity= 0;
	document.body.appendChild(frm).onload = function init(){
		readyState = 1;	// mark as loaded
		frm.onload = null;	// don't fire again in case of a frame hijack
	};
	
	setTimeout(function(){	frm.src=URL; }, 10);

	function send(msg){
		frm.contentWindow.postMessage(msg, "*");
	}

	function transact (req){ // creates a transaction to talk to the iframe's localStorage
		req.serial = Math.random();	// transaction secret (to ID incoming messages as belonging to the request)

		function deliver(){ //	send request to iframe or wait if not connected
			return readyState ? send(req) : setTimeout(deliver, 50);
		}
		
		return new Promise(function(resolve, reject) { // a promise to retrieve the results of the query
			addEventListener("message", function handleMessage(e){ // watch all messages until the transaction returns
				if(!e.data || !e.data._IS_REMOTE_STORE || e.data.serial!=req.serial) return;	// not a remotestore event or not the right transaction, bail
				removeEventListener("message", handleMessage); // serial # hit, stop listening
				if(e.data.type!="error"){
					resolve(e.data.res);	// yield back the response data from the iframe's storage server
				}else{
					reject(e.data);	// yield back the error and details about the transaction
				}
			});			
			deliver();	// queue the request
		});
	} // end transact()

	transact({cmd:"used"}).then(function(n){ used=+n; }); // load footprint size in background
	
	return { // the client-side storage API:
		get: 	function(key){ return transact({cmd:"get", key: key});},
		set: 	function(key, value){ return transact({cmd:"set", key: key, value: value});},
		dir: 	function(){ return transact({cmd:"dir"});},
		del: 	function(key){ return transact({cmd:"del", key: key});},
		get readyState(){ return readyState;},
		get used(){ return used;},
	};   
}
