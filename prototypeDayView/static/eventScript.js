$(document).ready(function() {
	var	sub = $("#sub"),
	  faculty = $( "#faculty" ),
	  fellow = $( "#fellow" ),
	  rn1 = $( "#rn1" ),
	  rn2 = $( "#rn2" ),
	  tech1 = $("#tech1"),
	  tech2 = $("#tech2"),
	  allFields = $( [] ).add( faculty ).add( fellow ).add( rn1 ).add( rn2 ).add( tech1 ).add( tech2 ),
	  tips = $( ".validateTips" );
	var clickedSquare;

	function updateTips( t ) {
	  tips
		.text( t )
		.addClass( "ui-state-highlight" );
	  setTimeout(function() {
		tips.removeClass( "ui-state-highlight", 1500 );
	  }, 500 );
	}

	function checkLength( o, name, max ) {
	  if ( o.val().length === 0 ) {
		o.addClass( "ui-state-error" );
		updateTips( "" + name + " is a required field.");
		return false;
	  } 
	  else if ( o.val().length > max) {
		o.addClass( "ui-state-error" );
		updateTips( "" + name + " must be less than " + max + " characters.");
	  }
	  else {
		return true;
	  }
	}

	function checkRegexp( o, regexp, n ) {
	  if ( !( regexp.test( o.val() ) ) ) {
		o.addClass( "ui-state-error" );
		updateTips( n );
		return false;
	  } else {
		return true;
	  }
	}
	
	function jeffTest() {
		var test_data = {
			"eta":$('#eta').val(),
			"location":$('#location').val(),
			"type":$('#type').val(),
			"msg":$('#msg').val(),	
		}
		$.ajax({
			url:"colab-sbx-131.oit.duke.edu:5001/test_send_template_sms",
			type: "POST",
			contentType:"application/json",
			dataType:"json",
			data: JSON.stringify(test_data)
		});
		$jeffTest.dialog( "close" );
	}
	
	function addSub() {
		var valid = true;
		allFields.removeClass( "ui-state-error" );
		
		/*
		 * repeated code here is temporary
		 * trying to learn javascript :p
		 */
		valid = valid && checkLength(sub, "Substitute", 80);
		valid = valid && checkRegexp( sub, /^([a-zA-Z])+$/, "Substitute name must only include a-z" );
		
		if(valid) {
			var sub_data = {
				"sub":$('#sub').val()
			};
			$.ajax({
				url:"/addSub",
				type: "POST",
				contentType:"application/json",
				dataType:"json",
				data: JSON.stringify(sub_data)
			});
			clickedSquare.innerHTML = "SUB: " + $('#sub').val();
			$subDialog.dialog( "close" );
		}
	}

	function addFull() {
		var valid = true;
		allFields.removeClass( "ui-state-error" );
		
		/*
		 * repeated code here is temporary
		 * trying to learn javascript :p
		 */
		valid = valid && checkLength(faculty, "Faculty", 80);
		valid = valid && checkLength(fellow, "Fellow", 80);
		valid = valid && checkLength(rn1, "RN1", 80);
		valid = valid && checkLength(rn2, "RN2", 80);
		valid = valid && checkLength(tech1, "Tech1", 80);
		valid = valid && checkLength(tech2, "Tech2", 80);
		
		valid = valid && checkRegexp( faculty, /^([a-zA-Z])+$/, "Faculty name must only include a-z" );
		valid = valid && checkRegexp( fellow, /^([a-zA-Z])+$/, "Fellow name must only include a-z" );
		valid = valid && checkRegexp( rn1, /^([a-zA-Z])+$/, "Nurse name must only include a-z" );
		valid = valid && checkRegexp( rn2, /^([a-zA-Z])+$/, "Nurse name must only include a-z" );
		valid = valid && checkRegexp( tech1, /^([a-zA-Z])+$/, "Tech name must only include a-z" );
		valid = valid && checkRegexp( tech2, /^([a-zA-Z])+$/, "Tech name must only include a-z" );
		
		if(valid) {
			var oncall_data = {
				"date":$('#date').val(),
				"faculty":$('#faculty').val(), 
				"fellow":$('#fellow').val(), 
				"rn1":$('#rn1').val(), 
				"rn2":$('#rn2').val(),
				"tech1":$('#tech1').val(), 
				"tech2":$('#tech2').val() 
			};
			$.ajax({
				url:"/addCall",
				type: "POST",
				contentType:"application/json",
				dataType:"json",
				data: JSON.stringify(oncall_data)
			});
			clickedSquare.innerHTML = "Covered!";
			$fullDialog.dialog( "close" );
			window.location.reload(true);
		}
	}

	var $subDialog = $( "#substitution-form" ).dialog({
	  autoOpen: false,
	  height: 400,
	  width: 350,
	  modal: true,
	  buttons: {
		"Create event": addSub,
		Cancel: function() {
		  $subDialog.dialog( "close" );
		}
	  },
	  close: function() {
		subForm[ 0 ].reset();
		allFields.removeClass( "ui-state-error" );
	  }
	});
	
	var $fullDialog = $( "#full-form" ).dialog({
	  autoOpen: false,
	  height: 800,
	  width: 350,
	  modal: true,
	  buttons: {
		"Create event": addFull,
		Cancel: function() {
		  $fullDialog.dialog( "close" );
		}
	  },
	  close: function() {
		fullForm[ 0 ].reset();
		allFields.removeClass( "ui-state-error" );
	  }
	});
	
	var $jeffTest = $( "#test-form" ).dialog({
	  autoOpen: false,
	  height: 800,
	  width: 350,
	  modal: true,
	  buttons: {
		"Send SMS": jeffTest,
		Cancel: function() {
		  $jeffTest.dialog( "close" );
		}
	  },
	  close: function() {
		fullForm[ 0 ].reset();
		allFields.removeClass( "ui-state-error" );
	  }
	});
	
    var subForm = $subDialog.find( "form" ).on( "submit", function( event ) {
      event.preventDefault();
    });
	
    var fullForm = $fullDialog.find( "form" ).on( "submit", function( event ) {
      event.preventDefault();
    });
	
    var fullForm = $jeffTest.find( "form" ).on( "submit", function( event ) {
      event.preventDefault();
    });

	$('#alert-button').click( function() {
		$jeffTest.dialog('open');
	});

    $('.inside').click(function(event) {
		clickedSquare = event.target || event.srcElement;
    	$subDialog.dialog('open');
		$('#start').val(clickedSquare.id);
    });
	
	$( ".day" ).click(function(event) {
		clickedSquare = event.target || event.srcElement;
		$fullDialog.dialog("open");
		$('#date').val(clickedSquare.id);
	});
});
