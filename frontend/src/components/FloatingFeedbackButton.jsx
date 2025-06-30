import React, { useState } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Star, ChevronDown } from 'lucide-react';

export default function FloatingFeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const feedbackTypes = [
    'Bug Report',
    'Feature Request',
    'General Feedback',
    'Performance Issue',
    'UI/UX Feedback'
  ];

  const ratingLabels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };

  const handleSubmit = async () => {
    if (!feedback.trim() || rating === 0 || !feedbackType) return;

    try {
      await axios.post(
        "http://localhost:5000/api/feedback",
        { feedback, rating, feedbackType },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setIsOpen(false);
        setFeedback('');
        setRating(0);
        setFeedbackType('');
      }, 2500);
    } catch (error) {
      console.error("Failed to send feedback:", error);
      alert("❌ Feedback failed to send. Please try again later.");
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-full w-14 h-14 shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
        >
          {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
        </button>
      </div>

      {/* Feedback Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-96 max-w-[calc(100vw-2rem)] backdrop-blur-sm">
          {isSubmitted ? (
            <div className="p-8 text-center">
              <div className="text-emerald-400 mb-4">
                <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Thank you!</h3>
              <p className="text-slate-400">Your feedback has been submitted successfully.</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Send Feedback</h3>
              </div>

              {/* Star Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  How would you rate your overall experience?
                </label>
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`transition-all duration-200 hover:scale-110 ${
                        star <= rating
                          ? 'text-yellow-400'
                          : 'text-slate-600 hover:text-yellow-300'
                      }`}
                    >
                      <Star size={24} fill={star <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <div className="flex items-center text-sm">
                    <span className="text-yellow-400 mr-2">★</span>
                    <span className="text-purple-400 font-medium">{ratingLabels[rating]}</span>
                  </div>
                )}
              </div>

              {/* Feedback Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Feedback Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-slate-700 border border-slate-600 text-slate-300 px-4 py-3 rounded-lg text-left flex items-center justify-between"
                  >
                    <span className={feedbackType ? 'text-white' : 'text-slate-500'}>
                      {feedbackType || 'Select feedback type...'}
                    </span>
                    <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-10">
                      {feedbackTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setFeedbackType(type);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-600"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Feedback */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Detailed Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write your feedback here..."
                  className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg resize-none text-white"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!feedback.trim() || rating === 0 || !feedbackType}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
              >
                <Send size={18} />
                Submit Feedback
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
