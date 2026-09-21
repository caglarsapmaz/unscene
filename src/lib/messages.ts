export const en = {
  brand: "unscene",
  name: "Unscene",
  skip: "Skip to the tool",
  backToTop: "Back to top",
  header: {
    github: "GitHub",
    githubLabel: "Unscene on GitHub (opens in a new tab)",
    language: "Language",
    theme: "Theme",
    light: "Light theme",
    dark: "Dark theme",
  },
  hero: {
    chip: "01 / Upload",
    line1a: "Remove the",
    line1b: "background.",
    line2: "Keep the subject.",
    lede: "Free, private, and ridiculously simple.",
    trust: ["No account.", "No ads.", "Your image stays in your browser."],
  },
  upload: {
    title: "Drop your image here",
    browse: "or click to browse",
    formats: "JPG · JPEG · PNG · WEBP",
    hint: "Max 25 MB · or paste with Ctrl/⌘ + V",
    release: "Release to start",
    aria: "Choose an image. JPG, PNG or WEBP, up to 25 MB.",
  },
  demo: {
    original: "Original",
    transparent: "Transparent",
    result: "Result",
    slider: "Preview: drag from original to result",
  },
  working: {
    label: "01 / Working",
    stages: {
      decode: "Preparing image…",
      download: "Preparing the background remover for your browser…",
      init: "Warming up the model…",
      infer: "Removing background…",
      compose: "Almost there…",
    },
    local: "This runs on your device. Nothing is uploaded.",
    firstRun: "First visit only. The model is about {mb} MB and is cached after this.",
    model: "Model",
    cpuFallback: "WebGPU isn't available here, so this runs on the CPU. A bit slower, same result.",
    cancel: "Cancel",
  },
  result: {
    label: "02 / Result",
    original: "Original",
    transparent: "Transparent",
    download: "Download PNG",
    startOver: "Start over",
    compare: "Compare original and result",
    kept: "Your image never left this tab.",
    gpu: "GPU",
    cpu: "CPU",
    altOriginal: "Your original image",
    altResult: "Your image with the background removed, on a checkerboard",
    file: "File",
    size: "Size",
    engine: "Engine",
    time: "Time",
  },
  errors: {
    cancelled: "Cancelled. Drop another image whenever you're ready.",
    retry: "Try another image",
    type: "That file type isn't supported. Use a JPG, PNG or WEBP image.",
    size: "This file is over 25 MB. Try a smaller copy, or export it at a lower quality.",
    decode: "We couldn't read this image. It may be corrupted. Try re-saving it as a JPG or PNG.",
    unsupported:
      "This browser is missing something the remover needs (WebAssembly, Web Workers or OffscreenCanvas). Update it, or try a recent Chrome, Edge, Firefox or Safari.",
    model:
      "We couldn't download the model. Check your connection and try again. After one successful load it's cached and works offline.",
    memory:
      "Your device ran out of memory on this image. Close other tabs, or try a smaller image. Under 2000 px works almost everywhere.",
    runtime: "We couldn't process this image. Try a smaller JPG or PNG, or reload the page.",
  },
  how: {
    label: "How it works",
    title: "Just 3 simple steps.",
    steps: [
      { n: "01", t: "Upload", d: "Drop your image or click to select." },
      { n: "02", t: "Remove", d: "The browser removes the background." },
      { n: "03", t: "Download", d: "Save your transparent PNG in seconds." },
    ],
  },
  privacy: {
    label: "Privacy",
    title: "Your image stays in your browser.",
    items: [
      {
        q: "Where is my image processed?",
        a: "On your device, inside this tab. A Web Worker runs the model locally. Your image is never sent to a server.",
      },
      {
        q: "What does get downloaded?",
        a: "The app itself, and the first time you use it, the model file (about 46 to 88 MB depending on your device). That's a download to you. Your image isn't part of it. Like any host, Vercel and Hugging Face see standard request data such as your IP address.",
      },
      {
        q: "How long is my image kept?",
        a: "Only in memory while this tab is open. Start over or close the tab and it's gone. There is no server copy, because we never receive one.",
      },
      {
        q: "Does it use my browser cache?",
        a: "Yes, for the model only. It's stored in Cache Storage so later visits skip the download. Your images are never cached. Clear site data to remove it.",
      },
      {
        q: "Where does the model come from?",
        a: "IS-Net (general use) by Xuebin Qin et al., Apache-2.0, exported to ONNX by the rembg project (MIT) and run with ONNX Runtime Web (MIT). Full details are in the README.",
      },
      {
        q: "Analytics, cookies, accounts?",
        a: "None. Your language and theme choice are saved in localStorage on your device, and that's all.",
      },
    ],
  },
  footer: {
    tagline: "Made for the open web.",
    credit: "© 2026 Unscene — Made by Çağlar Sapmaz",
    love: "love",
    linkedin: "LinkedIn",
    linkedinLabel: "Çağlar Sapmaz on LinkedIn (opens in a new tab)",
    github: "GitHub",
    githubLabel: "Çağlar Sapmaz on GitHub (opens in a new tab)",
  },
};

export type Messages = typeof en;

export const tr: Messages = {
  brand: "unscene",
  name: "Unscene",
  skip: "Araca geç",
  backToTop: "Sayfanın başına dön",
  header: {
    github: "GitHub",
    githubLabel: "Unscene GitHub'da (yeni sekmede açılır)",
    language: "Dil",
    theme: "Tema",
    light: "Açık tema",
    dark: "Koyu tema",
  },
  hero: {
    chip: "01 / Yükle",
    line1a: "Arka plan",
    line1b: "gitsin.",
    line2: "Konu kalsın.",
    lede: "Ücretsiz, gizli ve fazlasıyla basit.",
    trust: ["Hesap yok.", "Reklam yok.", "Görselin tarayıcında kalır."],
  },
  upload: {
    title: "Görselini buraya bırak",
    browse: "ya da tıklayıp seç",
    formats: "JPG · JPEG · PNG · WEBP",
    hint: "En fazla 25 MB · ya da Ctrl/⌘ + V ile yapıştır",
    release: "Bırak, başlasın",
    aria: "Bir görsel seç. JPG, PNG veya WEBP, en fazla 25 MB.",
  },
  demo: {
    original: "Orijinal",
    transparent: "Şeffaf",
    result: "Sonuç",
    slider: "Önizleme: orijinalden sonuca kaydır",
  },
  working: {
    label: "01 / İşleniyor",
    stages: {
      decode: "Görsel hazırlanıyor…",
      download: "Arka plan silici tarayıcın için hazırlanıyor…",
      init: "Model ısınıyor…",
      infer: "Arka plan kaldırılıyor…",
      compose: "Neredeyse bitti…",
    },
    local: "İşlem cihazında yapılıyor. Hiçbir şey yüklenmiyor.",
    firstRun: "Sadece ilk ziyarette. Model yaklaşık {mb} MB ve sonrasında önbellekte kalır.",
    model: "Model",
    cpuFallback: "Burada WebGPU yok, bu yüzden işlem CPU'da yapılıyor. Biraz daha yavaş, sonuç aynı.",
    cancel: "İptal",
  },
  result: {
    label: "02 / Sonuç",
    original: "Orijinal",
    transparent: "Şeffaf",
    download: "PNG indir",
    startOver: "Baştan başla",
    compare: "Orijinal ve sonucu karşılaştır",
    kept: "Görselin bu sekmeden hiç çıkmadı.",
    gpu: "GPU",
    cpu: "CPU",
    altOriginal: "Orijinal görselin",
    altResult: "Arka planı kaldırılmış görselin, dama deseni üzerinde",
    file: "Dosya",
    size: "Boyut",
    engine: "Motor",
    time: "Süre",
  },
  errors: {
    cancelled: "İptal edildi. Hazır olduğunda başka bir görsel bırakabilirsin.",
    retry: "Başka bir görsel dene",
    type: "Bu dosya türü desteklenmiyor. JPG, PNG veya WEBP kullan.",
    size: "Bu dosya 25 MB'ı aşıyor. Daha küçük bir kopya dene ya da daha düşük kaliteyle dışa aktar.",
    decode: "Bu görseli okuyamadık. Dosya bozuk olabilir. JPG veya PNG olarak yeniden kaydetmeyi dene.",
    unsupported:
      "Bu tarayıcıda aracın ihtiyaç duyduğu bir özellik yok (WebAssembly, Web Worker veya OffscreenCanvas). Tarayıcını güncelle ya da güncel bir Chrome, Edge, Firefox veya Safari dene.",
    model:
      "Modeli indiremedik. Bağlantını kontrol edip tekrar dene. Bir kez başarıyla yüklenince önbelleğe alınır ve çevrimdışı da çalışır.",
    memory:
      "Cihazının belleği bu görsel için yetmedi. Diğer sekmeleri kapat ya da daha küçük bir görsel dene. 2000 px altı hemen her yerde çalışır.",
    runtime: "Bu görseli işleyemedik. Daha küçük bir JPG veya PNG dene ya da sayfayı yenile.",
  },
  how: {
    label: "Nasıl çalışır",
    title: "Sadece 3 basit adım.",
    steps: [
      { n: "01", t: "Yükle", d: "Görselini bırak ya da tıklayıp seç." },
      { n: "02", t: "Kaldır", d: "Tarayıcın arka planı kaldırır." },
      { n: "03", t: "İndir", d: "Şeffaf PNG'ni saniyeler içinde kaydet." },
    ],
  },
  privacy: {
    label: "Gizlilik",
    title: "Görselin tarayıcında kalır.",
    items: [
      {
        q: "Görselim nerede işleniyor?",
        a: "Cihazında, bu sekmenin içinde. Modeli bir Web Worker yerel olarak çalıştırır. Görselin hiçbir sunucuya gönderilmez.",
      },
      {
        q: "Peki ne indiriliyor?",
        a: "Uygulamanın kendisi ve ilk kullanımda model dosyası (cihazına göre yaklaşık 46 ile 88 MB). Bu, sana yapılan bir indirmedir, görselin bunun parçası değildir. Her barındırıcı gibi Vercel ve Hugging Face de IP adresi gibi standart istek verilerini görür.",
      },
      {
        q: "Görselim ne kadar süre tutuluyor?",
        a: "Sadece bu sekme açıkken bellekte. Baştan başla dersen ya da sekmeyi kapatırsan silinir. Sunucuda kopya yok, çünkü görseli hiç almıyoruz.",
      },
      {
        q: "Tarayıcı önbelleği kullanılıyor mu?",
        a: "Evet, yalnızca model için. Sonraki ziyaretlerde indirme atlansın diye Cache Storage'da saklanır. Görsellerin asla önbelleğe alınmaz. Kaldırmak için site verilerini temizle.",
      },
      {
        q: "Model nereden geliyor?",
        a: "Xuebin Qin ve arkadaşlarının IS-Net (general use) modeli, Apache-2.0. rembg projesi (MIT) ONNX'e aktarmış, ONNX Runtime Web (MIT) ile çalışıyor. Ayrıntılar README'de.",
      },
      {
        q: "Analitik, çerez, hesap?",
        a: "Hiçbiri. Dil ve tema tercihin yalnızca cihazındaki localStorage'da saklanır.",
      },
    ],
  },
  footer: {
    tagline: "Açık web için yapıldı.",
    credit: "© 2026 Unscene — Çağlar Sapmaz tarafından yapıldı",
    love: "sevgi",
    linkedin: "LinkedIn",
    linkedinLabel: "Çağlar Sapmaz LinkedIn'de (yeni sekmede açılır)",
    github: "GitHub",
    githubLabel: "Çağlar Sapmaz GitHub'da (yeni sekmede açılır)",
  },
};

export const messages = { en, tr } as const;
export type Locale = keyof typeof messages;
export const LOCALES: Locale[] = ["en", "tr"];
