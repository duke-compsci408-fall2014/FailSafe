$(document).ready(function() {
	var date = $("#date"),
        CRUDdate = $("#dateCRUD");
	var allFields = $( [] ).add( date ).add( CRUDdate );
	var tips = $( ".validateTips" );
	var roles = ["Faculty", "Fellow", "RN1", "RN2", "Tech1", "Tech2"];
	var roleIds = ["faculty", "fellow", "rn1", "rn2", "tech1", "tech2"];
   	var displayTime = moment();
	var clickedSquare;

	function createDialog(buttonsList, form) {
		return {
			autoOpen: false,
			height: 'auto',
			width: 400,
			modal: true,
			buttons: buttonsList,
			close: function() {
				allFields.removeClass("ui-state-error");
			}
		};
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

	if(document.getElementById("calendar") != null) {
		document.getElementById("calendar").innerHTML = makeCalendar();
	}
	if(document.getElementById("dayView") != null) {
        var startingDate = document.getElementById("startingDate").innerHTML;
	    if(startingDate != "")
        {
            displayTime = moment(startingDate);
        }
        document.getElementById("dayView").innerHTML = makeDayView();
	}

	function AJAXGetWithData(endpoint, requestParams) {
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
		var row = "<tr><td class='timelabel'>" + id.format("h[:]mm a") + "</td>";
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
        var roles = ["faculty", "fellow", "rn1", "rn2", "tech1", "tech2"];
        for(i = 0; i < 6; i++) {
            for(j = 0; j < 6; j++) {
                if((oncall_data[roles[i]] == oncall_data[roles[j]]) && (i != j)) {
                    updateTips("User " + oncall_data[roles[i]] + " has been assigned twice.");
                    return false;
                }
            }
        }
		AJAXJSONWrapper("POST", "/calendar/add_call", oncall_data);
		$fullDialog.dialog( "close" );
		document.getElementById("calendar").innerHTML = makeCalendar();
	}
	
    function cancel() {
		$(this).dialog("close");
	}

	var fullButtons = {
		"Assign Team": addFull,
		Cancel: cancel
	};

	var $fullDialog = $("#full-form").dialog(createDialog(fullButtons, fullForm));
	
	var fullForm = $fullDialog.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
	});

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
		"Update Team": updateFull,
		"Delete Assignment": deleteFull,
		Cancel: cancel
	};

	var $fullCRUDDialog = $("#full-crud-form").dialog(createDialog(CRUDButtons, fullCRUDForm));
        
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

	var fullCRUDForm = $fullCRUDDialog.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
	});

    function checkAvailability(sub_data) {
        var valid = AJAXGetWithData("/calendar/check_availability", sub_data);
        if(!valid) {
            updateTips("User has already been assigned for another role at that time");
        }
        return valid;
    }

    function checkTimeValidity(role, sub_data) {
        var valid = true;
        allFields.removeClass("ui-state-error");
        var tempTime = moment(sub_data['start']);
        var endTime = moment(sub_data['end']);
        valid = checkAvailability(sub_data);
        while(tempTime.isBefore(endTime)) {
            var tempSchedule = AJAXGetWithData("/calendar/json_datetime_substitute", {"datetime": moment(tempTime).add(1, 's').format(), "role": role})[0];
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
        return valid;
	}

	function createSubButtons(role) {
		return	   {
				"Submit Substitution": function() {
					var success = addSub(role);
			        if(success) {
                        $(this).dialog( "close" );
                    }
				},
				Cancel: cancel
		};
	}

    function updateSub(role, originalStart) {
        sub_data = getSubVals("CRUD", role);
        sub_data['originalStart'] = originalStart;
        var valid = checkAvailability(sub_data);

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
	
	$('div').on('click', 'td.inside', handleSubClick("#start", "#role", "#duration", "#sub"));
	
	function handleSubClick(startField, roleField, durationField, subField) {
		return function(event) {
			var columnNumber = $(event.target).index() + 1;
			var role = $('th:nth-child(' + columnNumber + ')').text();
			clickedSquare = event.target || event.srcElement;
			
            var startTime = clickedSquare.id;
            var roleID = role;
            var duration = "1";
            var buttons = createSubButtons(role);
			
            var clickedSchedule = AJAXGetWithData("/calendar/json_datetime_substitute", {"datetime": moment(clickedSquare.id).add(1, 's').format(), "role": role})[0];
			if(clickedSchedule != null) {
				roleID = "CRUD" + role;
                startTime = clickedSchedule[1];
                var endTime = clickedSchedule[2];
                var duration = moment(endTime).diff(startTime, 'hours');
                $(subField + roleID).val(clickedSchedule[4]);
				buttons = createCRUDSubButtons(role, startTime);
			}
            
            $(startField + roleID).val(startTime);
			$(roleField + roleID).val(role);
            $(durationField + roleID).val(duration);
			
            var $dialog = $( "#" + roleID + "-sub-form" ).dialog(createDialog(buttons, null));
            var form = $dialog.find( "form" ).on( "submit", function( event ) {
				event.preventDefault();
			});
			
            $dialog.dialog("open");
		};
	}
	
	$("div").on('click', 'td.day', handleDateClick());

    function handleDateClick(fieldToFill) {
        return function(event) {
            clickedSquare = event.target || event.srcElement;
            var clickedSchedule = AJAXGetWithData("/calendar/json_datetime_schedule", {"datetime": clickedSquare.id})[0];
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
});

$(document).keypress(function(e) {
        if (e.keyCode == 27) {
                    window.close();
                        }
});
