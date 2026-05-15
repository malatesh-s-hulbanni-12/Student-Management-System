import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import { 
  FiGlobe, 
  FiSave, 
  FiCheckCircle,
  FiUser,
  FiBell,
  FiShield,
  FiMonitor,
  FiMoon,
  FiSun,
  FiEye,
  FiEyeOff,
  FiAlertCircle
} from 'react-icons/fi'

function Settings() {
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [showPassword, setShowPassword] = useState(false)
  
  // Form states
  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    email: 'admin@fypms.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [preferences, setPreferences] = useState({
    theme: 'light',
    notifications: true,
    emailAlerts: true,
    dateFormat: 'DD/MM/YYYY'
  })

  // Load saved settings from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('app_language')
    const savedTheme = localStorage.getItem('app_theme')
    const savedPreferences = localStorage.getItem('app_preferences')
    
    if (savedLanguage) setSelectedLanguage(savedLanguage)
    if (savedTheme) setPreferences(prev => ({ ...prev, theme: savedTheme }))
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences)
        setPreferences(prev => ({ ...prev, ...parsed }))
      } catch (e) {}
    }

    // Apply theme
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Language change handler
  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode)
    localStorage.setItem('app_language', langCode)
    
    const languageNames = {
      en: 'English',
      hi: 'हिन्दी (Hindi)',
      kn: 'ಕನ್ನಡ (Kannada)',
      ta: 'தமிழ் (Tamil)',
      te: 'తెలుగు (Telugu)',
      ml: 'മലയാളം (Malayalam)',
      fr: 'Français',
      es: 'Español',
      de: 'Deutsch',
      zh: '中文',
      ja: '日本語',
      ru: 'Русский',
      ar: 'العربية',
      pa: 'ਪੰਜਾਬੀ',
      gu: 'ગુજરાતી',
      bn: 'বাংলা'
    }
    
    showSuccess(`🌐 Language set to ${languageNames[langCode]}`)
    
    // Reload page to apply language changes (if you have translations implemented)
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }

  // Theme change handler
  const handleThemeChange = (theme) => {
    setPreferences({ ...preferences, theme })
    localStorage.setItem('app_theme', theme)
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    showSuccess(`${theme === 'dark' ? 'Dark' : 'Light'} mode activated!`)
  }

  // Save profile changes
  const handleSaveProfile = async () => {
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      showError('New passwords do not match!')
      return
    }
    
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      showSuccess('Profile updated successfully!')
      setProfileData({
        ...profileData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      showError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  // Save preferences
  const handleSavePreferences = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      localStorage.setItem('app_preferences', JSON.stringify(preferences))
      showSuccess('Preferences saved successfully!')
    } catch (error) {
      showError('Failed to save preferences')
    } finally {
      setLoading(false)
    }
  }

  const languages = [
    // Indian Languages
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    // International Languages
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' }
  ]

  const indianLanguages = languages.filter(l => ['en','hi','kn','ta','te','ml','pa','gu','bn'].includes(l.code))
  const internationalLanguages = languages.filter(l => ['fr','es','de','zh','ja','ru','ar'].includes(l.code))

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
        <p className="text-gray-600">Configure system preferences and settings</p>
      </div>

      <div className="space-y-6">
        {/* Language Settings Section */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center gap-2">
              <FiGlobe className="text-blue-500" size={20} />
              <h3 className="font-semibold text-gray-800">Language Settings</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">Select your preferred website language</p>
          </div>
          
          <div className="p-6">
            {/* Note about translation */}
            <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-yellow-600" size={16} />
                <p className="text-xs text-yellow-700">
                  Language preference saved. Page will reload to apply language settings.
                </p>
              </div>
            </div>

            {/* Indian Languages Section */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-lg">🇮🇳</span> Indian Languages
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {indianLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      selectedLanguage === lang.code
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-left flex-1">
                      <p className={`text-sm font-medium ${selectedLanguage === lang.code ? 'text-blue-700' : 'text-gray-700'}`}>
                        {lang.name}
                      </p>
                      <p className="text-xs text-gray-400">{lang.nativeName}</p>
                    </div>
                    {selectedLanguage === lang.code && (
                      <FiCheckCircle className="text-blue-500" size={16} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* International Languages Section */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-lg">🌐</span> International Languages
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {internationalLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      selectedLanguage === lang.code
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-left flex-1">
                      <p className={`text-sm font-medium ${selectedLanguage === lang.code ? 'text-blue-700' : 'text-gray-700'}`}>
                        {lang.name}
                      </p>
                      <p className="text-xs text-gray-400">{lang.nativeName}</p>
                    </div>
                    {selectedLanguage === lang.code && (
                      <FiCheckCircle className="text-blue-500" size={16} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center gap-2">
              <FiMonitor className="text-purple-500" size={20} />
              <h3 className="font-semibold text-gray-800">Appearance</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">Customize the look and feel</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme Mode</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      preferences.theme === 'light'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FiSun size={18} />
                    <span className="text-sm font-medium">Light</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      preferences.theme === 'dark'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FiMoon size={18} />
                    <span className="text-sm font-medium">Dark</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                <select
                  value={preferences.dateFormat}
                  onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center gap-2">
              <FiBell className="text-orange-500" size={20} />
              <h3 className="font-semibold text-gray-800">Notifications</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">Manage how you receive notifications</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Push Notifications</p>
                  <p className="text-xs text-gray-500">Receive browser notifications</p>
                </div>
                <button
                  onClick={() => setPreferences({ ...preferences, notifications: !preferences.notifications })}
                  className={`w-12 h-6 rounded-full transition-all ${
                    preferences.notifications ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${preferences.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Email Alerts</p>
                  <p className="text-xs text-gray-500">Receive email notifications</p>
                </div>
                <button
                  onClick={() => setPreferences({ ...preferences, emailAlerts: !preferences.emailAlerts })}
                  className={`w-12 h-6 rounded-full transition-all ${
                    preferences.emailAlerts ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${preferences.emailAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSavePreferences}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all disabled:opacity-50"
              >
                <FiSave size={14} />
                Save Preferences
              </button>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center gap-2">
              <FiUser className="text-green-500" size={20} />
              <h3 className="font-semibold text-gray-800">Profile Settings</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">Update your account information</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={profileData.currentPassword}
                  onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter current password to change"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="New password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  {showPassword ? 'Hide' : 'Show'} Passwords
                </button>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-all disabled:opacity-50"
              >
                <FiSave size={14} />
                Save Profile
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center gap-2">
              <FiShield className="text-red-500" size={20} />
              <h3 className="font-semibold text-gray-800">Security</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">Manage security settings</p>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-all">
                Configure
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Session Management</p>
                  <p className="text-xs text-gray-500">Manage active sessions and devices</p>
                </div>
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-all">
                  Manage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings