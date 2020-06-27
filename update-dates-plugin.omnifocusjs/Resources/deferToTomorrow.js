//Defer to Tomorrow
//Defer selected tasks to tomorrow (or Monday)
(() => {
	let action = new PlugIn.Action(function(selection) {
		//Setup dates
		var now = new Date();
		var todayStart = Calendar.current.startOfDay(now);
		var pushNumDays = 1;
		var offset = 0;
		switch (now.getDay()) {
        case 5:
           //Friday
           offset = 2;
           break;
        case 6:
           //Saturday
           offset = 1;
     }
     var dc = new DateComponents();
     dc.day = pushNumDays + offset;
     var newDeferDate = Calendar.current.dateByAddingDateComponents(todayStart, dc);
		
		selection.tasks.forEach(function(task) {
			//Update defer date based upon working days
        task.deferDate = newDeferDate;
		});
    });

    
	action.validate = function(selection){
		return (selection.tasks.length >= 1);
	};
        
	return action;
})();