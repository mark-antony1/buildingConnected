
(function() {

	//last held value in search input
	var oldName = '';
	//last held value in smaller search input
	var oldType = '';
	//keeps track of the id of the last keystroke
	var keyStrokeId, fullResults, lastSlicedRow, loadingRows;

	//keeps track of selected laborTypes
	var types = {
		Union: false,
		"Non-Union": false,
		"Prevailing Wages": false
	}

	//removes search data
	const removeRows = () => {
		var dynamicNode = document.getElementById('dynamic')
		while (dynamicNode.firstChild) {
			dynamicNode.removeChild(dynamicNode.firstChild);
		}
	}

	//makes an api call if the either of the search input changed from where they last were
	const getData = () => {
		var name = document.getElementById('search').value
		var type = parseType(types)
		if(((oldName !== name || oldType !== type) && name !== '' || type !== '')) {
			oldName = name
			oldType = type
			var url;
			if(name !== '' && type !== '') {
				url = `http://localhost:3000/api/companies?q=${name}&laborTypes=${type}&limit=200`
			} else if (name !== '') {
				url = `http://localhost:3000/api/companies?q=${name}&limit=200`
			} else {
				url = `http://localhost:3000/api/companies?laborTypes=${type}&limit=200`
			}
			fetch(url)
			.then(data => data.json())
			.then(data => {
				fullResults = data.results
				lastSlicedRow = 10;
				renderRows(data.results.slice(0,10), true)
			})
			.catch(err => new Error(err))
		} else if (name === '' && type === '') {
			oldType = ''
			oldName = ''
			fullResults = '';
			removeRows()
		}
	}

	//parse the input for the labor type and returns a valid value for the labortype api value
	const parseType = (types) => {
		var queryTypes = ''
		for(var key in types) {
			if(types[key]) {
				queryTypes += `${key},`
			}
		}
		return queryTypes
	}

	//returns a text node with company data as text
	const createModalLine = (data, label) => {
		if(label === 'Website') {
			var node = document.createElement("DIV");
			var url = document.createElement("A");
			var dataNode = document.createTextNode(data);
			url.href = data
			url.appendChild(dataNode)
			node.appendChild(url)
		} else {
			node = document.createElement("H2");
			dataNode = document.createTextNode(data);
			node.appendChild(dataNode)
		}
		node.classList.add('modalChild')
		return node;
	}

	//creates a button to close a modal on click
	const createModalButton = (modal) => {
		var node = document.createElement("BUTTON")
		var buttonText = document.createTextNode('Close Modal');
		node.appendChild(buttonText)
		node.classList.add('modal_button')
		node.classList.add('suggestions')
		node.addEventListener('click',  function() {
			this.classList.add('hide')
		}.bind(modal))
		return node;
	}

	//creates a company picture for the modal
	const createModalPicture = (src) => {
		var node = document.createElement("IMG")
		node.classList.add('image')
		node.src = src
		return node;
	}

	//creates rows for labor types at companies
	const createLaborTypes = (labors) => {
		var node = document.createElement("DIV");
		var label = document.createElement("h4");
		label.appendChild(document.createTextNode("LaborTypes"));
		label.classList.add('laborTypesHeader')
		node.appendChild(label)
		var list =  document.createElement("UL");
		var child;
		labors.forEach(labor => {
			child = document.createElement("LI");
			var buttonText = document.createTextNode(labor);
			child.appendChild(buttonText)
			list.appendChild(child)
		})
		node.appendChild(list)
		return node
	}

	//returns the modal with company info
	const createModal = (companyData) => {
		var node = document.createElement("DIV");
		var name = createModalLine(companyData.name, 'Name');
		var phone = createModalLine(companyData.phone, 'Phone');
		var website = createModalLine(companyData.website, 'Website');
		var button = createModalButton(node)
		var pic = createModalPicture(companyData.avatarUrl)
		var labors = createLaborTypes(companyData.laborType) //array
		document.createTextNode(companyData.name);
		node.appendChild(pic)
		node.appendChild(name)
		node.appendChild(phone)
		node.appendChild(website)   
		node.appendChild(labors) 
		node.appendChild(button)
		node.classList.add('modal')
		var dynamicNode = document.getElementById('dynamic')
		dynamicNode.append(node)
	}

	//if modal exists, hide it and create a new one
	const updateModal = (companyData) => {
		var node = document.getElementsByClassName('modal')[0]
		node.classList.remove('modal')
		node.classList.add('hide')
		createModal(companyData)
	}

	//append rows to dom that display companyName		
	const appendRows = (data, dynamicNode) => {
		var rows = data.map((company)  => {
			node = document.createElement("DIV");
			textnode = document.createTextNode(company.name);
			node.appendChild(textnode);
			node.companyData = company      
			node.classList.add('suggestions')
			node.addEventListener('click',  function() {
				if(document.getElementsByClassName('modal').length === 0){
					createModal(this.companyData)
				} else {
					updateModal(this.companyData)
				}
			}.bind(node))
			dynamicNode.append(node)
		})
	}

	//returns rows with company names that are returned from the api
	const renderRows = (data, reset) => {
		var dynamicNode = document.getElementById('dynamic')
		if(reset){
			while (dynamicNode.firstChild) {
				dynamicNode.removeChild(dynamicNode.firstChild);
			}
			var node = document.createElement("h3");
			var textnode = document.createTextNode("Results");
			node.appendChild(textnode);
			dynamicNode.append(node)
			appendRows(data, dynamicNode)
		} else {
			lastSlicedRow += 10;
			var node = document.createElement("h3");
			var textnode = document.createTextNode("Loading...");
			loadingRows = true;
			node.appendChild(textnode);
			dynamicNode.append(node)
			setTimeout(() => {
				appendRows(data, dynamicNode)
				loadingRows = false;
				node.parentNode.removeChild(node);
			}, 500)	
		}
	}

	//makes api call once a radio button change is registered
	const handleRadioClick = (node) => {
		types[node.id] = !types[node.id]
		var currentKeyStroke = Math.random()
		keyStrokeId = currentKeyStroke;
		setTimeout(() => {
			if(currentKeyStroke === keyStrokeId) {
				getData()
			}
		}, 1000)
	}

	//returns true if bottom of page has been scrolled to
	const reachedBottom = () => {
		var currentPosition = window.pageYOffset;
		var windowSize = window.innerHeight;
		var documentSize = document.body.offsetHeight;
		return (currentPosition + windowSize) >= documentSize && lastSlicedRow < fullResults.length ? true: false;
	}

	//adds scroll event to determine if bottom has been reached
	document.addEventListener('scroll', function() {
		if(reachedBottom() && lastSlicedRow !== undefined && !loadingRows){
			renderRows(fullResults.slice(lastSlicedRow, lastSlicedRow + 10))
		}
	})

	//adds click handler to radio buttons
	var classname = document.getElementsByClassName('radio')
	for (var i = 0; i < classname.length; i++) {
		var node = document.getElementById(classname[i].id)
		node.addEventListener('click', handleRadioClick.bind(node, node), false);
	}

	//adds event listener for the name search bar and helps keeps track of last keystroke
	document.getElementById('search').addEventListener('keydown', function() {
		var currentKeyStroke = Math.random()
		keyStrokeId = currentKeyStroke;
		setTimeout(() => {
			if(currentKeyStroke === keyStrokeId) {
				getData()
			}
		}, 1000)
  });
})()
