function showPersonalForm() {
    $('#personalForm').fadeIn();
    $('#professionalForm').hide();
    $('#lastStepForm').hide();
}

function showProfessionalForm() {
    $('#personalForm').hide();
    $('#professionalForm').fadeIn();
    $('#lastStepForm').hide();
}

function showLastStepForm() {
    $('#personalForm').hide();
    $('#professionalForm').hide();
    $('#lastStepForm').fadeIn();
}

function knowledgeTypeSelected(option) {
    $('#file-inputField').fadeIn();
    if (option === 'professional') {
        $('#file-message').text('Por favor adjunta tu hoja de vida');
    } else {
        $('#file-message').text('Si deseas, puedes adjuntar un documento que certifique tu experiencia en esta área');
    }

}