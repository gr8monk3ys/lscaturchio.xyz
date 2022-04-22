// Sets the scroll reveal functionality
ScrollReveal({
	reset: true,
	distance: '60px',
	duration: 2500,
	delay: 400
  });

// Reveals my name in a fancy way
ScrollReveal().reveal('#first-name', {delay: 700, origin: 'left'});
ScrollReveal().reveal('#last-name', {delay: 700, origin: 'right'});
ScrollReveal().reveal('.content', {delay: 700, origin: 'bottom'});

// About me section revealed in a fancy way
ScrollReveal().reveal('.category', {delay: 600, origin: 'top'});
ScrollReveal().reveal('.text', {delay: 600, origin: 'bottom'});

// Making gallery reveal in a fancy way
ScrollReveal().reveal('#gallery', {delay: 600, origin: 'top'});
ScrollReveal().reveal('.images', {delay: 600, origin: 'left'});

const cursor = document.querySelector('.cursor');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.pageX + 'px';
    cursor.style.top = e.pageY + 'px';
})

var tabsNewAnim = $('#navbar-animmenu');
		var selectorNewAnim = $('#navbar-animmenu').find('li').length;
		//var selectorNewAnim = $(".tabs").find(".selector");
		var activeItemNewAnim = tabsNewAnim.find('.active');
		var activeWidthNewAnimWidth = activeItemNewAnim.innerWidth();
		var itemPosNewAnimLeft = activeItemNewAnim.position();
		$(".hori-selector").css({
			"left":itemPosNewAnimLeft.left + "px",
			"width": activeWidthNewAnimWidth + "px"
		});
		$("#navbar-animmenu").on("click","li",function(e){
			$('#navbar-animmenu ul li').removeClass("active");
			$(this).addClass('active');
			var activeWidthNewAnimWidth = $(this).innerWidth();
			var itemPosNewAnimLeft = $(this).position();
			$(".hori-selector").css({
				"left":itemPosNewAnimLeft.left + "px",
				"width": activeWidthNewAnimWidth + "px"
			});
		});

$(document).ready(function() {
	$("#fullpage").fullpage({
		anchors: ["firstPage", "secondPage", "thirdPage"],
		menu: "#menu",
		autoScrolling:false
	});
});

var controller = new ScrollMagic.Controller();

var scene = new ScrollMagic.Scene({
	triggerElement: "#section2"
})
.setTween("#bg img", {
	maxWidth: "1200px",
	top: "37%",
	left: "80%",
    opacity: 1
})
.addTo(controller);

var scene = new ScrollMagic.Scene({
	triggerElement: "#section3",
})

.setTween("#bg img", {
    top: "37%",
    left: "100%",
	opacity: 0.25
}
)
.addTo(controller);

var scene = new ScrollMagic.Scene({
	triggerElement: "#about"
})
.setTween("p", {
	
})
