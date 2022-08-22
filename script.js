const element = document.getElementById("number")
const another = document.getElementById("another")

function toggleOn() {
  element.innerHTML = "4394830"
}

function toggleOff() {
  element.innerHTML = "4.3 mil"
}

function toggleOnether() {
  another.innerHTML = "4394830"
}

function toggleOffether() {
  another.innerHTML = "4.3 million"
}

element.addEventListener('mouseover', toggleOn)
element.addEventListener('mouseleave', toggleOff)
another.addEventListener('mouseover', toggleOnether)
another.addEventListener('mouseleave', toggleOffether)
