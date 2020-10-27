
var clasesEnlaceTweet = "a.r-111h2gw, a.r-1re7ezh, a.r-9ilb82";

var EstiloNotificadorOculto = "color: #666; font-size: 9px; padding-top: 3px; padding-bottom: 3px; padding-left: 10px; padding-right: 10px; font-family: calibri; text-align: center"

var EstiloEnlace = "color: #777;"

var EsconderTweetsER = false;
chrome.storage.local.get('EsconderTweetsER', function (data) { EsconderTweetsER = data.EsconderTweetsER; });

var EsconderASeguirV = false;
chrome.storage.local.get('EsconderASeguir', function (data) { EsconderASeguirV = data.EsconderASeguir; });

var EsconderTendenciasV = false;
chrome.storage.local.get('EsconderTendencias', function (data) { EsconderTendenciasV = data.EsconderTendencias; });

var AvisarNoCronologicoV = false;
chrome.storage.local.get('AvisarNoCronologico', function (data) { AvisarNoCronologicoV = data.AvisarNoCronologico; });

var MostrarMensajeTweetOculto = false;
chrome.storage.local.get('MostrarMensajeTweetOculto', function (data) { MostrarMensajeTweetOculto = data.MostrarMensajeTweetOculto; });


var scrolling = false; // Tomado de https://www.benmarshall.me/attaching-javascript-handlers-to-scroll-events/.
window.onscroll = function (e) {  scrolling = true; }
setInterval(function () {
    if (scrolling) {
        scrolling = false;
        AvisarNoCronologico();  
    }
}, 10000); // Ajustar el valor para ejecutar más rápido después de finalizar el desplazamiento. Se usa aquí porque no es algo que se requiera hacer de manera urgente 


var cambiandoPágina = false; 
setInterval(function () {
    if (cambiandoPágina) {
        cambiandoPágina = false;
        CambioDePágina();
    }
}, 500);


function CambioDePágina() {

    EsconderASeguir(EsconderASeguirV);
    EsconderTendencias();

} // CambioDePágina>


var observadorMutaciones = new MutationObserver(function (mutaciones) {

    var esconderASeguirPorUrl = !(window.location.toString().contiene("followers") || window.location.toString().contiene("following"));
    var esconderASeguirEfectivo = esconderASeguirPorUrl && EsconderASeguirV;

    chrome.storage.local.get(function (respuesta) {

        var tweetsProcesadosHoy = respuesta.TweetsProcesadosHoy;
        var tweetsPorUsuario = respuesta.TweetsPorUsuario;
        var maximosTweetsPorUsuario = respuesta.MaximosTweetsDiariosPorUsuario;
        var enlacesVistos = respuesta.EnlacesVistos;
        var enlacesProcesadosHoy = respuesta.EnlacesProcesadosHoy;
        var guardarObjetos = false;

        mutaciones.forEach(function (mutación) {

            var nodos = mutación.addedNodes;
            for (var j = nodos.length - 1; j >= 0; j--) {

                var nodo = nodos[j];  
                if (nodo.tagName === "DIV" || nodo.tagName === "div") {
                    
                    var artículos = nodo.querySelectorAll("article.css-1dbjc4n");
                    if (nodo.classList.contains("r-18bvks7")) { // Es necesario detectar también este contenedor porque se puede tratar de una carta con imagen y enlace que se suele añadir después de añadir el article (que se añade preliminarmente sin carta y por lo tanto no se puede obtener la url de este). En estos casos se detecta la adición de la carta y se pasa el article tataratataratataraabuelo completo (incluyendo la carta).<div aria-hidden="true" class="css-1dbjc4n r-1ila09b r-pm2fo r-zmljjp r-rull8r r-qklmqi r-1adg3ll" data-testid="card.layoutLarge.media">.
                        artículos = [nodo.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement];
                    }

                    if (artículos.length > 0) { // Es un div con un nuevo tweet.

                        artículos.forEach(artículo => { // Aunque no es usual que coincidan varios artículos en una sola mutación, se permite para abarcar todos los posibles casos.

                            var respuesta2 = EsconderTweetsPorMáximosDiarios(artículo, tweetsProcesadosHoy, tweetsPorUsuario, maximosTweetsPorUsuario);
                            var ocultarTweet2 = respuesta2[0];
                            tweetsPorUsuario = respuesta2[1];
                            tweetsProcesadosHoy = respuesta2[2];
                            if (!ocultarTweet2) {

                                var respuesta3 = EsconderTweetsEnlacesRepetidos(artículo, enlacesVistos, enlacesProcesadosHoy, tweetsPorUsuario);
                                var ocultarTweet3 = respuesta3[0];
                                enlacesVistos = respuesta3[1];
                                enlacesProcesadosHoy = respuesta3[2];

                            }

                            guardarObjetos = true;

                        });

                    } else {

                        if (nodo.classList.contains("r-1mlwlqe")) { // Todos los contenedores de imagenes, incluye imagenes de perfil en los tweets e imagenes en tweets. Se quiere detectar cuando es una imagen de un perfil en la sección 'Who to follow'.

                            if (!nodo.classList.contains("r-61z16t") && !nodo.classList.contains("r-11wrixw")) { // r-61z16t es la clase de los contenedores de imagenes en los tweets. r-11wrixw es una clase de contenedores de imagenes cuando hay más de una imagen en el tweet. En los otros casos posiblemente se trate de una imagen de perfil.

                            } else {
                                // Agregado contenedor de imagen en tweet.        
                            }

                        } else {

                            if (nodo.classList.contains("cn-not-tweet-oculto")) {
                                // Es un notificador creado por Twitter Unclutterer. Agregado Notificador Tweet Oculto.
                            } else {

                                var atributoAriaLabel = nodo.getAttribute("aria-label");
                                if (atributoAriaLabel === "image" || atributoAriaLabel === "Image" || atributoAriaLabel === "imagen" || atributoAriaLabel === "Imagen") { // Soportado español e inglés.
                                    // Contenedor de imagen.
                                } else {

                                    if (nodo.classList.contains("r-1t68eob")) {
                                        // Agregado Indicador GIF.
                                    } else {
   
                                        var dataTestID = nodo.getAttribute("data-testid");
                                        if (dataTestID === "tweetPhoto") {
                                            // Agregada imagen múltiple.
                                        } else {

                                            if (nodo.classList.contains("r-11wrixw")) { // Clase usada principalmente para los contenedores de imagenes.
                                                // Agregada Imagen 2.
                                            } else {

                                                var videos = nodo.querySelectorAll("video");
                                                if (videos.length > 0) {
                                                    // Agregado Video.
                                                } else {

                                                    var contenedoresVideos = nodo.querySelectorAll("div.r-l4nmg1");
                                                    if (contenedoresVideos.length > 0) { // Clase usada principalmente para los contenedores de videos.
                                                        // Agregado Video 2.
                                                    } else {

                                                        var contenedoresGifsOVideos = nodo.querySelectorAll('div[data-testid="videoPlayer"]')
                                                        if (contenedoresGifsOVideos.length > 0) {
                                                            // Agregado Contenedor Gifs o Video.
                                                        } else {

                                                            var secciones = nodo.querySelectorAll("div.r-1udh08x section"); // Siempre es la sección de tendencias y se agrega varias veces a medida que se cargan nuevos elementos.
                                                            if (secciones.length === 1) { // Agregado elemento con una sección.
                                                                EsconderTendencias();
                                                            } else {

                                                                var asides = nodo.querySelectorAll("div.r-1udh08x aside"); // Siempre es la sección de 'A seguir' y se agrega varias veces a medida que se cargan nuevos elementos.
                                                                if (asides.length === 1) { // Agregado elemento con un aside.
                                                                    EsconderASeguir(esconderASeguirEfectivo);
                                                                } else {

                                                                    var descripciones = nodo.querySelectorAll("div.css-1dbjc4n div[data-testid='UserDescription']");
                                                                    if (descripciones.length > 0) {
                                                                        cambiandoPágina = true;
                                                                    } else {

                                                                        if (nodo.getAttribute("dir") === "auto" && nodo.classList.contains("r-n6v787")) { // Enlaces poco visibles, particularmente usado para detectar el enlace "XXXX Tweets" que aparece debajo del nombre de usuario en la página de usuario, este elemento se inserta cuando se pasa de la vista de tweet de un usuario a la página de usuario entonces sirve para detectar el cambio de página en este caso.
                                                                            cambiandoPágina = true;
                                                                        } else {

                                                                            if (!nodo.hasAttribute("class") && !nodo.hasAttribute("id")) { // Elementos del timeline (usualmente en la página de otro usuario) que no son tweets.

                                                                                var sugerenciasUsuarios = nodo.querySelectorAll("div[data-testid='UserCell']");
                                                                                if (sugerenciasUsuarios.length > 0) { // Usuarios sugeridos agregados después de los primeros tweets en la página de algún usuario.
                                                                                    if (esconderASeguirEfectivo) sugerenciasUsuarios.forEach(sugerenciaUsuario => {

                                                                                        if (!window.location.toString().contiene("/status/")) { // Para que no elimine los usuarios en la lista de usuarios que le dieron like o retweet a cierto tweet.
                                                                                            sugerenciaUsuario.remove();
                                                                                        }
                                                                                    
                                                                                    }); // Normalmente es 1 pero se hace el código para que pudieran ser varios.
                                                                                } else {

                                                                                    var títulosElementos = nodo.querySelectorAll("h2[role = 'heading'] div span");
                                                                                    if (títulosElementos.length > 0) { // El título who to follow y topics to follow.
                                                                                        if (esconderASeguirEfectivo) títulosElementos[0].parentElement.parentElement.parentElement.remove(); // Si se elimina el nodo completo sale un error.
                                                                                    } else {

                                                                                        var elementosAriaLabelTopic = nodo.querySelectorAll("div[aria-label='Topic'], div[aria-label='Tema']"); // Soportado en español e inglés.
                                                                                        if (elementosAriaLabelTopic.length > 0) { // Elementos de 'Topicos a seguir'.
                                                                                            if (esconderASeguirEfectivo) elementosAriaLabelTopic.forEach(elementoAriaLabelTopic => { elementoAriaLabelTopic.parentElement.parentElement.remove(); }); // Normalmente es 1 pero se hace el código para que pudieran ser varios.
                                                                                        } else {

                                                                                            var enlacesElementosExtra = nodo.querySelectorAll("a[href*='connect_people'], a[href*='topics_selector']");
                                                                                            if (enlacesElementosExtra.length > 0) {
                                                                                                if (esconderASeguirEfectivo) enlacesElementosExtra.forEach(enlaceElementoExtra => { enlaceElementoExtra.parentElement.remove(); }); // Normalmente es 1 pero se hace el código para que pudieran ser varios.
                                                                                            } else {

                                                                                                var enlacesASeguirTimeline = nodo.querySelectorAll("a.r-1j3t67a"); // En pocas ocasiones se muestra en twitter un elemento con tópicos a seguir y cuentas asociadas a esos tópicos. Se prefiere el selector r-1j3t67a porque este permite seleccionar tanto las sugerencias como el elemento 'See more'. El objeto es así   <div style="position: absolute; width: 100%; transform: translateY(942.4px); transition: transform 0.15s linear 0s;"><a href="/i/lists/35609614" role="link" data-focusable="true" class="css-4rbku5 css-18t94o4 css-1dbjc4n r-yfoy6g r-1ila09b r-qklmqi r-1loqt21 r-1ny4l3l r-1j3t67a r-1w50u8q r-o7ynqc r-6416eg">
                                                                                                if (enlacesASeguirTimeline.length > 0) {
                                                                                                    if (esconderASeguirEfectivo) enlacesASeguirTimeline.forEach(enlaceASeguirTimeline => { enlaceASeguirTimeline.parentElement.remove(); });
                                                                                                }

                                                                                            }
     
                                                                                        }
                                                                   
                                                                                    }

                                                                                }

                                                                            } else {
                                                                                // Agregado Otro Div.
                                                                            }

                                                                        }            

                                                                    }

                                                                }

                                                            }

                                                        }

                                                    }

                                                }

                                            }

                                        }

                                    }

                                }

                            }
                        }
                    }

                } else if (nodo.tagName === "ASIDE" || nodo.tagName === "aside") {
                    EsconderASeguir(esconderASeguirEfectivo); 
                } else if (nodo.tagName === "SECTION" || nodo.tagName === "section") {
                    EsconderTendencias();
                } else if (nodo.tagName === "IMG" || nodo.tagName === "img") {

                    if (nodo.classList.contains("css-9pa8cd")) {
                        // Imagen de 'Who to follow'.
                    } else {
                        // Imagen que no es de 'Who to follow'.
                    }

                } else if (nodo.tagName === "svg" || nodo.tagName === "SVG") { // Por lo general se trata del SVG del ícono de home o de otro de las opciones en el menú principal lateral. Siempre indica un cambio de página.
                    cambiandoPágina = true;
                } else {
                    // Otro elemento no DIV ni ASIDE ni SECTION ni IMG ni SVG.
                }
         
            }

        });

        if (guardarObjetos) {

            chrome.storage.local.set({ TweetsPorUsuario: tweetsPorUsuario }, function () { });
            chrome.storage.local.set({ TweetsProcesadosHoy: tweetsProcesadosHoy }, function () { });
            chrome.storage.local.set({ EnlacesProcesadosHoy: enlacesProcesadosHoy }, function () { });
            chrome.storage.local.set({ EnlacesVistos: enlacesVistos }, function () { });

        }

    });

}); // var observadorMutaciones = new MutationObserver>


var configuradorObservadorMutaciones = { subtree: true, childList: true };
observadorMutaciones.observe(document, configuradorObservadorMutaciones);


function AvisarNoCronologico() {

    if (window.location.toString() !== "https://twitter.com/home") return;

    if (!AvisarNoCronologicoV) return;
    var botones = document.querySelectorAll("div.r-53xb7h"); // Coincide con todos los botones grandes rectangulares, son alrededor de 8.
    botones.forEach(botón => {

        var ariaLabel = botón.getAttribute("aria-label");
        if (ariaLabel === "Top Tweets on" || ariaLabel === "Tweets destacados activados") { // Soportado en español e inglés.

            var cnOrdenCronológico = document.getElementById("cn-not-ordencronologico");
            if (!cnOrdenCronológico) {

                var notificadorOrdenCronológico = document.createElement("div");
                notificadorOrdenCronológico.id = "cn-not-ordencronologico";
                notificadorOrdenCronológico.setAttribute("style", "background-color: red; font-weight: bold; font-size: 36px; color: white; font-family: calibri; padding: 10px; border-radius: 10px");
                notificadorOrdenCronológico.appendChild(document.createTextNode("Chronological timeline disabled!"));
                botón.parentElement.parentElement.parentElement.appendChild(notificadorOrdenCronológico);

            }

        }

    });

} // AvisarNoCronologico>


function EsconderTendencias() {

    if (!EsconderTendenciasV) return;
    var secciones = document.querySelectorAll("div.r-1udh08x section"); // Coincide con todos los botones grandes rectangulares, son alrededor de 8. 
    secciones.forEach(sección => {
        var clasesElementoAbuelo = sección.parentElement.parentElement.classList
        if (!clasesElementoAbuelo.contains("r-16y2uox") && !clasesElementoAbuelo.contains("r-yfoy6g") && !clasesElementoAbuelo.contains("r-14lw9ot")
            && !clasesElementoAbuelo.contains("r-kemksi")) sección.remove(); // Tweets laterales a foto: r-yfoy6g es en el tema oscuro medio, r-14lw9ot es en el tema blanco, r-kemksi es en el tema negro completo.
    }); // Debería ser solo una pero no se verifica. Las secciones que tienen abuelo con clase r-16y2uox son elementos para mostrar la lista de usuarios que le dieron like o retweet a cierto tweet. Las que tienen abuelo con clase r-yfoy6g son los tweets de respuesta a la derecha cuando se abre una imagen o otro elemento oculto que se usa en esta página.

} // EsconderTendencias>


function EsconderASeguir(esconderASeguir) {

    if (!esconderASeguir) return;
    var asides = document.querySelectorAll("div.r-1udh08x aside"); // Coincide con todos los botones grandes rectangulares, son alrededor de 8.
    asides.forEach(aside => { aside.remove(); });// Debería ser solo una pero no se verifica.

} // EsconderASeguir>


function EsconderTweetsPorMáximosDiarios(artículo, tweetsProcesadosHoy, tweetsPorUsuario, maximosTweetsPorUsuario) {

    if (window.location.toString() !== "https://twitter.com/home") return [false, tweetsPorUsuario, tweetsProcesadosHoy];

    var tweetID = "";
    var usuario = "";
    var enlacesConID = artículo.querySelectorAll(clasesEnlaceTweet); // r-1re7ezh es del tema de color blanco, r-111h2gw del gris/azul y a.r-9ilb82 del negro.
    enlacesConID.forEach(enlaceConID => {
        var partes = enlaceConID.href.split("/");
        if (partes.length === 6) {
            tweetID = partes[5];
            usuario = partes[3];
        }
    });

    if (tweetID === "" || usuario === "" || !usuario && !tweetID) return [false, tweetsPorUsuario, tweetsProcesadosHoy];

    var ocultarTweetProcesadoHoy = false;
    var tweetProcesadoHoy = false;
    for (var j = 0; j < tweetsProcesadosHoy.length; j++) { // Se hace con for por rendimiento https://nikitahl.com/how-to-find-an-item-in-a-javascript-array/.
        if (tweetsProcesadosHoy[j].TweetID === tweetID) {
            tweetProcesadoHoy = true;
            ocultarTweetProcesadoHoy = tweetsProcesadosHoy[j].Ocultar;
        }
    }

    var ocultarTweet = false;
    if (!tweetProcesadoHoy) {

        var faltaUsuario = true;
        var tweetsUsuarioHoy = 0;
        for (var k = 0; k < tweetsPorUsuario.length; k++) { // Se hace con for por rendimiento https://nikitahl.com/how-to-find-an-item-in-a-javascript-array/.

            if (tweetsPorUsuario[k].Usuario === usuario) {

                tweetsPorUsuario[k].Cantidad++;
                faltaUsuario = false;
                tweetsUsuarioHoy = tweetsPorUsuario[k].Cantidad;
                if (tweetsUsuarioHoy > maximosTweetsPorUsuario) ocultarTweet = true;
                break;

            }

        }

        if (faltaUsuario) {
            tweetsUsuarioHoy = 1;
            tweetsPorUsuario.push({ Cantidad: 1, Usuario: usuario });
        }

        tweetsProcesadosHoy.push({ Ocultar: ocultarTweet, Razon: "MáximoDiario", TweetID: tweetID });

    } else {
        ocultarTweet = ocultarTweetProcesadoHoy;
    }

    if (ocultarTweet) {

        if (MostrarMensajeTweetOculto) {

            var notificadorOculto = document.createElement("div");
            var enlaceTweetOculto = document.createElement("a");
            var enlaceUsuario = document.createElement("a");

            enlaceTweetOculto.innerText = "tweet";
            enlaceUsuario.innerText = usuario;

            enlaceTweetOculto.setAttribute("href", "https://twitter.com/" + usuario + "/status/" + tweetID.toString());
            enlaceUsuario.setAttribute("href", "https://twitter.com/" + usuario);

            notificadorOculto.setAttribute("style", EstiloNotificadorOculto);
            notificadorOculto.classList.add("cn-not-tweet-oculto");
            enlaceTweetOculto.setAttribute("style", EstiloEnlace);
            enlaceUsuario.setAttribute("style", EstiloEnlace);

            notificadorOculto.appendChild(document.createTextNode("Hidden "));
            notificadorOculto.appendChild(enlaceTweetOculto);
            notificadorOculto.appendChild(document.createTextNode(" from "));
            notificadorOculto.appendChild(enlaceUsuario);
            notificadorOculto.appendChild(document.createTextNode(" because it reached the daily limit."));
            if (artículo.parentElement === null) {
                // Error.           
            } else {
                artículo.parentElement.appendChild(notificadorOculto);
            }

        }

        artículo.remove();

    }

    return [ocultarTweet, tweetsPorUsuario, tweetsProcesadosHoy];

} // EsconderTweetsPorMáximosDiarios>


function EsconderTweetsEnlacesRepetidos(artículo, enlacesVistos, enlacesProcesadosHoy, tweetsPorUsuario) {

    if (!EsconderTweetsER) return [false, enlacesVistos, enlacesProcesadosHoy];
    
    var id = "";
    var usuario = "";
    var enlacesConID = artículo.querySelectorAll(clasesEnlaceTweet); // r-1re7ezh es del tema de color blanco, r-111h2gw del gris/azul y a.r-9ilb82 del negro.
    enlacesConID.forEach(enlaceConID => {
        var partes = enlaceConID.href.split("/");
        if (partes.length === 6) {
            id = partes[5];
            usuario = partes[3];
        }
    });

    if (id === "") return [false, enlacesVistos, enlacesProcesadosHoy];

    var enlacesEnArtículo = artículo.querySelectorAll("a.r-1n1174f, a.r-1pi2tsx"); // r-1pi2tsx es la clase del enlace con imagen. r-1n1174f es la clase de un enlace cualquiera (a otro sitio, usuario o hashtag) en un tweet.
    var tweetOculto = false;

    enlacesEnArtículo.forEach(enlace => {

        if (!tweetOculto) { // Si ya se ocultó por otro enlace no verifica los otros enlaces. No es necesario y genera errores.

            var hrefUrl = LimpiarUrl(enlace.href);      
            if (hrefUrl.indexOf("https://twitter.com") !== 0) { // Si no empieza por https://twitter.com es un enlace externo que se debe supervisar. Si empieza por https://twitter.com es un enlace interno, posiblemente a un nombre de usuario o hashtag, en estos casos no se ocultan los tweets.

                var títuloUrl = LimpiarUrl(enlace.title); // También una url y puede ser diferente a la que está en href. La de href puede ser de t.co y la de título la directa. 
                var respuesta2 = IntentarOcultarTweet(hrefUrl, enlacesVistos, id, artículo, usuario, enlacesProcesadosHoy, títuloUrl, tweetsPorUsuario);
                tweetOculto = respuesta2[0];
                enlacesVistos = respuesta2[1];
                enlacesProcesadosHoy = respuesta2[2];

                if (!tweetOculto && títuloUrl.indexOf("http") === 0) {

                    var respuesta3 = IntentarOcultarTweet(títuloUrl, enlacesVistos, id, artículo, usuario, enlacesProcesadosHoy, títuloUrl, tweetsPorUsuario); // Puede ser vacío en el caso de los enlaces con imagen.  
                    tweetOculto = respuesta3[0];
                    enlacesVistos = respuesta3[1];
                    enlacesProcesadosHoy = respuesta3[2];

                }

            }

        }

    });

    return [tweetOculto, enlacesVistos, enlacesProcesadosHoy];

} /* EsconderTweetsEnlacesRepetidos> */


function RestarTweetPorUsuario(usuario, tweetsPorUsuario) {

    for (var k = 0; k < tweetsPorUsuario.length; k++) { // Se hace con for por rendimiento https://nikitahl.com/how-to-find-an-item-in-a-javascript-array/.
        if (tweetsPorUsuario[k].Usuario === usuario) {
            tweetsPorUsuario[k].Cantidad--;
            break;
        }
    }

} // RestarTweetPorUsuario>


function IntentarOcultarTweet(url, enlacesVistos, tweetIDActual, artículo, usuario, enlacesProcesadosHoy, urlTítulo) { // Obtiene el TweetID del tweet donde fue visto por primera vez el enlace. Devuelve verdadero si se escondió el tweet.

    // Omisión de ocultado de dominios
    var partes = url.split("/");
    if (partes.length === 3 || (partes.length === 4 && url.terminaEn("/"))) return [false, enlacesVistos, enlacesProcesadosHoy]; // No se esconde nunca los enlaces de dominios como https://twitter.com o https://twitter.com/.

    var partes2 = urlTítulo.split("/");
    if (partes2.length === 3 || (partes2.length === 4 && urlTítulo.terminaEn("/"))) return [false, enlacesVistos, enlacesProcesadosHoy]; // No se esconde nunca los enlaces de dominios como https://twitter.com o https://twitter.com/.
    // Omisión de ocultado de dominios>

    // Verificación si el Tweet ya fue procesado en la sesión actual.
    var ocultarTweetEnlaceProcesadoHoy = false;
    var enlaceEnTweetYaProcesado = false;
    var tweetIDOriginalYaProcesado = "";
    for (var j = 0; j < enlacesProcesadosHoy.length; j++) { // Se hace con for por rendimiento https://nikitahl.com/how-to-find-an-item-in-a-javascript-array/.
        if (enlacesProcesadosHoy[j].TweetID === tweetIDActual && enlacesProcesadosHoy[j].Enlace === url) {
            enlaceEnTweetYaProcesado = true;
            ocultarTweetEnlaceProcesadoHoy = enlacesProcesadosHoy[j].Ocultar;
            tweetIDOriginalYaProcesado = enlacesProcesadosHoy[j].TweetIDOriginal;
        } // Si el tweet ID ya fue procesado en la sesión actual no lo vuelve a verificar por rendimiento. Esta lista es de mucho menor tamaño que la otra entonces revisarla toda es más corto.
    }
    // Verificación si el Tweet ya fue procesado en la sesión actual>

    var tweetID = "";
    var ocultarTweet = false;
    if (!enlaceEnTweetYaProcesado) {

        for (var i = 0; i < enlacesVistos.length; i++) { // Se hace con for por rendimiento https://nikitahl.com/how-to-find-an-item-in-a-javascript-array/.
            if (enlacesVistos[i].Enlace === url) {
                tweetID = enlacesVistos[i].TweetID;
                break;
            }
        }

        if (tweetID === "") { // El enlace no se ha encontrado antes. Se añade a la lista.
            enlacesVistos.push({ TweetID: tweetIDActual, Enlace: url, Fecha: Hoy() }); // Agregar a lista   
        } else if (tweetID === tweetIDActual) {
            // El enlace se encontró por primera vez en el Tweet actual entonces no se debe ocultar el Tweet.
        } else if (tweetID !== tweetIDActual) { // El enlace ya se había visto antes en otro Tweet. Se debe esconder el tweet actual.
            ocultarTweet = true;
        }

        enlacesProcesadosHoy.push({ TweetID: tweetIDActual, Enlace: url, Ocultar: ocultarTweet, Razon: "EnlaceYaVisto", TweetIDOriginal: tweetID });
        
    } else {

        ocultarTweet = ocultarTweetEnlaceProcesadoHoy;
        tweetID = tweetIDOriginalYaProcesado;
        
    }

    if (ocultarTweet) {

        if (MostrarMensajeTweetOculto) {

            var notificadorOculto = document.createElement("div");
            var enlaceTweetOculto = document.createElement("a");
            var enlaceTweetAnterior = document.createElement("a");
            var enlaceOculto = document.createElement("a");
            var enlaceUsuario = document.createElement("a");

            enlaceTweetOculto.innerText = "tweet";
            enlaceTweetAnterior.innerText = "here";
            enlaceOculto.innerText = url;
            enlaceUsuario.innerText = usuario;

            enlaceTweetOculto.setAttribute("href", "https://twitter.com/" + usuario + "/status/" + tweetIDActual.toString());
            enlaceTweetAnterior.setAttribute("href", "https://twitter.com/" + usuario + "/status/" + tweetID.toString());

            enlaceOculto.setAttribute("href", url);
            enlaceUsuario.setAttribute("href", "https://twitter.com/" + usuario);

            notificadorOculto.setAttribute("style", EstiloNotificadorOculto);
            notificadorOculto.classList.add("cn-not-tweet-oculto");
            enlaceTweetOculto.setAttribute("style", EstiloEnlace);
            enlaceTweetAnterior.setAttribute("style", EstiloEnlace);
            enlaceOculto.setAttribute("style", EstiloEnlace);
            enlaceUsuario.setAttribute("style", EstiloEnlace);

            notificadorOculto.appendChild(document.createTextNode("Hidden "));
            notificadorOculto.appendChild(enlaceTweetOculto);
            notificadorOculto.appendChild(document.createTextNode(" from "));
            notificadorOculto.appendChild(enlaceUsuario);
            notificadorOculto.appendChild(document.createTextNode(" with "));
            notificadorOculto.appendChild(enlaceOculto);
            notificadorOculto.appendChild(document.createTextNode(" because it was seen before "));
            notificadorOculto.appendChild(enlaceTweetAnterior);
            notificadorOculto.appendChild(document.createTextNode("."));
            if (artículo.parentElement === null) {
                // Error.
            } else {
                artículo.parentElement.appendChild(notificadorOculto);
            }

        }

        artículo.remove();

    }

    if (ocultarTweet) RestarTweetPorUsuario(usuario, tweetsPorUsuario); // Si el tweet fue oculto por enlace ya visto no se tiene en cuenta para la regla de máximos tweets diarios.

    return [ocultarTweet, enlacesVistos, enlacesProcesadosHoy];

} // IntentarOcultarTweet>


function LimpiarUrl(url) {

    if (url.contiene("facebook.com")) { // Aquí se deben añadir todos sitios que usen parámetros para cambiar el contenido.

        var partes = url.split("#"); // No se limpia por parámetros porque los sitios los pueden usar para variar el contenido, por ejemplo https://m.facebook.com/story.php.
        return partes[0];

    } else {

        var partes2 = url.split("#"); 
        var partes3 = partes2[0].split("?"); 
        return partes3[0];

    }

} // LimpiarEnlace>


function Hoy() {

    var today = new Date();
    return today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");

} // Hoy>


String.prototype.terminaEn = function (suffix) { // @* Reemplazo de String.prototype.endsWith. Algunos usuarios disponen de una implementación de javascript que no tiene aún endsWith entonces se prefiere no usarla. *@
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};


String.prototype.contiene = function (palabra) { // @* Reemplazo de String.prototype.endsWith. Algunos usuarios disponen de una implementación de javascript que no tiene aún endsWith entonces se prefiere no usarla. *@
    return this.indexOf(palabra) !== -1;
};