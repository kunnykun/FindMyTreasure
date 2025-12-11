import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-600 via-ocean-500 to-ocean-400">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Lost something valuable?
            </h1>
            <p className="text-2xl md:text-3xl text-ocean-50 mb-4">
              We'll help you find it — on land or under water.
            </p>
            <p className="text-lg text-ocean-100 mb-12 max-w-2xl mx-auto">
              Professional metal detecting and recovery services using state-of-the-art equipment.
              From beaches to parks, we're on the hunt for your treasure.
            </p>

            <Link
              to="/report-lost-item"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl bg-white text-ocean-600 hover:bg-ocean-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Report a Lost Item
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="#fdfcfb"/>
          </svg>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-sand-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Four simple steps to recovering your lost treasure</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                icon: '📍',
                title: 'Report Your Loss',
                description: 'Tell us what you lost and mark the location on our interactive map'
              },
              {
                step: 2,
                icon: '💰',
                title: 'Get an Estimate',
                description: 'Receive instant cost calculation based on location and search complexity'
              },
              {
                step: 3,
                icon: '🔍',
                title: 'We Search',
                description: 'Professional detectorists use advanced equipment to locate your item'
              },
              {
                step: 4,
                icon: '🎉',
                title: 'Recovery',
                description: 'Get your treasure back with photo documentation of the recovery'
              }
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-20 h-20 bg-ocean-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-sm font-semibold text-ocean-600 mb-2">Step {item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Equipment Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Professional Equipment</h2>
            <p className="text-xl text-gray-600">Industry-leading metal detection technology</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'XP Deus 2',
                description: 'Multi-frequency detector for deep target detection',
                icon: '🎯'
              },
              {
                name: 'Minelab CTX 3030',
                description: 'Advanced discrimination and target identification',
                icon: '🔬'
              },
              {
                name: 'Underwater Detectors',
                description: 'Specialized equipment for beach and underwater searches',
                icon: '🌊'
              }
            ].map(equipment => (
              <div key={equipment.name} className="bg-sand-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">{equipment.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{equipment.name}</h3>
                <p className="text-gray-600">{equipment.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-ocean-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-ocean-100">Items Recovered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">85%</div>
              <div className="text-ocean-100">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24hr</div>
              <div className="text-ocean-100">Average Response Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-sand-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to start your recovery?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Every minute counts. The sooner we search, the better our chances of recovery.
          </p>
          <Link
            to="/report-lost-item"
            className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl bg-ocean-600 text-white hover:bg-ocean-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Get Started Now
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
