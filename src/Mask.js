/**
 * Manages logic to masking or unmasking value.
 *
 * @class Mask
 * @abstract
 * @param {Object} props
 */
class Mask {
    constructor(props) {
        this.props = props;
        this.tokens = [];
    }

    /**
     * Sets properties.
     */
    setProps(nextProps) {
        this.props = nextProps;
    }

    /**
     * Masks any string respectful to given mask.
     * 
     * @abstract
     * @returns {String} masked value
     */
    mask(value) {
        throw new Error('Please, override method!');
    }

    /**
     * Unmasks any string previously masked by mask.
     * 
     * @abstract
     * @returns {String} unmasked value
     */
    unmask(value) {
        throw new Error('Please, override method!');
    }
}

export default Mask;
