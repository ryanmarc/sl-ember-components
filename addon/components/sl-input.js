import Ember from 'ember';
import InputBased from '../mixins/sl-input-based';
import TooltipEnabled from '../mixins/sl-tooltip-enabled';

/**
 * @module components
 * @class  sl-input
 */
export default Ember.Component.extend( InputBased, TooltipEnabled, {

    // -------------------------------------------------------------------------
    // Dependencies

    // -------------------------------------------------------------------------
    // Attributes

    /**
     * Attribute bindings for the containing div
     *
     * @property {Ember.Array} attributeBindings
     */
    attributeBindings: [ 'class' ],

    /**
     * Class names for the containing div
     *
     * @property {Ember.Array} classNames
     */
    classNames: [ 'form-group', 'sl-input' ],

    // -------------------------------------------------------------------------
    // Actions

    /**
     * Component actions hash
     *
     * @property {Ember.Object} actions
     */
    actions: {

        /**
         * Sends the 'blur' bound action when the input loses focus
         *
         * @function actions.blurred
         * @returns  {void}
         */
        blur: function() {
            this.sendAction( 'blur' );
        },

        /**
         * Sends the primary bound action when `enter` is pressed
         *
         * @function actions.enter
         * @returns  {void}
         */
        enter: function() {
            this.sendAction();
        }
    },

    // -------------------------------------------------------------------------
    // Events

    // -------------------------------------------------------------------------
    // Properties

    /**
     * Enable the click to edit styling
     *
     * @property {boolean} clickToEdit
     * @default  false
     */
    clickToEdit: false,

    /**
     * Whether the typeahead.js functionality has been setup
     *
     * @property {boolean} isTypeaheadSetup
     * @default  false
     */
    isTypeaheadSetup: false,

    /**
     * Lookup path for the suggestion items' name
     *
     * @property {Ember.String} suggestionLabelPath
     * @default  "name"
     */
    suggestionNamePath: 'name',

    /**
     * Type attribute for the containing div
     *
     * @property {Ember.String} type
     * @default  "text"
     */
    type: 'text',

    // -------------------------------------------------------------------------
    // Observers

    /**
     * Sets up the input event listeners exposed to the component's
     * parent controller
     *
     * @function setupInputEvents
     * @observes didInsertElement event
     * @returns  {void}
     */
    setupInputEvents: function() {
        var self = this;

        if ( this.get( 'blur' ) ) {
            this.getInput().on( 'blur', function() {
                self.sendAction( 'blur' );
            });
        }
    }.on( 'didInsertElement' ),

    /**
     * Sets up the typeahead behavior when `suggestions` are supplied
     *
     * @function setupTypeahead
     * @observes didInsertElement event, suggestions
     * @returns  {void}
     */
    setupTypeahead: function() {
        var self = this;

        if ( this.get( 'suggestions' ) && !this.get( 'isTypeaheadSetup' ) ) {
            var namePath = this.get( 'suggestionNamePath' ),
                typeahead;

            typeahead = this.getInput().typeahead({
                highlight : true,
                hint      : true
            }, {
                displayKey: function( item ) {
                    if ( item instanceof Object ) {
                        return Ember.get( item, namePath );
                    }

                    return item;
                },

                source: function( query, callback ) {
                    var pattern = new RegExp( query, 'i' );

                    callback( self.get( 'suggestions' ).filter( function( suggestion ) {
                        var searchCandidate;

                        if ( suggestion instanceof Object ) {
                            searchCandidate = Ember.get( suggestion, namePath );
                        } else {
                            searchCandidate = suggestion;
                        }

                        return searchCandidate ? searchCandidate.match( pattern ) : false;
                    }));
                }
            });

            /* jshint ignore:start */
            var selectItem = function( event, item ) {
                Ember.run( function() {
                    var value = item instanceof Object ? Ember.get( item, namePath ) : item;

                    self.set( 'value', value );
                });
            };

            typeahead.on( 'typeahead:autocompleted', selectItem );
            typeahead.on( 'typeahead:selected', selectItem );
            /* jshint ignore:end */

            this.set( 'isTypeaheadSetup', true );
        }
    }.on( 'didInsertElement' ).observes( 'suggestions' ),

    /**
     * Remove events
     *
     * @function unregisterEvents
     * @observes "willClearRender" event
     * @returns  {void}
     */
    unregisterEvents: function() {
        this.getInput().off();
    }.on( 'willClearRender' ),

    // -------------------------------------------------------------------------
    // Methods

    /**
     * Get a reference to the internal input element
     *
     * @function getInput
     * @returns  {object}
     */
    getInput: function() {
        return this.$( 'input' );
    },

    /**
     * Class string for the internal input element
     *
     * @function inputClass
     * @returns  {string}
     */
    inputClass: function() {
        var classes = [ 'form-control' ];

        if ( this.get( 'clickToEdit' ) ) {
            classes.push( 'click-to-edit' );
        }

        if ( this.get( 'suggestions' ) ) {
            classes.push( 'typeahead' );
        }

        return classes.join( ' ' );
    }.property()
});
