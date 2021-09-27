$(document).ready(function(){
    $(".register").click(function(){
        $(".other").show();
        $(".content").hide();
        $(".register").addClass('active');
        $(".login").removeClass('active');
    });
    $(".login").click(function(){
        $(".content").show();
        $(".other").hide();
        $(".login").addClass('active');
        $(".register").removeClass('active');
    });

});