import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => {
  return (
    <label htmlFor="toggle-switch" className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          id="toggle-switch"
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
        />
        <div className={`block w-12 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-base-300'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-6' : ''}`}></div>
      </div>
    </label>
  );
};

export default ToggleSwitch;
