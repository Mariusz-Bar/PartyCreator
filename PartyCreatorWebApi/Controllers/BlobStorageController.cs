﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PartyCreatorWebApi.Dtos;
using PartyCreatorWebApi.Entities;
using PartyCreatorWebApi.Repositories;
using PartyCreatorWebApi.Repositories.Contracts;

namespace PartyCreatorWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlobStorageController : ControllerBase
    {
        private readonly IBlobStorageRepository _blobStorageRepository;
        private readonly IUsersRepository _usersRepository;
        private readonly IEventRepository _eventRepository;

        public BlobStorageController(IBlobStorageRepository blobStorageRepository, IUsersRepository usersRepository, IEventRepository eventRepository)
        {
            _blobStorageRepository = blobStorageRepository;
            _usersRepository = usersRepository;
            _eventRepository = eventRepository;
        }

        [HttpGet("GetBlobFile")]
        public async Task<IActionResult> GetBlobFile(string url)
        {
            var result = await _blobStorageRepository.GetBlobFile(url);
            return File(result.Content, result.ContentType);
        }

        [HttpPost("UploadBlobFile"), Authorize]
        [RequestSizeLimit(100_000_000)] // 100MB
        public async Task<ActionResult<Gallery>> UploadBlobFile([FromForm] BlobContentModel model)
        {
            var userId = Int32.Parse(_usersRepository.GetUserIdFromContext());
            var isEvent = await _eventRepository.GetEventDetails(model.EventId);
            if (isEvent == null)
            {
                return BadRequest("Nie ma takiego wydarzenia");
            }

            var guestlist = await _eventRepository.GetGuestsFromEvent(model.EventId);
            var isGuest = guestlist.Find(x => x.UserId == userId);
            if (isGuest == null && userId != isEvent.CreatorId)
            {
                return BadRequest("Nie jesteś na liście gości");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _blobStorageRepository.UploadBlobFile(model.File, model.EventId, model.UserId);
                return Ok(result);
            }
            catch (Exception ex)
            {

                return StatusCode(500, ex.Message);
            }

            
        }

        [HttpDelete("DeleteBlobFile/{id:int}"), Authorize]
        public async Task<IActionResult> DeleteBlobFile(int id)
        {
            try
            {
                var image = await _blobStorageRepository.GetImageById(id);

                // Sprawdź, czy obraz istnieje
                if (image == null)
                {
                    return NotFound("Nie znaleziono obrazu");
                }

                // Pobierz identyfikator użytkownika z kontekstu
                var userId = Int32.Parse(_usersRepository.GetUserIdFromContext());

                // Sprawdź, czy użytkownik jest właścicielem obrazu lub organizatorem wydarzenia
                if (userId != image.UserId && userId != image.Event.CreatorId)
                {
                    return Forbid("Nie masz uprawnień do usunięcia tego obrazu");
                }

                await _blobStorageRepository.DeleteBlobFile(id);
                return Ok();
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


        [HttpGet("GetImagesFromEvent/{id:int}"), Authorize]
        public async Task<ActionResult<Gallery>> GetImagesFromEvent(int id)
        {
            var userId = Int32.Parse(_usersRepository.GetUserIdFromContext());
            var isEvent = await _eventRepository.GetEventDetails(id);
            if (isEvent == null)
            {
                return BadRequest("Nie ma takiego wydarzenia");
            }
            var guestList = await _eventRepository.GetGuestsFromEvent(id);
            var isGuest = guestList.Find(x => x.UserId == userId);
            if (isGuest == null && userId != isEvent.CreatorId)
            {
                return BadRequest("Nie jesteś na liście gości");
            }
            try
            {
                var result = await _blobStorageRepository.GetImageByEventId(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
            
        }

    }
}
