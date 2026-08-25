import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { User, Shield, Settings, Check, Upload, Camera } from 'lucide-react';

export const OnboardingPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { number: 1, label: t('onboarding.step1'), icon: User },
    { number: 2, label: t('onboarding.step2'), icon: Shield },
    { number: 3, label: t('onboarding.step3'), icon: Settings },
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('onboarding.welcome')}</h1>
          <p className="text-slate-600">Let's set up your profile in a few simple steps</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <span
                      className={`mt-2 text-xs sm:text-sm text-center ${
                        isCurrent ? 'text-blue-700 font-medium' : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 rounded transition-all ${
                        isCompleted ? 'bg-green-500' : 'bg-slate-200'
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Personal Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Country of Origin</label>
                <select className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option>Select your country</option>
                  <option>Angola</option>
                  <option>Mozambique</option>
                  <option>Nigeria</option>
                  <option>Zimbabwe</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number (WhatsApp)</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="+27 123 456 7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Language</label>
                <select className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option>English</option>
                  <option>Português</option>
                  <option>Français</option>
                  <option>Español</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Identity Verification</h2>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">Why verify?</h3>
                    <p className="text-sm text-blue-700">
                      Verification helps us ensure secure access to services and builds trust with providers.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Document Type</label>
                <select className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option>Passport</option>
                  <option>National ID</option>
                  <option>Student ID</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Document Number</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter document number"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">Upload Front</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">Upload Back</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">Take Selfie for Verification</p>
                <p className="text-xs text-slate-500 mt-1">Look straight at the camera</p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Study Preferences</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Intended Field of Study</label>
                <select className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option>Select field</option>
                  <option>Engineering</option>
                  <option>Business & Management</option>
                  <option>Medicine & Health Sciences</option>
                  <option>Arts & Humanities</option>
                  <option>Science & Technology</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Universities</label>
                <div className="space-y-2">
                  {['University of Cape Town', 'University of Witwatersrand', 'Stellenbosch University', 'University of Pretoria'].map((uni) => (
                    <label key={uni} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                      <span className="text-slate-700">{uni}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Intended Start Year</label>
                <select className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option>2026</option>
                  <option>2027</option>
                  <option>2028</option>
                </select>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                  <h3 className="font-medium text-slate-900">You're all set!</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Click complete to access your personalized dashboard and start your application journey.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
              className={`px-6 py-2 rounded-xl transition-colors ${
                currentStep === 1
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              disabled={currentStep === 1}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30"
            >
              {currentStep === 3 ? t('onboarding.complete') : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
