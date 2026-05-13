import React from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MusicTags({ value, onChange, placeholder }: Props): React.ReactElement {
  return (
    <div className="mt-6">
      <label htmlFor="music-tags" className="block text-sm font-semibold text-gray-700">
        Music Tags
      </label>
      <textarea
        id="music-tags"
        rows={7}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-team-blue focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-team-blue"
      />
    </div>
  );
}
