image1 = new Image();

image1.src = 'resources/plus.gif';



function CloseSitemap()

{

	parent.URL = parent.mainFrame.URL

}



function ToggleDiv(node, id)

{

	sibling = document.getElementById(id);

	if (sibling.style.display == 'none')

	{

		if (node.childNodes.length > 0)

		{

			if (node.childNodes[0].tagName == "IMG")

			{

				node.childNodes[0].src = "resources/minus.gif";

			}

		}



		sibling.style.display = '';

	}

	else

	{

		if (node.childNodes.length > 0)

		{

			if (node.childNodes[0].tagName == "IMG")

			{

				node.childNodes[0].src = "resources/plus.gif";

			}

		}

		sibling.style.display = 'none';

	}

}



var currentPage = null;



function highlight(id)

{

	if (currentPage != null)

	{

		currentPage.style.backgroundColor = '#EEEEFF';

		currentPage.style.paddingLeft = '0px';

		currentPage.style.paddingRight = '0px';

		currentPage.style.border = '0px solid #666666';

	}

	

	currentPage = document.getElementById(id);

    if (currentPage) {

	    currentPage.style.backgroundColor = '#DDDDDD';

	    currentPage.style.paddingLeft = '3px';

	    currentPage.style.paddingRight = '3px';

	    currentPage.style.border = '1px solid #666666';

    }

}
