from flask_restx import Namespace

ns = Namespace("patient", "CRUD Operations for Patients")

from . import views as views
