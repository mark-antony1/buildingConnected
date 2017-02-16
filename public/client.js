
(function() {
	console.log(`***IN ORDER FOR LABORTYPES TO WORK THEY MUST BE SEARCHED LIKE:  'Non-Union,Prevailing Wages'  AND WITHOUT THE QUOTES***`)

	//last held value in search input
	var oldName = '';
	//last held value in smaller search input
	var oldType = '';
	//keeps track of the id of the last keystroke
	var keyStrokeId;

	//makes an api call if the either of the search input changed from where they last were
	//***IN ORDER FOR LABORTYPES TO WORK THEY MUST BE SEARCHED LIKE:  'Non-Union,Prevailing Wages'  AND WITHOUT THE QUOTES***
	const getData = () => {
		var name = document.getElementById('search').value
		var type = parseType(document.getElementById('laborType').value)
		if((oldName !== name && name !== '') || (oldType !== type && type !== '')) {
			oldName = name
			oldType = type
			// console.log('oldType', oldType)
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
			.then(data => renderRows(data))
			.catch(err => new Error(err))
		} else if (name === '' && type === '') {
			oldName = ''
			var dynamicNode = document.getElementById('dynamic')
			while (dynamicNode.firstChild) {
				dynamicNode.removeChild(dynamicNode.firstChild);
			}
		}
	}

	//parse the input for the labor type and returns a valid value for the labortype api value
	const  parseType = (types) => {
		if(types.length === 0) {
			return ''
		}
		var nonUnions = ['Non-union', 'non-Union', 'non-union']
		var spacedTypes = types.split(' ').map(word => {
			if(nonUnions.indexOf(word) > -1) {
				return 'Non-Union'
			} else if (word.length === 0) {
				return;
			}
			word = word.split('')
			word[0] = word[0].toUpperCase()
			word = word.join('')
			return word
		})
		if(spacedTypes.length > 1) {
			var join = spacedTypes.join(',');
			return join
		} 
		return spacedTypes
	}

	//adds event listener for the name search bar and helps keeps track of last keystroke
	document.getElementById('search').addEventListener('keydown', function(e) {
		var currentKeyStroke = Math.random()
		keyStrokeId = currentKeyStroke;
		setTimeout(() => {
			if(currentKeyStroke === keyStrokeId) {
				getData()
			}
		}, 1000)
  });
	
	// adds the same event listener as ^^ but for the labor type
	document.getElementById('laborType').addEventListener('keydown', function(e) {
		console.log('labor')
		var currentKeyStroke = Math.random()
		keyStrokeId = currentKeyStroke;
		setTimeout(() => {
					console.log('labortimeout')

			if(currentKeyStroke === keyStrokeId) {
				getData()
			}
		}, 1000)
  });



	//returns a text node with company data as text
	const createModalLine = (data, label) => {
		if(label === 'Website') {
			var node = document.createElement("DIV");
			var url = document.createElement("A");
			var dataNode = document.createTextNode(data);
			var label = document.createTextNode(`${label}: `);
			url.href = data
			url.appendChild(dataNode)
			node.appendChild(label)
			node.appendChild(url)
		} else {
				node = document.createElement("DIV");
				dataNode = document.createTextNode(data);
				label = document.createTextNode(`${label}: `);
				node.appendChild(label)
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

	//returns rows with company names that are returned from the api
	const renderRows = (data) => {
		// console.log('data', data)
		var dynamicNode = document.getElementById('dynamic')
		while (dynamicNode.firstChild) {
			dynamicNode.removeChild(dynamicNode.firstChild);
		}
		var node = document.createElement("h3");
		var textnode = document.createTextNode("Results");
		node.appendChild(textnode);
		dynamicNode.append(node)

		//append rows to dom that display companyName		
		var rows = data.results.map((company)  => {
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

	
})()
