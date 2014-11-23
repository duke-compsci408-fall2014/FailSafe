$(document).ready(function() {
    var alertFrequency = 30000; //30 seconds
    var alertingIDs = {};
    var showCancel = false;

    function createAlertDialog(buttonsList, form, height, width) {
		return {
			autoOpen: false,
			height: height,
			width: width,
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
		var alert_data = {
			"eta":$('#eta').val(),
			"location":$('#location').val(),
			"type":$('#type').val(),
			"msg":$('#msg').val()
		};
		alertAJAXJSONWrapper("POST", "/backend/start_alert", alert_data);
        var pending = alertAJAXGetWrapper("/backend/pending_staff");
        console.log(Object.keys(pending))

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
		
        $alertDialog.dialog( "close" );
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
            }
            alertAJAXJSONWrapper("POST", "/backend/contact", data);
        }
    }

	var alertButtons = {
		"Send SMS": alertOnCall,
		Cancel: alertCancel 
	};

	function alertCancel() {
		$(this).dialog("close");
	}

	var $alertDialog = $("#alert-form").dialog(createAlertDialog(alertButtons, alertForm, 275, 350));

	var alertForm = $alertDialog.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
	});

	$('#alert-button').click( function() {
		$alertDialog.dialog('open');
	});
 
    $('#cancel-alert-button').click( function() {
        alert("Alert successfully cancelled. No more messages will be sent.");
        cancelAll();
    });

    function cancelAll() {
        for(var id in alertingIDs) {
            clearInterval(alertingIDs[id]);
        }
    }
});
