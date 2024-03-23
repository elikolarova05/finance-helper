const colors = ["#FF2531", "#FEA200", "#00A856", "#56C222", "#1B3D9F", "#1982c4"];
[...document.getElementsByClassName("calculator-item")].forEach(function (element, i) {
    element.style.backgroundColor = colors[i];
});