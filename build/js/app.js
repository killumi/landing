'use strict';

$(document).ready(function () {
    $('.js-reviews-slider').slick({
        dots: true,
        arrows: false,
        infinite: true,
        adaptiveHeight: true,
        autoplay: true
    });

    $(function () {
        var users = ['40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50'];
        var element = $('.js-online-counter');
        setInterval(function () {
            $(element).text(users[Math.random().toFixed(1) * 10]);
        }, 4000);
    });

    var popup = $('.popup-overlay');

    $('.js-open-popup').on('click', function () {
        $(popup).toggleClass('active');
    });

    $('.js-popup__close-btn').on('click', function () {
        $(popup).toggleClass('active');
    });
});