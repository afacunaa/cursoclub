let selectedArray = [];
let selectedDatesArray = [];
let total = 0;

function switchWeek(direction, stringWeek) {
    let offset = $('#offset');
    let displacement = Number(offset.val()) + Number(direction);
    if (displacement < 4){
        $('#nextWeek').removeClass('disabled');
    } else if (displacement === 4) {
        $('#nextWeek').addClass('disabled');
    }
    if (displacement === 0){
        $('#previousWeek').addClass('disabled');
    } else if (displacement > 0) {
        $('#previousWeek').removeClass('disabled');
    }
    offset.val(displacement);
    let week = [];
    for (let i=0; i<stringWeek.length; i++) {
        week[i] = addDays(new Date(stringWeek[i]), 7 * displacement);
    }
    $('#week').val(week);
    updateView(week);
}

function updateView(week) {
    let monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    $('#monday-date').text(week[0].getUTCDate());
    $('#monday-month').text(monthNames[week[0].getUTCMonth()]);
    $('#monday-year').text(week[0].getUTCFullYear());
    $('#sunday-date').text(week[6].getUTCDate());
    $('#sunday-month').text(monthNames[week[6].getUTCMonth()]);
    $('#sunday-year').text(week[6].getUTCFullYear());
    $('#monday-header').text(week[0].getUTCDate());
    $('#tuesday-header').text(week[1].getUTCDate());
    $('#wednesday-header').text(week[2].getUTCDate());
    $('#thursday-header').text(week[3].getUTCDate());
    $('#friday-header').text(week[4].getUTCDate());
    $('#saturday-header').text(week[5].getUTCDate());
    $('#sunday-header').text(week[6].getUTCDate());
    let schedule = JSON.parse("["+$('#schedule').val()+"]");
    let notAvailable = $('#notAvailable').val().split(',');
    let mustChange = $('#mustChange').val().split(',');
    let hoursADay = Number($('#hoursADay').val());
    let displacement = $('#offset').val();
    let id;
    for (let i=0; i<hoursADay; i++){
        for (let j=0; j<7; j++) {
            id = i + (hoursADay * j);
            if (schedule.indexOf(id) > -1) {
                if (notAvailable.indexOf(displacement + '' + id) > -1 || week[j] < new Date()) {
                    $('#d' + id).removeClass().addClass('btn red darken-4');
                    $('#i' + id).text('event_busy');
                } else if (selectedArray.indexOf(displacement + '<d' + id) > -1) {
                    $('#d' + id).removeClass().addClass('btn green');
                    $('#i' + id).text('event_available');
                } else if (mustChange.indexOf(displacement + '' + id) > -1) {
                    $('#d' + id).removeClass().addClass('btn orange');
                    $('#i' + id).text('event_busy');
                } else {
                    $('#d' + id).removeClass().addClass('btn white');
                    $('#i' + id).text('event_available');
                }
            }
        }
    }
}

function addDays(date, days) {
    return new Date(date.getTime() + (days * 24 * 60 * 60 * 1000) + (date.getTimezoneOffset() * 60 * 1000));
}

function selectCell(id, dayOfWeek, hour, stringWeek) {
    let selected = $('#'+id);
    let displacement = $('#offset').val();
    let week = [];
    for (let i=0; i<stringWeek.length; i++) {
        week[i] = addDays(new Date(stringWeek[i]), 7 * displacement);
    }
    let selectedDate = week[dayOfWeek];
    selectedDate.setHours(hour);
    selectedDate.setMinutes(0);
    selectedDate.setSeconds(0);
    selectedDate.setMilliseconds(0);
    if (selected.hasClass('white')) {
        selected.removeClass('white').addClass('green');
        selectedArray.push(displacement+'<'+id);
        selectedDatesArray.push(selectedDate);
    } else if (selected.hasClass('green')) {
        selected.removeClass('green').addClass('white');
        let index = selectedArray.indexOf(displacement+'<'+id);
        selectedArray.splice(index, 1);
        index = findDateIndex(selectedDate);
        selectedDatesArray.splice(index, 1);
    }
    $('#selectedDates').val(selectedDatesArray);
    //setTotal();
}

function findDateIndex(date) {
    for (let i=0; i<selectedDatesArray.length; i++){
        if (selectedDatesArray[i].getHours() === date.getHours() && selectedDatesArray[i].getDate() === date.getDate() && selectedDatesArray[i].getMonth() === date.getMonth() && selectedDatesArray[i].getFullYear() === date.getFullYear()){
            return i;
        }
    }
    return -1;
}

function changeMoreStudents() {
    setTotal();
}

function setTotal() {
    let pricePerHour = Number($('#pricePerHour').text());
    let numberOfStudents = Number($('#numberOfStudents').val());
    total = pricePerHour * selectedArray.length * numberOfStudents;
    $('#total').text(total);
    $('#totalInput').val(total);
    let difference = $('#mustChange').val().split(',').length - selectedArray.length;
    if ($('#edit').val() && difference >= 0) {
        if (difference > 1) {
            //Materialize.toast('Debes seleccionar ' + difference + ' clases más', 1500);
            $('#submit-button').prop('disabled', true);
        } else if (difference === 1) {
            //Materialize.toast('Debes seleccionar ' + difference + ' clase más', 1500);
            $('#submit-button').prop('disabled', true);
        } else {
            //Materialize.toast('Ya modificaste las clases que debías cambiar, sin embargo puedes añadir más', 3000);
            $('#submit-button').prop('disabled', false);
        }
    } else {
        //Materialize.toast('La cuenta va en: $' + total, 1500);
    }
}