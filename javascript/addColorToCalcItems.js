const colors = ["#e32e2e", "#faac26", "#02a15e", "#34cf65", "#7d31cf", "#45a2b5"];
[...document.getElementsByClassName("calculator-item")].forEach(function (element, i) {
    element.style.backgroundColor = colors[i];
});