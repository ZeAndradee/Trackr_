const rawCache = new Map();

function extractRawColor(url) {
    if (!url) return Promise.resolve(null);
    if (rawCache.has(url)) return Promise.resolve(rawCache.get(url));

    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            try {
                const size = 32;
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, size, size);
                const data = ctx.getImageData(0, 0, size, size).data;

                let r = 0, g = 0, b = 0, count = 0;
                for (let i = 0; i < data.length; i += 4) {
                    const alpha = data[i + 3];
                    if (alpha < 128) continue;
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                    count++;
                }
                if (!count) {
                    rawCache.set(url, null);
                    return resolve(null);
                }
                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);

                const color = { r, g, b };
                rawCache.set(url, color);
                resolve(color);
            } catch (e) {
                rawCache.set(url, null);
                resolve(null);
            }
        };
        img.onerror = () => {
            rawCache.set(url, null);
            resolve(null);
        };
        img.src = url;
    });
}

function adjustForTheme(color, mode) {
    if (!color) return null;
    let { r, g, b } = color;
    const max = Math.max(r, g, b);

    if (mode === "light") {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum > 140) {
            const scale = 100 / (lum || 1);
            r = Math.min(255, Math.round(r * scale));
            g = Math.min(255, Math.round(g * scale));
            b = Math.min(255, Math.round(b * scale));
        }
    } else {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum < 180) {
            const boost = 180 / (lum || 1);
            r = Math.min(255, Math.round(r * boost));
            g = Math.min(255, Math.round(g * boost));
            b = Math.min(255, Math.round(b * boost));
        }
    }

    return { r, g, b };
}

export async function getAverageColor(url, mode) {
    const raw = await extractRawColor(url);
    const resolvedMode = mode || (document.body.classList.contains("light-mode") ? "light" : "dark");
    return adjustForTheme(raw, resolvedMode);
}
