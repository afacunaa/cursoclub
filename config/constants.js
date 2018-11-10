module.exports = {
    'project_name': 'instructorio',
    'adminname': 'instructorio_admin',
    'adminmail': 'afacunaa@instructorio.co',
    'host': "https://instructorio.co",
    'email_smtp_host': 'mail.instructorio.co',
    'email_smtp_port': 587,
    "smtp_from_email": "notificaciones@instructorio.co",
    "smtp_from_name": "Instructorio",
    "admin_role": 1,
    "teacher_role": 2,
    "student_role": 3,
    "hoursADay":16,
    "firstHour":6,
    "weeksAhead":4,
    "billPendingState":"Pendiente por aprobación",
    "billCanceledState":"Clases rechazadas",
    "billAcceptedState":"Aceptado",
    "billPaidState":"Pagado",
    "billDoneState":"Finalizado",
    'facebookAuth': {
        'clientID': '2102190150095128', // your App ID
        'clientSecret': '90b3363b06ed737037f4c7a55ab4525a', // your App Secret
        'callbackURL': '/auth/facebook/callback'
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
    "path_to_auth_keyfile": "/home/andres/Documentos/Repositorio local/cursoclub/cursoclub_auth.json"
};