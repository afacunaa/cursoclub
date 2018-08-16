/**
 * Created by andres on 05/07/2018.
 */


$(document).ready(function() {
    scrollDownConversation();
    textAreaEnter();
});
function scrollDownConversation() {
    let div = $('#messages-area');
    div.scrollTop(div[0].scrollHeight);
}
function textAreaEnter() {
    let textArea = $('#message');
    textArea.keydown(function(event) {
        if (event.keyCode == 13) {
            if (textArea.val().trim()) {
                this.form.submit();
                return false;
            }
        }
    });
}