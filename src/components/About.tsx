"use client";
import { Paragraph } from "@/components/Paragraph";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const staggerContainer: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const imageVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    rotate: 2
  }
};

export default function About() {
  const images = [
    "https://images.unsplash.com/photo-1692544350322-ac70cfd63614?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw1fHx8ZW58MHx8fHx8&auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1692374227159-2d3592f274c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw4fHx8ZW58MHx8fHx8&auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1692005561659-cdba32d1e4a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxOHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1692445381633-7999ebc03730?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwzM3x8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
  ];

  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
    >
      {/* Hero Section */}
      <motion.div 
        variants={fadeInUp}
        className="relative overflow-hidden rounded-2xl bg-muted/50 p-6 md:p-8 mb-12"
      >
        <div className="relative z-10">
          <motion.h2 
            variants={fadeInUp}
            className="text-2xl md:text-3xl font-bold mb-4"
          >
            Hey there, I&apos;m Lorenzo Scaturchio
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-muted-foreground"
          >
            A passionate data scientist, enthusiastic musician, and lover of the outdoors.
            Welcome to my corner of the digital world!
          </motion.p>
        </div>
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        </div>
      </motion.div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {images.map((image, index) => (
          <motion.div
            key={image}
            variants={imageVariants}
            custom={index}
            transition={{ duration: 0.5 }}
            className="relative aspect-[4/3] overflow-hidden rounded-xl"
          >
            <Image
              src={image}
              fill
              alt={`About image ${index + 1}`}
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
          </motion.div>
        ))}
      </div>

      {/* Content Sections */}
      <div className="space-y-12">
        <motion.div variants={fadeInUp} className="space-y-4">
          <h3 className="text-xl font-semibold">The Journey Begins</h3>
          <Paragraph>
            Since the early days of my journey, I&apos;ve been captivated by the power
            of data and the potential of machine learning. I have had a great passion for
            computation since I was younger, being enabled by my curiosity and the ability
            to problem solve.
          </Paragraph>
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-4">
          <h3 className="text-xl font-semibold">Beyond Computation</h3>
          <Paragraph>
            But my journey only begins with computation. My curiosity has 
            taken me to many other places as well. I&apos;ve ventured into the
            realms of music, movies, and chess. From composing and producing
            songs that resonate with emotions to strategizing moves on the chessboard, 
            I embrace creativity and critical thinking in all aspects of my life and 
            will do so until I can no longer.
          </Paragraph>
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-4">
          <h3 className="text-xl font-semibold">Nature & Innovation</h3>
          <Paragraph>
            What sets me apart is my unwavering passion for the outdoors. I
            believe that nature fuels creativity and innovation. My love for
            hiking and exploring the wilderness has taught me valuable lessons
            about persistence, adaptability, and the beauty of discovering
            uncharted territories.
          </Paragraph>
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-4">
          <h3 className="text-xl font-semibold">Sharing My Story</h3>
          <Paragraph>
            Through this website, I aim to share my insights, experiences, and
            creations with you. Whether you&apos;re a fellow data scientist seeking
            solutions, a musician in search of collaboration, or simply someone who
            appreciates the beauty of the world we simply don&apos;t understand,
            there&apos;s something here for you and hopefully we can find commonality.
          </Paragraph>
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-4">
          <h3 className="text-xl font-semibold">Thank You</h3>
          <Paragraph>
            Thank you for being here to listen to what I have to say.
          </Paragraph>
        </motion.div>
      </div>
    </motion.div>
  );
}
