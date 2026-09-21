<h1 align="center">Unscene</h1>

<p align="center"><strong>Arka plan gitsin. Konu kalsın.</strong></p>

<p align="center">
  <a href="https://nextjs.org"><img alt="Next.js 16" src="https://img.shields.io/badge/NEXT.JS_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"></a>
  <a href="https://react.dev"><img alt="React 19" src="https://img.shields.io/badge/REACT_19-61DAFB?style=for-the-badge&logo=react&logoColor=black"></a>
  <a href="https://www.typescriptlang.org"><img alt="TypeScript" src="https://img.shields.io/badge/TYPESCRIPT-3178C6?style=for-the-badge&logo=typescript&logoColor=white"></a>
  <a href="https://tailwindcss.com"><img alt="Tailwind CSS v4" src="https://img.shields.io/badge/TAILWIND_CSS_V4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"></a>
  <a href="https://onnxruntime.ai"><img alt="ONNX Runtime" src="https://img.shields.io/badge/ONNX_RUNTIME-005CED?style=for-the-badge&logo=onnx&logoColor=white"></a>
  <a href="https://webassembly.org"><img alt="WebAssembly" src="https://img.shields.io/badge/WEBASSEMBLY-654FF0?style=for-the-badge&logo=webassembly&logoColor=white"></a>
  <a href="https://www.w3.org/TR/webgpu/"><img alt="WebGPU" src="https://img.shields.io/badge/WEBGPU-005A9C?style=for-the-badge&logo=webgpu&logoColor=white"></a>
  <a href="https://vercel.com"><img alt="Vercel" src="https://img.shields.io/badge/VERCEL-000000?style=for-the-badge&logo=vercel&logoColor=white"></a>
</p>

Ücretsiz, reklamsız ve hesap gerektirmeyen bir arka plan silici. Model tarayıcının
içinde çalışır, bu yüzden görselin hiçbir yere yüklenmez.

## Özellikler

- İngilizce ve Türkçe, açık ve koyu tema
- Girdi olarak JPG, PNG ve WEBP, çıktı olarak şeffaf PNG (`dosya-adi-no-bg.png`)
- Sayfanın herhangi bir yerine sürükle-bırak, tıklayıp seç ya da yapıştır
- Dama deseni üzerinde önce/sonra kaydırıcısı, klavyeyle de kullanılabilir
- Sunucuda işlem yok, ücretli API yok, ortam değişkeni gerekmez

## Teknoloji yığını

| Parça | Seçim |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Stil | Tailwind CSS 4, tasarım değerleri için CSS değişkenleri |
| Çıkarım | Bir Web Worker içinde ONNX Runtime Web 1.30 |
| Model | IS-Net (general use), WebAssembly'de int8 ya da WebGPU'da fp16 |
| İkonlar | Lucide ve elle çizilmiş iki marka ikonu (Lucide 1.x marka ikonlarını kaldırdı) |
| Yazı tipi | `next/font` ile Outfit (derleme sırasında kendi sunucundan sunulur) |

Çalışma zamanı bağımlılıkları `next`, `react`, `react-dom`, `onnxruntime-web` ve `lucide-react`. Başka bir şey yok.

## Arka plan kaldırma nasıl çalışır

1. Sayfa dosyanı bir **Web Worker**'a verir, böylece arayüz akıcı kalır.
2. Worker görseli çözer (`createImageBitmap`, EXIF yönü korunur) ve ağ için bir kopyasını
   1024 x 1024'e boyutlandırır.
3. İlk kullanımda modeli indirir, gerçek bayt ilerlemesiyle akıtır ve **Cache Storage**'a
   kaydeder. Sonraki ziyaretlerde indirme atlanır.
4. ONNX Runtime Web modeli çalıştırır. Tarayıcıda `shader-f16` destekli WebGPU varsa
   fp16 modelini GPU'da kullanır. Yoksa int8 modelini WebAssembly'de çalıştırır (sayfa
   cross-origin isolated ise çok iş parçacıklı). WebGPU herhangi bir noktada başarısız
   olursa worker kendiliğinden WebAssembly'ye geçer.
5. Çıktı yumuşak bir alfa matıdır. Min-maks normalleştirilir, hafif gürültüyü atmak için
   hafifçe seviyelendirilir, orijinal boyuta ölçeklenir ve tam çözünürlüklü görsele
   `OffscreenCanvas` ile (`destination-in`) uygulanıp PNG olarak dışa aktarılır.

Sınırlar: dosya başına 25 MB. Uzun kenar 4096 px ile sınırlıdır (4 GB ve altı RAM bildiren
cihazlarda 2560 px). Worker, modelin belleğini serbest bırakmak için 90 saniye boşta
kalınca sonlandırılır.

### Neden bu teknoloji

- **İstemci tarafı, gizlilik sözünü dürüst tutan ve barındırması hiçbir şeye mal olmayan
  tek mimaridir.** Sunucu tarafı çıkarım, uzun süre çalışan ya da GPU'lu bir işlem gücü
  gerektirir. Vercel Free bunu sağlamaz.
- **`@imgly/background-removal` değerlendirildi ve kullanılmadı.** İyi bir kütüphane ama
  AGPL-3.0 lisanslı, bu da projenin tamamını AGPL'ye zorlardı. IS-Net ağırlıkları, burada
  kullanılan Apache-2.0 kaynağın aynısından geliyor, yani bir şey kaybedilmiyor.
- **RMBG-1.4 ve RMBG-2.0 reddedildi**, çünkü lisansları ticari kullanıma kapalı.
- **BiRefNet_lite (MIT)** iyi bir alternatif ve saçta daha keskin, ama kullanılabilir en
  küçük ONNX dosyası 114 MB. Mobilde ilk yükleme için fazla ağır.
- **Transformers.js yerine doğrudan ONNX Runtime Web**, bağımlılık ağacını küçük tutmak ve
  indirme, önbellekleme ve yedek davranışlarını kontrol etmek için.

## Gizlilik

- Görseller cihazında işlenir ve hiçbir sunucuya gönderilmez.
- Görseller yalnızca sekme açıkken bellekte tutulur. Diske ya da önbelleğe hiçbir şey yazılmaz.
- **Model dosyası** ilk kullanımda Hugging Face'in CDN'inden indirilir (yaklaşık 46 MB,
  WebGPU'da 88 MB) ve tarayıcında önbelleğe alınır. Hugging Face ve Vercel, her barındırıcı
  gibi IP adresi gibi olağan istek verilerini görür. Görselin hiçbir isteğin parçası değildir.
- Analitik yok, çerez yok. `localStorage` yalnızca dil ve tema tercihini saklar.

## Yerel geliştirme

```bash
npm install        # ONNX Runtime WASM dosyalarını public/ort içine de kopyalar
npm run dev        # http://localhost:3000
```

Diğer komutlar: `npm run lint`, `npm run typecheck`, `npm run build`, `npm start`.

`public/ort/` üretilen bir klasördür (`postinstall`, `predev` ve `prebuild` sırasında
`scripts/copy-ort.mjs` tarafından) ve git tarafından yok sayılır. ONNX Runtime'ın `.wasm`
dosyalarını ve yükleyicilerini kendi origin'inden sunması gerekir; böylece üçüncü taraf
CDN olmadan çok iş parçacıklı çalışma mümkün olur.

## Vercel'e yayınlama

Ayar gerekmez. Repoyu içe aktar, varsayılanları koru, yayınla.

- Her şey statiktir. Serverless fonksiyon ve sunucu tarafı işlem yoktur.
- `next.config.ts` her rotada `Cross-Origin-Opener-Policy: same-origin` ve
  `Cross-Origin-Embedder-Policy: require-corp` başlıklarını gönderir. Bu, çok iş
  parçacıklı WebAssembly için `SharedArrayBuffer`'ı etkinleştirir. Sonradan eklediğin ve
  cross-origin alt kaynak yükleyen her şey (görseller, iframe'ler, script'ler) CORS/CORP
  etkin olmalıdır.
- İsteğe bağlı: doğru Open Graph ve sitemap adresleri için `NEXT_PUBLIC_SITE_URL`
  değişkenini alan adına ayarla.
- Vercel'in Hobby planı kişisel, ticari olmayan kullanım içindir. Bu proje ücretsiz ve
  reklamsız olduğu için uyuyor, yine de durumun için Vercel'in şartlarına bak.
- `public/ort` dosyaları toplamda yaklaşık 41 MB'tır ve yalnızca görsel işleyen ziyaretçiler
  tarafından indirilir. Sürümlü bir yol altında, bir yıllık `immutable` başlığıyla önbelleğe alınır.

### Modeli kendi sunucunda barındırma

Varsayılan model dosyaları herkese açık bir Hugging Face reposundan gelir
(`Ko033/isnet-general-use-onnx`). Bu, üçüncü tarafın yeniden paketlemesidir. Garanti
istiyorsan dosyaları kendin barındır:

1. O repodan `model_fp16.onnx` ve `model_quantized.onnx` dosyalarını indir.
2. CORS etkin herhangi bir statik barındırıcıdan sun (ya da kendi `public/` klasöründen,
   Vercel Free'nin bant genişliği payını göz önünde bulundurarak).
3. `NEXT_PUBLIC_MODEL_BASE_URL` değişkenini klasör adresine ayarla ve yeniden derle.
   Dosyaları değiştirirsen `src/lib/model.ts` içindeki bayt boyutlarını da güncelle.

## Model ve lisans bilgileri

| Bileşen | Yazar | Lisans |
| --- | --- | --- |
| IS-Net ağırlıkları ve mimarisi (DIS) | Xuebin Qin et al. | Apache-2.0 |
| `isnet-general-use.onnx` dışa aktarımı | rembg projesi | MIT |
| fp16 ve int8 varyantları, yardımcı çıktıları çıkarılmış | Hugging Face'te Ko033 | Apache-2.0 (model kartında belirtildiği gibi) |
| ONNX Runtime Web | Microsoft | MIT |
| Next.js, React | Vercel, Meta | MIT |
| Lucide ikonları | Lucide katkıda bulunanlar | ISC |
| Outfit | Outfit Project Authors | SIL OFL 1.1 |

Model sayfaları:
[DIS](https://github.com/xuebinqin/DIS) ·
[rembg](https://github.com/danielgatis/rembg) ·
[Ko033/isnet-general-use-onnx](https://huggingface.co/Ko033/isnet-general-use-onnx).
Yukarıdaki lisanslar, yazıldığı sırada bu kaynak sayfalardan okundu. Model dosyalarını
ticari olarak yeniden dağıtmadan önce tekrar kontrol et.

## Tasarım sistemi

Yumuşak, açık ve yuvarlak hatlı, tek bir geometrik yazı tipiyle. Yerleşim bir referans
taslağı izler; renkler tam olarak onun palet sayfasındaki dört renktir.

| Rol | Renk |
| --- | --- |
| Birincil | `#0B3D91` |
| İkincil | `#3BA7F2` |
| Üçüncül | `#7FE7D6` |
| Arka plan | `#E8F6FF` |

Yüzeyler, yazı, soluk yazı ve çizgiler bunlardan türetilir (tonlar ve karışımlar), yeni bir
ton eklenmez. Site her zaman açık temayla açılır, koyu tema isteğe bağlıdır ve hatırlanır.
Koyu tema, birincil renkten türetilen orta tonda bir lacivert (`#182D5A`) kullanır. Yazı
rengi olarak palet arka planı, vurgular için ikincil, ana buton için üçüncül renk kullanılır.

- **Kontroller:** dil düz `EN / TR` metnidir, aktif olan kalın ve altı çizgilidir. Tema
  anahtarı iki hayalet ikondur, aktif olanın arkasında yumuşak bir daire durur.
- **Köşe yuvarlaklığı:** 8 (küçük kontroller), 12 (butonlar), 20 (kartlar, dropzone), chip
  ve hap biçimleri için tam yuvarlak.
- **Kenarlık:** 1px, dropzone'da 1,5px kesikli. **Gölge:** tek bir yumuşak, iki katmanlı gölge.
- **Yazı:** yalnızca Outfit. Başlıklar 500, gövde 400, büyük harfli etiketler 500.
- **Hareket:** 120 ms mikro, 200 ms durum, 600 ms beliriş. Hepsi `prefers-reduced-motion`
  altında devre dışı kalır.
- Tasarım değerleri `src/app/globals.css` içindedir. Bileşenler kendi stillerini icat
  etmek yerine `.btn`, `.chip`, `.card`, `.dz`, `.icon-btn` ve `.lang-btn` sınıflarını paylaşır.
- Kontrast notu: ikinci hero satırı açık arka planda ikincil rengi (`#3BA7F2`) kullanır.
  Bu yaklaşık 2,4:1'dir; çok büyük ekran yazısı için yeterli ama WCAG'ın 3:1 eşiğinin
  altındadır. Geçmesini istersen `globals.css` içinde `--display-2` değerini `--primary`
  yap.

## Proje yapısı

```
src/app/            layout, sayfa, meta veriler, ikonlar, OG görseli, robots, sitemap
src/components/     header, footer, workspace (hero/yükleme/sonuç), hero-demo, sections, compare kaydırıcısı
src/lib/            messages (EN/TR), prefs (dil/tema), use-remover, model ayarı
src/workers/        remover.worker.ts (tüm çıkarım ve birleştirme)
scripts/            copy-ort.mjs
```

## Lisans

MIT, bkz. [LICENSE](./LICENSE). Çağlar Sapmaz tarafından yapıldı.
