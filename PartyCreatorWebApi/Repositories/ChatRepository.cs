﻿using PartyCreatorWebApi.Dtos;
using PartyCreatorWebApi.Entities;
using PartyCreatorWebApi.Repositories.Contracts;
using System.Security.Cryptography;
using System.Text;

namespace PartyCreatorWebApi.Repositories
{
    public class ChatRepository : IChatRepository
    {
        private readonly DataContext _dataContext;
        public readonly string key = "b14ca5898a4e4133bbce2ea2315a1916";
        public ChatRepository(DataContext dataContext)
        {
            _dataContext = dataContext;
        }
        public async Task<ChatMessageDto> CreateChatMessage(ChatMessage chatMessage)
        {
            var result = await _dataContext.ChatMessages.AddAsync(chatMessage);
            await _dataContext.SaveChangesAsync();
            var message = new ChatMessageDto
            {
                Id = chatMessage.Id,
                EventId = chatMessage.EventId,
                DateTime = chatMessage.DateTime,
                UserId = chatMessage.UserId,
                Message = chatMessage.Message,
                FirstName = _dataContext.Users.Where(u => u.Id == result.Entity.UserId).Select(f => f.FirstName).FirstOrDefault(),
                LastName = _dataContext.Users.Where(u => u.Id == result.Entity.UserId).Select(f => f.LastName).FirstOrDefault(),
            };
            return message;
        }

        public async Task<List<ChatMessageDto>> GetAllMessages(int eventId)
        {
            var result = await _dataContext.ChatMessages.Where(m => m.EventId == eventId)
                .Select(n=> new ChatMessageDto
                {
                    Id = n.Id,
                    UserId = n.UserId,
                    FirstName = _dataContext.Users.Where(u => u.Id == n.UserId).Select(f => f.FirstName).FirstOrDefault(),
                    LastName = _dataContext.Users.Where(u => u.Id == n.UserId).Select(f => f.LastName).FirstOrDefault(),
                    EventId = n.EventId,
                    Message = n.Message,
                    DateTime = n.DateTime
                }).ToListAsync();
            return result;
        }

        public async Task<List<ChatMessage>> DeleteAllFromEvent(int eventId)
        {
            var messages = await _dataContext.ChatMessages.Where(x => x.EventId == eventId).ToListAsync();
            foreach (var message in messages)
            {
                _dataContext.ChatMessages.Remove(message);
            }
            await _dataContext.SaveChangesAsync();
            return messages;
        }
    }
}
