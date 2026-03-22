let tareaEditando = null
let tareaAEliminar = null

const modalEliminar = document.getElementById("modalEliminar")

const btnCerrarEliminar = document.getElementById("cerrarEliminar")
const btnCancelarEliminar = document.getElementById("cancelarEliminar")
const btnConfirmarEliminar = document.getElementById("confirmarEliminar")

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

async function cargarTareas(){

    const response = await fetch("/tareas")
    const tareas = await response.json()

    /* CONTADOR */

    const contador = document.getElementById("task-count")

    if(tareas.length === 1){
        contador.textContent = "1 tarea"
    }else{
        contador.textContent = tareas.length + " tareas"
    }

    /* CONTENEDOR */

    const container = document.getElementById("tasks-container")

    container.innerHTML = ""
    if(tareas.length === 0){

        container.innerHTML = `
            <div class="no-tasks">
                <div class="no-tasks-icon">📋</div>
                <h3>No hay tareas</h3>
                <p>Crea una nueva tarea para comenzar</p>
            </div>
        `

        return
    }

    tareas.forEach(tarea => {

        const card = document.createElement("div")
        card.classList.add("task-card")

        const infoColor = obtenerInfoColor(tarea.color)

        const colorClase = infoColor ? infoColor.clase : ""
        const colorNombre = infoColor ? infoColor.nombre : ""
        card.classList.add(colorClase)

        card.innerHTML = `

        <div class="task-left">

            <div class="task-top">

                ${colorNombre ? `<span class="task-badge ${colorClase}">${colorNombre}</span>` : ""}

                <span class="task-status status-${tarea.estado.replace(" ", "-")}">
                    ${tarea.estado}
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

}

async function cambiarEstado(id, nuevoEstado) {

    try {
        const res = await fetch("/tareas")
        const tareas = await res.json()

        const tarea = tareas.find(t => t.id === id)

        const response = await fetch("/tareas/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                titulo: tarea.titulo,
                descripcion: tarea.descripcion,
                estado: nuevoEstado,
                color: tarea.color
            })
        })

        if (!response.ok) {
            const error = await response.json()
            mostrarToast(error.error || "Error al cambiar estado", "error")
            return
        }

        mostrarToast("Estado actualizado", "success")

        cargarTareas()

    } catch (err) {
        mostrarToast("Error de conexión", "error")
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

    cargarTareas()

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

    limpiarErrores() 
    actualizarBoton() 



    modal.classList.add("active")

}

cargarTareas()


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

    // LIMPIAR ERRORES
    errorTitulo.textContent = ""
    errorDescripcion.textContent = ""

    tituloInput.classList.remove("input-error")
    descripcionInput.classList.remove("input-error")

    let valido = true

    let titulo = tituloInput.value.trim()
    let descripcion = descripcionInput.value.trim()
    let estado = document.getElementById("estado").value
    let color = document.getElementById("color").value


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

    if (!valido) return

    const data = {
        titulo,
        descripcion,
        estado,
        color
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

        tareaEditando = null
        this.reset()
        cerrar()
        cargarTareas()
        mostrarToast("Tarea guardada correctamente", "success")

    } catch (err) {
        mostrarToast("Error de conexión con el servidor", "error")
    }

})

const botonesColor = document.querySelectorAll(".color-btn")
const inputColor = document.getElementById("color")

botonesColor.forEach(btn => {
    btn.addEventListener("click", () => {

        // quitar selección anterior
        botonesColor.forEach(b => b.classList.remove("active"))

        // marcar el actual
        btn.classList.add("active")

        // guardar valor
        inputColor.value = btn.dataset.color
    })
})

/* ABRIR */

btnNuevaTarea.addEventListener("click", () => {

    tareaEditando = null

    document.getElementById("modalTitle").textContent = "Nueva tarea"
    document.getElementById("btnGuardar").textContent = "Crear tarea"

    document.getElementById("formNuevaTarea").reset()

    const botonesColor = document.querySelectorAll(".color-btn")
    botonesColor.forEach(b => b.classList.remove("active"))

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

    // ICONOS
    let icono = ""

    if (tipo === "success") {
        icono = "✔️"
    } else if (tipo === "error") {
        icono = "❌"
    }

    // ESTRUCTURA
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