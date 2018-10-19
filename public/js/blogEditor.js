$(function () {
    $('#body').trigger('autoresize');
});

function toggleSelection(clickedObject) {
    let object = $(clickedObject);
    if (object.hasClass('black-text')) {
        object.removeClass('black-text').addClass('white-text blue');
    } else {
        object.removeClass('white-text blue').addClass('black-text');
    }
    if (object.attr('id') === 'alignRight') {
        $('#alignLeft').removeClass('white-text blue').addClass('black-text');
        $('#alignCenter').removeClass('white-text blue').addClass('black-text');
        $('#alignJustify').removeClass('white-text blue').addClass('black-text');
    } else if (object.attr('id') === 'alignLeft') {
        $('#alignRight').removeClass('white-text blue').addClass('black-text');
        $('#alignCenter').removeClass('white-text blue').addClass('black-text');
        $('#alignJustify').removeClass('white-text blue').addClass('black-text');
    } else if (object.attr('id') === 'alignCenter') {
        $('#alignLeft').removeClass('white-text blue').addClass('black-text');
        $('#alignRight').removeClass('white-text blue').addClass('black-text');
        $('#alignJustify').removeClass('white-text blue').addClass('black-text');
    } else if (object.attr('id') === 'alignJustify') {
        $('#alignLeft').removeClass('white-text blue').addClass('black-text');
        $('#alignCenter').removeClass('white-text blue').addClass('black-text');
        $('#alignRight').removeClass('white-text blue').addClass('black-text');
    }
    performAction(object);
}

function performAction(object) {
    let textField = $('#body');
    if (object.attr('id') === 'bold') {
        if (object.hasClass('white-text')) {
            insertTag(textField, '<strong>');
        } else {
            insertTag(textField, '</strong>');
        }
    } else if (object.attr('id') === 'italic') {
        if (object.hasClass('white-text')) {
            insertTag(textField, '<i>');
        } else {
            insertTag(textField, '</i>');
        }
    } else if (object.attr('id') === 'underline') {
        if (object.hasClass('white-text')) {
            insertTag(textField, '<ins>');
        } else {
            insertTag(textField, '</ins>');
        }
    } else if (object.attr('id') === 'alignLeft') {
        if (object.hasClass('white-text')) {
            insertTag(textField, '<div align="left">');
        } else {
            insertTag(textField, '</div>');
        }
    } else if (object.attr('id') === 'alignCenter') {
        if (object.hasClass('white-text')) {
            insertTag(textField, '<div align="center">');
        } else {
            insertTag(textField, '</div>');
        }
    } else if (object.attr('id') === 'alignRight') {
        if (object.hasClass('white-text')) {
            insertTag(textField, '<div align="right">');
        } else {
            insertTag(textField, '</div>');
        }
    } else if (object.attr('id') === 'alignJustify') {
        if (object.hasClass('white-text')) {
            insertTag(textField, '<div align="justify">');
        } else {
            insertTag(textField, '</div>');
        }
    } else if (object.attr('id') === 'textColor') {

    }
}

function insertTag(textField, tag) {
    //MOZILLA and others
    if (textField.prop('selectionStart') || textField.prop('selectionStart') === '0') {
        let startPos = textField.prop('selectionStart');
        let endPos = textField.prop('selectionEnd');
        textField.val(textField.val().substring(0, startPos)
            + tag
            + textField.val().substring(endPos, textField.val().length))
    } else {
        textField.val(textField.val() + tag);
    }
}