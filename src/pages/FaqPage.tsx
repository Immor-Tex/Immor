import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems: FaqItem[] = [
    {
      question: "What sizes do your products come in?",
      answer: "Our products are available in sizes XS to XXL. Each product page includes a detailed size guide to help you find the perfect fit. We recommend measuring yourself and comparing with our size charts for the best results."
    },
    {
      question: "How do I care for my IMMORTEX clothing?",
      answer: "We recommend washing all our garments in cold water and hanging them to dry. For detailed care instructions, please check the care label on each item. Generally, our products should be washed inside out to preserve the print quality and fabric integrity."
    },
    {
      question: "What is your shipping policy?",
      answer: "We offer free shipping on all orders over $75. Standard delivery takes 3-5 business days within the continental United States. International shipping is available to select countries with delivery times varying by location."
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns within 30 days of purchase for unworn items in their original packaging. Return shipping is free for customers within the United States. Please note that customized items cannot be returned unless defective."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order ships, you'll receive a confirmation email with a tracking number. You can use this number to track your package through our website or the carrier's website."
    },
    {
      question: "Are your products sustainable?",
      answer: "Yes! We are committed to sustainability. Our products are made from high-quality, eco-friendly materials, and we work with manufacturers who follow ethical practices. We're constantly working to reduce our environmental impact."
    },
    {
      question: "Do you offer wholesale or bulk orders?",
      answer: "Yes, we do offer wholesale pricing for bulk orders. Please contact our sales team at wholesale@immortex.com for more information about our wholesale program and minimum order requirements."
    },
    {
      question: "How do I know if an item is in stock?",
      answer: "Product availability is shown in real-time on each product page. If an item is out of stock, you can sign up for email notifications to be alerted when it's back in stock."
    },
    {
      question: "Can I modify or cancel my order?",
      answer: "Orders can be modified or cancelled within 1 hour of placement. After this window, we begin processing orders for shipment and cannot guarantee changes. Please contact customer service immediately if you need to make changes."
    },
    {
      question: "Do you offer gift wrapping?",
      answer: "Yes, we offer gift wrapping services for an additional $5 per item. You can select this option during checkout. Each gift-wrapped item includes a personalized message card."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-heading text-4xl font-bold mb-8">Frequently Asked Questions</h1>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-primary-700 mb-8">
            Find answers to common questions about IMMORTEX products, shipping, returns, and more. 
            Can't find what you're looking for? Contact our support team.
          </p>
          
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div 
                key={index}
                className="border border-primary-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-primary-50 transition-colors"
                >
                  <span className="font-medium text-lg">{item.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="text-primary-600" />
                  ) : (
                    <ChevronDown className="text-primary-600" />
                  )}
                </button>
                
                <motion.div
                  initial={false}
                  animate={{ height: openIndex === index ? 'auto' : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 text-primary-700 bg-white">
                    {item.answer}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-6 bg-primary-50 rounded-lg">
            <h2 className="font-heading text-xl font-semibold mb-4">Still have questions?</h2>
            <p className="text-primary-700 mb-4">
              Our customer support team is here to help. Contact us through any of these channels:
            </p>
            <ul className="space-y-2 text-primary-700">
              <li>• Email: support@immortex.com</li>
              <li>• Phone: +1 (555) 123-4567</li>
              <li>• Live Chat: Available Monday-Friday, 9AM-6PM EST</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FaqPage;