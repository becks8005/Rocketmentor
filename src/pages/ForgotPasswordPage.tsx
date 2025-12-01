import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Envelope, ArrowLeft, CheckCircle } from '@phosphor-icons/react';
import { Button, Input } from '../components/ui';
import logo from '../assets/logo.png';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-bg-secondary border border-border-primary rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center p-2">
              <img src={logo} alt="Rocketmentor logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold text-text-primary">rocketmentor</span>
          </div>

          {!isSubmitted ? (
            <>
              <h2 className="text-2xl font-bold text-text-primary mb-2 text-center">
                Reset your password
              </h2>
              <p className="text-text-secondary mb-8 text-center">
                Enter your email and we'll send you a reset link
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@company.com"
                  icon={<Envelope className="w-5 h-5" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Send reset link
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-accent-green" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Check your email
              </h2>
              <p className="text-text-secondary mb-6">
                We've sent a password reset link to<br />
                <span className="text-text-primary font-medium">{email}</span>
              </p>
              <p className="text-sm text-text-muted">
                Didn't receive the email? Check your spam folder or{' '}
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="text-accent-cyan hover:underline"
                >
                  try again
                </button>
              </p>
            </motion.div>
          )}

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

