$(document).ready(function() {
	var sub = $("#sub"),
		faculty = $( "#faculty" ),
		fellow = $( "#fellow" ),
		rn1 = $( "#rn1" ),
		rn2 = $( "#rn2" ),
		tech1 = $("#tech1"),
		tech2 = $("#tech2"),
		allFields = $( [] ).add( faculty ).add( fellow ).add( rn1 ).add( rn2 ).add( tech1 ).add( tech2 ),
		tips = $( ".validateTips" );
	var roles = ["Faculty", "Fellow", "RN1", "RN2", "Tech1", "Tech2"];
	var roleIds = ["faculty", "fellow", "rn1", "rn2", "tech1", "tech2"];
	var clickedSquare;
   	var displayTime = moment();
    var alertFrequency = 30000; //30 seconds
    var alertingIDs = {};

	if(document.getElementById("calendar") != null) {
		document.getElementById("calendar").innerHTML = makeCalendar();
	}
	if(document.getElementById("dayView") != null) {
		document.getElementById("dayView").innerHTML = makeDayView();
	}

    function AJAXGetWrapper(endpoint) {
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

	function getScheduleWithDatetime(endpoint, requestParams) {
		var schedule;
		$.ajax({
			url:endpoint,
			async:false,
			dataType:'json',
			data: requestParams,
			success: function(json) {
				schedule = json.results;
			}
		});
		return schedule;
	}
        
        function getSchedule(endpoint, day, month, year) {
            var schedule;
            var data;
            if(day == null) {
                data = {
                    "month": month,
                    "year": year
                };
            }
            else {
                data = {
                    "day": day,
                    "month": month,
                    "year": year
                };
            }
            $.ajax({
                url:endpoint,
                async:false,
                dataType:'json',
                data: data,
                success: function(json) {
                    schedule = json.results;
                }
            });
            return schedule;
        }
	
	function makeDayView() {
		var schedule = getSchedule("/calendar/jsonDaySchedule", 
                        displayTime.date(), displayTime.month() + 1, displayTime.year());
		var substitutions = getSchedule("/calendar/jsonSubSchedule", 
                        displayTime.date(), displayTime.month() + 1, displayTime.year());
		var afterMidnight = getSchedule("/calendar/jsonSubSchedule", 
			displayTime.date() + 1, displayTime.month() + 1, displayTime.year());
		substitutions = substitutions.concat(afterMidnight);

		var dayView = "<table align='center'>";
		
		//header
		dayView += "<tr><td class='header' colspan='7' id='header'>";
		dayView += displayTime.format("dddd, MMMM Do[,] YYYY");
		dayView += "</td></tr>";
		
		//labels
		dayView += "<tr><td class='timelabel'></td>";
		for(role = 0; role < roles.length; role++) {
			dayView += "<th class='rolelabel'>" + roles[role] + "</th>";
		}
		dayView += "</tr>";
		
		//primary person for this day for each role
		dayView += "<tr><td class='timelabel'>Primary</td>";
		for(role = 0; role < roles.length; role++) {
			dayView += "<td class='primary' id='primary'>";
			if(schedule.length >= 1) {
				dayView +=  schedule[0][role+1];
			}
			dayView += "</td>";
		}
		dayView += "</tr>";
		
		var id = moment([displayTime.year(), displayTime.month(), displayTime.date(), 17]);
		
		//times of the day
		for(n = 1; n < 14; n++) {
			dayView += makeSubRow(id, 'inside top', substitutions);
			dayView += makeSubRow(id, 'inside bottom', substitutions);
		}
		
		dayView += "</table>";
		return dayView;
	}

	function makeSubRow(id, tdClass, substitutions) {
		var row = "<tr><td class='timelabel'>" + id.format("h[:]mma") + "</td>";
		for(role = 0; role < roles.length; role++) {
			row += "<td class='" + tdClass + "' id='" + id.format() + "'>";
			for(sub = 0; sub < substitutions.length; sub++) {
				var startTime = moment(substitutions[sub][1]).format();
				var endTime = moment(substitutions[sub][2]).format();
				var subRole = substitutions[sub][3];
				if((id.isSame(startTime) || id.isAfter(startTime)) && id.isBefore(endTime) && subRole == roles[role]) {
					row += substitutions[sub][4];
				}
			}
			row +=  "</td>";
		}
		row += "</tr>";
		id.add(30, 'm');
		return row;
	}

	function makeCalendar() {
		var schedule = getSchedule("/calendar/jsonMonthSchedule", 
                        null, displayTime.month() + 1, displayTime.year());
		var calendarText = "<table align='center'>";
		
		//header
		calendarText += "<tr><td class='header' colspan='7' id='header'>";
		calendarText += displayTime.format("MMMM YYYY");
		calendarText += "</td></tr>";

		//list weekdays
		calendarText += "<tr>";
		var weekday = displayTime.weekday();
		for(i = 0; i < 7; i++) {
			calendarText += "<td class='weekday'>";
			calendarText += displayTime.weekday(i).format("dddd");
			calendarText += "</td>";
		}
		displayTime.weekday(weekday); //revert
		calendarText += "</tr>";

		//days of the month
		var daysInThis = displayTime.daysInMonth();
		var endMonthDate = moment(displayTime.format()).date(daysInThis);
		var tempDate = moment(displayTime.format()).date(1);
		var firstDay = tempDate.day();
		tempDate.subtract(firstDay, "days");

		while (tempDate.isBefore(endMonthDate) || tempDate.isSame(endMonthDate)) {
			
			calendarText += "<tr>";
			for(i=0; i < 7; i++) {

				var currentDay = tempDate.date();
				var id = tempDate.format("YYYY[-]MM[-]DD");
				
				if(tempDate.month() == displayTime.month()) {
					calendarText += "<td class='day' id=\"" + id + "\">";
					calendarText += currentDay;
					for(j = 0; j < schedule.length; j++) {
						if(id == schedule[j][0]) {
							for(role = 0; role < 6; role++){
								calendarText += "<br>" + schedule[j][role+1];
							}
						}
					}
				}
				else {
					calendarText += "<td class='disabledDay' id=\"" + id + "\">";
					calendarText += currentDay;
				}
				calendarText += "</td>";
				tempDate.add(1, "d");
			}
			calendarText += "</tr>";
		}
		calendarText += "</table>";
		return calendarText;
	}
	
	$("#last-month").click(handleIndexClick(-1, "M", "calendar", makeCalendar));

	$("#next-month").click(handleIndexClick(1, "M", "calendar", makeCalendar));
	
	$("#yesterday").click(handleIndexClick(-1, "d", "dayView", makeDayView));

	$("#tomorrow").click(handleIndexClick(1, "d", "dayView", makeDayView));
        
        function handleIndexClick(change, thingToChange, elementId, creationMethod) {
            return function() {
                displayTime.add(change, thingToChange);
                document.getElementById(elementId).innerHTML = creationMethod();
            };
        }

	//FORMS

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

	function AJAXJSONWrapper(method, url, data) {
		$.ajax({
			async: false,
			url: url,
			type: method,
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify(data)
		});
	}

	function getInputtedCall(suffix) {
		var valid = true;
		allFields.removeClass( "ui-state-error" );
		
		if(valid) {
			var oncall_data = {
				"date":$('#date' + suffix).val(),
				"faculty":$('#faculty' + suffix).val(), 
				"fellow":$('#fellow' + suffix).val(), 
				"rn1":$('#rn1' + suffix).val(), 
				"rn2":$('#rn2' + suffix).val(),
				"tech1":$('#tech1' + suffix).val(), 
				"tech2":$('#tech2'+ suffix).val() 
			};
			return oncall_data;
		}
	}

	function addFull() {
		oncall_data = getInputtedCall("");
		AJAXJSONWrapper("POST", "/calendar/add_call", oncall_data);
		$fullDialog.dialog( "close" );
		document.getElementById("calendar").innerHTML = makeCalendar();
	}

	function cancel() {
		$(this).dialog("close");
	}

	var fullButtons = {
		"Create event": addFull,
		Cancel: cancel
	};

	var $fullDialog = $("#full-form").dialog(createDialog(fullButtons, fullForm, 350, 350));

	function deleteFull() {
		allFields.removeClass("ui-state-error");
		AJAXJSONWrapper("DELETE", "/calendar/delete_call", {"date": clickedSquare.id});
		$fullCRUDDialog.dialog("close");
		document.getElementById("calendar").innerHTML = makeCalendar();
	}	

	function updateFull() {
		oncall_data = getInputtedCall("CRUD");
		AJAXJSONWrapper("PUT", "/calendar/update_call", oncall_data);
		$fullCRUDDialog.dialog( "close" );
		document.getElementById("calendar").innerHTML = makeCalendar();
	}

	var CRUDButtons = {
		"Edit event": updateFull,
		"Delete": deleteFull,
		Cancel: cancel
	};

	var $fullCRUDDialog = $("#full-crud-form").dialog(createDialog(CRUDButtons, fullCRUDForm, 350, 350));
        
	function alertOnCall() {
		var alert_data = {
			"eta":$('#eta').val(),
			"location":$('#location').val(),
			"type":$('#type').val(),
			"msg":$('#msg').val()
		};
		AJAXJSONWrapper("POST", "/backend/start_alert", alert_data);
        var pending = AJAXGetWrapper("/backend/pending_staff");
        for(var id in pending) {
            alertingIDs[id] = setInterval(function() {
                call(id)
            }, alertFrequency);
        }
		$alertDialog.dialog( "close" );
	}

    function call(id) {
        var pending = AJAXGetWrapper("/backend/pending_staff");
        if(pending[id] == -1){
            clearInterval(alertingIDs[id]);
        }
        else {
            var data = {
                "netID": id
            }
            AJAXJSONWrapper("POST", "/backend/contact", data);
        }
    }

	var alertButtons = {
		"Send SMS": alertOnCall,
		Cancel: cancel 
	};
	
	var $alertDialog = $("#alert-form").dialog(createDialog(alertButtons, alertForm, 275, 350));

    function getSubVals(prefix, role) {
        var start = $('#start' + prefix + role).val();
        var duration = parseInt($('#duration' + prefix + role).val());
        var sub = $('#sub' + prefix + role).val();

        return {
            "start": start,
            "end": moment(start).add(duration, 'h').format(),
            "role": role,
            "sub":sub
        };
    }

    function checkTimeValidity(role, sub_data) {
        var valid = true;
        allFields.removeClass("ui-state-error");
        var tempTime = moment(sub_data['start']);
        var endTime = moment(sub_data['end']);
        while(tempTime.isBefore(endTime)) {
            var tempSchedule = getScheduleWithDatetime("/calendar/json_datetime_substitute", {"datetime": moment(tempTime).add(1, 's').format(), "role": role})[0];
			if(tempSchedule != null && tempSchedule[4] != sub_data['sub']) {
                valid = false;
                updateTips("Conflicts with existing substitution of " + tempSchedule[4]);
            }
            if(tempSchedule != null && tempSchedule[4] == sub_data['sub']) {
                var role_data = {
                    "time":tempSchedule[1],
                    "role":role
                };
                AJAXJSONWrapper("DELETE", "delete_substitute", role_data);
                var otherEndTime = moment(tempSchedule[2]);
                endTime = moment.max(endTime, otherEndTime);
                sub_data['end'] = endTime.format();
                
            }
            tempTime.add(30, 'm');
        }
        return valid;
    }
	
	function addSub(role) {
        sub_data = getSubVals("", role);
        
        var valid = checkTimeValidity(role, sub_data);

        if(valid) {
            AJAXJSONWrapper("POST", "/calendar/add_substitute", sub_data);
            document.getElementById("dayView").innerHTML = makeDayView();
        }
	}

	function createSubButtons(role) {
		return	   {
				"Create event": function() {
					addSub(role);
			        $(this).dialog( "close" );
				},
				Cancel: cancel
		};
	}

    function updateSub(role, originalStart) {
        sub_data = getSubVals("CRUD", role);
        sub_data['originalStart'] = originalStart;
        var valid = true;

        if(valid) {
            AJAXJSONWrapper("PUT", "/calendar/update_substitute", sub_data);
            document.getElementById("dayView").innerHTML = makeDayView();
        }
    }

    function deleteSub(role) {
        var role_data = {
            "time":$('#startCRUD' + role).val(),
            "role":role
        };
        AJAXJSONWrapper("DELETE", "delete_substitute", role_data);
		document.getElementById("dayView").innerHTML = makeDayView();
    }

	function createCRUDSubButtons(role, originalStart) {
		return     {
				"Update Sub": function() {
					updateSub(role, originalStart);
			        $(this).dialog( "close" );
				},
				"Delete Sub": function() {
					deleteSub(role);
					$(this).dialog( "close" );
				},
				Cancel: cancel
		};
	}

	function createDialog(buttonsList, form, height, width) {
		return {
			autoOpen: false,
			height: height,
			width: width,
			modal: true,
			buttons: buttonsList,
			close: function() {
				allFields.removeClass("ui-state-error");
			}
		};
	}
	
	var fullForm = $fullDialog.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
	});

	var fullCRUDForm = $fullCRUDDialog.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
	});
	
	var alertForm = $alertDialog.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
	});

	$('#alert-button').click( function() {
		$alertDialog.dialog('open');
	});

	$('div').on('click', 'td.inside', handleSubClick("#start", "#role", "#duration", "#sub"));
	
	$("div").on('click', 'td.day', handleDateClick());
        
    function handleDateClick(fieldToFill) {
        return function(event) {
            clickedSquare = event.target || event.srcElement;
            var clickedSchedule = getScheduleWithDatetime("/calendar/json_datetime_schedule", {"datetime": clickedSquare.id})[0];
            if(clickedSchedule != null) {
                $("#dateCRUD").val(clickedSquare.id);
                for(i = 0; i < 6; i++) {
                    $("#" + roleIds[i] + "CRUD").val(clickedSchedule[i+1]);
                }
                
                $fullCRUDDialog.dialog("open");
            }
            else {
                $fullDialog.dialog("open");
                $("#date").val(clickedSquare.id);
            }
        };
    }
	
	function handleSubClick(startField, roleField, durationField, subField) {
		return function(event) {
			var columnNumber = $(event.target).index() + 1;
			var role = $('th:nth-child(' + columnNumber + ')').text();
			clickedSquare = event.target || event.srcElement;
			
            var startTime = clickedSquare.id;
            var roleID = role;
            var duration = "1";
            var buttons = createSubButtons(role);
			
            var clickedSchedule = getScheduleWithDatetime("/calendar/json_datetime_substitute", {"datetime": moment(clickedSquare.id).add(1, 's').format(), "role": role})[0];
			if(clickedSchedule != null) {
				roleID = "CRUD" + role;
                startTime = clickedSchedule[1];
                var endTime = clickedSchedule[2];
                var duration = moment(endTime).hours() - moment(startTime).hours();
                $(subField + roleID).val(clickedSchedule[4]);
				buttons = createCRUDSubButtons(role, startTime);
			}
            
            $(startField + roleID).val(startTime);
			$(roleField + roleID).val(role);
            $(durationField + roleID).val(duration);
			
            var $dialog = $( "#" + roleID + "-sub-form" ).dialog(createDialog(buttons, null, 275, 350));
            var form = $dialog.find( "form" ).on( "submit", function( event ) {
				event.preventDefault();
			});
			
            $dialog.dialog("open");
		};
	}
});

$(document).keypress(function(e) {
        if (e.keyCode == 27) {
                    window.close();
                        }
});
