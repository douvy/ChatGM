import React from 'react';

interface FeatureToggleProps {
  label: string;
  slug: string;
  checked: boolean;
  onChange: () => void;
}

const FeatureToggle: React.FC<FeatureToggleProps> = ({ label, slug, checked, onChange }) => {
  return (
    <div className="flex flex-col gap-2 border-1">
      <div className="gap-2 mt-5 text-sm text-white font-semibold capitalize flex w-full flex-col items-stretch justify-center form-field border-1">
        <label className="flex cursor-pointer flex-col gap-2" htmlFor={slug}>
          <div className="flex items-center justify-between border-1">
            <p className="flex items-center justify-start gap-2 px-0.5 tracking-wide border-1">{label}</p>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onChange()}
                className="toggle-switch-checkbox"
                name={slug}
                id={slug}
              />
              <label className="toggle-switch-label" htmlFor={slug}>
                <span className="toggle-switch-inner"></span>
              </label>
            </div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default FeatureToggle;
