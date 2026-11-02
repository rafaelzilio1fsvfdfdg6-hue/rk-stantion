import React, { useState } from 'react';

const CalculatorApp: React.FC = () => {
    const [display, setDisplay] = useState('0');
    const [currentValue, setCurrentValue] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);

    const handleDigitClick = (digit: string) => {
        if (waitingForOperand) {
            setDisplay(digit);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    };

    const handleOperatorClick = (nextOperator: string) => {
        const inputValue = parseFloat(display);

        if (currentValue === null) {
            setCurrentValue(inputValue);
        } else if (operator) {
            const result = performCalculation();
            setCurrentValue(result);
            setDisplay(String(result));
        }

        setWaitingForOperand(true);
        setOperator(nextOperator);
    };

    const performCalculation = (): number => {
        const inputValue = parseFloat(display);
        if (currentValue === null || operator === null) return inputValue;

        switch (operator) {
            case '+': return currentValue + inputValue;
            case '-': return currentValue - inputValue;
            case '*': return currentValue * inputValue;
            case '/': return currentValue / inputValue;
            default: return inputValue;
        }
    };

    const handleEqualsClick = () => {
        if (operator === null) return;
        const result = performCalculation();
        setDisplay(String(result));
        setCurrentValue(result);
        setOperator(null);
        setWaitingForOperand(true);
    };

    const handleClearClick = () => {
        setDisplay('0');
        setCurrentValue(null);
        setOperator(null);
        setWaitingForOperand(false);
    };

    const handleDecimalClick = () => {
        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const buttons = [
        '7', '8', '9', '/',
        '4', '5', '6', '*',
        '1', '2', '3', '-',
        '0', '.', '=', '+'
    ];
    
    const getButtonClass = (btn: string) => {
        if (['/', '*', '-', '+', '='].includes(btn)) {
            return 'bg-[rgba(var(--accent-color-rgb),0.4)] hover:bg-[rgba(var(--accent-color-rgb),0.6)]';
        }
        if (btn === '0') return 'col-span-2';
        return 'bg-gray-800/80 hover:bg-gray-700/80';
    };

    const handleButtonClick = (btn: string) => {
        if (!isNaN(parseInt(btn))) handleDigitClick(btn);
        else if (['/', '*', '-', '+'].includes(btn)) handleOperatorClick(btn);
        else if (btn === '=') handleEqualsClick();
        else if (btn === '.') handleDecimalClick();
    };


    return (
        <div className="h-full flex justify-center items-center bg-gray-900/50 p-4">
            <div className="w-full max-w-xs mx-auto bg-black/70 rounded-xl border-2 border-[var(--accent-color)] shadow-lg shadow-[rgba(var(--accent-color-rgb),0.2)] p-4">
                <div className="bg-black/80 text-right p-4 rounded-lg mb-4 border border-[rgba(var(--accent-color-rgb),0.3)]">
                    <p className="text-4xl text-white font-orbitron truncate">{display}</p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    <button onClick={handleClearClick} className="col-span-4 p-4 text-xl font-bold rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors">C</button>
                    {buttons.map(btn => (
                        <button key={btn} onClick={() => handleButtonClick(btn)} className={`p-4 text-xl font-bold rounded-lg text-white transition-colors ${getButtonClass(btn)}`}>
                            {btn}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CalculatorApp;
