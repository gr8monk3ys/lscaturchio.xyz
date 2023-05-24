import React from 'react';
import { Link } from 'react-scroll';

const ScrollLink: React.FC<{
  to: string,
  className: string,
  children: React.ReactNode
}> = ({ to, className, children }) => {
  return (
    <Link
      to={to}
      activeClass="active"
      spy={true}
      smooth={true}
      offset={-100}
      duration={500}
      className={className}
    >
      {children}
    </Link>
  );
};

export default ScrollLink;