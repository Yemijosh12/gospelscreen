
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import MovieCard from '../components/MovieCard';
import Footer from '../components/Footer';
import { Movie, User } from '../types';
import emailjs from '@emailjs/browser';
import { Mail, Send, User as UserIcon, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

interface HomeProps {
  movies: Movie[];
  onMovieSelect: (movie: Movie) => void;
  user: User | null;
}

const faqs = [
    {
      category: 'getting-started',
      question: 'What is GospelScreen Tv?',
      answer: 'GospelScreen TV is a faith-based streaming platform dedicated to sharing uplifting, Christian content through digital media. Our mission is to spread the Gospel through cinema while maintaining the highest standards of integrity and respect.'
    },
    {
      category: 'getting-started',
      question: 'How much does GospelScreen Tv Cost?',
      answer: 'Watch GospelSreen Tv on your smartphone, tablet, laptop, or streaming device, all for one fixed monthly fee. Plans range from ₦1,500/month. and ₦15,000/year.'
    },
    {
      category: 'getting-started',
      question: 'Where can i watch?',
      answer: 'Watch anywhere, anytime. Sign in with your GSTV account to watch instantly on the web at gospelscreentv.com from your personal computer or  on any internet-connected device that offers the smartphones, tablets, streaming media players.'
    },
    {
      category: 'watching',
      question: 'How do i cancel?',
      answer: 'You can cancel your subscription anytime through your account settings. No cancellation fees apply, and you will continue to have access to GospelScreen Tv until the end of your current billing cycle.'
    },
    {
      category: 'watching',
      question: 'What can i watch on GospelScreen Tv?',
      answer: 'GospelScreen Tv offers a wide variety of faith-based movies, documentaries, and series that inspire and uplift. Our library includes content for all ages, focusing on Christian values and teachings.'
    },
   
    ];


const Home: React.FC<HomeProps> = ({ movies, onMovieSelect, user }) => {
  const form = useRef<HTMLFormElement>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };


  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      if (response.ok) {
        alert('Thank you for your inquiry! We will get back to you soon.');
        setContactForm({ name: '', email: '', subject: '', message: '' });
      } else {
        const errorData = await response.json();
        alert(`Failed to send inquiry: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending contact:', error);
      alert('Failed to send inquiry. Please try again.');
    }
  };

  const sortedMovies = [...movies].sort((a, b) => parseInt(b.id) - parseInt(a.id));
  const latestReleases = sortedMovies.slice(0, 3);
  const featured = sortedMovies.slice(3, 7);

const sendEmail = (e: React.FormEvent) => {
  e.preventDefault();

  if (form.current) {
    emailjs.sendForm('service_g797igi', 'template_srziwew', form.current, 'x4bGaZakvtoCsyXqz').then(
      () => {
        alert('Message sent successfully!');
        form.current?.reset();
      },
      (error: any) => {
        alert('Failed to send message, please try again. ' + error.text);
      }
    );
  }
};
  



  return (
    <>
    <div className="space-y-12">
      <Hero user={user} />

      <section className="px-8 md:px-16">
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-2">
          <h2 className="text-xl font-bold tracking-tight">Latest Releases</h2>
          <Link to="/browse" className="text-[#d4af37] text-sm hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestReleases.map(movie => (
            <MovieCard key={movie.id} movie={movie} onClick={onMovieSelect} />
          ))}
        </div>
      </section>


     

      <section className="px-8 md:px-16">
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-2">
          <h2 className="text-xl font-bold tracking-tight">Collections</h2>
          <Link to="/browse" className="text-[#d4af37] text-sm hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map(movie => (
            <MovieCard key={movie.id} movie={movie} onClick={onMovieSelect} />
          ))}
        </div>
      </section>


     { /* Ask Question */}
     <section className="px-8 md:px-16">
       <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
       <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-5">
              <MessageSquare size={48} className="text-gray-600 mx-auto" />
              <p className="text-gray-400 text-lg">No results found for your search.</p>
              <p className="text-gray-500">Try different keywords or browse all topics.</p>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <span className="text-white font-medium pr-4">{faq.question}</span>
                  {expandedFAQ === index ? (
                    <ChevronUp size={20} className="text-[#d4af37] flex-shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Contact Section */}
      
      <section className="px-8 md:px-13">
        <div className="bg-black/20 rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-200 mb-4">Get in Touch</h2>
            <p className="text-gray-400 text-sm md:text-base">Have questions about our platform? Want to partner with us? Send us a message!</p>
          </div>


            <div className="text-center">
              <a
                href="mailto:gospelscreentv@gmail.com?subject=Enquires and Requests&body=Hi, I'd like to get in touch."
                className="px-8 py-3 bg-[#d4af37] text-black font-semibold rounded-lg hover:bg-[#d4af37]/80 transition-colors flex items-center justify-center gap-2 text-sm md:text-base mx-auto inline-flex"
              >
                <Send size={18} />
                Send Message
              </a>
            </div>
         
        </div>
      </section>
    </div>

    <Footer />
    </>
  );
};

export default Home;
