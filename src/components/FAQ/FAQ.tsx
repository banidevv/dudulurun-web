'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Apakah semua peserta mendapatkan medali?",
    answer: "Ya, semua peserta yang menyelesaikan rute sampai finish akan mendapatkan medali finisher."
  },
  {
    question: "Apakah boleh membawa stroller untuk Family Run?",
    answer: "Boleh, selama stroller tidak mengganggu pelari lain dan digunakan dengan hati-hati."
  },
  {
    question: "Apakah bisa pindah kategori setelah mendaftar?",
    answer: "Perubahan kategori hanya bisa dilakukan maksimal H-7 event dengan menghubungi panitia."
  },
  {
    question: "Apakah ada hadiah untuk pemenang?",
    answer: "Ya, ada hadiah untuk finisher tercepat 1,2 dan 3. Selain itu, akan ada doorprize menarik untuk semua peserta."
  },
  {
    question: "Bagaimana jika hujan?",
    answer: "Event tetap dilaksanakan kecuali kondisi ekstrem. Info perubahan akan diumumkan via media sosial resmi."
  },
  {
    question: "Apakah bisa ikut tanpa daftar?",
    answer: "Tidak. Semua peserta wajib terdaftar dan mengenakan nomor dada resmi."
  }
];

const toggleFaq = (id: number) => {
  const content = document.getElementById(`faq-content-${id}`);
  const icon = document.getElementById(`faq-icon-${id}`);

  if (content && icon) {
    if (content.classList.contains('hidden')) {
      content.classList.remove('hidden');
      icon.classList.remove('fa-chevron-down');
      icon.classList.add('fa-chevron-up');
    } else {
      content.classList.add('hidden');
      icon.classList.remove('fa-chevron-up');
      icon.classList.add('fa-chevron-down');
    }
  }
};

export const FAQ = () => {
  return (
    <section id="faq" className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">FAQ</h2>
          <div className="w-16 sm:w-24 h-1 bg-accent mx-auto mb-6 sm:mb-8"></div>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Pertanyaan yang sering diajukan tentang DuduluRun Fun Run 2025
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div id="faq-list" className="space-y-3 sm:space-y-4">
            {faqData.map((faq, index) => {
              const faqId = index + 1;
              return (
                <div key={index} className="bg-gray-50 rounded-lg">
                  <button
                    className="w-full text-left p-4 sm:p-6 focus:outline-none touch-manipulation"
                    onClick={() => toggleFaq(faqId)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                      <i id={`faq-icon-${faqId}`} className="fa-solid fa-chevron-down text-gray-500 flex-shrink-0"></i>
                    </div>
                  </button>
                  <div id={`faq-content-${faqId}`} className="hidden px-4 sm:px-6 pb-4 sm:pb-6">
                    <p className="text-gray-700 text-sm sm:text-base">{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}; 