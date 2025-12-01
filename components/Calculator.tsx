import React, { useState } from 'react';
import { X, Divide, Minus, Plus, Percent } from 'lucide-react';

const Calculator: React.FC = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(true);

  const handleDigitClick = (digit: string) => {
    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
  };

  const handleDecimalClick = () => {
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
      setWaitingForOperand(false);
    }
  };

  const handleOperatorClick = (nextOperator: string) => {
    const inputValue = parseFloat(displayValue);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const result = calculate(prevValue, inputValue, operator);
      setPrevValue(result);
      setDisplayValue(String(result));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };
  
  const calculate = (firstOperand: number, secondOperand: number, op: string) => {
    switch (op) {
      case '+': return firstOperand + secondOperand;
      case '-': return firstOperand - secondOperand;
      case '*': return firstOperand * secondOperand;
      case '/': return firstOperand / secondOperand;
      default: return secondOperand;
    }
  };

  const handleEqualsClick = () => {
    const inputValue = parseFloat(displayValue);
    if (operator && prevValue !== null) {
      const result = calculate(prevValue, inputValue, operator);
      setDisplayValue(String(result));
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };
  
  const handleClearClick = () => {
    setDisplayValue('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const handlePlusMinusClick = () => {
    setDisplayValue(String(parseFloat(displayValue) * -1));
  };
  
  const handlePercentClick = () => {
    setDisplayValue(String(parseFloat(displayValue) / 100));
  };
  
  const Button: React.FC<{ onClick: () => void; className?: string; children: React.ReactNode }> = ({ onClick, className, children }) => (
    <button onClick={onClick} className={`rounded-full flex items-center justify-center text-2xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-[var(--accent-color)] ${className}`}>
      {children}
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white p-4 space-y-4">
      <div className="flex-1 flex items-end justify-end">
        <span className="text-7xl font-light tracking-tight break-all">{displayValue}</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Button onClick={handleClearClick} className="bg-slate-400 text-black hover:bg-slate-300">AC</Button>
        <Button onClick={handlePlusMinusClick} className="bg-slate-400 text-black hover:bg-slate-300">+/-</Button>
        <Button onClick={handlePercentClick} className="bg-slate-400 text-black hover:bg-slate-300"><Percent size={24}/></Button>
        <Button onClick={() => handleOperatorClick('/')} className={`bg-orange-500 hover:bg-orange-400 ${operator === '/' ? 'text-orange-500 bg-white' : ''}`}><Divide size={24}/></Button>
        
        <Button onClick={() => handleDigitClick('7')} className="bg-slate-700 hover:bg-slate-600">7</Button>
        <Button onClick={() => handleDigitClick('8')} className="bg-slate-700 hover:bg-slate-600">8</Button>
        <Button onClick={() => handleDigitClick('9')} className="bg-slate-700 hover:bg-slate-600">9</Button>
        <Button onClick={() => handleOperatorClick('*')} className={`bg-orange-500 hover:bg-orange-400 ${operator === '*' ? 'text-orange-500 bg-white' : ''}`}><X size={20}/></Button>

        <Button onClick={() => handleDigitClick('4')} className="bg-slate-700 hover:bg-slate-600">4</Button>
        <Button onClick={() => handleDigitClick('5')} className="bg-slate-700 hover:bg-slate-600">5</Button>
        <Button onClick={() => handleDigitClick('6')} className="bg-slate-700 hover:bg-slate-600">6</Button>
        <Button onClick={() => handleOperatorClick('-')} className={`bg-orange-500 hover:bg-orange-400 ${operator === '-' ? 'text-orange-500 bg-white' : ''}`}><Minus size={24}/></Button>
        
        <Button onClick={() => handleDigitClick('1')} className="bg-slate-700 hover:bg-slate-600">1</Button>
        <Button onClick={() => handleDigitClick('2')} className="bg-slate-700 hover:bg-slate-600">2</Button>
        <Button onClick={() => handleDigitClick('3')} className="bg-slate-700 hover:bg-slate-600">3</Button>
        <Button onClick={() => handleOperatorClick('+')} className={`bg-orange-500 hover:bg-orange-400 ${operator === '+' ? 'text-orange-500 bg-white' : ''}`}><Plus size={24}/></Button>
        
        <Button onClick={() => handleDigitClick('0')} className="col-span-2 bg-slate-700 hover:bg-slate-600">0</Button>
        <Button onClick={handleDecimalClick} className="bg-slate-700 hover:bg-slate-600">.</Button>
        <Button onClick={handleEqualsClick} className="bg-orange-500 hover:bg-orange-400">=</Button>
      </div>
    </div>
  );
};

export default Calculator;