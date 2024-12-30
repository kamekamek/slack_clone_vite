import { useState, useEffect } from 'react';

interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string | null;
  status: string;
  isOnline: boolean;
}

interface UserProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
}

export function useUserProfile(userId: string | null) {
  const [profileState, setProfileState] = useState<UserProfileState>(() => {
    if (!userId) {
      return { profile: null, isLoading: false };
    }

    const savedProfile = localStorage.getItem(`slack-clone-profile-${userId}`);
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }

    // デフォルトプロフィールを作成
    const defaultProfile: UserProfile = {
      id: userId,
      username: `ユーザー${userId.slice(0, 4)}`,
      avatarUrl: null,
      status: '',
      isOnline: true,
    };

    return { profile: defaultProfile, isLoading: false };
  });

  useEffect(() => {
    if (userId && profileState.profile) {
      localStorage.setItem(
        `slack-clone-profile-${userId}`,
        JSON.stringify(profileState)
      );
    }
  }, [userId, profileState]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      // 実際のアプリケーションではAPIリクエストを行う
      const updatedProfile = {
        ...profileState.profile,
        ...updates,
      } as UserProfile;
      setProfileState({ profile: updatedProfile, isLoading: false });
      return updatedProfile;
    } catch (error) {
      throw new Error('プロフィールの更新に失敗しました');
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      // 実際のアプリケーションではファイルアップロードを行う
      const mockUrl = URL.createObjectURL(file);
      return await updateProfile({ avatarUrl: mockUrl });
    } catch (error) {
      throw new Error('アバターのアップロードに失敗しました');
    }
  };

  const updateStatus = async (status: string) => {
    try {
      return await updateProfile({ status });
    } catch (error) {
      throw new Error('ステータスの更新に失敗しました');
    }
  };

  const setOnlineStatus = async (isOnline: boolean) => {
    try {
      return await updateProfile({ isOnline });
    } catch (error) {
      throw new Error('オンラインステータスの更新に失敗しました');
    }
  };

  return {
    profile: profileState.profile,
    isLoading: profileState.isLoading,
    updateProfile,
    uploadAvatar,
    updateStatus,
    setOnlineStatus,
  };
}
