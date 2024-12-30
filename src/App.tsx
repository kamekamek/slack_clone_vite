import React from 'react';
import { Sidebar } from './components/Sidebar';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { useSlackClone } from './hooks/useSlackClone';

function App() {
  const { messages, channels, currentChannel, setCurrentChannel, sendMessage, createChannel } = useSlackClone();

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        channels={channels}
        currentChannel={currentChannel}
        onChannelSelect={setCurrentChannel}
        onCreateChannel={createChannel}
      />
      <div className="flex-1 flex flex-col">
        <MessageList
          messages={messages}
          currentChannel={currentChannel}
        />
        <MessageInput
          onSendMessage={sendMessage}
          currentChannel={currentChannel}
        />
      </div>
    </div>
  );
}

export default App;