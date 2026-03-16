# Lista de Tareas

# Integrantes del equipo y Tecnologías:
Líder Técnico: Yendris Sepulveda.

Desarrollador Front: Maria Colmenares, Angelica Pineda.

Desarrollador Backend: Jesus Fuentes.

Database, QA, Tester: Sthefany Salazar.


Tecnologías usadas: Flask, Python, MySQL (conexión: PyMySql), HTML, CSS, JS.

# 🛠️ Instrucciones de Instalación
Para que todos podamos trabajar en el proyecto, sigan estos pasos en orden:

# 1. Descargar e Instalar las Herramientas
Primero necesitan el "motor" para descargar el código y el lenguaje para ejecutarlo:

Git: Descárguenlo aquí: git-scm.com. (Instalen con todas las opciones por defecto).

Python: Asegúrense de tener Python 3.x instalado. Pueden bajarlo de python.org. Importante: Marquen la casilla que dice "Add Python to PATH" durante la instalación.

# 2. Clonar el Proyecto (Descargar)
Abran una terminal en la carpeta donde quieran guardar el proyecto y escriban:

git clone https://github.com/YenYSS/Lista-de-tareas.git
cd Lista-de-tareas

# 3. Configurar el Entorno Virtual
Esto es para que las librerías del proyecto no se mezclen con otras cosas de su PC:

Crear el entorno
python -m venv venv

# ACTIVARLO (Paso crítico)
En Windows:
.\venv\Scripts\activate

Sabrán que funcionó porque aparecerá un (venv) al principio de su línea de comandos.

# 4. Instalar Dependencias
Con el entorno activado, instalen Flask y demás herramientas que ya configuré, solamente ejecuten el siguiente código:

pip install -r requirements.txt

# 5. Todo listo
Abran la carpeta en Visual Studio Code y para ver la página funcionando ejecuten:

python app.py
Abran su navegador en: http://127.0.0.1:5000

Bash
python app.py
Luego solo abren su navegador en http://127.0.0.1:5000.
