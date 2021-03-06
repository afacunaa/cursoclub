module.exports = {
    'project_name': 'instructorio',
    'adminname': 'instructorio_admin',
    'adminmail': 'afacunaa@instructorio.co',
    'host': "https://instructorio.co",
    'email_smtp_host': 'mail.instructorio.co',
    'email_smtp_port': 587,
    "smtp_from_email": "notificaciones@instructorio.co",
    "smtp_from_name": "Instructorio",
    "hidden_trace_mail": "seguimiento@instructorio.co",
    "admin_role": 1,
    "teacher_role": 2,
    "student_role": 3,
    "hoursADay":16,
    "firstHour":7,
    "weeksAhead":4,
    "billPendingState":"Pendiente por aprobación",
    "billCanceledState":"Clases rechazadas",
    "billAcceptedState":"Aceptado",
    "billPaidState":"Pagado",
    "billDoneState":"Finalizado",
    'facebookAuth': {
        'clientID': '298131614376040', // your App ID
        'clientSecret': '81f9b6dfbbfca7f70dba5ee89e0c6cbe', // your App Secret
        'callbackURL': 'https://instructorio.co/auth/facebook/callback'
    },
    "lesson_booked":'Solicitada',
    "lesson_accepted":'Aceptada',
    "lesson_rejected":'Rechazada',
    "lesson_canceled":'Cancelada',
    "lesson_paid":'Pendiente',
    "lesson_done":'Realizada',
    "upload_directory":"./public/uploads/",
    "upload_directory_reference":"/uploads/",
    "google_bucket_name": "cursoclub-uploads",
    "project_id": "curso-club-web",
    "path_to_auth_keyfile": "/home/andres/Documentos/Repositorio local/cursoclub/cursoclub_auth.json",
    "cities": {
        "bogota":"Bogotá",
        "medellin":"Medellín",
        "cali":"Cali",
        "bucaramanga":"Bucaramanga",
        "otros":"Otras ciudades",
        "distancia":"A distancia/remoto"
    }
};