//Calibrate Review Dates
//Calibrate project review dates to include projects coming up for review 
//within the next week.
(() => {
   var action = new PlugIn.Action(function(selection, sender){
      // action code
      // selection options: tasks, projects, folders, tags
      
      //Setup dates
      var now = new Date();
		var todayStart = Calendar.current.startOfDay(now);
      var dc = new DateComponents();
      dc.day = 6;
      var oneWeek = Calendar.current.dateByAddingDateComponents(todayStart, dc);
      
      //Get active projects
      var projects = flattenedProjects.filter(p => {
         return p.status == Project.Status.Active;
      });
      
      //Update review dates for projects scheduled for review within the next week
      projects.forEach(function(proj) {
         //Review dates appear to have 00:00 as their timestamp
         if (proj.nextReviewDate > todayStart && proj.nextReviewDate <= oneWeek) {
            proj.nextReviewDate = todayStart;
         }
		});
   });

   action.validate = function(selection, sender){
      // validation code
      // selection options: tasks, projects, folders, tags
      return true;
   };
   
   return action;
})();