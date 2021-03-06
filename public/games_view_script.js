// Games functions
console.log('Games script loaded')

function jsonToText(text) {
    var newDiv = document.createElement("div");
    var newContent = document.createTextNode(text); 
    newDiv.appendChild(newContent);  
    var currentDiv = document.getElementById("consoleForm"); 
    document.body.appendChild(newDiv, currentDiv);
}

function getConsoleFunction() {
    let id = document.getElementById('getConsoleId').value
    fetch('/console/' + id)
    .then( (data) => { return (data.json()) })
    .then(function(myJson) {
        jsonToText(JSON.stringify(myJson));
    })
    .catch( (error) => { console.log(error) })
}
function insertConsoleFunction() {
    let name = document.getElementById('insertConsoleName').value
    let date = document.getElementById('insertConsoleDate').value
    let brand = document.getElementById('insertConsoleBrand').value
    fetch('/console/')
}
