  (function () {
    const KEY = "mini-avatar-50x50-dataurl";
    const PLACEHOLDER = "https://placehold.co/50x50";
    const imgEl = document.getElementById("profileImg");
    const inputEl = document.getElementById("avatarUpload");

    // On load: show saved avatar or placeholder
    document.addEventListener("DOMContentLoaded", () => {
      const saved = safeGet(KEY);
      imgEl.src = saved || PLACEHOLDER;
    });

    // When a file is uploaded, resize → preview → persist
    inputEl.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        return;
      }
      const dataUrl = await to50x50DataURL(file);
      imgEl.src = dataUrl;
      safeSet(KEY, dataUrl);
    });

    // Helpers
    function safeGet(k) {
      try { return localStorage.getItem(k); } catch { return null; }
    }
    function safeSet(k, v) {
      try { localStorage.setItem(k, v); } catch {}
    }

    // Resize to 50×50 (cover) for consistent quality & small storage
    function to50x50DataURL(file) {
      return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onerror = () => reject(new Error("Failed to read file"));
        fr.onload = () => {
          const img = new Image();
          img.onload = () => {
            const size = 50;
            const canvas = document.createElement("canvas");
            canvas.width = size; canvas.height = size;
            const ctx = canvas.getContext("2d");

            const iw = img.width, ih = img.height;
            const scale = Math.max(size / iw, size / ih);
            const sw = size / scale, sh = size / scale;
            const sx = (iw - sw) / 2;
            const sy = (ih - sh) / 2;

            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);

            resolve(canvas.toDataURL("image/png"));
          };
          img.onerror = () => reject(new Error("Invalid image"));
          img.src = fr.result;
        };
        fr.readAsDataURL(file);
      });
    }
  })();
