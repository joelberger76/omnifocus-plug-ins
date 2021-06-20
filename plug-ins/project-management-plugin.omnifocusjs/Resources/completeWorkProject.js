//Complete work project
//Mark work project complete and archive in Toggl based upon provided name or selection
/* TODO:
- 
*/
(() => {
   let action = new PlugIn.Action(function(selection) {
      //Determine if a single project is selected, and it is in the work folder
      let singleProjectSelection = selection.projects.length === 1 &&
                                   selection.folders.length === 0 &&
                                   selection.tasks.length === 0 &&
                                   selection.tags.length === 0;
      
      let workProject = new Array();
      if (singleProjectSelection && selection.projects.length === 1) {
         folderNamed("Work").flattenedProjects.filter(p => {
            if (p.status == Project.Status.Active &&
                p.name == selection.projects[0].name) {
               workProject.push(p);
            }             
         });
      }
      
      if (workProject.length === 1) {
         showForm(workProject[0].name);
      }
      else {
         showForm();  
      }
            
   });
    
	action.validate = function(selection, sender) {
		return true;
	};
        
	return action;
})();

function showForm(projName) {
   //Setup form
   let projects = folderNamed("Work").flattenedProjects.filter(p => {
      return p.status == Project.Status.Active;
   });
   let projectNames = projects.map(project => {
      return project.name;
   });
   let projectIndexes = new Array();
   projectNames.forEach((name, index) => {
     projectIndexes.push(index);
   });
   
   let defaultIndex = 0;
   if (projName) {
      defaultIndex = projectNames.indexOf(projName);
   }
   
   let projectMenu = new Form.Field.Option(
      "projectName", 
      "Project", 
      projectIndexes, 
      projectNames, 
      defaultIndex
   );
   projectMenu.allowsNull = false;
	
   let inputForm = new Form();
   inputForm.addField(projectMenu);
   let formPrompt = "Complete Project";
   let buttonTitle = "Continue";
   let formPromise = inputForm.show(formPrompt,buttonTitle);
	
   inputForm.validate = function(formObject) {
      return true;
	}
	
   formPromise.then(function(formObject) {
		//Get form content
		let projectNameIndex = formObject.values["projectName"];
		let projectName = projectNames[projectNameIndex];
		
		completeProject(projectName);
   });

	formPromise.catch(function(err){
		console.error("Form cancelled", err.message);
	});	
}

function completeProject(projName) {
   //Complete project
	folderNamed("Work").projectNamed(projName).status = Project.Status.Done;
         
   //Archive project in Toggl
   /* Disable Toggl
   let webhookURL = folderNamed("Maintenance").projectNamed("Plug-In Configuration").taskNamed("Toggl Project Webhook").note;
   let urlStr = webhookURL + "?action=archive&project=";
   let encodedProjectName = encodeURIComponent(projName);
   //Use fetch instead of open to avoid spawning a browser window
   //Callback function is required
   URL.fromString(urlStr + encodedProjectName).fetch(function(data) {
      return true;
   });
   */
   
   return true;   
}