from db import db

class Student(db.Model):
    id = db.Column(db.String, primary_key=True)
    lname = db.Column(db.String, nullable=False)
    fname = db.Column(db.String, nullable=False)
    course = db.Column(db.String, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    profile_image = db.Column(db.String, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "lname": self.lname,
            "fname": self.fname,
            "course": self.course,
            "year": self.year,
            "profile_image": self.profile_image
        }
