$(document).ready(function() {
	$('.entry').mouseover(function() {
	    $(this).css({'background-color':'#e7e7e7'});
	}).mouseout(function() {
		$(this).css({'background-color':'#ffffff'});
	});
	
	$(function() {
		var dialog, form,
		  firstName = $( "#firstName" ),
		  lastName = $( "#lastName" ),
		  phoneNumber = $( "#phoneNumber" ),
		  allFields = $( [] ).add( firstName ).add( lastName ).add( phoneNumber ),
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
				var staff_data = {"role":$('#role').val(), "admin":$('#admin').val(), 
								  "firstName":$('#firstName').val(), "lastName":$('#lastName').val(),
								  "cellNumber":$('#cellNumber').val(), "homeNumber":$('#homeNumber').val(), 
								  "pager":$('#pager').val(), "netID":$('#netID').val() };
				$.ajax({
                    url:"/addStaff",
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
           
		$( "#create-user" ).button().on( "click", function() {
            dialog.dialog( "open" );
		});
        $(".delete-staff").button().on("click", function(e) {
            console.log($(this).attr('id'));
            var id = $(this).attr('id');
            e.preventDefault();
            deleteDialog = $( "#delete-dialog" ).dialog({
                autoOpen: false,
                height: 100,
                width: 200,
                modal: true,
                buttons: {
                    "Delete": function() {
                        var data  = { "userID" : id };
                        $.ajax({
                            url:"/deleteStaff",
                            type:"POST",
                            contentType:"application/json",
                            dataType:"json",
                            data: JSON.stringify(data),
                        });
                        deleteDialog.dialog("close");
                        window.location.reload(true);
                    },
                    Cancel: function() {
                        deleteDialog.dialog("close");
                    }
                }
            });
            deleteDialog.dialog("open");
        });
	});
});
