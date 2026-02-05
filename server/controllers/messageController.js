// using Microsoft.AspNetCore.Mvc;
// using System.Text.Json;

// [ApiController]
// [Route("api/messages")]
// public class MessagesController : ControllerBase
// {
//     private readonly IMessageRepository _repo;
//     private readonly IImageUploader _uploader;
//     private readonly ICurrentUser _currentUser;

//     public MessagesController(IMessageRepository repo, IImageUploader uploader, ICurrentUser currentUser)
//     {
//         _repo = repo;
//         _uploader = uploader;
//         _currentUser = currentUser;
//     }

//     // SSE endpoint: GET /api/messages/sse/{userId}
//     [HttpGet("sse/{userId}")]
//     public async Task Sse([FromRoute] string userId)
//     {
//         Console.WriteLine($"New client connected: {userId}");

//         Response.Headers["Content-Type"] = "text/event-stream";
//         Response.Headers["Cache-Control"] = "no-cache";
//         Response.Headers["Connection"] = "keep-alive";
//         Response.Headers["Access-Control-Allow-Origin"] = "*";

//         SseConnections.Connections[userId] = Response;

//         // initial event
//         await Response.WriteAsync("event: log\ndata: Connected to SSE stream\n\n");
//         await Response.Body.FlushAsync();

//         // handle disconnect
//         try
//         {
//             // 保持连接：等到客户端断开（CancellationToken 触发）
//             while (!HttpContext.RequestAborted.IsCancellationRequested)
//             {
//                 await Task.Delay(15000, HttpContext.RequestAborted);
//                 // 可选：心跳包，防止代理断开
//                 await Response.WriteAsync("event: ping\ndata: {}\n\n");
//                 await Response.Body.FlushAsync();
//             }
//         }
//         catch
//         {
//             // ignored
//         }
//         finally
//         {
//             SseConnections.Connections.TryRemove(userId, out _);
//             Console.WriteLine("Client disconnected");
//         }
//     }

//     // Send Message: POST /api/messages/send (multipart/form-data or json)
//     // - text 在 body
//     // - image 在 form file（等价 req.file）
//     [HttpPost("send")]
//     [RequestSizeLimit(50_000_000)]
//     public async Task<IActionResult> SendMessage([FromForm] SendMessageRequest body, [FromForm] IFormFile? image)
//     {
//         try
//         {
//             var userId = _currentUser.UserId;
//             var toUserId = body.ToUserId;
//             var text = body.Text;

//             string? mediaUrl = null;
//             var messageType = image != null ? "image" : "text";

//             if (messageType == "image" && image != null)
//             {
//                 mediaUrl = await _uploader.UploadAndGetUrlAsync(image);
//             }

//             var message = await _repo.CreateAsync(new MessageEntity
//             {
//                 FromUserId = userId,
//                 ToUserId = toUserId,
//                 Text = text,
//                 MessageType = messageType,
//                 MediaUrl = mediaUrl
//             });

//             // 先返回给发送方
//             // （你 Node 里 res.json -> success true）
//             var responsePayload = new { success = true, message };

//             // 再 SSE 推给接收方（populate from_user_id）
//             var messageWithUser = await _repo.FindByIdWithFromUserAsync(message.Id);
//             if (messageWithUser != null && SseConnections.Connections.TryGetValue(toUserId, out var receiverRes))
//             {
//                 var json = JsonSerializer.Serialize(messageWithUser);
//                 await receiverRes.WriteAsync($"data: {json}\n\n");
//                 await receiverRes.Body.FlushAsync();
//             }

//             return Ok(responsePayload);
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine(ex);
//             return Ok(new { success = false, message = ex.Message });
//         }
//     }

//     // Get Chat Messages: POST /api/messages/chat
//     [HttpPost("chat")]
//     public async Task<IActionResult> GetChatMessages([FromBody] GetChatMessagesRequest body)
//     {
//         try
//         {
//             var userId = _currentUser.UserId;
//             var toUserId = body.ToUserId;

//             // Node: sort({created_at: -1}) 你这里字段是 CreatedAt
//             var messages = await _repo.FindChatMessagesAsync(userId, toUserId);

//             // mark seen
//             await _repo.MarkSeenAsync(fromUserId: toUserId, toUserId: userId);

//             return Ok(new { success = true, messages });
//         }
//         catch (Exception ex)
//         {
//             return Ok(new { success = false, message = ex.Message });
//         }
//     }

//     // Get User Recent Messages: GET /api/messages/recent
//     [HttpGet("recent")]
//     public async Task<IActionResult> GetUserRecentMessages()
//     {
//         try
//         {
//             var userId = _currentUser.UserId;
//             var messages = await _repo.FindRecentMessagesToUserAsync(userId);
//             return Ok(new { success = true, messages });
//         }
//         catch (Exception ex)
//         {
//             return Ok(new { success = false, message = ex.Message });
//         }
//     }
// }
