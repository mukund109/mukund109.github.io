// wrapper for 'httpGetAsync' that caches requests
const autocomplete_cache = {}
function httpGetAsyncCached(url, callback){
	if (url in autocomplete_cache){
		console.log("serving cached")
		callback(autocomplete_cache[url]);
	}
	else{
		httpGetAsync(url, function(response){
			autocomplete_cache[url] = response;
			callback(response);
		});
	}
}

// removes all children from unordered list
function removeListElements(ul){
	console.log("removing list items")
	while(ul.firstChild){ ul.removeChild(ul.firstChild); }
}

// adds list elements to unordered list
function addListElements(ul, suggestions){
	// set class attr and inner html
	console.log("adding list items")
	for(let i=0; i<suggestions.length; i++){
		let li = document.createElement("li");
		li.innerHTML = suggestions[i]
		li.setAttribute("class", "suggested-item")
		ul.appendChild(li);
	}
}

function autocomplete(input, output_ul, button){

	// event listener for change in input
	input.addEventListener("input", function(e){

		const inputElement = this;
		var query = this.value;

		if (query=='') { 
			output_ul.style.visibility = "hidden";
			removeListElements(output_ul); 
			return;
		}

		httpGetAsyncCached(baseUrl+'/autocomplete/'+query, function(response){
	
			removeListElements(output_ul);		
	
			if (query == inputElement.value){
				const suggestions = JSON.parse(response).suggestions

				if (suggestions.length == 0) {
					output_ul.style.visibility = "hidden";
					return;
				}
				addListElements(output_ul, suggestions)
				output_ul.style.visibility = "visible";
			}

		});

	});


	// event listener for when autocomplete suggestion is clicked on
	output_ul.addEventListener("click", function(e) {
		if (e.target && e.target.matches(".suggested-item")) {
			removeListElements(output_ul);
			output_ul.style.visibility = "hidden";
			input.value = e.target.innerHTML;
			button.click();
		}
	});


	// button press
	button.addEventListener("click", function(e){ 
		removeListElements(output_ul);
		output_ul.style.visibility = "hidden";
		renderVisualization(input.value);
	});

	//'enter' key press
	input.addEventListener("keydown", function(e){
		if(event.keyCode == 13){ 
			event.preventDefault();
			button.click(); 
		}
	});
}
