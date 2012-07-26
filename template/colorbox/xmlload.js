
__resources__["/__builtin__/xmlload.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
function xmlLoad(filename)
{
	var xmlDoc;

	try //Internet Explorer
  {
  	xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
  }
	catch(e)
  {
  	try //Firefox, Mozilla, Opera, etc.
    {
    	xmlDoc = document.implementation.createDocument("","",null);
    }
  	catch(e) 
  	{
  		alert(e.message);
  	}
  }
	try 
  {
  	xmlDoc.async = false;
  	xmlDoc.load(filename);
  }
	catch(e)
	{
		//chrome
		try
		{
			var xmlHttp = new XMLHttpRequest();
			//xmlHttp = new XMLHttpRequest();
			//xmlHttp.onreadystatechange=onXmlHttpResponse;
			xmlHttp.open("GET", filename, false);
			xmlHttp.send(null);
			xmlDoc = xmlHttp.responseXML;
		}
		catch(e)
		{
			alert(e.message);
		}
	}
	return xmlDoc;
}

/*
function onXmlHttpResponse()
{
	if(xmlHttp == null || xmlHttp.readyState!=4) 
		return;
	if(xmlHttp.status!=200)
  {
  	alert("Problem retrieving XML data");
  	return;
  }
  xmlDoc = xmlHttp.responseXML;
}
*/

module.exports.xmlLoad = xmlLoad;
}};