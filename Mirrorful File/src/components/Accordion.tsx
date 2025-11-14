import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}
const Accordion = ({
  title,
  children,
  defaultOpen = false,
  className = ''
}: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return <div className={`border border-light-gray rounded-xl overflow-hidden mb-4 ${className}`}>
      <button className="w-full px-4 py-3 flex justify-between items-center bg-white hover:bg-background transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <span className="font-medium">{title}</span>
        {isOpen ? <ChevronUpIcon className="h-5 w-5 text-dark-gray" /> : <ChevronDownIcon className="h-5 w-5 text-dark-gray" />}
      </button>
      <div className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? 'max-h-96' : 'max-h-0'}
        `}>
        <div className="p-4 bg-background">{children}</div>
      </div>
    </div>;
};
export default Accordion;