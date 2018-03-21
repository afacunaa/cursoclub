function cleanFields () {
    $('#new-image').empty();
    $('#new-image-info').empty();
    $('#submit-upload').prop('disabled', true);
}

function handleFileSelect(evt) {
    cleanFields();
    let file = evt.target.files[0];
    if (file.type.match('image.*')) {
        //alert('imagen');
        let reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                // Render thumbnail.
                let span = document.createElement('span');
                span.innerHTML = ['' +
                '<img class="responsive-img cc-edit-user-picture-modal" src="', e.target.result,
                    '" title="', theFile.name, '"/>'].join('');
                $('#new-image').append(span);
                let spanText = document.createElement('span');
                if (theFile.size > 6000000){
                    spanText.innerHTML = ['' + '<p class="red-text">El tamaño del archivo es superior a 6mb</p>'];
                    //document.getElementById('new-image-info').insertBefore(spanText, null);
                    $('#new-image-info').append(spanText);
                    $('#file-name').removeClass('valid').addClass('invalid');
                } else {
                    $('#submit-upload').prop('disabled', false);
                    $('#file-name').removeClass('invalid').addClass('valid');
                }
            };
        })(file);
        // Read in the image file as a data URL.
        reader.readAsDataURL(file);
    } else {
        let spanText = document.createElement('span');
        spanText.innerHTML = ['' + '<p class="red-text">Formato de archivo incorrecto, debe ser un archivo de imagen</p>'];
        $('#new-image-info').append(spanText);
        $('#file-name').removeClass('valid').addClass('invalid');
    }
}
document.getElementById('picture-input').addEventListener('change', handleFileSelect, false);