import { useRef, useState } from 'react';
import { Upload, X, GripVertical, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadMedia } from '../services/storage.js';

/** ছবি রিসাইজ করে (max 1600px, JPEG 82%) */
async function resizeImage(file, max = 1600, quality = 0.82) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality)
  );
}

export default function ImageUploader({ images = [], onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const dragIndex = useRef(null);

  const handleFiles = async (files) => {
    setBusy(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const blob = await resizeImage(file);
        const url = await uploadMedia(blob, file.name);
        uploaded.push(url);
      }
      onChange([...images, ...uploaded]);
      toast.success(`${uploaded.length}টি ছবি যোগ হয়েছে`);
    } catch (e) {
      toast.error('ছবি আপলোড ব্যর্থ: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = (i) => onChange(images.filter((_, idx) => idx !== i));

  const makePrimary = (i) => {
    const next = [...images];
    const [item] = next.splice(i, 1);
    onChange([item, ...next]);
  };

  const onDrop = (i) => {
    if (dragIndex.current === null || dragIndex.current === i) return;
    const next = [...images];
    const [item] = next.splice(dragIndex.current, 1);
    next.splice(i, 0, item);
    dragIndex.current = null;
    onChange(next);
  };

  return (
    <div>
      <div
        className="border-2 border-dashed border-line rounded-card p-6 text-center
          hover:border-accent/50 transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles([...e.dataTransfer.files]);
        }}
      >
        <Upload className="mx-auto text-ink-muted" size={24} />
        <p className="text-sm text-ink-muted mt-2">
          {busy ? 'আপলোড হচ্ছে…' : 'ছবি টেনে আনুন বা ক্লিক করে সিলেক্ট করুন (একাধিক)'}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles([...e.target.files])}
        />
      </div>

      <div className="flex gap-2 mt-3">
        <input
          className="input"
          placeholder="অথবা ছবির URL পেস্ট করুন"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
        />
        <button
          type="button"
          className="btn-ghost shrink-0"
          onClick={() => {
            if (!urlInput.trim()) return;
            onChange([...images, urlInput.trim()]);
            setUrlInput('');
          }}
        >
          যোগ করুন
        </button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
          {images.map((src, i) => (
            <div
              key={src + i}
              draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              className="relative group aspect-square rounded-field overflow-hidden
                border border-line bg-surface2"
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 badge bg-accent text-black text-[10px]">
                  প্রধান
                </span>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
                transition-opacity flex items-center justify-center gap-2">
                {i !== 0 && (
                  <button
                    type="button"
                    title="প্রধান ছবি করুন"
                    className="p-1.5 rounded bg-white/10 hover:bg-white/20"
                    onClick={() => makePrimary(i)}
                  >
                    <Star size={14} />
                  </button>
                )}
                <button
                  type="button"
                  title="ডিলিট"
                  className="p-1.5 rounded bg-red-500/30 hover:bg-red-500/50"
                  onClick={() => remove(i)}
                >
                  <X size={14} />
                </button>
                <span className="p-1.5 text-ink-muted cursor-grab">
                  <GripVertical size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
