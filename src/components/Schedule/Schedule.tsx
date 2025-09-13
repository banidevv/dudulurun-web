import React from 'react';

export const Schedule: React.FC = () => {
  return (
    <section id="jadwal" className="py-12 sm:py-16 lg:py-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Event Schedule</h2>
          <div className="w-16 sm:w-24 h-1 bg-accent mx-auto mb-6 sm:mb-8"></div>
        </div>

        <div className="mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="flex justify-center">
              <img
                src="/images/ddlrn-fun-run.png"
                className="w-full max-w-[280px] sm:max-w-[320px] h-auto object-cover rounded-lg shadow-lg"
                alt="Fun Run Schedule"
              />
            </div>
            <div className="flex justify-center">
              <img
                src="/images/ddlrn-fam-run.png"
                className="w-full max-w-[280px] sm:max-w-[320px] h-auto object-cover rounded-lg shadow-lg"
                alt="Family Run Schedule"
              />
            </div>
            <div className="flex justify-center">
              <img
                src="/images/ddlrn-race-expo.png"
                className="w-full max-w-[280px] sm:max-w-[320px] h-auto object-cover rounded-lg shadow-lg"
                alt="Race Expo Schedule"
              />
            </div>
            <div className="flex justify-center">
              <img
                src="/images/ddlrn-race-day.png"
                className="w-full max-w-[280px] sm:max-w-[320px] h-auto object-cover rounded-lg shadow-lg"
                alt="Race Day Schedule"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 