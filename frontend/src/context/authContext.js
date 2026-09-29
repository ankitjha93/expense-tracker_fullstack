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

    useEffect(() => {
        // Fetch current session
        const getInitialSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (!error && session) {
                setSession(session);
                setUser(mergeUserWithCache(session.user));
            }
            setLoading(false);
        };

        getInitialSession();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session ? mergeUserWithCache(session.user) : null);
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
        const updates = {
            full_name: fullName,
            avatar_url: avatarUrl,
            role: role || 'Wealth Builder',
            aura_color: auraColor || 'emerald',
            updated_at: new Date().toISOString()
        };

        // Cache in localStorage safely for immediate zero-latency persistence
        try {
            if (user?.id) {
                localStorage.setItem(`user_custom_profile_${user.id}`, JSON.stringify(updates));
            }
            localStorage.setItem('user_custom_profile', JSON.stringify(updates));
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
                    ...updates
                }
            };
        });

        // Sync with Supabase cloud
        try {
            const { data, error } = await supabase.auth.updateUser({
                data: updates,
            });
            if (error) {
                console.warn('Supabase updateUser warning:', error.message);
            }
            if (data?.user) {
                setUser({
                    ...data.user,
                    user_metadata: {
                        ...(data.user.user_metadata || {}),
                        ...updates
                    }
                });
            }
            return updates;
        } catch (err) {
            console.warn('Profile update error, retained locally:', err);
            return updates;
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
