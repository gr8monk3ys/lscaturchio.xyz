import React from 'react';

const Skill: React.FC<{skill: string}> = ({skill}) => {
  return (
    <p className="inline-flex items-center bg-blue-500 px-3 py-1 mr-2 mt-2 text-white rounded-md font-semibold text-sm tracking-wide shadow-md hover:shadow-lg transition-shadow duration-300">
      {skill}
    </p>
  );
};

export default Skill;
