
const searchBox = document.getElementsByClassName('search-input')[0]

searchBox.addEventListener('focus', function(){
	this.parentElement.classList.add('focus')
});

searchBox.addEventListener('blur', function(){
	this.parentElement.classList.remove('focus')
});

