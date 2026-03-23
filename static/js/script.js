let tareaEditando = null
let tareaAEliminar = null
let estadoActualTarea = null

const modalEliminar = document.getElementById("modalEliminar")

const btnCerrarEliminar = document.getElementById("cerrarEliminar")
const btnCancelarEliminar = document.getElementById("cancelarEliminar")
const btnConfirmarEliminar = document.getElementById("confirmarEliminar")

// ==================== FUNCIONES DE VALIDACIÓN ====================

function mostrarError(campoId, mensaje) {
    const campo = document.getElementById(campoId)
    if (!campo) return

    // Eliminar error existente si lo hay
    const errorExistente = campo.parentElement.querySelector(".error-message")
    if (errorExistente) {
        errorExistente.remove()
    }

    // Quitar estilo de error previo
    campo.classList.remove("input-error")

    // Crear mensaje de error
    const errorDiv = document.createElement("div")
    errorDiv.className = "error-message"
    errorDiv.style.color = "#ff3b3b"
    errorDiv.style.fontSize = "12px"
    errorDiv.style.marginTop = "5px"
    errorDiv.textContent = mensaje

    // Agregar estilo de error al campo
    campo.classList.add("input-error")
    campo.style.borderColor = "#ff3b3b"

    // Insertar mensaje después del campo
    campo.parentElement.appendChild(errorDiv)

    // Hacer scroll al campo con error
    campo.scrollIntoView({ behavior: "smooth", block: "center" })
}

function limpiarErrores() {
    const errores = document.querySelectorAll(".error-message")
    errores.forEach(error => error.remove())

    const camposError = document.querySelectorAll(".input-error")
    camposError.forEach(campo => {
        campo.classList.remove("input-error")
        campo.style.borderColor = ""
    })
}

function validarCampos(titulo, descripcion) {
    // Validación del título
    if (!titulo || titulo === "") {
        mostrarError("titulo", "❌ El título no puede estar vacío")
        return false
    }

    if (titulo.length < 3) {
        mostrarError("titulo", "❌ El título debe tener al menos 3 caracteres")
        return false
    }

    if (titulo.length > 100) {
        mostrarError("titulo", "❌ El título no puede tener más de 100 caracteres")
        return false
    }

    // Validación de la descripción (máximo 500 caracteres)
    if (descripcion && descripcion.length > 500) {
        mostrarError("descripcion", "❌ La descripción no puede tener más de 500 caracteres")
        return false
    }

    return true
}

// ==================== VALIDACIÓN DE TRANSICIONES DE ESTADO ====================

// Reglas de transiciones permitidas
// Estado actual -> Estados permitidos
const transicionesPermitidas = {
    "pendiente": ["en progreso", "completada"],
    "en progreso": ["completada"],
    "completada": [] // No se puede cambiar desde completada
}

function validarTransicionEstado(estadoActual, nuevoEstado) {
    // Si no hay estado actual (nueva tarea), permitir cualquier estado
    if (!estadoActual) return true
    
    // Si el estado actual es el mismo, no hay problema
    if (estadoActual === nuevoEstado) return true
    
    // Verificar si la transición está permitida
    const estadosPermitidos = transicionesPermitidas[estadoActual]
    
    if (!estadosPermitidos) {
        return false
    }
    
    return estadosPermitidos.includes(nuevoEstado)
}

function mostrarErrorEstado(mensaje) {
    // Mostrar error en el campo de estado
    const campoEstado = document.getElementById("estado")
    if (!campoEstado) return
    
    // Eliminar error existente
    const errorExistente = campoEstado.parentElement.querySelector(".error-message")
    if (errorExistente) {
        errorExistente.remove()
    }
    
    // Crear mensaje de error
    const errorDiv = document.createElement("div")
    errorDiv.className = "error-message"
    errorDiv.style.color = "#ff3b3b"
    errorDiv.style.fontSize = "12px"
    errorDiv.style.marginTop = "5px"
    errorDiv.textContent = mensaje
    
    // Agregar estilo de error al campo
    campoEstado.classList.add("input-error")
    campoEstado.style.borderColor = "#ff3b3b"
    
    // Insertar mensaje después del campo
    campoEstado.parentElement.appendChild(errorDiv)
    
    // Hacer scroll al campo con error
    campoEstado.scrollIntoView({ behavior: "smooth", block: "center" })
}

// ==================== FIN VALIDACIONES ====================

function formatearFecha(fecha) {
    const f = new Date(fecha)
    const dia = String(f.getUTCDate()).padStart(2, "0")
    const mes = String(f.getUTCMonth() + 1).padStart(2, "0")
    const año = f.getUTCFullYear()
    return `${dia}/${mes}/${año}`
}

// Función para obtener solo la fecha en formato YYYY-MM-DD
function obtenerFechaActual() {
    const f = new Date()
    const año = f.getFullYear()
    const mes = String(f.getMonth() + 1).padStart(2, "0")
    const dia = String(f.getDate()).padStart(2, "0")
    return `${año}-${mes}-${dia}`
}

// Función para truncar texto largo
function truncarTexto(texto, maxLength = 120) {
    if (!texto) return ""
    if (texto.length <= maxLength) return texto
    return texto.substring(0, maxLength) + "..."
}

// ==================== FUNCIÓN PARA VER DESCRIPCIÓN COMPLETA ====================

function verDescripcionCompleta(titulo, descripcion) {
    // Crear modal si no existe
    let modalDescripcion = document.getElementById("modalDescripcionCompleta")
    
    if (!modalDescripcion) {
        modalDescripcion = document.createElement("div")
        modalDescripcion.id = "modalDescripcionCompleta"
        modalDescripcion.className = "modal-overlay"
        modalDescripcion.innerHTML = `
            <div class="modal modal-descripcion">
                <div class="modal-header">
                    <h2 id="modalDescripcionTitulo">Descripción completa</h2>
                    <button class="modal-close" id="cerrarModalDescripcion">✕</button>
                </div>
                <div class="descripcion-contenido" id="modalDescripcionTexto">
                    <!-- Contenido dinámico -->
                </div>
            </div>
        `
        document.body.appendChild(modalDescripcion)
        
        // Evento para cerrar
        const cerrarBtn = document.getElementById("cerrarModalDescripcion")
        cerrarBtn.addEventListener("click", cerrarModalDescripcion)
        
        modalDescripcion.addEventListener("click", (e) => {
            if (e.target === modalDescripcion) {
                cerrarModalDescripcion()
            }
        })
    }
    
    // Llenar el modal con los datos
    document.getElementById("modalDescripcionTitulo").textContent = `Descripción: ${titulo}`
    const textoDescripcion = document.getElementById("modalDescripcionTexto")
    textoDescripcion.innerHTML = `<p>${escapeHTML(descripcion)}</p>`
    
    // Mostrar modal
    modalDescripcion.classList.add("active")
}

function cerrarModalDescripcion() {
    const modal = document.getElementById("modalDescripcionCompleta")
    if (modal) {
        modal.classList.remove("active")
    }
}

async function cargarTareas() {
    console.log("Cargando tareas...")
    const response = await fetch("/tareas")
    const tareas = await response.json()
    console.log("Tareas cargadas:", tareas)

    /* CONTADOR */
    const contador = document.getElementById("task-count")
    if (tareas.length === 1) {
        contador.textContent = "1 tarea"
    } else {
        contador.textContent = tareas.length + " tareas"
    }

    /* CONTENEDOR */
    const container = document.getElementById("tasks-container")
    container.innerHTML = ""

    if (tareas.length === 0) {
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

        card.innerHTML = `
            <div class="task-left">
                <div class="task-header">
                    <h3 class="task-title">${escapeHTML(tarea.titulo)}</h3>
                    <span class="task-status status-${tarea.estado.replace(" ", "-")}">${tarea.estado}</span>
                </div>
                <p class="task-desc clickable-desc" data-titulo="${escapeHTML(tarea.titulo)}" data-desc="${escapeHTML(tarea.descripcion)}">
                    ${escapeHTML(truncarTexto(tarea.descripcion, 150))}
                </p>
            </div>
            <div class="task-right">
                <div class="task-info">
                    <div class="task-id-label">TAREA</div>
                    <div class="task-id">#${tarea.id}</div>
                    <div class="task-date">${formatearFecha(tarea.fecha)}</div>
                </div>
                <div class="task-actions">
                    <button onclick="editarTarea(${tarea.id})">✏</button>
                    <button onclick="eliminarTarea(${tarea.id}, '${escapeHTML(tarea.titulo).replace(/'/g, "\\'")}')">🗑</button>
                </div>
            </div>
        `

        container.appendChild(card)
    })

    // Agregar event listeners a todas las descripciones clickeables
    document.querySelectorAll('.clickable-desc').forEach(descElement => {
        descElement.addEventListener('click', function(e) {
            e.stopPropagation()
            const titulo = this.getAttribute('data-titulo')
            const descripcion = this.getAttribute('data-desc')
            verDescripcionCompleta(titulo, descripcion)
        })
    })
}

// Función para evitar XSS
function escapeHTML(str) {
    if (!str) return ""
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

/* ==================== ELIMINAR ==================== */
function eliminarTarea(id, titulo) {
    console.log("Eliminar tarea:", id, titulo)
    tareaAEliminar = id
    document.getElementById("deleteTitle").textContent = `Eliminar tarea "${titulo}"`
    modalEliminar.classList.add("active")
}

btnConfirmarEliminar.addEventListener("click", async () => {
    console.log("Confirmar eliminación, tarea:", tareaAEliminar)
    if (!tareaAEliminar) return

    await fetch("/tareas/" + tareaAEliminar, {
        method: "DELETE"
    })

    tareaAEliminar = null
    cerrarEliminarModal()
    cargarTareas()
})

btnCerrarEliminar.addEventListener("click", cerrarEliminarModal)
btnCancelarEliminar.addEventListener("click", cerrarEliminarModal)

function cerrarEliminarModal() {
    modalEliminar.classList.remove("active")
    tareaAEliminar = null
}

modalEliminar.addEventListener("click", (e) => {
    if (e.target === modalEliminar) {
        cerrarEliminarModal()
    }
})

/* ==================== EDITAR ==================== */
async function editarTarea(id) {
    console.log("Editar tarea:", id)
    try {
        const response = await fetch("/tareas")
        const tareas = await response.json()
        
        const tarea = tareas.find(t => Number(t.id) === Number(id))
        
        if (!tarea) {
            alert("No se encontró la tarea")
            return
        }

        tareaEditando = id
        estadoActualTarea = tarea.estado  // Guardar el estado actual para validar transiciones

        document.getElementById("modalTitle").textContent = "Editar Tarea"
        document.getElementById("btnGuardar").textContent = "Guardar cambios"

        document.getElementById("titulo").value = tarea.titulo || ''
        document.getElementById("descripcion").value = tarea.descripcion || ''
        document.getElementById("estado").value = tarea.estado || 'pendiente'

        // Limpiar errores antes de abrir
        limpiarErrores()
        modal.classList.add("active")

    } catch (error) {
        console.error("Error al editar tarea:", error)
        alert("Error al cargar la tarea. Por favor, intenta de nuevo.")
    }
}

/* ==================== MODAL NUEVA TAREA ==================== */
const modal = document.getElementById("modalNuevaTarea")
const btnNuevaTarea = document.querySelector(".btn-new-task")
const cerrarModal = document.getElementById("cerrarModal")
const btnCancelar = document.querySelector(".btn-cancelar")
const formulario = document.getElementById("formNuevaTarea")

// Verificar que los elementos existen
console.log("Modal:", modal)
console.log("Btn Nueva Tarea:", btnNuevaTarea)
console.log("Cerrar Modal:", cerrarModal)
console.log("Btn Cancelar:", btnCancelar)
console.log("Formulario:", formulario)

if (formulario) {
    console.log("Formulario encontrado, agregando evento submit")
    formulario.addEventListener("submit", async function(e) {
        e.preventDefault()
        console.log("Submit del formulario ejecutado")

        // Limpiar errores anteriores
        limpiarErrores()

        // Obtener valores y aplicar trim() para eliminar espacios al inicio y final
        const titulo = document.getElementById("titulo").value.trim()
        const descripcion = document.getElementById("descripcion").value.trim()
        const nuevoEstado = document.getElementById("estado").value
        
        console.log("Título:", titulo)
        console.log("Descripción:", descripcion)
        console.log("Nuevo estado:", nuevoEstado)
        
        // Validar campos
        if (!validarCampos(titulo, descripcion)) {
            console.log("Validación de campos falló")
            return
        }
        
        // Validar transición de estado (solo si estamos editando una tarea existente)
        if (tareaEditando && estadoActualTarea) {
            console.log("Estado actual:", estadoActualTarea)
            console.log("Nuevo estado:", nuevoEstado)
            
            if (!validarTransicionEstado(estadoActualTarea, nuevoEstado)) {
                let mensajeError = ""
                if (estadoActualTarea === "completada") {
                    mensajeError = "❌ No se puede modificar una tarea completada. Las tareas completadas están bloqueadas."
                } else if (estadoActualTarea === "en progreso" && nuevoEstado === "pendiente") {
                    mensajeError = "❌ No se puede volver de 'En progreso' a 'Pendiente'. Solo se puede pasar a 'Completada'."
                } else {
                    mensajeError = `❌ No se puede cambiar de '${estadoActualTarea}' a '${nuevoEstado}'. Transición no permitida.`
                }
                mostrarErrorEstado(mensajeError)
                return
            }
        }

        // IMPORTANTE: Enviar solo la fecha en formato YYYY-MM-DD
        const data = {
            titulo: titulo,
            descripcion: descripcion,
            estado: nuevoEstado,
            fecha: obtenerFechaActual()
        }

        console.log("Datos a enviar:", data)

        try {
            let response
            if (tareaEditando) {
                console.log("Editando tarea:", tareaEditando)
                response = await fetch("/tareas/" + tareaEditando, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                })
            } else {
                console.log("Creando nueva tarea")
                response = await fetch("/tareas", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                })
            }
            
            console.log("Respuesta:", response)

            tareaEditando = null
            estadoActualTarea = null
            this.reset()
            cerrar()
            cargarTareas()

        } catch (error) {
            console.error("Error al guardar tarea:", error)
            alert("Error al guardar la tarea. Por favor, intenta de nuevo.")
        }
    })
} else {
    console.error("Formulario no encontrado! Verifica que el elemento con id 'formNuevaTarea' exista en el HTML")
}

/* ABRIR MODAL NUEVA TAREA */
if (btnNuevaTarea) {
    btnNuevaTarea.addEventListener("click", () => {
        console.log("Abrir modal nueva tarea")
        tareaEditando = null
        estadoActualTarea = null
        document.getElementById("modalTitle").textContent = "Nueva Tarea"
        document.getElementById("btnGuardar").textContent = "Crear tarea"
        document.getElementById("formNuevaTarea").reset()
        limpiarErrores()  // Limpiar errores al abrir
        modal.classList.add("active")
    })
} else {
    console.error("Botón nueva tarea no encontrado! Verifica la clase 'btn-new-task'")
}

/* CERRAR MODAL */
if (cerrarModal) {
    cerrarModal.addEventListener("click", cerrar)
} else {
    console.error("Botón cerrar modal no encontrado! Verifica el id 'cerrarModal'")
}

if (btnCancelar) {
    btnCancelar.addEventListener("click", cerrar)
} else {
    console.error("Botón cancelar no encontrado! Verifica la clase 'btn-cancelar'")
}

function cerrar() {
    modal.classList.remove("active")
    tareaEditando = null
    estadoActualTarea = null
    document.getElementById("formNuevaTarea").reset()
    limpiarErrores()  // Limpiar errores al cerrar
}

/* CERRAR MODAL HACIENDO CLIC FUERA */
if (modal) {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            cerrar()
        }
    })
}

cargarTareas()