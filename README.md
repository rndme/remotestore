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
Usage:

	var store = RemoteStore(strURLofHtmlServerPage); // one common domain w/ String
	var store = RemoteStore([strURL1, strURL2, ...]);// pool many domains w/ Array

#### Promise Methods:

	get: 	(key) - fetches a saved value from the RemoteStore(s)'s server's localStorage
	set: 	(key, value) - save a value to the least-used localStorage or update an existing value
	dir: 	() - fetches an array of stored key names
	del: 	(key) - delete a key:value pair by key, yields the size difference
	
#### Property Getters:

	readyState: [0|1] - have the iframe(s) loaded and checked-in?
	used: n -the # of bytes consumed by the data
	

### Examples

#### Create a new RemoteStore Instance
`var myRS = RemoteStore("https://pagedemos.com/store/remotestore.html");`
#### Save key/value paid and show the available byte adjustment
`myRS.set("test", "Hello World").then(alert); // shows: -11`
#### List Saved Keys
`myRS.dir().then(alert); // shows: test`
#### Load a Saved Key
`myRS.get("test").then(alert); // shows: Hello World`
#### Load a Missing Key and get error info
`myRS.get("asdf").catch(JSON.stringify).then(alert);` <br />
`// shows: {"res":"Error, key 'asdf' not set","domain":"https://pagedemos.com","type":"error" ...}`
#### Remove a Saved Key and get the cost adjustment
`myRS.del("test").then(alert); // shows: 11`









