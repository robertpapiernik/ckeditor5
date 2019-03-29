/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module remove-format/removeformatcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import DocumentSelection from '@ckeditor/ckeditor5-engine/src/model/documentselection';

const removableAttributes = [
	'bold',
	'italic',
	'underline',
	'strikethrough',
	'code',
	'subscript',
	'superscript',
	'fontSize',
	'fontFamily',
	'alignment',
	'highlight'
];

/**
 * The remove format command.
 *
 * It is used by the {@link module:remove-format/removeformat~RemoveFormat remove format feature}
 * to clear the formatting in the selection.
 *
 *		editor.execute( 'removeFormat' );
 *
 * @extends module:core/command~Command
 */
export default class RemoveFormatCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const selection = this.editor.model.document.selection;

		this.isEnabled = !this._getStylableElements( selection ).next().done;
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const model = this.editor.model;

		model.change( writer => {
			for ( const item of this._getStylableElements( model.document.selection ) ) {
				for ( const attributeName of removableAttributes ) {
					if ( item instanceof DocumentSelection ) {
						writer.removeSelectionAttribute( attributeName );
					} else {
						writer.removeAttribute( attributeName, item );
					}
				}
			}
		} );
	}

	/**
	 * Yields items from a selection (including selection itself) that contain styles to be removed
	 * by the remove format feature.
	 *
	 * @protected
	 * @param {module:engine/model/documentselection~DocumentSelection} selection
	 * @returns {Iterable.<module:engine/model/item~Item>|Iterable.<module:engine/model/documentselection~DocumentSelection>}
	 */
	* _getStylableElements( selection ) {
		for ( const curRange of selection.getRanges() ) {
			for ( const item of curRange.getItems() ) {
				if ( itemHasRemovableFormatting( item ) ) {
					yield item;
				}
			}
		}

		// Finally the selection might be styles as well, so make sure to check it.
		if ( itemHasRemovableFormatting( selection ) ) {
			yield selection;
		}

		function itemHasRemovableFormatting( item ) {
			for ( const attributeName of removableAttributes ) {
				if ( item.hasAttribute( attributeName ) ) {
					return true;
				}
			}
		}
	}
}
