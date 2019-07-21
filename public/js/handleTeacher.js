function setModalInfo(shortName, description, whatsapLink) {
    $('#name').text(shortName);
    $('#description').text(description);
    $('#whatsappLink').attr('href', whatsapLink);

    //$('#teacherDetail').modal('open');
}

function getTeacherDetail(id) {
    $('#teacherDetailContent').html('');
    let url = '/teacher_serve_detail/' + id;
    $.ajax({url: url, success: function (result) {
            $('#teacherDetailContent').html(result);
        }
    });
}