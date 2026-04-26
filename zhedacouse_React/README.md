# 项目

## **1、虚拟列表+懒加载**

### （1）简单介绍

在项目的全部房源页面中，会向用户展示目的城市的**海量房源**。如果一次性将这些房源全部渲染出来，可能会导致加载时间过长，房源dom元素过多导致页面卡顿等**性能问题**，所以考虑使用虚拟列表+懒加载实现。

一开始是单纯使用的懒加载，当用户滑动到**靠近列表底部**时，就重新向后端**请求新的数据**并**添加到列表**中再**重新渲染到页面**上。这样由于开始页面中的房源dom很少，所以能够大幅减少首屏加载时间。但如果用户一直向下滑，加到页面中的房源**dom会越来越多**，最后还是会降低性能，造成页面卡顿等等。

所以后来考虑使用虚拟列表+懒加载的方式，同样是接近列表底部请求，区别在于虚拟列表只渲染数据列表中**当前页面以及附近两页**的房源dom，不论列表中有多少数据，都只渲染**有限的一部分**，所以可以避免页面卡顿等性能问题。多渲染两页dom，可避免滑动过快还未渲染，出现白屏。

### （2）具体如何实现的虚拟列表

1、设置**开始索引**和**结束索引**，代表列表**开始渲染的位置**和**结束渲染的位置**。设置**预留两屏的item数**（容器可视高度除以item高度乘五（一行有五列）），然后通过**已划过距离scrollTop**除以单个房源item高度再乘五就是已划过的item数，再减去预留数，得到开始索引，默认是0（通过Math.max(0,上边的操作)）。通过已划过距离scrollTop加上可视区域高度offsetHeigh以单个房源item高度再乘五，再加上预留数，得到结束索引。

2、通过**slice截取到数据列表**中的从开始索引到结束从索引的部分，在页面中进行渲染。

3、还需要计算通过开始和结束索引计算**顶部块**和**底部块**（如果结束索引比列表还长就是0）的高度，用来**撑开进度条**

4、如果划到了靠近列表底部（总高度scrollHeight-已划过距离scrollTop-容器可视高度<距离阈值），就触发请求函数，重新向后端请求数据并加到列表后边

### （3）为什么使用节流函数，起到什么作用

滚轮滚动可能会触发多次滚动事件，造成不必要的性能消耗，快速滚动也可能造成白屏问题。所以考虑采用节流函数来减少滚动触发的次数。

一开始采用的是防抖函数，防抖函数的作用就是短时间内触发多次事件，只执行最后一次，可以有效减少滚动触发的次数。但是在实际操作时出现问题，如果快速滑动滑轮，会导致房源item未渲染出来，页面出现白屏。分析后发现是由于滚动时页面会向下划，但由于速度过快，未达到防抖函数要求的时间，所以防抖函数并未执行，页面未重新渲染，导致白屏问题。

随后改用节流函数，节流函数的作用是触发一次在短时间内就不再次触发，从而既有效减少了滚动触发的次数，由于每次都会成功执行节流函数，也实现了及时渲染，从而顺利解决了白屏问题。

### **（4）如何优化快速滚动时的白屏问题？**

**考察点**：性能优化经验 **解答**：

1. **节流渲染**：使用 **节流函数** 控制滚动事件触发频率。

2. **占位符**：图片未加载时用**骨架屏**填充，提高用户体验。

  骨架屏方案，通过isPending判断是否处于请求中，返回为pending就渲染骨架屏，请求结束就渲染请求到的图片

1. **加载符**：如果滑倒列表底部请求新数据还未返回，同样是通过pending来判断，渲染`加载中...`的盒子，请求结束就渲染新item

### （5）使用**Intersection Observer**

**Intersection Observer** 方案优势：

- 原生API，简化可视区域判断逻辑。

- 自动检测，减少手动计算误差。

**局限性**：

- 兼容性问题（部分旧浏览器不支持）。

- 大量元素监听时性能开销较大（需配合虚拟列表减少节点数量）。

**结论**：结合两者，用虚拟列表控制DOM数量，用Intersection Observer实现了图片懒加载细节。

### **（6） 如何处理动态高度的元素（如高度不固定的图片或文本）？**

**考察点**：复杂场景的解决方案 **解答**： 动态高度需实时测量并缓存，常用方案：

1. **预估高度+惰性测量**：初始用预估高度渲染，元素进入可视区域后测量实际高度，更新缓存并调整布局。

2. **位置缓存表**：维护一个 `positions` 数组记录每个元素的真实高度和偏移量，重新计算后续元素的位置。

3. **ResizeObserver API**：监听元素尺寸变化，动态更新缓存。

**优化**：对已测量的元素跳过重复计算，使用二分查找快速定位滚动位置。

### **（7）如果列表项包含复杂组件（如视频），需要注意什么？**

**考察点**：实际应用细节 **解答**：

1. **组件销毁**：离开可视区域时销毁视频播放器，释放内存。

2. **状态保存**：使用 `keep-alive` 或缓存组件状态（如播放进度）。

3. **懒加载分级**：先加载轻量内容（如缩略图），用户交互后再加载完整资源。

4. **性能监控**：确保单个复杂组件不影响整体滚动性能。

### **（8） 如何测试虚拟列表+懒加载的准确性和性能？**

**考察点**：质量保障意识 **解答**： **准确性测试**：

- 快照比对：确保不同滚动位置渲染内容正确。

- 交叉验证：手动滚动到特定位置，检查渲染数据与预期一致。

**性能测试**：

- **Chrome DevTools**：通过Performance面板分析FPS、布局重绘（Layout Thrashing）。

- **内存占用**：Memory面板检查是否存在内存泄漏（如未销毁的DOM节点）。

- **大数据压测**：渲染10万条数据，监控滚动流畅度（FPS≥50）。

**自动化工具**：

- Puppeteer模拟滚动并截图对比。

- Lighthouse生成性能报告。

## 2、websocket通信

### （1）简单介绍

在宅宿甄选项目的详情页中，用户可以向AI助手提出自己对于房源的条件和需求，AI助手会根据用户的需求在自己的知识库中查找，返回合适的选择，这样就实现了AI助手推荐的功能。实现这个功能主要使用到了 WebSocket 进行前后端的双向即时通信。

### （2）websocket连接建立的大致过程（理论）

客户端会先通过一次普通的 HTTP 请求告知服务器“我想把这条连接升级到 WebSocket”，并附带一个用于安全校验的随机值；服务器收到后进行验证并以特殊回应表示同意升级，此时原本的 TCP 连接就从 HTTP 切换到 WebSocket，随后双方即可在同一条持久化连接上进行双向实时通信。

### （3）项目中websocket的大致流程（项目）

#### 1、建立连接

当打开页面后，就会开启对话，建立一个新的websocket连接，过程是：

- 关闭已有连接并清空心跳机制，防止资源泄漏和重复连接。如果是新消息没有会话id就生成一个

- new websocket初始化一个新的websocket连接（通过ref保存 ref.current来注册事件监听），其中地址是参数化拼接的，包括基础URL，用户id、会话id、角色id、模型id等参数，保证每个连接的唯一性和安全性。

- 注册open message close error事件监听器，为后续消息收发和异常处理做准备

- 当打开新对话或切换到历史对话都会触发**open事件**，如果是新对话，通过send向后端发送一条“初始化对话”的消息，后端会在数据库中为该用户新建一条会话记录（ChatItem），并返回一个**对话已创建**的消息。并建立新的心跳机制

  (初始化消息如果问起详情)包括

  - type: "chat"：表示这是一次聊天消息（但content为空，属于初始化）。

  - content: ""：内容为空，说明不是用户主动输入，而是系统初始化。

  - 其它如 chatId、roleId、modelId等，都是会话的元信息。

  - imageUrls: []：没有图片。

  - useNetwork、useLocalRag：是否联网、是否用本地知识库。

#### 2、如果问起上边这些id如何获取

基础URL通过getURL函数获取，window.location.hostname得到网站的url

用户id通过getSession函数获取，会从localStorage找有没有session，如果没有就通过定义好的**randString**方法生成一个（问起的话，生成方法就是从0-9和a-z中随机通过for循环结合Math.random随机取值获得一个session）

会话id是如果是历史会话则已经存在，直接拼接；如果是新对话则不存在，通过uuid库的方法重新生成一个

角色id和模型id都是确定好的，因为在这两个页面中的角色和模型都是固定的。

#### 3、websocket接收消息

**消息的接收通过监听message事件进行处理**，返回的**event**点**data**里存在消息type用来区分消息类型，根据type判断不同的返回的消息类型并进行不同的处理。（心跳检测、用户输入、AI回复分阶段等）。分阶段推送消息分片，实现ai回复的流式输出。

- 如果类型是心跳检测就直接跳过消息处理，

- 如果类型是用户输入代表后端将用户输入发送回来进行回显，前端存储消息数组是**chatData**，给chatData追加一个新消息对象，包括id 类型prompt 和用户输入内容content，随后渲染到页面上。不过回显后来不再使用了，改为用户点击发送后直接从前端将新的消息对象追加到chatData数组中。这是因为回显操作虽能保证前后端数据一致，但当前后端通信出现问题时，前端用户收不到后端返回的回显，连自己输入的内容都无法出现再页面上。改为从前端直接追加，当出现网络问题时至少能显示出用户的输入，体验好一些。

- 如果类型是对话已创建，就通过get获取由新对话的历史会话列表，链接由用户id和角色id决定。这里未进行更改，因为历史会话列表希望追求前后端一致性，所以等接收到后端返回的对话已创建的消息后再对chatData进行更新并渲染。

  剩下的是ai回复的输出部分，与ai输出有关的有**start**、**chat**、**end**三种类型。前端存储消息数组**chatData**，当类型为**start**时，代表AI 开始输出，往chatData中push一个**新的消息对象**准备**接收输出内容**，对象包括新消息的**id**（后端传过来的）、**内容**（空字符串）和消息**类型**（reply），并禁用发送按钮和重新生成按钮，启用停止生成按钮。当类型为**chat**时，代表AI正在**输出内容的分片**，将这个内容分片**追加**到当前消息对象（通过id确定）的内容里并重新渲染到页面上。当类型为end时，代表这个消息的结束，启用发送按钮和重新生成按钮，禁用停止生成按钮。

#### 4、websocket发送消息

发送消息会触发sendMessage函数，先判断ai是否正在回答或发送内容是否为空（prompt.value.trim.length）。如果没问题，一是将用户输入的内容作为新的消息对象push到chatData中，包括id（前端randString生成的），类型prompt，用户输入内容content。然后通过send事件将消息对象发送给后端，里边包含（用户输入的内容，消息类型，会话id模型id和角色id，上传图片的URL，是否使用联网搜索和数据库等）。

#### 5、关闭连接

当退出登录，关闭页面，切换对话等操作都会关闭连接，通过触发close事件实现。并将心跳检测清空。在ai正在生成回复的时候，如果用户**点击停止按钮**，或者是**切换到其他会话**，都会**停止**当前进行的流式输出。具体来讲，项目通过状态变量来控制**是否正在渲染**，在**message**事件中对其进行判断，如果为false就直接结束事件，**不再执行**接下来的渲染过程。当点击停止按钮或切换其他对话时，就会调用**停止函数**，将状态变量设置为false，并向后端通过**webSocket.send**发送**停止生成**的信号，信号类型为stop并包含当前消息id，然后通过**webSocket.close**关闭通信。后端接收到停止生成信息后，立即发送给大模型服务器，让大模型停止继续生成。从而实现了流式输出的停止。

#### 6、错误重连

当连接发生错误时会触发error事件，前端会尝试进行重连。具体的过程是，先再外部确定好最大重连次数5次，重连间隔时间3秒；并定义连接次数。每次创建websocket连接时，在open事件触发时都会重置连接次数。如果发生错误时，达到重连间隔时间就会重新调用连接函数，并将重连次数+1。到最后如果重连次数超过最大重连连接次数就不再继续尝试，触发close事件关闭websocket连接，并给用户弹出错误信息。

```Plain Text

let socket = null;

let reconnectTimer = null;

let reconnectAttempts = 0;

const MAX_RECONNECT_ATTEMPTS = 5;

const RECONNECT_INTERVAL = 3000; // 3秒



function connect() {

  // ...参数拼接略

  socket = new WebSocket(wsUrl);



  socket.addEventListener("open", () => {

    console.log("WebSocket连接已打开");

    reconnectAttempts = 0; // 重置重连次数

    // 启动心跳、注册消息监听等

  });



  socket.addEventListener("message", onMessage);



  socket.addEventListener("close", () => {

    // 这里一般不自动重连，除非你想支持“意外断开”场景

    // 可以根据业务需求判断是否需要重连

  });



  socket.addEventListener("error", (error) => {

    console.error("WebSocket连接错误:", error);

    // 避免多次重连

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {

      reconnectAttempts++;

      reconnectTimer = setTimeout(() => {

        console.log(`WebSocket重连第${reconnectAttempts}次...`);

        connect();

      }, RECONNECT_INTERVAL);

    } else {

      console.error("WebSocket重连失败，已达最大次数");

      // 可以提示用户“网络异常，请刷新页面”

    }

  });

}

```

#### 7、心跳检测

在项目中，每30秒通过send发送一条{ type: "heartbeat", content: "ping" }的消息到后端，并记录一个“等待回应”的状态。后端接收到后，也会返回一个心跳检测的消息{ type: "heartbeat", content: "pong" }代表心跳检测，前端清除“等待回应”状态。如果下次发送心跳包时，上一次的回应还没收到，即仍然处于等待回应状态，就认为连接异常，可以主动关闭WebSocket并触发重连。

在连接成功时启动心跳检测，定时发送心跳消息。在连接断开或发生错误时停止心跳检测。

```Plain Text

let socket = null;

let heartbeatInterval = null;   // 心跳定时器

let waitingHeartbeat = false;   // 是否在等待心跳回应

const HEARTBEAT_INTERVAL = 30000; // 30秒发送一次心跳



function connect() {

  socket = new WebSocket("ws://yourserver/ws");



  socket.addEventListener("open", () => {

    console.log("WebSocket已连接");

    startHeartbeat();

  });



  socket.addEventListener("message", (event) => {

    const data = JSON.parse(event.data);

    if (data.type === "heartbeat") {

      // 收到心跳回应

      waitingHeartbeat = false;

      // 你可以在这里做一些连接状态的UI提示

    } else {

      // 处理其他类型消息

    }

  });



  socket.addEventListener("close", () => {

    stopHeartbeat();

  });



  socket.addEventListener("error", (error) => {

    stopHeartbeat();

  });

}



function startHeartbeat() {

  stopHeartbeat(); // 防止重复定时

  heartbeatInterval = setInterval(() => {

    if (waitingHeartbeat) {

      // 上一次心跳还没回应，说明连接异常

      socket.close(); // 触发close事件，自动重连

      return;

    }

    // 发送心跳包

    waitingHeartbeat = true;

    socket.send(JSON.stringify({ type: "heartbeat", content: "ping" }));

  }, HEARTBEAT_INTERVAL);

}



function stopHeartbeat() {

  clearInterval(heartbeatInterval);

  waitingHeartbeat = false;

}



// 启动连接

connect();

```

**为何选择前端发ping后端发pong？**

1、**客户端主导监测**：只要后端不返回 `pong`，前端就能立即做出重连判断，能够恢复连接。主导权掌握在自己手里。

2、项目规范，在之前的项目中有使用到心跳检测都是前端发ping后端发pong

**如何通过后端发ping而前端发pong**

**流程示例**

1. **后端** 每隔固定时间（比如 30 秒）主动向所有已连接的 WebSocket 客户端广播一条心跳消息：

  ```Plain Text

{ "type": "heartbeat", "content": "ping" }

  ```

1. **前端** 一旦收到这条 `{ type: "heartbeat", content: "ping" }`，马上返回：

  ```Plain Text

{ "type: "heartbeat", "content": "pong" }

  ```

1. **后端** 在发送 `ping` 后，给自己打个“已发送心跳，还在等待 pong”标记；如果在下次期望收到 pong 的时限（比如 5 秒内）没收到前端回来的 `pong`，就默认客户端掉线／断网，直接把 WebSocket 关掉或标记为“失效”，并决定要不要在后端层面进行重连或通知上游逻辑。

### （4）自定义的消息格式是怎样的?

发送消息格式

```Plain Text

socket.current.send(

    JSON.stringify({

      type: "chat", // 消息类型

      content: content, // 消息内容

      chatId: curChatInfo.value.chatId, // 会话id

      roleId: roleId.value, // 使用的角色id

      modelId: modelId.value, // 使用的模型id

      imageUrls: imageUrls, // 图片URL数组

      useNetwork: isUseNetwork.value, // 是否使用联网搜索

      useLocalRag: isUseLocalRag.value, // 是否使用本地知识库

    })

  );

```

返回消息格式

```Plain Text

type // 消息类型

text // 消息内容

chatId // 消息id

roleId // 使用的角色id

modelId // 使用的模型id

```

### （5）轮询、长轮询和websocket的对比

#### 1. 基本原理

**1.1 轮询（Polling）**

- **原理**：客户端以固定的时间间隔（如每隔 1 秒或 5 秒）向服务器发送一次 HTTP 请求，询问服务器是否有新数据。如果服务器有新数据，则在响应中返回；否则返回空或状态标示客户端继续下一次轮询。

- **连接方式**：一个独立的短链接（HTTP 请求-响应）完成一次查询后即断开，下次查询时重新建立连接。

**1.2 长轮询（Long Polling）**

- **原理**：客户端向服务器发起一次 HTTP 请求，如果服务器端暂时没有新数据则保持此请求（不立即返回），直到有新数据可用时才返回响应；客户端收到数据后立即发起下一次长轮询请求，如此循环。相当于“服务端先等数据准备好再回复，客户端收到后马上重连”。

- **连接方式**：与轮询类似，依旧是一次请求对应一次响应，但服务器可以“延迟”响应以减少空回应。每次响应后，客户端重新开启新的连接。

**1.3 WebSocket**

- **原理**：基于 HTTP/1.1 的一次“握手”升级（Upgrade）请求，将连接从 HTTP 协议切换到 WebSocket 协议；握手完成后，客户端与服务器之间建立起一个**持久双向**的 TCP 连接，双方可随时互发消息，无需再次建立 HTTP 请求。

- **连接方式**：一次握手后创建长连接，后续在同一连接上双向通信。

#### 2. 优缺点对比

**3.1 连接建立与开销**

- **轮询**：每次轮询都是一个完整的 HTTP 请求/响应周期（包括 TCP 建立三次握手、TLS 握手（若使用 HTTPS）、请求报头 + 响应报头等）。如果轮询间隔设置得很短（如 1 秒），会产生非常大的网络开销和服务器压力。

- **长轮询**：客户端发出一次请求后，如果服务器暂时没有可用数据，便“挂起”此请求并保持连接一段时间（通常服务端会设置超时时间，如 30 秒）。当出现新数据时立即响应，否则在超时后返回“没有数据”，然后客户端再发起新请求。这样能大大减少“空回应”的次数，但在数据空闲期仍会维持一定数量的长连接。

- **WebSocket**：通过一次 HTTP 握手，将连接升级为 WebSocket。之后无需多次握手，客户端与服务器之间在同一 TCP 连接中互发数据。省去了每次都建立连接和关闭连接的开销，只需传输很少的 WebSocket 报头，即可实现低开销的双向通信。

**3.2 实时性与延迟**

- **轮询**：实时性最差。假设轮询间隔为 5 秒，服务器在第 1 秒左右产生一条新消息，客户端要等到第 5 秒才能下一次请求拿到数据。平均延迟约为 `轮询间隔 / 2`。

- **长轮询**：实时性较好。服务器一有新消息就立即返回响应，客户端马上收到并处理，响应时间仅受网络往返的影响。缺点是客户端收到一次响应后，要重新发起新的 HTTP 请求才能继续“保持等待”状态，这中间会有极短暂的延迟（毫秒级）。

- **WebSocket**：实时性最好。客户端与服务器在同一连接里，任一方随时都能“推送”消息，网络往返延迟几乎与纯 TCP 消息传输相同，没有额外的重连耗时。

**3.3 服务器资源和并发**

- **轮询**：短连接模式，每次请求都创建、处理、关闭连接。若并发用户数高、轮询间隔短，将导致服务器频繁创建/销毁连接，造成 CPU 与内存压力，网络带宽浪费也很严重。

- **长轮询**：每个活跃客户端至少会有一个“挂起”的 HTTP 连接，即使在长时间没有新消息期间也占用一个 TCP 连接。相比轮询，减少了空回应次数，但当用户量极大时也可能出现大量长连接，需要服务器以“异步非阻塞”或“事件驱动”的方式进行优化，防止线程/进程数爆炸。

- **WebSocket**：与长轮询类似，保持着持久 TCP 连接。不同的是，不仅能接收数据，也能主动向客户端推送。服务器需要维护这些持久连接的状态（如每个连接对应的会话、心跳检测等），如果使用不当（如线程模型不合理），并发量大时同样会出现瓶颈。但由于协议层面更加轻量（没有 HTTP 报头的开销），整体吞吐通常更高，更适合持续双向通信。

### （6）webSocket和sse对比

#### 1. 通信方向

- **WebSocket**：双向（full‑duplex），客户端和服务端可以随时相互推送消息，无需重新建立连接。

- **SSE（Server‑Sent Events）**：单向，只能从服务端向客户端推送数据，客户端若要发送消息，必须另起 HTTP 请求（如 POST）。

#### 2. 延迟与效率

- **WebSocket**：一次握手后保持 TCP 连接，消息帧头开销小，适合高频、低延迟交互。

- **SSE**：基于 HTTP 长连接，消息以文本流方式输送，每条消息带有一定格式开销，且在 HTTP/2 下可能受“队头阻塞”影响。

#### 3. 实现复杂度

- **SSE**：客户端原生支持 `EventSource`，自动重连简单易用；服务端实现也较轻量。

- **WebSocket**：需处理握手、心跳、断线重连等逻辑，实现复杂度略高。

#### 4、为什么在项目中前端和后端之间使用webSocket，而后端和大模型端使用sse，这样的好处是什么

1. **端到端低延迟的流式体验**

- 后端直接对接大模型的 `text/event-stream`，一有新 token 就马上拿到并透传，不用等完整响应。

- WebSocket 长连接在前端随时可推，实现“用户输入 → 模型输出”几乎无缝的流水线感。

1. **职责分离，协议各司其职**

- **SSE**（`text/event-stream`）天然适合后端与模型 API 这种“服务端→服务端”单向、高并发的流式推送，简单可靠。

- **WebSocket** 则更擅长“服务端←→客户端”双向交互，不仅可以推送模型消息，也可实时接收前端的控制指令（比如取消、修改参数、心跳等）。

1. **更灵活的错误处理与重连策略**

- 后端与模型 API 之间发生错误时，可以在这一层做重试等错误处理，和前端的 WebSocket 断线重连逻辑互不干扰。

- 前端也只需关心 WebSocket 的生命周期和重连策略，屏蔽了模型 API 端的细节。

1. **安全与认证边界清晰**

- 后端统一管理对大模型 API 的访问密钥、限额、审计日志等，避免将敏感凭证泄露到前端。

- 前端只需与后端建立 WebSocke，简化客户端安全设计。

1. **可观测性与监控**

- 在后端切面可以对 SSE 流量（如每秒 token 数、平均延迟）做精细监控。

- WebSocket 连接数、带宽、RTT 也可独立监控，从而快速定位是模型 API 侧瓶颈还是客户端网络问题。

1. **演进路径灵活**

- 日后若要支持其它流式源（自研模型、不同云厂商），只需要在后端适配新的 SSE 接口，前端无感知。

### （7）历史会话

#### （1）如何获取的历史会话列表数据？

在项目的websocket连接中监听的Message事件，返回的**event**点**data**里存在消息type，根据type判断不同的返回的消息类型并进行不同的处理。在打开页面后，会返回一个conversation_created的类型消息，这个消息代表已创建的历史会话。前端得到这个消息后，就向后端通过get获取历史会话列表，拿到后存储起来渲染到页面上。

#### （2）如何实现历史对话的切换？

在项目中，每个对话都有其对应的独一无二的会话id，通过会话id就可以判断是哪一段对话。切换历史对话时，会触发changeChat函数，将这一历史对话的id传进去。

在函数中

1、如果当前有正在进行的会话，先关闭掉websocket连接，清空心跳检测。然后清空存储当前多轮对话的chatData数组并重置当前对话信息，将其中的id改为历史会话的id

2、通过get将历史会话id传到后端，获取到对应历史会话的多轮消息，将这些新获取到的消息遍历存入chatData数组中，成为当前对话消息

3、将历史会话渲染到页面上，调用函数重新建立webSocket连接

在切换到历史对话后，用户可以接着就之前的话题进行问答。因为AI具有上下文记忆的功能（大模型端本身具有的功能，如果没有这个功能，可以由后端在向大模型发送用户消息时，带上之前几条的历史对话），所以可以无缝衔接，继续讨论之前的问题。

### （7）如果两个用户之间通过websocket进行聊天，中间有服务器，大致描述一下这个过程应该如何实现

用户A（浏览器） ⇄ WebSocket ⇄ 服务器 ⇄ WebSocket ⇄ 用户B（浏览器）

实现步骤（概述）

#### 1️⃣ 客户端连接 WebSocket 服务器

用户A 和 用户B 都通过 WebSocket 建立连接，new一个WebSocket，链接是服务器：

```Plain Text

const socket = new WebSocket('ws://your-server.com');

```

当连接建立后，可以open事件监听连接状态：

```Plain Text

socket.onopen = () => {

  console.log('Connected to server');

};

```

#### 2️⃣ 客户端发送消息

用户A 发出消息给用户B，通过send发送：

```Plain Text

socket.send(JSON.stringify({

  type: 'chat',

  to: 'userB-id',

  from: 'userA-id',

  content: '你好！'

}));

```

#### 3️⃣ 服务器接收并转发消息

服务器通监听message事件，接收到用户A的消息后，查找用户B对应的 WebSocket 连接，然后将通过send消息转发过去。

伪代码如下（Node.js 示例）：

```Plain Text

const clients = new Map(); // userId -> WebSocket



wsServer.on('connection', (socket) => {

  socket.on('message', (raw) => {

    const msg = JSON.parse(raw);

    const toUserSocket = clients.get(msg.to);

    if (toUserSocket) {

      toUserSocket.send(JSON.stringify({

        from: msg.from,

        content: msg.content

      }));

    }

  });

});

```

#### 4️⃣ 接收方收到消息并展示

用户B 的前端同样通过message事件监听 WebSocket 消息：

```Plain Text

socket.onmessage = (event) => {

  const msg = JSON.parse(event.data);

  displayMessage(msg.from, msg.content);

};

```

### （8）axios二次封装

#### 为什么要对axios进行二次封装？

对 Axios 的二次封装主要是为了**统一管理网络请求逻辑**，通过拦截器**全局处理错误提示**、**Token 鉴权**、**处理参数格式**等，减少重复代码；同时规范数据响应结构（如自动提取嵌套数据），**简化api（如get，post）调用方式**（如统一设置参数，统一返回 `[err, data]` 格式），并支持扩展缓存、重试等定制功能，最终提升代码复用性、维护性及项目协作效率。

#### 项目中进行了哪些封装？

**1. 基础配置**

- 动态获取后端 API 域名

设置 getBaseURL() 方法，根据当前前端页面的域名自动切换对应的后端 API 地址，方便在不同环境（如测试、生产）下自动适配。

- axios 全局配置

设置了请求超时时间、基础 URL、跨域携带 cookie、默认请求头（如 Content-Type、Authorization、Chat-Token 等）。

**2. 动态请求头处理**

- 设置 getDynamicHeaderData() 方法，动态获取用户的 token、sessionId 等信息，并在每次请求时自动加到请求头里，保证接口安全和用户身份校验。

**1、对get和post这些api进行了封装**

以get api为例，封装了一个新的get函数来获取各项数据，里边调用axios.get(url, params)方法，参数是请求路径url和和要查询的查询参数params。在then中处理请求结果，通过res.data获取到数据。获取成功就用resolve返回数据。请求失败通过catch接到，用rejected返回一个error。

post情况也类似，调用axios.post方法，传入请求数据与URL，在then中处理数据并返回，在catch中处理错误并返回

**2、对请求拦截器进行了封装**

请求拦截器是通过`axios.interceptors.request.use`，对config赋值实现，每次请求前调用getDynamicHeaderData()方法，自动添加动态请求头。

**3、对响应拦截器进行了封装**

对后端返回的数据进行统一处理，只有 code === 0（即请求成功）时才返回数据，否则抛出错误，方便前端统一处理异常。

## 3、模糊查询 多条件精准查询 useActionState 排序 防抖函数

#### 简单介绍

**（1）搜索功能**

在项目的全部房源页面中，有着搜索功能，可以在输入框中输入想要查询的字符串，点击搜索按钮后就可以匹配到标题中有相应字符串的房源渲染在页面上，这个过程通过模糊查询实现。在搜索框输入时还会有一个下拉菜单，可以根据输入值实时显示匹配到的前五条房源标题，也是应用到了模糊查询，同时还做了防抖处理，防止高频输入造成多次渲染的性能问题。

**（2）条件筛选功能**

在项目的全部房源页面中，有条件筛选功能，可以根据人数、价格、位置条件来筛选房源。通过多条件精准查询来实现这一功能。

### （1）模糊查询简单介绍

全部房源页面中有搜索功能，可以匹配并渲染出标题中有搜索字符串的房源item。搜索功能主要应用到了模糊查询。模糊查询的基本原理是对房源数据列表通过filter进行遍历，对每个遍历到的item取标题，通过includes判断标题中有没有要搜索的字符串，有返回的就是true，item添加到filter得到的新数组里边。搜索时还具有搜索建议功能，使用onChange根据表单的输入值，通过下拉菜单实时展示出通过模糊搜索匹配到前五条的房源标题。

### （2）多条件精准查询简单介绍

全部房源中页面中有筛选功能，可以按照人数，价格，位置条件对房源item进行筛选。条件筛选功能应用到了多条件精准查询，基本原理也是对房源数据列表通过filter进行遍历，对每个遍历到的item取到人数，价格，位置这些属性，与条件进行比较，再对比较结果进行短路判断，如果都返回true的才返回到filter新数组内（短路判断时将高淘汰率的条件（如位置）放在判断逻辑前端，快速跳过不符合项）。

### **（3）useActionState**的尝试使用

在全部房源页面的代码中，存在搜索框、人数、价格、位置等多个表单元素，需要通过**useState**设置**多个状态变量**来保存并操作这些表单的内容，比较繁琐。之后了解到react19新api `useActionState`的更新，可以更好地**控制表单的action状态**，无需多个状态变量，于是尝试使用在了项目内。

`const [state, action, isPending] = useActionState(fn, null)`

`useActionState`有两个参数，第一个是**处理表单提交内容的回调函数**，第二个是初始值。回调函数由两个参数**prevData**（之前的表单数据）和**formData**（现在的表单数据）。可以得到通过formData参数得到各个表单的内容，通过**formData.get('表单名')**就能得到相应表单的内容。在项目中我先得到各个表单的内容，再**传入筛选函数**（通过filter进行模糊查询和精准查询的函数），最终筛选后的数组**返回出去**。

`useActionState`有三个返回值，第一个返回值是执行回调函数后**返回的状态**，在项目中就是返回的**筛选后的新数组**。第二个就是返回值action函数，react19更新后form的action属性可以**绑定要执行的action函数**，绑定后表单就可以执行相应的函数（相当于给之前的onSubmit加上以后个handle什么什么)。第三个返回值是判断表单提交**状态的isPending**，为做到在action函数**执行时无法再次提交**，通过isPending判断**button按钮是否禁用**（添加disabled属性），如果函数中有异步网络请求，这个功能更加有用。

这几个表单元素都是提交后获得的，所以使用useActionState。

### （4）排序的实现

通过一个状态变量来保存是通过价格还是评分进行排序。然后向后端发送请求，过程中设置isPending状态变量处理请求状态，请求状态中渲染一个蒙层到页面上。不使用useActionState是因为希望一改变状态变量就请求，而useActionState是提交后才执行，所以不使用。

### （5）防抖函数

在搜索框输入时，会展示一个搜索建议的下拉表单，包含前五条根据当前搜索字符串匹配到的房源item的标题，通过onChange获取搜索字符串。为解决高频输入时的性能问题，通过防抖对函数进行包裹，只在最后一次触发后才执行，解决了问题。

### 问题1：为什么不通过后端实现

这个项目是和实验室后端的同学一同配合实现的，做到搜索和筛选功能呢时后端的同学已经出去实习了，没时间再做搜索和筛选的接口，所以退而求其次选择从前端实现。当然从后端实现肯定是更完美的方案，因为项目使用的是懒加载，所以数据列表中只有已经请求到的房源数据。将搜索字符串和条件都传到后端，再由后端从全部房源数据中进行筛选，肯定是更合适的。

### 问题2：**多条件筛选采用`filter`链式遍历，如何保证多条件组合查询的效率？**

1. **短路判断**：将高淘汰率的条件（如位置）放在判断逻辑前端，快速跳过不符合项

2. **条件变化监听**：仅当筛选条件变化时重新计算，避免重复执行。具体实现是通过回调函数的第一个参数prevData可以保存上一次的表单提交的内容，与本次进行对比，如果相同就直接返回上一次过滤后的数据即可。

### 问题3：**搜索建议如何实现？**

在输入框输入时，会触发搜索框的onChange事件，给事件绑定上了函数来设置状态变量并调用模糊查询，将前五条匹配到的房源标题渲染到下拉菜单里边。这个过程中使用了防抖函数来控制快速输入的情况。（不使用useActionState是因为不是提交而是实时改变，所以要用onChange）

### 问题4：**如何处理用户输入的特殊字符或SQL注入风险？**

1. **前端过滤**：对搜索输入进行清理（如移除`<script>`标签）

```Plain Text

const cleanInput = input.replace(/[<>]/g, '') 

```

**2.使用CSP**

CSP 通过设置HTTP 响应头，**限制浏览器只能加载指定来源的资源**，从而防御 XSS 攻击和数据注入。主要防护能力包括：

- 阻止未经允许的内联脚本（`<script>`标签）

- 禁止加载外域恶意脚本

- 阻止未授权的资源加载（图片、字体等）

- 禁用危险的 `eval()` 等函数

### 问题5：如何控制下拉菜单的显隐

设置一个状态变量来控制，当光标位于搜索框时（通过onFocus）设置为true，点击到搜索框外部时（通过e.target.closest('盒子类名')得到点击的是哪个盒子）就设置为false，通过短路逻辑判断是否显示。

### 问题6：如果一个item里有多种类型房间怎么办

1、通过useSelector获取到数据列表

2、对数据列表进行map遍历，并对每个item通过filter对房间进行筛选，获得返回符合条件的房间的数组，并重新设置item对象，修改房间属性为新数组。

3、对数据列表进行一次filter遍历，将不符合条件的酒店item过滤出去（item.rooms.length需要大于0），并将过滤后的数据列表保存到redux中。

4、点击房源item时，通过过滤后的数据列表将房间信息传进去，保证只有符合条件的房间。

## 4、防抖与节流

防抖和节流的区别：防抖是事件高频触发结束后触发回调，节流则是在事件高频触发过程中就触发回调

### 一、防抖（Debounce）

- **防抖**：在事件被频繁触发时，只在 **最后一次触发** 后经过指定的等待时间才执行一次回调。依靠这个机制可以有效避免高频调用事件造成性能问题

- **常见场景**：输入框实时搜索、窗口 改变大小等。

---

实现防抖简单来讲就是将原函数进行包装，设置一个变量来存储定时器，并返回一个闭包函数，闭包函数里边里边是包着原函数的定时器以及判断逻辑。监听事件触发后会调用这个闭包函数，需要根据变量判断上一次的定时器是否还存在，如果依然存在就清除掉并给变量设置新的定时器。如果某一次达到事件间隔事件未被触发，定时器没有被清除，就执行定时器中的原函数。

- 如果问起怎么执行原函数：**注意 `this` 绑定**：如果原函数使用到了this，例如依赖对象的方法内的 `this.xxx`，为了保持原函数的调用上下文，我们使用 `fn.apply(this, args)`，同时能够实现立即执行。

- args指的是剩余参数，调用防抖函数时会传入参数，`args` 的作用就是**收集并传递**防抖函数被调用时的所有参数，保证原函数 `fn` 能拿到它们。

完整代码：

```Plain Text

function debounce(fn, delay) {

  let timerId = null;

  

  return function(...args) {

    // 如果已有定时器，先清除

    if (timerId) {

      clearTimeout(timerId);

    }

    

    // 设置新的定时器

    timerId = setTimeout(() => {

      fn.apply(this, args);

    }, delay);

  };

}

```

---

### 二、节流（Throttle）

#### **核心思想**

**固定时间间隔内只允许函数执行一次**。无论事件触发多频繁，执行频率都会被严格控制。

**实现思路**：**时间戳版**：每次触发时，用当前时间减去上次执行时间，若超过间隔则执行。

**定时器版**：第一次触发立即执行，然后在定时器运行期间屏蔽后续触发；定时器到期后才允许再执行。

**实现步骤**：时间戳版：1、在节流函数中初始化状态变量， 记录上一次函数执行的时间戳

2、**返回闭包函数**，用于替代原函数绑定到事件上。该包装函数内部可访问并更新上面声明的状态变量。

3、在**包装函数内部实现核心逻辑**，先通过Date.now()获取当前时间戳；然后判断 当前时间戳减去上一次时间戳是否大于要求的事件间隔。若满足则执行原函数并更新上一次时间戳为当前时间戳。

‘定时器版：1、在节流函数中初始化状态变量， 记录上一次函数执行的定时器

2、**返回闭包函数**，用于替代原函数绑定到事件上。该包装函数内部可访问并更新上面声明的状态变量。

3、**在包装函数内部实现核心逻辑**，如果状态变量有定时器，代表还没有达到时间间隔，直接 `return`（忽略本次触发）。如果没有，就代表已经达到时间间隔，执行原函数，并给状态变量设置新的定时器。

**使用场景**：页面滚动scroll事件控制，拖拽事件等

#### **代码实现（时间戳版）**已经实现了首次触发

```Plain Text

function throttle(func, interval) {

  let lastExecTime = 0; // 闭包保存上次执行时间

  return function(...args) {

    const now = Date.now();

    if (now - lastExecTime >= interval) { // 时间间隔外触发则执行，首次lastExecTime为0，一定会触发

      func.apply(this, args); // 绑定this是为了外部调用节流函数时，this不丢失。如果直接调用func，相当于是全局调用了，this会变为window

      lastExecTime = now; // 更新时间戳

    }

  };

}

```

## 5、PictureBrowser组件

### 简单介绍

在房源的详情页面中，封装了一个PictureBrowser这么一个图片浏览器组件来帮助用户更好地浏览房源图片。点击**显示更多照片**后，就可以进入到图片浏览器。右上角是一个**叉号**，点击就可关闭图片浏览器。图片浏览器**中央是一张房源图片**，**左右两边是箭头**，点击箭头图片就会**向前或向后切换一张**。切换时通过**第三方库 react-transition-group**对图片**传入传出动画效果**进行优化。图片下方是**indicator图片指示器**，按顺序展示当前图片与附近的六张图片（一共七张，都是略缩图），其他图片都用阴影覆盖。点击箭头后，图片指示器也**跟着切换图片**。当前图片位于房源图片列表**首或尾**时，图片指示器**按照顺序切换位置**，位于图片列表**中间**时，切换的图片**始终位于图片指示器中间**。而**点击图片指示器**中的图片，中央展示的图片就**切换到相应图片**，图片指示器的切换遵循之前同样的逻辑。由于逻辑较复杂，所以又封装了一个indicator组件来实现这一功能。图片浏览器中还有一个选择指示器显示与否的按钮。以上就是图片浏览器的大致功能。

### 问题1：如何通过react-transition-group优化动画效果

1、通过状态变量保存点击的是左箭头还是右箭头，点击箭头就会触发函数进行设置，并将新图片重新渲染上去

2、通过react-transition-group中的CSSTransition组件将图片包裹，设置单一盒子的动画效果。

内部属性：in来控制动画触发与否，key确保多个组件切换时都有唯一标识，classNames设置类名，timeout设置动画时长

动画的样式：根据CSSTransition属性确定的类名决定，直接在`类名-enter/类名-exit`设置开始动画效果，`类名-enter-active/类名-exit-active`设置结束的动画效果，结束样式中要包括transition设置过程，如transition: all 200ms ease，代表动画效果200ms，先慢后快后慢。

3、使用SwitchTransition标签处理两个组件之间切换的过程。通过mode属性来控制切换方式，"out-in": 当前组件先退出，新的组件再进入。"in-out": 新的组件先进入，当前组件再退出。子组件必须使用 CSSTransition 或 Transition，并确保 key 属性唯一。

### 问题2：React Transition Group（RTG）相比原生 CSS 或 JavaScript 动画方法，在 React 生态中有以下核心优势

---

#### 1. **组件化生命周期管理**

RTG 提供 `Transition`、`CSSTransition`、`SwitchTransition` 等组件，**无缝集成 React 的生命周期**。

- 自动处理组件挂载（mount）和卸载（unmount）的时序问题。

- 原生方法需要手动用 `setTimeout` 或 `useEffect` 控制 DOM 元素的移除时机，容易导致动画未完成元素就被销毁的问题。

---

#### 2. **解决组件卸载动画难题**

原生 CSS 无法直接处理组件卸载时的动画（如元素消失的 `exit` 动画），因为 React 会立即移除 DOM 节点。

- RTG 通过**保留 DOM 节点直到动画完成**（如 `exiting` 状态结束后），确保退出动画能完整播放。

---

#### 3. **声明式 API 与状态驱动**

通过 `in` 属性控制动画状态（进入/退出），**状态变化自动触发动画流程**。

- 原生方法需要手动添加/移除 CSS 类或操作 DOM，代码冗余且易出错。

- 示例：通过 `in={isVisible}` 即可触发元素的进入/退出动画流程。

---

#### 4. **跨动画库兼容性**

RTG **不依赖具体动画实现**，可自由搭配 CSS、GSAP、Anime.js 或 React Spring。

- 原生 CSS 动画需硬编码 `@keyframes` 或类名，灵活性低。

- 示例：用 `CSSTransition` 直接绑定 CSS 类名，或用 `Transition` 结合 JS 动画库。

---

#### 5. **复杂场景简化**

- **路由切换动画**：通过 `SwitchTransition` 实现组件切换时的平滑过渡。

- **列表动画**：结合 `TransitionGroup` 管理动态列表项的增删动画，避免手动跟踪每个元素的 key 和状态。

### 问题3：**Indicator 的滚动策略如何实现**

滚动策略的核心是 **视口居中算法**

1、所有图片都放在一个盒子的内容中，盒子展示区宽度固定，改变的其实是盒子内容的位置，默认图片从第一个开始，盒子所以在最右边。

2、图片切换后，得到新图片的索引，从而获取到图片对应的宽度clientWidth和离左侧父盒子边缘距离offsetLeft。

3、获取到盒子显示区的长度和内容长度，通过**左侧距离+盒子本身宽度*0.5-显示宽度**计算出距离，得到要盒子要移动到的位置，从而使得当前图片居中

4、如果位于头部，计算出距离会小于零，这种情况就不移动盒子。同理如果位于尾部，计算出距离会超过盒子内容宽度，同样也不移动盒子

## 6、前端优化方法

**项目中如何判断首屏加载时间的？**

我是根据开发者面板中的Lighthouse的LCP这项数据指标来判断的，LCP 衡量的是视口中**最大可见内容元素**渲染完成的时间，是最能反映用户感知到“首屏主要内容已加载”的指标。

**如何通过路由懒加载和图片懒加载改善首屏加载时间？**

- 懒加载把不同路由的代码拆成多个块，初始页面只下载首屏需要的 chunk，**减小首包体积** ⇒ 浏览器下载/解析/执行 JS 的时间减少，**主线程更快空闲**，渲染更快（LCP 可能更早）。

- 如果首屏被大量 JS 阻塞（解析/执行），把当前路由内不必要的逻辑延后加载能明显改善首屏感知速度。

- 另外对于图片懒加载，如果页面中存在大量图片，通过图片懒加载将视口外的图片延后加载，可以减少网络请求和主线程渲染操作，也可以缩短首屏渲染时间

### 1、路由懒加载

**传统问题**：所有路由组件打包到单一JS文件，导致首屏加载缓慢，

**作用**：通过路由懒加载将应用拆分为按路由分割的代码块，初始仅加载核心框架，仅在用户导航到对应路由时才会加载相应资源，可以减少初始加载体积，大幅提高首屏加载速度。

**如何使用**：在react中，通过lazy实现懒加载。用Lazy将一个导入组件的箭头函数包裹起来，用Suspense组件来处理路由导入过程中的加载过程，如果请求状态是pending就通过fallback属性来渲染加载过程中显示的内容，在我的项目中是在路由切换过程中显示一个白色透明蒙层。

**底层原理**：实现路由懒加载的底层原理主要依赖于**代码分割**与**动态加载**技术，其核心思路是把整个应用拆分为多个独立的代码块（chunk），只有在用户真正访问某个路由时才加载对应的代码，从而减小初始加载包的体积，加快首屏渲染速度。下面是具体的原理和步骤：

1. **代码分割** 使用打包工具（如 Webpack、Rollup 等）将应用按路由或功能模块拆分成多个独立的代码块。这样每个路由对应的组件和依赖会被打包到单独的文件中。

2. **动态导入（Dynamic Import）** 利用 JavaScript 的 `import()` 函数实现动态加载。例如，当用户导航到某个路由时，路由配置中会触发动态导入操作，返回一个 Promise，等待模块加载完成后再进行渲染。

3. **缓存机制** 一旦动态加载成功，对应的代码块会被缓存（通常浏览器层面已经缓存该文件），避免重复请求，提高用户体验。

### 2、图片懒加载

**简单介绍**：

在全部房源页面里，存在大量带图片的房源item，如果直接加载所有图片，肯定会造成性能问题，给用户带来较差体验，所以采用图片懒加载的方式。

**实现过程**：

房源 Item 组件中，整体房源信息（如标题、价格和加入购物车按钮）直接渲染，而房源图片则交由 LazyImage 组件处理，从而实现按需加载图片，提高页面加载效率。

LazyImage 组件内部使用了 React 的 **hooks**（useState、useEffect 和 useRef）来管理**图片加载状态**。组件首先通过 **useRef** 获取图片 **DOM 元素**，并用 useState 管理图片**是否加载完成（isLoaded）**和图片**是否加载失败**（**hasError**）的状态。核心部分是利用 **Intersection Observer** API 监听图片元素是否**进入视口**。开始时为所有图片元素加上观察，当检测到图片元素的**可见度超过设定的阈值**（threshold 0.1）时（即进入视口），就会将图片的datasrc中的图片地址赋值到src中，从而加载图片，并结束观察。如果图片加载成功，触发img元素onLoaded事件，更新加载状态为true，让真正的图片得以显示；如果加载失败，则触犯onError事件，将错误状态置为 true，并展示相应的错误提示。

在图片加载未完成的期间，组件使用 **antd** 的 Skeleton.Image 显示**骨架屏**，作为占位效果，以提升用户体验。只有当图片加载成功时，真实的图片才会被展示，并且通过 CSS 样式设置为覆盖整个容器，同时保证了图片自适应布局。通过这种设计，不仅有效地降低了页面初始加载的压力，也能在加载过程中提供良好的视觉反馈和错误处理。

#### 路由懒加载和图片懒加载做了哪些指标的提升

**路由懒加载**主要提升的是首屏相关指标。

 它把当前不需要的页面代码拆出去，减少首包 JS 体积，所以通常会改善 **FCP / LCP / TTI / TBT** 这类指标。原理是：初次进入时只加载当前路由所需代码，减少浏览器的下载、解析、编译、执行成本，也减少主线程阻塞。对 SPA 来说，这个收益通常很明显。

**图片懒加载**主要提升的是首屏网络和渲染压力相关指标。

 它的核心是让视口外的图片先不加载，减少首屏请求数和带宽占用，通常会改善 **FCP**，有时也会间接改善 **LCP**、**INP**。原理是：浏览器先只加载当前可见区域的图片，避免大量图片同时请求、解码和占用主线程资源。

 不过要注意，**如果把首屏大图也懒加载了，反而会变差**，尤其会拖累 **LCP**，因为 LCP 本来就是看最大内容元素什么时候出现。

#### 使用**Intersection Observer** 的好处是什么？

- **作用**：监听目标元素与父容器（或视口）的**交叉状态变化**（如元素进入/离开视口）。

- **优势**：

  - **高性能**：异步回调，**避免频繁触发** `scroll` 事件。

  - **灵活**：可配置触发交叉的**阈值**（threshold），触发的**范围**和监听的根容器。

  - **自动管理**：**无需手动计算元素位置**。

**对比传统方案**

| **场景**         | **传统方案（scroll + getBoundingClientRect）** | **Intersection Observer**  |

| ---------------- | ---------------------------------------------- | -------------------------- |

| **性能影响**     | 频繁触发强制布局，导致性能抖动                 | 无强制布局，异步批量处理   |

| **代码复杂度**   | 需手动管理监听、防抖、计算逻辑                 | 声明式 API，自动管理       |

| **精确度**       | 依赖手动计算，可能误差                         | 浏览器原生计算，精确到像素 |

| **动态内容支持** | 需手动跟踪新增元素                             | 自动观察新注册元素         |

#### Intersection Observer的底层原理是什么？

Intersection Observer 的底层原理主要依赖于浏览器的渲染与布局机制，通过异步检测目标元素与观察容器（通常是视口）之间的交叉情况来工作。当页面发生滚动、窗口尺寸变化或其他布局更新时，浏览器会重新计算各个目标元素与根容器之间的交叉区域，然后将这些计算结果与预先设定的阈值进行比较。当某个目标元素的交叉比例超过（或低于）阈值时，浏览器就会生成对应的 IntersectionObserverEntry 对象，并异步调用注册的回调函数。

这种机制的好处在于，浏览器可以批量处理多元素的可见性变化，从而避免频繁监听滚动事件带来的性能问题，实现高效、低开销的可见性检测。

### 3、react.memo

**React.memo 的好处** `React.memo` 是 React 提供的高阶组件（HOC），主要用于优化函数组件的渲染性能。它的核心优势是可以**避免不必要的重新渲染**

当父组件更新时，即使子组件的 `props` 未变化，默认情况下子组件也会重新渲染。使用 `React.memo` 后，子组件会**浅层比较新旧 `props`**，仅当 `props` 变化时才会重新渲染。

如果`props`是一个对象，即使内容一样，但由于每次传过来的都是一个新对象，引用不同，子组件也会重新渲染。解决方法就是给memo添加一个shallowEqual，这样如果引用不同，会再对内部属性方法进行比较，如果相同就不用重新渲染

### 4、虚拟列表+懒加载

在上边

### 5、防抖与节流

在上边

### 6、前端判断优化的指标有哪些

1. **LCP (Largest Contentful Paint) 最大内容绘制**

   - 定义：页面**最大的内容元素**（图片、标题等）渲染完成的时间

   - 标准：优秀 <2.5s，合格 <4s

   - 意义：衡量**加载速度**的核心指标

2. **CLS (Cumulative Layout Shift) 累积布局偏移**

   - 定义：页面加载过程中，元素意外位移的累计分数

   - 标准：优秀 <0.1，合格 <0.25

   - 意义：衡量**视觉稳定性**

3. **INP (Interaction to Next Paint) 交互到下一次绘制**

   - 定义：从用户点击 / 输入，到页面做出响应的延迟

   - 标准：优秀 <200ms

   - 意义：衡量**页面交互流畅度**，已替代旧指标 FID

4. **FP (First Paint) 首次绘制**

   浏览器第一次在屏幕上绘制像素的时间（白屏结束）

5. **FCP (First Contentful Paint) 首次内容绘制**

   浏览器第一次渲染**文本、图片、非空白元素**的时间

6. **TTFB (Time to First Byte) 首字节时间**

   从请求发出，到收到服务器第一个字节的时间

   → 反映服务器响应与网络质量

7. **TBT (Total Blocking Time) 总阻塞时间**

   FCP 到 TTI 之间，主线程被长任务阻塞的总时长

   → 反映 JS 阻塞严重程度

8. **TTI (Time to Interactive) 可交互时间**

   页面加载完成、主线程空闲、可稳定响应用户操作的时间

9. **SI (Speed Index) 速度指数**

   页面内容**逐步填充显示**的速度评分，数值越小越快

10. **FMP (First Meaningful Paint) 首次有效绘制**

   页面核心内容首次可见的时间（目前已逐渐被 LCP 替代）

#### 三、简单总结（常用优先级）

- 看**加载快慢**：TTFB → FCP → LCP

- 看**交互卡顿**：TBT → INP

- 看**页面抖动**：CLS

#### 一、路由懒加载（代码分割）

把不同页面的 JS/CSS 拆分成独立文件，**首屏只加载当前页面的代码**，不加载其他路由的冗余代码，大幅减少首屏资源体积、JS 解析执行时间。

##### 🔥 核心优化指标（按优先级排序）

1. TBT（总阻塞时间）★★★★★（最关键）

   冗余 JS 减少 → 主线程长任务减少 → 阻塞总时长直接下降（路由懒加载对 TBT 的优化是立竿见影的）

2. TTI（可交互时间）★★★★★

   主线程更快空闲 → 页面更早能响应用户点击、输入

3. INP（交互流畅度）★★★★

   主线程不拥堵 → 用户交互的响应延迟大幅降低

4. LCP（最大内容绘制）★★★

   首屏资源加载更快 → 页面最大元素更早渲染

5. FCP（首次内容绘制）★★

   间接优化：无冗余 JS 阻塞，浏览器更快渲染文本 / 基础元素

6. SI（速度指数）★★★

   页面内容填充速度更快

------

#### 二、图片懒加载

只加载**当前可视区域内**的图片，首屏不加载下方 / 非可视区图片，减少首屏 HTTP 请求、带宽占用，避免图片资源抢占首屏渲染。

##### 🔥 核心优化指标（按优先级排序）

1. LCP（最大内容绘制）★★★★★（最关键）

   80% 的页面 LCP 元素都是图片！懒加载非首屏图片 → 首屏图片优先加载 → LCP 直接提速（图片懒加载的核心价值）

2. CLS（累积布局偏移）★★★★★

   配合图片宽高设置，非首屏图片加载时不会挤压页面元素 → 彻底解决页面抖动

3. FCP（首次内容绘制）★★★

   无多余图片请求抢占资源 → 浏览器更快渲染文本 / 基础内容

4. TBT（总阻塞时间）★★★

   减少图片加载的主线程占用 → 降低阻塞

5. SI（速度指数）★★★

   首屏内容更快完整显示

## 7、axios二次封装

#### 为什么要对axios进行二次封装？

对 Axios 的二次封装主要是为了**统一管理网络请求逻辑**，通过拦截器**全局处理错误提示**、**Token 鉴权**、**处理参数格式**等，减少重复代码；同时规范数据响应结构（如自动提取嵌套数据），**简化api（如get，post）调用方式**（如统一设置参数，统一返回 `[err, data]` 格式），并支持扩展缓存、重试等定制功能，最终提升代码复用性、维护性及项目协作效率。

#### 项目中进行了哪些封装？

**1. 基础配置封装（第一步）**

统一设置**基础地址、超时时间**，不用每个接口单独写：

- `baseURL`：自动拼接接口url前缀，外部调用时只需要传入不一致的url后缀，后期如果更换基本域名也只需改一处

- `timeout`：全局统一超时（比如 5 秒），全局生效

**2. 请求拦截器（必封装）**

所有请求**发送前**统一处理：

- 自动携带 `Token`（登录态）

- 统一设置请求头（`Content-Type` 等）

- 接口返回前展示loading加载动画

**3. 响应拦截器**

所有接口**返回后**统一处理：

- 自动剥离数据（不用每次写 `res.data`）

- 统一判断业务状态码（如 `code:200` 成功），对不同错误码情况进行统一处理全局处理

不用每个接口写 `.catch()`，所有错误（网络错误、超时、断网）统一处理，弹出弹窗或者toast来自动提示用户。

**4.统一 API 请求方法封装**

对get，post这些api进行封装，固定参数格式，简化接口调用时的逻辑，直接调用get/post方法并传入url和参数即可，代码更简洁。

**1、对get和post这些api进行了封装**

以get为例，封装了一个新的get函数来获取各项房源数据，里边调用axios.get(url, params)方法，参数是请求路径url和和要查询的查询参数params。在then中处理请求结果，通过res.data获取到数据。获取成功就用resolve返回数据。请求失败通过catch接到，用rejected返回一个error。

post情况也类似，调用axios.post方法，传入请求数据与URL，在then中处理数据并返回，在catch中处理错误并返回

**2、对请求拦截器进行了封装**

在第一个项目中，只是封装了一些公共请求头。在第二个项目中，存在登录功能，所以在请求拦截器中通过getItem获取用户的token ，如果有token就设置到请求头的Authorization。请求拦截器是通过`axios.interceptors.request.use`，对config赋值实现。

**3、对响应拦截器进行了封装**

在第一个项目中，没有登录功能，所以仅通过响应拦截器封装了处理网络请求错误显示的错误信息，如400是'错误的请求'，404是'请求错误,未找到该资源'，500是'服务器端出错'，502是网络错误。并通过message(error)弹出错误信息。在第二个项目中封装了对用户token过期或失效进行处理，当返回结果为401时说明token过期或失效，重新刷新token（通过存储的有更长有效期的refreshToken，将其post到服务器端，正常情况下会返回新token）。如果成功获取新token就使用新token重新请求，如果还是失败就弹出错误信息、清除token并跳转至登录页面。

4、对各个接口进行进一步封装，调用上边的get函数，将请求的url传进去，在外部使用相应数据请求时直接调用即可。

## 8、登录与注册的实现

项目2中登录通过token方式实现。

通过状态变量设置显示登录还是注册

**注册的实现**：首先设计了注册的用户名，密码与重复输入密码的表单。点击注册按钮后先进行前端检查，如果密码符合规则且两次输入密码相同，就触发注册请求，将用户名和密码通过post传进去，返回一个响应，如果成功调用就登录函数，失败就弹出注册失败。

**登录的实现**：

1、首先在设计了登录的用户名和密码表单，点击登录按钮会触发登录请求，将用户名和密码传进去，如果登录成功就把用户名放到redux中存起来，并跳转到首页，失败就弹出登录失败。

2、触发登录请求，会通过post方法将用户名和密码传到服务器，如果成功就获取响应中的token和refreshToken放到localStorage中存起来（通过setItem）,并返回一个true。失败就返回一个false

3、在请求拦截器中，会将token放进请求头Authorization中。在响应拦截器中，会对响应结果进行处理，如果token过期或失效就通过refreshToken重新获取一个新token存起来，通过新token重新进行请求。如果还是失败就弹出错误信息，清除token并跳转至登录页面。

4、首页中设置了登出按钮，点击后就可以触发登出函数，清除token并跳转至登录页面。

5、通过设置一个高阶组件来实现路由守卫，在高阶组件中对token的有效性和是否过期进行验证（通过jwtDecode对token进行解析），如果验证通过就跳转到响应的页面，如果不通过就回到登录页面。通过状态变量来保存用户token，并通过context传递。

### 问题1：都有哪些登录方式，都有什么特点和优势？

#### 一、**Session-Cookie 认证**

#### **原理**

- 服务端生成会话（Session）并存储（如内存、数据库、Redis），客户端通过 Cookie 保存 Session ID。

- **流程**：

  1. 用户提交用户名密码。

  2. 服务端验证后生成 Session 并返回 Session ID。

  3. 客户端通过 Cookie 存储 Session ID。

  4. 后续请求自动携带 Cookie，服务端校验 Session ID。

#### **特点**

- **优点**：

  - 简单易实现，适合传统 Web 应用。

  - 服务端可主动控制会话（如强制退出、实时更新权限）。

- **缺点**：

  - 服务端需存储会话数据，扩展性差（分布式场景需共享 Session）。

  - 依赖 Cookie，跨域场景需额外配置。

#### **适用场景**

- 传统服务端渲染的 Web 应用（如 PHP、Ruby on Rails）。

---

#### 二、**OAuth 2.0 / 第三方登录**

#### **原理**

- 用户通过第三方平台（如微信、Google、GitHub）授权登录。

- **流程**：

  1. 前端跳转至第三方登录页面。

  2. 用户授权后，第三方返回授权码（Code）。

  3. 前端将 Code 传给后端，后端换取用户信息。

  4. 后端生成自有 Token 或 Session 返回前端。

#### **特点**

- **优点**：

  - 用户无需注册新账号，提升转化率。

  - 依赖第三方平台的用户体系，减少密码管理成本。

- **缺点**：

  - 实现复杂，需处理多种第三方协议。

  - 依赖第三方服务稳定性。

#### **适用场景**

- 需要快速接入第三方账号登录的应用（如社交平台、工具类应用）

### 问题2：token方式的优势和缺点是什么？

**三、Token 认证的优势**

| 优势               | 说明                                                        |

| ------------------ | ----------------------------------------------------------- |

| **无状态**         | 服务端无需存储会话信息，适合微服务、分布式架构。            |

| **跨域支持**       | 可轻松实现跨域认证（CORS），适合前后端分离项目。            |

| **多端兼容**       | 适用于 Web、移动端（App）、IoT 设备等多种客户端。           |

| **灵活的权限控制** | Token 可携带用户角色、权限信息，实现细粒度访问控制。        |

| **易于扩展**       | 可通过添加自定义字段（如设备 ID、Token 版本）支持复杂场景。 |

---

**四、Token** **认证的缺点与挑战**

| 缺点               | 解决方案                                                     |

| ------------------ | ------------------------------------------------------------ |

| **Token 泄露风险** | 使用 HTTPS、短期 Token、Refresh Token 轮换、绑定 IP/设备信息。 |

| **无法主动失效**   | 使用 Token 黑名单、短期有效期 + 刷新机制、或改用不透明 Token。 |

| **存储安全性**     | 优先使用 `HttpOnly Cookie`，避免 LocalStorage（防 XSS）。    |

| **Token 膨胀**     | 避免在 Token 中存储过多数据，敏感信息由服务端动态查询。      |

### **问题三**：Token 认证 vs Session-Cookie 认证

| 对比项           | Token 认证                     | Session-Cookie 认证         |

| ---------------- | ------------------------------ | --------------------------- |

| **状态管理**     | 无状态，适合分布式系统         | 有状态，服务端存储 Session  |

| **跨域支持**     | 天然支持（通过 Header 传递）   | 需配置 CORS 和 Cookie 域    |

| **移动端友好性** | 更友好（无需处理 Cookie）      | 需处理 Cookie               |

| **注销机制**     | 依赖黑名单或短期 Token         | 服务端直接删除 Session 即可 |

| **适用场景**     | 前后端分离、API 优先、多端应用 | 传统服务端渲染 Web 应用     |

### **问题4：前端该用 LocalStorage 还是 Cookie 存 Token？**

- **优点：**

  - 存储容量较大，适合存放较多或较大的数据。

  - 操作简单，通过 JavaScript API 直接读写，不需要每次请求都自动携带，便于在客户端灵活控制。

- **缺点：**

  - 数据完全暴露给前端脚本，无法设置 HttpOnly，容易受到 XSS 攻击。

  - 需要手动将 token 附加到 HTTP 请求头中，增加了实现复杂度。

  - 数据不会自动随请求发送，跨域时需额外处理。

**Cookie 存储 Token**

- **优点：**

  - 浏览器会自动在每个请求中附带 Cookie，便于服务器端识别用户会话。

  - 可以设置 HttpOnly 属性，防止 JavaScript 访问，从而降低 XSS 风险。

  - 配置 SameSite 和 Secure 属性后，可在一定程度上防范 CSRF 等攻击。

- **缺点：**

  - 存储容量有限（通常约 4KB），不适合存放大量数据。

  - 自动随请求发送，可能会带来不必要的流量开销。

  - 如果配置不当（例如未设置 SameSite 或 Secure），依然存在安全隐患。

## 9、style-components

**1、简单介绍**

styled-components 是一种流行的 CSS-in-JS 库，主要用于 React 应用中。它通过使用 ES6 的模板字符串（tagged template literals）让开发者可以在 JavaScript 文件中直接编写 CSS，然后将这些样式与具体的 React 组件绑定，从而达到组件化、模块化的样式管理效果。

**主要特点**

- **样式与组件紧密耦合**：样式定义在组件内，使得样式的作用域自动被限定在组件内，避免了全局样式冲突。

- **动态样式支持**：可以根据组件的 props 或 state 动态生成样式，满足复杂场景的需求。

- **主题支持**：提供 ThemeProvider，可以轻松实现全局主题切换，统一管理应用风格。

- **易于维护**：由于样式和逻辑在同一文件中管理，组件的可读性和可维护性较高。

**优点与适用场景**

- **提高复用性与封装性**：每个组件自带样式，方便复用和迁移。

- **简化开发流程**：不用再维护单独的 CSS 文件，减少样式冲突问题。

- **适用于大型 React 应用**：当应用组件化程度高时，styled-components 能够更好地管理复杂的样式体系。

### 1、通过参数实现动态样式

styled-components 利用 ES6 模板字符串的特性，可以在样式中嵌入 JavaScript 表达式。这样，你就可以根据组件的 props 动态计算出对应的 CSS 属性值。

**实现方式：**

- **插值** 在模板字符串中使用插值，接收组件的 props 作为参数，然后返回一个 CSS 值，要以一个$开头。 例如，根据一个 `primary` 属性来设置按钮的背景色，通过props.primary 判断那种样式：

  ```Plain Text

import styled from 'styled-components';

const Button = styled.button`

  background-color: ${props => props.primary ? 'blue' : 'gray'};

  color: white;

  padding: 10px 20px;

  border: none;

  border-radius: 4px;

`;

```





  在使用时，只需给组件传递相应的 props，如这里传primary：



  ```Plain Text

<Button primary>主按钮</Button>

<Button>普通按钮</Button>

```

### 2、整体将参数插入样式

  通过ThemeProvider将一个主题对象注入到整个组件树中。所有使用 styled-components 定义的组件都可以通过 `props.theme` 访问到这个主题对象，从而实现全局主题的统一管理和动态切换。

  **定义主题对象** 首先定义一个包含全局样式变量（如颜色、字体、间距等）的主题对象：

  ```Plain Text

// theme.js

export const theme = {

  primaryColor: 'blue',

  secondaryColor: 'gray',

  fontSize: '16px',

};

  ```

  **使用 ThemeProvider 包裹组件树** 在应用的根组件中使用 `ThemeProvider` 将主题对象传递下去：

  ```Plain Text

import React from 'react';

import { ThemeProvider } from 'styled-components';

import { theme } from './theme';

import App from './App';



const Root = () => (

  <ThemeProvider theme={theme}>

    <App />

  </ThemeProvider>

);



export default Root;

  ```

  **在 styled-components 中使用主题变量** 组件中可以通过 `props.theme` 直接访问主题变量：

  ```Plain Text

const Title = styled.h1`

  color: ${props => props.theme.primaryColor};

  font-size: ${props => props.theme.fontSize};

`;

  ```

### 3、混入 Mixin 功能

**实现方式：** styled-components 通过内置的 `css` 辅助函数来实现 mixin。你可以把常用的样式封装成一个可重用的样式块，然后在多个组件中引入。这样可以避免样式代码重复，提高可维护性。

### **还有哪些css-in-js的库**

Emotion或JSS

### style-components如何将样式插入

`styled-components` 用 **模板字符串** 生成 CSS 文本，交给 CSS 解析器（内部用 `stylis`）处理，然后把生成的规则插入到 `<style>` 标签中；组件本身得到一个自动生成的哈希类名（如 `sc-abc123`），样式通过该类名生效。**不是把样式放到元素的 `style` 属性里。**

## 10、redux-toolkit

### 什么是 Redux？它的主要特点是什么？

**Redux** 是一个用于管理应用状态的 JavaScript 库，通常与 React 一起使用。它提供了一种集中管理应用状态的方式，使得状态管理更加可预测和可维护。

**主要特点**：

- **单一数据源**：整个应用的状态存储在一个单一的 store 中，确保了状态的一致性。

- **状态不可变**：状态是不可变的，每次状态变化时，都会生成一个新的状态对象。

- **reducer**：通过reducer来处理状态变化，使得状态变化可预测。

- **中间件支持**：支持中间件，可以扩展 Redux 的功能，如异步操作、日志记录等。

- **开发者工具**：提供了强大的开发者工具，可以调试、回溯和重放状态变化。

### **一、为什么需要 Redux Toolkit？**

#### **传统 Redux 的痛点**

1. **繁琐的样板代码**：需手动编写 action types、action creators、reducers。

2. **配置复杂**：需自行集成中间件（如 Thunk、Logger）、DevTools。

3. **不可变更新易错**：手动使用 `...` 或 `Object.assign` 更新状态，容易出错。

4. **异步处理麻烦**：需依赖额外库（如 Redux-Saga、Redux-Observable）。

#### **Redux Toolkit 的优势**

- **简化代码**：内置 `createSlice` 自动生成 action 和 reducer。

- **开箱即用**：预置 `@reduxjs/toolkit` 包含 Immer、Thunk、DevTools。

- **类型安全**：完美支持 TypeScript。

- **高效开发**：减少 80% 的 Redux 代码量。

### **二、核心 API 与功能**

#### **1. `configureStore`：创建 Store**

替代 `createStore`，自动集成 Thunk、DevTools 和中间件。

```Plain Text

import { configureStore } from '@reduxjs/toolkit';

import rootReducer from './reducers';



const store = configureStore({

  reducer: rootReducer,

  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),

  devTools: process.env.NODE_ENV !== 'production'

});

```

#### **2. `createSlice`：定义 Slice**

自动生成 action types 和 action creators，简化 reducer 编写。

```Plain Text

import { createSlice } from '@reduxjs/toolkit';



const counterSlice = createSlice({

  name: 'counter',

  initialState: 0,

  reducers: {

    increment: (state) => state + 1,

    decrement: (state) => state - 1,

    addBy: (state, action) => state + action.payload

  }

});



export const { increment, decrement, addBy } = counterSlice.actions;

export default counterSlice.reducer;

```

#### **3. `createAsyncThunk`：处理异步操作**

简化异步逻辑（如 API 请求），自动生成 pending/fulfilled/rejected 状态。

```Plain Text

import { createAsyncThunk } from '@reduxjs/toolkit';

import api from './api';



export const fetchUser = createAsyncThunk(

  'user/fetchUser',

  async (userId, { rejectWithValue }) => {

    try {

      const response = await api.get(`/users/${userId}`);

      return response.data;

    } catch (error) {

      return rejectWithValue(error.message);

    }

  }

);

```

#### 4、**集成 React**

使用 `Provider` 包裹应用，并通过 `useSelector`/`useDispatch` 访问状态。

```Plain Text

// store.ts

import { configureStore } from '@reduxjs/toolkit';

import counterReducer from '../features/counter/counterSlice';



export const store = configureStore({

  reducer: {

    counter: counterReducer

  }

});



export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;



// App.tsx

import { Provider } from 'react-redux';

import { store } from './app/store';



function App() {

  return (

    <Provider store={store}>

      <Counter />

    </Provider>

  );

}



// Counter.tsx

import { useDispatch, useSelector } from 'react-redux';

import { increment } from './counterSlice';

import type { RootState } from '../app/store';



function Counter() {

  const count = useSelector((state: RootState) => state.counter);

  const dispatch = useDispatch();



  return (

    <button onClick={() => dispatch(increment())}>Count: {count}</button>

  );

}

```

#### **5、`useDispatch`：派发 Action**

**作用**

**获取 Redux Store 的 `dispatch` 函数**，用于触发 Action 以更新 Store 中的状态。

**使用场景**

当组件需要触发状态变更时（如用户点击按钮、提交表单、发起异步请求等）。

**代码示例**

```Plain Text

import { useDispatch } from 'react-redux';

import { increment } from './counterSlice'; // 导入 Action Creator



function CounterButton() {

  const dispatch = useDispatch();



  return (

    <button onClick={() => dispatch(increment())}>

      Increment Counter

    </button>

  );

}

```

**关键特性**

1. **直接派发 Action**： 可以派发同步 Action（如 `dispatch(increment())`）或异步 Action（如 `dispatch(fetchData())`）。

2. **无需手动订阅 Store**： React-Redux 自动处理与 Store 的连接。

---

#### **6、`useSelector`：获取 Store 状态**

**作用**

**从 Redux Store 中提取需要的状态值**，并订阅该状态的更新。当状态变化时，组件会自动重新渲染。

**使用场景**

当组件需要读取 Store 中的状态时（如显示计数器值、用户信息等）。

**代码示例**

```Plain Text

import { useSelector } from 'react-redux';



function CounterDisplay() {

  const count = useSelector((state) => state.counter.value);



  return <div>Current Count: {count}</div>;

}

```

**关键特性**

1. **选择器函数**： 接受一个函数 `(state) => selectedValue`，返回需要的状态片段。

2. 严格相等： 默认使用严格相等（`===`）比较前后状态值。**如果返回值是对象或数组，需确保引用稳定**，否则会导致不必要的重新渲染。

3. **性能优化**：

- **使用记忆化选择器**（如 `createSelector`）避免重复计算。

- **按需提取状态**：避免返回整个 Store 的根状态。

**`shallowEqual` 的作用**

- **默认行为问题**： `useSelector` 默认使用 `===` 比较前后两次选择器返回的值。如果返回的是新对象（如 `{ a: 1, b: 2 }`），即使内容相同，引用不同也会触发重新渲染。

- **`shallowEqual` 的优化**： 比较对象或数组的第一层属性/元素的值，若所有值相同，则判定为“未变化”，跳过重新渲染。

如果对reducer状态值有计算，可以使用**`createSelector`**

**createSelector作用**

- **缓存输入和输出**：记录上一次的输入参数和计算结果。

- **参数未变化时直接返回缓存结果**：跳过重复计算。

- **参数变化时重新计算**：更新缓存。

## 11、react的模块化与组件化

React 的 **模块化** 通过拆分代码逻辑（如工具函数、API 服务）实现功能复用和高效维护，而 **组件化** 将界面拆分为独立、可复用的 UI 单元（如按钮、表单），通过状态隔离和组合模式提升开发效率。二者结合形成了高内聚低耦合的架构，优势在于**逻辑复用性高**（如自定义 Hook）、**协作便捷**（并行开发）、**维护性强**（修改独立模块不影响整体），同时支持动态加载优化性能，适用于从简单页面到复杂应用的灵活构建，是 React 高效开发的核心设计理念。

## 12、数据路由

##### 一、核心 API 作用

1. **`createBrowserRouter`** 创建一个基于 HTML5 History API 的路由实例，支持数据加载、路由嵌套等特性。

- 参数：路由配置数组（定义路径、组件、数据加载逻辑等）。

- 返回：路由对象（传递给 `RouterProvider`）。

1. **`RouterProvider`** 将路由实例注入 React 应用，替代传统的 `<BrowserRouter>` 包裹方式。

- 参数：`router`（由 `createBrowserRouter` 创建的路由对象）。

##### 二、用法

**定义路由表**

```Plain Text

// src/routes.js

import { createBrowserRouter } from "react-router-dom";

import Home from "./pages/Home";

import Login from "./pages/Login";

import ErrorPage from "./pages/ErrorPage";



// 定义路由配置

const router = createBrowserRouter([

  {

    path: "/",

    element: <Home />,       // 直接渲染组件

    errorElement: <ErrorPage />, // 全局错误边界

  },

  {

    path: "/login",

    element: <Login />,

    // 可添加数据加载或 Action

    loader: () => fetchUserData(), // 预加载数据

  },

  {

    path: "/user/:userId",

    element: <UserProfile />,

    loader: ({ params }) => fetchUser(params.userId), // 动态参数加载

  },

]);



export default router;

```

**注入路由到应用**

```Plain Text

// src/main.jsx

import React from "react";

import ReactDOM from "react-dom/client";

import { RouterProvider } from "react-router-dom";

import router from "./routes";



ReactDOM.createRoot(document.getElementById("root")).render(

  <React.StrictMode>

    <RouterProvider router={router} />

  </React.StrictMode>

);

```

##### 三、高级功能实现

1. **数据加载（Data Loading）**

通过 `loader` 函数预加载路由所需数据：

以下是一个典型的数据加载流程：

1. **用户触发导航**（如点击链接 `/user/123`）。

2. React Router **挂起当前 UI**，显示 `Suspense` 的 `fallback`（若有）。

3. **执行目标路由的 `loader` 函数**，获取数据。

4. **数据加载完成后**，渲染目标路由的组件，并将数据通过 `useLoaderData` 传递给组件。

5. 若 `loader` **加载失败**，渲染 `errorElement` 组件。

在项目中未使用，因为希望从redux中通过createAsyncThunk获取各项数据。

```Plain Text

// 路由配置

{







# 1、**<font style="color:rgb(15, 17, 21);">心居甄选</font>**项目介绍
（1）<font style="color:rgb(15, 17, 21);">心居甄选</font>·酒店民宿甄选平台

宅宿甄选平台致力于解决旅游或商务出行人士的住宿选择问题。项目集成了多家住宿平台优质酒店民宿资源，在项目首页中用户可以选择目的城市，然后通过热门、低价、高分等模块向用户展示该城市的优质房源。用户在首页点击更多房源链接，就可以跳转到全部房源页面。这个页面向用户推荐目的城市的海量房源，通过**WebSocket**实现AI助手功能，帮助用户推荐合适的房源，依靠**模糊查询**结合**防抖函数**给用户提供搜索功能，并尝试使用了**React19新API useActionState**优化表单提交过程。还拥有对价格和评分的排序功能。在全部房源页面点击任意一个房源，就可以进入该房源的详情页面。页面中集成了该房源在多家住宿平台的详细信息，如图片、价格、评分、热门评论等。在具体页面中，项目封装了**PictureBrowser**组件，为用户提供了沉浸浏览房源图片的功能。用户如果有心仪的酒店，就可以点击链接跳转到合适的平台进行购买。项目中使用了**路由懒加载**、**图片懒加载**、**React.memo**等方式进行性能优化，大幅提升首屏加载速度。项目使用**axios**进行前后端数据交互，并对axios进行了**二次封装**。未来项目希望结合**媒体查询与rem和Flex布局**实现**响应式布局**。

## **1、虚拟列表+懒加载**
### （1）简单介绍
在项目的全部房源页面中，会向用户展示目的城市的**海量房源**。如果一次性将这些房源全部渲染出来，可能会导致加载时间过长，房源dom元素过多导致页面卡顿等**性能问题**，所以考虑使用虚拟列表+懒加载实现。

一开始是单纯使用的懒加载，当用户滑动到**靠近列表底部**时，就重新向后端**请求新的数据**并**添加到列表**中再**重新渲染到页面**上。这样由于开始页面中的房源dom很少，所以能够大幅减少首屏加载时间。但如果用户一直向下滑，加到页面中的房源**dom会越来越多**，最后还是会降低性能，造成页面卡顿等等。

所以后来考虑使用虚拟列表+懒加载的方式，同样是接近列表底部请求，区别在于虚拟列表只渲染数据列表中**当前页面以及附近两页**的房源dom，不论列表中有多少数据，都只渲染**有限的一部分**，所以可以避免页面卡顿等性能问题。多渲染两页dom，可避免滑动过快还未渲染，出现白屏。

### （2）具体如何实现的虚拟列表
1、设置**开始索引**和**结束索引**，代表列表**开始渲染的位置**和**结束渲染的位置**。设置**预留两屏的item数**（容器可视高度除以item高度乘五（一行有五列）），然后通过**已划过距离scrollTop**除以单个房源item高度再乘五就是已划过的item数，再减去预留数，得到开始索引，默认是0（通过Math.max(0,上边的操作)）。通过已划过距离scrollTop加上可视区域高度offsetHeigh以单个房源item高度再乘五，再加上预留数，得到结束索引。

2、通过**slice截取到数据列表**中的从开始索引到结束从索引的部分，在页面中进行渲染。

3、还需要计算通过开始和结束索引计算**顶部块**和**底部块**（如果结束索引比列表还长就是0）的高度，用来**撑开进度条**

4、如果划到了靠近列表底部（总高度scrollHeight-已划过距离scrollTop-容器可视高度<距离阈值），就触发请求函数，重新向后端请求数据并加到列表后边

### （3）为什么使用节流函数，起到什么作用
滚轮滚动可能会触发多次滚动事件，造成不必要的性能消耗，快速滚动也可能造成白屏问题。所以考虑采用节流函数来减少滚动触发的次数。

一开始采用的是防抖函数，防抖函数的作用就是短时间内触发多次事件，只执行最后一次，可以有效减少滚动触发的次数。但是在实际操作时出现问题，如果快速滑动滑轮，会导致房源item未渲染出来，页面出现白屏。分析后发现是由于滚动时页面会向下划，但由于速度过快，未达到防抖函数要求的时间，所以防抖函数并未执行，页面未重新渲染，导致白屏问题。

随后改用节流函数，节流函数的作用是触发一次在短时间内就不再次触发，从而既有效减少了滚动触发的次数，由于每次都会成功执行节流函数，也实现了及时渲染，从而顺利解决了白屏问题。

### **（4）如何优化快速滚动时的白屏问题？**
**考察点**：性能优化经验 **解答**：

28. **节流渲染**：使用 **节流函数** 控制滚动事件触发频率。
29. **占位符**：图片未加载时用**骨架屏**填充，提高用户体验。

  骨架屏方案，通过isPending判断是否处于请求中，返回为pending就渲染骨架屏，请求结束就渲染请求到的图片

30. **加载符**：如果滑倒列表底部请求新数据还未返回，同样是通过pending来判断，渲染`加载中...`的盒子，请求结束就渲染新item

### （5）使用**Intersection Observer**
**Intersection Observer** 方案优势：

+ 原生API，简化可视区域判断逻辑。
+ 自动检测，减少手动计算误差。

**局限性**：

+ 兼容性问题（部分旧浏览器不支持）。
+ 大量元素监听时性能开销较大（需配合虚拟列表减少节点数量）。

**结论**：结合两者，用虚拟列表控制DOM数量，用Intersection Observer实现了图片懒加载细节。

### **（6） 如何处理动态高度的元素（如高度不固定的图片或文本）？**
**考察点**：复杂场景的解决方案 **解答**： 动态高度需实时测量并缓存，常用方案：

31. **预估高度+惰性测量**：初始用预估高度渲染，元素进入可视区域后测量实际高度，更新缓存并调整布局。
32. **位置缓存表**：维护一个 `positions` 数组记录每个元素的真实高度和偏移量，重新计算后续元素的位置。
33. **ResizeObserver API**：监听元素尺寸变化，动态更新缓存。

**优化**：对已测量的元素跳过重复计算，使用二分查找快速定位滚动位置。

### **（7）如果列表项包含复杂组件（如视频），需要注意什么？**
**考察点**：实际应用细节 **解答**：

34. **组件销毁**：离开可视区域时销毁视频播放器，释放内存。
35. **状态保存**：使用 `keep-alive` 或缓存组件状态（如播放进度）。
36. **懒加载分级**：先加载轻量内容（如缩略图），用户交互后再加载完整资源。
37. **性能监控**：确保单个复杂组件不影响整体滚动性能。

### **（8） 如何测试虚拟列表+懒加载的准确性和性能？**
**考察点**：质量保障意识 **解答**： **准确性测试**：

+ 快照比对：确保不同滚动位置渲染内容正确。
+ 交叉验证：手动滚动到特定位置，检查渲染数据与预期一致。

**性能测试**：

+ **Chrome DevTools**：通过Performance面板分析FPS、布局重绘（Layout Thrashing）。
+ **内存占用**：Memory面板检查是否存在内存泄漏（如未销毁的DOM节点）。
+ **大数据压测**：渲染10万条数据，监控滚动流畅度（FPS≥50）。

**自动化工具**：

+ Puppeteer模拟滚动并截图对比。
+ Lighthouse生成性能报告。

## 2、websocket通信
### （1）简单介绍
在宅宿甄选项目的详情页中，用户可以向AI助手提出自己对于房源的条件和需求，AI助手会根据用户的需求在自己的知识库中查找，返回合适的选择，这样就实现了AI助手推荐的功能。实现这个功能主要使用到了 WebSocket 进行前后端的双向即时通信。

### （2）websocket连接建立的大致过程（理论）
客户端会先通过一次普通的 HTTP 请求告知服务器“我想把这条连接升级到 WebSocket”，并附带一个用于安全校验的随机值；服务器收到后进行验证并以特殊回应表示同意升级，此时原本的 TCP 连接就从 HTTP 切换到 WebSocket，随后双方即可在同一条持久化连接上进行双向实时通信。

### （3）项目中websocket的大致流程（项目）
#### 1、建立连接
当打开页面后，就会开启对话，建立一个新的websocket连接，过程是：

+ 关闭已有连接并清空心跳机制，防止资源泄漏和重复连接。如果是新消息没有会话id就生成一个
+ new websocket初始化一个新的websocket连接（通过ref保存 ref.current来注册事件监听），其中地址是参数化拼接的，包括基础URL，用户id、会话id、角色id、模型id等参数，保证每个连接的唯一性和安全性。
+ 注册open message close error事件监听器，为后续消息收发和异常处理做准备
+ 当打开新对话或切换到历史对话都会触发**open事件**，如果是新对话，通过send向后端发送一条“初始化对话”的消息，后端会在数据库中为该用户新建一条会话记录（ChatItem），并返回一个**对话已创建**的消息。并建立新的心跳机制(初始化消息如果问起详情)包括
    - type: "chat"：表示这是一次聊天消息（但content为空，属于初始化）。
    - content: ""：内容为空，说明不是用户主动输入，而是系统初始化。
    - 其它如 chatId、roleId、modelId等，都是会话的元信息。
    - imageUrls: []：没有图片。
    - useNetwork、useLocalRag：是否联网、是否用本地知识库。

#### 2、如果问起上边这些id如何获取
基础URL通过getURL函数获取，window.location.hostname得到网站的url

用户id通过getSession函数获取，会从localStorage找有没有session，如果没有就通过定义好的**randString**方法生成一个（问起的话，生成方法就是从0-9和a-z中随机通过for循环结合Math.random随机取值获得一个session）

会话id是如果是历史会话则已经存在，直接拼接；如果是新对话则不存在，通过uuid库的方法重新生成一个

角色id和模型id都是确定好的，因为在这两个页面中的角色和模型都是固定的。

#### 3、websocket接收消息
**消息的接收通过监听message事件进行处理**，返回的**event**点**data**里存在消息type用来区分消息类型，根据type判断不同的返回的消息类型并进行不同的处理。（心跳检测、用户输入、AI回复分阶段等）。分阶段推送消息分片，实现ai回复的流式输出。

+ 如果类型是心跳检测就直接跳过消息处理，
+ 如果类型是用户输入代表后端将用户输入发送回来进行回显，前端存储消息数组是**chatData**，给chatData追加一个新消息对象，包括id 类型prompt 和用户输入内容content，随后渲染到页面上。不过回显后来不再使用了，改为用户点击发送后直接从前端将新的消息对象追加到chatData数组中。这是因为回显操作虽能保证前后端数据一致，但当前后端通信出现问题时，前端用户收不到后端返回的回显，连自己输入的内容都无法出现再页面上。改为从前端直接追加，当出现网络问题时至少能显示出用户的输入，体验好一些。
+ 如果类型是对话已创建，就通过get获取由新对话的历史会话列表，链接由用户id和角色id决定。这里未进行更改，因为历史会话列表希望追求前后端一致性，所以等接收到后端返回的对话已创建的消息后再对chatData进行更新并渲染。剩下的是ai回复的输出部分，与ai输出有关的有**start**、**chat**、**end**三种类型。前端存储消息数组**chatData**，当类型为**start**时，代表AI 开始输出，往chatData中push一个**新的消息对象**准备**接收输出内容**，对象包括新消息的**id**（后端传过来的）、**内容**（空字符串）和消息**类型**（reply），并禁用发送按钮和重新生成按钮，启用停止生成按钮。当类型为**chat**时，代表AI正在**输出内容的分片**，将这个内容分片**追加**到当前消息对象（通过id确定）的内容里并重新渲染到页面上。当类型为end时，代表这个消息的结束，启用发送按钮和重新生成按钮，禁用停止生成按钮。

#### 4、websocket发送消息
发送消息会触发sendMessage函数，先判断ai是否正在回答或发送内容是否为空（prompt.value.trim.length）。如果没问题，一是将用户输入的内容作为新的消息对象push到chatData中，包括id（前端randString生成的），类型prompt，用户输入内容content。然后通过send事件将消息对象发送给后端，里边包含（用户输入的内容，消息类型，会话id模型id和角色id，上传图片的URL，是否使用联网搜索和数据库等）。

#### 5、关闭连接
当退出登录，关闭页面，切换对话等操作都会关闭连接，通过触发close事件实现。并将心跳检测清空。在ai正在生成回复的时候，如果用户**点击停止按钮**，或者是**切换到其他会话**，都会**停止**当前进行的流式输出。具体来讲，项目通过状态变量来控制**是否正在渲染**，在**message**事件中对其进行判断，如果为false就直接结束事件，**不再执行**接下来的渲染过程。当点击停止按钮或切换其他对话时，就会调用**停止函数**，将状态变量设置为false，并向后端通过**webSocket.send**发送**停止生成**的信号，信号类型为stop并包含当前消息id，然后通过**webSocket.close**关闭通信。后端接收到停止生成信息后，立即发送给大模型服务器，让大模型停止继续生成。从而实现了流式输出的停止。

#### 6、错误重连
当连接发生错误时会触发error事件，前端会尝试进行重连。具体的过程是，先再外部确定好最大重连次数5次，重连间隔时间3秒；并定义连接次数。每次创建websocket连接时，在open事件触发时都会重置连接次数。如果发生错误时，达到重连间隔时间就会重新调用连接函数，并将重连次数+1。到最后如果重连次数超过最大重连连接次数就不再继续尝试，触发close事件关闭websocket连接，并给用户弹出错误信息。

```plain
let socket = null;
let reconnectTimer = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000; // 3秒

function connect() {
  // ...参数拼接略
  socket = new WebSocket(wsUrl);

  socket.addEventListener("open", () => {
    console.log("WebSocket连接已打开");
    reconnectAttempts = 0; // 重置重连次数
    // 启动心跳、注册消息监听等
  });

  socket.addEventListener("message", onMessage);

  socket.addEventListener("close", () => {
    // 这里一般不自动重连，除非你想支持“意外断开”场景
    // 可以根据业务需求判断是否需要重连
  });

  socket.addEventListener("error", (error) => {
    console.error("WebSocket连接错误:", error);
    // 避免多次重连
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      reconnectTimer = setTimeout(() => {
        console.log(`WebSocket重连第${reconnectAttempts}次...`);
        connect();
      }, RECONNECT_INTERVAL);
    } else {
      console.error("WebSocket重连失败，已达最大次数");
      // 可以提示用户“网络异常，请刷新页面”
    }
  });
}
```

#### 7、心跳检测

在项目中，每30秒通过send发送一条{ type: "heartbeat", content: "ping" }的消息到后端，并记录一个“等待回应”的状态。后端接收到后，也会返回一个心跳检测的消息{ type: "heartbeat", content: "pong" }代表心跳检测，前端清除“等待回应”状态。如果下次发送心跳包时，上一次的回应还没收到，即仍然处于等待回应状态，就认为连接异常，可以主动关闭WebSocket并触发重连。

在连接成功时启动心跳检测，定时发送心跳消息。在连接断开或发生错误时停止心跳检测。

```plain
let socket = null;
let heartbeatInterval = null;   // 心跳定时器
let waitingHeartbeat = false;   // 是否在等待心跳回应
const HEARTBEAT_INTERVAL = 30000; // 30秒发送一次心跳

function connect() {
  socket = new WebSocket("ws://yourserver/ws");

  socket.addEventListener("open", () => {
    console.log("WebSocket已连接");
    startHeartbeat();
  });

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "heartbeat") {
      // 收到心跳回应
      waitingHeartbeat = false;
      // 你可以在这里做一些连接状态的UI提示
    } else {
      // 处理其他类型消息
    }
  });

  socket.addEventListener("close", () => {
    stopHeartbeat();
  });

  socket.addEventListener("error", (error) => {
    stopHeartbeat();
  });
}

function startHeartbeat() {
  stopHeartbeat(); // 防止重复定时
  heartbeatInterval = setInterval(() => {
    if (waitingHeartbeat) {
      // 上一次心跳还没回应，说明连接异常
      socket.close(); // 触发close事件，自动重连
      return;
    }
    // 发送心跳包
    waitingHeartbeat = true;
    socket.send(JSON.stringify({ type: "heartbeat", content: "ping" }));
  }, HEARTBEAT_INTERVAL);
}

function stopHeartbeat() {
  clearInterval(heartbeatInterval);
  waitingHeartbeat = false;
}

// 启动连接
connect();
```

**为何选择前端发ping后端发pong？**

1、**客户端主导监测**：只要后端不返回 `pong`，前端就能立即做出重连判断，能够恢复连接。主导权掌握在自己手里。

2、项目规范，在之前的项目中有使用到心跳检测都是前端发ping后端发pong

**如何通过后端发ping而前端发pong**

**流程示例**

1. **后端** 每隔固定时间（比如 30 秒）主动向所有已连接的 WebSocket 客户端广播一条心跳消息：

```plain
{ "type": "heartbeat", "content": "ping" }
```

1. **前端** 一旦收到这条 `{ type: "heartbeat", content: "ping" }`，马上返回：

```plain
{ "type: "heartbeat", "content": "pong" }
```

1. **后端** 在发送 `ping` 后，给自己打个“已发送心跳，还在等待 pong”标记；如果在下次期望收到 pong 的时限（比如 5 秒内）没收到前端回来的 `pong`，就默认客户端掉线／断网，直接把 WebSocket 关掉或标记为“失效”，并决定要不要在后端层面进行重连或通知上游逻辑。

### （4）自定义的消息格式是怎样的?

发送消息格式

```plain
socket.current.send(
    JSON.stringify({
      type: "chat", // 消息类型
      content: content, // 消息内容
      chatId: curChatInfo.value.chatId, // 会话id
      roleId: roleId.value, // 使用的角色id
      modelId: modelId.value, // 使用的模型id
      imageUrls: imageUrls, // 图片URL数组
      useNetwork: isUseNetwork.value, // 是否使用联网搜索
      useLocalRag: isUseLocalRag.value, // 是否使用本地知识库
    })
  );
```

返回消息格式

```plain
type // 消息类型
text // 消息内容
chatId // 消息id
roleId // 使用的角色id
modelId // 使用的模型id
```

### （5）轮询、长轮询和websocket的对比

#### 1. 基本原理

**1.1 轮询（Polling）**

- **原理**：客户端以固定的时间间隔（如每隔 1 秒或 5 秒）向服务器发送一次 HTTP 请求，询问服务器是否有新数据。如果服务器有新数据，则在响应中返回；否则返回空或状态标示客户端继续下一次轮询。
- **连接方式**：一个独立的短链接（HTTP 请求-响应）完成一次查询后即断开，下次查询时重新建立连接。

**1.2 长轮询（Long Polling）**

- **原理**：客户端向服务器发起一次 HTTP 请求，如果服务器端暂时没有新数据则保持此请求（不立即返回），直到有新数据可用时才返回响应；客户端收到数据后立即发起下一次长轮询请求，如此循环。相当于“服务端先等数据准备好再回复，客户端收到后马上重连”。
- **连接方式**：与轮询类似，依旧是一次请求对应一次响应，但服务器可以“延迟”响应以减少空回应。每次响应后，客户端重新开启新的连接。

**1.3 WebSocket**

- **原理**：基于 HTTP/1.1 的一次“握手”升级（Upgrade）请求，将连接从 HTTP 协议切换到 WebSocket 协议；握手完成后，客户端与服务器之间建立起一个**持久双向**的 TCP 连接，双方可随时互发消息，无需再次建立 HTTP 请求。
- **连接方式**：一次握手后创建长连接，后续在同一连接上双向通信。

#### 2. 优缺点对比

**3.1 连接建立与开销**

- **轮询**：每次轮询都是一个完整的 HTTP 请求/响应周期（包括 TCP 建立三次握手、TLS 握手（若使用 HTTPS）、请求报头 + 响应报头等）。如果轮询间隔设置得很短（如 1 秒），会产生非常大的网络开销和服务器压力。
- **长轮询**：客户端发出一次请求后，如果服务器暂时没有可用数据，便“挂起”此请求并保持连接一段时间（通常服务端会设置超时时间，如 30 秒）。当出现新数据时立即响应，否则在超时后返回“没有数据”，然后客户端再发起新请求。这样能大大减少“空回应”的次数，但在数据空闲期仍会维持一定数量的长连接。
- **WebSocket**：通过一次 HTTP 握手，将连接升级为 WebSocket。之后无需多次握手，客户端与服务器之间在同一 TCP 连接中互发数据。省去了每次都建立连接和关闭连接的开销，只需传输很少的 WebSocket 报头，即可实现低开销的双向通信。

**3.2 实时性与延迟**

- **轮询**：实时性最差。假设轮询间隔为 5 秒，服务器在第 1 秒左右产生一条新消息，客户端要等到第 5 秒才能下一次请求拿到数据。平均延迟约为 `轮询间隔 / 2`。
- **长轮询**：实时性较好。服务器一有新消息就立即返回响应，客户端马上收到并处理，响应时间仅受网络往返的影响。缺点是客户端收到一次响应后，要重新发起新的 HTTP 请求才能继续“保持等待”状态，这中间会有极短暂的延迟（毫秒级）。
- **WebSocket**：实时性最好。客户端与服务器在同一连接里，任一方随时都能“推送”消息，网络往返延迟几乎与纯 TCP 消息传输相同，没有额外的重连耗时。

**3.3 服务器资源和并发**

- **轮询**：短连接模式，每次请求都创建、处理、关闭连接。若并发用户数高、轮询间隔短，将导致服务器频繁创建/销毁连接，造成 CPU 与内存压力，网络带宽浪费也很严重。
- **长轮询**：每个活跃客户端至少会有一个“挂起”的 HTTP 连接，即使在长时间没有新消息期间也占用一个 TCP 连接。相比轮询，减少了空回应次数，但当用户量极大时也可能出现大量长连接，需要服务器以“异步非阻塞”或“事件驱动”的方式进行优化，防止线程/进程数爆炸。
- **WebSocket**：与长轮询类似，保持着持久 TCP 连接。不同的是，不仅能接收数据，也能主动向客户端推送。服务器需要维护这些持久连接的状态（如每个连接对应的会话、心跳检测等），如果使用不当（如线程模型不合理），并发量大时同样会出现瓶颈。但由于协议层面更加轻量（没有 HTTP 报头的开销），整体吞吐通常更高，更适合持续双向通信。

### （6）webSocket和sse对比

#### 1. 通信方向

- **WebSocket**：双向（full‑duplex），客户端和服务端可以随时相互推送消息，无需重新建立连接。

- **SSE（Server‑Sent Events）**：单向，只能从服务端向客户端推送数据，客户端若要发送消息，必须另起 HTTP 请求（如 POST）。

#### 2. 延迟与效率

- **WebSocket**：一次握手后保持 TCP 连接，消息帧头开销小，适合高频、低延迟交互。

- **SSE**：基于 HTTP 长连接，消息以文本流方式输送，每条消息带有一定格式开销，且在 HTTP/2 下可能受“队头阻塞”影响。

#### 3. 实现复杂度

- **SSE**：客户端原生支持 `EventSource`，自动重连简单易用；服务端实现也较轻量。

- **WebSocket**：需处理握手、心跳、断线重连等逻辑，实现复杂度略高。

#### 4、为什么在项目中前端和后端之间使用webSocket，而后端和大模型端使用sse，这样的好处是什么

1. **端到端低延迟的流式体验**

- 后端直接对接大模型的 `text/event-stream`，一有新 token 就马上拿到并透传，不用等完整响应。

- WebSocket 长连接在前端随时可推，实现“用户输入 → 模型输出”几乎无缝的流水线感。

1. **职责分离，协议各司其职**

- **SSE**（`text/event-stream`）天然适合后端与模型 API 这种“服务端→服务端”单向、高并发的流式推送，简单可靠。

- **WebSocket** 则更擅长“服务端←→客户端”双向交互，不仅可以推送模型消息，也可实时接收前端的控制指令（比如取消、修改参数、心跳等）。

1. **更灵活的错误处理与重连策略**

- 后端与模型 API 之间发生错误时，可以在这一层做重试等错误处理，和前端的 WebSocket 断线重连逻辑互不干扰。

- 前端也只需关心 WebSocket 的生命周期和重连策略，屏蔽了模型 API 端的细节。

1. **安全与认证边界清晰**

- 后端统一管理对大模型 API 的访问密钥、限额、审计日志等，避免将敏感凭证泄露到前端。

- 前端只需与后端建立 WebSocke，简化客户端安全设计。

1. **可观测性与监控**

- 在后端切面可以对 SSE 流量（如每秒 token 数、平均延迟）做精细监控。

- WebSocket 连接数、带宽、RTT 也可独立监控，从而快速定位是模型 API 侧瓶颈还是客户端网络问题。

1. **演进路径灵活**

- 日后若要支持其它流式源（自研模型、不同云厂商），只需要在后端适配新的 SSE 接口，前端无感知。

### （7）历史会话

#### （1）如何获取的历史会话列表数据？

在项目的websocket连接中监听的Message事件，返回的**event**点**data**里存在消息type，根据type判断不同的返回的消息类型并进行不同的处理。在打开页面后，会返回一个conversation_created的类型消息，这个消息代表已创建的历史会话。前端得到这个消息后，就向后端通过get获取历史会话列表，拿到后存储起来渲染到页面上。

#### （2）如何实现历史对话的切换？

在项目中，每个对话都有其对应的独一无二的会话id，通过会话id就可以判断是哪一段对话。切换历史对话时，会触发changeChat函数，将这一历史对话的id传进去。

在函数中

1、如果当前有正在进行的会话，先关闭掉websocket连接，清空心跳检测。然后清空存储当前多轮对话的chatData数组并重置当前对话信息，将其中的id改为历史会话的id

2、通过get将历史会话id传到后端，获取到对应历史会话的多轮消息，将这些新获取到的消息遍历存入chatData数组中，成为当前对话消息

3、将历史会话渲染到页面上，调用函数重新建立webSocket连接

在切换到历史对话后，用户可以接着就之前的话题进行问答。因为AI具有上下文记忆的功能（大模型端本身具有的功能，如果没有这个功能，可以由后端在向大模型发送用户消息时，带上之前几条的历史对话），所以可以无缝衔接，继续讨论之前的问题。

### （7）如果两个用户之间通过websocket进行聊天，中间有服务器，大致描述一下这个过程应该如何实现

用户A（浏览器） ⇄ WebSocket ⇄ 服务器 ⇄ WebSocket ⇄ 用户B（浏览器）

实现步骤（概述）

#### 1️⃣ 客户端连接 WebSocket 服务器

用户A 和 用户B 都通过 WebSocket 建立连接，new一个WebSocket，链接是服务器：

```plain
const socket = new WebSocket('ws://your-server.com');
```

当连接建立后，可以open事件监听连接状态：

```plain
socket.onopen = () => {
  console.log('Connected to server');
};
```

#### 2️⃣ 客户端发送消息

用户A 发出消息给用户B，通过send发送：

```plain
socket.send(JSON.stringify({
  type: 'chat',
  to: 'userB-id',
  from: 'userA-id',
  content: '你好！'
}));
```

#### 3️⃣ 服务器接收并转发消息

服务器通监听message事件，接收到用户A的消息后，查找用户B对应的 WebSocket 连接，然后将通过send消息转发过去。

伪代码如下（Node.js 示例）：

```plain
const clients = new Map(); // userId -> WebSocket

wsServer.on('connection', (socket) => {
  socket.on('message', (raw) => {
    const msg = JSON.parse(raw);
    const toUserSocket = clients.get(msg.to);
    if (toUserSocket) {
      toUserSocket.send(JSON.stringify({
        from: msg.from,
        content: msg.content
      }));
    }
  });
});
```

#### 4️⃣ 接收方收到消息并展示

用户B 的前端同样通过message事件监听 WebSocket 消息：

```plain
socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  displayMessage(msg.from, msg.content);
};
```

### （8）axios二次封装

#### 为什么要对axios进行二次封装？

对 Axios 的二次封装主要是为了**统一管理网络请求逻辑**，通过拦截器**全局处理错误提示**、**Token 鉴权**、**处理参数格式**等，减少重复代码；同时规范数据响应结构（如自动提取嵌套数据），**简化api（如get，post）调用方式**（如统一设置参数，统一返回 `[err, data]` 格式），并支持扩展缓存、重试等定制功能，最终提升代码复用性、维护性及项目协作效率。

#### 项目中进行了哪些封装？

**1. 基础配置**

- 动态获取后端 API 域名

设置 getBaseURL() 方法，根据当前前端页面的域名自动切换对应的后端 API 地址，方便在不同环境（如测试、生产）下自动适配。

- axios 全局配置

设置了请求超时时间、基础 URL、跨域携带 cookie、默认请求头（如 Content-Type、Authorization、Chat-Token 等）。

**2. 动态请求头处理**

- 设置 getDynamicHeaderData() 方法，动态获取用户的 token、sessionId 等信息，并在每次请求时自动加到请求头里，保证接口安全和用户身份校验。

**1、对get和post这些api进行了封装**

以get api为例，封装了一个新的get函数来获取各项数据，里边调用axios.get(url, params)方法，参数是请求路径url和和要查询的查询参数params。在then中处理请求结果，通过res.data获取到数据。获取成功就用resolve返回数据。请求失败通过catch接到，用rejected返回一个error。

post情况也类似，调用axios.post方法，传入请求数据与URL，在then中处理数据并返回，在catch中处理错误并返回

**2、对请求拦截器进行了封装**

请求拦截器是通过`axios.interceptors.request.use`，对config赋值实现，每次请求前调用getDynamicHeaderData()方法，自动添加动态请求头。

**3、对响应拦截器进行了封装**

对后端返回的数据进行统一处理，只有 code === 0（即请求成功）时才返回数据，否则抛出错误，方便前端统一处理异常。

## 3、模糊查询 多条件精准查询 useActionState 排序 防抖函数

#### 简单介绍

**（1）搜索功能**

在项目的全部房源页面中，有着搜索功能，可以在输入框中输入想要查询的字符串，点击搜索按钮后就可以匹配到标题中有相应字符串的房源渲染在页面上，这个过程通过模糊查询实现。在搜索框输入时还会有一个下拉菜单，可以根据输入值实时显示匹配到的前五条房源标题，也是应用到了模糊查询，同时还做了防抖处理，防止高频输入造成多次渲染的性能问题。

**（2）条件筛选功能**

在项目的全部房源页面中，有条件筛选功能，可以根据人数、价格、位置条件来筛选房源。通过多条件精准查询来实现这一功能。

### （1）模糊查询简单介绍

全部房源页面中有搜索功能，可以匹配并渲染出标题中有搜索字符串的房源item。搜索功能主要应用到了模糊查询。模糊查询的基本原理是对房源数据列表通过filter进行遍历，对每个遍历到的item取标题，通过includes判断标题中有没有要搜索的字符串，有返回的就是true，item添加到filter得到的新数组里边。搜索时还具有搜索建议功能，使用onChange根据表单的输入值，通过下拉菜单实时展示出通过模糊搜索匹配到前五条的房源标题。

### （2）多条件精准查询简单介绍

全部房源中页面中有筛选功能，可以按照人数，价格，位置条件对房源item进行筛选。条件筛选功能应用到了多条件精准查询，基本原理也是对房源数据列表通过filter进行遍历，对每个遍历到的item取到人数，价格，位置这些属性，与条件进行比较，再对比较结果进行短路判断，如果都返回true的才返回到filter新数组内（短路判断时将高淘汰率的条件（如位置）放在判断逻辑前端，快速跳过不符合项）。

### **（3）useActionState**的尝试使用

在全部房源页面的代码中，存在搜索框、人数、价格、位置等多个表单元素，需要通过**useState**设置**多个状态变量**来保存并操作这些表单的内容，比较繁琐。之后了解到react19新api `useActionState`的更新，可以更好地**控制表单的action状态**，无需多个状态变量，于是尝试使用在了项目内。

`const [state, action, isPending] = useActionState(fn, null)`

`useActionState`有两个参数，第一个是**处理表单提交内容的回调函数**，第二个是初始值。回调函数由两个参数**prevData**（之前的表单数据）和**formData**（现在的表单数据）。可以得到通过formData参数得到各个表单的内容，通过**formData.get('表单名')****就能得到相应表单的内容。在项目中我先得到各个表单的内容，再****传入筛选函数**（通过filter进行模糊查询和精准查询的函数），最终筛选后的数组**返回出去**。

`useActionState`有三个返回值，第一个返回值是执行回调函数后**返回的状态**，在项目中就是返回的**筛选后的新数组**。第二个就是返回值action函数，react19更新后form的action属性可以**绑定要执行的action函数**，绑定后表单就可以执行相应的函数（相当于给之前的onSubmit加上以后个handle什么什么)。第三个返回值是判断表单提交**状态的isPending**，为做到在action函数**执行时无法再次提交**，通过isPending判断**button按钮是否禁用**（添加disabled属性），如果函数中有异步网络请求，这个功能更加有用。

这几个表单元素都是提交后获得的，所以使用useActionState。

### （4）排序的实现

通过一个状态变量来保存是通过价格还是评分进行排序。然后向后端发送请求，过程中设置isPending状态变量处理请求状态，请求状态中渲染一个蒙层到页面上。不使用useActionState是因为希望一改变状态变量就请求，而useActionState是提交后才执行，所以不使用。

### （5）防抖函数

在搜索框输入时，会展示一个搜索建议的下拉表单，包含前五条根据当前搜索字符串匹配到的房源item的标题，通过onChange获取搜索字符串。为解决高频输入时的性能问题，通过防抖对函数进行包裹，只在最后一次触发后才执行，解决了问题。

### 问题1：为什么不通过后端实现

这个项目是和实验室后端的同学一同配合实现的，做到搜索和筛选功能呢时后端的同学已经出去实习了，没时间再做搜索和筛选的接口，所以退而求其次选择从前端实现。当然从后端实现肯定是更完美的方案，因为项目使用的是懒加载，所以数据列表中只有已经请求到的房源数据。将搜索字符串和条件都传到后端，再由后端从全部房源数据中进行筛选，肯定是更合适的。

### 问题2：**多条件筛选采用**`filter`**链式遍历，如何保证多条件组合查询的效率？**

1. **短路判断**：将高淘汰率的条件（如位置）放在判断逻辑前端，快速跳过不符合项
2. **条件变化监听**：仅当筛选条件变化时重新计算，避免重复执行。具体实现是通过回调函数的第一个参数prevData可以保存上一次的表单提交的内容，与本次进行对比，如果相同就直接返回上一次过滤后的数据即可。

### 问题3：**搜索建议如何实现？**

在输入框输入时，会触发搜索框的onChange事件，给事件绑定上了函数来设置状态变量并调用模糊查询，将前五条匹配到的房源标题渲染到下拉菜单里边。这个过程中使用了防抖函数来控制快速输入的情况。（不使用useActionState是因为不是提交而是实时改变，所以要用onChange）

### 问题4：**如何处理用户输入的特殊字符或SQL注入风险？**

1. **前端过滤**：对搜索输入进行清理（如移除`<script>`标签）

```plain
const cleanInput = input.replace(/[<>]/g, '') 
```

**2.使用CSP**

CSP 通过设置HTTP 响应头，**限制浏览器只能加载指定来源的资源**，从而防御 XSS 攻击和数据注入。主要防护能力包括：

- 阻止未经允许的内联脚本（`<script>`标签）
- 禁止加载外域恶意脚本
- 阻止未授权的资源加载（图片、字体等）
- 禁用危险的 `eval()` 等函数

### 问题5：如何控制下拉菜单的显隐

设置一个状态变量来控制，当光标位于搜索框时（通过onFocus）设置为true，点击到搜索框外部时（通过e.target.closest('盒子类名')得到点击的是哪个盒子）就设置为false，通过短路逻辑判断是否显示。

### 问题6：如果一个item里有多种类型房间怎么办

1、通过useSelector获取到数据列表

2、对数据列表进行map遍历，并对每个item通过filter对房间进行筛选，获得返回符合条件的房间的数组，并重新设置item对象，修改房间属性为新数组。

3、对数据列表进行一次filter遍历，将不符合条件的酒店item过滤出去（item.rooms.length需要大于0），并将过滤后的数据列表保存到redux中。

4、点击房源item时，通过过滤后的数据列表将房间信息传进去，保证只有符合条件的房间。

## 4、防抖与节流

防抖和节流的区别：防抖是事件高频触发结束后触发回调，节流则是在事件高频触发过程中就触发回调

### 一、防抖（Debounce）

- **防抖**：在事件被频繁触发时，只在 **最后一次触发** 后经过指定的等待时间才执行一次回调。依靠这个机制可以有效避免高频调用事件造成性能问题

- **常见场景**：输入框实时搜索、窗口 改变大小等。

---

实现防抖简单来讲就是将原函数进行包装，设置一个变量来存储定时器，并返回一个闭包函数，闭包函数里边里边是包着原函数的定时器以及判断逻辑。监听事件触发后会调用这个闭包函数，需要根据变量判断上一次的定时器是否还存在，如果依然存在就清除掉并给变量设置新的定时器。如果某一次达到事件间隔事件未被触发，定时器没有被清除，就执行定时器中的原函数。

- 如果问起怎么执行原函数：**注意 **`this`** 绑定**：如果原函数使用到了this，例如依赖对象的方法内的 `this.xxx`，为了保持原函数的调用上下文，我们使用 `fn.apply(this, args)`，同时能够实现立即执行。
- args指的是剩余参数，调用防抖函数时会传入参数，`args` 的作用就是**收集并传递**防抖函数被调用时的所有参数，保证原函数 `fn` 能拿到它们。

完整代码：

```plain
function debounce(fn, delay) {
  let timerId = null;
  
  return function(...args) {
    // 如果已有定时器，先清除
    if (timerId) {
      clearTimeout(timerId);
    }
    
    // 设置新的定时器
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
```

---

### 二、节流（Throttle）

#### **核心思想**

**固定时间间隔内只允许函数执行一次**。无论事件触发多频繁，执行频率都会被严格控制。

**实现思路**：**时间戳版**：每次触发时，用当前时间减去上次执行时间，若超过间隔则执行。

**定时器版**：第一次触发立即执行，然后在定时器运行期间屏蔽后续触发；定时器到期后才允许再执行。

**实现步骤**：时间戳版：1、在节流函数中初始化状态变量， 记录上一次函数执行的时间戳

2、**返回闭包函数**，用于替代原函数绑定到事件上。该包装函数内部可访问并更新上面声明的状态变量。

3、在**包装函数内部实现核心逻辑**，先通过Date.now()获取当前时间戳；然后判断 当前时间戳减去上一次时间戳是否大于要求的事件间隔。若满足则执行原函数并更新上一次时间戳为当前时间戳。

‘定时器版：1、在节流函数中初始化状态变量， 记录上一次函数执行的定时器

2、**返回闭包函数**，用于替代原函数绑定到事件上。该包装函数内部可访问并更新上面声明的状态变量。

3、**在包装函数内部实现核心逻辑**，如果状态变量有定时器，代表还没有达到时间间隔，直接 `return`（忽略本次触发）。如果没有，就代表已经达到时间间隔，执行原函数，并给状态变量设置新的定时器。

**使用场景**：页面滚动scroll事件控制，拖拽事件等

#### **代码实现（时间戳版）**已经实现了首次触发

```plain
function throttle(func, interval) {
  let lastExecTime = 0; // 闭包保存上次执行时间
  return function(...args) {
    const now = Date.now();
    if (now - lastExecTime >= interval) { // 时间间隔外触发则执行，首次lastExecTime为0，一定会触发
      func.apply(this, args); // 绑定this是为了外部调用节流函数时，this不丢失。如果直接调用func，相当于是全局调用了，this会变为window
      lastExecTime = now; // 更新时间戳
    }
  };
}
```

## 5、PictureBrowser组件

### 简单介绍

在房源的详情页面中，封装了一个PictureBrowser这么一个图片浏览器组件来帮助用户更好地浏览房源图片。点击**显示更多照片**后，就可以进入到图片浏览器。右上角是一个**叉号**，点击就可关闭图片浏览器。图片浏览器**中央是一张房源图片**，**左右两边是箭头**，点击箭头图片就会**向前或向后切换一张**。切换时通过**第三方库 react-transition-group**对图片**传入传出动画效果**进行优化。图片下方是**indicator图片指示器**，按顺序展示当前图片与附近的六张图片（一共七张，都是略缩图），其他图片都用阴影覆盖。点击箭头后，图片指示器也**跟着切换图片**。当前图片位于房源图片列表**首或尾**时，图片指示器**按照顺序切换位置**，位于图片列表**中间**时，切换的图片**始终位于图片指示器中间**。而**点击图片指示器**中的图片，中央展示的图片就**切换到相应图片**，图片指示器的切换遵循之前同样的逻辑。由于逻辑较复杂，所以又封装了一个indicator组件来实现这一功能。图片浏览器中还有一个选择指示器显示与否的按钮。以上就是图片浏览器的大致功能。

### 问题1：如何通过react-transition-group优化动画效果

1、通过状态变量保存点击的是左箭头还是右箭头，点击箭头就会触发函数进行设置，并将新图片重新渲染上去

2、通过react-transition-group中的CSSTransition组件将图片包裹，设置单一盒子的动画效果。

内部属性：in来控制动画触发与否，key确保多个组件切换时都有唯一标识，classNames设置类名，timeout设置动画时长

动画的样式：根据CSSTransition属性确定的类名决定，直接在`类名-enter/类名-exit`设置开始动画效果，`类名-enter-active/类名-exit-active`设置结束的动画效果，结束样式中要包括transition设置过程，如transition: all 200ms ease，代表动画效果200ms，先慢后快后慢。

3、使用SwitchTransition标签处理两个组件之间切换的过程。通过mode属性来控制切换方式，"out-in": 当前组件先退出，新的组件再进入。"in-out": 新的组件先进入，当前组件再退出。子组件必须使用 CSSTransition 或 Transition，并确保 key 属性唯一。

### 问题2：React Transition Group（RTG）相比原生 CSS 或 JavaScript 动画方法，在 React 生态中有以下核心优势

---

#### 1. **组件化生命周期管理**

RTG 提供 `Transition`、`CSSTransition`、`SwitchTransition` 等组件，**无缝集成 React 的生命周期**。

- 自动处理组件挂载（mount）和卸载（unmount）的时序问题。
- 原生方法需要手动用 `setTimeout` 或 `useEffect` 控制 DOM 元素的移除时机，容易导致动画未完成元素就被销毁的问题。

---

#### 2. **解决组件卸载动画难题**

原生 CSS 无法直接处理组件卸载时的动画（如元素消失的 `exit` 动画），因为 React 会立即移除 DOM 节点。

- RTG 通过**保留 DOM 节点直到动画完成**（如 `exiting` 状态结束后），确保退出动画能完整播放。

---

#### 3. **声明式 API 与状态驱动**

通过 `in` 属性控制动画状态（进入/退出），**状态变化自动触发动画流程**。

- 原生方法需要手动添加/移除 CSS 类或操作 DOM，代码冗余且易出错。
- 示例：通过 `in={isVisible}` 即可触发元素的进入/退出动画流程。

---

#### 4. **跨动画库兼容性**

RTG **不依赖具体动画实现**，可自由搭配 CSS、GSAP、Anime.js 或 React Spring。

- 原生 CSS 动画需硬编码 `@keyframes` 或类名，灵活性低。
- 示例：用 `CSSTransition` 直接绑定 CSS 类名，或用 `Transition` 结合 JS 动画库。

---

#### 5. **复杂场景简化**

- **路由切换动画**：通过 `SwitchTransition` 实现组件切换时的平滑过渡。

- **列表动画**：结合 `TransitionGroup` 管理动态列表项的增删动画，避免手动跟踪每个元素的 key 和状态。

### 问题3：**Indicator 的滚动策略如何实现**

滚动策略的核心是 **视口居中算法**

1、所有图片都放在一个盒子的内容中，盒子展示区宽度固定，改变的其实是盒子内容的位置，默认图片从第一个开始，盒子所以在最右边。

2、图片切换后，得到新图片的索引，从而获取到图片对应的宽度clientWidth和离左侧父盒子边缘距离offsetLeft。

3、获取到盒子显示区的长度和内容长度，通过**左侧距离+盒子本身宽度*0.5-显示宽度**计算出距离，得到要盒子要移动到的位置，从而使得当前图片居中

4、如果位于头部，计算出距离会小于零，这种情况就不移动盒子。同理如果位于尾部，计算出距离会超过盒子内容宽度，同样也不移动盒子

## 6、前端优化方法

**项目中如何判断首屏加载时间的？**

我是根据开发者面板中的Lighthouse的LCP这项数据指标来判断的，LCP 衡量的是视口中**最大可见内容元素**渲染完成的时间，是最能反映用户感知到“首屏主要内容已加载”的指标。

**如何通过路由懒加载和图片懒加载改善首屏加载时间？**

- 懒加载把不同路由的代码拆成多个块，初始页面只下载首屏需要的 chunk，**减小首包体积** ⇒ 浏览器下载/解析/执行 JS 的时间减少，**主线程更快空闲**，渲染更快（LCP 可能更早）。
- 如果首屏被大量 JS 阻塞（解析/执行），把当前路由内不必要的逻辑延后加载能明显改善首屏感知速度。
- 另外对于图片懒加载，如果页面中存在大量图片，通过图片懒加载将视口外的图片延后加载，可以减少网络请求和主线程渲染操作，也可以缩短首屏渲染时间

### 1、路由懒加载

**传统问题**：所有路由组件打包到单一JS文件，导致首屏加载缓慢，

**作用**：通过路由懒加载将应用拆分为按路由分割的代码块，初始仅加载核心框架，仅在用户导航到对应路由时才会加载相应资源，可以减少初始加载体积，大幅提高首屏加载速度。

**如何使用**：在react中，通过lazy实现懒加载。用Lazy将一个导入组件的箭头函数包裹起来，用Suspense组件来处理路由导入过程中的加载过程，如果请求状态是pending就通过fallback属性来渲染加载过程中显示的内容，在我的项目中是在路由切换过程中显示一个白色透明蒙层。

**底层原理**：实现路由懒加载的底层原理主要依赖于**代码分割**与**动态加载**技术，其核心思路是把整个应用拆分为多个独立的代码块（chunk），只有在用户真正访问某个路由时才加载对应的代码，从而减小初始加载包的体积，加快首屏渲染速度。下面是具体的原理和步骤：

1. **代码分割** 使用打包工具（如 Webpack、Rollup 等）将应用按路由或功能模块拆分成多个独立的代码块。这样每个路由对应的组件和依赖会被打包到单独的文件中。
2. **动态导入（Dynamic Import）** 利用 JavaScript 的 `import()` 函数实现动态加载。例如，当用户导航到某个路由时，路由配置中会触发动态导入操作，返回一个 Promise，等待模块加载完成后再进行渲染。
3. **缓存机制** 一旦动态加载成功，对应的代码块会被缓存（通常浏览器层面已经缓存该文件），避免重复请求，提高用户体验。

### 2、图片懒加载

**简单介绍**：

在全部房源页面里，存在大量带图片的房源item，如果直接加载所有图片，肯定会造成性能问题，给用户带来较差体验，所以采用图片懒加载的方式。

**实现过程**：

房源 Item 组件中，整体房源信息（如标题、价格和加入购物车按钮）直接渲染，而房源图片则交由 LazyImage 组件处理，从而实现按需加载图片，提高页面加载效率。

LazyImage 组件内部使用了 React 的 **hooks**（useState、useEffect 和 useRef）来管理**图片加载状态**。组件首先通过 **useRef** 获取图片 **DOM 元素**，并用 useState 管理图片**是否加载完成（isLoaded）****和图片****是否加载失败**（**hasError**）的状态。核心部分是利用 **Intersection Observer** API 监听图片元素是否**进入视口**。开始时为所有图片元素加上观察，当检测到图片元素的**可见度超过设定的阈值**（threshold 0.1）时（即进入视口），就会将图片的datasrc中的图片地址赋值到src中，从而加载图片，并结束观察。如果图片加载成功，触发img元素onLoaded事件，更新加载状态为true，让真正的图片得以显示；如果加载失败，则触犯onError事件，将错误状态置为 true，并展示相应的错误提示。

在图片加载未完成的期间，组件使用 **antd** 的 Skeleton.Image 显示**骨架屏**，作为占位效果，以提升用户体验。只有当图片加载成功时，真实的图片才会被展示，并且通过 CSS 样式设置为覆盖整个容器，同时保证了图片自适应布局。通过这种设计，不仅有效地降低了页面初始加载的压力，也能在加载过程中提供良好的视觉反馈和错误处理。

#### 路由懒加载和图片懒加载做了哪些指标的提升

**路由懒加载**主要提升的是首屏相关指标。  
 它把当前不需要的页面代码拆出去，减少首包 JS 体积，所以通常会改善 **FCP / LCP / TTI / TBT** 这类指标。原理是：初次进入时只加载当前路由所需代码，减少浏览器的下载、解析、编译、执行成本，也减少主线程阻塞。对 SPA 来说，这个收益通常很明显。

**图片懒加载**主要提升的是首屏网络和渲染压力相关指标。  
 它的核心是让视口外的图片先不加载，减少首屏请求数和带宽占用，通常会改善 **FCP**，有时也会间接改善 **LCP**、**INP**。原理是：浏览器先只加载当前可见区域的图片，避免大量图片同时请求、解码和占用主线程资源。  
 不过要注意，**如果把首屏大图也懒加载了，反而会变差**，尤其会拖累 **LCP**，因为 LCP 本来就是看最大内容元素什么时候出现。

#### 使用**Intersection Observer** 的好处是什么？

- **作用**：监听目标元素与父容器（或视口）的**交叉状态变化**（如元素进入/离开视口）。

- **优势**：
  - **高性能**：异步回调，**避免频繁触发** `scroll` 事件。
  - **灵活**：可配置触发交叉的**阈值**（threshold），触发的**范围**和监听的根容器。
  - **自动管理**：**无需手动计算元素位置**。

**对比传统方案**

| **场景** | **传统方案（scroll + getBoundingClientRect）** | **Intersection Observer** |
| --- | --- | --- |
| **性能影响** | 频繁触发强制布局，导致性能抖动 | 无强制布局，异步批量处理 |
| **代码复杂度** | 需手动管理监听、防抖、计算逻辑 | 声明式 API，自动管理 |
| **精确度** | 依赖手动计算，可能误差 | 浏览器原生计算，精确到像素 |
| **动态内容支持** | 需手动跟踪新增元素 | 自动观察新注册元素 |

#### Intersection Observer的底层原理是什么？

Intersection Observer 的底层原理主要依赖于浏览器的渲染与布局机制，通过异步检测目标元素与观察容器（通常是视口）之间的交叉情况来工作。当页面发生滚动、窗口尺寸变化或其他布局更新时，浏览器会重新计算各个目标元素与根容器之间的交叉区域，然后将这些计算结果与预先设定的阈值进行比较。当某个目标元素的交叉比例超过（或低于）阈值时，浏览器就会生成对应的 IntersectionObserverEntry 对象，并异步调用注册的回调函数。

这种机制的好处在于，浏览器可以批量处理多元素的可见性变化，从而避免频繁监听滚动事件带来的性能问题，实现高效、低开销的可见性检测。

### 3、react.memo

**React.memo 的好处** `React.memo` 是 React 提供的高阶组件（HOC），主要用于优化函数组件的渲染性能。它的核心优势是可以**避免不必要的重新渲染**

当父组件更新时，即使子组件的 `props` 未变化，默认情况下子组件也会重新渲染。使用 `React.memo` 后，子组件会**浅层比较新旧**`props`，仅当 `props` 变化时才会重新渲染。

如果`props`是一个对象，即使内容一样，但由于每次传过来的都是一个新对象，引用不同，子组件也会重新渲染。解决方法就是给memo添加一个shallowEqual，这样如果引用不同，会再对内部属性方法进行比较，如果相同就不用重新渲染

### 4、虚拟列表+懒加载

在上边

### 5、防抖与节流

在上边

### 6、前端判断优化的指标有哪些

1. **LCP (Largest Contentful Paint) 最大内容绘制**
    - 定义：页面**最大的内容元素**（图片、标题等）渲染完成的时间
    - 标准：优秀 <2.5s，合格 <4s
    - 意义：衡量**加载速度**的核心指标
2. **CLS (Cumulative Layout Shift) 累积布局偏移**
    - 定义：页面加载过程中，元素意外位移的累计分数
    - 标准：优秀 <0.1，合格 <0.25
    - 意义：衡量**视觉稳定性**
3. **INP (Interaction to Next Paint) 交互到下一次绘制**
    - 定义：从用户点击 / 输入，到页面做出响应的延迟
    - 标准：优秀 <200ms
    - 意义：衡量**页面交互流畅度**，已替代旧指标 FID
4. **FP (First Paint) 首次绘制**浏览器第一次在屏幕上绘制像素的时间（白屏结束）
5. **FCP (First Contentful Paint) 首次内容绘制**浏览器第一次渲染**文本、图片、非空白元素**的时间
6. **TTFB (Time to First Byte) 首字节时间**从请求发出，到收到服务器第一个字节的时间→ 反映服务器响应与网络质量
7. **TBT (Total Blocking Time) 总阻塞时间**FCP 到 TTI 之间，主线程被长任务阻塞的总时长→ 反映 JS 阻塞严重程度
8. **TTI (Time to Interactive) 可交互时间**页面加载完成、主线程空闲、可稳定响应用户操作的时间
9. **SI (Speed Index) 速度指数**页面内容**逐步填充显示**的速度评分，数值越小越快
10. **FMP (First Meaningful Paint) 首次有效绘制**页面核心内容首次可见的时间（目前已逐渐被 LCP 替代）

#### 三、简单总结（常用优先级）

- 看**加载快慢**：TTFB → FCP → LCP

- 看**交互卡顿**：TBT → INP
- 看**页面抖动**：CLS

#### 一、路由懒加载（代码分割）

把不同页面的 JS/CSS 拆分成独立文件，**首屏只加载当前页面的代码**，不加载其他路由的冗余代码，大幅减少首屏资源体积、JS 解析执行时间。

##### 🔥 核心优化指标（按优先级排序）

1. TBT（总阻塞时间）★★★★★（最关键）冗余 JS 减少 → 主线程长任务减少 → 阻塞总时长直接下降（路由懒加载对 TBT 的优化是立竿见影的）
2. TTI（可交互时间）★★★★★主线程更快空闲 → 页面更早能响应用户点击、输入
3. INP（交互流畅度）★★★★主线程不拥堵 → 用户交互的响应延迟大幅降低
4. LCP（最大内容绘制）★★★首屏资源加载更快 → 页面最大元素更早渲染
5. FCP（首次内容绘制）★★间接优化：无冗余 JS 阻塞，浏览器更快渲染文本 / 基础元素
6. SI（速度指数）★★★页面内容填充速度更快

---

#### 二、图片懒加载

只加载**当前可视区域内**的图片，首屏不加载下方 / 非可视区图片，减少首屏 HTTP 请求、带宽占用，避免图片资源抢占首屏渲染。

##### 🔥 核心优化指标（按优先级排序）

1. LCP（最大内容绘制）★★★★★（最关键）80% 的页面 LCP 元素都是图片！懒加载非首屏图片 → 首屏图片优先加载 → LCP 直接提速（图片懒加载的核心价值）
2. CLS（累积布局偏移）★★★★★配合图片宽高设置，非首屏图片加载时不会挤压页面元素 → 彻底解决页面抖动
3. FCP（首次内容绘制）★★★无多余图片请求抢占资源 → 浏览器更快渲染文本 / 基础内容
4. TBT（总阻塞时间）★★★减少图片加载的主线程占用 → 降低阻塞
5. SI（速度指数）★★★首屏内容更快完整显示

## 7、axios二次封装

#### 为什么要对axios进行二次封装？

对 Axios 的二次封装主要是为了**统一管理网络请求逻辑**，通过拦截器**全局处理错误提示**、**Token 鉴权**、**处理参数格式**等，减少重复代码；同时规范数据响应结构（如自动提取嵌套数据），**简化api（如get，post）调用方式**（如统一设置参数，统一返回 `[err, data]` 格式），并支持扩展缓存、重试等定制功能，最终提升代码复用性、维护性及项目协作效率。

#### 项目中进行了哪些封装？

**1. 基础配置封装（第一步）**

统一设置**基础地址、超时时间**，不用每个接口单独写：

- `baseURL`：自动拼接接口url前缀，外部调用时只需要传入不一致的url后缀，后期如果更换基本域名也只需改一处
- `timeout`：全局统一超时（比如 5 秒），全局生效

**2. 请求拦截器（必封装）**

所有请求**发送前**统一处理：

- 自动携带 `Token`（登录态）
- 统一设置请求头（`Content-Type` 等）
- 接口返回前展示loading加载动画

**3. 响应拦截器**

所有接口**返回后**统一处理：

- 自动剥离数据（不用每次写 `res.data`）
- 统一判断业务状态码（如 `code:200` 成功），对不同错误码情况进行统一处理全局处理

不用每个接口写 `.catch()`，所有错误（网络错误、超时、断网）统一处理，弹出弹窗或者toast来自动提示用户。

**4.统一 API 请求方法封装**

对get，post这些api进行封装，固定参数格式，简化接口调用时的逻辑，直接调用get/post方法并传入url和参数即可，代码更简洁。

**1、对get和post这些api进行了封装**

以get为例，封装了一个新的get函数来获取各项房源数据，里边调用axios.get(url, params)方法，参数是请求路径url和和要查询的查询参数params。在then中处理请求结果，通过res.data获取到数据。获取成功就用resolve返回数据。请求失败通过catch接到，用rejected返回一个error。

post情况也类似，调用axios.post方法，传入请求数据与URL，在then中处理数据并返回，在catch中处理错误并返回

**2、对请求拦截器进行了封装**

在第一个项目中，只是封装了一些公共请求头。在第二个项目中，存在登录功能，所以在请求拦截器中通过getItem获取用户的token ，如果有token就设置到请求头的Authorization。请求拦截器是通过`axios.interceptors.request.use`，对config赋值实现。

**3、对响应拦截器进行了封装**

在第一个项目中，没有登录功能，所以仅通过响应拦截器封装了处理网络请求错误显示的错误信息，如400是'错误的请求'，404是'请求错误,未找到该资源'，500是'服务器端出错'，502是网络错误。并通过message(error)弹出错误信息。在第二个项目中封装了对用户token过期或失效进行处理，当返回结果为401时说明token过期或失效，重新刷新token（通过存储的有更长有效期的refreshToken，将其post到服务器端，正常情况下会返回新token）。如果成功获取新token就使用新token重新请求，如果还是失败就弹出错误信息、清除token并跳转至登录页面。

4、对各个接口进行进一步封装，调用上边的get函数，将请求的url传进去，在外部使用相应数据请求时直接调用即可。

## 8、登录与注册的实现

项目2中登录通过token方式实现。

通过状态变量设置显示登录还是注册

**注册的实现**：首先设计了注册的用户名，密码与重复输入密码的表单。点击注册按钮后先进行前端检查，如果密码符合规则且两次输入密码相同，就触发注册请求，将用户名和密码通过post传进去，返回一个响应，如果成功调用就登录函数，失败就弹出注册失败。

**登录的实现**：

1、首先在设计了登录的用户名和密码表单，点击登录按钮会触发登录请求，将用户名和密码传进去，如果登录成功就把用户名放到redux中存起来，并跳转到首页，失败就弹出登录失败。

2、触发登录请求，会通过post方法将用户名和密码传到服务器，如果成功就获取响应中的token和refreshToken放到localStorage中存起来（通过setItem）,并返回一个true。失败就返回一个false

3、在请求拦截器中，会将token放进请求头Authorization中。在响应拦截器中，会对响应结果进行处理，如果token过期或失效就通过refreshToken重新获取一个新token存起来，通过新token重新进行请求。如果还是失败就弹出错误信息，清除token并跳转至登录页面。

4、首页中设置了登出按钮，点击后就可以触发登出函数，清除token并跳转至登录页面。

5、通过设置一个高阶组件来实现路由守卫，在高阶组件中对token的有效性和是否过期进行验证（通过jwtDecode对token进行解析），如果验证通过就跳转到响应的页面，如果不通过就回到登录页面。通过状态变量来保存用户token，并通过context传递。

### 问题1：都有哪些登录方式，都有什么特点和优势？

#### 一、**Session-Cookie 认证**

#### **原理**

- 服务端生成会话（Session）并存储（如内存、数据库、Redis），客户端通过 Cookie 保存 Session ID。

- **流程**：
    1. 用户提交用户名密码。
    2. 服务端验证后生成 Session 并返回 Session ID。
    3. 客户端通过 Cookie 存储 Session ID。
    4. 后续请求自动携带 Cookie，服务端校验 Session ID。

#### **特点**

- **优点**：
  - 简单易实现，适合传统 Web 应用。
  - 服务端可主动控制会话（如强制退出、实时更新权限）。

- **缺点**：
  - 服务端需存储会话数据，扩展性差（分布式场景需共享 Session）。
  - 依赖 Cookie，跨域场景需额外配置。

#### **适用场景**

- 传统服务端渲染的 Web 应用（如 PHP、Ruby on Rails）。

---

#### 二、**OAuth 2.0 / 第三方登录**

#### **原理**

- 用户通过第三方平台（如微信、Google、GitHub）授权登录。

- **流程**：
    1. 前端跳转至第三方登录页面。
    2. 用户授权后，第三方返回授权码（Code）。
    3. 前端将 Code 传给后端，后端换取用户信息。
    4. 后端生成自有 Token 或 Session 返回前端。

#### **特点**

- **优点**：
  - 用户无需注册新账号，提升转化率。
  - 依赖第三方平台的用户体系，减少密码管理成本。

- **缺点**：
  - 实现复杂，需处理多种第三方协议。
  - 依赖第三方服务稳定性。

#### **适用场景**

- 需要快速接入第三方账号登录的应用（如社交平台、工具类应用）

### 问题2：token方式的优势和缺点是什么？

**三、Token 认证的优势**

| 优势 | 说明 |
| --- | --- |
| **无状态** | 服务端无需存储会话信息，适合微服务、分布式架构。 |
| **跨域支持** | 可轻松实现跨域认证（CORS），适合前后端分离项目。 |
| **多端兼容** | 适用于 Web、移动端（App）、IoT 设备等多种客户端。 |
| **灵活的权限控制** | Token 可携带用户角色、权限信息，实现细粒度访问控制。 |
| **易于扩展** | 可通过添加自定义字段（如设备 ID、Token 版本）支持复杂场景。 |

---

**四、Token** **认证的缺点与挑战**

| 缺点 | 解决方案 |
| --- | --- |
| **Token 泄露风险** | 使用 HTTPS、短期 Token、Refresh Token 轮换、绑定 IP/设备信息。 |
| **无法主动失效** | 使用 Token 黑名单、短期有效期 + 刷新机制、或改用不透明 Token。 |
| **存储安全性** | 优先使用 `HttpOnly Cookie`，避免 LocalStorage（防 XSS）。 |
| **Token 膨胀** | 避免在 Token 中存储过多数据，敏感信息由服务端动态查询。 |

### **问题三**：Token 认证 vs Session-Cookie 认证

| 对比项 | Token 认证 | Session-Cookie 认证 |
| --- | --- | --- |
| **状态管理** | 无状态，适合分布式系统 | 有状态，服务端存储 Session |
| **跨域支持** | 天然支持（通过 Header 传递） | 需配置 CORS 和 Cookie 域 |
| **移动端友好性** | 更友好（无需处理 Cookie） | 需处理 Cookie |
| **注销机制** | 依赖黑名单或短期 Token | 服务端直接删除 Session 即可 |
| **适用场景** | 前后端分离、API 优先、多端应用 | 传统服务端渲染 Web 应用 |

### **问题4：前端该用 LocalStorage 还是 Cookie 存 Token？**

- **优点：**
  - 存储容量较大，适合存放较多或较大的数据。
  - 操作简单，通过 JavaScript API 直接读写，不需要每次请求都自动携带，便于在客户端灵活控制。

- **缺点：**
  - 数据完全暴露给前端脚本，无法设置 HttpOnly，容易受到 XSS 攻击。
  - 需要手动将 token 附加到 HTTP 请求头中，增加了实现复杂度。
  - 数据不会自动随请求发送，跨域时需额外处理。

**Cookie 存储 Token**

- **优点：**
  - 浏览器会自动在每个请求中附带 Cookie，便于服务器端识别用户会话。
  - 可以设置 HttpOnly 属性，防止 JavaScript 访问，从而降低 XSS 风险。
  - 配置 SameSite 和 Secure 属性后，可在一定程度上防范 CSRF 等攻击。
- **缺点：**
  - 存储容量有限（通常约 4KB），不适合存放大量数据。
  - 自动随请求发送，可能会带来不必要的流量开销。
  - 如果配置不当（例如未设置 SameSite 或 Secure），依然存在安全隐患。

## 9、style-components

**1、简单介绍**

styled-components 是一种流行的 CSS-in-JS 库，主要用于 React 应用中。它通过使用 ES6 的模板字符串（tagged template literals）让开发者可以在 JavaScript 文件中直接编写 CSS，然后将这些样式与具体的 React 组件绑定，从而达到组件化、模块化的样式管理效果。

**主要特点**

- **样式与组件紧密耦合**：样式定义在组件内，使得样式的作用域自动被限定在组件内，避免了全局样式冲突。
- **动态样式支持**：可以根据组件的 props 或 state 动态生成样式，满足复杂场景的需求。
- **主题支持**：提供 ThemeProvider，可以轻松实现全局主题切换，统一管理应用风格。
- **易于维护**：由于样式和逻辑在同一文件中管理，组件的可读性和可维护性较高。

**优点与适用场景**

- **提高复用性与封装性**：每个组件自带样式，方便复用和迁移。
- **简化开发流程**：不用再维护单独的 CSS 文件，减少样式冲突问题。
- **适用于大型 React 应用**：当应用组件化程度高时，styled-components 能够更好地管理复杂的样式体系。

### 1、通过参数实现动态样式

styled-components 利用 ES6 模板字符串的特性，可以在样式中嵌入 JavaScript 表达式。这样，你就可以根据组件的 props 动态计算出对应的 CSS 属性值。

**实现方式：**

- **插值** 在模板字符串中使用插值，接收组件的 props 作为参数，然后返回一个 CSS 值，要以一个$开头。 例如，根据一个 `primary` 属性来设置按钮的背景色，通过props.primary 判断那种样式：

```plain

```

import styled from 'styled-components';

const Button = styled.button`  
  background-color: ${props => props.primary ? 'blue' : 'gray'};  
  color: white;  
  padding: 10px 20px;  
  border: none;  
  border-radius: 4px;
`;

```plain


  在使用时，只需给组件传递相应的 props，如这里传primary：

  ```Plain Text
<Button primary>主按钮</Button>
<Button>普通按钮</Button>

```

### 2、整体将参数插入样式

  通过ThemeProvider将一个主题对象注入到整个组件树中。所有使用 styled-components 定义的组件都可以通过 `props.theme` 访问到这个主题对象，从而实现全局主题的统一管理和动态切换。

  **定义主题对象** 首先定义一个包含全局样式变量（如颜色、字体、间距等）的主题对象：

```plain
// theme.js
export const theme = {
primaryColor: 'blue',
secondaryColor: 'gray',
fontSize: '16px',
};
```

  **使用 ThemeProvider 包裹组件树** 在应用的根组件中使用 `ThemeProvider` 将主题对象传递下去：

```plain
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import App from './App';

const Root = () => (
<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
);

export default Root;
```

  **在 styled-components 中使用主题变量** 组件中可以通过 `props.theme` 直接访问主题变量：

```plain
const Title = styled.h1`
color: ${props => props.theme.primaryColor};
font-size: ${props => props.theme.fontSize};
`;
```

### 3、混入 Mixin 功能

**实现方式：** styled-components 通过内置的 `css` 辅助函数来实现 mixin。你可以把常用的样式封装成一个可重用的样式块，然后在多个组件中引入。这样可以避免样式代码重复，提高可维护性。

### **还有哪些css-in-js的库**

Emotion或JSS

### style-components如何将样式插入

`styled-components` 用 **模板字符串** 生成 CSS 文本，交给 CSS 解析器（内部用 `stylis`）处理，然后把生成的规则插入到 `<style>` 标签中；组件本身得到一个自动生成的哈希类名（如 `sc-abc123`），样式通过该类名生效。**不是把样式放到元素的 **`style`** 属性里。**

## 10、redux-toolkit

### 什么是 Redux？它的主要特点是什么？

**Redux** 是一个用于管理应用状态的 JavaScript 库，通常与 React 一起使用。它提供了一种集中管理应用状态的方式，使得状态管理更加可预测和可维护。

**主要特点**：

- **单一数据源**：整个应用的状态存储在一个单一的 store 中，确保了状态的一致性。
- **状态不可变**：状态是不可变的，每次状态变化时，都会生成一个新的状态对象。
- **reducer**：通过reducer来处理状态变化，使得状态变化可预测。
- **中间件支持**：支持中间件，可以扩展 Redux 的功能，如异步操作、日志记录等。
- **开发者工具**：提供了强大的开发者工具，可以调试、回溯和重放状态变化。

### **一、为什么需要 Redux Toolkit？**

#### **传统 Redux 的痛点**

1. **繁琐的样板代码**：需手动编写 action types、action creators、reducers。
2. **配置复杂**：需自行集成中间件（如 Thunk、Logger）、DevTools。
3. **不可变更新易错**：手动使用 `...` 或 `Object.assign` 更新状态，容易出错。
4. **异步处理麻烦**：需依赖额外库（如 Redux-Saga、Redux-Observable）。

#### **Redux Toolkit 的优势**

- **简化代码**：内置 `createSlice` 自动生成 action 和 reducer。

- **开箱即用**：预置 `@reduxjs/toolkit` 包含 Immer、Thunk、DevTools。
- **类型安全**：完美支持 TypeScript。
- **高效开发**：减少 80% 的 Redux 代码量。

### **二、核心 API 与功能**

#### **1. **`configureStore`**：创建 Store**

替代 `createStore`，自动集成 Thunk、DevTools 和中间件。

```plain
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  devTools: process.env.NODE_ENV !== 'production'
});
```

#### **2. **`createSlice`**：定义 Slice**

自动生成 action types 和 action creators，简化 reducer 编写。

```plain
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: 0,
  reducers: {
    increment: (state) => state + 1,
    decrement: (state) => state - 1,
    addBy: (state, action) => state + action.payload
  }
});

export const { increment, decrement, addBy } = counterSlice.actions;
export default counterSlice.reducer;
```

#### **3. **`createAsyncThunk`**：处理异步操作**

简化异步逻辑（如 API 请求），自动生成 pending/fulfilled/rejected 状态。

```plain
import { createAsyncThunk } from '@reduxjs/toolkit';
import api from './api';

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

#### 4、**集成 React**

使用 `Provider` 包裹应用，并通过 `useSelector`/`useDispatch` 访问状态。

```plain
// store.ts
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// App.tsx
import { Provider } from 'react-redux';
import { store } from './app/store';

function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}

// Counter.tsx
import { useDispatch, useSelector } from 'react-redux';
import { increment } from './counterSlice';
import type { RootState } from '../app/store';

function Counter() {
  const count = useSelector((state: RootState) => state.counter);
  const dispatch = useDispatch();

  return (
    <button onClick={() => dispatch(increment())}>Count: {count}</button>
  );
}
```

#### **5、**`useDispatch`**：派发 Action**

**作用**

**获取 Redux Store 的 **`dispatch`** 函数**，用于触发 Action 以更新 Store 中的状态。

**使用场景**

当组件需要触发状态变更时（如用户点击按钮、提交表单、发起异步请求等）。

**代码示例**

```plain
import { useDispatch } from 'react-redux';
import { increment } from './counterSlice'; // 导入 Action Creator

function CounterButton() {
  const dispatch = useDispatch();

  return (
    <button onClick={() => dispatch(increment())}>
      Increment Counter
    </button>
  );
}
```

**关键特性**

1. **直接派发 Action**： 可以派发同步 Action（如 `dispatch(increment())`）或异步 Action（如 `dispatch(fetchData())`）。
2. **无需手动订阅 Store**： React-Redux 自动处理与 Store 的连接。

---

#### **6、**`useSelector`**：获取 Store 状态**

**作用**

**从 Redux Store 中提取需要的状态值**，并订阅该状态的更新。当状态变化时，组件会自动重新渲染。

**使用场景**

当组件需要读取 Store 中的状态时（如显示计数器值、用户信息等）。

**代码示例**

```plain
import { useSelector } from 'react-redux';

function CounterDisplay() {
  const count = useSelector((state) => state.counter.value);

  return <div>Current Count: {count}</div>;
}
```

**关键特性**

1. **选择器函数**： 接受一个函数 `(state) => selectedValue`，返回需要的状态片段。
2. 严格相等： 默认使用严格相等（`===`）比较前后状态值。**如果返回值是对象或数组，需确保引用稳定**，否则会导致不必要的重新渲染。
3. **性能优化**：

- **使用记忆化选择器**（如 `createSelector`）避免重复计算。

- **按需提取状态**：避免返回整个 Store 的根状态。

`shallowEqual`**的作用**

- **默认行为问题**： `useSelector` 默认使用 `===` 比较前后两次选择器返回的值。如果返回的是新对象（如 `{ a: 1, b: 2 }`），即使内容相同，引用不同也会触发重新渲染。
- `shallowEqual`**的优化**： 比较对象或数组的第一层属性/元素的值，若所有值相同，则判定为“未变化”，跳过重新渲染。

如果对reducer状态值有计算，可以使用**`createSelector`**

**createSelector作用**

- **缓存输入和输出**：记录上一次的输入参数和计算结果。
- **参数未变化时直接返回缓存结果**：跳过重复计算。
- **参数变化时重新计算**：更新缓存。

## 11、react的模块化与组件化

React 的 **模块化** 通过拆分代码逻辑（如工具函数、API 服务）实现功能复用和高效维护，而 **组件化** 将界面拆分为独立、可复用的 UI 单元（如按钮、表单），通过状态隔离和组合模式提升开发效率。二者结合形成了高内聚低耦合的架构，优势在于**逻辑复用性高**（如自定义 Hook）、**协作便捷**（并行开发）、**维护性强**（修改独立模块不影响整体），同时支持动态加载优化性能，适用于从简单页面到复杂应用的灵活构建，是 React 高效开发的核心设计理念。

## 12、数据路由

##### 一、核心 API 作用

1. `createBrowserRouter` 创建一个基于 HTML5 History API 的路由实例，支持数据加载、路由嵌套等特性。

- 参数：路由配置数组（定义路径、组件、数据加载逻辑等）。

- 返回：路由对象（传递给 `RouterProvider`）。

1. `RouterProvider` 将路由实例注入 React 应用，替代传统的 `<BrowserRouter>` 包裹方式。

- 参数：`router`（由 `createBrowserRouter` 创建的路由对象）。

##### 二、用法

**定义路由表**

```plain
// src/routes.js
import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ErrorPage from "./pages/ErrorPage";

// 定义路由配置
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,       // 直接渲染组件
    errorElement: <ErrorPage />, // 全局错误边界
  },
  {
    path: "/login",
    element: <Login />,
    // 可添加数据加载或 Action
    loader: () => fetchUserData(), // 预加载数据
  },
  {
    path: "/user/:userId",
    element: <UserProfile />,
    loader: ({ params }) => fetchUser(params.userId), // 动态参数加载
  },
]);

export default router;
```

**注入路由到应用**

```plain
// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./routes";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

##### 三、高级功能实现

1. **数据加载（Data Loading）**

通过 `loader` 函数预加载路由所需数据：

以下是一个典型的数据加载流程：

1. **用户触发导航**（如点击链接 `/user/123`）。
2. React Router **挂起当前 UI**，显示 `Suspense` 的 `fallback`（若有）。
3. **执行目标路由的 **`loader`** 函数**，获取数据。
4. **数据加载完成后**，渲染目标路由的组件，并将数据通过 `useLoaderData` 传递给组件。
5. 若 `loader` **加载失败**，渲染 `errorElement` 组件。

在项目中未使用，因为希望从redux中通过createAsyncThunk获取各项数据。

```plain
// 路由配置
{
  path: "/posts",
  element: <PostsPage />,
  loader: async () => {
    const posts = await fetch("/api/posts").then(res => res.json());
    return posts; // 数据会传递给组件
  },
}

// 组件中获取数据
import { useLoaderData } from "react-router-dom";

function PostsPage() {
  const posts = useLoaderData(); // 直接获取 loader 返回的数据
  return (
    <div>
      {posts.map(post => <div key={post.id}>{post.title}</div>)}
    </div>
  );
}
```

1. **错误边界（Error Boundary）**

通过 `errorElement` 定义错误处理组件：

```plain
{
  path: "/dashboard",
  element: <Dashboard />,
  errorElement: <ErrorPage />, // 捕获子路由错误
  children: [
    { path: "profile", element: <Profile /> },
    { path: "settings", element: <Settings /> },
  ],
}
```

## 13、echarts实现统计

- 使用 `ReactECharts` 组件包裹 ECharts 实例

- 通过其中的`option` 属性配置相应的统计图

1、对于收入支出数据通过柱状图进行统计。Xaxis属性配置月份，Yaxis属性配置值。series属性对数据进行遍历分别配置pir上收入和支出数据，type是bar。

2、对于分类数据通过饼状图进行统计，series属性中的data配置数据，type为pie

## 14、localStorage

### cookie/sessionStorage/localStorage 的区别
>
> 参考答案：
>

cookie、sessionStorage、localStorage 都是保存本地数据的方式

其中，cookie 兼容性较好，所有浏览器均支持。浏览器针对 cookie 会有一些默认行为，比如当响应头中出现`set-cookie`字段时，浏览器会自动保存 cookie 的值；再比如，浏览器发送请求时，会附带匹配的 cookie 到请求头中。这些默认行为，使得 cookie 长期以来担任着维持登录状态的责任。与此同时，也正是因为浏览器的默认行为，给了恶意攻击者可乘之机，CSRF 攻击就是一个典型的利用 cookie 的攻击方式。虽然 cookie 不断的改进，但前端仍然需要另一种更加安全的保存数据的方式

HTML5 新增了 sessionStorage 和 localStorage，前者用于保存会话级别的数据，后者用于更持久的保存数据。浏览器针对它们没有任何默认行为，这样一来，就把保存数据、读取数据的工作交给了前端开发者，这就让恶意攻击者难以针对登录状态进行攻击。 cookie 的大小是有限制的，一般浏览器会限制同一个域下的 cookie 总量为 4M，而 sessionStorage 和 localStorage 则没有限制 cookie 会与 domain、path 关联，而 sessionStorage 和 localStorage 只与 domain 关联

### 前端该用 LocalStorage 还是 Cookie 存 Token？**

- **优点：**
  - 存储容量较大，适合存放较多或较大的数据。
  - 操作简单，通过 JavaScript API 直接读写，不需要每次请求都自动携带，便于在客户端灵活控制。

- **缺点：**
  - 数据完全暴露给前端脚本，无法设置 HttpOnly，容易受到 XSS 攻击。
  - 需要手动将 token 附加到 HTTP 请求头中，增加了实现复杂度。
  - 数据不会自动随请求发送，跨域时需额外处理。

**Cookie 存储 Token**

- **优点：**
  - 浏览器会自动在每个请求中附带 Cookie，便于服务器端识别用户会话。
  - 可以设置 HttpOnly 属性，防止 JavaScript 访问，从而降低 XSS 风险。
  - 配置 SameSite 和 Secure 属性后，可在一定程度上防范 CSRF 等攻击。
- **缺点：**
- 存储容量有限（通常约 4KB），不适合存放大量数据。
- 自动随请求发送，可能会带来不必要的流量开销。
- 如果配置不当（例如未设置 SameSite 或 Secure），依然存在安全隐患。

## 15、移动端适配

通过媒体查询结合rem与flex的方式，实现了移动端适配。

1、flex布局：用来设置较大的元素布局，如控制一行中显示几列房源item。

2、rem布局：用来设置较小的元素布局，如房源item中的文字大小，边距等。首先给根元素html设置字体大小，其余元素的设置为几倍的rem。rem的优势：每个元素父元素文字大小可能不一致， 但是整个页面只有一个html，这样一来可以很好来控制整个页面的元素大小。

3、通过媒体查询，实现在不同页面改变根元素字体大小，从而改变元素大小。通过min-width，max-width来控制断点。

### 问题1：响应式布局如何实现切换栏数

1、通过flex-wrap，确保元素可切换

2、默认是一行显示五列，简写形式是flex: 1, 0, 20%

其中第一个参数为flex-grow，定义子元素在容器有**剩余空间**时如何分配剩余空间。值为1说明在页面中占一份。flex-grow的值代表全部子元素加起来宽度占到几份。由于20%*5=100，已占满，所以不会再起作用。如果是flex: 1，是flex: 1, 1, 0。初始宽度为0.通过flex-grow等于1所以将剩余空间占满。同时flex-shrink为1所以可以收缩。

第二个参数为flex-shrink定义子元素在容器**空间不足**时如何收缩。值为0，元素禁止收缩。

第三个参数为flex-basis定义子元素在分配剩余空间前的初始大小。值为20%，说明初始大小为20%，20%*5=100，正好占满。

3、当页面宽度逐渐减小时，通过max-width设置范围，当减小到程度flex-basis就换位25%变成4列，并以此类推变为三列两列一列。

### 问题2：都有哪些响应式布局方案，优缺点都是什么

| **布局方法** | **优点** | **缺点** |
| --- | --- | --- |
| **Flexbox** | 1. 灵活的对齐和空间分配 2. 一维布局简单直观 3. 代码简洁，支持响应式 | 1. 二维复杂布局能力有限 2. 旧版浏览器（如 IE10-）需前缀 |
| **CSS Grid** | 1. 强大的二维布局能力 2. 简化复杂网格结构 3. 支持现代浏览器无缝响应 | 1. 旧版浏览器兼容性差（如 IE11 部分支持） 2. 学习曲线较陡 |
| **流式布局** | 1. 基于百分比自适应屏幕 2. 实现简单，无需复杂计算 | 1. 内容可能拉伸失真 2. 嵌套元素百分比计算复杂 |
| **Rem 布局** | 1. 基于根字体大小适配多屏 2. 结合媒体查询实现精细控制 | 1. 需工具转换像素单位（如 PostCSS） 2. 动态调整根字体可能影响性能 |
| **Viewport 单位** | 1. 直接基于视口尺寸（vw/vh） 2. 天然响应式，减少媒体查询使用 | 1. 部分浏览器支持不全（如 vmin/vmax） 2. 小屏幕内容可能过小 |
| **Bootstrap 栅格** | 1. 快速搭建响应式布局 2. 预设断点，社区支持完善 3. 跨浏览器一致性 | 1. 冗余代码增加体积 2. 定制性受限 3. 依赖框架更新 |
| **媒体查询** | 1. 精准控制不同断点样式 2. 高度定制化，适配任意设备 | 1. 维护多断点时代码臃肿 2. 无法覆盖所有设备尺寸 |
| **混合布局** | 1. 结合多种方法优势（如 Grid + Flex） 2. 灵活应对复杂场景 | 1. 代码复杂度高 2. 需开发者深入理解各方法特性 |

### 问题3：使用rem与flex布局的好处是什么

rem：普通em是根据父元素规定的字体大小确定的，对于不同的元素父元素可能不同，设置的字体大小可能也不同，也就会导致em设置较混乱。而rem只根据根元素html设置，所以各个子元素中的rem都按照同一套标准设置，较为统一，更改时也只需要更改html中的字体大小即可，方便控制。

flex: 空间分配很灵活方便，很多时候只需要配置一个flex: 1即可。构建自适应布局也很简单，如两栏布局，一栏设置固定宽度，另一栏直接设置flex: 1就可以占满剩余部分。

## 16、如何实现点击链接跳转

1、酒店中的每种房源都几个a链接来代表对应的平台

2、以携程为例，所有酒店的详情页面的协议，域名，路由hotel/detail都是相同的，只有查询参数不同。查询参数是hotelId和adult，从后端获取到相应的参数后，通过模板字符串放到href的链接中，就可以实现链接跳转。

## 17、项目AI简介

---

AI助手是一种多agent协作构建的ai

### 1. 架构与模块划分

项目主要分为以下三大模块，每个模块对应若干个 Agent（智能体）：

1. **用户信息处理模块**

- **作用**：对用户输入（包括需求描述、标准等）进行结构化、标准化处理，提取关键信息，方便后续推理和检索。

- **模型选型**：采用 ERNIE Functions-8K-0321 —— 该模型在**结构化输出能力**和**输出格式稳定性**方面表现优异，能够保证批量信息抽取时的准确性和一致性。

1. **推理模块**（双 Agent 协作架构）

- **推理 Agent**
  - **模型选型**：DeepSeek-R1-Distill-Qwen-14B —— 推理能力较强、推理过程可解释性高，能够针对症状信息给出详细的病因分析。

- **专科 Agent**
  - **模型选型**：DISC-MedLLM —— 专门针对房源推荐对话场景微调过的大模型，擅长根据用户需求给出“贴合实际”的建议。
- **协作方式**：
    1. 用户信息处理模块提取到的结构化症状数据，先由“推理 Agent”进行初步的需求分析；
    2. 再将推理结果交给“专科 Agent”，结合知识库给出更合理，更符合实际的建议。

---

### 3. 多 Agent 协作链路的搭建

1. **统一使用百度千帆 SDK**（不主动讲）

- 因为现有市面上的多 Agent 框架（如 Camel、AutoAgent 等）并不原生支持百度千帆 SDK，所以开发团队借鉴了它们的设计规范（尤其是 Camel 的链式调用逻辑）。

- 最终搭建了包括：
  - **模型初始化调用**：统一通过千帆 SDK API 装载不同的大模型；
  - **记忆存储**：保存对话上下文、用户偏好等辅助信息；
  - **双 Agent 协作链路**：在一个业务流程里，先调用一个 Agent，获取中间结果后传给下一个 Agent；
  - **RAG（Retrieval-Augmented Generation）工具调用**：结合本地知识库和在线搜索插件，实现“问答+检索融合”的效果。

1. **RAG 工具具体实现**

- **本地知识库**：使用 Camel 库搭建，内容来源于团队爬取的房源数据。

- **数据处理**：对数据进行归纳总结
- **检索流程**：前端发起问题时，后端先根据用户输入的向量化信息在本地知识库中查找相关答案；如未命中或命中置信度较低，则进一步调用百度搜索插件，获取最新在线信息；最后将“本地检索结果 + 在线检索结果”综合传给对应模型，让模型生成最终回答。

第一步：文件预处理
