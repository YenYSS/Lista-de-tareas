let tareaEditando = null
let tareaAEliminar = null

const modalEliminar = document.getElementById("modalEliminar")
const btnCerrarEliminar = document.getElementById("cerrarEliminar")
const btnCancelarEliminar = document.getElementById("cancelarEliminar")
const btnConfirmarEliminar = document.getElementById("confirmarEliminar")

// ==================== CALENDARIO - VARIABLES ====================
let fechaActualCalendario = new Date();
let mesActualCalendario = fechaActualCalendario.getMonth();
let añoActualCalendario = fechaActualCalendario.getFullYear();
let calendarioZoomLevel = 1;

// ==================== FILTRADO POR CARPETAS ====================
let categoriaFiltroActual = "todas";

// ==================== FUNCIÓN: Extraer fecha YYYY-MM-DD de cualquier formato ====================
function extraerFechaYYYYMMDD(fechaEntrada) {
    if (!fechaEntrada) return null;
    
    if (typeof fechaEntrada === 'string' && fechaEntrada.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return fechaEntrada;
    }
    
    if (typeof fechaEntrada === 'string') {
        const partes = fechaEntrada.split(' ');
        if (partes.length >= 5) {
            const dia = partes[1].padStart(2, '0');
            const año = partes[3];
            
            const meses = {
                'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
            };
            const mes = meses[partes[2]];
            
            if (dia && mes && año) {
                return `${año}-${mes}-${dia}`;
            }
        }
    }
    
    let fechaObj = new Date(fechaEntrada);
    if (!isNaN(fechaObj.getTime())) {
        const año = fechaObj.getFullYear();
        const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
        const dia = String(fechaObj.getDate()).padStart(2, '0');
        return `${año}-${mes}-${dia}`;
    }
    
    return null;
}

// ==================== FUNCIÓN: Formatear fecha para mostrar en tarjeta ====================
function formatearFechaParaMostrar(fechaEntrada) {
    if (!fechaEntrada) return 'Sin fecha';
    
    if (typeof fechaEntrada === 'string') {
        const partes = fechaEntrada.split(' ');
        if (partes.length >= 5) {
            const dia = partes[1].padStart(2, '0');
            const año = partes[3];
            
            const meses = {
                'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
            };
            const mes = meses[partes[2]];
            
            if (dia && mes && año) {
                return `${dia}/${mes}/${año}`;
            }
        }
    }
    
    if (typeof fechaEntrada === 'string' && fechaEntrada.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [año, mes, dia] = fechaEntrada.split('-');
        return `${dia}/${mes}/${año}`;
    }
    
    let fechaObj = new Date(fechaEntrada);
    if (!isNaN(fechaObj.getTime())) {
        const dia = String(fechaObj.getDate()).padStart(2, '0');
        const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
        const año = fechaObj.getFullYear();
        return `${dia}/${mes}/${año}`;
    }
    
    return 'Fecha inválida';
}

// ==================== FUNCIÓN: Obtener fecha actual del día ====================
function getFechaHoy() {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
}

// ==================== CALENDARIO - FUNCIONES ====================

async function obtenerTareasPorFecha() {
    try {
        const response = await fetch("/tareas")
        const tareas = await response.json()
        
        const tareasPorFecha = {};
        
        tareas.forEach(tarea => {
            const fechaNormalizada = extraerFechaYYYYMMDD(tarea.fecha);
            
            if (fechaNormalizada) {
                if (!tareasPorFecha[fechaNormalizada]) {
                    tareasPorFecha[fechaNormalizada] = [];
                }
                tareasPorFecha[fechaNormalizada].push(tarea);
            }
        });
        
        return tareasPorFecha;
    } catch (error) {
        console.error("Error obteniendo tareas:", error);
        return {};
    }
}

function aplicarZoomAlCalendario() {
    const calendarSection = document.querySelector('.calendar-section');
    if (!calendarSection) return;
    
    const baseSize = 14 * calendarioZoomLevel;
    calendarSection.style.fontSize = `${baseSize}px`;
    
    const paddingScale = 12 * calendarioZoomLevel;
    calendarSection.style.padding = `${paddingScale}px ${paddingScale * 1.25}px`;
    calendarSection.style.margin = `${15 * calendarioZoomLevel}px ${20 * calendarioZoomLevel}px`;
    
    const calendarGrid = document.querySelector('.calendar-grid');
    if (calendarGrid) {
        calendarGrid.style.gap = `${4 * calendarioZoomLevel}px`;
    }
    
    const calendarWeekdays = document.querySelector('.calendar-weekdays');
    if (calendarWeekdays) {
        calendarWeekdays.style.gap = `${4 * calendarioZoomLevel}px`;
        calendarWeekdays.style.marginBottom = `${6 * calendarioZoomLevel}px`;
    }
    
    const dayNumbers = document.querySelectorAll('.day-number');
    dayNumbers.forEach(day => {
        day.style.fontSize = `${13 * calendarioZoomLevel}px`;
    });
    
    const dayCounts = document.querySelectorAll('.day-count');
    dayCounts.forEach(count => {
        count.style.fontSize = `${9 * calendarioZoomLevel}px`;
        count.style.padding = `${1 * calendarioZoomLevel}px ${5 * calendarioZoomLevel}px`;
    });
    
    const calendarDays = document.querySelectorAll('.calendar-day');
    calendarDays.forEach(day => {
        day.style.padding = `${6 * calendarioZoomLevel}px ${2 * calendarioZoomLevel}px`;
        day.style.minHeight = `${48 * calendarioZoomLevel}px`;
    });
    
    const monthYear = document.getElementById('monthYear');
    if (monthYear) {
        monthYear.style.fontSize = `${16 * calendarioZoomLevel}px`;
    }
    
    const navBtns = document.querySelectorAll('.calendar-nav-btn');
    navBtns.forEach(btn => {
        btn.style.padding = `${5 * calendarioZoomLevel}px ${12 * calendarioZoomLevel}px`;
        btn.style.fontSize = `${12 * calendarioZoomLevel}px`;
    });
    
    const weekdays = document.querySelectorAll('.calendar-weekdays div');
    weekdays.forEach(day => {
        day.style.fontSize = `${11 * calendarioZoomLevel}px`;
        day.style.padding = `${6 * calendarioZoomLevel}px ${2 * calendarioZoomLevel}px`;
    });
}

async function generarCalendario(mes, año) {
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaInicioSemana = primerDia.getDay();
    
    const diasMesAnterior = diaInicioSemana;
    const fechaAnterior = new Date(año, mes, 0);
    const diasEnMesAnterior = fechaAnterior.getDate();
    
    const tareasPorFecha = await obtenerTareasPorFecha();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    let calendarioHTML = '';
    let diaActual = 1;
    
    for (let i = 0; i < 42; i++) {
        let fechaStr = '';
        let numeroDia = '';
        let claseExtra = '';
        let conteo = 0;
        
        if (i < diasMesAnterior) {
            numeroDia = diasEnMesAnterior - diasMesAnterior + i + 1;
            claseExtra = 'other-month';
            const fechaAnteriorCompleta = new Date(año, mes - 1, numeroDia);
            fechaStr = `${fechaAnteriorCompleta.getFullYear()}-${String(fechaAnteriorCompleta.getMonth() + 1).padStart(2, '0')}-${String(numeroDia).padStart(2, '0')}`;
        } 
        else if (diaActual <= diasEnMes) {
            numeroDia = diaActual;
            fechaStr = `${año}-${String(mes + 1).padStart(2, '0')}-${String(diaActual).padStart(2, '0')}`;
            
            const fechaComparar = new Date(año, mes, diaActual);
            if (fechaComparar.toDateString() === hoy.toDateString()) {
                claseExtra = 'today';
            }
            diaActual++;
        } 
        else {
            numeroDia = diaActual - diasEnMes;
            claseExtra = 'other-month';
            fechaStr = `${año}-${String(mes + 2).padStart(2, '0')}-${String(numeroDia).padStart(2, '0')}`;
            diaActual++;
        }
        
        conteo = tareasPorFecha[fechaStr]?.length || 0;
        
        calendarioHTML += `
            <div class="calendar-day ${claseExtra}" data-fecha="${fechaStr}" onclick="mostrarTareasDelDia('${fechaStr}')">
                <div class="day-number">${numeroDia}</div>
                ${conteo > 0 ? `<div class="day-count">${conteo}</div>` : ''}
            </div>
        `;
    }
    
    const calendarGrid = document.getElementById('calendarGrid');
    if (calendarGrid) {
        calendarGrid.innerHTML = calendarioHTML;
    }
    
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthYearElement = document.getElementById('monthYear');
    if (monthYearElement) {
        monthYearElement.textContent = `${nombresMeses[mes]} ${año}`;
    }
    
    aplicarZoomAlCalendario();
}

async function mostrarTareasDelDia(fecha) {
    try {
        const response = await fetch("/tareas");
        const tareas = await response.json();
        
        const tareasDelDia = tareas.filter(t => {
            const fechaTarea = extraerFechaYYYYMMDD(t.fecha);
            return fechaTarea === fecha;
        });
        
        if (tareasDelDia.length === 0) {
            mostrarToast(`📅 No hay tareas para este día`, "info");
            return;
        }
        
        const [año, mes, dia] = fecha.split('-');
        const fechaFormateada = `${dia}/${mes}/${año}`;
        
        const existingModal = document.getElementById('modalTareasDia');
        if (existingModal) existingModal.remove();
        
        const modalHTML = `
            <div id="modalTareasDia" class="modal-overlay active day-tasks-modal">
                <div class="modal">
                    <div class="modal-header">
                        <div>
                            <h2>📅 Tareas del ${fechaFormateada}</h2>
                            <p>${tareasDelDia.length} tarea${tareasDelDia.length !== 1 ? 's' : ''}</p>
                        </div>
                        <button class="modal-close" onclick="cerrarModalTareasDia()">✕</button>
                    </div>
                    <div class="day-tasks-list">
                        ${tareasDelDia.map(tarea => {
                            const infoColor = obtenerInfoColor(tarea.color);
                            const colorNombre = infoColor ? infoColor.nombre : "Otros";
                            return `
                                <div class="day-task-item">
                                    <div class="day-task-title">${tarea.titulo}</div>
                                    <div class="day-task-category">📁 ${colorNombre}</div>
                                    <div style="font-size:11px; color:#888; margin-top:4px">
                                        ${tarea.estado === 'pendiente' ? '⏳ Pendiente' : tarea.estado === 'en progreso' ? '▶️ En progreso' : '✅ Completada'}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modalDiv = document.getElementById('modalTareasDia');
        if (modalDiv) {
            modalDiv.addEventListener('click', (e) => {
                if (e.target === modalDiv) {
                    cerrarModalTareasDia();
                }
            });
        }
        
    } catch (error) {
        console.error("Error al mostrar tareas:", error);
        mostrarToast("Error al cargar las tareas", "error");
    }
}

function cerrarModalTareasDia() {
    const modal = document.getElementById('modalTareasDia');
    if (modal) modal.remove();
}

function mesAnteriorCalendario() {
    if (mesActualCalendario === 0) {
        mesActualCalendario = 11;
        añoActualCalendario--;
    } else {
        mesActualCalendario--;
    }
    generarCalendario(mesActualCalendario, añoActualCalendario);
}

function mesSiguienteCalendario() {
    if (mesActualCalendario === 11) {
        mesActualCalendario = 0;
        añoActualCalendario++;
    } else {
        mesActualCalendario++;
    }
    generarCalendario(mesActualCalendario, añoActualCalendario);
}

function zoomCalendario(delta) {
    calendarioZoomLevel += delta;
    calendarioZoomLevel = Math.min(Math.max(calendarioZoomLevel, 0.6), 1.4);
    aplicarZoomAlCalendario();
    
    const sizeSpan = document.getElementById('sizeValue');
    if (sizeSpan) {
        sizeSpan.textContent = `${Math.round(calendarioZoomLevel * 100)}%`;
    }
}

function zoomIn() {
    zoomCalendario(0.05);
}

function zoomOut() {
    zoomCalendario(-0.05);
}

// ==================== FUNCIONES DE TAREAS ====================

function addClassIfValid(element, className) {
    if (className && typeof className === 'string' && className.trim() !== '') {
        element.classList.add(className.trim())
    }
}

function obtenerBotonEstado(tarea) {
    if (tarea.estado === "pendiente") {
        return `<button class="btn-estado" onclick="cambiarEstado(${tarea.id}, 'en progreso')">▶️</button>`
    }
    if (tarea.estado === "en progreso") {
        return `<button class="btn-estado" onclick="cambiarEstado(${tarea.id}, 'completada')">✅</button>`
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
    return colores[color] || colores.gris
}

// ==================== FUNCIONES DE FILTRADO POR CARPETAS ====================

async function actualizarContadoresCategorias() {
    try {
        const response = await fetch("/tareas");
        const tareas = await response.json();
        
        const conteos = {
            azul: 0,
            rojo: 0,
            verde: 0,
            amarillo: 0,
            morado: 0,
            gris: 0,
            todas: tareas.length
        };
        
        tareas.forEach(tarea => {
            const color = tarea.color || "gris";
            if (conteos[color] !== undefined) {
                conteos[color]++;
            }
        });
        
        const countTodas = document.getElementById("count-todas");
        const countAzul = document.getElementById("count-azul");
        const countRojo = document.getElementById("count-rojo");
        const countVerde = document.getElementById("count-verde");
        const countAmarillo = document.getElementById("count-amarillo");
        const countMorado = document.getElementById("count-morado");
        const countGris = document.getElementById("count-gris");
        
        if (countTodas) countTodas.textContent = conteos.todas;
        if (countAzul) countAzul.textContent = conteos.azul;
        if (countRojo) countRojo.textContent = conteos.rojo;
        if (countVerde) countVerde.textContent = conteos.verde;
        if (countAmarillo) countAmarillo.textContent = conteos.amarillo;
        if (countMorado) countMorado.textContent = conteos.morado;
        if (countGris) countGris.textContent = conteos.gris;
        
        return conteos;
    } catch (error) {
        console.error("Error actualizando contadores:", error);
    }
}

async function filtrarTareasPorCategoria(categoria) {
    categoriaFiltroActual = categoria;
    
    try {
        const response = await fetch("/tareas");
        let tareas = await response.json();
        
        if (categoria !== "todas") {
            tareas = tareas.filter(tarea => (tarea.color || "gris") === categoria);
        }
        
        const contador = document.getElementById("task-count");
        contador.textContent = tareas.length === 1 ? "1 tarea" : tareas.length + " tareas";
        
        const container = document.getElementById("tasks-container");
        container.innerHTML = "";
        
        if (tareas.length === 0) {
            container.innerHTML = `
                <div class="no-tasks">
                    <div class="no-tasks-icon">📁</div>
                    <h3>No hay tareas en esta categoría</h3>
                    <p>Prueba con otra carpeta o crea una nueva tarea</p>
                </div>
            `;
            return;
        }
        
        tareas.forEach(tarea => {
            const card = document.createElement("div");
            addClassIfValid(card, "task-card");
            
            const infoColor = obtenerInfoColor(tarea.color);
            const colorClase = infoColor.clase;
            const colorNombre = infoColor.nombre;
            addClassIfValid(card, colorClase);
            
            const tituloEscapado = tarea.titulo.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            let descripcionCorta = tarea.descripcion?.trim() || 'Sin descripción';
            if (descripcionCorta.length > 80) {
                descripcionCorta = descripcionCorta.substring(0, 80) + '...';
            }
            
            const fechaMostrada = formatearFechaParaMostrar(tarea.fecha);
            
            card.innerHTML = `
                <div class="task-left">
                    <div class="task-top">
                        <span class="task-badge ${colorClase}">${colorNombre}</span>
                        <span class="task-status status-${tarea.estado.replace(" ", "-")}">${tarea.estado}</span>
                    </div>
                    <h3 class="task-title" title="${tarea.titulo}">${tarea.titulo}</h3>
                    <p class="task-desc" title="${tarea.descripcion || 'Sin descripción'}">${descripcionCorta}</p>
                </div>
                <div class="task-right">
                    <div class="task-info">
                        <div class="task-id-label">TAREA</div>
                        <div class="task-id">#${tarea.id}</div>
                        <div class="task-date">${fechaMostrada}</div>
                    </div>
                    <div class="task-actions">
                        ${obtenerBotonEstado(tarea)}
                        <button onclick="editarTarea(${tarea.id})">✏️</button>
                        <button onclick="eliminarTarea(${tarea.id}, '${tituloEscapado}')">🗑️</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
        
    } catch (error) {
        console.error("Error filtrando tareas:", error);
        mostrarToast("Error al filtrar las tareas", "error");
    }
}

function limpiarFiltro() {
    categoriaFiltroActual = "todas";
    
    document.querySelectorAll('.folder-item').forEach(item => {
        item.classList.remove('active');
    });
    const todasItem = document.querySelector('.folder-item[data-categoria="todas"]');
    if (todasItem) todasItem.classList.add('active');
    
    cargarTareas();
}

function inicializarFiltros() {
    const folderItems = document.querySelectorAll('.folder-item');
    
    folderItems.forEach(item => {
        item.addEventListener('click', () => {
            const categoria = item.dataset.categoria;
            
            folderItems.forEach(f => f.classList.remove('active'));
            item.classList.add('active');
            
            if (categoria === "todas") {
                cargarTareas();
            } else {
                filtrarTareasPorCategoria(categoria);
            }
        });
    });
    
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', limpiarFiltro);
    }
}

async function cargarTareas() {
    try {
        const response = await fetch("/tareas")
        const tareas = await response.json()

        const contador = document.getElementById("task-count")
        contador.textContent = tareas.length === 1 ? "1 tarea" : tareas.length + " tareas"

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
            await generarCalendario(mesActualCalendario, añoActualCalendario);
            await actualizarContadoresCategorias();
            return
        }

        tareas.forEach(tarea => {
            const card = document.createElement("div")
            addClassIfValid(card, "task-card")

            const infoColor = obtenerInfoColor(tarea.color)
            const colorClase = infoColor.clase
            const colorNombre = infoColor.nombre
            addClassIfValid(card, colorClase)

            const tituloEscapado = tarea.titulo.replace(/'/g, "\\'").replace(/"/g, '&quot;')
            let descripcionCorta = tarea.descripcion?.trim() || 'Sin descripción'
            if (descripcionCorta.length > 80) {
                descripcionCorta = descripcionCorta.substring(0, 80) + '...'
            }

            const fechaMostrada = formatearFechaParaMostrar(tarea.fecha);

            card.innerHTML = `
                <div class="task-left">
                    <div class="task-top">
                        <span class="task-badge ${colorClase}">${colorNombre}</span>
                        <span class="task-status status-${tarea.estado.replace(" ", "-")}">${tarea.estado}</span>
                    </div>
                    <h3 class="task-title" title="${tarea.titulo}">${tarea.titulo}</h3>
                    <p class="task-desc" title="${tarea.descripcion || 'Sin descripción'}">${descripcionCorta}</p>
                </div>
                <div class="task-right">
                    <div class="task-info">
                        <div class="task-id-label">TAREA</div>
                        <div class="task-id">#${tarea.id}</div>
                        <div class="task-date">${fechaMostrada}</div>
                    </div>
                    <div class="task-actions">
                        ${obtenerBotonEstado(tarea)}
                        <button onclick="editarTarea(${tarea.id})">✏️</button>
                        <button onclick="eliminarTarea(${tarea.id}, '${tituloEscapado}')">🗑️</button>
                    </div>
                </div>
            `
            container.appendChild(card)
        })
        
        await generarCalendario(mesActualCalendario, añoActualCalendario);
        await actualizarContadoresCategorias();
    } catch (error) {
        console.error("Error cargando tareas:", error);
        mostrarToast("Error al cargar las tareas", "error");
    }
}

async function cambiarEstado(id, nuevoEstado) {
    try {
        const res = await fetch("/tareas")
        const tareas = await res.json()
        const tarea = tareas.find(t => t.id === id)

        await fetch("/tareas/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                titulo: tarea.titulo,
                descripcion: tarea.descripcion,
                estado: nuevoEstado,
                color: tarea.color || "gris",
                fecha: tarea.fecha
            })
        })
        
        mostrarToast("Estado actualizado", "success")
        cargarTareas()
    } catch (err) {
        mostrarToast("Error de conexión", "error")
    }
}

function eliminarTarea(id, titulo) {
    tareaAEliminar = id
    const deleteTitle = document.getElementById("deleteTitle")
    if (deleteTitle) deleteTitle.textContent = `Eliminar tarea "${titulo}"`
    modalEliminar.classList.add("active")
}

if (btnConfirmarEliminar) {
    btnConfirmarEliminar.addEventListener("click", async () => {
        if (!tareaAEliminar) return
        await fetch("/tareas/" + tareaAEliminar, { method: "DELETE" })
        tareaAEliminar = null
        cerrarEliminarModal()
        cargarTareas()
    })
}

if (btnCerrarEliminar) btnCerrarEliminar.addEventListener("click", cerrarEliminarModal)
if (btnCancelarEliminar) btnCancelarEliminar.addEventListener("click", cerrarEliminarModal)

function cerrarEliminarModal() {
    modalEliminar.classList.remove("active")
    tareaAEliminar = null
}

if (modalEliminar) {
    modalEliminar.addEventListener("click", (e) => {
        if (e.target === modalEliminar) cerrarEliminarModal()
    })
}

function limpiarErrores() {
    const errorTitulo = document.getElementById("error-titulo")
    const errorDescripcion = document.getElementById("error-descripcion")
    const tituloInput = document.getElementById("titulo")
    const descripcionInput = document.getElementById("descripcion")
    
    if (errorTitulo) errorTitulo.textContent = ""
    if (errorDescripcion) errorDescripcion.textContent = ""
    if (tituloInput) tituloInput.classList.remove("input-error")
    if (descripcionInput) descripcionInput.classList.remove("input-error")
}

function actualizarBoton() {
    const btn = document.getElementById("btnGuardar")
    const titulo = document.getElementById("titulo")?.value.trim() || ""
    const descripcion = document.getElementById("descripcion")?.value.trim() || ""

    let valido = titulo.length >= 3 && titulo.length <= 100 && /[a-zA-Z0-9]/.test(titulo) && titulo.replace(/\s/g, "") !== ""
    if (descripcion.length > 500) valido = false
    
    if (btn) btn.disabled = !valido
}

async function editarTarea(id) {
    const response = await fetch("/tareas")
    const tareas = await response.json()
    const tarea = tareas.find(t => t.id === id)

    tareaEditando = id

    const modalTitle = document.getElementById("modalTitle")
    const btnGuardar = document.getElementById("btnGuardar")
    const modalDesc = document.getElementById("modalDesc")
    const tituloInput = document.getElementById("titulo")
    const descripcionInput = document.getElementById("descripcion")
    
    if (modalTitle) modalTitle.textContent = "Editar Tarea"
    if (btnGuardar) btnGuardar.textContent = "Guardar cambios"
    if (modalDesc) modalDesc.textContent = "Edita los campos para actualizar la tarea."
    if (tituloInput) tituloInput.value = tarea.titulo
    if (descripcionInput) descripcionInput.value = tarea.descripcion
    
    const selectEstado = document.getElementById("estado")
    if (selectEstado) {
        Array.from(selectEstado.options).forEach(opt => opt.disabled = false)
        if (tarea.estado === "en progreso") {
            const optionPendiente = selectEstado.querySelector("option[value='pendiente']")
            if (optionPendiente) optionPendiente.disabled = true
        }
        if (tarea.estado === "completada") {
            const optionPendiente = selectEstado.querySelector("option[value='pendiente']")
            const optionProgreso = selectEstado.querySelector("option[value='en progreso']")
            if (optionPendiente) optionPendiente.disabled = true
            if (optionProgreso) optionProgreso.disabled = true
            selectEstado.disabled = true
        }
        selectEstado.value = tarea.estado
    }
    
    const colorValue = tarea.color || "gris"
    const inputColor = document.getElementById("color")
    if (inputColor) inputColor.value = colorValue
    
    const botonesColor = document.querySelectorAll(".color-btn")
    botonesColor.forEach(b => b.classList.remove("active"))
    const btnActivo = document.querySelector(`[data-color="${colorValue}"]`)
    if (btnActivo) btnActivo.classList.add("active")

    limpiarErrores()
    actualizarBoton()
    
    const modalElement = document.getElementById("modalNuevaTarea")
    if (modalElement) modalElement.classList.add("active")
}

// ==================== EVENT LISTENERS DEL MODAL ====================
const modal = document.getElementById("modalNuevaTarea")
const btnNuevaTarea = document.querySelector(".btn-new-task")
const cerrarModalBtn = document.getElementById("cerrarModal")
const btnCancelarModal = document.querySelector(".btn-cancelar")

const formNuevaTarea = document.getElementById("formNuevaTarea")
if (formNuevaTarea) {
    formNuevaTarea.addEventListener("submit", async function(e) {
        e.preventDefault()

        const tituloInput = document.getElementById("titulo")
        const descripcionInput = document.getElementById("descripcion")
        const errorTitulo = document.getElementById("error-titulo")
        const errorDescripcion = document.getElementById("error-descripcion")

        if (errorTitulo) errorTitulo.textContent = ""
        if (errorDescripcion) errorDescripcion.textContent = ""
        if (tituloInput) tituloInput.classList.remove("input-error")
        if (descripcionInput) descripcionInput.classList.remove("input-error")

        let valido = true
        let titulo = tituloInput?.value.trim() || ""
        let descripcion = descripcionInput?.value.trim() || ""
        let estado = document.getElementById("estado")?.value || "pendiente"
        let color = document.getElementById("color")?.value || "gris"

        if (!color || color === "") {
            color = "gris"
            const btnGris = document.querySelector('[data-color="gris"]')
            if (btnGris) btnGris.classList.add("active")
        }

        if (titulo === "") {
            if (errorTitulo) errorTitulo.textContent = "El título es obligatorio"
            if (tituloInput) tituloInput.classList.add("input-error")
            valido = false
        } else if (titulo.replace(/\s/g, "") === "") {
            if (errorTitulo) errorTitulo.textContent = "No puede contener solo espacios"
            if (tituloInput) tituloInput.classList.add("input-error")
            valido = false
        } else if (titulo.length < 3) {
            if (errorTitulo) errorTitulo.textContent = "Mínimo 3 caracteres"
            if (tituloInput) tituloInput.classList.add("input-error")
            valido = false
        } else if (titulo.length > 100) {
            if (errorTitulo) errorTitulo.textContent = "Máximo 100 caracteres"
            if (tituloInput) tituloInput.classList.add("input-error")
            valido = false
        }

        if (descripcion.length > 500) {
            if (errorDescripcion) errorDescripcion.textContent = "Máximo 500 caracteres"
            if (descripcionInput) descripcionInput.classList.add("input-error")
            valido = false
        }

        if (!valido) return

        const data = {
            titulo,
            descripcion,
            estado,
            color,
            fecha: new Date().toISOString()
        }

        try {
            let response
            if (tareaEditando) {
                response = await fetch("/tareas/" + tareaEditando, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                })
            } else {
                response = await fetch("/tareas", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                })
            }

            if (!response.ok) throw new Error("Error al guardar")

            tareaEditando = null
            formNuevaTarea.reset()
            cerrar()
            cargarTareas()
            mostrarToast("Tarea guardada correctamente", "success")
        } catch (err) {
            mostrarToast("Error de conexión con el servidor", "error")
        }
    })
}

const botonesColor = document.querySelectorAll(".color-btn")
const inputColor = document.getElementById("color")

botonesColor.forEach(btn => {
    btn.addEventListener("click", () => {
        botonesColor.forEach(b => b.classList.remove("active"))
        btn.classList.add("active")
        if (inputColor) inputColor.value = btn.dataset.color
    })
})

if (btnNuevaTarea) {
    btnNuevaTarea.addEventListener("click", () => {
        tareaEditando = null
        const modalTitle = document.getElementById("modalTitle")
        const btnGuardar = document.getElementById("btnGuardar")
        const form = document.getElementById("formNuevaTarea")
        
        if (modalTitle) modalTitle.textContent = "Nueva tarea"
        if (btnGuardar) btnGuardar.textContent = "Crear tarea"
        if (form) form.reset()

        const botonesColor = document.querySelectorAll(".color-btn")
        botonesColor.forEach(b => b.classList.remove("active"))
        
        if (inputColor) inputColor.value = "gris"
        const btnGris = document.querySelector('[data-color="gris"]')
        if (btnGris) btnGris.classList.add("active")

        const selectEstado = document.getElementById("estado")
        if (selectEstado) {
            Array.from(selectEstado.options).forEach(opt => opt.disabled = false)
            selectEstado.disabled = false
            selectEstado.value = "pendiente"
        }

        limpiarErrores()
        actualizarBoton()
        if (modal) modal.classList.add("active")
    })
}

if (cerrarModalBtn) cerrarModalBtn.addEventListener("click", cerrar)
if (btnCancelarModal) btnCancelarModal.addEventListener("click", cerrar)

function cerrar() {
    if (modal) modal.classList.remove("active")
    tareaEditando = null
    const form = document.getElementById("formNuevaTarea")
    if (form) form.reset()
}

if (modal) {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrar()
    })
}

const tituloInputValidar = document.getElementById("titulo")
const descripcionInputValidar = document.getElementById("descripcion")
if (tituloInputValidar) tituloInputValidar.addEventListener("input", actualizarBoton)
if (descripcionInputValidar) descripcionInputValidar.addEventListener("input", actualizarBoton)

// ==================== INICIALIZACIÓN ====================
document.addEventListener("DOMContentLoaded", () => {
    if (inputColor && !inputColor.value) {
        inputColor.value = "gris"
        const btnGris = document.querySelector('[data-color="gris"]')
        if (btnGris) btnGris.classList.add("active")
    }
    
    const prevBtn = document.getElementById('prevMonthBtn');
    const nextBtn = document.getElementById('nextMonthBtn');
    const zoomInBtn = document.getElementById('calendarZoomIn');
    const zoomOutBtn = document.getElementById('calendarZoomOut');
    
    if (prevBtn) prevBtn.addEventListener('click', mesAnteriorCalendario);
    if (nextBtn) nextBtn.addEventListener('click', mesSiguienteCalendario);
    if (zoomInBtn) zoomInBtn.addEventListener('click', zoomIn);
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOut);
    
    inicializarFiltros();
    
    cargarTareas();
})

function mostrarToast(mensaje, tipo = "success") {
    let container = document.getElementById("toast-container")
    if (!container) {
        container = document.createElement("div")
        container.id = "toast-container"
        document.body.appendChild(container)
    }

    const toast = document.createElement("div")
    toast.classList.add("toast", tipo)
    
    let icono = tipo === "success" ? "✔️" : tipo === "error" ? "❌" : "ℹ️"
    toast.innerHTML = `<span>${icono}</span><span>${mensaje}</span>`
    container.prepend(toast)

    setTimeout(() => toast.classList.add("show"), 100)
    setTimeout(() => {
        toast.classList.remove("show")
        setTimeout(() => toast.remove(), 300)
    }, 3000)
}