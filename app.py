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
    INSERT INTO tareas (titulo, descripcion, estado, fecha, color, carpeta_id)
    VALUES (%s, %s, %s, %s, %s, %s)
    """

    cursor.execute(sql, (
        data["titulo"],
        data["descripcion"],
        data["estado"],
        data["fecha"],
        data["color"],
        data.get("carpeta_id")
    ))

    conn.commit()
    conn.close()

    return jsonify({"message": "Tarea creada"}), 201

# Editar una tarea existente
@app.route("/tareas/<int:id>", methods=["PUT"])
def update_task(id):
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        carpeta_id = data.get("carpeta_id") or None

        sql = """
        UPDATE tareas 
        SET titulo=%s, descripcion=%s, estado=%s, color=%s, fecha=%s, carpeta_id=%s
        WHERE id=%s
        """

        cursor.execute(sql, (
            data.get("titulo"),
            data.get("descripcion"),
            data.get("estado"),
            data.get("color"),
            data.get("fecha"),
            carpeta_id,
            id
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Tarea actualizada"}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

# Eliminar tarea
@app.route("/tareas/<int:id>", methods=["DELETE"])
def delete_task(id):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM tareas WHERE id=%s", (id,))

    conn.commit()
    conn.close()

    return jsonify({"message": "Tarea eliminada"})

# Obtener todas las carpetas
@app.route("/carpetas", methods=["GET"])
def get_carpetas():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id, nombre FROM carpetas")
        rows = cursor.fetchall()

        print("ROWS:", rows)

        carpetas = []

        for row in rows:
            if len(row) >= 2:
                carpetas.append({
                    "id": row["id"],
                    "nombre": row["nombre"]
                })

        conn.close()

        return jsonify(carpetas)

    except Exception as e:
        print("ERROR REAL:", e)
        return jsonify({"error": str(e)}), 500

# Crear nueva carpeta
@app.route("/carpetas", methods=["POST"])
def create_carpeta():

    data = request.json
    nombre = data.get("nombre")

    if not nombre:
        return jsonify({"error": "Nombre requerido"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO carpetas (nombre) VALUES (%s)",
            (nombre,)
        )
        conn.commit()
    except:
        return jsonify({"error": "La carpeta ya existe"}), 400

    conn.close()

    return jsonify({"message": "Carpeta creada"}), 201

@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)