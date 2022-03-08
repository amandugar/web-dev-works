$(window).on("scroll", function() {
    if($(window).scrollTop()) {
          $('nav').addClass('bg-dark');
          $('#navbarNavDropdown').addClass('bg-dark');
    }

    else {
          $('nav').removeClass('bg-dark');
          $('#navbarNavDropdown').removeClass('bg-dark');
    }
})