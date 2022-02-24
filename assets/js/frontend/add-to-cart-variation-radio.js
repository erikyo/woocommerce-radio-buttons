document.addEventListener('DOMContentLoaded', () => {
	// the collection of variation sets
	const variationsForms = document.querySelectorAll('.variations_form');
	const $form = jQuery('.variations_form');

	// Get chosen attributes from form.
	const radioGetChosenAttributes = function (form) {
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

				const data = {};
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

	variationsForms.forEach((form) => {
		form.addEventListener('wc_variation_form', () => {
			radioGetChosenAttributes(form);
		});

		form.querySelectorAll('.variations input').forEach((input) => {
			input.addEventListener('change', () => {
				if (form.querySelector('.wc-no-matching-variations'))
					form.querySelector('.wc-no-matching-variations').remove();

				if (!form.dataset.length) {
					$form.trigger('woocommerce_variation_select_change');
				}

				radioGetChosenAttributes(form);
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
