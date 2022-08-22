const element = document.getElementById("number")

function toggleOn() {
  element.innerHTML = "4394830"
}

function toggleOff() {
  element.innerHTML = "4.3 million"
}

element.addEventListener('mouseover', toggleOn)
element.addEventListener('mouseleave', toggleOff)
