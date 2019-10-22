$( document ).ready(function() {
    $('.install').click(function(){
        var shopUrl = $('.shopurl').val();
        window.location.href = "http://localhost:3000/shopify/install?shop="+shopUrl;
    });
});