/**
 * Created by andres on 13/05/17.
 */


$(document).ready(function(){
    $('.modal').modal();
    $(".button-collapse").sideNav({
        draggable: true
    });
});
$(document).ready(function() {
    $('select').material_select();
});
$('.datepicker').pickadate({
    format:'yyyy-mm-dd',
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 80, // Creates a dropdown of 15 years to control year
    monthsFull: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    weekdaysFull: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
    today: 'Hoy',
    clear: 'Cancelar',
    close: false,
    closeOnSelect: true,
    max: true,
    onSet: function (ele) {
        if(ele.select){
            this.close();
        }
    }
});
$(document).ready(function(){
    $('.collapsible').collapsible();
});
$(document).ready(function(){
    $('.slider').slider({ height: 550 });
});

$(document).ready(function(){
    $('.tooltipped').tooltip({delay: 50});
});
$('#old_password').on('keyup', function () {
    if ( $('#old_password').val() === '' ){
        $('#new_password').prop('disabled', true);
        $('#password_confirmation').prop('disabled', true);
    } else {
        $('#new_password').prop('disabled', false);
        $('#password_confirmation').prop('disabled', false);
    }
});
$('#password_confirmation').on('keyup', function () {
    if ($('#new_password').val() === $('#password_confirmation').val()) {
        $('#message').html('Las contraseñas coinciden').css('color', 'green');
    } else
        $('#message').html('La contraseña no coincide').css('color', 'red');
});
function checkStar(id) {
    let starValueInput = $('#score');
    for (let i=0; i<=5; i++) {
        $('#star'+i).removeClass('yellow-text').text('star_border');
        starValueInput.val(0);
    }
    for (let i=0; i<=id; i++){
        $('#star'+i).addClass('yellow-text').text('star');
        starValueInput.val(id);
    }
}