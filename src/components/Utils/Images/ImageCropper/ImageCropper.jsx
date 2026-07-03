import { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Cropper from "react-easy-crop";
import { FiX, FiZoomIn, FiZoomOut, FiRotateCw } from "react-icons/fi";
import { parseGIF, decompressFrames } from "gifuct-js";
import { GIFEncoder, quantize, applyPalette } from "gifenc";
import { Button } from "../../Buttons/Button";
import styles from "./ImageCropper.module.css";

const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.05;

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

const toRad = (deg) => (deg * Math.PI) / 180;

const getRotatedSize = (w, h, deg) => {
  const r = toRad(deg);
  return {
    width: Math.abs(Math.cos(r) * w) + Math.abs(Math.sin(r) * h),
    height: Math.abs(Math.sin(r) * w) + Math.abs(Math.cos(r) * h),
  };
};

const renderCropped = async ({
  imageSrc,
  pixelCrop,
  rotation,
  outputWidth,
  outputHeight,
  mimeType,
  quality,
}) => {
  const image = await createImage(imageSrc);

  const source = document.createElement("canvas");
  const sCtx = source.getContext("2d");
  const { width: bW, height: bH } = getRotatedSize(image.width, image.height, rotation);
  source.width = bW;
  source.height = bH;
  sCtx.translate(bW / 2, bH / 2);
  sCtx.rotate(toRad(rotation));
  sCtx.drawImage(image, -image.width / 2, -image.height / 2);

  const out = document.createElement("canvas");
  const oCtx = out.getContext("2d");
  out.width = outputWidth || pixelCrop.width;
  out.height = outputHeight || pixelCrop.height;
  oCtx.imageSmoothingEnabled = true;
  oCtx.imageSmoothingQuality = "high";
  oCtx.drawImage(
    source,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    out.width,
    out.height
  );

  return new Promise((resolve, reject) => {
    out.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        blob.name = `cropped.${mimeType === "image/png" ? "png" : "jpg"}`;
        blob.lastModified = Date.now();
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
};

const renderCroppedGif = async ({ imageSrc, pixelCrop, rotation, outputWidth, outputHeight }) => {
  const buf = await (await fetch(imageSrc)).arrayBuffer();
  const parsed = parseGIF(buf);
  const frames = decompressFrames(parsed, true);
  const W = parsed.lsd.width;
  const H = parsed.lsd.height;

  const full = document.createElement("canvas");
  full.width = W;
  full.height = H;
  const fctx = full.getContext("2d");

  const out = document.createElement("canvas");
  out.width = outputWidth || pixelCrop.width;
  out.height = outputHeight || pixelCrop.height;
  const octx = out.getContext("2d");

  const enc = GIFEncoder();

  let prevDims = null;
  let prevDisposal = 0;
  let restoreImageData = null;

  for (const frame of frames) {
    if (prevDisposal === 2 && prevDims) {
      fctx.clearRect(prevDims.left, prevDims.top, prevDims.width, prevDims.height);
    } else if (prevDisposal === 3 && restoreImageData) {
      fctx.putImageData(restoreImageData, 0, 0);
    }

    if (frame.disposalType === 3) {
      restoreImageData = fctx.getImageData(0, 0, W, H);
    }

    const patch = new ImageData(
      new Uint8ClampedArray(frame.patch),
      frame.dims.width,
      frame.dims.height
    );
    const tmp = document.createElement("canvas");
    tmp.width = frame.dims.width;
    tmp.height = frame.dims.height;
    tmp.getContext("2d").putImageData(patch, 0, 0);
    fctx.drawImage(tmp, frame.dims.left, frame.dims.top);

    prevDims = frame.dims;
    prevDisposal = frame.disposalType;

    const { width: rW, height: rH } = getRotatedSize(W, H, rotation);
    const src = document.createElement("canvas");
    src.width = rW;
    src.height = rH;
    const sCtx = src.getContext("2d");
    sCtx.translate(rW / 2, rH / 2);
    sCtx.rotate(toRad(rotation));
    sCtx.drawImage(full, -W / 2, -H / 2);

    octx.clearRect(0, 0, out.width, out.height);
    octx.drawImage(
      src,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      out.width,
      out.height
    );

    const data = octx.getImageData(0, 0, out.width, out.height).data;
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    enc.writeFrame(index, out.width, out.height, {
      palette,
      delay: frame.delay || 100,
    });
  }

  enc.finish();
  const blob = new Blob([enc.bytes()], { type: "image/gif" });
  blob.name = "cropped.gif";
  blob.lastModified = Date.now();
  return blob;
};

const ImageCropper = ({
  imageSrc,
  onCropComplete,
  onCancel,
  outputWidth = 512,
  outputHeight = 512,
  cropShape = "round",
  title = "Edit image",
  allowRotate = true,
  mimeType = "image/jpeg",
  quality = 0.92,
  isGif = false,
}) => {
  const aspect = outputWidth / outputHeight;
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pixelCrop, setPixelCrop] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) onCancel?.();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [busy, onCancel]);

  const handleCropComplete = useCallback((_, areaPixels) => {
    setPixelCrop(areaPixels);
  }, []);

  const reset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const apply = async () => {
    if (!pixelCrop) return;
    setBusy(true);
    try {
      const blob = isGif
        ? await renderCroppedGif({
            imageSrc,
            pixelCrop,
            rotation,
            outputWidth,
            outputHeight,
          })
        : await renderCropped({
            imageSrc,
            pixelCrop,
            rotation,
            outputWidth,
            outputHeight,
            mimeType,
            quality,
          });
      onCropComplete?.(blob);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const node = (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && !busy && onCancel?.()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={title}>
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <h3 className={styles.title}>{title}</h3>
          </div>
          <button type="button" className={styles.iconButton} onClick={onCancel} disabled={busy} aria-label="Close">
            <FiX size={18} />
          </button>
        </header>

        <div className={styles.stage}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={cropShape !== "round"}
            minZoom={ZOOM_MIN}
            maxZoom={ZOOM_MAX}
            zoomSpeed={0.4}
            restrictPosition
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={handleCropComplete}
            classes={{
              containerClassName: styles.cropperContainer,
              mediaClassName: styles.cropperMedia,
              cropAreaClassName: styles.cropperArea,
            }}
          />
        </div>

        <div className={styles.controls}>
          <div className={styles.sliderRow}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - 0.2).toFixed(2)))}
              aria-label="Zoom out"
            >
              <FiZoomOut size={16} />
            </button>
            <input
              type="range"
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={ZOOM_STEP}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className={styles.slider}
              aria-label="Zoom"
            />
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + 0.2).toFixed(2)))}
              aria-label="Zoom in"
            >
              <FiZoomIn size={16} />
            </button>
            {allowRotate && (
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setRotation((r) => (r + 90) % 360)}
                aria-label="Rotate 90°"
                title="Rotate 90°"
              >
                <FiRotateCw size={16} />
              </button>
            )}
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.linkButton} onClick={reset} disabled={busy}>
              Reset
            </button>
            <div className={styles.actions}>
              <Button variant="secondary" size="sm" onClick={onCancel} disabled={busy}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={apply} disabled={busy || !pixelCrop}>
                {busy ? "Applying..." : "Apply"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(node, document.body);
};

export default ImageCropper;
