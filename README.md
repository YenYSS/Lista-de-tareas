# Lista de Tareas

## Integrantes del equipo y Tecnologías:
Líder Técnico: Yendris Sepulveda.

Desarrollador Front: Maria Colmenares, Angelica Pineda.

Desarrollador Backend: Jesus Fuentes.

Database, QA, Tester: Sthefany Salazar.


Tecnologías usadas: Flask, Python, MySQL (conexión: PyMySql), HTML, CSS, JS.

# 🛠️ Instrucciones de Instalación
Para que todos podamos trabajar en el proyecto, sigan estos pasos en orden:

## 🗄️ Configuración de la Base de Datos

Este proyecto utiliza **MySQL**. Para que la aplicación se conecte correctamente en tu computadora, sigue estos pasos:

1. **Importar la Base de Datos:**
   - Abre tu MySQL (Workbench, phpMyAdmin o terminal).
   - Crea una base de datos llamada `lista_tareas`.
   - Importa el archivo `base.sql` que se encuentra en la raíz del proyecto.

2. **Configurar Credenciales:**
   - Busca el archivo `config_ejemplo.py` en la carpeta principal.
   - **Cámbiale el nombre** a `config.py`.
   - Abre el nuevo `config.py` y coloca tus datos locales:
     ```python
     DB_HOST = 'localhost'
     DB_USER = 'tu_usuario'
     DB_PASS = 'tu_password'
     DB_NAME = 'lista_tareas'
     ```
   
> [IMPORTANTE]
> El archivo `config.py` está en el `.gitignore`, por lo que tus contraseñas nunca se subirán al repositorio. Solo se compartirá el "molde" `config_ejemplo.py`.

## 1. Descargar e Instalar las Herramientas
Primero necesitan el "motor" para descargar el código y el lenguaje para ejecutarlo:

Git: Descárguenlo aquí: git-scm.com. (Instalen con todas las opciones por defecto).

Python: Asegúrense de tener Python 3.x instalado. Pueden bajarlo de python.org. Importante: Marquen la casilla que dice "Add Python to PATH" durante la instalación.

## 2. Clonar el Proyecto (Descargar)
Abran una terminal en la carpeta donde quieran guardar el proyecto y escriban:

git clone https://github.com/YenYSS/Lista-de-tareas.git

cd Lista-de-tareas

## 3. Configurar el Entorno Virtual
Esto es para que las librerías del proyecto no se mezclen con otras cosas de su PC:

Crear el entorno
python -m venv venv

## ACTIVARLO (Paso crítico)
En Windows:
.\venv\Scripts\activate

Sabrán que funcionó porque aparecerá un (venv) al principio de su línea de comandos.

## 4. Instalar Dependencias
Con el entorno activado, instalen Flask y demás herramientas que ya configuré, solamente ejecuten el siguiente código:

pip install -r requirements.txt

## 5. Todo listo
Abran la carpeta en Visual Studio Code y para ver la página funcionando ejecuten:

python app.py

Abran su navegador en: http://127.0.0.1:5000



## 🔄 Flujo de Trabajo Diario (Cómo subir cambios)
Para mantener el orden y no borrar el trabajo de los demás, sigamos este ciclo siempre:

### Bajar cambios nuevos (Antes de empezar):

git pull origin main

(Y ya pueden hacer sus cambios en el código)

### Preparar y Guardar los cambios:

git add .
git commit -m "Explicación corta de lo que hiciste"

### Subir a GitHub:

git push origin nombre-de-la-rama (Leer abajo)

## 🌳 Estrategia de Ramas (IMPORTANTE)

Para mantener la estabilidad del proyecto, **está prohibido subir cambios directamente a la rama `main`**. Usaremos este flujo para evitar problemas y más trabajo:

1. **main**: Es nuestra oficina terminada. Solo código que funciona al 100%.
2. **desarrollo**: Es nuestra zona de construcción. Aquí es donde uniremos el trabajo de todos antes de pasarlo a la principal.

### Crea tu propia rama antes de trabajar
Antes de escribir cualquier código, crea tu espacio de trabajo personal si harás un cambio relevante o sino simplemente subelo a "desarrollo":

git checkout -b nombre-de-tu-rama

# Cómo subir un Issue que se te ha asignado
## ✅ 1. Te asignan un issue
Ejemplo:

"Frontend: validar título vacío"

👉 Ese issue es tu tarea

## ✅ 2. Crear una rama para ese issue (MUY recomendado)
En tu terminal:

git checkout main

git pull

git checkout -b fix/validacion-titulo

👉 Nombre típico:

fix/... → para arreglos

feature/... → para nuevas cosas

## ✅ 3. Haces el trabajo
Ejemplo:

Editas script.js
Agregas validaciones

## ✅ 4. Guardas los cambios (commit)
git add .

git commit -m "Fix: validación de título vacío en formulario"

💡 Consejo: usa mensajes claros

## ✅ 5. Subes la rama a GitHub
git push origin fix/validacion-titulo

## ✅ 6. Crear el Pull Request (PR)

En GitHub te va a salir:

👉 “Pull request”

Ahí:
Título: Fix: Validación de título vacío
Descripción: Se agregó validación para evitar títulos vacíos en el formulario de tareas.

💡 TIP:

Puedes vincular el issue escribiendo:
Closes #12

👉 (12 es el número del issue)
🔥 Esto hace que el issue se cierre automáticamente
