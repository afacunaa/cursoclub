module.exports = {
    'project_name': 'cursoclub',
    'adminname': 'cursoclub_admin',
    'adminmail': 'equipo.cursoclub@gmail.com',
    'host': "http://cursoclub.herokuapp.com",
    'email_smtp_host': 'Your Email SMTP',
    'email_smtp_port': 'YOUR SMTP PORT',
    "smtp_from_email": "equipo.cursoclub@gmail.com",
    "smtp_from_name": "Curso Club",
    "alert_email": "aler@email.com",
    "alert_email_name": "Aler Name",
    "admin_role": 1,
    "teacher_role": 2,
    "student_role": 3,
    'facebookAuth': {
        'clientID': '179051199293941', // your App ID
        'clientSecret': '5dab981c87e0969a7920b8c9527fd475', // your App Secret
        'callbackURL': '/auth/facebook/callback'
    },
    "lesson_booked":'Solicitada',
    "lesson_accepted":'Aceptada',
    "lesson_rejected":'Rechazada',
    "lesson_canceled":'Cancelada',
    "lesson_paid":'Pendiente',
    "lesson_done":'Realizada',
    "upload_directory":"./public/uploads/"
};