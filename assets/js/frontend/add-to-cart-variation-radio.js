document.addEventListener("DOMContentLoaded", () => {
  const $form = jQuery(".variations_form");

  /**
   * @param {Object} variationAttributes - The Array of Product Attributes -> {attribute_logo: "Yes", attribute_pa_color: "blue"}
   * @param {Object} attributes          - the selected attribute to match with the variation Attributes -> {attribute_pa_color: "green"}
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
   * @param {Object} variations - the array of variations -> [0: {attributes: {…}, …},1: {attributes: {…}, …},2: {attributes: {…}, …}, …] length: 3
   * @param {Object} attributes -the selected attributes -> {attribute_pa_color: "green"}
   * @return {Object} matched variations - the matching variation from the array attributes
   */
  const findMatchingVariations = (variations, attributes) => {
    const matching = [];
    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];

      if (isMatch(variation.attributes, attributes)) matching.push(variation);
    }
    return matching;
  };

  const matchVariation = (attributes, variation) => {
    try {
      attributes.forEach((data) => {
        if (
          data.attributes[variation.name] &&
          data.attributes[variation.name] === variation.value
        ) {
          throw "true";
        }
      });
      // element value was never found into data attributes
      return false;
    } catch (e) {
      if (e === "true") {
        return true;
      }
    }
  };

  /**
   * Get chosen attributes from form.
   *
   * @param {Element} form - the form where this plugin is playing
   * @return {Object} formList - the product available with the current selection
   */
  const radioGetChosenAttributes = (form) => {
    const data = {};
    let formList;
    let count = 0;
    let chosen = 0;

    form.querySelectorAll(".variations .wrb-list").forEach((radioList) => {
      count++;

      /*
       * selected: the selected radio
       * name: the term
       */
      const selected = radioList.querySelector("input:checked");
      if (selected.parentElement.classList.contains("radio__none"))
        return false;
      const attributeName = radioList.dataset.attribute_name || selected.name;
      const value = selected.value || false;

      if (value) chosen++; // update counters

      data[attributeName] = value;

      formList = {
        count,
        chosenCount: chosen,
        data,
      };
    });

    $form.trigger("check_variations", formList);

    return formList;
  };

  /**
   * @param {Element} button - disable this button
   */
  const disableButton = (button) => {
    button.classList.add("disabled");
    button.classList.remove("active");
    // console.log(button.name + button.value + " disabled");
  };

  /**
   * @param {Element} button - enable this button
   */
  const enableButton = (button) => {
    button.classList.remove("disabled");
    // console.log(button.name + ":" + button.value + " enabled");
  };

  /* Loops for each collection of variation... */
  document.querySelectorAll(".variations_form").forEach((form) => {
    const inputs = form.querySelectorAll(".variations input");
    const formData = JSON.parse(form.dataset.product_variations);

    /* Loops for each input of the collection */
    inputs.forEach((current) => {
      /*
       * listen for this input changes
       */
      current.addEventListener("click", () => {
        if (form.querySelector(".wc-no-matching-variations"))
          form.querySelector(".wc-no-matching-variations").remove();

        // update dataset if ajax isn't enabled
        if (!form.dataset.length)
          $form.trigger("woocommerce_variation_select_change");

        /*
         * Fired if the input is active
         */
        if (current.classList.contains("active")) {
          const parentUL = current.parentElement.parentElement;
          parentUL.querySelectorAll(`input`).forEach((inputWithTerm) => {
            inputWithTerm.classList.remove("active");
          });
          const radioNone = parentUL.querySelector(`.radio__none input`);
          radioNone.click();
        } else {
          /*
           * Refresh the variations array (used to find matching products)
           * first we get the attributes
           */
          const chosenAttributes = radioGetChosenAttributes(form);

          /*
           * Fetch the variations array in order to find matching terms
           */
          const matchingVariations = chosenAttributes
            ? findMatchingVariations(formData, chosenAttributes.data)
            : {};

          // then for each input
          inputs.forEach((input) => {
            // if the input match the taxonomy or
            // if the none button was clicked
            if (input.name === current.name || !current.value) {
              if (!current.value) {
                // if the current was the none button
                enableButton(input);
                if (input.value && !input.checked)
                  input.classList.remove("active");
              } else if (input === current) {
                // if the selected input is the current
                enableButton(input);
                input.classList.add("active");
              } else {
                // the other button of the same tax will be disabled
                disableButton(input);
              }
            } else if (input.checked) {
              // enableButton(input);
            } else if (
              // if the button is the none button or
              // the current taxonomy match the selected input taxonomy
              // disable the siblings button
              matchVariation(matchingVariations, input)
            ) {
              enableButton(input);
            } else {
              /* the input DOESN'T match the taxonomy AND is checked */
              disableButton(input);
              input.classList.remove("active");
            }
          });
        }
      });
    });

    /* On clicking the reset variation button */
    form
      .querySelector(".reset_variations")
      .addEventListener("click", (event) => {
        event.preventDefault();
        form
          .querySelectorAll('.variations .wrb-list input[type="radio"]')
          .forEach((radio) => {
            radio.checked = false;
            enableButton(radio);
          });
        form.querySelectorAll(".radio__none input").forEach((noneButton) => {
          noneButton.checked = true;
          noneButton.click();
          enableButton(noneButton);
        });
      });
  });
});
