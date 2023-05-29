// components/Post.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {BsArrowUpRightSquare} from 'react-icons/bs';
import SlideUp from './SlideUp';

const Post: React.FC<{post: any}> = ({post}) => {
  return (
    <SlideUp offset="-300px 0px -300px 0px">
      <div className="relative group w-64 h-64 m-4">
        <Image
          src={post.image}
          alt=""
          layout="fill"
          objectFit="cover"
          className="rounded-xl shadow-xl hover:opacity-70 transition-opacity duration-300 z-10"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex flex-col items-center justify-center text-white space-y-4 z-20">
          <h1 className="text-2xl font-bold">{post.title}</h1>
          <p className="text-sm px-4">{post.subtitle}</p>
          <div className="flex space-x-4">
            <Link href={`../posts/${post.slug}`}>
              <BsArrowUpRightSquare size={30} className="hover:-translate-y-1 transition-transform cursor-pointer" />
            </Link>
          </div>
        </div>
      </div>
    </SlideUp>
  );
};

export default Post;
