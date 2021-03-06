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
    console.log(id)
    fetch('/console/' + id)
    .then( (data) => { return data.json() })
    .then(function(myJson) {
        jsonToText(JSON.stringify(myJson));
    })
    .catch( (error) => { console.log(error) })
}
