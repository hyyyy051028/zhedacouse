(function () {
  var DATA_URL = "./shared/teachers.json";
  var FALLBACK = {
    defaultTeacherKey: "zhanglu",
    teachers: {
      zhanglu: {
        key: "zhanglu",
        name: "张露",
        file: "./assets/张露.jpg",
        phoneNumber: "15906618726",
        signupUrl:
          "https://my.feishu.cn/share/base/form/shrcnNeVkUrdtm2Cvxy5IMk56Jf?prefill_%E5%AF%B9%E6%8E%A5%E8%80%81%E5%B8%88=%E5%BC%A0%E9%9C%B2%E8%80%81%E5%B8%88&hide_%E5%AF%B9%E6%8E%A5%E8%80%81%E5%B8%88=1&v=15",
      },
    },
  };

  function safeText(value) {
    return typeof value === "string" ? value : "";
  }

  function getTeacherKeyFromUrl() {
    try {
      var searchParams = new URLSearchParams(window.location.search || "");
      return safeText(searchParams.get("teacher")).trim().toLowerCase();
    } catch (e) {
      return "";
    }
  }

  function pickTeacher(data) {
    var key = getTeacherKeyFromUrl();
    var defaultKey = safeText(
      data.defaultTeacherKey || FALLBACK.defaultTeacherKey,
    );
    var teachers = data.teachers || {};
    if (key && teachers[key]) return teachers[key];
    if (defaultKey && teachers[defaultKey]) return teachers[defaultKey];
    return FALLBACK.teachers.zhanglu;
  }

  function removeLegacyFloatingBtn() {
    var legacy = document.getElementById("floatingBtn");
    if (legacy && legacy.parentNode) legacy.parentNode.removeChild(legacy);
  }

  function createFloatingBtn(openModal) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "floating-teacher-btn auto-light";
    btn.textContent = "联系老师";
    btn.addEventListener("click", openModal);
    return btn;
  }

  function createModal(teacher) {
    var overlay = document.createElement("div");
    overlay.className = "floating-teacher-modal-overlay";

    var modal = document.createElement("div");
    modal.className = "floating-teacher-modal";

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "floating-teacher-modal-close";
    closeBtn.setAttribute("aria-label", "关闭");
    closeBtn.textContent = "×";

    var card = document.createElement("div");
    card.className = "teacher-card";

    var qrWrapper = document.createElement("div");
    qrWrapper.className = "teacher-qr-wrapper";

    var img = document.createElement("img");
    img.className = "teacher-qr";
    img.alt = safeText(teacher.name) + " 老师微信二维码";
    img.width = 200;
    img.height = 200;
    img.src = teacher.qrCodeUrl || teacher.file;

    qrWrapper.appendChild(img);

    var name = document.createElement("h3");
    name.className = "teacher-name";
    name.textContent = safeText(teacher.name) + " 老师";

    var phone = document.createElement("p");
    phone.className = "teacher-phone";
    phone.textContent = "电话：" + safeText(teacher.phoneNumber);

    var signup = document.createElement("a");
    signup.className = "teacher-signup-btn";
    signup.textContent = "立即报名";
    signup.href = safeText(teacher.signupUrl);
    signup.target = "_blank";
    signup.rel = "noreferrer";

    card.appendChild(qrWrapper);
    card.appendChild(name);
    card.appendChild(phone);
    card.appendChild(signup);

    modal.appendChild(closeBtn);
    modal.appendChild(card);
    overlay.appendChild(modal);

    function close() {
      overlay.classList.remove("is-open");
    }

    function open() {
      overlay.classList.add("is-open");
    }

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });

    closeBtn.addEventListener("click", close);

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });

    return { overlay: overlay, open: open, close: close };
  }

  function mount(data) {
    removeLegacyFloatingBtn();

    var teacher = pickTeacher(data);
    var modalApi = createModal(teacher);

    function openModal() {
      modalApi.open();
    }

    document.body.appendChild(createFloatingBtn(openModal));
    document.body.appendChild(modalApi.overlay);
  }

  function init() {
    if (!document || !document.body) return;
    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("failed to load teachers.json");
        return res.json();
      })
      .then(function (data) {
        mount(data || FALLBACK);
      })
      .catch(function () {
        mount(FALLBACK);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
