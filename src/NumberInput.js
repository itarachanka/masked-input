import { PropTypes } from 'react';
import MaskedInput from './MaskedInput';
import NumberMask from './NumberMask';

function strRepeat(str, qty) {
  if (qty < 1) return '';
  let result = '';

  while (qty > 0) {
    if (qty & 1) result += str;
    qty >>= 1;
    str += str;
  }
  return result;
}

/**
 * Masked number input widget.
 *
 * @class NumberInput
 * @extends MaskedInput
 * @usage:
 *      // Mask number as string
 *      <NumberInput mask={# ###} value={4000} />
 *
 *      // Mask number
 *      <NumberInput value={4000}
 *                   numberFormat={{
 *                      decimals: 2,
 *                      ',': ' ',
 *                      '.': ',',
 *                      groupSize: [3]
 *                   }}
 *      />
 */
class NumberInput extends MaskedInput {
  static propTypes = {
    numberFormat: PropTypes.object,
    unit: PropTypes.string,
    max: PropTypes.number,
    onBlur: PropTypes.func
  };

  static defaultProps = {
    numberFormat: {
      decimals: 2,
      ',': ' ',
      '.': ',',
      groupSize: [3],
      currency: {
        decimals: 2,
        ',': ' ',
        '.': ',',
        groupSize: [3],
        maskMoney: '# ### ### ### ###'
      }
    },
    onBlur: e => this.handleBlur(e)
  };

  constructor(props) {
    super(props);
    const numberFormat = props.numberFormat;
    const group = numberFormat[','] === ' ' ? 's' : numberFormat[','];
    const decimals = numberFormat['.'];

    this.trimLeadingZerosRegExp = new RegExp(`^[0\\${group}]+(?!\\${decimals}|$)`);
  }

  /**
   * @override
   */
  componentWillMount() {
    this.inputMask = new NumberMask(this.props);
  }

  /**
   * @override
   */
  componentWillReceiveProps(nextProps) {
    const element = this.refs.input;
    const value = nextProps.value;
    let current = element ? element.value : '';

    current = this.inputMask.unmask(current);
    current = (current === '' || isNaN(current)) ? null : Number(current);
    this.inputMask.setProps(nextProps);
    if (current !== value) {
      this.updateInput(value);
    }
  }

  /**
   * @override
   */
  change() {
    const element = this.refs.input;
    let value = element.value;

    value = this.inputMask.unmask(value);
    value = (value === '' || isNaN(value)) ? null : Number(value);
    this.props.onChange(value);
  }

  /**
  * Handles blur event.
   *
   * @private
   * @callback blur
   */
  handleBlur(e) {
    e.target.value = this.pad(e.target.value);
  }

  /**
   * Pads a value with '0' characters.
   *
   * @private
   * @returns {String} the value
   */
  pad(value) {
    const placeholder = this.props.placeholder;
    const numberFormat = this.props.numberFormat;
    const decimals = numberFormat.decimals;
    let parts;

    value = value.replace(this.trimLeadingZerosRegExp, '');
    if (decimals) {
      parts = value.split(numberFormat['.']);
      if (!parts[0]) {
        parts[0] = '0';
      }
      if (parts[1]) {
        parts[1] = parts[1] + strRepeat('0', decimals - parts[1].length);
      } else {
        parts[1] = strRepeat('0', decimals);
      }
      value = parts.join(numberFormat['.']);
    }
    return value === placeholder ? '' : value;
  }

  /**
   * @override
   */
  maskValue() {
    const maskValue = this.inputMask.mask(this.props.value);

    return maskValue !== '' ? this.pad(maskValue) : null;
  }
}

export default NumberInput;
