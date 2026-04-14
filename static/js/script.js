let tareaEditando = null
let tareaAEliminar = null
let fechaActual = new Date();
let tareasGlobal = [];
let carpetaActual = "Todas";
let fechaSeleccionada = null;
let estadoSeleccionado = "todos";

const inputFecha = document.getElementById("fecha")

function obtenerFechaHoyLocal() {
    const hoy = new Date()
    return hoy.getFullYear() + "-" +
        String(hoy.getMonth() + 1).padStart(2, "0") + "-" +
        String(hoy.getDate()).padStart(2, "0")
}

inputFecha.min = obtenerFechaHoyLocal()
document.getElementById("fecha").min = obtenerFechaHoyLocal();

const modalEliminar = document.getElementById("modalEliminar")

const btnCerrarEliminar = document.getElementById("cerrarEliminar")
const btnCancelarEliminar = document.getElementById("cancelarEliminar")
const btnConfirmarEliminar = document.getElementById("confirmarEliminar")

document.addEventListener("DOMContentLoaded", () => {
    cargarTareas();
});

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("titulo").addEventListener("input", actualizarBoton)
    document.getElementById("descripcion").addEventListener("input", actualizarBoton)
})

function formatearFecha(fecha){

    const f = new Date(fecha)

    const dia = String(f.getUTCDate()).padStart(2, "0")
    const mes = String(f.getUTCMonth() + 1).padStart(2, "0")
    const año = f.getUTCFullYear()

    return `${dia}/${mes}/${año}`
}

function obtenerBotonEstado(tarea) {

    if (tarea.estado === "pendiente") {
        return `
            <button class="btn-estado iniciar" onclick="cambiarEstado(${tarea.id}, 'en progreso')">
                ▶️
            </button>
        `
    }

    if (tarea.estado === "en progreso") {
        return `
            <button class="btn-estado completar" onclick="cambiarEstado(${tarea.id}, 'completada')">
                ✅
            </button>
        `
    }

    return ""
}

function obtenerInfoColor(color) {
    const colores = {
        azul: { nombre: "Hogar", clase: "tag-azul" },
        rojo: { nombre: "Urgente", clase: "tag-rojo" },
        verde: { nombre: "Trabajo", clase: "tag-verde" },
        amarillo: { nombre: "Estudio", clase: "tag-amarillo" },
        morado: { nombre: "Personal", clase: "tag-morado" },
        gris: { nombre: "Otros", clase: "tag-gris" }
    }

    return colores[color] || null
}

function aplicarFiltros() {

    let tareasFiltradas = tareasGlobal;
    
    if (carpetaActual !== "Todas") {
        tareasFiltradas = tareasFiltradas.filter(t => 
            String(t.carpeta_id) === String(carpetaActual)
        );
    }

    if (fechaSeleccionada) {
        tareasFiltradas = tareasFiltradas.filter(t => {
            const fechaUTC = new Date(t.fecha);

            const fechaLocal = new Date(
                fechaUTC.getUTCFullYear(),
                fechaUTC.getUTCMonth(),
                fechaUTC.getUTCDate()
            );

            const fechaStr = fechaLocal.getFullYear() + "-" +
                String(fechaLocal.getMonth() + 1).padStart(2, '0') + "-" +
                String(fechaLocal.getDate()).padStart(2, '0');
            return fechaStr === fechaSeleccionada;
        });
    }

        // 📁 filtro carpeta
    if (carpetaActual !== "Todas") {
        tareasFiltradas = tareasFiltradas.filter(t =>
            String(t.carpeta_id) === String(carpetaActual)
        );
    }

    // 📅 filtro fecha
    if (fechaSeleccionada) {
        tareasFiltradas = tareasFiltradas.filter(t =>
            t.fecha === fechaSeleccionada
        );
    }

    // 🔥 NUEVO: filtro estado
    if (estadoSeleccionado !== "todos") {
        tareasFiltradas = tareasFiltradas.filter(t =>
            t.estado === estadoSeleccionado
        );
    }

    mostrarTareas(tareasFiltradas);
    actualizarInfoFiltros();
}

function filtrarPorEstado(estado, elemento) {
    estadoSeleccionado = estado;

    document.querySelectorAll(".estado-filtros button")
        .forEach(b => b.classList.remove("active"));

    elemento.classList.add("active");

    aplicarFiltros();
    actualizarInfoFiltros();
}



function seleccionarCarpeta(id, elemento) {

    document.querySelectorAll(".folder-item")
        .forEach(f => f.classList.remove("active"));

    elemento.classList.add("active");

    carpetaActual = id;

    fechaSeleccionada = null;

    document.querySelectorAll(".day")
        .forEach(d => d.classList.remove("day-selected"));

    aplicarFiltros();
}


document.addEventListener("DOMContentLoaded", () => {

    const modalCarpeta = document.getElementById("modalCarpeta");
    const btnAddFolder = document.querySelector(".btn-add-folder");
    const cerrarModalCarpeta = document.getElementById("cerrarModalCarpeta");
    const cancelarCarpeta = document.getElementById("cancelarCarpeta");
    const btnGuardar = document.getElementById("guardarCarpeta");

    let creandoCarpeta = false;

    btnAddFolder.addEventListener("click", () => {
        modalCarpeta.classList.add("active");

        setTimeout(() => {
            document.getElementById("nombreCarpeta").focus();
        }, 100);
    });

    cerrarModalCarpeta.onclick = cerrarModalCarpetaFn;
    cancelarCarpeta.onclick = cerrarModalCarpetaFn;

    modalCarpeta.addEventListener("click", (e) => {
        if (e.target === modalCarpeta) {
            cerrarModalCarpetaFn();
        }
    });

    document.getElementById("nombreCarpeta").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            btnGuardar.click();
        }
    });

    function cerrarModalCarpetaFn() {
        modalCarpeta.classList.remove("active");
        document.getElementById("nombreCarpeta").value = "";
        document.getElementById("errorCarpeta").textContent = "";
    }

    // 🔥 AQUÍ VA TU GUARDAR (MODIFICADO)
    btnGuardar.addEventListener("click", async () => {

        if (creandoCarpeta) return;
        creandoCarpeta = true;

        const input = document.getElementById("nombreCarpeta");
        const error = document.getElementById("errorCarpeta");

        let nombre = input.value.trim();
        error.textContent = "";

        if (!nombre) {
            error.textContent = "El nombre es obligatorio";
            creandoCarpeta = false;
            return;
        }

        if ([...document.querySelectorAll(".folder-name")]
            .some(f => f.textContent.trim().toLowerCase() === nombre.toLowerCase())) {

            error.textContent = "Esa carpeta ya existe";
            creandoCarpeta = false;
            return;
        }

        try {
            const res = await fetch("/carpetas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre })
            });

            if (!res.ok) {
                const err = await res.json();
                error.textContent = err.error || "Error al crear carpeta";
                creandoCarpeta = false;
                return;
            }

            cerrarModalCarpetaFn();
            await cargarCarpetas();
            mostrarToast("Carpeta creada", "success");

        } catch (err) {
            console.error(err);
            mostrarToast("Error inesperado", "error");
        }

        creandoCarpeta = false;
    });

});

const modalEditarCarpeta = document.getElementById("modalEditarCarpeta");
const cerrarEditarCarpeta = document.getElementById("cerrarEditarCarpeta");
const cancelarEditarCarpeta = document.getElementById("cancelarEditarCarpeta");
const inputEditarCarpeta = document.getElementById("inputEditarCarpeta");
const errorEditarCarpeta = document.getElementById("errorEditarCarpeta");
const btnGuardarEditarCarpeta = document.getElementById("guardarEditarCarpeta");

let carpetaEditando = null;

btnGuardarEditarCarpeta.addEventListener("click", async () => {

    let nombre = inputEditarCarpeta.value.trim();
    errorEditarCarpeta.textContent = "";

    if (!nombre) {
        errorEditarCarpeta.textContent = "El nombre es obligatorio";
        return;
    }

    try {
        const res = await fetch("/carpetas/" + carpetaEditando, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre })
        });

        if (!res.ok) {
            const err = await res.json();
            errorEditarCarpeta.textContent = err.error || "Error";
            return;
        }

        cerrarModalEditarCarpeta();
        await cargarCarpetas();
        mostrarToast("Carpeta actualizada", "success");

    } catch (err) {
        mostrarToast("Error de conexión", "error");
    }
});

function cerrarModalEditarCarpeta() {
    modalEditarCarpeta.classList.remove("active");
    inputEditarCarpeta.value = "";
    errorEditarCarpeta.textContent = "";
    carpetaEditando = null;
}

cerrarEditarCarpeta.onclick = cerrarModalEditarCarpeta;
cancelarEditarCarpeta.onclick = cerrarModalEditarCarpeta;

modalEditarCarpeta.addEventListener("click", (e) => {
    if (e.target === modalEditarCarpeta) {
        cerrarModalEditarCarpeta();
    }
});


const modalEliminarCarpeta = document.getElementById("modalEliminarCarpeta");
const cerrarEliminarCarpeta = document.getElementById("cerrarEliminarCarpeta");
const cancelarEliminarCarpeta = document.getElementById("cancelarEliminarCarpeta");
const confirmarEliminarCarpeta = document.getElementById("confirmarEliminarCarpeta");

let carpetaAEliminar = null;

function cerrarModalEliminarCarpeta() {
    modalEliminarCarpeta.classList.remove("active");
    carpetaAEliminar = null;
}

cerrarEliminarCarpeta.onclick = cerrarModalEliminarCarpeta;
cancelarEliminarCarpeta.onclick = cerrarModalEliminarCarpeta;

modalEliminarCarpeta.addEventListener("click", (e) => {
    if (e.target === modalEliminarCarpeta) {
        cerrarModalEliminarCarpeta();
    }
});

confirmarEliminarCarpeta.addEventListener("click", async () => {

    try {
        const res = await fetch("/carpetas/" + carpetaAEliminar, {
            method: "DELETE"
        });

        if (!res.ok) {
            const err = await res.json();
            mostrarToast(err.error || "Error al eliminar", "error");
            return;
        }

        cerrarModalEliminarCarpeta();

        // 🔥 RESET DE ESTADO
        carpetaActual = "Todas";
        fechaSeleccionada = null;

        await cargarCarpetas();
        await cargarTareas();

        // 🔥 APLICAR FILTRO A TODAS
        aplicarFiltros();

        mostrarToast("Carpeta eliminada", "success");

    } catch (err) {
        mostrarToast("Error de conexión", "error");
    }
});




async function cargarCarpetas() {
    const res = await fetch("/carpetas");

    if (!res.ok) {
        const text = await res.text();
        console.error("Error backend:", text);
        return;
    }

    const carpetas = await res.json();

    if (!Array.isArray(carpetas)) {
        console.error("No es array:", carpetas);
        return;
    }

    const lista = document.getElementById("folder-list");
    const select = document.getElementById("task-folder");

    lista.innerHTML = `
        <li class="folder-item" data-id="Todas" onclick="seleccionarCarpeta('Todas', this)">
            <span class="folder-icon">📁</span>
            <span class="folder-name">Todas</span>
        </li>
    `;

    select.innerHTML = `<option value="">Sin carpeta</option>`;

    carpetas.forEach(carpeta => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("folder-wrapper");

        const li = document.createElement("li");
        li.classList.add("folder-item");
        li.dataset.id = carpeta.id; 

        li.innerHTML = `
            <span class="folder-icon">📁</span>
            <span class="folder-name">${carpeta.nombre}</span>
            <div class="folder-actions">
                <button class="edit-folder">✏️</button>
                <button class="delete-folder">🗑️</button>
                <span class="arrow"></span>
            </div>
        `;

        li.querySelector(".edit-folder").onclick = (e) => {
            e.stopPropagation();
            carpetaEditando = carpeta.id;
            inputEditarCarpeta.value = carpeta.nombre;

            modalEditarCarpeta.classList.add("active");

            setTimeout(() => {
                inputEditarCarpeta.focus();
            }, 100);
        };

        li.querySelector(".delete-folder").onclick = (e) => {
            e.stopPropagation();

            carpetaAEliminar = carpeta.id;
            modalEliminarCarpeta.classList.add("active");
        };

        const subList = document.createElement("ul");
        subList.classList.add("subtasks");

        const tareasDeCarpeta = tareasGlobal.filter(t => 
            String(t.carpeta_id) === String(carpeta.id)
        );

        tareasDeCarpeta.forEach(t => {
            const item = document.createElement("li");
            item.classList.add("subtask-item");
            item.textContent = t.titulo;

            item.onclick = () => {
                seleccionarCarpeta(carpeta.id, li);
            };

            subList.appendChild(item);
        });

        li.addEventListener("click", function () {
            li.classList.toggle("open");
            subList.classList.toggle("show");
            seleccionarCarpeta(carpeta.id, li);
        });

        wrapper.appendChild(li);
        wrapper.appendChild(subList);

        lista.appendChild(wrapper);

        const option = document.createElement("option");
        option.value = carpeta.id;
        option.textContent = carpeta.nombre;

        select.appendChild(option);
    });
    setTimeout(() => {

        const elementoActivo = document.querySelector(
            `.folder-item[data-id="${carpetaActual}"]`
        );

        if (elementoActivo) {
            document.querySelectorAll(".folder-item")
                .forEach(f => f.classList.remove("active"));

            elementoActivo.classList.add("active");
        }
        aplicarFiltros();
    }, 0);  
}

function editarCarpeta(id, nombreActual) {
    const nuevoNombre = prompt("Nuevo nombre de la carpeta:", nombreActual);
    if (!nuevoNombre) return;

    fetch("/carpetas/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevoNombre })
    }).then(() => {
        cargarCarpetas();
        mostrarToast("Carpeta actualizada", "success");
    });
}

function eliminarCarpeta(id) {
    if (!confirm("¿Eliminar esta carpeta?")) return;

    fetch("/carpetas/" + id, {
        method: "DELETE"
    }).then(() => {
        cargarCarpetas();
        mostrarToast("Carpeta eliminada", "success");
    });
}

function renderCalendar() {
    const grid = document.getElementById("calendar-grid");
    const title = document.getElementById("calendar-title");
    if (!grid || !title) return;

    grid.innerHTML = "";
    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth();
    const diasMes = new Date(year, month + 1, 0).getDate();
    
    // Ajuste para que la semana empiece en Lunes (0=Dom, 1=Lun...)
    let primerDia = new Date(year, month, 1).getDay();
    const offset = (primerDia === 0 ? 6 : primerDia - 1);

    title.textContent = fechaActual.toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric"
    });

    let htmlAcumulado = "";

    // Espacios vacíos del inicio
    for (let i = 0; i < offset; i++) {
        htmlAcumulado += `<div></div>`;
    }

    // Dibujar los días del mes
    for (let dia = 1; dia <= diasMes; dia++) {
        const fechaStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

        // VALIDACIÓN ANTI-ERRORES:
        const tieneTarea = tareasGlobal.some(t => {
            if (!t.fecha) return false;

            if (t.estado === "completada") return false;

            const [y, m, d] = t.fecha.split("T")[0].split("-");
            const fechaUTC = new Date(t.fecha);

            // 🔥 convertir a LOCAL sin desfase
            const fechaLocal = new Date(
                fechaUTC.getUTCFullYear(),
                fechaUTC.getUTCMonth(),
                fechaUTC.getUTCDate()
            );
            const fechaStrTarea = fechaLocal.getFullYear() + "-" +
                String(fechaLocal.getMonth() + 1).padStart(2, '0') + "-" +
                String(fechaLocal.getDate()).padStart(2, '0');

            return fechaStrTarea === fechaStr;
        });

        htmlAcumulado += `
            <div class="day ${tieneTarea ? 'day-task' : ''}" 
                 onclick="seleccionarDia('${fechaStr}', this)">
                ${dia}
            </div>
        `;
    }
    
    grid.innerHTML = htmlAcumulado;
}

function seleccionarDia(fecha, elemento) {

    const yaSeleccionado = elemento.classList.contains("day-selected");

    document.querySelectorAll(".day")
        .forEach(d => d.classList.remove("day-selected"));

    if (yaSeleccionado) {
        fechaSeleccionada = null;
    } else {
        elemento.classList.add("day-selected");
        fechaSeleccionada = fecha;
    }

    aplicarFiltros();
}

function actualizarInfoFiltros() {

    const info = document.getElementById("filters-info");

    let html = "";

    let carpetaNombre = "Todas";
    
    if (carpetaActual !== "Todas") {
        const carpeta = document.querySelector(
            `.folder-item.active .folder-name`
        );

        if (carpeta) {
            carpetaNombre = carpeta.textContent;
        }
    }

    html += `<span class="filter-badge">📁 ${carpetaNombre}</span>`;

    if (fechaSeleccionada) {

        const [year, month, day] = fechaSeleccionada.split("-");

        const fecha = new Date(year, month - 1, day);

        const fechaFormateada = fecha.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        html += `<span class="filter-badge">📅 ${fechaFormateada}</span>`;

    } else {
        html += `<span class="filter-badge">📅 Todas las fechas</span>`;
    }

    let estadoTexto = "Todos los estados";

    if (estadoSeleccionado === "pendiente") {
        estadoTexto = "Pendiente";
    } else if (estadoSeleccionado === "en progreso") {
        estadoTexto = "En progreso";
    } else if (estadoSeleccionado === "completada") {
        estadoTexto = "Completada";
    }

    html += `<span class="filter-badge">📌 ${estadoTexto}</span>`;

    // 🔥 BOTÓN LIMPIAR (solo si hay filtros activos)
    if (carpetaNombre !== "Todas" || fechaSeleccionada || estadoSeleccionado !== "todos") {
        html += `
        <button class="btn-clear-filters" onclick="limpiarFiltros()">
            <span>✕</span> Limpiar
        </button>
        `;
    }

    info.innerHTML = html;
}

function limpiarFiltros() {

    // reset carpeta
    carpetaActual = "Todas";

    document.querySelectorAll(".folder-item")
        .forEach(f => f.classList.remove("active"));

    const todas = document.querySelector(".folder-item");
    if (todas) todas.classList.add("active");

    // reset fecha
    fechaSeleccionada = null;

    document.querySelectorAll(".day")
        .forEach(d => d.classList.remove("day-selected"));

    estadoSeleccionado = "todos";
    aplicarFiltros();
}

document.getElementById("prev-month").onclick = () => {
    fechaActual.setMonth(fechaActual.getMonth() - 1);
    renderCalendar();
};

document.getElementById("next-month").onclick = () => {
    fechaActual.setMonth(fechaActual.getMonth() + 1);
    renderCalendar();
};

function mostrarTareas(tareas) {

    const container = document.getElementById("tasks-container");

    container.innerHTML = "";

    container.classList.remove("empty")

    if (tareas.length === 0) {
        container.classList.add("empty");

        container.innerHTML = `
            <div class="no-tasks">
                <div class="no-tasks-icon">📋</div>
                <h3>No hay tareas para este día</h3>
            </div>
        `;
    } else {
        tareas.forEach(tarea => {
            const card = document.createElement("div");
            card.classList.add("task-card");

            const infoColor = obtenerInfoColor(tarea.color);

            const colorClase = infoColor ? infoColor.clase : "";
            const colorNombre = infoColor ? infoColor.nombre : "";

            if (colorClase) {
                card.classList.add(colorClase);
            }

            card.innerHTML = `
                <div class="task-left">
                    <div class="task-top">
                        ${colorNombre ? `<span class="task-badge ${colorClase}">${colorNombre}</span>` : ""}
                        <span class="task-status status-${tarea.estado?.replace(" ", "-") || ""}">
                            ${tarea.estado || ""}
                        </span>
                    </div>
                    <h3 class="task-title" title="${tarea.titulo}">${tarea.titulo}</h3>
                    <p class="task-desc" title="${tarea.descripcion || 'Sin descripción'}">
                        ${tarea.descripcion?.trim() ? tarea.descripcion : '<em>Sin descripción</em>'}
                    </p>
                </div>
                <div class="task-right">
                    <div class="task-info">
                        <div class="task-id-label">TAREA</div>
                        <div class="task-id">#${tarea.id}</div>
                        <div class="task-date">${formatearFecha(tarea.fecha)}</div>
                    </div>
                    <div class="task-actions">
                        ${obtenerBotonEstado(tarea)}
                        <button onclick="editarTarea(${tarea.id})">✏</button>
                        <button onclick="eliminarTarea(${tarea.id}, '${tarea.titulo}')">🗑</button>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    }
}

async function cargarTareas(){

    const response = await fetch("/tareas")
    const tareas = await response.json()


    tareasGlobal = tareas;
    renderCalendar();
    aplicarFiltros();
    console.log(tareasGlobal);

    const contador = document.getElementById("task-count")

    if(tareas.length === 1){
        contador.textContent = "1 tarea"
    }else{
        contador.textContent = tareas.length + " tareas"
    }

    const container = document.getElementById("tasks-container")

    container.innerHTML = ""
    container.classList.remove("empty")
    if(tareas.length === 0){

        container.classList.remove("empty")

        container.innerHTML = `
            <div class="no-tasks">
                <div class="no-tasks-icon">📋</div>
                <h3>No hay tareas</h3>
                <p>Crea una nueva tarea para comenzar</p>
            </div>
        `
        await cargarCarpetas();
        return
    }

    tareas.forEach(tarea => {

        const card = document.createElement("div")
        card.classList.add("task-card")

        const infoColor = obtenerInfoColor(tarea.color)

        const colorClase = infoColor ? infoColor.clase : "";
        const colorNombre = infoColor ? infoColor.nombre : "";

        if (colorClase) {
            card.classList.add(colorClase);
        }

        card.innerHTML = `

        <div class="task-left">

            <div class="task-top">

                ${colorNombre ? `<span class="task-badge ${colorClase}">${colorNombre}</span>` : ""}

                <span class="task-status status-${(tarea.estado || "pendiente").replace(/\s+/g, "-").toLowerCase()}">
                    ${tarea.estado || "Pendiente"}
                </span>

            </div>

            <h3 class="task-title" title="${tarea.titulo}">${tarea.titulo}</h3>

            <p class="task-desc" title="${tarea.descripcion || 'Sin descripción'}">
            ${tarea.descripcion?.trim() ? tarea.descripcion : '<em>Sin descripción</em>'}
            </p>
        </div>

        <div class="task-right">

            <div class="task-info">
                <div class="task-id-label">TAREA</div>
                <div class="task-id">#${tarea.id}</div>
                <div class="task-date">${formatearFecha(tarea.fecha)}</div>
            </div>

            <div class="task-actions">
                ${obtenerBotonEstado(tarea)}
                <button onclick="editarTarea(${tarea.id})">✏</button>
                <button onclick="eliminarTarea(${tarea.id}, '${tarea.titulo}')">🗑</button>
            </div>

        </div>
        `

        container.appendChild(card)

    })
    tareasGlobal = tareas;

    await cargarCarpetas();

}

async function cambiarEstado(id, nuevoEstado) {
    try {
        const tarea = tareasGlobal.find(t => t.id === id);

        const fechaISO = new Date(tarea.fecha).toISOString().split('T')[0];

        const response = await fetch("/tareas/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                titulo: tarea.titulo,
                descripcion: tarea.descripcion,
                estado: nuevoEstado,
                color: tarea.color,
                fecha: fechaISO,
                carpeta_id: tarea.carpeta_id
            })
        });

        if (!response.ok) {
            const error = await response.json();
            mostrarToast(error.error || "Error al cambiar estado", "error");
            return;
        }

        mostrarToast("Estado actualizado", "success");
        const carpetaAntes = carpetaActual;

        await cargarTareas();
        await cargarCarpetas();

        // restaurar carpeta
        carpetaActual = carpetaAntes;

        document.querySelectorAll(".folder-item")
            .forEach(f => f.classList.remove("active"));

        const carpetaElemento = document.querySelector(
            `.folder-item[data-id="${carpetaAntes}"]`
        );

        if (carpetaElemento) {
            carpetaElemento.classList.add("active");
        }

        aplicarFiltros();
        actualizarInfoFiltros();

    } catch (err) {
        console.error(err);
        mostrarToast("Error de conexión", "error");
    }
}

/* ELIMINAR */
function eliminarTarea(id, titulo){

    tareaAEliminar = id

    document.getElementById("deleteTitle").textContent =
        `Eliminar tarea "${titulo}"`

    modalEliminar.classList.add("active")

}

btnConfirmarEliminar.addEventListener("click", async () => {

    if(!tareaAEliminar) return

    await fetch("/tareas/" + tareaAEliminar,{
        method:"DELETE"
    })

    tareaAEliminar = null

    cerrarEliminarModal()

    await cargarTareas()
    await cargarCarpetas();
    await cargarAnalisis();
})

btnCerrarEliminar.addEventListener("click", cerrarEliminarModal)
btnCancelarEliminar.addEventListener("click", cerrarEliminarModal)

function cerrarEliminarModal(){

    modalEliminar.classList.remove("active")

    tareaAEliminar = null

}

modalEliminar.addEventListener("click", (e) => {

    if(e.target === modalEliminar){
        cerrarEliminarModal()
    }

})

function limpiarErrores() {
    document.getElementById("error-titulo").textContent = ""
    document.getElementById("error-descripcion").textContent = ""

    document.getElementById("titulo").classList.remove("input-error")
    document.getElementById("descripcion").classList.remove("input-error")
}

function actualizarBoton() {

    const btn = document.getElementById("btnGuardar")

    const titulo = document.getElementById("titulo").value.trim()
    const descripcion = document.getElementById("descripcion").value.trim()

    let valido = true

    if (
        titulo === "" ||
        titulo.length < 3 ||
        titulo.length > 100 ||
        !/[a-zA-Z0-9]/.test(titulo) ||
        titulo.replace(/\s/g, "") === ""
    ) {
        valido = false
    }

    if (descripcion.length > 500) {
        valido = false
    }

    btn.disabled = !valido
}

/* EDITAR  */
async function editarTarea(id){

    const response = await fetch("/tareas")
    const tareas = await response.json()

    const tarea = tareas.find(t => t.id === id)

    tareaEditando = id
    // 🔥 SOLO cambiar carpeta si NO estás en "Todas"
    if (carpetaActual !== "Todas") {
        carpetaActual = tarea.carpeta_id || "Todas";
    }
    await cargarCarpetas()

    document.getElementById("modalTitle").textContent = "Editar Tarea"
    document.getElementById("btnGuardar").textContent = "Guardar cambios"
    document.getElementById("modalDesc").textContent = "Edita los campos para actualizar la tarea."

    document.getElementById("titulo").value = tarea.titulo
    document.getElementById("descripcion").value = tarea.descripcion
    const selectEstado = document.getElementById("estado")

    Array.from(selectEstado.options).forEach(opt => opt.disabled = false)

    if (tarea.estado === "en progreso") {
        selectEstado.querySelector("option[value='pendiente']").disabled = true
    }

    if (tarea.estado === "completada") {
        selectEstado.querySelector("option[value='pendiente']").disabled = true
        selectEstado.querySelector("option[value='en progreso']").disabled = true
        selectEstado.disabled = true
    }

    selectEstado.value = tarea.estado
    document.getElementById("color").value = tarea.color || ""
    const botonesColor = document.querySelectorAll(".color-btn")

    botonesColor.forEach(b => b.classList.remove("active"))

    if (tarea.color) {
        const btn = document.querySelector(`[data-color="${tarea.color}"]`)
        if (btn) btn.classList.add("active")
    }
    //document.getElementById("fecha").value = tarea.fecha

    document.getElementById("task-folder").value = tarea.carpeta_id || ""

    const fechaUTC = new Date(tarea.fecha);

    const fechaLocal = new Date(
        fechaUTC.getUTCFullYear(),
        fechaUTC.getUTCMonth(),
        fechaUTC.getUTCDate()
    );

    document.getElementById("fecha").value =
        fechaLocal.toISOString().split("T")[0];

    document.getElementById("titulo")._actualizarContador();
    document.getElementById("descripcion")._actualizarContador();

    limpiarErrores() 
    actualizarBoton() 
    modal.classList.add("active")

}

function setupContador(input, contador, max) {

    function actualizar() {
        const length = input.value.length;

        contador.textContent = `${length} / ${max}`;

        contador.classList.remove("warning", "limit");

        if (length >= max) {
            contador.classList.add("limit");
        } else if (length >= max * 0.8) {
            contador.classList.add("warning");
        }
    }

    input.addEventListener("input", actualizar);

    input._actualizarContador = actualizar;

    actualizar();
}


document.addEventListener("DOMContentLoaded", () => {
    setupContador(
        document.getElementById("titulo"),
        document.getElementById("contadorTitulo"),
        100
    );

    setupContador(
        document.getElementById("descripcion"),
        document.getElementById("contadorDescripcion"),
        500
    );
});



/* MODAL */
const modal = document.getElementById("modalNuevaTarea")
const btnNuevaTarea = document.querySelector(".btn-new-task")
const cerrarModal = document.getElementById("cerrarModal")
const btnCancelar = document.querySelector(".btn-cancelar")

document.getElementById("formNuevaTarea").addEventListener("submit", async function(e){

    e.preventDefault()

    const tituloInput = document.getElementById("titulo")
    const descripcionInput = document.getElementById("descripcion")

    const errorTitulo = document.getElementById("error-titulo")
    const errorDescripcion = document.getElementById("error-descripcion")

    let carpetaValue = document.getElementById("task-folder").value;

    errorTitulo.textContent = ""
    errorDescripcion.textContent = ""

    tituloInput.classList.remove("input-error")
    descripcionInput.classList.remove("input-error")

    let valido = true

    let titulo = tituloInput.value.trim()
    let descripcion = descripcionInput.value.trim()
    let estado = document.getElementById("estado").value
    let color = document.getElementById("color").value || "gris"
    let carpeta_id = (carpetaValue === "Todas" || carpetaValue === "") ? null : carpetaValue;
    let fecha = document.getElementById("fecha").value


    // VALIDACIÓN TÍTULO
    if (titulo === "") {
        errorTitulo.textContent = "El título es obligatorio"
        tituloInput.classList.add("input-error")
        valido = false
    } else if (titulo.replace(/\s/g, "") === "") {
        errorTitulo.textContent = "No puede contener solo espacios"
        tituloInput.classList.add("input-error")
        valido = false
    } else if (titulo.length < 3) {
        errorTitulo.textContent = "Mínimo 3 caracteres"
        tituloInput.classList.add("input-error")
        valido = false
    } else if (titulo.length > 100) {
        errorTitulo.textContent = "Máximo 100 caracteres"
        tituloInput.classList.add("input-error")
        valido = false
    } else if (!/[a-zA-Z0-9]/.test(titulo)) {
        errorTitulo.textContent = "Debe contener al menos letras o números"
        tituloInput.classList.add("input-error")
        valido = false
    }

    // VALIDACIÓN DESCRIPCIÓN
    if (descripcion.length > 500) {
        errorDescripcion.textContent = "Máximo 500 caracteres"
        descripcionInput.classList.add("input-error")
        valido = false
    }

    if (!fecha) {
    mostrarToast("Debes seleccionar una fecha", "error")
    return
    }

    if (!valido) return

    const data = {
        titulo,
        descripcion,
        estado,
        fecha,
        color,
        carpeta_id
    }

    try {

        let response

        if(tareaEditando){

            response = await fetch("/tareas/" + tareaEditando,{
                method:"PUT",
                headers:{ "Content-Type":"application/json" },
                body: JSON.stringify(data)
            })

        }else{

            response = await fetch("/tareas",{
                method:"POST",
                headers:{ "Content-Type":"application/json" },
                body: JSON.stringify(data)
            })

        }

        if (!response.ok) {
            const error = await response.json()
            mostrarToast(error.error || error.message || "Error al procesar la solicitud", "error")
            return
        }

    const carpetaAntes = carpetaActual;

    tareaEditando = null
    this.reset()
    cerrar()

    document.getElementById("titulo")._actualizarContador();
    document.getElementById("descripcion")._actualizarContador();

    await cargarTareas(); 
    await cargarCarpetas(); 

    carpetaActual = carpetaAntes;

    document.querySelectorAll(".folder-item")
        .forEach(f => f.classList.remove("active"));

    const carpetaElemento = Array.from(document.querySelectorAll(".folder-item"))
        .find(f => f.textContent.trim() === carpetaAntes);

    if (carpetaElemento) {
        carpetaElemento.classList.add("active");
    }

    aplicarFiltros();

    mostrarToast("Tarea guardada correctamente", "success")

    } catch (err) {
        mostrarToast("Error de conexión con el servidor", "error")
    }

})

const botonesColor = document.querySelectorAll(".color-btn")
const inputColor = document.getElementById("color")
const colorLabel = document.getElementById("color-label")

botonesColor.forEach(btn => {
    btn.addEventListener("click", () => {
        botonesColor.forEach(b => b.classList.remove("active"))

        btn.classList.add("active")

        const color = btn.dataset.color
        const nombre = btn.dataset.nombre

        inputColor.value = color

        colorLabel.textContent = nombre
    })
})

/* ABRIR */
btnNuevaTarea.addEventListener("click", () => {

    tareaEditando = null

    document.getElementById("modalTitle").textContent = "Nueva tarea"
    document.getElementById("btnGuardar").textContent = "Crear tarea"

    document.getElementById("formNuevaTarea").reset()

    const selectCarpeta = document.getElementById("task-folder");

    if (carpetaActual && carpetaActual !== "Todas") {
        selectCarpeta.value = carpetaActual;
    } else {
        selectCarpeta.value = "";
    }

    const botonesColor = document.querySelectorAll(".color-btn")
    botonesColor.forEach(b => b.classList.remove("active"))

    setTimeout(() => {
        document.getElementById("titulo")._actualizarContador();
        document.getElementById("descripcion")._actualizarContador();
    }, 0);

    document.getElementById("color").value = ""
    const selectEstado = document.getElementById("estado")

    Array.from(selectEstado.options).forEach(opt => opt.disabled = false)

    selectEstado.disabled = false
    selectEstado.value = "pendiente"


    limpiarErrores()
    actualizarBoton()

    modal.classList.add("active")

})


/* CERRAR */
cerrarModal.addEventListener("click", cerrar)
btnCancelar.addEventListener("click", cerrar)

function cerrar(){

    modal.classList.remove("active")

    tareaEditando = null

    document.getElementById("formNuevaTarea").reset()

}


/* CERRAR 2 */
modal.addEventListener("click", (e) => {

    if(e.target === modal){
        cerrar()
    }

})

function mostrarToast(mensaje, tipo = "success") {
    const container = document.getElementById("toast-container")

    const toast = document.createElement("div")
    toast.classList.add("toast", tipo)

    let icono = ""

    if (tipo === "success") {
        icono = "✔️"
    } else if (tipo === "error") {
        icono = "❌"
    }

    toast.innerHTML = `
        <span>${icono}</span>
        <span>${mensaje}</span>
    `

    container.prepend(toast)

    setTimeout(() => {
        toast.classList.add("show")
    }, 100)

    setTimeout(() => {
        toast.classList.remove("show")

        setTimeout(() => {
            toast.remove()
        }, 300)
    }, 3000)
}


function exportarExcelCompleto() {
    if (!tareasGlobal || tareasGlobal.length === 0) {
        alert("No hay tareas para exportar.");
        return;
    }

    const libro = XLSX.utils.book_new();

    // 1. PASO UNO: BUSCAR Y DEFINIR LA LISTA DE CARPETAS DE LA BD
    const listaCarpetasBD = {
        1: "trabajo",
        2: "urgente",
        3: "hogar",
        4: "estudio",
        5: "personal",
        6: "otros",
        7: "jesfu27"
    };

    // Mapa de etiquetas para los colores
    const mapaEtiquetas = {
        "azul": "Hogar", "rojo": "Urgente", "verde": "Trabajo",
        "amarillo": "Estudio", "morado": "Personal", "gris": "Otros"
    };

    // 2. PASO DOS: RELACIONAR CADA TAREA CON SU CARPETA
    const datosProcesados = tareasGlobal.map(t => {
        const idCarpetaTarea = t.id_carpeta || t.id_categoria || t.carpeta_id;
        
        let nombreRelacionado = listaCarpetasBD[idCarpetaTarea] || "General";

        nombreRelacionado = nombreRelacionado.charAt(0).toUpperCase() + nombreRelacionado.slice(1);

        return {
            "ID": t.id,
            "Título": t.titulo || "",
            "Descripción": t.descripcion || "",
            "Estado": t.estado || "Pendiente",
            "Fecha": t.fecha ? new Date(t.fecha).toLocaleDateString() : "",
            "Etiqueta": t.etiqueta || mapaEtiquetas[t.color?.toLowerCase()] || "Sin etiqueta",
            "Carpeta": nombreRelacionado
        };
    });

    const colWidths = [{wch: 5}, {wch: 25}, {wch: 35}, {wch: 15}, {wch: 12}, {wch: 15}, {wch: 15}];

    // --- HOJA 1: LISTADO GENERAL ---
    const hojaTodas = XLSX.utils.json_to_sheet(datosProcesados);
    hojaTodas['!cols'] = colWidths;
    XLSX.utils.book_append_sheet(libro, hojaTodas, "Listado General");

    // --- HOJA 2: TAREAS POR ESTADO ---
    const hojaEstados = XLSX.utils.json_to_sheet([]);
    let filaActual = 0;
    ["pendiente", "en progreso", "completada"].forEach(estado => {
        const filtradas = datosProcesados.filter(t => t.Estado.toLowerCase() === estado);
        if (filtradas.length > 0) {
            XLSX.utils.sheet_add_aoa(hojaEstados, [[`>>> TAREAS EN ${estado.toUpperCase()} <<<`]], { origin: `A${filaActual + 1}` });
            XLSX.utils.sheet_add_json(hojaEstados, filtradas, { origin: `A${filaActual + 2}` });
            filaActual += filtradas.length + 4;
        }
    });
    hojaEstados['!cols'] = colWidths;
    XLSX.utils.book_append_sheet(libro, hojaEstados, "Tareas por Estado");

    // --- HOJA 3: ESTADÍSTICAS Y CONTEO ---
    const conteo = {};
    Object.values(listaCarpetasBD).forEach(nom => {
        conteo[nom.charAt(0).toUpperCase() + nom.slice(1)] = 0;
    });
    conteo["General"] = 0;

    datosProcesados.forEach(f => {
        if (conteo.hasOwnProperty(f.Carpeta)) {
            conteo[f.Carpeta]++;
        } else {
            conteo["General"]++;
        }
    });

    // Inicio de la estructura de la hoja de estadísticas
    const datosStats = [
        ["REPORTE ESTADÍSTICO TASKFLOW"],
        [],
        ["RESUMEN DE ESTADOS", "CANTIDAD"],
        ["Completadas", datosProcesados.filter(t => t.Estado.toLowerCase() === "completada").length],
        ["En Progreso", datosProcesados.filter(t => t.Estado.toLowerCase() === "en progreso").length],
        ["Pendientes", datosProcesados.filter(t => t.Estado.toLowerCase() === "pendiente").length],
        ["TOTAL TAREAS", datosProcesados.length],
        [],
        ["DISTRIBUCIÓN POR CARPETAS", "TAREAS"]
    ];

    // Agregamos la lista de carpetas y sus conteos
    Object.entries(conteo).forEach(([nom, total]) => {
        datosStats.push([nom, total]);
    });

    // AGREGADO: Contador de carpetas al final (detrás de la distribución)
    const totalCarpetas = Object.keys(listaCarpetasBD).length;
    datosStats.push([]); // Espacio en blanco
    datosStats.push(["TOTAL DE CARPETAS CONFIGURADAS", totalCarpetas]);

    const hojaStats = XLSX.utils.aoa_to_sheet(datosStats);
    hojaStats['!cols'] = [{wch: 35}, {wch: 15}];
    XLSX.utils.book_append_sheet(libro, hojaStats, "Estadísticas");

    // Generar archivo
    XLSX.writeFile(libro, "Reporte_TaskFlow_Sincronizado.xlsx");
}






let chartEstados = null;

async function cargarAnalisis() {
    const response = await fetch("/tareas");
    const tareas = await response.json();

    const canvas = document.getElementById("graficoEstados");
    const mensaje = document.getElementById("sinDatosEstados");

    if (tareas.length === 0) {
        canvas.style.visibility = "hidden";
        mensaje.style.display = "flex";
        mensaje.innerHTML = `
            <div class="icono">📊</div>
            <p>No hay datos para mostrar</p>
        `;
        cargarGraficoCarpetas([]);
        cargarGraficoFechas(tareas);
        cargarGraficoProductividad(tareas);

        return;
    } else {
        canvas.style.visibility = "visible";
        mensaje.style.display = "none";
    }

    let pendientes = 0;
    let progreso = 0;
    let completadas = 0;

    tareas.forEach(t => {
        if (t.estado === "pendiente") pendientes++;
        else if (t.estado === "en progreso") progreso++;
        else if (t.estado === "completada") completadas++;
    });

    // KPIs
    document.getElementById("total").textContent = tareas.length;
    document.getElementById("pendientes").textContent = pendientes;
    document.getElementById("progreso").textContent = progreso;
    document.getElementById("completadas").textContent = completadas;

    const labels = [];
    const data = [];
    const colors = [];

    if (pendientes > 0) {
        labels.push("Pendientes");
        data.push(pendientes);
        colors.push("#dab934");
    }

    if (progreso > 0) {
        labels.push("En progreso");
        data.push(progreso);
        colors.push("#3471d3");
    }

    if (completadas > 0) {
        labels.push("Completadas");
        data.push(completadas);
        colors.push("#27d165");
    }

    if (chartEstados) {
        chartEstados.destroy();
    }

    const ctx = canvas;

    chartEstados = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: "bottom"
                },
                datalabels: {
                    font: {
                        weight: "bold",
                        size: 12
                    },
                    formatter: (value) => value,
                    color: "#fff"
                }
            }
        },
        plugins: [ChartDataLabels]
    });
    setTimeout(() => {
    chartEstados.resize();
    }, 100);
    cargarGraficoCarpetas(tareas);
    cargarGraficoFechas(tareas);
    cargarGraficoProductividad(tareas);
}






let chartCarpetas = null;

function cargarGraficoCarpetas(tareas) {
    console.log("🔥 ENTRE A GRAFICO CARPETAS");

    const canvas = document.getElementById("graficoCarpetas");
    const mensaje = document.getElementById("sinDatosCarpetas");

    const conteo = {};

    
    tareas.forEach(t => {
        const nombre = t.carpeta_nombre || "Sin carpeta";

        if (!conteo[nombre]) {
            conteo[nombre] = 0;
        }

        conteo[nombre]++;
    });

    
    const labels = Object.keys(conteo);
    const data = Object.values(conteo);

    if (tareas.length === 0) {
        if (chartCarpetas) {
            chartCarpetas.destroy();
            chartCarpetas = null;
        }

        canvas.style.display = "none";
        mensaje.style.display = "flex";
        return;
    } else {
        canvas.style.display = "block";
        mensaje.style.display = "none";
    }

    if (chartCarpetas) {
        chartCarpetas.destroy();
    }

    chartCarpetas = new Chart(canvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Tareas",
                data: data
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
    console.log("TAREAS EN GRAFICO:", tareas.length);
}





let chartFechas = null;

function cargarGraficoFechas(tareas) {

    const canvas = document.getElementById("graficoFechas");
    const mensaje = document.getElementById("sinDatosFechas");

    const hoy = new Date();
    const fechas = [];

    for (let i = 0; i < 14; i++) {
        const fecha = new Date(
            hoy.getFullYear(),
            hoy.getMonth(),
            hoy.getDate() + i
        );

        const formateada =
            fecha.getFullYear() + "-" +
            String(fecha.getMonth() + 1).padStart(2, "0") + "-" +
            String(fecha.getDate()).padStart(2, "0");

        fechas.push(formateada);
    }

    const conteo = {};
    fechas.forEach(f => conteo[f] = 0);

    tareas.forEach(t => {
        if (!t.fecha) return;

        // 🔥 ignorar completadas
        if (t.estado === "completada") return;

        // 🔥 convertir UTC → LOCAL
        const fechaUTC = new Date(t.fecha);

        const fechaObj = new Date(
            fechaUTC.getUTCFullYear(),
            fechaUTC.getUTCMonth(),
            fechaUTC.getUTCDate()
        );

        const fecha =
            fechaObj.getFullYear() + "-" +
            String(fechaObj.getMonth() + 1).padStart(2, "0") + "-" +
            String(fechaObj.getDate()).padStart(2, "0");

        if (conteo.hasOwnProperty(fecha)) {
            conteo[fecha]++;
        }
    });

    const labels = fechas.map(f => {
        const [y, m, d] = f.split("-");
        const fechaLocal = new Date(y, m - 1, d);

        return fechaLocal.toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit"
        });
    });

    const data = Object.values(conteo);
    const hayDatos = data.some(v => v > 0);

    if (!hayDatos) {
        if (chartFechas) {
            chartFechas.destroy();
            chartFechas = null;
        }

        canvas.style.display = "none";
        mensaje.style.display = "flex";
        mensaje.innerHTML = `
            <div class="icono">📅</div>
            <p>No hay tareas en los próximos días</p>
        `;
        return;
    } else {
        canvas.style.display = "block";
        mensaje.style.display = "none";
    }

    if (chartFechas) {
        chartFechas.destroy();
    }

    chartFechas = new Chart(canvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Tareas",
                data: data,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}



let chartProductividad = null;

function cargarGraficoProductividad(tareas) {

    const canvas = document.getElementById("graficoProductividad");
    const mensaje = document.getElementById("sinDatosProductividad");

    const completadas = tareas.filter(t => t.estado === "completada");

    if (completadas.length === 0) {
        if (chartProductividad) {
            chartProductividad.destroy();
            chartProductividad = null;
        }

        canvas.style.display = "none";
        mensaje.style.display = "flex";
        return;
    } else {
        canvas.style.display = "block";
        mensaje.style.display = "none";
    }

    const conteo = {};

    completadas.forEach(t => {
        if (!t.fecha) return;

        const fecha = new Date(t.fecha);

        const inicioAño = new Date(fecha.getFullYear(), 0, 1);
        const dias = Math.floor((fecha - inicioAño) / (1000 * 60 * 60 * 24));
        const semana = Math.ceil((dias + inicioAño.getDay() + 1) / 7);

        const clave = `${fecha.getFullYear()} - Sem. ${semana}`;

        if (!conteo[clave]) {
            conteo[clave] = 0;
        }

        conteo[clave]++;
    });

    const ordenado = Object.entries(conteo)
        .sort((a, b) => {
            const [aYear, aSemana] = a[0].split(" - Semana ");
            const [bYear, bSemana] = b[0].split(" - Semana ");

            // ordenar por año primero
            if (aYear !== bYear) {
                return aYear - bYear;
            }

            // luego por número de semana
            return aSemana - bSemana;
        });

    const labels = ordenado.map(item => item[0]);
    const data = ordenado.map(item => item[1]);

    if (chartProductividad) {
        chartProductividad.destroy();
    }

    chartProductividad = new Chart(canvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Completadas",
                data: data,

                borderWidth: 2,
                tension: 0.4,

                fill: false,

                pointRadius: 5, 
                pointHoverRadius: 7,

                borderColor: "#111",
                pointBackgroundColor: "#111"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: "bottom"
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    },
                    grid: {
                        drawBorder: false,
                        borderDash: [5, 5]
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}
document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.querySelector(".sidebar");
    const toggleBtn = document.getElementById("toggleSidebar");

    function isMobile() {
        return window.innerWidth <= 900;
    }

    let state = localStorage.getItem("sidebarState");

    // 🔥 primera vez → cerrado por defecto
    if (state === null) {
        state = "collapsed";
        localStorage.setItem("sidebarState", state);
    }

    function applyState() {

        // 💻 DESKTOP: SIEMPRE ABIERTO
        if (!isMobile()) {
            sidebar.classList.remove("collapsed");
            toggleBtn.textContent = "✕";
            return;
        }

        // 📱 MOBILE: usa estado guardado
        const collapsed = state === "collapsed";

        sidebar.classList.toggle("collapsed", collapsed);
        toggleBtn.textContent = collapsed ? "☰" : "✕";
    }

    applyState();

    toggleBtn.addEventListener("click", () => {

        // solo funciona en mobile
        if (!isMobile()) return;

        const collapsed = sidebar.classList.toggle("collapsed");

        state = collapsed ? "collapsed" : "expanded";
        localStorage.setItem("sidebarState", state);

        toggleBtn.textContent = collapsed ? "☰" : "✕";
    });

    // 🔥 si cambias tamaño de pantalla (muy importante)
    window.addEventListener("resize", () => {
        applyState();
    });
});





const btnTareas = document.getElementById("btnTareas");
const btnAnalisis = document.getElementById("btnAnalisis");

const vistaTareas = document.getElementById("vistaTareas");
const vistaAnalisis = document.getElementById("vistaAnalisis");

btnTareas.addEventListener("click", () => {
    btnTareas.classList.add("active");
    btnAnalisis.classList.remove("active");

    
    vistaTareas.style.display = "flex";
    vistaAnalisis.style.display = "none";
});

btnAnalisis.addEventListener("click", () => {
    btnAnalisis.classList.add("active");
    btnTareas.classList.remove("active");

    vistaTareas.style.display = "none";
    vistaAnalisis.style.display = "block";

    cargarAnalisis();
});


