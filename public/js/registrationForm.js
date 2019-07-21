let selectedCourses = [];

$(document).ready(function(){
    setCoursesList();
});

function showPersonalForm() {
    $('#personalForm').fadeIn();
    $('#professionalForm').hide();
    $('#lastStepForm').hide();
}

function showProfessionalForm(validate) {
    if (validate) {
        let firstnameDone = $('#firstname').val().length > 0;
        let lastnameDone = $('#lastname').val().length > 0;
        let mobileDone = $('#mobile').val().length > 0;
        let birthdayDone = $('#birthday').val().length > 0;
        let documentDone = $('#document').val().length > 0;
        let emailDone = $('#email').val().length > 0;
        let newPassword = $('#new_password').val();
        let new_passwordDone = newPassword.length > 0;
        let passwordConfirmation = $('#password_confirmation').val();
        let password_confirmationDone = passwordConfirmation.length > 0;
        let passwordMatch = newPassword === passwordConfirmation;
        if (firstnameDone && lastnameDone && mobileDone && birthdayDone && documentDone
            && emailDone && new_passwordDone && password_confirmationDone) {
            if (passwordMatch) {
                if (newPassword.length > 5) {
                    $('#personalForm').hide();
                    $('#professionalForm').fadeIn();
                    $('#lastStepForm').hide();
                    $(window).scrollTop(0);
                    courseSelected();
                } else {
                    Materialize.toast('¡La contraseña no es lo suficientemente larga!', 3000);
                }
            } else {
                Materialize.toast('¡Las contraseñas no coinciden!', 3000);
            }
        } else {
            Materialize.toast('¡Completa todos los datos!', 3000);
        }
    } else {
        $('#personalForm').hide();
        $('#professionalForm').fadeIn();
        $('#lastStepForm').hide();
        $(window).scrollTop(0);
    }
}

function showLastStepForm(validate) {
    if (validate) {
        let selectedCoursesRaw = $('#courses').val();
        let wantedCourse = $('#wantedCourse').val();
        if (selectedCoursesRaw.length > 0 || wantedCourse.length > 0) {
            let control = 0;
            let priceId;
            for (let i=0; i<selectedCoursesRaw.length; i++) {
                priceId = '#price' + selectedCoursesRaw[i].substring(0, selectedCoursesRaw[i].indexOf(':'));
                if ($(priceId).val().length > 0) {
                    control++;
                } else {
                    Materialize.toast('¡Indica un precio para la hora de clase de ' +
                        selectedCoursesRaw[i].substring(selectedCoursesRaw[i].indexOf(':') + 1) + '!', 3000);
                }
            }
            if (control === selectedCoursesRaw.length || wantedCourse.length > 0) {
                let isKnowledgeType1 = $('#knowledgeType1').is(':checked');
                let isKnowledgeType2 = $('#knowledgeType2').is(':checked');
                if (isKnowledgeType1 || isKnowledgeType2) {
                    if ((isKnowledgeType1 && $('#teacherFiles')[0].files.length > 0) || isKnowledgeType2) {
                        if ($('#experience').val().length > 0) {
                            if ($('#clients').val().length > 0) {
                                $('#personalForm').hide();
                                $('#professionalForm').hide();
                                $('#lastStepForm').fadeIn();
                                $(window).scrollTop(0);
                            } else {
                                Materialize.toast('¡Cuentanos ¿con qué tipo de clientes has trabajado?!', 3000);
                            }
                        } else {
                            Materialize.toast('¡Cuentanos sobre tu experiencia!', 3000);
                        }
                    } else {
                        Materialize.toast('¡Adjunta al menos un archivo!', 3000);
                    }
                } else {
                    Materialize.toast('¡Selecciona algún tipo de conocimiento!', 3000);
                }
            }
        } else {
            Materialize.toast('¡Selecciona al menos un curso!', 3000);
        }
    } else {
        $('#personalForm').hide();
        $('#professionalForm').hide();
        $('#lastStepForm').fadeIn();
        $(window).scrollTop(0);
    }
}

function courseSelected() {
    /*let pricesArea = $('#prices-area');
    pricesArea.text('');
    let selectedCoursesRaw = $('#courses').val();
    let elementsToAppend = selectedCoursesRaw.length > 0 ? '<p>Escribe un precio promedio por hora de clase para las clases seleccionadas:</p>' : '';
    for (let i=0; i<selectedCoursesRaw.length; i++) {
        elementsToAppend += '<div class="row">\n' +
            '\t<div class="input-field col l6 m6 s12">\n' +
            //'\t\t<i class="material-icons prefix">attach_money</i>\n' +
            '\t\t<input type="text" name="price' + selectedCoursesRaw[i].substring(0, selectedCoursesRaw[i].indexOf(':'))
            +'" id="price' + selectedCoursesRaw[i].substring(0, selectedCoursesRaw[i].indexOf(':')) + '" >\n' +
            '\t\t<label for="price"> ' + selectedCoursesRaw[i].substring(selectedCoursesRaw[i].indexOf(':') + 1) +
            '</label>\n' +
            '\t</div>\n' +
            '</div>'
    }
    pricesArea.append(elementsToAppend);*/
}

function checkAvailable() {
    let email = $('#email');
    let url = '/user_serve_exists/' + email.val();
    if (email.val() && email.val().indexOf('@') > -1) {
        $.ajax({
            url: url, success: function (result) {
                if (result) {
                    email.addClass('invalid');
                    $('#emailLabel').attr('data-error', 'El correo ya se encuentra registrado');
                }
            }
        });
    } else {
        $('#emailLabel').attr('data-error', '');
    }
}

function submitForm() {
    if ($('#about').val().length > 0 && $('#like').val().length > 0 && $('#howKnew').val().length > 0) {
        if ($('#facebook').val().length > 0 || $('#twitter').val().length > 0 || $('#linkedin').val().length > 0 ||
            $('#blog').val().length > 0 || $('#website').val().length > 0) {
            if ($('#terms').is(':checked')) {
                //Submit form
                //validateChips();
                $('#coursesAuto').val(selectedCourses);
                $('#registrationForm').submit();
            } else {
                Materialize.toast('Debes aceptar los términos y condiciones', 3000);
            }
        } else {
            Materialize.toast('¡Escribe al menos un perfil de redes sociales!', 3000);
        }
    } else {
        Materialize.toast('¡Completa todos los campos!', 3000);
    }
}

function setCoursesList() {
    let url = '/cursos_serve_list';
    $.ajax({url: url, success: function (result) {
            $('input.autocomplete').autocomplete({
                data: result,
                onAutocomplete: function (val) {
                    validate(val);
                }
            });
        }
    });
}

function validate(value) {
    let valueInput = $('#coursesAuto');
    if (!value) {
        value = valueInput.val();
    }
    valueInput.val('');
    if (value) {
        if (selectedCourses.indexOf(value) < 0) {
            $('#coursesHelp').html('<p>Estos son los cursos que has seleccionado:</p>');
            selectedCourses.push(value);
            let chip = '<div class="chip i-corporate-green black-text">' + value +
                '<i class="close material-icons" onclick="removeChip(\'' + value + '\')">close</i></div>';
            $('#chipArea').append(chip);
            valueInput.focus();
            Materialize.toast('¡Curso añadido!', 1500);
        }
    }
}

function removeChip(value) {
    let index = selectedCourses.indexOf(value);
    selectedCourses.splice(index, 1);
    if (selectedCourses.length < 1) {
        $('#coursesHelp').html('');
    }
}


