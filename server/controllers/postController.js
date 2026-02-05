// using Microsoft.AspNetCore.Mvc;
// using System.Text.Json;

// [ApiController]
// [Route("api/posts")]
// public class PostsController : ControllerBase
// {
//     private readonly ICurrentUser _currentUser;
//     private readonly IPostRepository _posts;
//     private readonly IUserRepository _users;
//     private readonly IImageUploader _uploader;

//     public PostsController(
//         ICurrentUser currentUser,
//         IPostRepository posts,
//         IUserRepository users,
//         IImageUploader uploader)
//     {
//         _currentUser = currentUser;
//         _posts = posts;
//         _users = users;
//         _uploader = uploader;
//     }

//     // =========================
//     // Add Post (multiple images)
//     // Node: req.files + imagekit upload + Post.create
//     // =========================
//     [HttpPost("add")]
//     [RequestSizeLimit(100_000_000)]
//     public async Task<IActionResult> AddPost(
//         [FromForm] string? content,
//         [FromForm] string post_type,
//         [FromForm] List<IFormFile>? images)
//     {
//         try
//         {
//             var userId = _currentUser.UserId;

//             var imageUrls = new List<string>();

//             if (images != null && images.Count > 0)
//             {
//                 // Node: Promise.all(images.map(async ... upload ...))
//                 var uploadTasks = images.Select(async img =>
//                 {
//                     // 这里等价 imagekit.upload + imagekit.url transform
//                     // 你可以在 uploader 里实现 imagekit folder="posts" + webp + width=1280 + quality=auto
//                     return await _uploader.UploadAndGetUrlAsync(img, folder: "posts");
//                 });

//                 imageUrls = (await Task.WhenAll(uploadTasks)).ToList();
//             }

//             var post = new PostEntity
//             {
//                 UserId = userId,
//                 Content = content ?? "",
//                 ImageUrls = imageUrls,
//                 PostType = post_type
//             };

//             await _posts.CreateAsync(post);

//             return Ok(new { success = true, message = "Post created successfully" });
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine(ex);
//             return Ok(new { success = false, message = ex.Message });
//         }
//     }

//     // =========================
//     // Get Feed Posts
//     // Node: userIds = [me, ...connections, ...following]
//     // Post.find({user: {$in: userIds}}).populate('user').sort({createdAt:-1})
//     // =========================
//     [HttpGet("feed")]
//     public async Task<IActionResult> GetFeedPosts()
//     {
//         try
//         {
//             var userId = _currentUser.UserId;

//             var user = await _users.FindByIdAsync(userId);
//             if (user == null)
//                 return Ok(new { success = false, message = "User not found" });

//             var userIds = new HashSet<string> { userId };

//             // Node: ...user.connections, ...user.following
//             if (user.Connections != null)
//                 foreach (var id in user.Connections) userIds.Add(id);

//             if (user.Following != null)
//                 foreach (var id in user.Following) userIds.Add(id);

//             // Repo 做：查 posts where UserId in userIds, sort desc, 并“populate user”
//             var posts = await _posts.FindFeedPostsAsync(userIds.ToList());

//             return Ok(new { success = true, posts });
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine(ex);
//             return Ok(new { success = false, message = ex.Message });
//         }
//     }

//     // =========================
//     // Like / Unlike Post
//     // Node: if includes -> remove else push
//     // =========================
//     [HttpPost("like")]
//     public async Task<IActionResult> LikePost([FromBody] LikePostRequest body)
//     {
//         try
//         {
//             var userId = _currentUser.UserId;
//             var postId = body.PostId;

//             var post = await _posts.FindByIdAsync(postId);
//             if (post == null)
//                 return Ok(new { success = false, message = "Post not found" });

//             // Node: post.likes_count.includes(userId)
//             var alreadyLiked = post.LikesCount.Contains(userId);

//             if (alreadyLiked)
//             {
//                 post.LikesCount = post.LikesCount.Where(id => id != userId).ToList();
//                 await _posts.UpdateAsync(post);
//                 return Ok(new { success = true, message = "Post unliked" });
//             }
//             else
//             {
//                 post.LikesCount.Add(userId);
//                 await _posts.UpdateAsync(post);
//                 return Ok(new { success = true, message = "Post liked" });
//             }
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine(ex);
//             return Ok(new { success = false, message = ex.Message });
//         }
//     }
// }
