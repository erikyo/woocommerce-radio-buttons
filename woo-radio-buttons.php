<?php
/**
 * Plugin Name: Woo Radio Buttons
 * Plugin URI: http://designloud.com/downloads/woo-radio-buttons-3.0.zip
 * Description: <strong>This is the radio buttons compatible with Woocommerce 4.2+.<br /><strong>If you find this plugin useful please consider <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=NUSCJBYCS8UL8" target="_blank">making a donation</a>, because well it wasnt easy getting this puppy goin. Thanks and enjoy!</strong>
 * Author: DesignLoud
 * Version: 3.0.0
 * Author URI: http://designloud.com
 * Tested up to: 5.5.0
 * WC tested up to: 4.4.0
 * WC requires at least: 4.3.0
 *
 * @package woo_radio_buttons
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

define( 'WCB_PATH', __FILE__ );
define( 'WCB_VERSION', '3.0.0' );

/**
 * Register scripts
 *
 * @since 2.4.0
 */
function register_woo_radio_button_scripts() {
	wp_register_script( 'wc-radio-add-to-cart-variation', plugin_dir_url( WCB_PATH ) . 'build/add-to-cart-variation-radio.js', array( 'jquery' ), WCB_VERSION, true );
	wp_enqueue_style( 'wc-radio-button-styles', plugin_dir_url( WCB_PATH ) . 'build/woo-radio-variations.css', array(), WCB_VERSION );
}
add_action( 'wp_enqueue_scripts', 'register_woo_radio_button_scripts' );

/**
 * Load scripts on variable product pages.
 *
 * @since 3.0.0
 */
function woo_radio_button_enqueue_scripts() {
	wp_enqueue_script( 'wc-radio-add-to-cart-variation' );
}
add_action( 'woocommerce_variable_add_to_cart', 'woo_radio_button_enqueue_scripts' );


if ( ! function_exists( 'wc_dropdown_variation_attribute_options' ) ) {
	/**
	 * Output a list of variation attributes for use in the cart forms.
	 *
	 * @param array $args this plugin options.
	 *
	 * @since 2.4.0
	 */
	function wc_dropdown_variation_attribute_options( array $args = array() ) {
		$args = wp_parse_args(
			apply_filters( 'woocommerce_dropdown_variation_attribute_options_args', $args ),
			array(
				'options'          => false,
				'attribute'        => false,
				'product'          => false,
				'selected'         => false,
				'name'             => '',
				'id'               => '',
				'class'            => '',
				'show_option_none' => __( 'None', 'woocommerce' ),
			)
		);

		// Get selected value.
		if ( false === $args['selected'] && $args['attribute'] && $args['product'] instanceof WC_Product ) {
			$selected_key     = 'attribute_' . sanitize_title( $args['attribute'] );
			$args['selected'] = isset( $_REQUEST[ $selected_key ] ) ? wc_clean( wp_unslash( $_REQUEST[ $selected_key ] ) ) : $args['product']->get_variation_default_attribute( $args['attribute'] ); // WPCS: input var ok, CSRF ok, sanitization ok.
		}

		$attribute_clean_title = sanitize_title( $args['attribute'] );

		$options               = $args['options'];
		$product               = $args['product'];
		$attribute             = $args['attribute'];
		$name                  = $args['name'] ?: $attribute_clean_title;
		$id                    = $args['id'] ? sanitize_html_class( $attribute ) : 'wrc_' . $attribute_clean_title;
		$class                 = $args['class'] ? sanitize_html_class( $attribute ) : $id;
		$show_option_none      = boolval( $args['show_option_none'] );
		$show_option_none_text = $args['show_option_none'] ?: __( 'None', 'woocommerce' ); // We'll do our best to hide the placeholder, but we'll need to show something when resetting options.

		if ( empty( $options ) && ! empty( $product ) && ! empty( $attribute ) ) {
			$attributes = $product->get_variation_attributes();
			$options    = $attributes[ $attribute ];
		}

		$html = '';

		if ( ! empty( $options ) ) {

			$html .= '<div id="radio_variations">';

			/* translators: %s: the name of the attribute, will print something like "Choose color" or "Choose size" */
			$html .= '<p class="product-attribute attribute-' . $attribute_clean_title . '">' . sprintf( esc_html( __( 'Choose %s', 'woocommerce' ) ), wc_attribute_label( $attribute ) ) . '</p>';

			$html .= sprintf( '<ul id="%s" class="radio__variations--list %s" data-attribute_name="%s">', $id, $class, $args['attribute'] );

			if ( $show_option_none ) {
				$input_id = uniqid( 'attribute_' );
				$html    .= '<li class="radio__variations--item radio__none">' .
					'<input id="radio__' . esc_attr( $input_id ) . '" type="radio" name="' . esc_attr( $name ) . '" value="" ' . checked( sanitize_title( $args['selected'] ), '', false ) . '/>' .
					'<label class="button" for="radio__' . esc_attr( $input_id ) . '">' . esc_html( apply_filters( 'woocommerce_variation_option_none_radio', $show_option_none_text, $product ) ) . '</label>' .
				'</li>';
			}

			if ( $product && taxonomy_exists( $attribute ) ) {
				// Get terms if this is a taxonomy - ordered. We need the names too.
				$terms = wc_get_product_terms(
					$product->get_id(),
					$attribute,
					array(
						'fields' => 'all',
					)
				);

				foreach ( $terms as $term ) {
					if ( in_array( $term->slug, $options, true ) ) {
						$input_id = uniqid( 'attribute_' );
						$html    .= '<li class="radio__variations--item pa_' . $term->slug . ' radio__term">' .
						'<input id="radio__' . esc_attr( $input_id ) . '" type="radio" name="' . esc_attr( $name ) . '" value="' . esc_attr( $term->slug ) . '" ' . checked( sanitize_title( $args['selected'] ), $term->slug, false ) . '/>' .
						'<label class="button" for="radio__' . esc_attr( $input_id ) . '">' . esc_html( apply_filters( 'woocommerce_variation_option_name', $term->name, $term, $attribute, $product ) ) . '</label>' .
						'</li>';
					}
				}
			} else {
				foreach ( $options as $option ) {
					$input_id = uniqid( 'attribute_' );
					$selected = checked( $args['selected'], sanitize_title( $option ), false );
					$html    .= '<li class="radio__variations--item pa_' . $option . ' radio__option">' .
					'<input id="radio__' . esc_attr( $input_id ) . '" type="radio" name="' . esc_attr( $name ) . '" value="' . esc_attr( $option ) . '" ' . $selected . '>' .
					'<label class="button" for="radio__' . esc_attr( $input_id ) . '">' . esc_html( apply_filters( 'woocommerce_variation_option_name', $option, null, $attribute, $product ) ) . '</label>' .
					'</li>';
				}
			}
		}

		echo '</div>';

		echo apply_filters( 'woocommerce_dropdown_variation_attribute_options_html', $html, $args ); // WPCS: XSS ok.
	}
}
