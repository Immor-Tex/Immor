import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-heading text-4xl font-bold mb-8">About IMMORTEX</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="font-heading text-2xl font-semibold mb-6">Our Story</h2>
            <p className="text-primary-700 mb-6 leading-relaxed">
            Founded in 2023 by two close friends, Ilyas and Oussama, IMMORTEX was built on a shared passion for streetwear and a desire to create something meaningful. More than just a brand, it&apos;s the result of a strong friendship—two minds working together with one vision: to design bold, high-quality clothing that reflects individuality and authenticity.
            </p>
            <p className="text-primary-700 leading-relaxed">
            From day one, we&apos;ve focused on blending creative expression with premium craftsmanship. Every piece we release carries our values—loyalty, originality, and purpose. IMMORTEX isn&apos;t about following trends; it&apos;s about creating a style that lasts and a brand that grows with us and our community.
            </p>
          </div>
          <div className="relative h-[400px]">
            <img 
              src="https://images.pexels.com/photos/2466756/pexels-photo-2466756.jpeg"
              alt="IMMORTEX workshop"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-primary-50 p-8 rounded-lg">
            <h3 className="font-heading text-xl font-semibold mb-4">Quality First</h3>
            <p className="text-primary-700">
              We source only the finest materials and work with skilled artisans to ensure every piece meets our exacting standards.
            </p>
          </div>
          <div className="bg-primary-50 p-8 rounded-lg">
            <h3 className="font-heading text-xl font-semibold mb-4">Sustainable Fashion</h3>
            <p className="text-primary-700">
              Our commitment to sustainability drives us to use eco-friendly materials and ethical manufacturing processes.
            </p>
          </div>
          <div className="bg-primary-50 p-8 rounded-lg">
            <h3 className="font-heading text-xl font-semibold mb-4">Community Driven</h3>
            <p className="text-primary-700">
              We believe in building a community of individuals who share our passion for authentic style and quality craftsmanship.
            </p>
          </div>
        </div>

        <div className="bg-primary-900 text-white rounded-lg p-12">
          <h2 className="font-heading text-3xl font-semibold mb-6 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-heading text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-primary-300">
                We constantly push the boundaries of streetwear design, incorporating new techniques and materials to create unique pieces.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-xl font-semibold mb-3">Authenticity</h3>
              <p className="text-primary-300">
                Every IMMORTEX piece tells a story of urban culture and artistic expression, staying true to our streetwear roots.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-xl font-semibold mb-3">Quality</h3>
              <p className="text-primary-300">
                We never compromise on quality, ensuring each garment meets the highest standards of craftsmanship.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-xl font-semibold mb-3">Community</h3>
              <p className="text-primary-300">
                We're building more than a brand - we're creating a community of individuals who appreciate quality streetwear.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutPage;