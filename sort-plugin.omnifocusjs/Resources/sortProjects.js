//Sort Projects
//This action will alphabetically sort the projects (and sub-folders) within each folder.
//Based upon alpha-sort-project-tasks from omni-automation.com.
(() => {
   var action = new PlugIn.Action(function(selection, sender){
      // action code
      // selection options: tasks, projects, folders, tags
      library.apply(function(item){
         if (item instanceof Folder && item.sections.length > 0){
            var sections = item.sections;
            var generalProject = null;
            
            //Split out General project
            var generalIndex = sections.indexOf(sections.byName("General"));
            if (generalIndex > -1) {
               generalProject = sections[generalIndex];
               sections.splice(generalIndex, 1);
            }
            
            sections.sort((a, b) => {
               var x = a.name.toLowerCase();
               var y = b.name.toLowerCase();
               if (x < y) {return -1;}
               if (x > y) {return 1;}
               return 0;
            });
            
            //Sort General to the top
            if (generalIndex > -1) {
               moveSections([generalProject], item);
            }
            moveSections(sections, item);         
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