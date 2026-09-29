import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

const getCachedProfile = (userId) => {
    try {
        if (userId) {
            const userKey = `user_custom_profile_${userId}`;
            const userCache = localStorage.getItem(userKey);
            if (userCache) return JSON.parse(userCache);
        }
        const fallbackCache = localStorage.getItem('user_custom_profile');
        return fallbackCache ? JSON.parse(fallbackCache) : null;
    } catch (e) {
        console.warn('Failed to parse cached profile:', e);
        return null;
    }
};

const mergeUserWithCache = (authUser) => {
    if (!authUser) return null;
    const cached = getCachedProfile(authUser.id);
    if (!cached) return authUser;
    return {
        ...authUser,
        user_metadata: {
            ...(authUser.user_metadata || {}),
            full_name: authUser.user_metadata?.full_name || cached.full_name,
            role: authUser.user_metadata?.role || cached.role,
            aura_color: authUser.user_metadata?.aura_color || cached.aura_color,
            avatar_url: cached.avatar_url || authUser.user_metadata?.avatar_url,
        }
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    // Auto-purge heavy avatar data from Supabase user_metadata to eliminate HTTP 431 Request Header Too Large
    const sanitizeUserMetadata = async (authUser) => {
        if (!authUser) return authUser;
        const meta = authUser.user_metadata || {};
        const avatarVal = meta.avatar_url;
        
        // If avatar_url is a Data URL or long string, it bloats the JWT Access Token (>10KB), causing HTTP 431
        if (avatarVal && typeof avatarVal === 'string' && (avatarVal.startsWith('data:') || avatarVal.length > 120)) {
            console.log('Sanitizing bloated avatar from Supabase JWT to keep token under 1KB...');
            // 1. Preserve the avatar locally
            try {
                const userKey = `user_custom_profile_${authUser.id}`;
                const existing = getCachedProfile(authUser.id) || {};
                const preserved = { ...existing, avatar_url: avatarVal };
                localStorage.setItem(userKey, JSON.stringify(preserved));
                localStorage.setItem('user_custom_profile', JSON.stringify(preserved));
            } catch (e) {
                console.warn('LocalStorage save error during sanitize:', e);
            }

            // 2. Strip avatar_url from Supabase cloud user_metadata so the JWT shrinks to ~800 bytes
            try {
                const { data } = await supabase.auth.updateUser({
                    data: {
                        avatar_url: null,
                        has_custom_avatar: true
                    }
                });
                if (data?.user) {
                    return data.user;
                }
            } catch (err) {
                console.warn('Cloud avatar purge error:', err);
            }
        }
        return authUser;
    };

    useEffect(() => {
        // Fetch current session
        const getInitialSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (!error && session?.user) {
                setSession(session);
                const cleanedUser = await sanitizeUserMetadata(session.user);
                setUser(mergeUserWithCache(cleanedUser));
            }
            setLoading(false);
        };

        getInitialSession();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session?.user) {
                const cleanedUser = await sanitizeUserMetadata(session.user);
                setUser(mergeUserWithCache(cleanedUser));
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signUp = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });
        if (error) throw error;
        return data;
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const updateProfile = async ({ fullName, avatarUrl, role, auraColor }) => {
        const localUpdates = {
            full_name: fullName,
            avatar_url: avatarUrl, // Full image data kept in client-side localStorage
            role: role || 'Wealth Builder',
            aura_color: auraColor || 'emerald',
            updated_at: new Date().toISOString()
        };

        // Cache in localStorage safely for immediate zero-latency persistence
        try {
            if (user?.id) {
                localStorage.setItem(`user_custom_profile_${user.id}`, JSON.stringify(localUpdates));
            }
            localStorage.setItem('user_custom_profile', JSON.stringify(localUpdates));
        } catch (storageErr) {
            console.warn('LocalStorage quota or access warning:', storageErr);
        }

        // Optimistically update React user state so UI updates instantly
        setUser(prevUser => {
            if (!prevUser) return prevUser;
            return {
                ...prevUser,
                user_metadata: {
                    ...(prevUser.user_metadata || {}),
                    ...localUpdates
                }
            };
        });

        // Sync ONLY lightweight metadata to Supabase to keep the JWT compact (~800 bytes)
        // Never put base64 image strings in cloud user_metadata because it inflates HTTP headers!
        const cloudUpdates = {
            full_name: fullName,
            role: role || 'Wealth Builder',
            aura_color: auraColor || 'emerald',
            has_custom_avatar: Boolean(avatarUrl),
            avatar_url: null, // explicit null to avoid JWT bloat
            updated_at: new Date().toISOString()
        };

        try {
            const { data, error } = await supabase.auth.updateUser({
                data: cloudUpdates,
            });
            if (error) {
                console.warn('Supabase updateUser warning:', error.message);
            }
            if (data?.user) {
                setUser({
                    ...data.user,
                    user_metadata: {
                        ...(data.user.user_metadata || {}),
                        ...localUpdates // preserve local custom avatar
                    }
                });
            }
            return localUpdates;
        } catch (err) {
            console.warn('Profile update error, retained locally:', err);
            return localUpdates;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                signUp,
                signIn,
                signOut,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
