import React from 'react';

const Skill: React.FC<{ skill: string }> = ({ skill }) => {
  return (
    <p className="bg-gray-200 px-4 py-2 mr-2 mt-2 text-gray-500 rounded font-semibold">
      {skill}
    </p>
  );
};

export default Skill;