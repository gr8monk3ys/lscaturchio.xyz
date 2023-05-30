import React from 'react';
import Image from 'next/legacy/image';
import Skill from '../Skill';

const skills = ['Rust', 'Python', 'TypeScript', 'Next.js', 'Tailwind CSS', 'React', 'Pytorch', 'Tensorflow'];

const AboutSection: React.FC = () => {
  return (
    <section id="about">
      <div className="my-12 pb-12 md:pt-16 md:pb-48">
        <h1 className="text-center font-bold text-4xl">
          About Me
          <hr className="w-6 h-1 mx-auto my-4 bg-blue-500 border-0 rounded"></hr>
        </h1>

        <div className="flex flex-col space-y-10 items-stretch justify-center align-top md:space-x-10 md:space-y-0 md:p-4 md:flex-row md:text-left">
          <div className="md:w-1/2">
            <h1 className="text-center text-2xl font-bold mb-6 md:text-left">Get to know me!</h1>
            <p className="space-y-4">
              I am a applied data science based in Los Angeles, CA. I am{' '}
              <span className="font-bold">highly ambitious</span>, <span className="font-bold">self-motivated</span>,
              and <span className="font-bold">driven</span>.
              <br />
              I graduated from University of California, Merced in 2022 with a BS in Computer Science & Engineering and
              am acquiring my Masters of Applied Data Science at the University of Southern California.
              <br />
              Besides coding, I have a strong passion for Chess, music production, and traveling, and I have recently
              been delving into prompt engineering.
              <br />I believe that if there is no inherent meaning in life, you should{' '}
              <span className="font-bold text-blue-500">make your own meaning</span>. That is what guides my philosophy
              in everything I do.
            </p>
          </div>
          <div className="text-center md:w-1/2 md:text-left">
            <h1 className="text-2xl font-bold mb-6">My Skills</h1>
            <div className="flex flex-wrap flex-row justify-center z-10 md:justify-start">
              {skills.map((skill, idx) => (
                <Skill key={idx} skill={skill} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
