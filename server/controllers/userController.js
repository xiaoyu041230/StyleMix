// using Microsoft.AspNetCore.Mvc;
// using System.Text.RegularExpressions;

// [ApiController]
// [Route("api/users")]
// public class UsersController : ControllerBase
// {
//     private readonly ICurrentUser _currentUser;
//     private readonly IUserRepository _users;
//     private readonly IPostRepository _posts;
//     private readonly IConnectionRepository _connections;
//     private readonly IImageUploader _uploader;          // ImageKit wrapper
//     private readonly IClerkClient _clerk;               // Clerk wrapper
//     private readonly IEventBus _events;                 // Inngest wrapper

//     public UsersController(
//         ICurrentUser currentUser,
//         IUserRepository users,
//         IPostRepository posts,
//         IConnectionRepository connections,
//         IImageUploader uploader,
//         IClerkClient clerk,
//         IEventBus events)
//     {
//         _currentUser = currentUser;
//         _users = users;
//         _posts = posts;
//         _connections = connections;
//         _uploader = uploader;
//         _clerk = clerk;
//         _events = events;
//     }

//     // =========================
//     // Get User Data (me)
//     // =========================
//     [HttpGet("me")]
//     public async Task<IActionResult> GetUserData()
//     {
//         try
//         {
//             var userId = _currentUser.UserId;
//             var user = await _users.FindByIdAsync(userId);
//             if (user == null) return Ok(new { success = false, message = "User not found" });

//             return Ok(new { success = true, user });
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine(ex);
//             return Ok(new { success = false, message = ex.Message });
//         }
//     }

//     // =========================
//     // Update User Data
//     // Node: req.body + req.files.profile/cover
//     // =========================
//     [HttpPost("update")]
//     [RequestSizeLimit(100_000_000)]
//     public async Task<IActionResult> UpdateUserData([FromForm] UpdateUserRequest body)
//     {
//         try
//         {
//             var userId = _currentUser.UserId;
//             var tempUser = await _users.FindByIdAsync(userId);
//             if (tempUser == null) return Ok(new { success = false, message = "User not found" });

//             var username = string.IsNullOrWhiteSpace(body.Username) ? tempUser.Username : body.Username;

//             // Node: if username changed and already taken -> revert
//             if (!string.Equals(tempUser.Username, username, StringComparison.OrdinalIgnoreCase))
//             {
//                 var exists = await _users.FindByUsernameAsync(username);
//                 if (exists != null) username = tempUser.Username;
//             }

//             var updated = new UserUpdate
//             {
//                 Username = username,
//                 Bio = body.Bio,
//                 Location = body.Location,
//                 FullName = body.FullName
//             };

//             // profile upload
//             if (body.Profile != null)
//             {
//                 var url = await _uploader.UploadAndGetUrlAsync(body.Profile, folder: "profiles", width: 512);
//                 updated.ProfilePicture = url;

//                 // Node: fetch(url).blob -> clerkClient.users.updateUserProfileImage
//                 await _clerk.UpdateUserProfileImageByUrlAsync(userId, url);
//             }

//             // cover upload
//             if (body.Cover != null)
//             {
//                 var url = await _uploader.UploadAndGetUrlAsync(body.Cover, folder: "covers", width: 1280);
//                 updated.CoverPhoto = url;
//             }

//             var newUser = await _users.UpdateAsync(userId, updated);

//             return Ok(new { success = true, user = newUser, message = "Profile updated successfully" });
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine(ex);
//             return Ok(new { success = false, message = ex.Message });
//         }
//     }

//     // =========================
//     // Discover Users
//     // Node: regex on username/email/full_name/location
//     // =========================
//     [HttpPost("discover")]
//     public async Task<IActionResult> DiscoverUsers([FromBody] DiscoverUsersRequest body)
//     {
//         try
//         {
//             var userId = _currentUser.UserId;
//             var input = body.Input ?? "";

//             // Repo 内部做 case-insensitive regex/contains
//             var all = await _users.SearchAsync(input);

//             var filtered = all.Where(u => u.Id != userId).ToList();
//             return Ok(new { success = true, users = filtered });
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine(ex);
//             return Ok(new { success = false, message = ex.Message });
//         }
//     }

//     // =========================
//     // Follow User
//     // =========================
//     [HttpPost("follow")]
//     public async Task<IActionResult> FollowUser([FromBody] IdRequest body)
//     {
//         try
//         {
//             var userId = _currentUser.UserId;
//             var id = body.Id;

//             var user = await _users.FindByIdAsync(userId);
//             var toUser = await _users.FindByIdAsync(id);

//             if (user == null || toUser == null)
//                 return Ok(new { success = false, message = "User not found" });

//             if (user.Following.Contains(id))
//                 return Ok(new { success = false, message = "You are already following this user" });

//             user.Following.Add(id);
//             toUser.Followers.Add(userId);

//             await _users.ReplaceAsync(user);
//             await _users.ReplaceAsync(toUser);

//             return Ok(new { success = true, message = "Now you are following this user" });
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine(ex);
//             return Ok(new { success = false, message = ex.Message });
//         }
//     }

//     // =========================
//     // Unfollow User
//     // =========================
//     [HttpPost("unfollow")]
//     public async Task<IActionResult> UnfollowUser([FromBody] IdRequest body)
//     {
//         try
//         {
//             var userId = _currentUser.UserId;
//             var id = body.Id;

//             var user = await _users.FindByIdAsync(userId);
//             var toUser = await _users.FindByIdAsync(id);

//             if (user == null || toUser == null)
//                 return Ok(new { success = false, message = "User not found" });

//             user.Following = user.Following.Where(x => x != id).ToList();
//             toUser.Followers = toUser.Followers.Where(x => x != userId).ToList();

//             await _users.ReplaceAsync(user);
//             await _users.ReplaceAsync(toUser);

//             return Ok(new { success = true, message = "You are no longer following this user" });
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine(ex);
//             return Ok(new { success = false, message = ex.Message });
//         }
//     }

//     // =========================
//     // Send Connection Request
//     // Node: limit 20 in last 24h + check existing + create + inngest.send
//     // =========================
//     [HttpPost("connections/request")]
//     public async Task<IActionResult> SendConnectionRequest([FromBody] IdRequest body)
//     {
//         try
//         {
//             var userId = _currentUser.UserId;
//             var id = body.Id;

//             var last24 = DateTime.UtcNow.AddHours(-24);

//             // Node: Connection.find({from_user_id: userId, created_at: {$gt: last24Hours}})
//             var recentCount = await _connections.CountSentRequestsSinceAsync(userId, last24);
//             if (recentCount >= 20)
//                 return Ok(new { success = false, message = "You have sent more than 20 connection requests in the last 24 hours" });

//             // Node: find one with $or
//             var existing = await _connections.FindBetweenUsersAsync(userId, id);

//             if (existing == null)
//             {
//                 var created = await _connections.CreateAsync(new ConnectionEntity
//                 {
//                     FromUserId = userId,
//                     ToUserId = id,
//                     Status = "pending"
//                 });

//                 // Node: inngest.send({ name: 'app/connection-request', data: {connectionId} })
//                 await _events.PublishAsync("app/connection-request", new { connectionId = created.Id });

//                 return Ok(new { success = true, message = "Connection request sent successfully" });
//             }

//             if (existing.Status == "accepted")
//                 return Ok(new { success = false, message = "You are already connected with this user" });

//             return Ok(new { success = false, message = "Connection request pending" });
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine(ex);
//             return Ok(new { success = false, message = ex.Message });
//         }
//     }

//     // =========================
//     // Get User Connections
//     // Node: populate connections followers following + pendingConnections populate from_user_id
//     // =========================
//     [HttpGet("connections")]
//     public async Task<IActionResult> GetUserConnections()
//     {
//         try
//         {
//             var userId = _currentUser.UserId;

//             var user = await _users.FindByIdAsync(userId);
//             if (user == null) return Ok(new { success = false, message = "User not found" });

//             var connections = await _users.FindManyByIdsAsync(user.Connections);
//             var followers = await _users.FindManyByIdsAsync(user.Followers);
//             var following = await _users.FindManyByIdsAsync(user.Following);

//             // Node: Connection.find({to_user_id: userId, status:'pending'}).populate('from_user_id')
//             var pendingFromUsers = await _connections.GetPendingFromUsersAsync(userId);

//             return Ok(new
//             {
//                 success = true,
//                 connections,
//                 followers,
//                 following,
//                 pendingConnections = pendingFromUsers
//             });
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine(ex);
//             return Ok(new { success = false, message = ex.Message });
//         }
//     }

//     // =========================
//     // Accept Connection Request
//     // Node: findOne({from:id, to:me}) + push each other connections + status accepted
//     // =========================
//     [HttpPost("connections/accept")]
//     public async Task<IActionResult> AcceptConnectionRequest([FromBody] IdRequest body)
//     {
//         try
//         {
//             var userId = _currentUser.UserId;
//             var id = body.Id;

//             var connection = await _connections.FindAsync(fromUserId: id, toUserId: userId);
//             if (connection == null)
//                 return Ok(new { success = false, message = "Connection not found" });

//             var user = await _users.FindByIdAsync(userId);
//             var toUser = await _users.FindByIdAsync(id);

//             if (user == null || toUser == null)
//                 return Ok(new { success = false, message = "User not found" });

//             if (!user.Connections.Contains(id)) user.Connections.Add(id);
//             if (!toUser.Connections.Contains(userId)) toUser.Connections.Add(userId);

//             await _users.ReplaceAsync(user);
//             await _users.ReplaceAsync(toUser);

//             connection.Status = "accepted";
//             await _connections.ReplaceAsync(connection);

//             return Ok(new { success = true, message = "Connection accepted successfully" });
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine(ex);
//             return Ok(new { success = false, message = ex.Message });
//         }
//     }

//     // =========================
//     // Get User Profiles
//     // Node: profileId from body + posts populate user
//     // =========================
//     [HttpPost("profile")]
//     public async Task<IActionResult> GetUserProfiles([FromBody] ProfileRequest body)
//     {
//         try
//         {
//             var profileId = body.ProfileId;
//             var profile = await _users.FindByIdAsync(profileId);

//             if (profile == null)
//                 return Ok(new { success = false, message = "Profile not found" });

//             var posts = await _posts.FindByUserIdWithUserAsync(profileId);

//             return Ok(new { success = true, profile, posts });
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine(ex);
//             return Ok(new { success = false, message = ex.Message });
//         }
//     }
// }
