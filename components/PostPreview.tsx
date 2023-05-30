import Link from 'next/link';
import {PostMetadata} from './PostMetadata';
import {BsArrowUpRightSquare} from 'react-icons/bs';

const PostPreview = (props: PostMetadata) => {
  return (
    <div className="relative group w-full m-4">
      <Link href={`/posts/${props.slug}`}>
        <div className="flex justify-between items-center hover:bg-gray-200 transition-colors duration-300 cursor-pointer p-2 rounded-md">
          <span className="font-semibold text-lg">{props.title}</span>
          <span className="text-gray-600">{props.date}</span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <BsArrowUpRightSquare size={30} className="hover:-translate-y-1 transition-transform cursor-pointer" />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PostPreview;
