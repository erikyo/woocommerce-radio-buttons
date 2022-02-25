document.addEventListener('DOMContentLoaded', () => {
	const $form = jQuery('.variations_form');

	const isMatch = (variationAttributes, attributes) => {
		let match = true;

		for (const attrName in variationAttributes) {
			if (variationAttributes.hasOwnProperty(attrName)) {
				const val1 = variationAttributes[attrName];
				const val2 = attributes[attrName];
				if (
					val1 !== undefined &&
					val2 !== undefined &&
					val1.length !== 0 &&
					val2.length !== 0 &&
					val1 !== val2
				) {
					match = false;
				}
			}
		}
		return match;
	};

	const findMatchingVariations = (variations, attributes) => {
		const matching = [];
		for (let i = 0; i < variations.length; i++) {
			const variation = variations[i];

			if (isMatch(variation.attributes, attributes)) {
				matching.push(variation);
			}
		}
		return matching;
	};

	// Get chosen attributes from form.
	const radioGetChosenAttributes = function (form) {
		const data = {};
		const formList = [];
		const formData = JSON.parse(form.dataset.product_variations);
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

		return findMatchingVariations(
			formData,
			formList[formList.length - 1].data
		);
	};

	// the collection of variation sets
	document.querySelectorAll('.variations_form').forEach((form) => {
		const inputs = form.querySelectorAll('.variations input');
		inputs.forEach((input) => {
			input.addEventListener('change', () => {
				if (form.querySelector('.wc-no-matching-variations'))
					form.querySelector('.wc-no-matching-variations').remove();

				// no ajax
				if (!form.dataset.length) {
					$form.trigger('woocommerce_variation_select_change');
				}

				const inputsData = radioGetChosenAttributes(form);

				inputs.forEach((i) => {
					if (i.name === input.name) {
						// disable all the siblings of the selected button selected
						if (i !== input) {
							i.nextElementSibling.classList.add('disabled');
						} else {
							i.nextElementSibling.classList.remove('disabled');
						}
					} else {
						console.log(inputsData);
					}
				});
			});
		});

		// On clicking the reset variation button
		form.querySelector('.reset_variations').addEventListener(
			'click',
			(event) => {
				event.preventDefault();

				form.querySelectorAll('.variations .wrb-list').forEach(
					function (el) {
						const radio = el.querySelector('input[type="radio"]');
						radio.checked = false;
					}
				);

				form.querySelectorAll('.radio__none input').forEach(
					(radioNone) => {
						radioNone.checked = true;
						radioNone.click();
					}
				);
			}
		);
	});
});
