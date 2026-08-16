/**
 * Profile Service API Client
 * Manages user profile information.
 * Prepared for future integration with Python + Django REST API /api/profile/.
 */

// Default generic user avatar placeholder
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80";

export const profileService = {
  fetchProfile: async (email) => {
    // Mimic API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    if (!email) return null;

    try {
      const stored = localStorage.getItem(`moxie_profile_${email}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading profile from localStorage:", e);
    }

    // Default fallback profile
    const defaultProfile = {
      name: email.split("@")[0].toUpperCase(),
      email: email,
      mobile: "+91 98765 43210",
      avatar: DEFAULT_AVATAR,
      joinedDate: new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };

    localStorage.setItem(`moxie_profile_${email}`, JSON.stringify(defaultProfile));
    return defaultProfile;
  },

  updateProfile: async (email, data) => {
    // Mimic API delay
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    if (!email) return null;

    const currentProfile = await profileService.fetchProfile(email);
    const updated = { ...currentProfile, ...data };
    
    localStorage.setItem(`moxie_profile_${email}`, JSON.stringify(updated));
    return updated;
  }
};
