$(document).ready(function() {
    $('.entry').mouseover(function() {
        $(this).css({'background-color':'#e7e7e7'});
    }).mouseout(function() {
        $(this).css({'background-color':'#ffffff'});
    });
    


//    $(function() {
        addStaff = function() {
            var staff_data = {"role":$('#role').val(), "admin":$('#admin').val(), 
                                  "firstName":$('#firstName').val(), "lastName":$('#lastName').val(),
                                  "cellNumber":$('#cellNumber').val(), "homeNumber":$('#homeNumber').val(), 
                                  "pager":$('#pager').val(), "netID":$('#netID').val() };
            var valid = true;
            var count = 0;
            var errorMessage = "";
            for(var key in staff_data){
                data = staff_data[key];
                if(!data) {
                    errorMessage = "All fields are required";
                    valid = false;
                    break;
                }
                
                // cell/home phone number check
                else if(count == 4 || count == 5) {
                    if(data.length != 12 || data.substring(0,2) != "+1" || !$.isNumeric(data.substring(1))) {
                        errorMessage = "Phone numbers must be in the form '+19876543210'";
                        valid = false;
                        break;
                    }
                }
                // pager number check
                else if(count == 6) {
                    if(data.length != 10 || !$.isNumeric(data.substring(1))) {
                        errorMessage = "Pager number must be in the form '9876543210'";
                        valid = false;
                        break;
                    }
                }
                count++;

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
                alert(errorMessage);
            }

        }

        dialog = $( "#dialog-form" ).dialog({
                autoOpen: false,
                height: 400,
                width: 350,
                modal: true,
                buttons: {
                    "Add Staff": addStaff,
                    Cancel: function() {
                        $(this).find('form')[0].reset();
                        dialog.dialog( "close" );
                        window.location.reload(true);
                    }
                },
                close: function() {
                    $(this).find('form')[0].reset();
                    dialog.dialog( "close" );
                    window.location.reload(true);
                }
            });
       

        $( "#create-user" ).button().on( "click", function() {
            
            dialog.dialog( "open" );

            //adding user by pressing enter in the add dialog
            $("#directory-form").keypress(function(e) {
                if(e.which == 13) {
                    e.preventDefault();
                    addStaff();  
                }
            });
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

            editStaff = function() {
                var staff_data = {"prevNetid":prevNetid, "role":$('#role').val(), "admin":$('#admin').val(),
                                      "firstName":$('#firstName').val(), "lastName":$('#lastName').val(),
                                      "cellNumber":$('#cellNumber').val(), "homeNumber":$('#homeNumber').val(),
                                      "pager":$('#pager').val(), "netID":$('#netID').val()};
                var valid = true;
                var count = 0;
                var errorMessage = "";
                for(var key in staff_data){
                    data = staff_data[key];
                    if(!data) {
                        errorMessage = "All fields are required";
                        valid = false;
                        break;
                    }
                
                    // cell/home phone number check
                    else if(count == 5 || count == 6) {
                        if(data.length != 12 || data.substring(0,2) != "+1" || !$.isNumeric(data.substring(1))) {
                            errorMessage = "Phone numbers must be in the form '+19876543210'";
                            valid = false;
                            break;
                        }
                    }
                    // pager number check
                    else if(count == 7) {
                        if(data.length != 10 || !$.isNumeric(data.substring(1))) {
                            errorMessage = "Pager number must be in the form '9876543210'";
                            valid = false;
                            break;
                        }
                    }
                    count++;
                }

                
                if(valid) {
                    $.ajax({
                        url:"/directory/editStaff",
                        type: "POST",
                        contentType:"application/json",
                        dataType:"json",
                        data: JSON.stringify(staff_data),
                    }); 
                    edit_dialog.dialog( "close" );
                    window.location.reload(true);
                } else {
                    alert(errorMessage);
                }
            }
            
            edit_dialog = $( "#dialog-form" ).dialog({
                autoOpen: false,
                height: 400,
                width: 350,
                modal: true,
                buttons: {
                    "Edit Staff": editStaff,
                    Cancel: function() {
                        $(this).find('form')[0].reset();
                        edit_dialog.dialog( "close" );
                        window.location.reload(true);
                    }
                },
                close: function() {
                    $(this).find('form')[0].reset();
                    edit_dialog.dialog( "close" );
                    window.location.reload(true);
                }
            });
            edit_dialog.dialog("open");

            // editing staff entry by presing enter in the dialog
            $("#directory-form").keypress(function(e) {
                if(e.which == 13) {
                    e.preventDefault();
                    editStaff();
                }
            });
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
  //  });
});

$(document).keypress(function(e) { 
    if (e.keyCode == 27) { 
        window.close();
    } 
});
