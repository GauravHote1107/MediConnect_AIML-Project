from flask_restx import fields

from . import ns

patient_otp_model = ns.model(
    "PatientOtpModel",
    {
        "otp": fields.Integer(required=True),
        "access_token": fields.String(required=True),
    },
)
