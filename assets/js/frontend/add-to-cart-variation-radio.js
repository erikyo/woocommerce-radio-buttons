document.addEventListener('DOMContentLoaded', () => {
	const $form = jQuery('.variations_form');

	/**
	 * @param {Array} variationAttributes - The Array of Product Attributes -> {attribute_logo: "Yes", attribute_pa_color: "blue"}
	 * @param {Array} attributes          - the selected attribute to match with the variation Attributes -> {attribute_pa_color: "green"}
	 */
	const isMatch = (variationAttributes, attributes) => {
		let match = true;

		for (const attrName in variationAttributes)
			if (variationAttributes.hasOwnProperty(attrName)) {
				const val1 = variationAttributes[attrName];
				const val2 = attributes[attrName];
				if (
					val1 !== undefined &&
					val2 !== undefined &&
					val1.length !== 0 &&
					val2.length !== 0 &&
					val1 !== val2
				)
					match = false;
			}

		return match;
	};

	/**
	 * Search into current array and return the variation with the given attributes
	 *
	 * @param {Array} variations - the array of variations -> [0: {attributes: {…}, …},1: {attributes: {…}, …},2: {attributes: {…}, …}, …] length: 3
	 * @param {Array} attributes -the selected attributes -> {attribute_pa_color: "green"}
	 * @return {Array} matched - the matching variation from the array attributes
	 */
	const findMatchingVariations = (variations, attributes) => {
		const matching = [];
		for (let i = 0; i < variations.length; i++) {
			const variation = variations[i];

			if (isMatch(variation.attributes, attributes))
				matching.push(variation);
		}
		return matching;
	};

	/**
	 * Get chosen attributes from form.
	 *
	 * @param {Element} form - the form where this plugin is playing
	 * @return {Array} formList - the product available with the current selection
	 */
	const radioGetChosenAttributes = (form) => {
		const data = {};
		const formList = [];
		let count = 0;
		let chosen = 0;

		form.querySelectorAll('.variations .wrb-list').forEach(
			(radioList, index) => {
				count++;
				// the selected radio
				const selected = radioList.querySelector('input:checked');
				if (selected.parentElement.classList.contains('radio__none'))
					return false;
				// the name of the attribute
				const attributeName =
					radioList.dataset.attribute_name || selected.name;
				const value = selected.value || false;
				// update counters
				if (value) chosen++;

				data[attributeName] = value;

				formList[index] = {
					count,
					chosenCount: chosen,
					data,
				};
			}
		);

		$form.trigger('check_variations', formList[formList.length - 1]);

		return formList;
	};

	/**
	 * @param {Element} button - disable this button
	 */
	const disableButton = (button) => {
		button.classList.add('disabled');
		button.classList.remove('active');
		console.log(button.textContent + ' disabled');
	};

	/**
	 * @param {Element} button - enable this button
	 */
	const enableButton = (button) => {
		button.classList.remove('disabled');
		button.classList.add('active');
		console.log(button.textContent + ' enabled');
	};

	/* Loops for each collection of variation... */
	document.querySelectorAll('.variations_form').forEach((form) => {
		const inputs = form.querySelectorAll('.variations input');
		const formData = JSON.parse(form.dataset.product_variations);
		console.log(formData);

		/* Loops for each input of the collection */
		inputs.forEach((input) => {
			/*
			 * listen for this input change
			 * */
			input.addEventListener('change', () => {
				if (form.querySelector('.wc-no-matching-variations'))
					form.querySelector('.wc-no-matching-variations').remove();

				// update dataset if ajax isn't enabled
				if (!form.dataset.length)
					$form.trigger('woocommerce_variation_select_change');

				// Refresh the variations array (used to find matching products)
				const chosenAttributes = radioGetChosenAttributes(form);

				// Fetch the variations array in order to find matching terms
				const inputsData = findMatchingVariations(
					formData,
					chosenAttributes[chosenAttributes.length - 1].data
				);
				console.log(inputsData);

				inputs.forEach((i) => {
					console.log(i);
					if (i.name === input.name) {
						// the input match the taxonomy
						if (i !== input)
							// the other button of the same tax will be disabled
							disableButton(i.nextElementSibling);
						// the enabled option
						else enableButton(i.nextElementSibling);
					} else if (!i.checked) {
						// the input DOESN'T match the taxonomy
						inputsData.forEach((data) => {
							if (
								Object.values(data.attributes).includes(
									i.value
								) &&
								Object.keys(data.attributes).includes(i.name)
							)
								enableButton(i.nextElementSibling);
							else disableButton(i.nextElementSibling);
						});
					} else if (!i.value) {
						// !i.value is the "none button"
						//enableButton(i.nextElementSibling);
					}
				});
			});
		});

		// On clicking the reset variation button
		form.querySelector('.reset_variations').addEventListener(
			'click',
			(event) => {
				event.preventDefault();

				form.querySelectorAll(
					'.variations .wrb-list input[type="radio"]'
				).forEach((radio) => {
					radio.checked = false;
					enableButton(radio.nextElementSibling);
				});

				form.querySelectorAll('.radio__none input').forEach(
					(noneButton) => {
						noneButton.checked = true;
						noneButton.click();
						enableButton(noneButton.nextElementSibling);
					}
				);
			}
		);
	});
});
