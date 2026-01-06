from . import ns
from flask_restx import fields

patient_details_model = ns.model(
    "PatientDetailsModel",
    {
        "name": fields.String(required=True),
        "picture": fields.String(required=True),
    },
)
