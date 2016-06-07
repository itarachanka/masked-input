import React, {Component, PropTypes} from 'react';
import {getSelection, setSelection} from 'react/lib/ReactInputSelection';
import StringMask from './StringMask';

const SLOW_MODE_DELAY = 20;
const keys = {
    BACKSPACE: 8,
    COMMA: 188,
    DELETE: 46,
    DOWN: 40,
    END: 35,
    ENTER: 13,
    ESCAPE: 27,
    HOME: 36,
    LEFT: 37,
    PAGE_DOWN: 34,
    PAGE_UP: 33,
    PERIOD: 190,
    RIGHT: 39,
    SPACE: 32,
    TAB: 9,
    UP: 38
};

/**
 * Masked text input widget.
 * 
 * @class MaskedInput
 * @extends React.Component
 * @usage: 
 *      // Mask date
 *      <MaskedInput value="07/01/1985" mask="##//##//####" />
 *
 *      // Mask card's number
 *      <MaskedInput mask="#### #### #### ####"
 *                   value="0000 0000 0000 0000"
 *      />
 *
 *      // Mask for some s/n with optional characters and
 *      // escaped special characters
 *      // sd-123?x would be accepted, as well as sdf-456?n
 *      <MaskedInput mask="CC?C-###/?C" />
 */
class MaskedInput extends Component {
    static propTypes = {
        mask: PropTypes.string.isRequired,
        reverse: PropTypes.bool,
        rules: PropTypes.object,
        onChange: PropTypes.func
    };

    static defaultProps = {
        reverse: false,
        rules: {
            // just a digit
            '#': /\d/,
            // as in String
            'C': /[a-zA-Z]/,
            // leading zero
            '0': '0'
        },
        onChange: () => {}
    };

    constructor(props) {
        super(props);
        this._queue = {
            timeout: null,
            fromCaret: 0
        };
    }

    /**
     * @override
     */
    componentWillMount() {
        this.inputMask = new StringMask(this.props);
    }

    /**
     * @override
     */
    componentWillReceiveProps(nextProps) {
        const element = this.refs.input;
        let value = nextProps.value;
        let current = element ? element.value : '';

        this.inputMask.setProps(nextProps);
        if (current != value) {
            this._updateInput(value);
        }
    }

    /**
     * Calls change handler.
     * 
     * @protected
     */
    _change() {
        const element = this.refs.input;
        let value = element.value;

        this.props.onChange(value);
    }

    /**
     * Gets mask value.
     * 
     * @protected
     */
    _maskValue() {
        return this.inputMask.mask(this.props.value);
    }

    /**
     * Splits input value by selection position.
     * 
     * @private
     */
    _splitValue() {
        const element = this.refs.input;
        const value = element.value;
        const selection = getSelection(element);
        const start = selection.start;
        const end = selection.end;
        const prependix = this.inputMask.unmask(value.substring(0, start));
        const appendixStart = end > 0 ? value.substring(0, end).length : 0;
        const appendix = this.inputMask.unmask(value.substring(end), appendixStart);

        return {
            start: start,
            end: end,
            prependix: prependix,
            appendixStart: appendixStart,
            appendix: appendix
        };
    }

    /**
     * Updates input.
     * 
     * @private
     */
    _updateInput(value, selection) {
        const element = this.refs.input;
        element.value = this.inputMask.mask(value);
        if (selection) {
            setSelection(element, {start: selection});
        }
    }

    /**
     * Handles keydown event.
     * 
     * @private
     * @callback keydown
     */
    _handleKeydown(e) {
        const key = e.keyCode;
        const element = e.target;
        let value = element.value;
        let step = 1;

        if (key === keys.BACKSPACE || key === keys.DELETE) {
            let {start, end, prependix, appendix} = this._splitValue();

            if (key === keys.BACKSPACE && start == end) {
                prependix = prependix.slice(0, -1);
                step = -1;
                start -= 1;
            }

            if (key === keys.DELETE && start == end) {
                appendix = appendix.substring(1);
            }

            this._updateInput(prependix + appendix);
            value = element.value;
            // sets caret respectful to input.
            while (start > -1 || start <= value.length) {
                if (value.charAt(start) !== this.inputMask.tokens[start]) {
                    break;
                }

                start += step;
            }
            setSelection(element, {start: start});
            this._change();
            e.preventDefault();
        } else if (key === keys.ENTER) {
            this._change();
            e.preventDefault();
        }
    }

    /**
     * Handles keypress event.
     * 
     * @private
     * @callback keypress
     */
    _handleKeypress(e) {
        if (e.which === 0 || e.metaKey || e.ctrlKey || e.keyCode === keys.ENTER) {
            return;
        }

        const element = e.target;
        const queue = this._queue;
        let value = element.value;
        let {start, end, prependix, appendix} = this._splitValue();

        clearTimeout(queue.timeout);
        if (!queue.prependix) {
            queue.prependix = prependix;
            queue.maskedPrependix = value.substring(0, start);
            queue.appendix = appendix;
            queue.maskedAppendix = value.substring(end);
        }

        queue.timeout = setTimeout(() => {
            value = element.value;
            let input = value.slice(queue.maskedPrependix.length, (queue.maskedAppendix.length ? -queue.maskedAppendix.length : value.length));
            this._updateInput(queue.prependix + input + queue.appendix, this.inputMask.mask(queue.prependix + input).length);
            this._change();
            queue.prependix = false;
            queue.appendix = false;
        }, SLOW_MODE_DELAY);
    }

    /**
     * Handles paste event.
     * 
     * @private
     * @callback paste
     */
    _handlePaste(e) {
        const element = e.target;
        const valueLength = element.value.length;
        let {start, end, prependix, appendix} = this._splitValue();

        setTimeout(() => {
            let value = element.value;
            // pasted value is in current input value,
            // positioned from selection start to appendix length,
            // laid off the end of current input value
            let pasted = value.substring(start, value.length - valueLength + end);

            this._updateInput(prependix + pasted + appendix, this.inputMask.mask(prependix + pasted).length);
            this._change();
        });
    }

    /**
     * @override
     */
    render() {
        const {
            value,
            ...other,
          } = this.props;

        return (
            <input {...other}
               ref="input"
               type="text"
               autoComplete="off"
               defaultValue={this._maskValue()}
               onKeyDown={this._handleKeydown.bind(this)}
               onKeyPress={this._handleKeypress.bind(this)}
               onPaste={this._handlePaste.bind(this)}
            />
        );
    }
}

export default MaskedInput;
