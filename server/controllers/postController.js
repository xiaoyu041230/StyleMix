using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using System.Security.Claims;

// ===== Models =====
public class StoryDoc
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = "";

    [BsonElement("user")]
    public string UserId { get; set; } = "";

    [BsonElement("content")]
    public string? Content { get; set; }

    [BsonElement("media_url")]
    public string? MediaUrl { get; set; }

    [BsonElement("media_type")]
    public string MediaType { get; set; } = "image"; // image / video

    [BsonElement("background_color")]
    public string? BackgroundColor { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class UserDoc
{
    [BsonId]
    public string Id { get; set; } = "";

    [BsonElement("connections")]
    public List<string> Connections { get; set; } = new();

    [BsonElement("following")]
    public List<string> Following { get; set; } = new();
}

// ===== Image Storage Abstraction (ImageKit/S3/...) =====
public record UploadResult(string Url);

public interface IImageStorage
{
    Task<UploadResult> UploadAsync(IFormFile file, string folder, CancellationToken ct);
}

// Demo placeholder
public class DummyImageStorage : IImageStorage
{
    public Task<UploadResult> UploadAsync(IFormFile file, string folder, CancellationToken ct)
        => Task.FromResult(new UploadResult($"https://example.com/{folder}/{Guid.NewGuid()}"));
}

// ===== Background Scheduler (replace Inngest) =====
// 你可以实现成：Hangfire / Quartz.NET / Azure Functions / Inngest 替代方案
public interface IBackgroundScheduler
{
    Task ScheduleStoryDeletionAsync(string storyId, TimeSpan delay, CancellationToken ct);
}

// Demo placeholder scheduler (does not really persist jobs!)
public class DummyBackgroundScheduler : IBackgroundScheduler
{
    public Task ScheduleStoryDeletionAsync(string storyId, TimeSpan delay, CancellationToken ct)
    {
        // Real impl: enqueue a delayed job to delete storyId after delay
        return Task.CompletedTask;
    }
}

// ===== Repositories =====
public class StoryRepository
{
    private readonly IMongoCollection<StoryDoc> _stories;

    public StoryRepository(IMongoDatabase db)
    {
        _stories = db.GetCollection<StoryDoc>("stories");

        // 推荐索引：按 user + createdAt
        _stories.Indexes.CreateOne(new CreateIndexModel<StoryDoc>(
            Builders<StoryDoc>.IndexKeys
                .Ascending(s => s.UserId)
                .Descending(s => s.CreatedAt)
        ));
    }

    public Task InsertAsync(StoryDoc story) => _stories.InsertOneAsync(story);

    public async Task<List<StoryDoc>> FindFeedAsync(IEnumerable<string> userIds)
        => await _stories.Find(s => userIds.Contains(s.UserId))
                         .SortByDescending(s => s.CreatedAt)
                         .ToListAsync();

    public Task DeleteByIdAsync(string storyId)
        => _stories.DeleteOneAsync(s => s.Id == storyId);
}

public class UserRepository
{
    private readonly IMongoCollection<UserDoc> _users;
    public UserRepository(IMongoDatabase db) => _users = db.GetCollection<UserDoc>("users");

    public async Task<UserDoc?> FindByIdAsync(string id)
        => await _users.Find(u => u.Id == id).FirstOrDefaultAsync();
}

// ===== DTOs =====
public class CreateStoryRequest
{
    [FromForm(Name = "content")]
    public string? Content { get; set; }

    [FromForm(Name = "media_type")]
    public string MediaType { get; set; } = "image"; // image / video

    [FromForm(Name = "background_color")]
    public string? BackgroundColor { get; set; }

    // form-data name="media"
    [FromForm(Name = "media")]
    public IFormFile? Media { get; set; }
}

// ===== Controller =====
[ApiController]
[Route("api/stories")]
public class StoriesController : ControllerBase
{
    private readonly StoryRepository _storyRepo;
    private readonly UserRepository _userRepo;
    private readonly IImageStorage _imageStorage;
    private readonly IBackgroundScheduler _scheduler;

    public StoriesController(
        StoryRepository storyRepo,
        UserRepository userRepo,
        IImageStorage imageStorage,
        IBackgroundScheduler scheduler)
    {
        _storyRepo = storyRepo;
        _userRepo = userRepo;
        _imageStorage = imageStorage;
        _scheduler = scheduler;
    }

    // POST /api/stories
    // multipart/form-data: content, media_type, background_color, media(file)
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> AddUserStory([FromForm] CreateStoryRequest req, CancellationToken ct)
    {
        var userId = GetUserIdFromClaims();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "Unauthorized" });

        string? mediaUrl = null;

        // upload media to ImageKit/storage
        if ((req.MediaType == "image" || req.MediaType == "video") && req.Media is not null)
        {
            var upload = await _imageStorage.UploadAsync(req.Media, folder: "stories", ct);
            mediaUrl = upload.Url;
        }

        var story = new StoryDoc
        {
            Id = ObjectId.GenerateNewId().ToString(),
            UserId = userId,
            Content = req.Content,
            MediaType = req.MediaType,
            MediaUrl = mediaUrl,
            BackgroundColor = req.BackgroundColor,
            CreatedAt = DateTime.UtcNow
        };

        await _storyRepo.InsertAsync(story);

        // schedule deletion after 24 hours (like inngest)
        await _scheduler.ScheduleStoryDeletionAsync(story.Id, TimeSpan.FromHours(24), ct);

        return Ok(new { success = true });
    }

    // GET /api/stories/feed
    [HttpGet("feed")]
    public async Task<IActionResult> GetStories()
    {
        var userId = GetUserIdFromClaims();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "Unauthorized" });

        var user = await _userRepo.FindByIdAsync(userId);
        if (user is null)
            return NotFound(new { success = false, message = "User not found" });

        // self + connections + following
        var userIds = new HashSet<string> { userId };
        foreach (var id in user.Connections) userIds.Add(id);
        foreach (var id in user.Following) userIds.Add(id);

        var stories = await _storyRepo.FindFeedAsync(userIds);

        // 你 Node 里 populate('user')，这里先不做 populate（Mongo Driver 没有内置）
        // 真实做法：二次查询 users 再组装 DTO
        return Ok(new { success = true, stories });
    }

    private string? GetUserIdFromClaims()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? User.FindFirstValue("userId");
    }
}
