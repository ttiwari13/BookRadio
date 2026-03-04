import React, { useState } from 'react';
import { MessageSquare, X, Send, Star, ChevronDown } from 'lucide-react';
import API from '../api/axios'; // ✅ Use your custom API instance

export default function FloatingFeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const feedbackTypes = [
    'Bug Report', 'Feature Request', 'General Feedback', 'Performance Issue', 'UI/UX Feedback'
  ];

  const ratingLabels = {
    1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent'
  };

  const handleSubmit = async () => {
    if (!feedback.trim() || rating === 0 || !feedbackType) return;

    try {
      await API.post(
        "/api/feedback",
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

  // ... (Rest of your component is perfect and doesn't need changes)
}
