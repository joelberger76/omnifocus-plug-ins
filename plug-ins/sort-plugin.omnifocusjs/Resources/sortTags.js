//Sort Tags
//This action will alphabetically sort the tags within each parent task.
//Based upon alpha-sort-project-tasks from omni-automation.com.
(() => {
   var action = new PlugIn.Action(function(selection, sender){
      // action code
      // selection options: tasks, projects, folders, tags
      tags.apply(item => {
         if (item instanceof Tag && item.children.length > 0) {
            let tagsToSort = item.children;
            
            tagsToSort.sort((a, b) => {
               let x = a.name.toLowerCase();
               let y = b.name.toLowerCase();
               if (x < y) {return -1;}
               if (x > y) {return 1;}
               return 0;
            });
            
            moveTags(tagsToSort, item);
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