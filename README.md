# remotestore
## allows domain to share and pool localStorage data 

The browser-provided localStorage interface is only available to same-domain pages and is limited to just 5mb of data. 

With RemoteStore, you can access the localStorage of a specified domain from any domain, and you can pool many domains together to save larger amounts of data.


### How it Works
RemoteStore requires two parts to operate: 

1. 1+ HTML "server" page(s) that live in a hidden iframe
2. a JavaScript client library that provides Promise-based access to the hidden frame's localStorage

You first need to copy `remotestore.html` and `remotestore.server.js` to a domain you control, preferably one that you don't use for hosting client applications. You can publish more than one to pool localStorage resources. Note that if your page or app runs on HTTPS, then you will need to host the above file on HTTTPS as well. Also note that you should not use an `X-Frame-Options` iframe policy header when serving the html files.

You then load the `remotestore.js` library into your app, and point it towards the html "server" file(s) as you spawn an instance of the storage API, passing the constructor the URL(s).



### The Interface
	get: 	(key) - fetches a saved value from the RemoteStore(s)'s server's localStorage
	set: 	(key, value) - save a value to the least-used localStorage or update an existing value
	dir: 	() - fetches an array of stored key names
	del: 	(key) - delete a key:value pair by key, yields the size difference
	readyState: [0|1] - have the iframe(s) loaded and checked-in?
	used: n -the # of bytes consumed by the data
	




