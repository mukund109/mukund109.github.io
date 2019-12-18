const dummyData = {"points": [{"sub1":"2600","sub2":"Ninjas","metric_1":0.2,"metric_2":32.52250609909164},{"sub1":"2600","sub2":"electronicmusic","metric_1":0.5,"metric_2":21.42150994756465},{"sub1":"2600","sub2":"windowshots","metric_1":0.34,"metric_2":19.248131158202415},{"sub1":"2600","sub2":"4chan","metric_1":0.87,"metric_2":1.70086223158346},{"sub1":"2600","sub2":"newreddits","metric_1":0.1,"metric_2":15.509884244428907},{"sub1":"2600","sub2":"hackers","metric_1":0.12,"metric_2":15.318975079021484},{"sub1":"2600","sub2":"redditchan","metric_1":0.6,"metric_2":13.341503682850295},{"sub1":"2600","sub2":"javascript","metric_1":0.003,"metric_2":12.062198813421645}]};
var baseUrl = "http://"+atob("MTM5LjU5LjE2Ljg0")

function httpGetAsync(url, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
}

function renderVisualization(subreddit){
	console.log("composing visualization for " + subreddit);
	clearVisualization()
	httpGetAsync(baseUrl + '/data/' + subreddit, function(response){
		visualize(document.getElementById("svg-container"), JSON.parse(response))
	});
	// need to check if subreddit is valid?
}

function clearVisualization(){
	// remove svg from svg-container
	container = document.getElementById("svg-container");
	container.removeChild(container.firstChild);

	// remove tooltip
	let tooltip = document.getElementsByClassName("tooltip")[0];
	if(tooltip){tooltip.remove();}
}

