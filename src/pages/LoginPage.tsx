import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Envelope, Lock } from '@phosphor-icons/react';
import { Button, Input } from '../components/ui';
import { useApp } from '../context/AppContext';
import logo from '../assets/logo.png';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, state } = useApp();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setErrors({ submit: 'Please enter your email and password' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        // Check if onboarding is complete
        if (state.user?.onboardingCompleted) {
          navigate('/app');
        } else {
          navigate('/onboarding');
        }
      } else {
        setErrors({ submit: 'Invalid email or password' });
      }
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
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

          <h2 className="text-2xl font-bold text-text-primary mb-2 text-center">Welcome back</h2>
          <p className="text-text-secondary mb-8 text-center">Sign in to continue your journey</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
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
              placeholder="Your password"
              icon={<Lock className="w-5 h-5" />}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              error={errors.password}
            />

            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm text-accent-cyan hover:underline"
              >
                Forgot password?
              </Link>
            </div>

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
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-text-secondary text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent-cyan hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

