'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

const benefits = [
  {
    role: 'For Recipients',
    icon: '👤',
    items: [
      'Get instant notifications when parcels arrive',
      'Track all your parcels in one place',
      'Pre-register tracking numbers for faster pickup',
      'Never miss a parcel again',
      'Access from any device, anywhere'
    ],
    color: 'blue',
    image: '/images/recipient-dashboard.svg'
  },
  {
    role: 'For Operators',
    icon: '🎯',
    items: [
      'Check-in parcels 70% faster',
      'Auto-assign storage locations',
      'Quick search by tracking ID or phone',
      'Real-time inventory overview',
      'Complete audit trail and reporting'
    ],
    color: 'purple',
    image: '/images/operator-dashboard.svg'
  }
];

export default function BenefitsSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Built for Everyone
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Whether you're receiving parcels or managing mailrooms, we've got you covered
          </p>
        </motion.div>

        <div className="space-y-20 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}
            >
              {/* Content */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{benefit.icon}</span>
                  <h3 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${
                    benefit.color === 'blue' 
                      ? 'from-blue-600 to-cyan-600' 
                      : 'from-blue-600 to-blue-400'
                  } bg-clip-text text-transparent`}>
                    {benefit.role}
                  </h3>
                </div>

                <ul className="space-y-4">
                  {benefit.items.map((item, itemIndex) => (
                    <motion.li
                      key={itemIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: index * 0.2 + itemIndex * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <svg className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                        benefit.color === 'blue' ? 'text-blue-500' : 'text-blue-500'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-lg text-gray-700 dark:text-gray-300">{item}</span>
                    </motion.li>
                  ))}
                </ul>

                <motion.a
                  href="/signup"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r ${
                    benefit.color === 'blue' 
                      ? 'from-blue-600 to-cyan-600' 
                      : 'from-blue-600 to-blue-400'
                  } text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300`}
                >
                  Get Started Free
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </motion.a>
              </div>

              {/* Visual/Mockup */}
              <div className="flex-1">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? 2 : -2 }}
                  transition={{ duration: 0.3 }}
                  className={`relative bg-gradient-to-br ${
                    benefit.color === 'blue' 
                      ? 'from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20' 
                      : 'from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20'
                  } p-8 rounded-3xl shadow-2xl`}
                >
                  <div className="aspect-video bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-6xl mb-4 ${
                        benefit.color === 'blue' ? 'text-blue-500' : 'text-blue-500'
                      }`}>
                        {benefit.role === 'For Recipients' ? '📱' : '💼'}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">
                        {benefit.role === 'For Recipients' ? 'Mobile-First Design' : 'Operator Dashboard'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
