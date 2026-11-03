import { motion } from "framer-motion";
import HeroImage from "../../assets/images/Namche.jpg";

export default function Hero() {
  return (
    <section className="relative w-full">

      {/* Image Wrapper - NO fixed vh height */}
      <div className="relative w-full">
        <img
          src={HeroImage}
          alt="Himalayan landscape"
          className="w-full h-auto block"
          loading="eager"
          fetchPriority="high"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Text */}
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl text-white"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif drop-shadow-xl">
              Where Himalayan Stories Become Art
            </h1>

            <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-100 leading-relaxed">
              Discover original artworks inspired by the Himalayas.
            </p>
          </motion.div>
        </div>
      </div>

    </section>
  );
}