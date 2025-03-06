from flask import request, jsonify, Blueprint
from api.models import db, Theme

api = Blueprint('api', __name__)

@api.route('/theme', methods=['GET'])
def get_themes():
    themes = Theme.query.all()
    if not themes:
        return jsonify(message="No themes found"), 404
    all_themes = list(map(lambda x: x.serialize(), themes))
    return jsonify(message="Themes", themes=all_themes), 200

@api.route('/theme/<int:id>', methods=['GET'])
def get_theme_by_id(id):
    theme = Theme.query.get(id)
    if not theme:
        return jsonify(message="Theme not found"), 404
    return jsonify(message="Theme", theme=theme.serialize()), 200

@api.route('/theme', methods=['POST'])
def add_new_theme():
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({"msg": "Body missing"}), 400
    if "nombre" not in body:
        return jsonify({"msg": "nombre missing"}), 400
    
    new_theme = Theme()
    new_theme.nombre = body['nombre']
    
    try:
        with db.session.begin():
            db.session.add(new_theme)
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Error creating theme: {str(e)}"}), 500
    
    return jsonify({'msg': f'Theme {body["nombre"]} has been created', 'theme': new_theme.serialize()}), 201

@api.route('/theme/<int:id>', methods=['PUT'])
def update_theme(id):
    theme = Theme.query.get(id)
    if not theme:
        return jsonify(message="Theme not found"), 404
    
    data = request.get_json()
    if 'nombre' in data:
        theme.nombre = data['nombre']
    
    db.session.commit()
    
    return jsonify(message="Theme updated successfully", theme=theme.serialize()), 200

@api.route('/theme/<int:id>', methods=['DELETE'])
def delete_theme(id):
    theme = Theme.query.get(id)
    if not theme:
        return jsonify(message="Theme not found"), 404
    
    db.session.delete(theme)
    db.session.commit()
    
    return jsonify(message="Theme deleted successfully"), 200
