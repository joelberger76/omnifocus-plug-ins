//Create work project
//Create project in OmniFocus Work folder and Toggl based upon provided name
/* TODO:
- 
*/
(() => {
   let action = new PlugIn.Action(function(selection) {
      
      //Setup form
		let projectNameInput = new Form.Field.String("projectName", "Project Name", null);
		
      let inputForm = new Form();
      inputForm.addField(projectNameInput);
      let formPrompt = "Create Project";
      let buttonTitle = "Continue";
      let formPromise = inputForm.show(formPrompt,buttonTitle);
		
      inputForm.validate = function(formObject) {
         if (!formObject.values["projectName"]) {
            throw "";
         }
         
         return true;
		}
		
      formPromise.then(function(formObject) {
			//Get form content
			let projectName = titleCase(formObject.values["projectName"]);
			
			//Create project
			createProject(projectName);
         
         //Cleanup
         PlugIn.find("com.joelberger.omnifocus.sort-plugin").action("sortProjects").perform();
      });

		formPromise.catch(function(err){
			console.error("Form cancelled", err.message);
		});	
   });

    
	action.validate = function(selection, sender) {
		return true;
	};
        
	return action;
})();

function createProject(projName) {
   //Create project in Work folder
   new Project(projName, folderNamed("Work"));
   
   //Create project in Toggl
   /* Disable Toggl
   let webhookURL = folderNamed("Maintenance").projectNamed("Plug-In Configuration").taskNamed("Toggl Project Webhook").note;
   let urlStr = webhookURL + "?action=create&project=";
   let encodedProjectName = encodeURIComponent(projName);
   //Use fetch instead of open to avoid spawning a browser window
   //Callback function is required
   URL.fromString(urlStr + encodedProjectName).fetch(function(data) {
      return true;
   });
   */
}

//Adapted from: https://github.com/words/ap-style-title-case
function titleCase(str, options) {
  const stopwords = 'a an and at but by for in nor of on or so the to up yet'
  const defaults = stopwords.split(' ')
  
  const opts = options || {}

  if (!str) return ''

  const stop = opts.stopwords || defaults
  const keep = opts.keepSpaces
  const splitter = /(\s+|[-‑–—])/

  return str
    .split(splitter)
    .map((word, index, all) => {
      if (word.match(/\s+/)) return keep ? word : ' '
      if (word.match(splitter)) return word

      if (
        index !== 0 &&
        index !== all.length - 1 &&
        stop.includes(word.toLowerCase())
      ) {
        return word.toLowerCase()
      }

      return capitalize(word)
    })
    .join('')
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
