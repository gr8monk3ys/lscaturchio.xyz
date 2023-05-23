// components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-500 text-white py-6 mt-8">
      <div className="container mx-auto text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Lorenzo's Website. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
