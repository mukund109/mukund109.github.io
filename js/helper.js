var baseUrl = "https://api.subreddit.space"

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
	clearVisualization()
	httpGetAsync(baseUrl + '/data/' + subreddit, function(response){
		visualize(document.getElementById("svg-container"), JSON.parse(response))
	});
}

function clearVisualization(){
	// remove svg from svg-container
	container = document.getElementById("svg-container");
	if(container.firstChild){
		container.removeChild(container.firstChild);
	}
	// remove tooltip
	let tooltip = document.getElementsByClassName("tooltip")[0];
	if(tooltip){tooltip.remove();}
}

