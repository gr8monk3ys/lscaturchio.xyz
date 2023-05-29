// components/PostsSection.tsx
import React from 'react';
import Post from '../Post';

// You'll need to import the posts data from the .md files somehow.
// Assuming the imported posts data is an array of objects similar to this:
const posts = [
  {
    title: 'Title of the post',
    subtitle: 'Subtitle of the post',
    slug: 'test',
    image: '/sample.png',
  },
  // more posts...
];

const PostsSection: React.FC = () => {
  return (
    <section id="posts">
      <h1 className="my-10 text-center font-bold text-4xl">
        Blog Posts
        <hr className="w-6 h-1 mx-auto my-4 bg-blue-500 border-0 rounded"></hr>
      </h1>

      <div className="grid grid-cols-3 gap-4">
        {posts.map((post, idx) => (
          <Post key={idx} post={post} />
        ))}
      </div>
    </section>
  );
};

export default PostsSection;
