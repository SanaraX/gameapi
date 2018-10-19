console.log('Index script loaded')


fetch('./index/')
    .then((data) => { console.log(data) })
    .catch((error) => { console.log(error) })

