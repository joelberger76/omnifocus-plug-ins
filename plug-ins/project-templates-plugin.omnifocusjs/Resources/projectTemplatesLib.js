(() => {
	var projectTemplatesLib = new PlugIn.Library(new Version("1.0"));
  	
		projectTemplatesLib.getFormFieldIndex = function(inputForm, key) {
         return inputForm.fields.map(i => i.key).indexOf(key);
      }
       
      projectTemplatesLib.removeCommentLines = function(template) {
         // Remove lines starting with #
         let regex = new RegExp("^\\s*#.*\(?:\n|$)", "mg");
         return template.replace(regex, '');
      }

      projectTemplatesLib.populateTemplateParameter = function(template, parameter, value) {
         // Replace parameters in the format <<name>> with the provided value
         let regex = new RegExp("<<"+parameter+">>", "g");
         return template.replace(regex, value);
      }
      
      projectTemplatesLib.getEndOfDay = function(date8601) {
         //Convert ISO 8601 date string to date object with a timestamp of 11:55 PM
         let dc = new DateComponents();
         dc.year = Number(date8601.substring(0,4));
         dc.month = Number(date8601.substring(5,7));
         dc.day = Number(date8601.substring(8));
         dc.hour = 23;
         dc.minute = 55;
         dc.second = 0;
         return Calendar.current.dateFromDateComponents(dc);
      }
      
      projectTemplatesLib.getTemplateContent = async function(templateName) {
         // Get URL of file
         const pluginName = "com.joelberger.omnifocus.project-templates-plugin";
         let plugin = PlugIn.find(pluginName);
         let fileURL = plugin.resourceNamed(templateName);         
         
         // Fetch the file synchronously
         let result = await fileURL.promiseFetch();
         
         return result.toString();
      }
      
      // Handler replacing the URL fetch() function
      URL.prototype.promiseFetch = function(success, failure) {
         return new Promise((resolve, reject) => {
            this.fetch((data) => {
               //console.log("SUCCESS: " + data.toString());
               resolve(data);
            }, (failureResult) => {
               console.log("ERROR: " + failureResult);
               reject(new Error(failureResult));
            });
         });
      }

	return projectTemplatesLib;
})();