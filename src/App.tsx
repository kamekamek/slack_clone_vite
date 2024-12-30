import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { useSlackClone } from './hooks/useSlackClone';
import { useAuth } from './hooks/useAuth';
import { useUserProfile } from './hooks/useUserProfile';
import { AuthModal } from './components/Auth/AuthModal';
import { UserProfileModal } from './components/UserProfile/UserProfileModal';

function App() {
  const {
    messages,
    channels,
    currentChannel,
    setCurrentChannel,
    sendMessage,
    createChannel,
  } = useSlackClone();

  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    login,
    register,
    logout,
    guestLogin,
    resetPassword,
  } = useAuth();

  const {
    profile,
    isLoading: isProfileLoading,
    updateProfile,
    uploadAvatar,
    updateStatus,
    setOnlineStatus,
  } = useUserProfile(user?.id ?? null);

  const [showAuthModal, setShowAuthModal] = useState(!isAuthenticated);
  const [showProfileModal, setShowProfileModal] = useState(false);

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthModal
        onClose={() => setShowAuthModal(false)}
        onLogin={login}
        onRegister={register}
        onGuestLogin={guestLogin}
        onResetPassword={resetPassword}
      />
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        channels={channels}
        currentChannel={currentChannel}
        onChannelSelect={setCurrentChannel}
        onCreateChannel={createChannel}
        user={user}
        onProfileClick={() => setShowProfileModal(true)}
        onLogout={logout}
      />
      <div className="flex-1 flex flex-col">
        <MessageList
          messages={messages}
          currentChannel={currentChannel}
          currentUser={user}
        />
        <MessageInput
          onSendMessage={sendMessage}
          currentChannel={currentChannel}
        />
      </div>

      {showProfileModal && (
        <UserProfileModal
          onClose={() => setShowProfileModal(false)}
          profile={profile || {
            id: user.id,
            username: user.username,
            avatarUrl: null,
            status: '',
            isOnline: true,
          }}
          onUpdateProfile={updateProfile}
          onUploadAvatar={uploadAvatar}
          onUpdateOnlineStatus={setOnlineStatus}
        />
      )}
    </div>
  );
}

export default App;