async function loadPage(name, id) {
    document.getElementById(id).innerHTML = await load(`docs/${name}.html`)
}

async function loadResource(name, id) {
    document.getElementById(id).innerHTML = await load(`resources/${name}`)
}

async function load(path, isJson = false) {
    try {
        const response = await fetch(`/finance-helper/${path}`);
        if (isJson) {
            return await response.json()
        }
        return await response.text();
    } catch (error) {
        return console.error(`Error loading ${path}:`, error);
    }
}
