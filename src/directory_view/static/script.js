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
        

		dialog = $( "#dialog-form" ).dialog({
		  autoOpen: false,
		  height: 400,
		  width: 350,
		  modal: true,
		  buttons: {
			"Create Staff": function() {
				var staff_data = {"role":$('#role').val(), "admin":$('#admin').val(), 
								  "firstName":$('#firstName').val(), "lastName":$('#lastName').val(),
								  "cellNumber":$('#cellNumber').val(), "homeNumber":$('#homeNumber').val(), 
								  "pager":$('#pager').val(), "netID":$('#netID').val() };
                var valid = true;
                for(var key in staff_data){
                    data = staff_data[key];
                    if(!data) {
                        valid = false;
                    }
                }
                if(valid) {
				    $.ajax({
                        url:"/directory/addStaff",
                        type: "POST",
                        contentType:"application/json",
                        dataType:"json",
                        data: JSON.stringify(staff_data),
          		    });
              		dialog.dialog( "close" );
              		window.location.reload(true);
                } else {
                    alert("All fields are required.");
                }
          	
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
        $(".edit-staff").button().on("click", function(e) {
            e.preventDefault();
            var id = $(this).attr('id');
            var par = $(this).parent();
            var list = ["#role", "#admin", "#firstName", "#lastName", "#cellNumber", "#homeNumber", "#pager", "#netID"];
            var prevNetid = '';
            var count = 0;
            par.children(".entry-data").each(function() {
                if(count == 7) {
                    $(this).data('prevNetid', $(this).text());
                    prevNetid = $(this).data('prevNetid');
                }
                $(list[count]).val($(this).text());
                count += 1
            });
            
            edit_dialog = $( "#dialog-form" ).dialog({
                autoOpen: false,
                height: 400,
                width: 350,
                modal: true,
                buttons: {
                    "Edit Staff": function() {
                        var staff_data = {"prevNetid":prevNetid, "role":$('#role').val(), "admin":$('#admin').val(),
                                          "firstName":$('#firstName').val(), "lastName":$('#lastName').val(),
                                          "cellNumber":$('#cellNumber').val(), "homeNumber":$('#homeNumber').val(),
                                          "pager":$('#pager').val(), "netID":$('#netID').val()};
                        var valid = true;
                        for(var key in staff_data){
                            data = staff_data[key];
                            if(!data) {
                                valid = false;
                            }
                        }
                        if(valid) {
                            $.ajax({
                                url:"/directory/editStaff",
                                type: "POST",
                                contentType:"application/json",
                                dataType:"json",
                                data: JSON.stringify(staff_data),
                            }); 
                            dialog.dialog( "close" );
                            window.location.reload(true);
                        } else {
                            alert("All fields are required.");
                        }
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
            edit_dialog.dialog("open");
        });

        $(".delete-staff").button().on("click", function(e) {
            console.log($(this).attr('id'));
            var id = $(this).attr('id');
            e.preventDefault();
            deleteDialog = $( "#delete-dialog" ).dialog({
                autoOpen: false,
                height: 100,
                width: 250,
                modal: true,
                buttons: {
                    "Delete": function() {
                        var data  = { "userID" : id };
                        $.ajax({
                            url:"/directory/deleteStaff",
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

$(document).keypress(function(e) { 
    if (e.keyCode == 27) { 
        window.close();
    } 
});
