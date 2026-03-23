from flask import Flask, request, jsonify, render_template
from database import get_db_connection
from datetime import date

app = Flask(__name__)

# Obtener todas las tareas
@app.route("/tareas", methods=["GET"])
def get_tasks():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM tareas")
    tasks = cursor.fetchall()

    conn.close()

    return jsonify(tasks)

# Crear nueva tarea
@app.route("/tareas", methods=["POST"])
def create_task():
    data = request.json

    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """
    INSERT INTO tareas (titulo, descripcion, estado, fecha)
    VALUES (%s, %s, %s, %s)
    """

    cursor.execute(sql, (
        data["titulo"],
        data["descripcion"],
        data["estado"],
        date.today()
    ))

    conn.commit()
    conn.close()

    return jsonify({"message": "Tarea creada"}), 201


# Actualizar tarea
@app.route("/tareas/<int:id>", methods=["PUT"])
def update_task(id):
    data = request.json
    print("Datos recibidos:", data)  # Para depurar

    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """
    UPDATE tareas
    SET titulo=%s, descripcion=%s, estado=%s, fecha=%s
    WHERE id=%s
    """

    cursor.execute(sql, (
        data["titulo"],
        data["descripcion"],
        data["estado"],
        data["fecha"],  # Ahora recibirá '2024-01-15' en lugar de '2024-01-15T10:30:00.000Z'
        id
    ))

    conn.commit()
    conn.close()

    return jsonify({"message": "Tarea actualizada"})


# Eliminar tarea
@app.route("/tareas/<int:id>", methods=["DELETE"])
def delete_task(id):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM tareas WHERE id=%s", (id,))

    conn.commit()
    conn.close()

    return jsonify({"message": "Tarea eliminada"})


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)