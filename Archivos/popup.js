
const ChkEsconderTweetsER = document.getElementById('ChkEsconderTweetsER');

chrome.storage.local.get('EsconderTweetsER', function (data) {
    if (data.EsconderTweetsER) ChkEsconderTweetsER.checked = true; 
});


ChkEsconderTweetsER.addEventListener('change', (event) => {

    if (event.target.checked) {
        chrome.storage.local.set({ EsconderTweetsER: true }, function () { })
    } else {
        chrome.storage.local.set({ EsconderTweetsER: false }, function () { })
    }

})

// *******************************************************************************
// *******************************************************************************

const ChkEsconderASeguir = document.getElementById('ChkEsconderASeguir');

chrome.storage.local.get('EsconderASeguir', function (data) {
    if (data.EsconderASeguir) ChkEsconderASeguir.checked = true;
});


ChkEsconderASeguir.addEventListener('change', (event) => {

    if (event.target.checked) {
        chrome.storage.local.set({ EsconderASeguir: true }, function () { })
    } else {
        chrome.storage.local.set({ EsconderASeguir: false }, function () { })
    }

})

// *******************************************************************************
// *******************************************************************************

const ChkEsconderTendencias = document.getElementById('ChkEsconderTendencias');

chrome.storage.local.get('EsconderTendencias', function (data) {
    if (data.EsconderTendencias) ChkEsconderTendencias.checked = true;
});


ChkEsconderTendencias.addEventListener('change', (event) => {

    if (event.target.checked) {
        chrome.storage.local.set({ EsconderTendencias: true }, function () { })
    } else {
        chrome.storage.local.set({ EsconderTendencias: false }, function () { })
    }

})

// *******************************************************************************
// *******************************************************************************

const ChkAvisarNoCronologico = document.getElementById('ChkAvisarNoCronologico');

chrome.storage.local.get('AvisarNoCronologico', function (data) {
    if (data.AvisarNoCronologico) ChkAvisarNoCronologico.checked = true;
});


ChkAvisarNoCronologico.addEventListener('change', (event) => {

    if (event.target.checked) {
        chrome.storage.local.set({ AvisarNoCronologico: true }, function () { })
    } else {
        chrome.storage.local.set({ AvisarNoCronologico: false }, function () { })
    }

})

// *******************************************************************************
// *******************************************************************************

const ChkMostrarMensajeTweetOculto = document.getElementById('ChkMostrarMensajeTweetOculto');

chrome.storage.local.get('MostrarMensajeTweetOculto', function (data) {
    if (data.MostrarMensajeTweetOculto) ChkMostrarMensajeTweetOculto.checked = true;
});


ChkMostrarMensajeTweetOculto.addEventListener('change', (event) => {

    if (event.target.checked) {
        chrome.storage.local.set({ MostrarMensajeTweetOculto: true }, function () { })
    } else {
        chrome.storage.local.set({ MostrarMensajeTweetOculto: false }, function () { })
    }

})

// *******************************************************************************
// *******************************************************************************

//const BtnPruebas = document.getElementById('BtnPruebas');


//BtnPruebas.addEventListener('click', (event) => {

//    chrome.storage.local.get(function (respuesta) {

//        console.log("Prueba log");
//        var tweetsPorUsuario = respuesta.TweetsPorUsuario;
//        tweetsPorUsuario.push({ Usuario: "ensayo", Cantidad: 222 });
//        chrome.storage.local.set({ TweetsPorUsuario: tweetsPorUsuario }, function () { });
//        console.log(tweetsPorUsuario);

//    });

//})

// *******************************************************************************
// *******************************************************************************


const SlcMesesOcultoEnlaceVisto = document.getElementById('SlcMesesOcultoEnlaceVisto');

chrome.storage.local.get('MesesOcultoEnlaceVisto', function (data) {


    document.getElementById("SlcMesesOcultoEnlaceVisto").value = data.MesesOcultoEnlaceVisto.toString();
    CambiarPluralMeses(data.MesesOcultoEnlaceVisto);

});


SlcMesesOcultoEnlaceVisto.addEventListener("change", function (data) {

    var índice = document.getElementById("SlcMesesOcultoEnlaceVisto").selectedIndex;
    var opciones = document.getElementById("SlcMesesOcultoEnlaceVisto").options;
    var mesesOcultoEnlaceVisto = parseInt(opciones[índice].text);
    if (mesesOcultoEnlaceVisto > 3) {
        document.getElementById("SpAlertaMuchosMeses").style.display = "block";
    } else {
        document.getElementById("SpAlertaMuchosMeses").style.display = "none";
    }

    CambiarPluralMeses(mesesOcultoEnlaceVisto);

    chrome.storage.local.set({ MesesOcultoEnlaceVisto: mesesOcultoEnlaceVisto }, function () { })

});

function CambiarPluralMeses(mesesOcultoEnlaceVisto) {

    if (mesesOcultoEnlaceVisto === 1) {
        document.getElementById("MesesOcultoEnlaceVistoMonthsPlural").style.display = "none";
        document.getElementById("MesesOcultoEnlaceVistoMonthsSingular").style.display = "block";
    } else {
        document.getElementById("MesesOcultoEnlaceVistoMonthsPlural").style.display = "block";
        document.getElementById("MesesOcultoEnlaceVistoMonthsSingular").style.display = "none";
    }

} // CambiarPluralMeses>


// *******************************************************************************
// *******************************************************************************

// *******************************************************************************
// *******************************************************************************


const SlcMaximosTweetsDiariosPorUsuario = document.getElementById('SlcMaximosTweetsDiariosPorUsuario');

chrome.storage.local.get('MaximosTweetsDiariosPorUsuario', function (data) {
    document.getElementById("SlcMaximosTweetsDiariosPorUsuario").value = data.MaximosTweetsDiariosPorUsuario.toString();
});


SlcMaximosTweetsDiariosPorUsuario.addEventListener("change", function (data) {

    var indice = document.getElementById("SlcMaximosTweetsDiariosPorUsuario").selectedIndex;
    var opciones = document.getElementById("SlcMaximosTweetsDiariosPorUsuario").options;
    var maximosTweetsDiariosPorUsuario = parseInt(opciones[indice].text);
    chrome.storage.local.set({ MaximosTweetsDiariosPorUsuario: maximosTweetsDiariosPorUsuario }, function () { })
    chrome.storage.local.set({ TweetsProcesadosHoy: [] }, function () { }); // Se reinicia para que los cambios sean efectivos de inmediato y se tenga que esperar hasta el otro día. Tiene el efecto que termina mostrando más tweets de los permitidos diarios anteriormente, pero al ser por la acción del usuario es aceptable.
    chrome.storage.local.set({ TweetsPorUsuario: [] }, function () { }); // Se reinicia para que los cambios sean efectivos de inmediato y se tenga que esperar hasta el otro día. Tiene el efecto que termina mostrando más tweets de los permitidos diarios anteriormente, pero al ser por la acción del usuario es aceptable.

});


// *******************************************************************************
// *******************************************************************************

