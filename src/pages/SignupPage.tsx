import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Envelope, Lock, User, CheckCircle } from '@phosphor-icons/react';
import { Button, Input } from '../components/ui';
import { useApp } from '../context/AppContext';
import logo from '../assets/logo.png';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useApp();
  
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = 'You must accept the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const success = await signup(formData.firstName, formData.email, formData.password);
      if (success) {
        navigate('/onboarding');
      }
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-accent-blue/10" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-accent-blue/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center p-2">
                <img src={logo} alt="Rocketmentor logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-bold text-text-primary">rocketmentor</span>
            </div>
            
            <h1 className="text-4xl font-bold text-text-primary mb-6 leading-tight">
              Your promotion system,<br />
              <span className="gradient-text">disguised as a weekly cockpit</span>
            </h1>
            
            <p className="text-text-secondary text-lg mb-10 max-w-md">
              Turn your daily work into proof points. Get AI-powered guidance tailored to what your manager actually cares about.
            </p>

            <div className="space-y-4">
              {[
                'Plan your week with promotion in mind',
                'Capture wins automatically',
                'Get tactical advice from an AI mentor',
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-accent-green" />
                  <span className="text-text-secondary">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center p-1.5">
              <img src={logo} alt="Rocketmentor logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-text-primary">rocketmentor</span>
          </div>

          <h2 className="text-2xl font-bold text-text-primary mb-2">Create your account</h2>
          <p className="text-text-secondary mb-8">Start your journey to promotion</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="First name"
              placeholder="Your first name"
              icon={<User className="w-5 h-5" />}
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              error={errors.firstName}
            />

            <Input
              label="Work email"
              type="email"
              placeholder="you@company.com"
              icon={<Envelope className="w-5 h-5" />}
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              icon={<Lock className="w-5 h-5" />}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              error={errors.password}
            />

            <Input
              label="Confirm password"
              type="password"
              placeholder="Confirm your password"
              icon={<Lock className="w-5 h-5" />}
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              error={errors.confirmPassword}
            />

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={formData.acceptedTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, acceptedTerms: e.target.checked }))}
                className="mt-1 w-4 h-4 rounded border-border-primary bg-bg-elevated text-accent-blue focus:ring-accent-blue/50 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-text-secondary cursor-pointer">
                I confirm I will not enter confidential client information into Rocketmentor.
              </label>
            </div>
            {errors.acceptedTerms && (
              <p className="text-xs text-accent-rose">{errors.acceptedTerms}</p>
            )}

            {errors.submit && (
              <p className="text-sm text-accent-rose text-center">{errors.submit}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Create my rocketmentor account
            </Button>
          </form>

          <p className="mt-6 text-center text-text-secondary text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-cyan hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

