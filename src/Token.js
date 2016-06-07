/**
 * Multipurpose mask symbol that can be static string character
 * or regular expression, still having the same interface and flags.
 *
 * @class Token
 * @param {Object} props
 * @param {RegExp|String} props.rule Rule to check against
 * @param {Boolean} props.optional Should we skip this token during checks?
 */
class Token {
    constructor(props) {
        this.rule = props.rule || /./;
        this.optional = props.optional;
        this.regular = (this.rule instanceof RegExp);
    }

    /**
     * Performs character check against the rule.
     *
     * @memberOf Token
     * @param  {String} chr
     * @returns {Boolean}
     */
    check (chr) {
        if (this.regular) {
            return this.rule.test(chr);
        } else {
            return chr == this.rule;
        }
    }

    /**
     * Returns value tokens.
     *
     * @memberOf Token
     * @returns {String}
     */
    value() {
        return this.rule;
    }
}

export default Token;
