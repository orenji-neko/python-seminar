import os
import time
from flask import ( Blueprint, request, jsonify, current_app )
from werkzeug.utils import secure_filename
from db import db
from models import Student

bp = Blueprint(
    'student', 
    __name__, 
    url_prefix='/student')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/', methods=['POST'])
def create_student():
    """
    Create a new student
    ---
    parameters:
      - name: id
        in: formData
        type: string
        required: true
      - name: lname
        in: formData
        type: string
        required: true
      - name: fname
        in: formData
        type: string
        required: true
      - name: course
        in: formData
        type: string
        required: true
      - name: year
        in: formData
        type: integer
        required: true
      - name: profile_image
        in: formData
        type: file
        required: false
    responses:
      201:
        description: Student created
    """
    # Prefer form data if available (for file uploads), otherwise JSON
    if request.content_type and 'multipart/form-data' in request.content_type:
        data = request.form
    else:
        data = request.get_json() or {}

    profile_image_url = None
    if 'profile_image' in request.files:
        file = request.files['profile_image']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add timestamp to filename to avoid collisions
            filename = f"{int(time.time())}_{filename}"
            file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
            profile_image_url = f"/uploads/{filename}"

    new_student = Student(
        id=data.get('id'),
        lname=data.get('lname'),
        fname=data.get('fname'),
        course=data.get('course'),
        year=data.get('year'),
        profile_image=profile_image_url
    )
    db.session.add(new_student)
    db.session.commit()
    return jsonify(new_student.to_dict()), 201

@bp.route('/<string:id>', methods=['PUT'])
def update_student(id: str):
    """
    Update an existing student
    ---
    parameters:
      - name: id
        in: path
        type: string
        required: true
      - name: new_id
        in: formData
        type: string
      - name: lname
        in: formData
        type: string
      - name: fname
        in: formData
        type: string
      - name: course
        in: formData
        type: string
      - name: year
        in: formData
        type: integer
      - name: profile_image
        in: formData
        type: file
    responses:
      200:
        description: Student updated
    """
    student = Student.query.get_or_404(id)
    
    if request.content_type and 'multipart/form-data' in request.content_type:
        data = request.form
    else:
        data = request.get_json() or {}
    
    if 'profile_image' in request.files:
        file = request.files['profile_image']
        if file and allowed_file(file.filename):
            # Delete old image if it exists
            if student.profile_image:
                old_filename = student.profile_image.split('/')[-1]
                old_path = os.path.join(current_app.config['UPLOAD_FOLDER'], old_filename)
                if os.path.exists(old_path):
                    os.remove(old_path)

            filename = secure_filename(file.filename)
            filename = f"{int(time.time())}_{filename}"
            file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
            student.profile_image = f"/uploads/{filename}"

    student.id = data.get('new_id', student.id)
    student.lname = data.get('lname', student.lname)
    student.fname = data.get('fname', student.fname)
    student.course = data.get('course', student.course)
    student.year = data.get('year', student.year)
    
    db.session.commit()
    return jsonify(student.to_dict())

@bp.route('/<string:id>', methods=['DELETE'])
def delete_student(id: str):
    """
    Delete a student
    ---
    parameters:
      - name: id
        in: path
        type: string
        required: true
    responses:
      200:
        description: Student deleted
    """
    student = Student.query.get_or_404(id)
    
    if student.profile_image:
        filename = student.profile_image.split('/')[-1]
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            
    db.session.delete(student)
    db.session.commit()
    return jsonify({"message": "Student deleted"}), 200

@bp.route('/', methods=['GET'])
def get_students():
    """
    Get all students
    ---
    responses:
      200:
        description: A list of students
    """
    students = Student.query.all()
    return jsonify([s.to_dict() for s in students])
