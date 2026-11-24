// =========================================
// 1. CARRUSEL (automático, con flechas y en círculo)
// =========================================
const tira = document.querySelector('.slider-tira');
const btnIzquierda = document.getElementById('btn-izq');
const btnDerecha = document.getElementById('btn-der');

const DURACION = 700;   // milisegundos que dura el deslizamiento (0.7 segundos)
const ANIMACION = 'transform ' + DURACION + 'ms ease-in-out';

let moviendo = false;   // evita que se mezclen movimientos si tocan las flechas muy rápido
let intervaloAutoplay;

// SIGUIENTE: la tira se desliza una tarjeta a la izquierda,
// y cuando termina, la primera tarjeta se manda al final de la fila.
function siguienteTarjeta() {
    if (moviendo) return;
    moviendo = true;

    tira.style.transition = ANIMACION;
    tira.style.transform = 'translateX(-100%)';

    setTimeout(function () {
        tira.style.transition = 'none';                 // sin animación para el "truco"
        tira.appendChild(tira.firstElementChild);       // la primera pasa al final
        tira.style.transform = 'translateX(0)';         // la tira vuelve a su lugar
        moviendo = false;
    }, DURACION);
}

// ANTERIOR: la última tarjeta se manda al principio (sin que se note),
// la tira arranca corrida un lugar y se desliza hasta su posición.
function anteriorTarjeta() {
    if (moviendo) return;
    moviendo = true;

    tira.style.transition = 'none';
    tira.insertBefore(tira.lastElementChild, tira.firstElementChild);
    tira.style.transform = 'translateX(-100%)';

    tira.offsetWidth;   // obliga al navegador a aplicar lo anterior antes de animar

    tira.style.transition = ANIMACION;
    tira.style.transform = 'translateX(0)';

    setTimeout(function () {
        moviendo = false;
    }, DURACION);
}

// Cada 3 segundos pasa sola a la siguiente
function iniciarAutoplay() {
    intervaloAutoplay = setInterval(siguienteTarjeta, 3000);
}

// Si el usuario toca una flecha, reiniciamos el reloj de 3 segundos
function reiniciarAutoplay() {
    clearInterval(intervaloAutoplay);
    iniciarAutoplay();
}

btnDerecha.addEventListener('click', function () {
    siguienteTarjeta();
    reiniciarAutoplay();
});

btnIzquierda.addEventListener('click', function () {
    anteriorTarjeta();
    reiniciarAutoplay();
});

iniciarAutoplay();

iniciarAutoplay();

// =========================================
// 2. ANIMACIÓN DE SERVICIOS AL LLEGAR CON EL SCROLL
// =========================================
const seccionServicios = document.querySelector('.seccion-servicios');

// El "observador" avisa cuando la sección entra en la pantalla
const observador = new IntersectionObserver(function (entradas) {
    if (entradas[0].isIntersecting) {
        seccionServicios.classList.add('visible'); // el CSS hace el resto
        observador.disconnect();                   // ya no hace falta seguir mirando
    }
}, { threshold: 0.3 }); // 0.3 = cuando se ve el 30% de la sección

observador.observe(seccionServicios);


// =========================================
// 3. FORMULARIO DE CONTACTO (EmailJS)
// =========================================
emailjs.init({ publicKey: '4LNMeM_ykeIjiObm_' });

const formulario = document.getElementById('form-contacto');
const botonEnviar = document.querySelector('.btn-enviar');

formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();   // evita que la página se recargue

    botonEnviar.textContent = 'ENVIANDO...';
    botonEnviar.disabled = true;   // evita que lo aprieten dos veces

    emailjs.sendForm('service_ua7dtin', 'template_n3g8ltd', formulario)
        .then(function () {
            alert('¡Gracias por tu mensaje! Te respondemos pronto.');
            formulario.reset();
        }, function (error) {
            alert('No se pudo enviar el mensaje. Probá de nuevo en un rato.');
            console.log('Error de EmailJS:', error);
        })
        .finally(function () {
            botonEnviar.textContent = 'ENVIAR';
            botonEnviar.disabled = false;
        });
});

// =========================================
// 5. SCROLL SUAVE AL APRETAR EL MENÚ
// =========================================
const DURACION_SCROLL = 1200;   // milisegundos: más alto = más lento
const menuFijo = document.querySelector('.contenedor-menu-completo');
const enlacesMenu = document.querySelectorAll('.menu-enlaces a');

// Curva de velocidad: arranca despacio, acelera y frena despacio
function suavizar(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function irASeccion(destino) {
    const inicio = window.scrollY;
    const espacio = menuFijo.offsetHeight + 40;   // alto real del menú + un poco de aire
    const fin = destino.getBoundingClientRect().top + window.scrollY - espacio;
    const distancia = fin - inicio;
    let tiempoInicial = null;

    // Esta función se repite en cada cuadro de la animación
    function paso(tiempoActual) {
        if (tiempoInicial === null) tiempoInicial = tiempoActual;

        const progreso = Math.min((tiempoActual - tiempoInicial) / DURACION_SCROLL, 1);
        window.scrollTo(0, inicio + distancia * suavizar(progreso));

        if (progreso < 1) requestAnimationFrame(paso);   // sigue hasta llegar
    }

    requestAnimationFrame(paso);
}

enlacesMenu.forEach(function (enlace) {
    enlace.addEventListener('click', function (evento) {
        evento.preventDefault();   // frena el salto directo

        const destino = document.querySelector(enlace.getAttribute('href'));
        if (destino) irASeccion(destino);
    });
});