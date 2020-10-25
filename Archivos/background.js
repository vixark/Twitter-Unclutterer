

chrome.runtime.onStartup.addListener(function () {

    chrome.storage.local.set({ Iniciado: true }, function () { });

    chrome.storage.local.set({ EnlacesProcesadosHoy: [] }, function () { });

    chrome.storage.local.set({ TweetsProcesadosHoy: [] }, function () { });

    chrome.storage.local.get(function (respuesta) {
    
        var enlacesVistos = respuesta.EnlacesVistos;
        chrome.storage.local.get(function (respuesta2) {

            var fechaLímiteEV = new Date() - respuesta2.MesesOcultoEnlaceVisto * 30.43 * 24 * 60 * 60 * 1000;
            var últimoÍndiceAEliminarEV = enlacesVistos.length - 1;
            for (var i = 0; i < enlacesVistos.length; i++) { // Se hace con for por rendimiento https://nikitahl.com/how-to-find-an-item-in-a-javascript-array/.

                if (Date.parse(enlacesVistos[i].Fecha) > fechaLímiteEV) {
                    últimoÍndiceAEliminarEV = i - 1;
                    break;
                }

            }
            enlacesVistos.splice(0, últimoÍndiceAEliminarEV + 1);
            chrome.storage.local.set({ EnlacesVistos: enlacesVistos }, function () { });

            var hoyTexto = Hoy();
            if (hoyTexto !== respuesta2.FechaReinicioTweetsPorUsuario) {
                chrome.storage.local.set({ TweetsPorUsuario: [] }, function () { });
                chrome.storage.local.set({ FechaReinicioTweetsPorUsuario: hoyTexto }, function () { });
            }

        });

    });

});


chrome.runtime.onInstalled.addListener(function () {

    chrome.storage.local.set({ EsconderTweetsER: true }, function () { });

    chrome.storage.local.set({ EsconderASeguir: true }, function () { });

    chrome.storage.local.set({ EsconderTendencias: true }, function () { });

    chrome.storage.local.set({ AvisarNoCronologico: true }, function () { });

    chrome.storage.local.set({ MostrarMensajeTweetOculto: true }, function () { });

    chrome.storage.local.set({ EnlacesVistos: [] }, function () { });

    chrome.storage.local.set({ EnlacesProcesadosHoy: [] }, function () { });

    chrome.storage.local.set({ TweetsProcesadosHoy: [] }, function () { });

    chrome.storage.local.set({ TweetsPorUsuario: [] }, function () { });

    chrome.storage.local.set({ MesesOcultoEnlaceVisto: 1 }, function () { });

    chrome.storage.local.set({ MaximosTweetsDiariosPorUsuario: 20 }, function () { });

    chrome.storage.local.set({ FechaReinicioTweetsPorUsuario: Hoy() }, function () { });

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({ pageUrl: { hostEquals: 'twitter.com' }, })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });

});


function Hoy() {

    var today = new Date();
    return today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");

} // Hoy>