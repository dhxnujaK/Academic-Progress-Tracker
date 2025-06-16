import React from 'react';
import { motion } from 'framer-motion';
import { AcademicCapIcon, ClockIcon, ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const features = [
  {
    icon: <AcademicCapIcon className="w-10 h-10 text-cyan-600" />,
    title: 'GPA Calculator',
    description: 'Easily compute your GPA and track your semester-wise performance with visual breakdowns.',
  },
  {
    icon: <ClockIcon className="w-10 h-10 text-cyan-600" />,
    title: 'Study Timer',
    description: 'Record focused study sessions with timers and monitor how long you spend on each module.',
  },
  {
    icon: <ChartBarIcon className="w-10 h-10 text-cyan-600" />,
    title: 'Weekly Insights',
    description: 'Visualize weekly trends of your productivity and get actionable insights.',
  },
  {
    icon: <DocumentTextIcon className="w-10 h-10 text-cyan-600" />,
    title: 'Module Tracker',
    description: 'Keep track of all your modules, their credits, and related academic details in one place.',
  },
];

const Features = () => {
  return (
    <div className="bg-white py-20 px-6 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-blue-800 mb-12"
      >
        Powerful Features to Keep You On Track
      </motion.h2>
      <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-gray-700"
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Features;
