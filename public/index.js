console.log('Index script loaded')

function alertFunction() {
    fetch('/index')
        .then((data) => { console.log(data) })
        .catch((error) => { console.log(error) })
}
