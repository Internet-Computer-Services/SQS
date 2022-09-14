$(document).ready(function () {
  // Mobile Menu control
  $("#mobile-menu-icon").click(function () {
    $("#menu").toggleClass("active");
    $(this).toggleClass("cross");
  });
});
