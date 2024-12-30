import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  isGuest: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedAuth = localStorage.getItem('slack-clone-auth');
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      return { ...parsed, isLoading: false };
    }
    return { user: null, isAuthenticated: false, isLoading: false };
  });

  useEffect(() => {
    if (!authState.isLoading) {
      localStorage.setItem('slack-clone-auth', JSON.stringify(authState));
    }
  }, [authState]);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      // 実際のアプリケーションではAPIリクエストを行う
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        username: email.split('@')[0],
        isGuest: false,
      };
      setAuthState({ user: mockUser, isAuthenticated: true, isLoading: false });
      return mockUser;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error('ログインに失敗しました');
    }
  };

  const register = async (email: string, password: string, username: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      // 実際のアプリケーションではAPIリクエストを行う
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        username,
        isGuest: false,
      };
      setAuthState({ user: mockUser, isAuthenticated: true, isLoading: false });
      return mockUser;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error('ユーザー登録に失敗しました');
    }
  };

  const logout = () => {
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    localStorage.removeItem('slack-clone-auth');
  };

  const guestLogin = () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const guestUser: User = {
        id: `guest-${Date.now()}`,
        email: 'guest@example.com',
        username: `ゲスト${Math.floor(Math.random() * 1000)}`,
        isGuest: true,
      };
      setAuthState({ user: guestUser, isAuthenticated: true, isLoading: false });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error('ゲストログインに失敗しました');
    }
  };

  const resetPassword = async (email: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      // 実際のアプリケーションではパスワードリセットメールを送信
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error('パスワードリセットに失敗しました');
    }
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    register,
    logout,
    guestLogin,
    resetPassword,
  };
}
