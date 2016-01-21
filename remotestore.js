// remotestore.js by dandavis [CCBY4], 2016. allows accessing the same storage from any domain. client code.
function RemoteStore(URL){

	if(Array.isArray(URL)) return RemoteStore.pool(URL);

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


RemoteStore.pool=function Pool(arrURLs){ // allows a cluster of RemoteStores to act as one via the normal interface

	function _call(op, key, value){
		var slot = 0;
		if(readyState){
			if(key in index){
				slot=index[key];
			}else{
				slot=weights.indexOf(Math.min.apply(0, weights)); 	// smallest used
				index[key]=slot;
			}

			return r[slot][op](key, value).then(function(value){
				if(op==="set" || op==="del"){
					available+=value;
					weights[slot]-=value;
				}
				if(op==="del") delete index[key];
				return value;
			});
		}else{
			return new Promise(function(resolve, reject) { 
				(function _waiter(){
					if(!readyState) return setTimeout(_waiter, 33);
					_call(op, key, value).then(resolve).catch(reject);
				}());
			});
		}
	}


	var r=arrURLs.map(RemoteStore),
	index={},
	used=0,
	weights= arrURLs.map(Number.bind(0,0)),
	available=0,
	readyState=0,
	api={
		dir: function(){
			return readyState ? 
				Promise.resolve(Object.keys(index))  :
				Promise.all(r.map(function(a){return a.dir();})).then(function(r){
					return r.reduce(function(a,b){return a.concat(b);},[]);
				});
		},

		set: _call.bind(null, "set"),
		get: _call.bind(null, "get"),
		del: _call.bind(null, "del"),

		get readyState(){ return readyState;},
		get used(){ return used;},
		get available(){ return available-used;},
	};

	Promise.all(r.map(function(a){return a.dir();})).then(function(rez){
		rez.forEach(function(a, b){ 
			a.forEach(function(key){
				index[key]=b; 
			});
			used+= (weights[b]=r[b].used);
			available += 5 * 1000 * 1000;
		});
		readyState = 1;
	});

   return api;
};
