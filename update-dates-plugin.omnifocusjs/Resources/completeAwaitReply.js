//Complete and Await Reply
//Mark the currently selected task as complete and add a new task to await the reply
//Based upon Rosemary Orchard's OmniJS and Curt Clifton's AppleScript implementations.
(() => {
	let action = new PlugIn.Action(function(selection) {
		let duplicatedTasks = new Array();
		var followUpTag = tagNamed("Follow Up");
		
		//Setup dates
		var now = new Date();
		var todayStart = Calendar.current.startOfDay(now);
		var styledDateFormatter = Formatter.Date.withStyle(Formatter.Date.Style.Medium, Formatter.Date.Style.Short);
		var styledNow = styledDateFormatter.stringFromDate(now);
		var pushNumDays = 2;
		var offset = 0;
		switch (now.getDay()) {
        case 4:
           //Thursday
           offset = 2;
           break;
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
			insertionLocation = task.after;
			//Not sure if this is really needed but leaving it just in case from Rosemary Orchard's script which was using task.containingProject instead
			if (insertionLocation === null) {
			   insertionLocation = inbox.ending;
			}
			
			//Duplicate task
			dupTasks = duplicateTasks([task], insertionLocation);
			
			//Add Follow Up tag
			dupTasks[0].addTag(followUpTag);
			
			//Add Follow up: to task name, if not already present
			if (!task.name.startsWith("Follow up: ")) {
			   dupTasks[0].name = "Follow up: " + task.name;
			}
			
			//Update defer date based upon working days (if current defer date is set)
         if (task.deferDate) {
            dupTasks[0].deferDate = newDeferDate;
         }
			
			//Append note with Follow Up timestamp
			var noteText = "Follow up sent on " + styledNow;
			if (task.note.length == 0) {
			   dupTasks[0].note = noteText;
			}
			else {
			   dupTasks[0].note = task.note + "\n" + noteText;
			}
			
			duplicatedTasks.push(dupTasks[0].id.primaryKey);
			task.markComplete();
		});
		
		//idStr = duplicatedTasks.join(",");
		//URL.fromString("omnifocus:///task/" + idStr).open();
    });

    
	action.validate = function(selection){
		return (selection.tasks.length >= 1);
	};
        
	return action;
})();