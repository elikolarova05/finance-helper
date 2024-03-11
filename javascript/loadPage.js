async function loadPage(name, id) {
    document.getElementById(id).innerHTML = await load(`docs/${name}.html`)
}

 async function loadResource(name, id) {
    document.getElementById(id).innerHTML = await load(`resources/${name}`)
}


 async function load(path) {
    try {
        const response = await fetch(`../${path}`);
        return await response.text();
    } catch (error) {
        return console.error(`Error loading ${path}:`, error);
    }
}