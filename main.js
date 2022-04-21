const cursor = document.querySelector('.cursor');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.pageX + 'px';
    cursor.style.top = e.pageY + 'px';
})

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