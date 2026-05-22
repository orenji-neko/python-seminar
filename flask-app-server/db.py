from flask_sqlalchemy import SQLAlchemy
import click
from flask.cli import with_appcontext

db = SQLAlchemy()

@click.command("init-db")
@with_appcontext
def init_db_command():
    """Clear the existing data and create new tables."""
    from models import Student
    db.drop_all()
    db.create_all()
    click.echo("Initialized the database.")

def init_app(app):
    db.init_app(app)
    app.cli.add_command(init_db_command)
