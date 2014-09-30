$(document).ready(function() {
	
	$(function() {
		var dialog, form,
		  faculty = $( "#faculty" ),
		  fellow = $( "#fellow" ),
		  allFields = $( [] ).add( faculty ).add( fellow ),
		  tips = $( ".validateTips" );

		function updateTips( t ) {
		  tips
			.text( t )
			.addClass( "ui-state-highlight" );
		  setTimeout(function() {
			tips.removeClass( "ui-state-highlight", 1500 );
		  }, 500 );
		}

		function checkLength( o, n, min, max ) {
		  if ( o.val().length > max || o.val().length < min ) {
			o.addClass( "ui-state-error" );
			updateTips( "Length of " + n + " must be between " +
			  min + " and " + max + "." );
			return false;
		  } else {
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

		// function addUser() {
		//   var valid = true;

		//   if ( valid ) {
		// 	$( "#staff tbody" ).append( "<tr>" +
		// 	  "<td>" + firstName.val() + "</td>" +
		// 	  "<td>" + lastName.val() + "</td>" +
		// 	  "<td>" + phoneNumber.val() + "</td>" +
		// 	"</tr>" );
		// 	allFields.removeClass( "ui-state-error" );
		// 	dialog.dialog( "close" );
		//   }
		//   return valid;
		// }

		dialog = $( "#dialog-form" ).dialog({
		  autoOpen: false,
		  height: 300,
		  width: 350,
		  modal: true,
		  buttons: {
			"Create user": function() {
				var staff_data = {"faculty":$('#faculty').val(), "fellow":$('#fellow').val(), 
								  "rn1":$('#rn1').val(), "rn2":$('#rn2').val(),
								  "tech1":$('#tech1').val(), "tech2":$('#tech2').val() };
				$.ajax({
                    url:"/addEvent",
                    type: "POST",
                    contentType:"application/json",
                    dataType:"json",
                    data: JSON.stringify(staff_data),
          		});
          		dialog.dialog( "close" );
          		window.location.reload(true);
          	
			},
			Cancel: function() {
			  dialog.dialog( "close" );
			}
		  },
		  close: function() {
			form[ 0 ].reset();
			allFields.removeClass( "ui-state-error" );
		  }
		});

		form = dialog.find( "form" ).on( "submit", function( event ) {
		  // event.preventDefault();
		  // addUser();
		});

		$( "#create-event" ).button().on( "click", function() {
		  dialog.dialog("open");
		});
	});
});