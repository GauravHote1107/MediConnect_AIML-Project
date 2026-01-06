from flask_restx import Namespace

ns = Namespace("doctor", "CRUD Operations for Doctor")

from . import views as views
