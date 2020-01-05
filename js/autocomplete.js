// wrapper for 'httpGetAsync' that caches requests
const autocomplete_cache = {}
function httpGetAsyncCached(url, callback){
	if (url in autocomplete_cache){
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
	while(ul.firstChild){ ul.removeChild(ul.firstChild); }
}

// adds list elements to unordered list
function addListElements(ul, suggestions){
	// set class attr and inner html
	for(let i=0; i<suggestions.length; i++){
		let li = document.createElement("li");
		li.innerHTML = suggestions[i];
		li.setAttribute("class", "suggested-item");
		li.setAttribute("tabIndex", "0");
		li.addEventListener("mouseover", function(e){this.style.color = "black";});
		li.addEventListener("mouseleave", function(e){this.style.color = '';});
		ul.appendChild(li);
	}
}

const search_container = document.getElementById("search-container")
const input = document.getElementById("input")
const output_ul = document.getElementById("suggestion-ul") 
const button = document.getElementById("submit-button")
const inter_button = document.getElementById("intersection-button")
const diff_button = document.getElementById("difference-button")

// Hides suggestion list when user clicks elsewhere on the screen
document.body.addEventListener("click", function(e){
	if (!search_container.contains(e.target)){
		output_ul.style.visibility = "hidden";
		removeListElements(output_ul);
	}
});


// the suggestion chosen by arrow keys
var chosenSuggestion;

// updates the 'chosenSuggestion' to either its sibling, or the first/last one in the dropdown
function updateChosen(toNext){
	if(chosenSuggestion){
		next = toNext ? chosenSuggestion.nextSibling : chosenSuggestion.previousSibling;
		if (!next){return;}
		chosenSuggestion.dispatchEvent(new Event("mouseleave"));
		chosenSuggestion = next;
		chosenSuggestion.dispatchEvent(new Event("mouseover"));
		input.value = chosenSuggestion.innerHTML;
	}
	else{
		chosenSuggestion = toNext ? output_ul.firstChild : output_ul.lastChild;
		chosenSuggestion.dispatchEvent(new Event("mouseover"));
		input.value = chosenSuggestion.innerHTML;
	}
}
// on arrow keydown, updates 'chosenSuggestion', iff the focus is on the 'input' element
document.body.addEventListener("keydown", function(e){
	if(document.activeElement===input){
		if(e.keyCode == 40 || e.keyCode == 38){
			e.preventDefault();
			updateChosen(e.keyCode==40);
		}
	}
});


// event listener for change in input
input.addEventListener("input", function(e){

	const inputElement = this;
	var query = this.value;

	if (query=='') { 
		output_ul.style.visibility = "hidden";
		removeListElements(output_ul); 
		return;
	}

	chosenSuggestion = undefined;

	
	setTimeout( function(){
		
		if (inputElement.value != query){return;}

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

	}, 500)

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
	if(e.keyCode == 13){ 
		e.preventDefault();
		button.click(); 
	}
});

inter_button.addEventListener("mousedown", function(e){
	e.preventDefault();
	input.value = input.value.trim() + " ∩ ";
	input.dispatchEvent(new Event("input"));
});

diff_button.addEventListener("mousedown", function(e){
	e.preventDefault();
	input.value = input.value.trim() + " - ";
	input.dispatchEvent(new Event("input"));
});

