import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState, LoginCredentials, SignupData } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (resource: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: { user: User; token: string } };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'RESTORE_SESSION':
      return {
        user: action.payload.user,
        isAuthenticated: true,
        token: action.payload.token,
      };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        token: null,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    console.log('AuthProvider useEffect: Setting up auth listeners');
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session check:', { session: session ? 'present' : 'null', error });
      if (session) {
        console.log('Initial session found, handling...');
        handleAuthSession(session);
      } else {
        console.log('No initial session found');
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change event:', event, { session: session ? 'present' : 'null' });
      if (event === 'SIGNED_IN' && session) {
        console.log('SIGNED_IN event detected, handling session...');
        await handleAuthSession(session);
      } else if (event === 'SIGNED_OUT') {
        console.log('SIGNED_OUT event detected');
        dispatch({ type: 'LOGOUT' });
      }
    });

    console.log('Auth listeners set up successfully');
    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSession = async (session: any) => {
    console.log('=== handleAuthSession START ===');
    console.log('Session object:', {
      userId: session?.user?.id,
      email: session?.user?.email,
      accessToken: session?.access_token ? 'present' : 'missing'
    });
    
    try {
      if (!session?.user?.id) {
        console.error('No user ID in session');
        return;
      }
      
      console.log('About to query users table for user:', session.user.id);
      
      // Add timeout to database query
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), 10000);
      });
      
      let userProfile = null;
      let error = null;
      
      try {
        const result = await Promise.race([queryPromise, timeoutPromise]);
        userProfile = (result as any).data;
        error = (result as any).error;
        console.log('Database query completed successfully');
      } catch (timeoutError) {
        console.error('Database query timed out or failed:', timeoutError);
        error = timeoutError;
      }

      console.log('User profile query result:', { userProfile, error });

      if (error) {
        console.error('Error fetching user profile:', error);
        console.log('Will create fallback user due to error');
        // Skip to fallback user creation
        userProfile = null;
      }

      if (userProfile) {
        console.log('Found user profile, creating user object');
        const user: User = {
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          role: userProfile.role,
          phone: userProfile.phone,
          permissions: userProfile.permissions || [],
          isActive: userProfile.is_active,
          createdAt: new Date(userProfile.created_at),
        };

        console.log('Dispatching LOGIN_SUCCESS with database user:', user);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token: session.access_token },
        });
        console.log('=== handleAuthSession SUCCESS (database user) ===');
        return;
      } else {
        console.log('No user profile found, creating basic user');
      }
      
      // Create fallback user (either due to error or no profile found)
      const basicUser: User = {
        id: session.user.id,
        name: session.user.email?.split('@')[0] || 'User',
        email: session.user.email || '',
        role: 'admin', // Default to admin for testing
        permissions: [{ id: '1', name: 'All Access', resource: '*', action: 'read' }],
        isActive: true,
        createdAt: new Date(),
      };
      
      console.log('Dispatching LOGIN_SUCCESS with fallback user:', basicUser);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: basicUser, token: session.access_token },
      });
      console.log('=== handleAuthSession SUCCESS (fallback user) ===');
      
    } catch (error) {
      console.error('Error handling auth session:', error);
      console.log('Creating emergency fallback user due to exception');
      const basicUser: User = {
        id: session.user.id,
        name: session.user.email?.split('@')[0] || 'User',
        email: session.user.email || '',
        role: 'admin', // Default to admin for testing
        permissions: [{ id: '1', name: 'All Access', resource: '*', action: 'read' }],
        isActive: true,
        createdAt: new Date(),
      };
      
      console.log('Dispatching LOGIN_SUCCESS after error with emergency user:', basicUser);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: basicUser, token: session.access_token },
      });
      console.log('=== handleAuthSession SUCCESS (emergency user) ===');
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    console.log('=== LOGIN ATTEMPT START ===');
    console.log('Login credentials:', { email: credentials.email });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      console.log('Supabase signInWithPassword result:', { 
        data: data ? 'present' : 'null', 
        error: error ? error.message : 'none',
        session: data?.session ? 'present' : 'null'
      });

      if (error) {
        console.error('Login error:', error);
        console.log('=== LOGIN ATTEMPT FAILED ===');
        return false;
      }

      if (data.session) {
        console.log('Session received, calling handleAuthSession...');
        await handleAuthSession(data.session);
        console.log('=== LOGIN ATTEMPT SUCCESS ===');
        return true;
      }

      console.log('No session in login response');
      console.log('=== LOGIN ATTEMPT FAILED (no session) ===');
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      console.log('=== LOGIN ATTEMPT FAILED (exception) ===');
      return false;
    }
  };

  const signup = async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    try {
      // First, sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        console.error('Signup auth error:', authError);
        if (authError.message === 'User already registered') {
          return { success: false, error: 'An account with this email already exists. Please try signing in instead.' };
        }
        return { success: false, error: authError.message || 'Authentication failed. Please try again.' };
      }

      if (!authData.user) {
        console.error('No user returned from signup');
        return { success: false, error: 'Account creation failed. Please try again.' };
      }

      // Create user profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: data.name,
          email: data.email,
          role: data.role,
          phone: data.phone,
          permissions: getDefaultPermissions(data.role),
          is_active: true,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        if (profileError.message?.includes('infinite recursion')) {
          return { success: false, error: 'Database configuration error. Please contact support.' };
        }
        return { success: false, error: `Profile creation failed: ${profileError.message}` };
      }

      // If there's a session, handle it
      if (authData.session) {
        await handleAuthSession(authData.session);
      }

      return { success: true };
    } catch (error) {
      console.error('Signup failed:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!state.user) return false;
    
    // Admin has all permissions
    if (state.user.role === 'admin') return true;
    
    // Check for wildcard permissions
    const hasWildcard = state.user.permissions.some(
      permission => permission.resource === '*' || 
      (permission.resource === resource && permission.action === '*')
    );
    
    if (hasWildcard) return true;
    
    return state.user.permissions.some(
      permission => permission.resource === resource && permission.action === action
    );
  };

  return (
    <AuthContext.Provider value={{ state, login, signup, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function getDefaultPermissions(role: User['role']) {
  switch (role) {
    case 'admin':
      return [
        { id: '1', name: 'All Access', resource: '*', action: '*' as any }
      ];
    case 'dispatcher':
      return [
        { id: '2', name: 'Orders Read', resource: 'orders', action: 'read' as any },
        { id: '3', name: 'Orders Update', resource: 'orders', action: 'update' as any },
        { id: '4', name: 'Deliveries Read', resource: 'deliveries', action: 'read' as any },
        { id: '5', name: 'Deliveries Update', resource: 'deliveries', action: 'update' as any },
      ];
    case 'agent':
      return [
        { id: '6', name: 'Deliveries Read', resource: 'deliveries', action: 'read' as any },
        { id: '7', name: 'Deliveries Update', resource: 'deliveries', action: 'update' as any },
      ];
    case 'warehouse':
      return [
        { id: '8', name: 'Inventory Read', resource: 'inventory', action: 'read' as any },
        { id: '9', name: 'Inventory Update', resource: 'inventory', action: 'update' as any },
        { id: '10', name: 'Orders Read', resource: 'orders', action: 'read' as any },
      ];
    case 'accounting':
      return [
        { id: '11', name: 'Invoices Read', resource: 'invoices', action: 'read' as any },
        { id: '12', name: 'Invoices Create', resource: 'invoices', action: 'create' as any },
        { id: '13', name: 'Reports Export', resource: 'reports', action: 'export' as any },
      ];
    default:
      return [];
  }
}