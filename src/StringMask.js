import Mask from './Mask';
import Token from './Token';

/**
 * Masks strings.
 *
 * @class StringMask
 */
class StringMask extends Mask {
  constructor(props) {
    super(props);
    this.tokenize();
  }

  /**
   * @override
   * @see {@link Mask#setProps}
   */
  setProps(nextProps) {
    super.setProps(nextProps);
    this.tokenize();
  }

  /**
   * Create list of tokens for mask.
   */
  tokenize() {
    const mask = this.props.mask.split('');
    const tokens = [];
    let screened = false;
    let optional = false;

    mask.forEach((maskChr) => {
      let rule;

      if (screened) {
        rule = maskChr;
      } else {
        switch (maskChr) {
          case '/':
            screened = true;
            break;
          case '?':
            optional = true;
            break;
          default:
            rule = this.props.rules[maskChr] || maskChr;
        }
      }

      if (rule) {
        tokens.push(new Token({
          rule,
          optional
        }));

        optional = false;
        screened = false;
      }
    });

    this.tokens = tokens;
  }

  /**
   * @override
   * @see {@link Mask#mask}
   */
  mask(value) {
    if (!value) {
      return '';
    }

    const reverse = this.props.reverse;
    const valueLength = value.length;
    const tokens = this.tokens;
    const tokensLength = tokens.length;
    const result = [];
    let idx = 0;
    let tokenIdx = 0;
    let step = 1;
    let check = () => {
      return idx < valueLength && tokenIdx < tokensLength;
    };
    let addMethod = 'push';

    if (reverse) {
      check = () => {
        return idx > -1 && tokenIdx > -1;
      };
      addMethod = 'unshift';
      idx = valueLength - 1;
      tokenIdx = tokensLength - 1;
      step = -1;
    }

    while (check()) {
      const chr = value.charAt(idx);
      const token = tokens[tokenIdx];
      const tokenVal = token.value();

      if (token.regular) {
        if (token.check(chr)) {
          result[addMethod](chr);
          tokenIdx += step;
        } else if (token.optional) {
          tokenIdx += step;
          idx -= step;
        }
        idx += step;
      } else {
        result[addMethod](tokenVal);
        if (chr === tokenVal) {
          idx += step;
        }
        tokenIdx += step;
      }
    }

    return result.join('');
  }

  /**
   * @override
   * @see {@link Mask#unmask}
   */
  unmask(value, fromIdx = 0) {
    const reverse = this.props.reverse;
    const valueLength = value.length;
    const tokens = this.tokens;
    const tokensLength = tokens.length;
    const result = [];
    let idx = 0;
    let tokenIdx = fromIdx;
    let step = 1;
    let addMethod = 'push';

    if (reverse) {
      addMethod = 'unshift';
      idx = valueLength - 1;
      tokenIdx = tokensLength - fromIdx;
      step = -1;
    }

    while (idx > -1 && idx < valueLength && tokenIdx > -1 && tokenIdx < tokensLength) {
      const token = tokens[tokenIdx];
      const chr = value.charAt(idx);
      const tokenVal = token.value();

      if (token.regular) {
        if (token.check(chr)) {
          result[addMethod](chr);
          tokenIdx += step;
        } else if (token.optional) {
          tokenIdx += step;
          idx -= step;
        }
        idx += step;
      } else {
        if (chr === tokenVal) {
          idx += step;
        }
        tokenIdx += step;
      }
    }

    return result.join('');
  }
}

export default StringMask;
