import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Avatar, Box, Button, Stack, Text, useToast } from '@chakra-ui/react';

import LoadingSkeleton from '../loaders/LoadingSkeleton';

import { ChatState } from '../../context/chatProvider';
import { AddIcon } from '@chakra-ui/icons';
import { getFullSender, getSender, getSenderImg } from '../../utils/chatUtils';
import GroupChatModal from '../groups/GroupChatModal';

const ChatList = ({ fetchAgain }) => {

  const toast = useToast();
  const [loggedUser, setLoggedUser] = useState(null);
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const { name, img, token, _id } = user;
  

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          authorization: `Bearer ${token}`,
        }
      };

      const { data } = await axios.get('/api/chat', config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);

      setChats(data);
    } catch (error) {
      toast({
        title: `שגיאה חמורה!`,
        status: 'error',
        description: `לא ניתן לפתוח את הצ'ט`,
        duration: 4000,
        isClosable: true,
        position: 'bottom-right'
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem('chatUserInfo')));
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box d={{ base: selectedChat ? 'none' : 'flex', md: 'flex' }}
      flexDir='column' alignItems='center' p={3} bg='white'
      borderRadius='lg' borderWidth='1px' w={{ base: '100%', md: '30%' }}
    >
      <Box pb={3} px={3} fontSize={{ base: '28px', md: '30px' }} w='100%'
        d='flex' justifyContent='space-between' alignItems='center'>
        הצ'טים שלי

        <GroupChatModal>
          <Button d='flex' fontSize={{ base: '17px', md: '10px', lg: '17px' }}
            leftIcon={<AddIcon />}>
            קבוצה חדשה
          </Button>
        </GroupChatModal>
      </Box>

      <Box d='flex' flexDir='column' p={3} bg='#F8F8F8'
        w='100%' h='100%' borderRadius='lg' overflowY='hidden'
      >{chats.length === 0 && <Text>טיפה סבלנות...</Text>}
        {chats
          ? (
            <Stack overflowY='scroll'>
              {chats.map((chat) => (
                <Box key={chat._id} onClick={() => setSelectedChat(chat)}
                  cursor='pointer' px={3} py={2} borderRadius='lg' d='flex'
                  bg={selectedChat === chat ? 'goldenrod' : '#E8E8E8'}
                  color={selectedChat === chat ? 'white' : 'black'}
                >
                  <Avatar src={!chat.isGroupChat
                    ? getSenderImg(user, chat?.users)
                    || `https://robohash.org/${getFullSender(user, chat?.users)._id}?set=set4`
                    : `https://avatars.dicebear.com/api/initials/${chat.chatName}.svg`}
                    size='sm' ml={3} />
                  <Text>
                    {!chat.isGroupChat
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName.substring(0, 25) + "..."}
                  </Text>
                  <br />
                  {chat.lastMessage && (
                    <Text fontSize="xs">
                      <b>{chat.lastMessage.sender.name} &nbsp; </b>
                      {chat.lastMessage.content.length > 30
                        ? chat.lastMessage.content.substring(0, 30) + "..."
                        : chat.lastMessage.content}
                    </Text>
                  )}
                </Box>
              ))}
            </Stack>
          )
          : (
            <LoadingSkeleton />
          )
        }
      </Box>

    </Box>
  )
}

export default ChatList