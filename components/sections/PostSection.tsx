// components/PostsSection.tsx
import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Post from '../PostPreview';
import getPostMetadata from '../getPostMetadata';
import PostPreview from '../PostPreview';

// Read .md files from the posts directory
const postsDirectory = path.join(process.cwd(), 'posts');
const filenames = fs.readdirSync(postsDirectory);

// Get slug and data for each post
const posts = filenames.map(filename => {
  const fileContent = fs.readFileSync(path.join(postsDirectory, filename)).toString();
  const {data} = matter(fileContent);
  return {
    slug: filename.replace('.md', ''),
    ...data,
  };
});

const PostsSection: React.FC = () => {
  const postMetadata = getPostMetadata();
  const postPreviews = postMetadata.map(post => <PostPreview key={post.slug} {...post} />);

  return (
    <section id="posts">
      <h1 className="my-10 text-center font-bold text-4xl">
        Blog Posts
        <hr className="w-6 h-1 mx-auto my-4 bg-blue-500 border-0 rounded"></hr>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{postPreviews}</div>
    </section>
  );
};

export default PostsSection;
