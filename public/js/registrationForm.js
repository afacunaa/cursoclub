function showPersonalForm() {
    $('#personalForm').fadeIn();
    $('#professionalForm').hide();
    $('#lastStepForm').hide();
}

function showProfessionalForm(validate) {
    if (validate) {
        let firstnameDone = $('#firstname').val().length > 0;
        let lastnameDone = $('#lastname').val().length > 0;
        let phoneDone = $('#phone').val().length > 0;
        let mobileDone = $('#mobile').val().length > 0;
        let birthdayDone = $('#birthday').val().length > 0;
        let cityDone = $('#city').val().length > 0;
        let addressDone = $('#address').val().length > 0;
        let documentDone = $('#document').val().length > 0;
        let emailDone = $('#email').val().length > 0;
        let newPassword = $('#new_password').val();
        let new_passwordDone = newPassword.length > 0;
        let passwordConfirmation = $('#password_confirmation').val();
        let password_confirmationDone = passwordConfirmation.length > 0;
        let passwordMatch = newPassword === passwordConfirmation;
        if (firstnameDone && lastnameDone && phoneDone && mobileDone && birthdayDone && addressDone && documentDone
            && cityDone && emailDone && new_passwordDone && password_confirmationDone) {
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
    let pricesArea = $('#prices-area');
    pricesArea.text('');
    let selectedCoursesRaw = $('#courses').val();
    let elementsToAppend = '';
    for (let i=0; i<selectedCoursesRaw.length; i++) {
        elementsToAppend += '<div class="row">\n' +
            '\t<div class="input-field col l6 m6 s12">\n' +
            //'\t\t<i class="material-icons prefix">attach_money</i>\n' +
            '\t\t<input type="text" name="price' + selectedCoursesRaw[i].substring(0, selectedCoursesRaw[i].indexOf(':'))
            +'" id="price' + selectedCoursesRaw[i].substring(0, selectedCoursesRaw[i].indexOf(':')) + '" >\n' +
            '\t\t<label for="price">¿Cuál es el valor promedio por hora de clase de ' +
            selectedCoursesRaw[i].substring(selectedCoursesRaw[i].indexOf(':') + 1) + '?</label>\n' +
            '\t</div>\n' +
            '</div>'
    }
    pricesArea.append(elementsToAppend);
}

function submitForm() {
    if ($('#about').val().length > 0 && $('#like').val().length > 0 && $('#howKnew').val().length > 0) {
        if ($('#facebook').val().length > 0 || $('#twitter').val().length > 0 || $('#linkedin').val().length > 0 ||
            $('#blog').val().length > 0 || $('#website').val().length > 0) {
            if ($('#terms').is(':checked')) {
                //Submit form
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