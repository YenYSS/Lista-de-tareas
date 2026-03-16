let tareaEditando = null
let tareaAEliminar = null

const modalEliminar = document.getElementById("modalEliminar")

const btnCerrarEliminar = document.getElementById("cerrarEliminar")
const btnCancelarEliminar = document.getElementById("cancelarEliminar")
const btnConfirmarEliminar = document.getElementById("confirmarEliminar")

function formatearFecha(fecha){

    const f = new Date(fecha)

    const dia = String(f.getUTCDate()).padStart(2, "0")
    const mes = String(f.getUTCMonth() + 1).padStart(2, "0")
    const año = f.getUTCFullYear()

    return `${dia}/${mes}/${año}`
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

        card.innerHTML = `
        
        <div class="task-left">

            <div class="task-header">
                <h3 class="task-title">${tarea.titulo}</h3>
                <span class="task-status status-${tarea.estado.replace(" ", "-")}">${tarea.estado}</span>
            </div>

            <p class="task-desc">${tarea.descripcion}</p>

        </div>

        <div class="task-right">

            <div class="task-info">
                <div class="task-id-label">TAREA</div>
                <div class="task-id">#${tarea.id}</div>
                <div class="task-date">${formatearFecha(tarea.fecha)}</div>
            </div>

            <div class="task-actions">
                <button onclick="editarTarea(${tarea.id})">✏</button>
                <button onclick="eliminarTarea(${tarea.id}, '${tarea.titulo}')">🗑</button>
            </div>

        </div>

        `

        container.appendChild(card)

    })

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


/* EDITAR  */

async function editarTarea(id){

    const response = await fetch("/tareas")
    const tareas = await response.json()

    const tarea = tareas.find(t => t.id === id)

    tareaEditando = id

    document.getElementById("modalTitle").textContent = "Editar Tarea"
    document.getElementById("btnGuardar").textContent = "Guardar cambios"

    document.getElementById("titulo").value = tarea.titulo
    document.getElementById("descripcion").value = tarea.descripcion
    document.getElementById("estado").value = tarea.estado
    // document.getElementById("fecha").value = tarea.fecha

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

    const data = {

        titulo: document.getElementById("titulo").value,
        descripcion: document.getElementById("descripcion").value,
        estado: document.getElementById("estado").value,

    }

    if(tareaEditando){

        await fetch("/tareas/" + tareaEditando,{

            method:"PUT",

            headers:{
                "Content-Type":"application/json"
            },

            body: JSON.stringify(data)

        })

    }else{

        await fetch("/tareas",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body: JSON.stringify(data)

        })

    }

    tareaEditando = null

    this.reset()

    cerrar()

    cargarTareas()

})


/* ABRIR */

btnNuevaTarea.addEventListener("click", () => {

    tareaEditando = null

    document.getElementById("modalTitle").textContent = "Nueva tarea"
    document.getElementById("btnGuardar").textContent = "Crear tarea"

    document.getElementById("formNuevaTarea").reset()

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

