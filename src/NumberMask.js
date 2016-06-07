import Mask from './Mask';

const NUMBER_DELIMETRS = [',', '.', ' '];

/**
 * Masks numbers.
 * 
 * @class NumberMask
 */
class NumberMask extends Mask {
    /**
     * @override
     * @see {@link Mask#mask}
     */
    mask(value) {
        if (!value) {
            return '';
        }
        value = value + '';

        const numberFormat = this.props.numberFormat;
        const maxIntegerPositions = this.props.max ? this.props.max.toString().length : Infinity;
        const maxFractionPositions = numberFormat.decimals;
        const fraction = [];
        let integer = [];
        let inputIdx;
        let outputIdx;
        let input;
        let hasFractional = false;
        let integerPart;
        let fractionalPart;

        value = [value];
        NUMBER_DELIMETRS.forEach((jumpChar, idx) => {
            let valueArray = [];
            value.forEach((chunk, idx) => {
                chunk = String(chunk);
                valueArray = valueArray.concat(chunk.split(jumpChar));
            });
            value = valueArray;
        });
        integerPart = value.shift() || '';
        fractionalPart = value;
        value = [integerPart];
        if (fractionalPart.length > 0) {
            value.push(fractionalPart.join(''));
        }

        if (maxFractionPositions && value.length > 1) {
            hasFractional = true;
        }

        if (value.length > 2) {
            value[1] = value[1] + value.slice(2).join('');
        }

        inputIdx = 0;
        outputIdx = 0;
        input = value[0];
        while (outputIdx < maxIntegerPositions && inputIdx < input.length) {
            let inputChar = input.charAt(inputIdx);
            if (/^\d$/.test(inputChar)) {
                integer.push(inputChar);
                outputIdx += 1;
            }
            inputIdx += 1;
        }

        inputIdx = 0,
        outputIdx = 0;
        input = (value[1] || '');
        while (outputIdx < maxFractionPositions && inputIdx < input.length) {
            let inputChar = input.charAt(inputIdx);
            if (/^\d$/.test(inputChar)) {
                fraction.push(inputChar);
                outputIdx += 1;
            }
            inputIdx += 1;
        }

        value = '';
        integer = integer.reverse();
        // support different digit groups sizes.
        if (numberFormat.groupSize.length == 1) {
            while (integer.length > 0) {
                value = integer.splice(0, numberFormat.groupSize[0]).reverse().join('') + value;

                if (integer.length > 0) {
                    value = numberFormat[','] + value;
                }
            }
        } else {
            value = integer.splice(0, numberFormat.groupSize[0]).reverse().join('');
            while (integer.length > 0) {
                value = numberFormat[','] + value;
                value = integer.splice(0, numberFormat.groupSize[1]).reverse().join('') + value;
            }
        }

        if (hasFractional) {
            value = value + numberFormat['.'] + fraction.join('');
        }

        return value;
    }

    /**
     * @override
     * @see {@link Mask#unmask}
     */
    unmask(value) {
        if (!value) {
            return '';
        }

        const numberFormat = this.props.numberFormat;

        return (value + '').trim().
                split(numberFormat[',']).
                join('').
                split(numberFormat['.']).
                join('.');
    }
}

export default NumberMask;
