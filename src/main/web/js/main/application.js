$(function() {
    if (isPartyTime) {
        var $button = $('<button>').attr({
            id: 'party-time',
            class: 'btn btn-default navbar-btn'
        }).text('Party').click(function() {
            $('body').css('background-color', 'red');
        });
        $('#navbar').find('.nav').append($('<li/>').append($button));
    }
});