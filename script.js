/* ============================================================
   BIRTHDAY SURPRISE — EASY CONFIGURATION
   ============================================================ */

const FRIEND_NAME = "MOUNIKA";
const YOUR_NAME = "JEY";
const BIRTHDAY_DATE = "8 October 2026";
const BIRTHDAY_MESSAGE = `Happy Birthday to the most amazing person!`;


/* ============================================================
   PHOTO CONFIGURATION
   ============================================================ */

const memories = [
  {src:"assets/photos/photo01.jpg", caption:"Our first unforgettable memory ❤️"},
  {src:"assets/photos/photo02.jpg", caption:"That crazy moment 😂"},
  {src:"assets/photos/photo03.jpg", caption:"One of my favorite memories."},
  {src:"assets/photos/photo04.jpg", caption:"Another chapter of our chaos."},
  {src:"assets/photos/photo05.jpg", caption:"A moment worth keeping forever."},
  {src:"assets/photos/photo06.jpg", caption:"Proof that we have too much fun."},
  {src:"assets/photos/photo07.jpg", caption:"One more memory for the collection."},
  {src:"assets/photos/photo08.jpg", caption:"And this one still makes me smile."}
];


/* ============================================================
   GLOBAL CONFIGURATION
   ============================================================ */

const CHAPTERS = 12;

const reducedMotion =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isTouch =
  matchMedia("(pointer: coarse)").matches;

const $ = s => document.querySelector(s);

const $$ = s => [...document.querySelectorAll(s)];


/* ============================================================
   BASIC INFORMATION
   ============================================================ */

document.title = `${FRIEND_NAME} — Birthday Surprise`;

if ($("#birthdayName")) {
  $("#birthdayName").textContent = FRIEND_NAME;
}

if ($("#birthdayTitle")) {
  $("#birthdayTitle").innerHTML = `HAPPY BIRTHDAY <span>❤️</span>`;
}


/* ============================================================
   AUDIO
   ============================================================ */

const audio = {
  bg: $("#bgMusic"),
  click: $("#soundClick"),
  whoosh: $("#soundWhoosh"),
  firework: $("#soundFirework"),
  magic: $("#soundMagic")
};

let audioEnabled = false;


/* ============================================================
   GENERAL STATE
   ============================================================ */

let currentPhoto = 0;

let localOverrides =
  JSON.parse(
    localStorage.getItem("birthdayPhotoOverrides") || "{}"
  );

let secretTriggered = false;
let giftOpened = false;

let proposalAccepted = false;
let noButtonEscaping = false;


/* ============================================================
   AUDIO HELPERS
   ============================================================ */

function safePlay(a) {
  if (!audioEnabled || !a) return;

  a.currentTime = 0;

  a.play().catch(() => {});
}


/* ============================================================
   TOAST
   ============================================================ */

function showToast(msg) {
  const t = $("#toast");

  if (!t) return;

  t.textContent = msg;

  t.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer =
    setTimeout(
      () => t.classList.remove("show"),
      2400
    );
}


/* ============================================================
   IMAGE HELPERS
   ============================================================ */

function imageExists(src, cb) {
  const img = new Image();

  img.onload = () => cb(true);

  img.onerror = () => cb(false);

  img.src = src;
}


function effectiveMemory(i) {
  const m = memories[i];

  const o = localOverrides[i];

  return {
    src: o?.data || m.src,
    caption: o?.caption ?? m.caption,
    local: !!o?.data
  };
}


function applyPhotoSlot(slot, index) {
  const img = slot.querySelector("img");

  const m = effectiveMemory(index);

  slot.dataset.index = index;

  img.alt =
    `Memory ${String(index + 1).padStart(2, "0")}`;

  if (m.local) {
    img.src = m.src;

    slot.classList.add("has-image");

    return;
  }

  imageExists(
    m.src,
    ok => {
      if (ok) {
        img.src = m.src;

        slot.classList.add("has-image");
      } else {
        img.removeAttribute("src");

        slot.classList.remove("has-image");
      }
    }
  );
}


function buildPhotoSlots() {
  $$(".photo-slot[data-photo-index]")
    .forEach(
      s => applyPhotoSlot(
        s,
        +s.dataset.photoIndex
      )
    );
}


/* ============================================================
   GALLERY
   ============================================================ */

function makeCard(i) {
  const card = document.createElement("article");

  card.className = "memory-card";

  card.dataset.index = i;

  card.innerHTML = `
    <div
      class="photo-slot"
      data-photo-index="${i}"
      data-placeholder="PHOTO ${String(i + 1).padStart(2, "0")}"
    >
      <img
        alt="Memory ${i + 1}"
        loading="lazy"
      >

      <div class="slot-placeholder">
        <span class="camera-icon">◉</span>

        <strong>
          YOUR PHOTO HERE
        </strong>

        <small>
          Replace with your photo · PHOTO ${String(i + 1).padStart(2, "0")}
        </small>
      </div>
    </div>

    <span class="card-label">
      PHOTO ${String(i + 1).padStart(2, "0")}
    </span>
  `;

  applyPhotoSlot(
    card.querySelector(".photo-slot"),
    i
  );

  card.addEventListener(
    "mousemove",
    e => {
      if (isTouch) return;

      const r =
        card.getBoundingClientRect();

      const x =
        (e.clientX - r.left) / r.width - 0.5;

      const y =
        (e.clientY - r.top) / r.height - 0.5;

      card.style.transform =
        `perspective(900px)
         rotateY(${x * 12}deg)
         rotateX(${-y * 12}deg)
         translateY(-6px)
         scale(1.02)`;
    }
  );

  card.addEventListener(
    "mouseleave",
    () => {
      card.style.transform = "";
    }
  );

  card.addEventListener(
    "click",
    () => openViewer(i)
  );

  return card;
}


function buildGallery() {
  const g = $("#memoryGallery");

  const c = $("#collage");

  if (g) g.innerHTML = "";

  if (c) c.innerHTML = "";

  memories.forEach(
    (_, i) => {
      if (g) {
        g.appendChild(
          makeCard(i)
        );
      }
    }
  );

  [0, 1, 2, 3, 4, 5]
    .forEach(
      i => {
        if (c) {
          c.appendChild(
            makeCard(i)
          );
        }
      }
    );
}


function refreshAllPhotos() {
  $$(".photo-slot[data-photo-index]")
    .forEach(
      s =>
        applyPhotoSlot(
          s,
          +s.dataset.photoIndex
        )
    );
}


/* ============================================================
   PHOTO VIEWER
   ============================================================ */

function openViewer(index) {
  currentPhoto = index;

  const m =
    effectiveMemory(index);

  const wrap =
    $(".viewer-image-wrap");

  const img =
    $("#viewerImage");

  if (!wrap || !img) return;

  $("#viewerCaption").textContent =
    m.caption;

  $("#viewerCounter").textContent =
    `${String(index + 1).padStart(2, "0")} / ${String(memories.length).padStart(2, "0")}`;

  wrap.classList.remove("has-image");

  if (m.local) {
    img.src = m.src;

    wrap.classList.add("has-image");
  } else {
    imageExists(
      m.src,
      ok => {
        if (ok) {
          img.src = m.src;

          wrap.classList.add("has-image");
        }
      }
    );
  }

  $("#photoViewer").classList.add("open");

  $("#photoViewer")
    .setAttribute(
      "aria-hidden",
      "false"
    );

  document.body.classList.add(
    "modal-open"
  );
}


function closeViewer() {
  $("#photoViewer")
    .classList.remove("open");

  $("#photoViewer")
    .setAttribute(
      "aria-hidden",
      "true"
    );

  document.body.classList.remove(
    "modal-open"
  );
}


function stepViewer(dir) {
  currentPhoto =
    (
      currentPhoto +
      dir +
      memories.length
    ) % memories.length;

  openViewer(currentPhoto);
}


if ($("#viewerClose")) {
  $("#viewerClose").onclick =
    closeViewer;
}

if ($("#viewerPrev")) {
  $("#viewerPrev").onclick =
    () => stepViewer(-1);
}

if ($("#viewerNext")) {
  $("#viewerNext").onclick =
    () => stepViewer(1);
}


if ($("#photoViewer")) {
  $("#photoViewer").addEventListener(
    "click",
    e => {
      if (
        e.target.classList.contains(
          "viewer-backdrop"
        )
      ) {
        closeViewer();
      }
    }
  );
}


document.addEventListener(
  "keydown",
  e => {
    if (e.key === "Escape") {
      closeViewer();
    }

    if (
      $("#photoViewer")?.classList.contains(
        "open"
      )
    ) {
      if (e.key === "ArrowLeft") {
        stepViewer(-1);
      }

      if (e.key === "ArrowRight") {
        stepViewer(1);
      }
    }
  }
);


/* ============================================================
   CUSTOMIZER
   ============================================================ */

function setupCustomizer() {
  const select = $("#slotSelect");

  if (!select) return;

  memories.forEach(
    (_, i) => {
      const o =
        document.createElement(
          "option"
        );

      o.value = i;

      o.textContent =
        `PHOTO ${String(i + 1).padStart(2, "0")}`;

      select.appendChild(o);
    }
  );


  const renderPreview = () => {
    const i = +select.value;

    const m =
      effectiveMemory(i);

    const p =
      $("#customPreview");

    if (!p) return;

    p.innerHTML = "";

    imageExists(
      m.src,
      ok => {
        if (ok) {
          const img =
            new Image();

          img.src = m.src;

          p.appendChild(img);
        } else {
          p.textContent =
            "YOUR PHOTO HERE";
        }
      }
    );

    $("#captionInput").value =
      m.caption;
  };


  select.onchange =
    renderPreview;


  $("#photoUpload").onchange =
    e => {
      const f =
        e.target.files?.[0];

      if (!f) return;

      if (!f.type.startsWith("image/")) {
        return showToast(
          "Please choose an image."
        );
      }

      const reader =
        new FileReader();

      reader.onload = () => {
        localOverrides[
          select.value
        ] = {
          data: reader.result,

          caption:
            $("#captionInput").value ||
            memories[select.value].caption
        };

        $("#customPreview").innerHTML =
          `<img src="${reader.result}" alt="Local preview">`;
      };

      reader.readAsDataURL(f);
    };


  $("#saveSlot").onclick =
    () => {
      const i =
        +select.value;

      const file =
        $("#photoUpload").files?.[0];

      if (file) {
        const reader =
          new FileReader();

        reader.onload =
          () => {
            localOverrides[i] = {
              data: reader.result,

              caption:
                $("#captionInput").value ||
                memories[i].caption
            };

            persistSlot(i);
          };

        reader.readAsDataURL(file);

      } else {
        localOverrides[i] = {
          ...(localOverrides[i] || {}),

          caption:
            $("#captionInput").value ||
            memories[i].caption
        };

        persistSlot(i);
      }
    };


  function persistSlot(i) {
    localStorage.setItem(
      "birthdayPhotoOverrides",
      JSON.stringify(
        localOverrides
      )
    );

    refreshAllPhotos();

    buildGallery();

    showToast(
      `PHOTO ${String(i + 1).padStart(2, "0")} saved locally.`
    );

    $("#photoUpload").value = "";

    renderPreview();
  }


  $("#customizeToggle").onclick =
    () => {
      $("#customizer")
        .classList.add("open");

      $("#customizer")
        .setAttribute(
          "aria-hidden",
          "false"
        );

      renderPreview();
    };


  $("#customizerClose").onclick =
    () => {
      $("#customizer")
        .classList.remove("open");

      $("#customizer")
        .setAttribute(
          "aria-hidden",
          "true"
        );
    };


  $("#customizer").addEventListener(
    "click",
    e => {
      if (
        e.target ===
        e.currentTarget
      ) {
        $("#customizer")
          .classList.remove(
            "open"
          );
      }
    }
  );
}


function enableDragDrop() {
  if (isTouch) return;

  document.addEventListener(
    "dragover",
    e => {
      if (
        e.dataTransfer?.types.includes(
          "Files"
        )
      ) {
        e.preventDefault();

        document.body.classList.add(
          "dragging"
        );
      }
    }
  );


  document.addEventListener(
    "dragleave",
    () => {
      document.body.classList.remove(
        "dragging"
      );
    }
  );


  document.addEventListener(
    "drop",
    e => {
      if (
        !e.dataTransfer?.files?.length
      ) {
        return;
      }

      e.preventDefault();

      document.body.classList.remove(
        "dragging"
      );

      const file =
        e.dataTransfer.files[0];

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        return showToast(
          "Drop an image file."
        );
      }

      const i =
        +$("#slotSelect").value;

      const reader =
        new FileReader();

      reader.onload =
        () => {
          localOverrides[i] = {
            data: reader.result,

            caption:
              memories[i].caption
          };

          localStorage.setItem(
            "birthdayPhotoOverrides",
            JSON.stringify(
              localOverrides
            )
          );

          refreshAllPhotos();

          buildGallery();

          showToast(
            `Dropped image into PHOTO ${i + 1}.`
          );
        };

      reader.readAsDataURL(file);
    }
  );
}


/* ============================================================
   CANVAS VFX / FIREWORKS
   ============================================================ */

const canvas = $("#vfxCanvas");

const ctx =
  canvas.getContext("2d");

const DPR =
  Math.min(
    devicePixelRatio || 1,
    2
  );

let W;
let H;

let particles = [];

let fireworks = [];

let lastFrame =
  performance.now();

let lowPower = false;


function resizeCanvas() {
  W = innerWidth;

  H = innerHeight;

  canvas.width =
    W * DPR;

  canvas.height =
    H * DPR;

  canvas.style.width =
    W + "px";

  canvas.style.height =
    H + "px";

  ctx.setTransform(
    DPR,
    0,
    0,
    DPR,
    0,
    0
  );
}


resizeCanvas();

addEventListener(
  "resize",
  resizeCanvas
);

lowPower =
  isTouch ||
  innerWidth < 700;


function rand(a, b) {
  return Math.random() *
    (b - a) +
    a;
}


function addParticle(
  x,
  y,
  opt = {}
) {
  particles.push({
    x,
    y,

    vx:
      opt.vx ??
      rand(-1, 1),

    vy:
      opt.vy ??
      rand(-1.5, 1),

    life:
      opt.life ??
      rand(35, 80),

    max:
      opt.life ??
      70,

    size:
      opt.size ??
      rand(1, 3),

    hue:
      opt.hue ??
      rand(320, 355),

    gravity:
      opt.gravity ??
      .018,

    drag:
      opt.drag ??
      .985,

    heart:
      !!opt.heart
  });
}


function burst(
  x,
  y,
  count = lowPower ? 45 : 95,
  hue = rand(0, 360),
  shape = "circle"
) {
  safePlay(audio.firework);

  for (
    let i = 0;
    i < count;
    i++
  ) {
    let a =
      rand(
        0,
        Math.PI * 2
      );

    let sp =
      rand(1.2, 5.6);

    let vx =
      Math.cos(a) * sp;

    let vy =
      Math.sin(a) * sp;


    if (shape === "heart") {
      const t =
        rand(
          0,
          Math.PI * 2
        );

      const s =
        rand(1.2, 3.2);

      vx =
        16 *
        Math.pow(
          Math.sin(t),
          3
        ) *
        .18 *
        s;

      vy =
        -(
          13 *
            Math.cos(t) -
          5 *
            Math.cos(2 * t) -
          2 *
            Math.cos(3 * t) -
          Math.cos(4 * t)
        ) *
        .18 *
        s;

    } else if (
      shape === "star"
    ) {
      a =
        Math.floor(i % 10) *
        Math.PI /
        5;

      sp =
        rand(1, 5);

      vx =
        Math.cos(a) * sp;

      vy =
        Math.sin(a) * sp;
    }


    addParticle(
      x,
      y,
      {
        vx,
        vy,
        life: rand(45, 100),
        size: rand(1, 3),
        hue:
          hue +
          rand(-18, 18),
        gravity: .035
      }
    );
  }


  particles.push({
    x,
    y,
    vx: 0,
    vy: 0,
    life: 18,
    max: 18,
    size: 2,
    hue,
    shock: true
  });
}


function launchFirework(
  x =
    rand(
      W * .15,
      W * .85
    ),

  targetY =
    rand(
      H * .16,
      H * .48
    ),

  shape = "circle"
) {
  const startY =
    H + 20;

  fireworks.push({
    x,
    y: startY,

    vx:
      rand(-.5, .5),

    vy:
      rand(-10, -7),

    targetY,

    shape,

    hue:
      rand(320, 350),

    trail: []
  });
}


function updateVFX(t) {
  ctx.clearRect(
    0,
    0,
    W,
    H
  );


  if (!reducedMotion) {

    if (
      Math.random() <
      (lowPower ? .008 : .018)
    ) {
      launchFirework();
    }


    fireworks.forEach(
      (f, i) => {

        f.trail.push({
          x: f.x,
          y: f.y
        });

        if (
          f.trail.length >
          10
        ) {
          f.trail.shift();
        }


        f.x += f.vx;

        f.y += f.vy;

        f.vy += .1;


        ctx.beginPath();

        ctx.moveTo(
          f.x,
          f.y
        );

        ctx.lineTo(
          f.x,
          f.y + 14
        );

        ctx.strokeStyle =
          `hsla(${f.hue},100%,75%,.7)`;

        ctx.stroke();


        if (
          f.y <=
          f.targetY
        ) {
          burst(
            f.x,
            f.y,
            lowPower
              ? 40
              : 90,
            f.hue,
            f.shape
          );

          fireworks.splice(
            i,
            1
          );
        }
      }
    );


    for (
      let i =
        particles.length - 1;
      i >= 0;
      i--
    ) {

      const p =
        particles[i];

      p.x += p.vx;

      p.y += p.vy;

      p.vx *= p.drag;

      p.vy =
        p.vy *
          p.drag +
        p.gravity;

      p.life--;


      const alpha =
        Math.max(
          0,
          p.life /
            p.max
        );


      ctx.beginPath();


      if (p.shock) {

        ctx.arc(
          p.x,
          p.y,
          (1 - alpha) *
            55,
          0,
          Math.PI * 2
        );

        ctx.strokeStyle =
          `hsla(${p.hue},100%,75%,${alpha * .5})`;

        ctx.stroke();

      } else {

        ctx.arc(
          p.x,
          p.y,
          p.size,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          `hsla(${p.hue},100%,${70 + 20 * alpha}%,${alpha})`;

        ctx.fill();
      }


      if (
        p.life <= 0
      ) {
        particles.splice(
          i,
          1
        );
      }
    }
  }


  requestAnimationFrame(
    updateVFX
  );
}


requestAnimationFrame(
  updateVFX
);


/* ============================================================
   CELEBRATION
   ============================================================ */

function megaCelebration() {

  for (
    let i = 0;
    i < (lowPower ? 4 : 10);
    i++
  ) {

    setTimeout(
      () =>
        launchFirework(
          rand(
            W * .08,
            W * .92
          ),

          rand(
            H * .12,
            H * .55
          ),

          [
            "circle",
            "heart",
            "star"
          ][i % 3]
        ),

      i * 180
    );
  }


  for (
    let i = 0;
    i < (lowPower ? 80 : 180);
    i++
  ) {

    addParticle(
      rand(0, W),
      -10,
      {
        vy: rand(1, 4),
        vx: rand(-1, 1),
        life: rand(100, 220),
        size: rand(1, 4),
        hue: rand(320, 45),
        gravity: .025
      }
    );
  }


  if (
    navigator.vibrate
  ) {
    navigator.vibrate(
      [30, 40, 70]
    );
  }
}


/* ============================================================
   SECRET PARTICLE TEXT
   ============================================================ */

function secretParticleText(text) {

  const off =
    document.createElement(
      "canvas"
    );

  const o =
    off.getContext("2d");

  const s =
    Math.min(
      130,
      W /
        Math.max(
          5,
          text.length
        ) *
        1.6
    );


  off.width = W;

  off.height =
    Math.min(
      260,
      H * .45
    );


  o.fillStyle =
    "#fff";

  o.font =
    `700 ${s}px Playfair Display`;

  o.textAlign =
    "center";

  o.textBaseline =
    "middle";

  o.fillText(
    text,
    W / 2,
    off.height / 2
  );


  const data =
    o.getImageData(
      0,
      0,
      off.width,
      off.height
    ).data;


  const step =
    lowPower ? 8 : 5;


  for (
    let y = 0;
    y < off.height;
    y += step
  ) {

    for (
      let x = 0;
      x < W;
      x += step
    ) {

      if (
        data[
          (y * W + x) *
          4 +
          3
        ] > 100
      ) {

        addParticle(
          x,
          y + H * .25,
          {
            vx: rand(-.3, .3),
            vy: rand(-.15, .15),
            life: 150,
            max: 150,
            size: rand(1, 2.5),
            hue: rand(320, 350),
            gravity: 0
          }
        );
      }
    }
  }
}


/* ============================================================
   LOADING
   ============================================================ */

function boot() {

  const bar =
    $("#loadBar");

  const pct =
    $("#loadPercent");

  const ready =
    $("#readyText");

  let n = 0;


  const timer =
    setInterval(
      () => {

        n +=
          Math.floor(
            rand(4, 13)
          );


        if (n > 100) {
          n = 100;
        }


        bar.style.width =
          n + "%";

        pct.textContent =
          n + "%";


        if (n >= 100) {

          clearInterval(
            timer
          );

          ready.textContent =
            "Ready?";


          setTimeout(
            () => {

              ready.textContent =
                "Let's begin.";


              setTimeout(
                () => {

                  $("#loadingScreen")
                    .classList.add(
                      "done"
                    );

                  $("#experience")
                    .classList.remove(
                      "locked"
                    );

                  startExperience();

                },
                800
              );

            },
            700
          );
        }

      },
      90
    );
}


/* ============================================================
   START EXPERIENCE
   ============================================================ */

function startExperience() {

  buildGallery();

  buildPhotoSlots();

  setupCustomizer();

  enableDragDrop();

  setupChapters();

  setupObservers();

  setupInteractions();

  setupCursor();

  setupLoveLetter();

  setupProposal();


  $("#birthdayName").textContent =
    FRIEND_NAME;

  $("#birthdayTitle").innerHTML =
    `HAPPY BIRTHDAY <span>❤️</span>`;


  if (reducedMotion) {
    $("#experience")
      .classList.remove(
        "locked"
      );
  }
}


/* ============================================================
   CHAPTER NAVIGATION
   ============================================================ */

function setupChapters() {

  const nav =
    $("#chapterNav");

  if (!nav) return;

  nav.innerHTML = "";


  for (
    let i = 0;
    i < CHAPTERS;
    i++
  ) {

    const b =
      document.createElement(
        "button"
      );

    b.className =
      "chapter-dot";

    b.dataset.chapter =
      i;

    b.title =
      `Chapter ${i + 1}`;


    b.onclick =
      () => {

        const section =
          document.querySelector(
            `#chapter${i}`
          );

        if (section) {
          section.scrollIntoView({
            behavior:
              reducedMotion
                ? "auto"
                : "smooth"
          });
        }
      };


    nav.appendChild(b);
  }


  const io =
    new IntersectionObserver(
      entries =>
        entries.forEach(
          e => {

            if (
              e.isIntersecting
            ) {

              const n =
                +e.target.dataset.chapter;


              $$(".chapter-dot")
                .forEach(
                  (d, i) =>
                    d.classList.toggle(
                      "active",
                      i === n
                    )
                );


              onChapter(n);
            }

          }
        ),
      {
        threshold: .5
      }
    );


  $$(".chapter")
    .forEach(
      s => io.observe(s)
    );
}


const chapterSeen =
  new Set();


function onChapter(n) {

  if (
    chapterSeen.has(n)
  ) {
    return;
  }


  chapterSeen.add(n);


  if (n === 1) {

    setTimeout(
      () =>
        $(".cinematic-slot")
          ?.classList.add(
            "visible"
          ),
      250
    );

    spawnAmbient(18);
  }


  if (n === 2) {
    spawnAmbient(22);
  }


  if (n === 4) {

    setTimeout(
      () =>
        $("#collage")
          ?.classList.add(
            "heart"
          ),
      1000
    );
  }


  if (n === 5) {
    playBirthdayReveal();
  }


  if (n === 7) {
    animateMessage();
  }


  if (n === 9) {
    animateLoveLetter();
  }


  if (n === 10) {
    prepareProposal();
  }
}


/* ============================================================
   OBSERVERS
   ============================================================ */

function setupObservers() {

  const io =
    new IntersectionObserver(
      es =>
        es.forEach(
          e => {

            if (
              e.isIntersecting
            ) {
              e.target.classList.add(
                "in-view"
              );
            }

          }
        ),
      {
        threshold: .25
      }
    );


  $$(".chapter")
    .forEach(
      s => io.observe(s)
    );
}


/* ============================================================
   AMBIENT PARTICLES
   ============================================================ */

function spawnAmbient(count) {

  for (
    let i = 0;
    i < count;
    i++
  ) {

    addParticle(
      rand(0, W),
      rand(0, H),
      {
        vx: rand(-.15, .15),
        vy: rand(-.15, .1),
        life: rand(80, 180),
        size: rand(.5, 1.8),
        hue: rand(300, 350),
        gravity: -.002
      }
    );
  }
}


/* ============================================================
   BIRTHDAY REVEAL
   ============================================================ */

function playBirthdayReveal() {

  const a =
    $("#revealLine1");

  const b =
    $("#revealLine2");

  const n =
    $("#birthdayName");

  const t =
    $("#birthdayTitle");


  setTimeout(
    () =>
      a?.classList.add(
        "show"
      ),
    400
  );


  setTimeout(
    () =>
      b?.classList.add(
        "show"
      ),
    1900
  );


  setTimeout(
    () => {

      n?.classList.add(
        "show"
      );

      megaCelebration();

      safePlay(
        audio.whoosh
      );

    },
    3200
  );


  setTimeout(
    () =>
      t?.classList.add(
        "show"
      ),
    4600
  );
}


/* ============================================================
   GIFT
   ============================================================ */

if ($("#giftButton")) {

  $("#giftButton").addEventListener(
    "click",
    () => {

      if (giftOpened) {
        return;
      }


      giftOpened = true;


      $("#giftButton")
        .classList.add(
          "open"
        );


      $("#giftHint").textContent =
        "Here we go...";


      safePlay(
        audio.magic
      );


      megaCelebration();


      setTimeout(
        () => {

          document.body.animate(
            [
              {
                filter:
                  "brightness(1)"
              },

              {
                filter:
                  "brightness(2.2)"
              },

              {
                filter:
                  "brightness(1)"
              }
            ],
            {
              duration: 700
            }
          );


          showToast(
            "SURPRISE! ❤️"
          );

        },
        600
      );


      setTimeout(
        () => {

          $("#chapter7")
            ?.scrollIntoView({
              behavior:
                "smooth"
            });

        },
        1800
      );
    }
  );
}


/* ============================================================
   EXISTING HEARTFELT MESSAGE
   ============================================================ */

function animateMessage() {

  const lines = [

    "Jokes apart...",

    "Some people make life brighter simply by being there.",

    "You are one of those people.",

    "Thank you for every laugh.",

    "Every crazy conversation.",

    "Every unforgettable memory.",

    "And every moment you've been there.",

    "I hope this new year of your life brings you everything you deserve.",

    "Keep smiling.",

    "Keep being crazy.",

    "Keep being YOU.",

    `Happy Birthday, ${FRIEND_NAME} ❤️`

  ];


  const box =
    $("#heartfeltMessage");

  if (!box) return;


  box.innerHTML = "";


  lines.forEach(
    (line, i) => {

      const p =
        document.createElement(
          "p"
        );

      p.className =
        "message-line";

      p.textContent =
        line;

      box.appendChild(p);


      setTimeout(
        () =>
          p.classList.add(
            "show"
          ),
        i * 500 + 150
      );
    }
  );
}


/* ============================================================
   SECRET
   ============================================================ */

if ($("#secretButton")) {

  $("#secretButton").addEventListener(
    "click",
    () => {

      if (secretTriggered) {
        return;
      }


      secretTriggered = true;


      $("#secretButton").style.display =
        "none";


      $("#secretPrompt").textContent =
        "";


      document.body.animate(
        [
          {
            filter:
              "brightness(1)"
          },

          {
            filter:
              "brightness(.08)"
          },

          {
            filter:
              "brightness(.3)"
          }
        ],
        {
          duration: 1100
        }
      );


      setTimeout(
        () => {

          $("#secretName").textContent =
            FRIEND_NAME;

          $("#secretName")
            .classList.add(
              "show"
            );

          secretParticleText(
            FRIEND_NAME
          );

        },
        1200
      );


      setTimeout(
        () => {

          $("#secretFinal").textContent =
            "HAPPY BIRTHDAY ❤️";

          $("#secretFinal")
            .classList.add(
              "show"
            );

          megaCelebration();

          megaCelebration();

        },
        3600
      );
    }
  );
}


/* ============================================================
   LOVE LETTER
   ============================================================ */

function setupLoveLetter() {

  const letter =
    $("#chapter9");

  if (!letter) {
    return;
  }


  letter.addEventListener(
    "click",
    e => {

      if (
        e.target.closest(
          "button"
        )
      ) {
        return;
      }


      if (
        Math.random() <
        .25
      ) {

        burst(
          e.clientX,
          e.clientY,
          lowPower
            ? 10
            : 18,
          340,
          "heart"
        );
      }
    }
  );
}


function animateLoveLetter() {

  const card =
    document.querySelector(
      ".love-letter-card"
    );

  if (!card) return;


  card.classList.add(
    "letter-visible"
  );


  const paragraphs =
    card.querySelectorAll(
      ".love-letter-content p"
    );


  paragraphs.forEach(
    (p, i) => {

      setTimeout(
        () => {

          p.classList.add(
            "letter-line-visible"
          );

        },
        i * 450 + 300
      );
    }
  );


  setTimeout(
    () => {

      burst(
        W / 2,
        H * .5,
        lowPower
          ? 25
          : 50,
        345,
        "heart"
      );

    },
    1200
  );
}


/* ============================================================
   PROPOSAL SECTION
   ============================================================ */

function setupProposal() {

  const yesButton =
    $("#yesButton");

  const noButton =
    $("#noButton");


  if (!yesButton) {
    return;
  }


  yesButton.addEventListener(
    "click",
    acceptProposal
  );


  if (noButton) {

    noButton.addEventListener(
      "mouseenter",
      escapeNoButton
    );


    noButton.addEventListener(
      "mouseover",
      escapeNoButton
    );


    noButton.addEventListener(
      "pointerdown",
      e => {

        e.preventDefault();

        escapeNoButton();
      }
    );


    noButton.addEventListener(
      "touchstart",
      e => {

        e.preventDefault();

        escapeNoButton();
      },
      {
        passive: false
      }
    );


    noButton.addEventListener(
      "click",
      e => {

        e.preventDefault();

        escapeNoButton();
      }
    );
  }
}


/* ============================================================
   PROPOSAL PREPARATION
   ============================================================ */

function prepareProposal() {

  const heart =
    $("#proposalHeart");


  if (!heart) {
    return;
  }


  if (
    proposalAccepted
  ) {
    return;
  }


  heart.classList.add(
    "proposal-heart-active"
  );


  setTimeout(
    () => {

      createProposalHeartBurst();

    },
    800
  );
}


/* ============================================================
   ANIMATED HEART
   ============================================================ */

function createProposalHeartBurst() {

  const section =
    $("#chapter10");

  if (!section) {
    return;
  }


  const rect =
    section.getBoundingClientRect();


  const centerX =
    rect.width / 2;


  const centerY =
    Math.min(
      rect.height * .38,
      360
    );


  for (
    let i = 0;
    i < (lowPower ? 20 : 45);
    i++
  ) {

    const angle =
      (Math.PI * 2 * i) /
      (lowPower ? 20 : 45);


    const speed =
      rand(1.2, 3.5);


    addParticle(
      centerX,
      centerY,
      {
        vx:
          Math.cos(angle) *
          speed,

        vy:
          Math.sin(angle) *
          speed,

        life:
          rand(50, 110),

        size:
          rand(1, 3),

        hue:
          rand(330, 355),

        gravity:
          .015,

        heart: true
      }
    );
  }
}


/* ============================================================
   NO BUTTON — ESCAPE
   ============================================================ */

function escapeNoButton() {

  const noButton =
    $("#noButton");


  if (!noButton) {
    return;
  }


  if (proposalAccepted) {
    return;
  }


  noButtonEscaping = true;


  const container =
    document.querySelector(
      ".proposal-buttons"
    );


  if (!container) {
    return;
  }


  const containerRect =
    container.getBoundingClientRect();


  const buttonRect =
    noButton.getBoundingClientRect();


  const maxX =
    Math.max(
      0,
      containerRect.width -
      buttonRect.width
    );


  const maxY =
    Math.max(
      0,
      containerRect.height -
      buttonRect.height
    );


  let x =
    rand(
      -maxX / 2,
      maxX / 2
    );


  let y =
    rand(
      -maxY / 2,
      maxY / 2
    );


  if (
    Math.abs(x) < 80
  ) {
    x +=
      x >= 0
        ? 120
        : -120;
  }


  if (
    Math.abs(y) < 40
  ) {
    y +=
      y >= 0
        ? 70
        : -70;
  }


  noButton.style.position =
    "relative";


  noButton.style.transform =
    `translate(${x}px, ${y}px) rotate(${rand(-8, 8)}deg)`;


  const messages = [
    "Nope 😌",
    "Try again 😂",
    "Ayyoo 😂",
    "You can't catch me 😭",
    "Nice try 😏",
    "No option here ❤️",
    "Think again 🥹",
    "Only YES works 🤌",
    "Catch me if you can 😂",
    "Adi work avvadhu 😭"
  ];


  showToast(
    messages[
      Math.floor(
        Math.random() *
        messages.length
      )
    ]
  );


  burst(
    containerRect.left +
      containerRect.width / 2,

    containerRect.top +
      containerRect.height / 2,

    lowPower
      ? 8
      : 16,

    345,

    "heart"
  );
}


/* ============================================================
   YES — PROPOSAL ACCEPTED
   ============================================================ */

function acceptProposal() {

  if (proposalAccepted) {
    return;
  }


  proposalAccepted = true;


  const yesButton =
    $("#yesButton");

  const noButton =
    $("#noButton");

  const proposalButtons =
    $(".proposal-buttons");

  const response =
    $("#proposalResponse");


  if (yesButton) {

    yesButton.classList.add(
      "accepted"
    );

    yesButton.disabled =
      true;
  }


  if (noButton) {

    noButton.style.display =
      "none";
  }


  if (proposalButtons) {

    proposalButtons.classList.add(
      "accepted"
    );
  }


  megaCelebration();

  megaCelebration();


  createMassiveHeartAnimation();


  setTimeout(
    () => {

      if (!response) {
        return;
      }


      response.innerHTML = `
        <div class="proposal-response-inner">

          <div class="response-heart">
            ❤️
          </div>

          <p>
            Ayyo really respected ahh ... 🥹❤️
          </p>

          <p>
            Ippudu naa face meedha smile endhuku
            vachindho nene cheppalsina avasaram
            ledhu kadha 😭😂❤️
          </p>

          <div class="response-signature">
            — Jey ❤️
          </div>

        </div>
      `;


      response.classList.add(
        "show"
      );


      response.scrollIntoView({
        behavior:
          reducedMotion
            ? "auto"
            : "smooth",

        block: "center"
      });


      showToast(
        "She said YES! ❤️🥹"
      );

    },
    900
  );
}


/* ============================================================
   MASSIVE HEART ANIMATION
   ============================================================ */

function createMassiveHeartAnimation() {

  const section =
    $("#chapter10");


  if (!section) {
    return;
  }


  const heart =
    $("#proposalHeart");


  if (heart) {

    heart.classList.add(
      "massive-heart"
    );


    heart.animate(
      [
        {
          transform:
            "scale(1)"
        },

        {
          transform:
            "scale(1.35)"
        },

        {
          transform:
            "scale(.95)"
        },

        {
          transform:
            "scale(1.15)"
        },

        {
          transform:
            "scale(1)"
        }
      ],
      {
        duration:
          1800,

        easing:
          "ease-in-out"
      }
    );
  }


  for (
    let i = 0;
    i < (lowPower ? 100 : 220);
    i++
  ) {

    const angle =
      Math.random() *
      Math.PI *
      2;


    const distance =
      rand(
        20,
        Math.min(
          W,
          H
        ) * .55
      );


    addParticle(
      W / 2,
      H / 2,
      {
        vx:
          Math.cos(angle) *
          distance /
          35,

        vy:
          Math.sin(angle) *
          distance /
          35,

        life:
          rand(80, 180),

        size:
          rand(1, 4),

        hue:
          rand(325, 355),

        gravity:
          .012,

        heart: true
      }
    );
  }
}


/* ============================================================
   EASTER EGGS
   ============================================================ */

function setupInteractions() {

  let typed = "";


  document.addEventListener(
    "keydown",
    e => {

      if (
        e.key.length === 1
      ) {

        typed =
          (
            typed +
            e.key
          )
            .toUpperCase()
            .slice(
              -FRIEND_NAME.length
            );


        if (
          typed ===
          FRIEND_NAME
        ) {

          megaCelebration();

          showToast(
            "You found the hidden fireworks ❤️"
          );

          typed = "";
        }
      }
    }
  );


  let taps = 0;

  let timer;


  if ($("#birthdayName")) {

    $("#birthdayName")
      .addEventListener(
        "click",
        () => {

          taps++;

          clearTimeout(
            timer
          );


          timer =
            setTimeout(
              () =>
                taps = 0,
              1200
            );


          if (
            taps === 5
          ) {

            burst(
              W / 2,
              H / 2,
              lowPower
                ? 60
                : 140,
              340,
              "heart"
            );


            showToast(
              "Five clicks. You found it."
            );


            taps = 0;
          }
        }
      );
  }


  document.addEventListener(
    "dblclick",
    e => {

      if (
        e.target.closest(
          "button,.viewer,.customizer,input,select"
        )
      ) {
        return;
      }


      for (
        let i = 0;
        i < (lowPower ? 20 : 45);
        i++
      ) {

        addParticle(
          e.clientX,
          e.clientY,
          {
            vx: rand(-3, 3),
            vy: rand(-3, 3),
            life: rand(40, 90),
            heart: true,
            hue: rand(320, 350)
          }
        );
      }
    }
  );


  let pressTimer;


  if ($("#birthdayName")) {

    $("#birthdayName")
      .addEventListener(
        "touchstart",
        () => {

          pressTimer =
            setTimeout(
              () => {

                showToast(
                  "You found the secret ❤️"
                );


                burst(
                  W / 2,
                  H * .5,
                  lowPower
                    ? 50
                    : 100,
                  345,
                  "heart"
                );

              },
              900
            );

        },
        {
          passive: true
        }
      );


    $("#birthdayName")
      .addEventListener(
        "touchend",
        () =>
          clearTimeout(
            pressTimer
          ),
        {
          passive: true
        }
      );
  }
}


/* ============================================================
   CURSOR
   ============================================================ */

function setupCursor() {

  if (isTouch) {
    return;
  }


  const glow =
    $("#cursorGlow");

  const dot =
    $("#cursorDot");


  document.addEventListener(
    "mousemove",
    e => {

      if (glow) {

        glow.style.cssText =
          `
          position:fixed;
          left:${e.clientX}px;
          top:${e.clientY}px;
          width:170px;
          height:170px;
          transform:translate(-50%,-50%);
          border-radius:50%;
          pointer-events:none;
          z-index:19;
          background:radial-gradient(
            circle,
            rgba(255,105,176,.12),
            transparent 65%
          );
          filter:blur(5px)
          `;
      }


      if (dot) {

        dot.style.cssText =
          `
          position:fixed;
          left:${e.clientX}px;
          top:${e.clientY}px;
          width:5px;
          height:5px;
          transform:translate(-50%,-50%);
          border-radius:50%;
          pointer-events:none;
          z-index:60;
          background:#fff;
          box-shadow:
            0 0 15px 4px
            rgba(255,120,190,.7)
          `;
      }


      if (
        Math.random() < .15
      ) {

        addParticle(
          e.clientX,
          e.clientY,
          {
            vx: rand(-.4, .4),
            vy: rand(-.4, .4),
            life: 25,
            size: rand(.5, 1.4),
            hue: rand(320, 350),
            gravity: 0
          }
        );
      }
    }
  );


  document.addEventListener(
    "click",
    e => {

      if (
        e.target.closest(
          "button,a"
        )
      ) {

        burst(
          e.clientX,
          e.clientY,
          lowPower
            ? 8
            : 14,
          335,
          "star"
        );
      }
    }
  );
}


/* ============================================================
   FLOATING MEMORY TILT
   ============================================================ */

const floating =
  $(".floating-slot");


document.addEventListener(
  "mousemove",
  e => {

    if (
      isTouch ||
      !floating
    ) {
      return;
    }


    const r =
      floating.getBoundingClientRect();


    if (
      r.top > innerHeight ||
      r.bottom < 0
    ) {
      return;
    }


    const x =
      (e.clientX - r.left) /
        r.width -
      .5;


    const y =
      (e.clientY - r.top) /
        r.height -
      .5;


    floating.style.transform =
      `
      rotateX(${-y * 10}deg)
      rotateY(${x * 12}deg)
      rotateZ(1deg)
      `;
  }
);


if (isTouch) {

  let sx = 0;

  let sy = 0;


  addEventListener(
    "touchmove",
    e => {

      const t =
        e.touches[0];


      sx =
        (
          t.clientX /
          innerWidth -
          .5
        ) * 5;


      sy =
        (
          t.clientY /
          innerHeight -
          .5
        ) * 5;


      if (floating) {

        floating.style.transform =
          `
          rotateX(${-sy}deg)
          rotateY(${sx}deg)
          rotateZ(1deg)
          `;
      }

    },
    {
      passive: true
    }
  );
}


/* ============================================================
   MUSIC
   ============================================================ */

if ($("#musicToggle")) {

  $("#musicToggle")
    .addEventListener(
      "click",
      async () => {

        audioEnabled =
          !audioEnabled;


        if (audioEnabled) {

          try {

            await audio.bg.play();


            $("#musicToggle")
              .textContent =
              "🎵 MAGIC IS ON";

          } catch {

            audioEnabled =
              false;


            showToast(
              "Add assets/music/birthday.mp3 to enable music."
            );
          }

        } else {

          audio.bg.pause();


          $("#musicToggle")
            .textContent =
            "🎵 TURN ON THE MAGIC";
        }
      }
    );
}


/* ============================================================
   AUDIO ERROR HANDLING
   ============================================================ */

[
  audio.bg,
  audio.click,
  audio.whoosh,
  audio.firework,
  audio.magic
].forEach(
  a =>
    a?.addEventListener(
      "error",
      () => {}
    )
);

/* ---------- Love Letter Fullscreen ---------- */

const loveLetterOpen = $("#loveLetterOpen");
const loveLetterFullscreen = $("#loveLetterFullscreen");
const loveLetterClose = $("#loveLetterClose");

if(loveLetterOpen && loveLetterFullscreen){

  loveLetterOpen.addEventListener("click",()=>{

    loveLetterFullscreen.classList.add("open");
    loveLetterFullscreen.setAttribute("aria-hidden","false");

    document.body.classList.add("letter-open");

    safePlay(audio.magic);

    /* small celebration */
    if(typeof burst === "function"){
      burst(
        innerWidth / 2,
        innerHeight / 2,
        lowPower ? 25 : 55,
        340,
        "heart"
      );
    }
  });

}

if(loveLetterClose){

  loveLetterClose.addEventListener("click",()=>{

    loveLetterFullscreen.classList.remove("open");
    loveLetterFullscreen.setAttribute("aria-hidden","true");

    document.body.classList.remove("letter-open");

  });

}

document.addEventListener("keydown",e=>{

  if(e.key === "Escape" &&
     loveLetterFullscreen?.classList.contains("open")){

    loveLetterFullscreen.classList.remove("open");
    loveLetterFullscreen.setAttribute("aria-hidden","true");

    document.body.classList.remove("letter-open");

  }

});


/* ============================================================
   FINAL GIFT BOX
   ============================================================ */

const finalGiftBox = $("#finalGiftBox");
const finalGiftMessage = $("#finalGiftMessage");

if (finalGiftBox && finalGiftMessage) {

  finalGiftBox.addEventListener("click", () => {

    if (finalGiftBox.classList.contains("open")) return;

    finalGiftBox.classList.add("open");

    safePlay(audio.magic);

    /* Fireworks */
    if (typeof megaCelebration === "function") {
      megaCelebration();
    }

    /* Open final message */
    setTimeout(() => {

      finalGiftMessage.classList.add("show");

      document.body.classList.add("letter-open");

      /* Extra heart burst */
      if (typeof burst === "function") {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            burst(
              innerWidth * (0.2 + Math.random() * 0.6),
              innerHeight * (0.2 + Math.random() * 0.5),
              lowPower ? 20 : 45,
              340,
              "heart"
            );
          }, i * 350);
        }
      }

    }, 900);

  });

}
/* ============================================================
   START
   ============================================================ */

boot();