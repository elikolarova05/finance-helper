/**
 * Export html from a given file and imports it to the innerHTML of a given element (by id)
 * @param name - the file name
 * @param id - id of the element
 */
 function loadPage (name, id) {
    fetch(`${name}.html`)
            .then(response => response.text())
            .then(html => {
                document.getElementById(id).innerHTML = html;
            })
            .catch(error => console.error(`Error loading ${name}:`, error));
}
