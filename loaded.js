(function(){
	var webPath = 'localhost:3656';
	setTimeout( ()=> {
		var socket = io.connect("http://" + webPath + "/");
		var str = "<div class='gcs__parent' style='background: #e4e4e4;height20px;with:100%;position: fixed;top: 0;left:0;right:0;z-index:99999'>\
		<button class='gcs__select_eleemnt'>Send to APP 'Hi' </button><div>";
		$("body").append(str);
		
		$('.gcs__parent>.gcs__select_eleemnt').on('click', function(){
			socket.emit('watch-browser', 'Hi..!');
		});
		
		socket.on('watch-app' , function(msg) {
			alert(msg);
		});
	},1000);
})()