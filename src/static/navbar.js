$(document).ready(function() {
    var alertFrequency = 30000; //30 seconds
    var alertingIDs = {};
    var showCancel = false;

    function createAlertDialog(buttonsList, form) {
		return {
			autoOpen: false,
			height: 'auto',
			width: 350,
			modal: true,
			buttons: buttonsList,
			close: function() {
				//allAlertFields.removeClass("ui-state-error");
			}
		};
	}
    
    function alertAJAXGetWrapper(endpoint) {
		var info;
		$.ajax({
			url:endpoint,
			async:false,
			dataType:'json',
			success: function(json) {
				info = json.results;
			}
		});
		return info;
    }

	function alertAJAXJSONWrapper(method, url, data) {
		$.ajax({
			async: false,
			url: url,
			type: method,
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify(data)
		});
	}

	function alertOnCall() {
        alert("Activation initiated.");
        $alertDialog.dialog( "close" );
		var alert_data = {
			"eta":$('#eta').val(),
			"location":$('#location').val(),
			"type":$('#type').val(),
			"msg":$('#msg').val()
		};
		alertAJAXJSONWrapper("POST", "/backend/start_alert", alert_data);
        var pending = alertAJAXGetWrapper("/backend/pending_staff");
        console.log(Object.keys(pending));
        
        for(i = 0; i < 6; i++) {
            var keys = Object.keys(pending);
            call(keys[i]);
        }

        var keys = Object.keys(pending)
        alertingIDs[keys[0]] = setInterval(function() {
            console.log("calling: " + keys[0])
            call(keys[0])
        }, alertFrequency);
        var keys = Object.keys(pending)
        alertingIDs[keys[1]] = setInterval(function() {
            console.log("calling: " + keys[1])
            call(keys[1])
        }, alertFrequency);
        var keys = Object.keys(pending)
        alertingIDs[keys[2]] = setInterval(function() {
            console.log("calling: " + keys[2])
            call(keys[2])
        }, alertFrequency);
        var keys = Object.keys(pending)
        alertingIDs[keys[3]] = setInterval(function() {
            console.log("calling: " + keys[3])
            call(keys[3])
        }, alertFrequency);
        var keys = Object.keys(pending)
        alertingIDs[keys[4]] = setInterval(function() {
            console.log("calling: " + keys[4])
            call(keys[4])
        }, alertFrequency);
        var keys = Object.keys(pending)
        alertingIDs[keys[5]] = setInterval(function() {
            console.log("calling: " + keys[5])
            call(keys[5])
        }, alertFrequency);
		
	}

    function call(id) {
        var pending = alertAJAXGetWrapper("/backend/pending_staff");
        console.log(id);
        if(pending[id] == -1){
            clearInterval(alertingIDs[id]);
        }
        else {
            var data = {
                "netID": id
            };
            alertAJAXJSONWrapper("POST", "/backend/contact", data);
        }
    }

    function sendHome(id) {
        var data = {
            "netID": id,
			"msg":$('#deactivate_message').val()
        };
        alertAJAXJSONWrapper("POST", "/backend/deactivate", data);
    }

	var alertButtons = {
		"Activate": function() {
            var doubleCheck = confirm("Activate on call team?");
            if(doubleCheck) {
                alertOnCall();
            }
            else {
                alert("Activation cancelled.");
            }
        },
		Cancel: alertCancel 
	};

	function alertCancel() {
		$(this).dialog("close");
	}

	var $alertDialog = $("#alert-form").dialog(createAlertDialog(alertButtons, alertForm));

	var alertForm = $alertDialog.find( "form" ).on( "submit", function(event) {
		event.preventDefault();
	});

	$('#activate-button').click( function() {
		$alertDialog.dialog('open');
	});

    function deactivate() {
        $deactivateDialog.dialog( "close" );
        alert("Deactivation initiated. Messaging all team members once.");
        cancelAll();
        var team = alertAJAXGetWrapper("/backend/form_team");
        var keys = Object.keys(team);
        for(i = 0; i < 6; i++) {
            sendHome(keys[i]);
        }
    }

	var deactivateButtons = {
		"Send Message": function() {
            var doubleCheck = confirm("Deactivate currently activated team? (will send an alert to all members of activated team)");
            if(doubleCheck) {
                deactivate();
            }
            else {
                alert("Deactivation cancelled.");
            }
        },
		Cancel: alertCancel 
	};

	var $deactivateDialog = $("#deactivate-form").dialog(createAlertDialog(deactivateButtons, deactivateForm));

	var deactivateForm = $deactivateDialog.find( "form" ).on( "submit", function(event) {
		event.preventDefault();
	});

    $('#deactivate-button').click( function() {
        $deactivateDialog.dialog('open');
    });
 
    $('#silence-button').click( function() {
        var doubleCheck = confirm("Stop sending messages to all staff on currently activated team(s)?");
        if(doubleCheck) {
            alert("Alert successfully cancelled. No more messages will be sent.");
            cancelAll();
        }
        else {
            alert("Silence cancelled.");
        }    
    });

    function cancelAll() {
        for(var id in alertingIDs) {
            clearInterval(alertingIDs[id]);
        }
    }
});
