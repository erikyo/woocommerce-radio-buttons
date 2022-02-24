document.addEventListener('DOMContentLoaded', () => {
	// the collection of variation sets
	const variationsForms = document.querySelectorAll('.variations_form');
	const $form = jQuery('.variations_form');

	// Get chosen attributes from form.
	const radioGetChosenAttributes = function (form) {
		const formList = [];
		let count = 0;
		let chosen = 0;

		form.querySelectorAll('.variations .radio__variations--list').forEach(
			(radioList, index) => {
				// the selected radio
				const selected = radioList.querySelector('input:checked');
				// the name of the attribute
				const attributeName =
					radioList.dataset.attribute_name || selected.name;
				const value = selected.value || false;
				if (value) chosen++;
				count++;

				const data = {};
				data[attributeName] = value;

				const el = {
					count,
					chosenCount: chosen,
					data,
				};

				$form.trigger('check_variations', el);
				formList[index] = el;
			}
		);
		console.log(formList);
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
			'change',
			(event) => {
				event.preventDefault();

				form.querySelectorAll(
					'.variations .radio__variations--list'
				).forEach(function (el) {
					el.querySelector('input[type="radio"]').checked = false;

					const firstInput = el.querySelector(
						'.radio__variations--item:first-child input'
					);
					firstInput.checked = true;
					firstInput.click();
				});
			}
		);

		// Custom callback to tell Woo to check variations with our radio attributes.
		form.addEventListener('check_radio_variations', (el) => {});
	});
});
