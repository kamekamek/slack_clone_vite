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
    return savedAuth
      ? JSON.parse(savedAuth)
      : { user: null, isAuthenticated: false, isLoading: true };
  });

  useEffect(() => {
    localStorage.setItem('slack-clone-auth', JSON.stringify(authState));
  }, [authState]);

  const login = async (email: string, password: string) => {
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
      throw new Error('ログインに失敗しました');
    }
  };

  const register = async (email: string, password: string, username: string) => {
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
      throw new Error('ユーザー登録に失敗しました');
    }
  };

  const logout = () => {
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    localStorage.removeItem('slack-clone-auth');
  };

  const guestLogin = () => {
    const guestUser: User = {
      id: `guest-${Date.now()}`,
      email: 'guest@example.com',
      username: `ゲスト${Math.floor(Math.random() * 1000)}`,
      isGuest: true,
    };
    setAuthState({ user: guestUser, isAuthenticated: true, isLoading: false });
  };

  const resetPassword = async (email: string) => {
    try {
      // 実際のアプリケーションではパスワードリセットメールを送信
      return true;
    } catch (error) {
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
