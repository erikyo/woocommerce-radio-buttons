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

define( 'WRB_PATH', __FILE__ );
define( 'WRB_VERSION', '3.0.0' );

/**
 * Register scripts
 *
 * @since 2.4.0
 */
function register_woo_radio_button_scripts() {
	wp_register_script( 'wc-radio-add-to-cart-variation', plugin_dir_url( WRB_PATH ) . 'build/add-to-cart-variation-radio.js', array( 'jquery' ), WRB_VERSION, true );
	wp_enqueue_style( 'wc-radio-button-styles', plugin_dir_url( WRB_PATH ) . 'build/woo-radio-variations.css', array(), WRB_VERSION );
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
	 * @since 2.4.0
	 */
	function wc_dropdown_variation_attribute_options( array $args = array() ) {
		$args = wp_parse_args(
			// phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHooksComment
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
			$selected_key = 'attribute_' . sanitize_title( $args['attribute'] );
			// phpcs:disable WordPress.Security.NonceVerification.Recommended
			$args['selected'] = isset( $_REQUEST[ $selected_key ] ) ? wc_clean( wp_unslash( $_REQUEST[ $selected_key ] ) ) : $args['product']->get_variation_default_attribute( $args['attribute'] );
			// phpcs:enable WordPress.Security.NonceVerification.Recommended
		}

		$options               = $args['options'];
		$product               = $args['product'];
		$attribute             = $args['attribute'];
		$name                  = $args['name'] ? $args['name'] : 'attribute_' . sanitize_title( $attribute );
		$id                    = $args['id'] ? $args['id'] : sanitize_title( $attribute );
		$class                 = $args['class'];
		$show_option_none      = (bool) $args['show_option_none'];
		$show_option_none_text = $args['show_option_none'] ? $args['show_option_none'] : __( 'Choose an option', 'woocommerce' ); // We'll do our best to hide the placeholder, but we'll need to show something when resetting options.

		if ( empty( $options ) && ! empty( $product ) && ! empty( $attribute ) ) {
			$attributes = $product->get_variation_attributes();
			$options    = $attributes[ $attribute ];
		}

		$html = '';

		if ( ! empty( $options ) ) {

			$opt = array(
				'name'      => esc_attr( $name ),
				'attribute' => esc_attr( sanitize_title( $attribute ) ),
			);

			$html .= '<div class="wrb">';

			/* translators: %s: the name of the attribute, will print something like "Choose color" or "Choose size" */
			$html .= '<p class="product-attribute attribute-' . $opt['name'] . '">' . sprintf( esc_html( __( 'Choose %s', 'woocommerce' ) ), wc_attribute_label( $attribute ) ) . '</p>';

			/* TODO: fix this because ul doesn't allow attribute "name" */
			$html .= sprintf(
				'<ul id="%s" class="wrb-list %s" name="%s" data-attribute_name="attribute_%s" data-show_option_none="%s">',
				intval( $id ),
				esc_attr( $class ),
				$opt['name'],
				$opt['attribute'],
				$show_option_none ? 'yes' : 'no'
			);

			if ( $show_option_none ) {
				$input_id = uniqid( 'attribute_' );
				$html    .= sprintf(
					'<li class="wrb-item radio__none"><input id="radio__%s" type="radio" name="%s" value="" %s /><label class="button" for="radio__%s">%s</label></li>',
					esc_attr( $input_id ),
					$opt['name'],
					checked( sanitize_title( $args['selected'] ), '', false ),
					esc_attr( $input_id ),
					// phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHooksComment
					esc_html( apply_filters( 'woocommerce_variation_option_none_radio', $show_option_none_text, $product ) )
				);
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
						$html    .= sprintf(
							'<li class="wrb-item attribute_%s radio__term"><input id="radio__%s" type="radio" name="%s" value="%s" %s/><label class="button" for="radio__%s">%s</label></li>',
							esc_attr( $term->slug ),
							esc_attr( $input_id ),
							$opt['name'],
							esc_attr( $term->slug ),
							checked( sanitize_title( $args['selected'] ), $term->slug, false ),
							esc_attr( $input_id ),
							// phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHooksComment
							esc_html( apply_filters( 'woocommerce_variation_option_name', $term->name, $term, $attribute, $product ) )
						);
					}
				}
			} else {
				foreach ( $options as $option ) {
					// This handles < 2.4.0 bw compatibility where text attributes were not sanitized.
					$input_id = uniqid( 'attribute_' );
					$selected = checked( $args['selected'], sanitize_title( $option ), false );
					$html    .= sprintf(
						'<li class="wrb-item attribute_%s radio__option"><input id="radio__%s" type="radio" name="%s" value="%s" %s><label class="button" for="radio__%s">%s</label></li>',
						$option,
						esc_attr( $input_id ),
						$opt['name'],
						esc_attr( $option ),
						$selected,
						esc_attr( $input_id ),
						// phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHooksComment
						esc_html( apply_filters( 'woocommerce_variation_option_name', $option, null, $attribute, $product ) )
					);
				}
			}

			echo '</ul></div>';
		}

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo apply_filters( 'woocommerce_dropdown_variation_attribute_options_html', $html, $args );
	}
}
