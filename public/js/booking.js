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
    $('#monday-date').text(week[0].getDate());
    $('#monday-month').text(monthNames[week[0].getMonth()]);
    $('#monday-year').text(week[0].getFullYear());
    $('#sunday-date').text(week[6].getDate());
    $('#sunday-month').text(monthNames[week[6].getMonth()]);
    $('#sunday-year').text(week[6].getFullYear());
    $('#monday-header').text(week[0].getDate());
    $('#tuesday-header').text(week[1].getDate());
    $('#wednesday-header').text(week[2].getDate());
    $('#thursday-header').text(week[3].getDate());
    $('#friday-header').text(week[4].getDate());
    $('#saturday-header').text(week[5].getDate());
    $('#sunday-header').text(week[6].getDate());
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
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
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
    setTotal();
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
    let discountPerStudent = Number($('#discountPerStudent').val());
    total = pricePerHour * selectedArray.length * numberOfStudents;
    $('#total').text(total);
    $('#totalInput').val(total);
    Materialize.toast('La cuenta va en: $' + total, 1500);
}