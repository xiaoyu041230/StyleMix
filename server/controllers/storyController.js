// using Microsoft.AspNetCore.Mvc;

// [ApiController]
// [Route("api/stories")]
// public class StoriesController : ControllerBase
// {
//     private readonly ICurrentUser _currentUser;
//     private readonly IStoryRepository _stories;
//     private readonly IUserRepository _users;
//     private readonly IImageUploader _uploader;
//     private readonly IBackgroundJobScheduler _jobs; // 等价 inngest.send

//     public StoriesController(
//         ICurrentUser currentUser,
//         IStoryRepository stories,
//         IUserRepository users,
//         IImageUploader uploader,
//         IBackgroundJobScheduler jobs)
//     {
//         _currentUser = currentUser;
//         _stories = stories;
//         _users = users;
//         _uploader = uploader;
//         _jobs = jobs;
//     }

//     // =========================
//     // Add User Story
//     // Node: req.body + req.file + imagekit.upload + Story.create + inngest.send(delete after 24h)
//     // =========================
//     [HttpPost("add")]
//     [RequestSizeLimit(100_000_000)]
//     public async Task<IActionResult> AddUserStory([FromForm] AddStoryRequest body)
//     {
//         try
//         {
//             var userId = _currentUser.UserId;

//             // Node: const media = req.file
//             var media = body.Media;
//             var mediaUrl = "";

//             // Node: if(media_type === 'image' || 'video') upload
//             if ((body.MediaType == "image" || body.MediaType == "video"))
//             {
//                 if (media == null)
//                     throw new Exception("Please upload an image or video.");

//                 mediaUrl = await _uploader.UploadAndGetUrlAsync(media, folder: "stories");
//             }

//             var story = new StoryEntity
//             {
//                 UserId = userId,
//                 Content = body.Content ?? "",
//                 MediaUrl = mediaUrl,
//                 MediaType = body.MediaType,
//                 BackgroundColor = body.BackgroundColor ?? ""
//             };

//             await _stories.CreateAsync(story);

//             // Node: schedule story deletion after 24 hours (inngest.send)
//             await _jobs.ScheduleStoryDeleteAsync(story.Id, TimeSpan.FromHours(24));

//             return Ok(new { success = true });
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine(ex);
//             return Ok(new { success = false, message = ex.Message });
//         }
//     }

//     // =========================
//     // Get User Stories
//     // Node:
//     // userIds = [me, ...connections, ...following]
//     // Story.find({user: {$in: userIds}}).populate('user').sort({createdAt:-1})
//     // =========================
//     [HttpGet]
//     public async Task<IActionResult> GetStories()
//     {
//         try
//         {
//             var userId = _currentUser.UserId;

//             var user = await _users.FindByIdAsync(userId);
//             if (user == null)
//                 return Ok(new { success = false, message = "User not found" });

//             var userIds = new HashSet<string> { userId };

//             if (user.Connections != null)
//                 foreach (var id in user.Connections) userIds.Add(id);

//             if (user.Following != null)
//                 foreach (var id in user.Following) userIds.Add(id);

//             // Repo 做：userId in userIds, sort desc, 并 populate user
//             var stories = await _stories.FindStoriesForUsersAsync(userIds.ToList());

//             return Ok(new { success = true, stories });
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine(ex);
//             return Ok(new { success = false, message = ex.Message });
//         }
//     }
// }
