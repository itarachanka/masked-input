import React, { Component, PropTypes } from 'react';
import { getSelection, setSelection } from 'react/lib/ReactInputSelection';
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
 *      // Mask phone
 *      <MaskedInput mask="+### ?0## ### ####" placeholder="+375 029 123 4567"/>
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
    value: PropTypes.string,
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
      C: /[a-zA-Z]/,
      // leading zero
      0: '0'
    },
    onChange: () => {}
  };

  constructor(props) {
    super(props);
    this.queue = {
      timeout: null,
      fromCaret: 0
    };

    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleKeypress = this.handleKeypress.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
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
    const value = nextProps.value;
    const current = element ? element.value : '';

    this.inputMask.setProps(nextProps);
    if (current !== value) {
      this.updateInput(value);
    }
  }

  /**
   * Calls change handler.
   *
   * @protected
   */
  change() {
    const element = this.refs.input;
    const value = element.value;

    this.props.onChange(value);
  }

  /**
   * Gets mask value.
   *
   * @protected
   */
  maskValue() {
    return this.inputMask.mask(this.props.value);
  }

  /**
   * Splits input value by selection position.
   *
   * @private
   */
  splitValue() {
    const element = this.refs.input;
    const value = element.value;
    const selection = getSelection(element);
    const start = selection.start;
    const end = selection.end;
    const prependix = this.inputMask.unmask(value.substring(0, start));
    const appendixStart = end > 0 ? value.substring(0, end).length : 0;
    const appendix = this.inputMask.unmask(value.substring(end), appendixStart);

    return {
      start,
      end,
      prependix,
      appendixStart,
      appendix
    };
  }

  /**
   * Updates input.
   *
   * @private
   */
  updateInput(value, selection) {
    const element = this.refs.input;

    element.value = this.inputMask.mask(value);
    if (selection) {
      setSelection(element, { start: selection });
    }
  }

  /**
   * Handles keydown event.
   *
   * @private
   * @callback keydown
   */
  handleKeydown(e) {
    const key = e.keyCode;
    const element = e.target;
    let value = element.value;
    let step = 1;

    if (key === keys.BACKSPACE || key === keys.DELETE) {
      let { start, end, prependix, appendix } = this.splitValue();

      if (key === keys.BACKSPACE && start === end) {
        prependix = prependix.slice(0, -1);
        step = -1;
        start -= 1;
      }

      if (key === keys.DELETE && start === end) {
        appendix = appendix.substring(1);
      }

      this.updateInput(prependix + appendix);
      value = element.value;
      // sets caret respectful to input.
      while (start > -1 || start <= value.length) {
        if (value.charAt(start) !== this.inputMask.tokens[start]) {
          break;
        }

        start += step;
      }
      setSelection(element, { start });
      this.change();
      e.preventDefault();
    } else if (key === keys.ENTER) {
      this.change();
      e.preventDefault();
    }
  }

  /**
   * Handles keypress event.
   *
   * @private
   * @callback keypress
   */
  handleKeypress(e) {
    if (e.which === 0 || e.metaKey || e.ctrlKey || e.keyCode === keys.ENTER) {
      return;
    }

    const element = e.target;
    const queue = this.queue;
    let value = element.value;
    const { start, end, prependix, appendix } = this.splitValue();

    clearTimeout(queue.timeout);
    if (!queue.prependix) {
      queue.prependix = prependix;
      queue.maskedPrependix = value.substring(0, start);
      queue.appendix = appendix;
      queue.maskedAppendix = value.substring(end);
    }

    queue.timeout = setTimeout(() => {
      value = element.value;
      const len = queue.maskedAppendix.length ? -queue.maskedAppendix.length : value.length;
      const input = value.slice(queue.maskedPrependix.length, len);
      const selectionStart = this.inputMask.mask(`${queue.prependix}${input}`).length;
      this.updateInput(`${queue.prependix}${input}${queue.appendix}`, selectionStart);
      this.change();
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
  handlePaste(e) {
    const element = e.target;
    const valueLength = element.value.length;
    const { start, end, prependix, appendix } = this.splitValue();

    setTimeout(() => {
      const value = element.value;
      // pasted value is in current input value,
      // positioned from selection start to appendix length,
      // laid off the end of current input value
      const pasted = value.substring(start, value.length - valueLength + end);
      const selectionStart = this.inputMask.mask(prependix + pasted).length;

      this.updateInput(prependix + pasted + appendix, selectionStart);
      this.change();
    });
  }

  /**
   * @override
   */
  render() {
    const {
      value,
      ...props,
    } = this.props;

    return (
      <input
        {...props}
        ref="input"
        type="text"
        autoComplete="off"
        defaultValue={this.maskValue()}
        onKeyDown={this.handleKeydown}
        onKeyPress={this.handleKeypress}
        onPaste={this.handlePaste}
      />
    );
  }
}

export default MaskedInput;
